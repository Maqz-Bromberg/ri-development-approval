import { TREES } from "./data/trees";
import { district, housingTypeLabel, readByUtility, treatmentFor, type Treatment } from "./data/atlas";
import { getActiveTown } from "./town";
import { townFindings, townRules, townSteps } from "./data/towns/overlay";
import type { Doc, Finding, Flags, ProjectInputs, Step, TreeId } from "./types";

export const DEFAULT_INPUTS: ProjectInputs = {
  town: "Cumberland",
  address: "",
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
  commercial: 0,
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
  // The 10,000 + 5,000 sq ft formulas are Cumberland's ordinance. Other towns use the Atlas figures.
  const cumberland = i.town === "Cumberland";
  if (cumberland && i.zone === "R-2" && i.units <= 2) return i.water && i.sewer ? { sqft: 10000 + (i.units - 1) * 5000, basis: "ordinance" } : null;
  if (cumberland && i.zone === "R-3") {
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

/** A route's name, rule and summary as the town defines it. Falls back to the state-law wording. */
export function routeText(tree: TreeId, town = getActiveTown()): { name: string; rule: string; blurb: string; status: string; local: boolean } {
  const t = TREES[tree], local = townRules(town).routeText?.[tree];
  const status = town === "Cumberland" ? t.status : townSteps(town, tree) ? "Local steps read (trial, not confirmed)" : "State law only";
  return { name: local?.name ?? t.name, rule: local?.rule ?? t.rule, blurb: local?.blurb ?? t.blurb, status, local: !!local };
}

/** The route a project takes. A town whose regulations sort projects differently from the state defaults supplies its own rule. */
export function classify(i: ProjectInputs): TreeId {
  const local = townRules(i.town).classify;
  if (local) return local(i);
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
/** Sources that are state law or statewide data. Everything else a document cites is Cumberland's own. */
const STATEWIDE_SRC = /^(s\d|ridsp|sfm|papa|riza|rigis|nza|sosom)/;

/**
 * A step as it applies outside Cumberland: the stage, who decides it and its statutory clock come from state law,
 * but documents read from Cumberland's regulations are left out and Cumberland-specific wording is replaced.
 * The master plan stage for comprehensive permits is Cumberland's own practice, so it is dropped.
 */
function forTown(s: Step, town: string): Step | null {
  if (town === "Cumberland") return s;
  if (s.id === "master" && s.title.includes("Cumberland")) return null;
  const local = (t: string) => /Cumberland/.test(t);
  return {
    ...s,
    title: s.title.replace(/ \(Cumberland[^)]*\)/, ""),
    what: local(s.what) ? `State law sets this stage. ${town}'s own requirements for it have not been read yet, so confirm them with the planning office.` : s.what,
    clock: { ...s.clock, text: s.clock.text.replace(/\(Cumberland[^)]*\)/, "(Cumberland's local figure; confirm yours)") },
    docs: s.docs.filter((d) => !d.src || STATEWIDE_SRC.test(d.src)).map((d) => (d.note && local(d.note) ? { ...d, note: undefined } : d)),
  };
}

/**
 * The route for a town. Where the town's own steps have been read for this route they are used in order,
 * followed by the state-law steps they do not cover (building permit, occupancy). Otherwise the state-law route.
 */
function routeSteps(tree: TreeId, town: string): Step[] {
  const base = TREES[tree].steps.map((s) => forTown(s, town)).filter((s): s is Step => s !== null);
  const local = townSteps(town, tree);
  if (!local) return base;
  const ids = new Set(local.map((s) => s.id));
  return [...local, ...base.filter((s) => !ids.has(s.id))];
}

export function stepsFor(tree: TreeId, f: Flags, town = getActiveTown()): NumberedStep[] {
  let n = 0;
  return routeSteps(tree, town)
    .filter((s) => condOK(s.cond, f))
    .map((s) => ({ ...s, n: s.branch ? (s.id === "rezone" ? "1a" : "↳") : String(++n) }));
}

export function visibleDocs(s: Step, f: Flags): Doc[] {
  return s.docs.filter((d) => condOK(d.cond, f));
}

function analyzeRaw(i: ProjectInputs, tree: TreeId): Finding[] {
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
  } else if (i.town === "Cumberland" && i.zone === "R-3") {
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

/** Findings for the site. Outside Cumberland, the ones that rest on Cumberland's ordinance, minutes or precedent are neutralised. */
export function analyze(i: ProjectInputs, tree: TreeId): Finding[] {
  const local = townFindings(i.town);
  return local ? local(i, tree, analyzeGeneric(i, tree), district(i.zone)) : analyzeGeneric(i, tree);
}

function analyzeGeneric(i: ProjectInputs, tree: TreeId): Finding[] {
  const all = analyzeRaw(i, tree);
  if (i.town === "Cumberland") return all;
  const minAff = Math.ceil(i.units * 0.25);
  const strip = (p: string) => p.replace(/ ?[^.]*(Haley's Commons|Blackstone|Cumberland hearings)[^.]*\./g, "").trim();
  return all.flatMap((f): Finding[] => {
    if (f.src === "min250925") return [];
    if (f.src === "cz15") return [{ st: "info", t: `Inclusionary zoning: check ${i.town}'s ordinance`, p: `A comprehensive permit would need ${minAff} affordable units.` }];
    if (f.src === "cregs") return [{ st: f.st, t: f.t, p: `Many towns require these before preliminary approval. Check ${i.town}'s regulations.` }];
    const local = f.src === "memoWP" || f.src === "cz3";
    return [{ ...f, p: strip(f.p), ...(local ? { src: "rizaLayer", pin: `${i.zone} · family4_minparking`, q: undefined } : {}) }];
  });
}

/** The most units the lot supports under the density rule, with the use allowed. 0 when no rule is known. */
export function maxUnits(i: ProjectInputs): number {
  let best = 0;
  for (let u = 1; u <= 300; u++) {
    const s = { ...i, units: u, aff: Math.min(i.aff, u) };
    const need = requiredArea(s);
    if (!need) continue;
    if (need.sqft > i.lot) break;
    if (useTreatment(s) === "allowed") best = u;
  }
  return best;
}

export interface Verdict {
  fails: Finding[];
  flags: Finding[];
  /** Sum of the statutory town review clocks on the main line, in days */
  reviewDays: number;
  statePermits: string[];
}

/** The headline for a project: what blocks it, what is open, and how long the town may take. */
export function verdict(i: ProjectInputs, tree: TreeId, steps: NumberedStep[]): Verdict {
  const findings = analyze(i, tree);
  const statePermits: string[] = [];
  if (i.wet) statePermits.push("RIDEM wetlands");
  if (i.dist >= 1) statePermits.push("RIPDES stormwater");
  if (i.dot) statePermits.push("RIDOT road access");
  return {
    fails: findings.filter((f) => f.st === "fail"),
    flags: findings.filter((f) => f.st === "flag"),
    reviewDays: steps.filter((s) => !s.branch).reduce((a, s) => a + (s.clock.days ?? 0), 0),
    statePermits,
  };
}

/** The board or council that holds the public hearings on this route. */
export function hearingBody(steps: NumberedStep[]): string {
  const s = steps.find((x) => !x.branch && (x.objections?.length ?? 0) > 0);
  return s?.auth[0]?.c ?? "pb";
}
