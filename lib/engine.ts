import { TREES } from "./data/trees";
import { district, housingTypeLabel, readByUtility, treatmentFor, type Treatment } from "./data/atlas";
import type { Doc, Finding, Flags, ProjectInputs, Step, TreeId } from "./types";

export const DEFAULT_INPUTS: ProjectInputs = {
  parcel: "AP __ Lot __ (example)",
  units: 10,
  aff: 0,
  zone: "R-3",
  lot: 56600,
  dist: 0.9,
  type: "new",
  water: true,
  sewer: true,
  wet: false,
  dot: false,
  transit: false,
  rezone: false,
  conservation: false,
  startDate: "2026-11-02",
};

export interface NumberedStep extends Step {
  n: string;
}

const SQFT_PER_ACRE = 43560;

export function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Stable key for one checklist item, used for saved progress. */
export function itemKey(tree: TreeId, step: string, doc: Doc, i: number): string {
  return `${tree}/${step}/${slug(doc.title)}/${i}`;
}

/** Permitted-use treatment for the project's housing type in its district (RI Zoning Atlas). */
export function useTreatment(i: ProjectInputs): Treatment {
  return treatmentFor(district(i.zone), i.units).value;
}

export interface AreaNeed {
  sqft: number;
  basis: "ordinance" | "riza" | "riza-prd";
  /** Atlas-implied figure when the ordinance formula is used, for cross-checking */
  atlasSqft?: number;
}

/** Lot area the unit count needs. Ordinance formula for standard R-3; RIZA figures otherwise. */
export function requiredArea(i: ProjectInputs): AreaNeed | null {
  const d = district(i.zone);
  const upa = readByUtility(d?.family4_maxunitsperacre ?? null, i.water, i.sewer);
  const minLot = readByUtility(d?.family4_minlotacres ?? null, i.water, i.sewer);

  if (i.conservation && upa.prd) {
    const sqft = Math.max((i.units / upa.prd) * SQFT_PER_ACRE, (minLot.prd ?? 0) * SQFT_PER_ACRE);
    return { sqft, basis: "riza-prd" };
  }
  if (i.zone === "R-2" && i.units <= 2) return i.water && i.sewer ? { sqft: 10000 + (i.units - 1) * 5000, basis: "ordinance" } : null;
  if (i.zone === "R-3") {
    const atlasSqft = upa.base ? Math.max((i.units / upa.base) * SQFT_PER_ACRE, (minLot.base ?? 0) * SQFT_PER_ACRE) : undefined;
    if (i.water && i.sewer) return { sqft: 10000 + (i.units - 1) * 5000, basis: "ordinance", atlasSqft };
    if (i.water || i.sewer) return { sqft: 30000 + (i.units - 1) * 10000, basis: "ordinance", atlasSqft };
    return null;
  }
  if (upa.base || minLot.base) {
    const sqft = Math.max(upa.base ? (i.units / upa.base) * SQFT_PER_ACRE : 0, (minLot.base ?? 0) * SQFT_PER_ACRE);
    return { sqft, basis: "riza" };
  }
  return null;
}

export function classify(i: ProjectInputs): TreeId {
  if (i.units >= 3 && i.aff / i.units >= 0.25) return "comp";
  if (i.type === "reuse" && i.units < 9) return "dpr";
  if (i.units >= 10) return "major";
  if (i.units >= 3) return "minor";
  return "byright";
}

export function deriveFlags(i: ProjectInputs, tree: TreeId): Flags {
  const t = useTreatment(i);
  const need = requiredArea(i);
  const densityFail = need !== null && i.lot < need.sqft;
  const useRelief = t === "prohibited" || t === "hearing";
  return {
    wet: i.wet,
    dot: i.dot,
    acre: i.dist >= 1,
    transit: i.transit,
    rezone: i.rezone,
    relief: !i.rezone && tree !== "comp" && (useRelief || densityFail),
    always: true,
  };
}

export function condOK(cond: string | undefined, f: Flags): boolean {
  if (!cond) return true;
  return cond.split("|").some((k) => f[k as keyof Flags]);
}

/** Steps that apply to this site, numbered. Branch steps (zone change, appeal) are labelled separately. */
export function stepsFor(tree: TreeId, f: Flags): NumberedStep[] {
  let n = 0;
  return TREES[tree].steps
    .filter((s) => condOK(s.cond, f))
    .map((s) => ({ ...s, n: s.branch ? (s.id === "rezone" ? "1a" : "↳") : String(++n) }));
}

export function visibleDocs(s: Step, f: Flags): Doc[] {
  return s.docs.filter((d) => condOK(d.cond, f));
}

