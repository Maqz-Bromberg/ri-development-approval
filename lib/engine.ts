import { TREES } from "./data/trees";
import { district, districtsOf, housingTypeLabel, readByUtility, treatmentFor, type Treatment } from "./data/atlas";
import { getActiveTown } from "./town";
import { townFindings, townRules, townSteps } from "./data/towns/overlay";
import { cumberlandMixedArea } from "./data/towns/cumberland/commercial";
import type { CommercialUse, Doc, Finding, Flags, ProjectInputs, ProjectKind, Step, TreeId } from "./types";

export const DEFAULT_INPUTS: ProjectInputs = {
  kind: "homes",
  use: "retail",
  work: "new",
  gfa: 5000,
  existingGfa: 0,
  extensive: false,
  overlays: [],
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

/**
 * A project from storage, a link or a file, filled out with the defaults. A project saved before kinds existed that
 * had commercial floor area was a mixed-use one (Providence asked for it), so it is read as one.
 */
export function normalizeInputs(p: Partial<ProjectInputs> | undefined): ProjectInputs {
  const i = { ...DEFAULT_INPUTS, ...(p ?? {}) };
  if (!p?.kind && (p?.commercial ?? 0) > 0) i.kind = "mixed";
  return i;
}

export const KIND_LABEL: Record<ProjectKind, string> = {
  homes: "Homes",
  mixed: "Homes with commercial space",
  commercial: "Commercial or institutional",
};

export const USE_LABEL: Record<CommercialUse, string> = {
  retail: "Retail",
  office: "Office",
  restaurant: "Restaurant",
  industrial: "Light industrial",
  institutional: "Institutional (school, healthcare, cultural, worship)",
};

/** The project in a few words: "10 new units", "8 units with 3,000 sq ft commercial", "6,000 sq ft office". */
export function projectLabel(i: ProjectInputs): string {
  const s = i.units === 1 ? "" : "s";
  if (i.kind === "commercial") {
    const what = USE_LABEL[i.use].split(" (")[0].toLowerCase();
    return i.work === "expand" ? `${fmt(i.gfa)} sq ft ${what} addition` : i.work === "change" ? `change of use to ${what}, ${fmt(i.gfa)} sq ft` : `${fmt(i.gfa)} sq ft new ${what}`;
  }
  const homes = i.type === "reuse" ? `${i.units} unit${s} in a reused building` : `${i.units} new unit${s}`;
  return i.kind === "mixed" ? `${homes} with ${fmt(i.commercial)} sq ft commercial` : homes;
}

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
  // A commercial use is answered only from the town's own table: the Atlas records housing types and nothing else.
  if (i.kind === "commercial") return townRules(i.town).useCommercial?.(i)?.value ?? "unknown";
  const local = townRules(i.town).use?.(i);
  if (local) return local.value;
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
  // Cumberland's ordinance sets its own mixed-use density in C-1 and C-2 (§ 5-3); it is checked with the commercial space.
  if (i.kind === "mixed" && i.town === "Cumberland" && (i.zone === "C-1" || i.zone === "C-2")) return null;
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

/** Floor-area lines that change a commercial project's review: the town's own, or the state's 7,500 sq ft. */
export function commercialLines(town: string): number[] {
  return townRules(town).commercialLines ?? [7500];
}

/**
 * A commercial project's route under state law, § 45-23-32(19)(i): minor up to 7,500 sq ft of new floor area (A), an
 * expansion within 50% or 10,000 sq ft (B), or a change of use without extensive construction (E); major above.
 */
function classifyCommercialState(i: ProjectInputs): TreeId {
  if (i.work === "change" && !i.extensive) return "minor";
  if (i.work === "expand") return i.gfa <= Math.max(10000, i.existingGfa * 0.5) ? "minor" : "major";
  return i.gfa <= 7500 ? "minor" : "major";
}

/** The route a project takes. A town whose regulations sort projects differently from the state defaults supplies its own rule. */
export function classify(i0: ProjectInputs): TreeId {
  if (i0.kind === "commercial") return (townRules(i0.town).classifyCommercial ?? classifyCommercialState)(i0);
  // Commercial floor area counts only for a mixed-use project.
  const i = i0.kind === "mixed" ? i0 : { ...i0, commercial: 0 };
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
  const need = i.kind === "commercial" ? null : requiredArea(i);
  const mixedPer = i.kind === "mixed" && i.town === "Cumberland" ? cumberlandMixedArea(i) : null;
  const densityFail = (need !== null && i.lot < need.sqft) || (mixedPer !== null && i.lot < i.units * mixedPer);
  const useRelief = t === "prohibited" || t === "hearing";
  return {
    wet: i.wet,
    dot: i.dot,
    acre: i.dist >= 1,
    // No public sewer means an onsite wastewater system, which RIDEM approves (250-RICR-150-10-6 § 6.9(C)).
    septic: !i.sewer,
    pubwater: i.water,
    pubsewer: i.sewer,
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
const STATEWIDE_SRC = /^(s\d|ridsp|sfm|papa|riza|rigis|nza|sosom|owts|ridem)/;

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
  const ids = new Set([...local.map((s) => s.id), ...(townRules(town).omit?.[tree] ?? [])]);
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
      p: "The Atlas lists multi-family as allowed in C-1, but Blackstone Residences (C-1, 2025) still needed an adjustment for residential use in a commercial zone. Staff also said its 35,580 sq ft lot allowed 7 units by right, more than the Atlas density implies: the ordinance's mixed-use density, one unit per 5,000 sq ft with water and sewer (§ 5-3), gives exactly that. Confirm the adjustment with staff.",
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
        q: i.water && i.sewer ? "10,000 square feet minimum lot size for the first unit plus 5,000 square feet for each additional unit" : "30,000 square feet per unit plus 10,000 square feet for each additional unit",
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
    // Cumberland's ordinance went to one space per unit on April 15, 2026; the Atlas and the 2024 memo predate it.
    if (i.town === "Cumberland" && !i.transit) {
      out.push({ st: "info", t: `Parking: ${i.units} spaces required (1 per unit)`, p: "Cumberland's ordinance was amended on April 15, 2026 to one space per dwelling unit. The Zoning Atlas (2024) and the 2024 staff memo for Waterman Pond, which counted 2 per unit, are from before it. Plan visitor spaces and snow storage on top: parking is one of the most common concerns at Cumberland hearings.", src: "cz14", pin: "§ 14-3(a), parking requirements by use", q: "Dwelling Unit 1 spaces per D.U." });
    } else out.push(i.transit
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
  if (i.wet) trig.push(wetPermit(i));
  if (i.dist >= 1) trig.push(`RIPDES construction stormwater (${i.dist} acres)`);
  if (!i.sewer) trig.push("RIDEM septic system (OWTS) approval");
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
  return withIds(analyzeAll(i, tree));
}

/**
 * Every finding gets an id that survives a change of numbers: its source and its title with the digits taken out.
 * "Density: 12 units" and "Density: 14 units" are the same finding. A rule may set its own id, and a repeat gets a suffix.
 */
function withIds(list: Finding[]): Finding[] {
  const seen = new Map<string, number>();
  return list.map((f) => {
    const base = f.id ?? `${f.src ?? "x"}:${f.t.toLowerCase().replace(/[0-9][0-9,.]*/g, "").replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "").slice(0, 44)}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return { ...f, id: n === 1 ? base : `${base}-${n}` };
  });
}

function analyzeAll(i: ProjectInputs, tree: TreeId): Finding[] {
  // On tribal land the town's rules may not apply at all, so none are run as if they did (ARD D38).
  if (i.reservation) {
    return [{
      st: "fail", t: `Not the town's zoning: the site is on ${i.reservation}`,
      p: `The Zoning Atlas maps this land as tribal land, managed with the federal Bureau of Indian Affairs. Whose rules govern building on it, and who decides, is not read here, so this site does not run ${i.town}'s zoning or route for it. The steps shown are the state's ordinary route and may not apply.`,
      src: "rizaNative", pin: "Native Lands layer",
      gap: "The Narragansett Indian Tribe, and the Bureau of Indian Affairs' Eastern Regional Office",
    }];
  }
  const base = [...analyzeBase(i, tree), ...(i.overlays ?? []).flatMap((o) => overlayFinding(i, o))];
  if (!i.sewer) base.push(...septicFindings(i));
  if (i.wet && i.wetAgency === "CRMC") {
    base.push({ st: "info", t: "Wetlands here are the Coastal Resources Management Council's, not RIDEM's", p: "RIDEM's map of wetland permitting jurisdiction puts this site in CRMC's area. The wetlands permit is CRMC's (an Assent), decided by an appointed state council, and the coastal program's rules apply.", src: "ridemWetJur", pin: "Wetland Jurisdiction layer, AGENCY" });
  }
  return base;
}

/** The towns with land in the Salt Pond and Narrow River critical resource areas (§ 6.42(C)(1) and (2)). */
const SALT_POND_TOWNS = ["Charlestown", "Narragansett", "South Kingstown", "Westerly"];
const NARROW_RIVER_TOWNS = ["Narragansett", "South Kingstown", "North Kingstown"];

/** Without public sewer: RIDEM's approval of the septic system, the large-system line, and the critical resource areas. */
function septicFindings(i: ProjectInputs): Finding[] {
  const out: Finding[] = [{
    st: "info", t: "No public sewer: RIDEM approves the septic system",
    p: "An onsite wastewater treatment system needs RIDEM's written approval of its plans before construction, from a licensed designer's application with a soil evaluation. Homes are designed at 115 gallons a day per bedroom.",
    src: "owts", pin: "250-RICR-150-10-6, § 6.9(C)", q: "No person shall install, construct, alter or repair or cause to be installed, constructed, altered or repaired any OWTS without first obtaining the Director",
  }];
  if (i.kind !== "commercial" && i.units * 2 * 115 >= 5000) {
    out.push({ st: "info", t: "Probably a large septic system, with added review", p: `A system designed for 5,000 gallons a day or more is a large system, with notice and more design requirements. At 115 gallons a day per bedroom that is 44 bedrooms; ${i.units} homes of two bedrooms would be ${i.units * 2}.`, src: "owts", pin: "250-RICR-150-10-6, § 6.39(A)(1)", q: "Any single OWTS designed to treat five thousand (5,000) gallons or more per day" });
  }
  const areas = [SALT_POND_TOWNS.includes(i.town) ? "Salt Pond" : "", NARROW_RIVER_TOWNS.includes(i.town) ? "Narrow River" : ""].filter(Boolean);
  if (areas.length) {
    out.push({
      st: "flag", t: `The site may be in the ${areas.join(" or ")} critical resource area: nitrogen-reducing technology required`,
      p: `Part of ${i.town} drains to ${areas.length > 1 ? "these waters" : areas[0] === "Salt Pond" ? "the salt ponds" : "the Narrow River"}. There, every septic application for new building needs nitrogen-reducing technology, and stricter setbacks apply. The areas follow CRMC's special area management plans (the rules' Figures 28 and 29); whether this site is inside is not looked up here.`,
      src: "owts", pin: "250-RICR-150-10-6, § 6.43(B)(1)", q: "Nitrogen reducing technology shall be required for all OWTS Applications for New Building Construction",
      gap: "The critical resource area maps in RIDEM's septic rules (§§ 6.86 and 6.87, Figures 28 and 29)",
    });
  }
  return out;
}

/** The state wetlands permit for the site: CRMC's on the coast, RIDEM's inland, by RIDEM's jurisdiction map. */
function wetPermit(i: ProjectInputs): string {
  return i.wetAgency === "CRMC" ? "CRMC coastal wetlands (Assent)" : "RIDEM freshwater wetlands";
}

/** An overlay district changes the base district's rules for the land under it. None has been read into this site. */
function overlayFinding(i: ProjectInputs, abbr: string): Finding[] {
  const read = townRules(i.town).overlayRules?.(i, abbr);
  if (read) return read;
  return [overlayGap(i, abbr)];
}

function overlayGap(i: ProjectInputs, abbr: string): Finding {
  const name = districtsOf(i.town)?.find((d) => d.abbrvname === abbr)?.name ?? townRules(i.town).unmappedOverlays?.find((o) => o.abbr === abbr)?.name ?? abbr;
  const label = /overlay/i.test(name) ? `the ${name}` : `the ${name} overlay`;
  return {
    st: "flag", t: `Not read: ${label}`,
    p: `The site lies in an overlay district, which adds rules to ${i.zone === "other" ? "the base district" : i.zone}'s or changes them (uses, density, design, or protections). The other findings are for the base district only, and a blocker among them may not hold: an overlay can allow what the district prohibits, or restrict what it allows.`,
    gap: `${i.town}'s zoning ordinance, the article for ${label}`,
  };
}

function analyzeBase(i: ProjectInputs, tree: TreeId): Finding[] {
  if (i.kind === "commercial") return analyzeCommercial(i, tree);
  const local = townFindings(i.town);
  const base = local ? local(i, tree, analyzeGeneric(i, tree), district(i.zone)) : withTownUse(i, tree, analyzeGeneric(i, tree));
  return i.kind === "mixed" ? [...base, ...mixedFindings(i, tree)] : base;
}

/**
 * Where a town's own use table was read (D14), its answer replaces the Atlas's: the findings drawn from the Atlas's
 * use columns go, and the town's takes their place. A comprehensive permit can grant a use the district prohibits,
 * so under it a prohibition is open rather than a blocker. Providence does this inside its own findings.
 */
function withTownUse(i: ProjectInputs, tree: TreeId, generic: Finding[]): Finding[] {
  const own = townRules(i.town).use?.(i);
  if (!own) return generic;
  const isUse = (f: Finding) => !!f.pin?.includes("_treatment") || f.t.startsWith("District not found") || f.t.startsWith("Check the use table");
  const f = tree === "comp" && own.finding.st === "fail" ? { ...own.finding, st: "flag" as const, p: `${own.finding.p} The comprehensive permit can grant the adjustment.` } : own.finding;
  const at = generic.findIndex(isUse);
  const rest = generic.filter((g) => !isUse(g));
  rest.splice(at < 0 ? rest.length : at, 0, f);
  return rest;
}

const Q_A = "Seven thousand five hundred (7,500) gross square feet of floor area of new commercial, manufacturing, or industrial development, or less";
const Q_B = "An expansion of up to fifty percent (50%) of existing floor area or up to ten thousand (10,000) square feet for commercial, manufacturing, or industrial structures";
const Q_C = "Mixed-use development consisting of up to six (6) dwelling units and two thousand five hundred (2,500) gross square feet of commercial space or less";
const Q_E = "Change in use at the property where no extensive construction of improvements is sought";

/** The state permits the entered facts trigger. The same law for every kind of project. */
function statePermitFinding(i: ProjectInputs): Finding {
  const trig: string[] = [];
  if (i.wet) trig.push(wetPermit(i));
  if (i.dist >= 1) trig.push(`RIPDES construction stormwater (${i.dist} acres)`);
  if (!i.sewer) trig.push("RIDEM septic system (OWTS) approval");
  if (i.dot) trig.push("RIDOT Physical Alteration Permit");
  if (!trig.length) return { st: "pass", t: "No state permit triggers entered", p: "Confirm against the wetlands and flood layers in the Zoning Atlas map." };
  return i.town === "Cumberland"
    ? { st: "flag", t: `State permits triggered: ${trig.join(", ")}`, p: "Under Cumberland's regulations, these must be in hand before preliminary approval.", src: "cregs", pin: "§ 5-GH(2)(a)(3)", q: "including permits related to freshwater wetlands, floodplains, preliminary suitability for individual septic disposal systems, public water systems, and connections to state roads" }
    : { st: "flag", t: `State permits triggered: ${trig.join(", ")}`, p: `Many towns require these before preliminary approval. Check ${i.town}'s regulations.` };
}

/** The use permission for a non-residential use, from the town's own table, or a named gap where it has not been read. */
function commercialUseFinding(i: ProjectInputs, part = ""): Finding {
  const local = townRules(i.town).useCommercial?.(i);
  if (local) return local.finding;
  const what = USE_LABEL[i.use].split(" (")[0].toLowerCase();
  return {
    st: "flag",
    t: `Not read: whether ${what} use${part} is allowed in ${i.zone === "other" ? "the district" : i.zone}`,
    p: `The Zoning Atlas records housing types only, and ${i.town}'s use table for other uses has not been read into this site. Find the use in the zoning ordinance's table of uses for the district, or ask the planning office.`,
    gap: `${i.town}'s zoning ordinance, its table of permitted uses`,
  };
}

/** What the state's mixed-use line (C) says about a project with homes and commercial space. */
function mixedFindings(i: ProjectInputs, tree: TreeId): Finding[] {
  const out: Finding[] = [];
  const within = i.units <= 6 && i.commercial <= 2500;
  // A town whose regulations draw their own mixed-use line has settled the route (Providence, for 10 or more units).
  const settled = !!townRules(i.town).asksCommercial && i.units >= 10;
  if (settled) {
    out.push({ st: "info", t: "Mixed use: the route follows the city's own line", p: `${i.town}'s regulations sort projects of 10 or more units by commercial floor area, which the route above already uses.` });
  } else if (within) {
    out.push({ st: "pass", t: `Mixed use within the state's minor line: ${i.units} units and ${fmt(i.commercial)} sq ft commercial`, p: "Up to 6 units and 2,500 sq ft of commercial space is a minor land development project.", src: "s3932", pin: "§ 45-23-32(19)(i)(C)", q: Q_C });
  } else if (tree === "minor" || tree === "byright") {
    out.push({
      st: "flag", t: "Mixed use beyond the state's minor line: the town may review it as major",
      p: `State law makes mixed use minor only up to 6 units and 2,500 sq ft of commercial space, and this project has ${i.units} units and ${fmt(i.commercial)} sq ft. Whether the 9-unit line for multi-family housing still covers a building with commercial space is a reading the town makes. Confirm the route with the planning office before you file. The route shown here is the one the units give.`,
      src: "s3932", pin: "§ 45-23-32(19)(i)(C)", q: Q_C,
    });
  }
  out.push(commercialUseFinding(i, " for the commercial space"));
  const own = townRules(i.town).commercialFindings;
  if (own) out.push(...own(i, "mixed"));
  return out;
}

/** Findings for a commercial or institutional project. What has not been read is said as such (ARD D31). */
function analyzeCommercial(i: ProjectInputs, tree: TreeId): Finding[] {
  const own = townRules(i.town).commercialFindings;
  const out: Finding[] = [];
  const local = townRules(i.town).classifyCommercial;
  const name = routeText(tree, i.town).name;
  const ownRoute = townRules(i.town).commercialRoute;
  if (local && ownRoute) out.push(ownRoute(i, tree));
  if (!local) {
    if (i.work === "change" && !i.extensive) {
      out.push({ st: "info", t: `${name}: a change of use without extensive construction`, p: "State law makes this minor review. A town may designate it for development plan review instead.", src: "s3932", pin: "§ 45-23-32(19)(i)(E)", q: Q_E });
    } else if (i.work === "expand") {
      out.push({ st: "info", t: `${name}: ${fmt(i.gfa)} sq ft added to ${fmt(i.existingGfa)} sq ft`, p: "An expansion is minor review up to half the existing floor area or 10,000 sq ft, and major above. A town can raise these lines.", src: "s3932", pin: "§ 45-23-32(19)(i)(B)", q: Q_B });
    } else {
      out.push({ st: "info", t: `${name}: ${fmt(i.gfa)} sq ft of new floor area`, p: `Up to 7,500 sq ft of new commercial floor area is minor review, more is major. A town can raise the line.`, src: "s3932", pin: "§ 45-23-32(19)(i)(A)", q: Q_A });
    }
    out.push({
      st: "info", t: `Not read: whether ${i.town} reviews a project this size as land development`,
      p: "Some towns' regulations send a single small building straight to a building permit, or to development plan review, and some raise the state's lines. This town's regulations have not been read for non-residential projects.",
      gap: `${i.town}'s land development and subdivision regulations, their definitions`,
    });
  }
  out.push(commercialUseFinding(i));
  if (i.use === "institutional") {
    out.push({ st: "info", t: "Schools and hospitals may get development plan review", p: "State law lets a town use development plan review for institutional development for educational or hospital facilities.", src: "s3932", pin: "§ 45-23-32(9)(v)", q: "Institutional development for educational or hospital facilities" });
  }
  if (own) out.push(...own(i, "all"));
  else out.push({
    st: "info", t: "Not read: parking, height, setbacks and coverage for this use",
    p: `These come from ${i.town}'s zoning ordinance, by district and by use, and have not been read for non-residential uses. Expect the planning office to check them at the first stage.`,
    gap: `${i.town}'s zoning ordinance: its dimensional tables and parking article`,
  });
  out.push(statePermitFinding(i));
  return out;
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
  if (i.wet) statePermits.push(i.wetAgency === "CRMC" ? "CRMC wetlands" : "RIDEM wetlands");
  if (i.dist >= 1) statePermits.push("RIPDES stormwater");
  if (!i.sewer) statePermits.push("RIDEM septic");
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

/**
 * Who holds the decision on each step of the main line, in order and once each: the first authority named on a step.
 * A step whose authorities don't decide an application there (it has an `authLabel`, such as "Rules set by") is skipped.
 */
export function deciders(steps: NumberedStep[], f: Flags): string[] {
  const out: string[] = [];
  steps.filter((s) => !s.branch && !s.authLabel).forEach((s) => {
    const a = s.auth.find((x) => condOK(x.cond, f));
    if (a && !out.includes(a.c)) out.push(a.c);
  });
  return out;
}