export function analyze(i: ProjectInputs, tree: TreeId): Finding[] {
  const out: Finding[] = [];
  const d = district(i.zone);
  const t = treatmentFor(d, i.units);
  const kind = housingTypeLabel(i.units);

  out.push({
    st: i.units >= 10 ? "info" : "pass",
    t: i.units >= 10
      ? `Major land development: ${i.units} units is above the 9-unit minor cap`
      : i.units >= 3 ? "Minor land development: 9 units or fewer" : "No land development review for 1–2 units",
    p: "The review category sets every later stage and deadline.",
    src: "s3932", pin: "§ 45-23-32 (minor land development)",
    q: "Multi-family residential or residential condominium development of nine (9) units or less",
  });

  // Permitted use, from the Zoning Atlas
  const pin = `${i.zone} · ${t.field}`;
  if (!d) {
    out.push({ st: "flag", t: "District not found in the Zoning Atlas", p: "Pick the district from the zoning map, or check the use table with Planning staff.", src: "rizaApp", pin: "Rhode Island Zoning Atlas map" });
  } else if (t.value === "allowed") {
    out.push({ st: "pass", t: `${kind} housing is allowed in ${i.zone}`, p: `The Zoning Atlas lists ${kind} housing in ${d.name} as allowed, possibly with conditions. No use relief is needed.`, src: "rizaLayer", pin, q: t.raw });
  } else if (t.value === "hearing") {
    out.push({ st: "flag", t: `${kind} housing in ${i.zone} needs a public hearing`, p: "The Zoning Atlas lists this use as needing a public hearing, usually a special use permit. Under unified development review, the Planning Board decides it with the plan.", src: "rizaLayer", pin, q: t.raw });
  } else if (t.value === "prohibited") {
    out.push({
      st: tree === "comp" ? "flag" : "fail",
      t: `${kind} housing is prohibited in ${i.zone}`,
      p: tree === "comp"
        ? "The comprehensive permit can grant the adjustment. Haley's Commons was approved this way in R-1 in September 2025."
        : i.rezone
          ? "The route includes a zone change, which the Town Council decides."
          : "You need a use variance through unified development review, a zone change from the Town Council, or a comprehensive permit.",
      src: "rizaLayer", pin, q: t.raw,
    });
  } else {
    out.push({ st: "flag", t: `Check the use table for ${i.zone}`, p: "The Zoning Atlas shows this district as an overlay or doesn't classify the use.", src: "rizaLayer", pin, q: t.raw || undefined });
  }
  if ((i.zone === "C-1" || i.zone === "C-2") && i.units >= 3) {
    out.push({
      st: "flag", t: "Atlas and recent practice differ in commercial districts",
      p: "The Atlas lists multi-family as allowed in C-1, but Blackstone Residences (C-1, 2025) still needed an adjustment for residential use in a commercial zone. Staff also said its 35,580 sq ft lot allowed 7 units by right, more than the Atlas density implies. Confirm both with staff.",
      src: "min250925", pin: "Minutes, Item 6", q: "An additional adjustment would be needed solely for residential use in a commercial zone.",
    });
  }
  if (i.zone === "BMMU") {
    out.push({
      st: "info", t: "Precedent: Berkeley Mill apartments were approved by staff",
      p: "24 one-bedroom apartments inside the mill were reviewed by the Technical Review Committee and approved administratively on July 1, 2025, with 1 parking space per unit under the overlay.",
      src: "min250731", pin: "Minutes, Director's Report", q: "the Planning Department approved the proposal administratively on July 1st, 2025",
    });
  }
  if (d?.family4_water_required === "Yes" && i.units >= 4 && !i.water) {
    out.push({ st: "flag", t: "Public water is required for 4+ family housing here", p: `The Atlas marks public water as required for 4+ family housing in ${i.zone}.`, src: "rizaLayer", pin: `${i.zone} · family4_water_required`, q: "Yes" });
  }

  // Density
  const need = requiredArea(i);
  if (need) {
    const ok = i.lot >= need.sqft;
    if (need.basis === "riza-prd") {
      out.push({
        st: ok ? "pass" : tree === "comp" ? "flag" : "fail",
        t: `Conservation density: ${fmt(need.sqft)} sq ft of developable land needed, ${fmt(i.lot)} entered`,
        p: ok ? "Enough developable (non-wetland) land for this unit count at the conservation development density. At least 25% of the upland must stay as open space." : `Short by ${fmt(need.sqft - i.lot)} sq ft of developable land.`,
        src: "memoWP", pin: "Staff memo, Waterman Pond (R-3 conservation development)", q: "a minimum of 25% of the site’s upland area must be preserved as open space",
      });
    } else if (need.basis === "ordinance") {
      out.push({
        st: ok ? "pass" : tree === "comp" ? "flag" : "fail",
        t: `Density: ${fmt(need.sqft)} sq ft required, ${fmt(i.lot)} sq ft provided`,
        p: ok ? `The lot supports ${i.units} units under the ordinance's lot-area-per-unit rule.` : `Short by ${fmt(need.sqft - i.lot)} sq ft. You need density relief, fewer units, a conservation development, or a comprehensive permit density bonus.`,
        src: "cz3", pin: "Art. 3, lot area per unit",
        q: i.water && i.sewer ? "10,000 square feet minimum lot size for the first unit plus 5,000 square feet for each additional unit." : "30,000 square feet per unit plus 10,000 square feet for each additional unit.",
      });
      if (need.atlasSqft && Math.abs(need.atlasSqft - need.sqft) > 1000) {
        out.push({
          st: i.lot >= need.atlasSqft ? "info" : "flag",
          t: `Atlas cross-check: ${fmt(need.atlasSqft)} sq ft at the Atlas density`,
          p: "The Zoning Atlas lists a different maximum density for this district. Ask staff which figure applies before you fix the unit count.",
          src: "rizaLayer", pin: `${i.zone} · family4_maxunitsperacre`, q: d?.family4_maxunitsperacre ?? undefined,
        });
      }
    } else {
      out.push({
        st: ok ? "pass" : tree === "comp" ? "flag" : "fail",
        t: `Density (Atlas): ${fmt(need.sqft)} sq ft required, ${fmt(i.lot)} sq ft provided`,
        p: ok ? "The lot meets the Atlas minimum lot size and maximum units per acre." : `Short by ${fmt(need.sqft - i.lot)} sq ft. Blackstone Residences sought a density adjustment through a comprehensive permit for this reason.`,
        src: "rizaLayer", pin: `${i.zone} · family4_maxunitsperacre / minlotacres`, q: `${d?.family4_maxunitsperacre} units/acre; ${d?.family4_minlotacres} acre minimum`,
      });
    }
  } else if (i.zone === "R-3") {
    out.push({ st: "flag", t: "Density without public water or sewer", p: "R-3 density is listed only for sites with one or both utilities. Expect a much larger lot requirement.", src: "cz3", pin: "Art. 3" });
  }

  // Parking and height
  if (i.units >= 3) {
    const perUnit = i.transit ? 1 : parseFloat(d?.family4_minparking_2br ?? "2") || 2;
    out.push(i.transit
      ? { st: "info", t: `Parking: at most ${i.units} spaces can be required (1 per unit near transit)`, p: "2026 state law caps required parking near frequent transit.", src: "ridsp", pin: "S 3303 / H 8005 Sub A (2026)", q: "no more than one off-street parking space per dwelling unit in a multi-family structure or development can be required" }
      : { st: "info", t: `Parking: ${i.units * perUnit} spaces required (${perUnit} per unit)`, p: "Plan visitor spaces and snow storage on top of the minimum. Parking is one of the most common concerns at Cumberland hearings.", src: i.zone === "R-3" ? "memoWP" : "rizaLayer", pin: i.zone === "R-3" ? "Staff memo, Waterman Pond" : `${i.zone} · family4_minparking`, q: i.zone === "R-3" ? "the zoning ordinance requires a total of 36 spaces for the 18 units" : undefined });
  }
  if (d?.family4_maxheightft && i.units >= 4) {
    out.push({ st: "info", t: `Height limit: ${d.family4_maxheightft} ft`, p: "Check the elevations against this limit. Haley's Commons dropped a height waiver to win over an abutter.", src: "rizaLayer", pin: `${i.zone} · family4_maxheightft`, q: d.family4_maxheightft });
  }

  // Affordability
  const minAff = Math.ceil(i.units * 0.25);
  out.push(
    i.aff >= minAff && i.units >= 3
      ? { st: "pass", t: `Comprehensive permit eligible: ${i.aff} of ${i.units} units affordable`, p: "A single application to the Planning Board, with a minimum density bonus. Requires a RIHousing letter of eligibility.", src: "s5304", pin: "§ 45-53-4", q: "at least twenty-five percent (25%) of the housing" }
      : { st: "info", t: "No affordable units required", p: `Cumberland's inclusionary zoning section is reserved. A comprehensive permit would need ${minAff} affordable units.`, src: "cz15", pin: "§ 15-12 Inclusionary zoning", q: "(Reserved)" },
  );

  // State permits
  const trig: string[] = [];
  if (i.wet) trig.push("RIDEM freshwater wetlands");
  if (i.dist >= 1) trig.push(`RIPDES construction stormwater (${i.dist} acres)`);
  if (i.dot) trig.push("RIDOT Physical Alteration Permit");
  out.push(
    trig.length
      ? { st: "flag", t: `State permits triggered: ${trig.join(", ")}`, p: "Under Cumberland's regulations, these must be in hand before preliminary approval.", src: "cregs", pin: "§ 5-GH(2)(a)(3)", q: "including permits related to freshwater wetlands, floodplains, preliminary suitability for individual septic disposal systems, public water systems, and connections to state roads" }
      : { st: "pass", t: "No state permit triggers entered", p: "Confirm against the wetlands and flood layers in the Zoning Atlas map." },
  );
  return out;
}
