import { TREES } from "./data/state/trees";
import { district, districtsOf, housingTypeLabel, readByUtility, treatmentFor, type Treatment } from "./data/atlas";
import { getActiveTown } from "./town";
import { townFindings, townRules, townSteps } from "./data/towns/overlay";
import type { AreaNeed, CommercialUse, Doc, Finding, Flags, ProjectInputs, ProjectKind, Step, TreeId } from "./types";

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

/** Lot area the unit count needs: the town's own rule where it has one (`TownRules.area`), else the Zoning Atlas's figures. */
export function requiredArea(i: ProjectInputs): AreaNeed | null {
  const d = district(i.zone);
  const upa = readByUtility(d?.family4_maxunitsperacre ?? null, i.water, i.sewer);
  const minLot = readByUtility(d?.family4_minlotacres ?? null, i.water, i.sewer);
  const own = townRules(i.town).area?.(i, { upa, minLot });
  if (own !== undefined) return own;

  if (i.conservation && upa.prd) {
    const sqft = Math.max((i.units / upa.prd) * SQFT_PER_ACRE, (minLot.prd ?? 0) * SQFT_PER_ACRE);
    return { sqft, basis: "riza-prd" };
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
  const status = townRules(town).routeStatus?.[tree] ?? (townSteps(town, tree) ? "Local steps read (trial, not confirmed)" : "State law only");
  return { name: local?.name ?? t.name, rule: local?.rule ?? t.rule, blurb: local?.blurb ?? t.blurb, status, local: !!local && !local.stateTerms };
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
  const mixedPer = i.kind === "mixed" ? townRules(i.town).mixedArea?.(i) ?? null : null;
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
    // Where RIDEM's jurisdiction map gives CRMC, the wetlands permit is CRMC's (debt 19).
    coastal: i.wet && i.wetAgency === "CRMC",
    // More homes than the state's minor line (nine): a town's procedure can differ for a major project (ARD D65).
    major: i.units > 9,
    historic: false, ddrc: false, i195: false, aquifer: false, airport: false,
    ...townRules(i.town).overlayFlags?.(i),
  };
}

export function condOK(cond: string | undefined, f: Flags): boolean {
  if (!cond) return true;
  // "a|b" is either; "!a" is not a.
  return cond.split("|").some((k) => (k.startsWith("!") ? !f[k.slice(1) as keyof Flags] : f[k as keyof Flags]));
}

/** A state-law step with the project's town put in where the step names it. */
function forTown(s: Step, town: string): Step {
  return s.what.includes("{town}") ? { ...s, what: s.what.replaceAll("{town}", town) } : s;
}

/**
 * The route for a town. Where the town's own steps have been read for this route they are used in order,
 * followed by the state-law steps they do not cover (building permit, occupancy). Otherwise the state-law route.
 */
function routeSteps(tree: TreeId, town: string): Step[] {
  const base = TREES[tree].steps.map((s) => forTown(s, town));
  const local = townSteps(town, tree);
  let out = base;
  if (local) {
    const ids = new Set([...local.map((s) => s.id), ...(townRules(town).omit?.[tree] ?? [])]);
    out = [...local, ...base.filter((s) => !ids.has(s.id))];
  }
  for (const x of townRules(town).extraSteps ?? []) {
    if (x.trees && !x.trees.includes(tree)) continue;
    const at = x.before.map((id) => out.findIndex((s) => s.id === id)).find((k) => k >= 0) ?? out.length;
    out = [...out.slice(0, at), x.step, ...out.slice(at)];
  }
  return out;
}

/** Steps that apply to this site, numbered. Branch steps (zone change, appeal) are labelled separately. */
export function stepsFor(tree: TreeId, f: Flags, town = getActiveTown()): NumberedStep[] {
  let n = 0;
  return routeSteps(tree, town)
    .filter((s) => condOK(s.cond, f))
    .map((s) => ({ ...s, n: s.branch ? (s.id === "rezone" ? "1a" : "↳") : String(++n) }));
}

export function visibleDocs(s: Step, f: Flags): Doc[] {
  return s.docs.filter((d) => condOK(d.cond, f));
}

/**
 * The findings state law and the Zoning Atlas give a housing project in any town. Each carries a `key`, so a town's own
 * reading can replace or amend one without matching its words: Cumberland adds its ordinance and its precedent
 * (towns/cumberland/rules.ts), Providence replaces most of them (towns/providence/rules.ts).
 */
function stateFindings(i: ProjectInputs, tree: TreeId): Finding[] {
  const out: Finding[] = [];
  const d = district(i.zone);
  const t = treatmentFor(d, i.units);
  const kind = housingTypeLabel(i.units);

  out.push({
    key: "route", st: i.units >= 10 ? "info" : "pass",
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
    out.push({ key: "use", st: "flag", t: "District not found in the Zoning Atlas", p: "Pick the district from the zoning map, or check the use table with Planning staff.", src: "rizaApp", pin: "Rhode Island Zoning Atlas map" });
  } else if (t.value === "allowed") {
    out.push({ key: "use", st: "pass", t: `${kind} housing is allowed in ${i.zone}`, p: `The Zoning Atlas lists ${kind} housing in ${d.name} as allowed, possibly with conditions. No use relief is needed.`, src: "rizaLayer", pin, q: t.raw });
  } else if (t.value === "hearing") {
    out.push({ key: "use", st: "flag", t: `${kind} housing in ${i.zone} needs a public hearing`, p: "The Zoning Atlas lists this use as needing a public hearing, usually a special use permit. Under unified development review, the Planning Board decides it with the plan.", src: "rizaLayer", pin, q: t.raw });
  } else if (t.value === "prohibited") {
    out.push({
      key: "use", st: tree === "comp" ? "flag" : "fail",
      t: `${kind} housing is prohibited in ${i.zone}`,
      p: tree === "comp"
        ? "The comprehensive permit can grant the adjustment."
        : i.rezone
          ? "The route includes a zone change, which the Town Council decides."
          : "You need a use variance through unified development review, a zone change from the Town Council, or a comprehensive permit.",
      src: "rizaLayer", pin, q: t.raw,
    });
  } else {
    out.push({ key: "use", st: "flag", t: `Check the use table for ${i.zone}`, p: "The Zoning Atlas shows this district as an overlay or doesn't classify the use.", src: "rizaLayer", pin, q: t.raw || undefined });
  }
  if (d?.family4_water_required === "Yes" && i.units >= 4 && !i.water) {
    out.push({ key: "water", st: "flag", t: "Public water is required for 4+ family housing here", p: `The Atlas marks public water as required for 4+ family housing in ${i.zone}.`, src: "rizaLayer", pin: `${i.zone} · family4_water_required`, q: "Yes" });
  }

  // Density: the town's own lot-area rule where it has one, else the Atlas's
  const need = requiredArea(i);
  if (need) {
    const ok = i.lot >= need.sqft;
    const st = ok ? "pass" : tree === "comp" ? "flag" : "fail";
    if (need.basis === "riza-prd") {
      out.push({
        key: "density", st,
        t: `Conservation density: ${fmt(need.sqft)} sq ft of developable land needed, ${fmt(i.lot)} entered`,
        p: ok ? "Enough developable (non-wetland) land for this unit count at the conservation development density. At least 25% of the upland must stay as open space." : `Short by ${fmt(need.sqft - i.lot)} sq ft of developable land.`,
        src: "rizaLayer", pin: `${i.zone} · family4_maxunitsperacre / minlotacres (PRD)`,
      });
    } else if (need.basis === "ordinance") {
      out.push({
        key: "density", st,
        t: `Density: ${fmt(need.sqft)} sq ft required, ${fmt(i.lot)} sq ft provided`,
        p: ok ? `The lot supports ${i.units} units under the ordinance's lot-area-per-unit rule.` : `Short by ${fmt(need.sqft - i.lot)} sq ft. You need density relief, fewer units, a conservation development, or a comprehensive permit density bonus.`,
        ...need.cite,
      });
      if (need.atlasSqft && Math.abs(need.atlasSqft - need.sqft) > 1000) {
        out.push({
          key: "density-atlas", st: i.lot >= need.atlasSqft ? "info" : "flag",
          t: `Atlas cross-check: ${fmt(need.atlasSqft)} sq ft at the Atlas density`,
          p: "The Zoning Atlas lists a different maximum density for this district. Ask staff which figure applies before you fix the unit count.",
          src: "rizaLayer", pin: `${i.zone} · family4_maxunitsperacre`, q: d?.family4_maxunitsperacre ?? undefined,
        });
      }
    } else {
      out.push({
        key: "density", st,
        t: `Density (Atlas): ${fmt(need.sqft)} sq ft required, ${fmt(i.lot)} sq ft provided`,
        p: ok ? "The lot meets the Atlas minimum lot size and maximum units per acre." : `Short by ${fmt(need.sqft - i.lot)} sq ft.`,
        src: "rizaLayer", pin: `${i.zone} · family4_maxunitsperacre / minlotacres`, q: `${d?.family4_maxunitsperacre} units/acre; ${d?.family4_minlotacres} acre minimum`,
      });
    }
  }

  // Parking and height
  if (i.units >= 3) {
    const perUnit = i.transit ? 1 : parseFloat(d?.family4_minparking_2br ?? "2") || 2;
    out.push(i.transit
      ? { key: "parking", st: "info", t: `Parking: at most ${i.units} spaces can be required (1 per unit near transit)`, p: "2026 state law caps required parking near frequent transit.", src: "ridsp", pin: "S 3303 / H 8005 Sub A (2026)", q: "no more than one off-street parking space per dwelling unit in a multi-family structure or development can be required" }
      : { key: "parking", st: "info", t: `Parking: ${i.units * perUnit} spaces required (${perUnit} per unit)`, p: "Plan visitor spaces and snow storage on top of the minimum.", src: "rizaLayer", pin: `${i.zone} · family4_minparking` });
  }
  if (d?.family4_maxheightft && i.units >= 4) {
    out.push({ key: "height", st: "info", t: `Height limit: ${d.family4_maxheightft} ft`, p: "Check the elevations against this limit.", src: "rizaLayer", pin: `${i.zone} · family4_maxheightft`, q: d.family4_maxheightft });
  }

  // Affordability
  const minAff = Math.ceil(i.units * 0.25);
  out.push(
    i.aff >= minAff && i.units >= 3
      ? { key: "affordable", st: "pass", t: `Comprehensive permit eligible: ${i.aff} of ${i.units} units affordable`, p: "A single application to the Planning Board, with a minimum density bonus. Requires a RIHousing letter of eligibility.", src: "s5304", pin: "§ 45-53-4", q: "at least twenty-five percent (25%) of the housing" }
      : { key: "inclusionary", st: "info", t: `Inclusionary zoning: check ${i.town}'s ordinance`, p: `A comprehensive permit would need ${minAff} affordable units.` },
  );

  out.push(statePermitFinding(i));
  return out;
}

/** Findings for the site: state law and the Atlas, with the town's own reading laid over them, each with a stable id. */
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
  if (!i.water) base.push(...wellFindings(i));
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

/**
 * Without public water: the homes draw on a well (ARD D63, chunk 6). Where wells are used, RIDEM caps septic flow by lot
 * area unless the system reduces nitrogen, which is a density limit in its own right; and a well serving enough people
 * becomes a public water system under the federal drinking water rules.
 */
function wellFindings(i: ProjectInputs): Finding[] {
  if (i.kind === "commercial" || i.units < 2) return [];
  const out: Finding[] = [];
  const bedrooms = i.units * 2, allowed = Math.floor((i.lot / 20000) * 3);
  if (!i.sewer) out.push({
    id: "well-nitrogen", st: bedrooms <= allowed ? "pass" : "flag",
    t: `No public water: a septic cap of about ${allowed} bedroom${allowed === 1 ? "" : "s"} on ${i.lot.toLocaleString("en-US")} sq ft, ${bedrooms} for ${i.units} two-bedroom homes`,
    p: `Where the lot or a neighbour draws on a well, a new septic system may take 345 gallons a day per 20,000 sq ft of lot, about a sixth of an acre per bedroom at 115 gallons a bedroom. A system with nitrogen-reducing technology may take more.${bedrooms > allowed ? ` This project would need about ${Math.ceil((bedrooms / 3) * 20000).toLocaleString("en-US")} sq ft without it.` : ""} Bedrooms per home are assumed at two.`,
    src: "owts", pin: "250-RICR-150-10-6, § 6.45(A)", q: "the design flow for an OWTS shall not exceed three hundred forty-five (345) gallons per day per twenty thousand (20,000) square feet of applicant’s lot area where the property utilizing the OWTS or any adjacent lot is served by an onsite drinking water well",
  });
  if (i.units >= 7) out.push({
    id: "well-public-system", st: "flag", t: "A shared well for this many homes is probably a public water system",
    p: `A water system with 15 or more connections, or serving 25 or more people daily, is a public water system under the federal drinking water rules, and has to meet them. At two people a bedroom, the septic rules' figure, ${i.units} two-bedroom homes house about ${i.units * 4}.`,
    src: "cfr1412", pin: "40 C.F.R. § 141.2, Public water system", q: "if such system has at least fifteen service connections or regularly serves an average of at least twenty-five individuals daily at least 60 days out of the year",
    gap: "How the state's drinking water program reviews a new public water system for housing, which is not read",
  });
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
  const rules = townRules(i.town);
  const generic = stateFindings(i, tree);
  let base = local ? local(i, tree, generic, district(i.zone), requiredArea(i)) : withTownUse(i, tree, generic);
  // A town whose required affordable share was read answers the inclusionary question itself.
  if (rules.inclusionaryRead) base = base.filter((f) => f.key !== "inclusionary");
  // A town whose whole zoning text was searched and has none says so, as a result rather than a gap (ARD D68).
  const none = rules.inclusionaryNone;
  if (none) base = base.map((f) => (f.key === "inclusionary" ? {
    key: "inclusionary" as const, st: "info" as const, t: `Inclusionary zoning: none found in ${i.town}'s zoning ordinance`,
    p: `The whole text read was searched, and no share of affordable homes is required by zoning. ${none.note ? `${none.note} ` : ""}${f.p} An amendment since the text was saved would be missed.`,
    src: none.src, pin: "Whole text searched for inclusionary zoning",
  } : f));
  const more = rules.moreFindings?.(i, tree) ?? [];
  return i.kind === "mixed" ? [...base, ...mixedFindings(i, tree), ...more] : [...base, ...more];
}

/**
 * Where a town's own use table was read (D14), its answer replaces the Atlas's: the findings drawn from the Atlas's
 * use columns go, and the town's takes their place. A comprehensive permit can grant a use the district prohibits,
 * so under it a prohibition is open rather than a blocker. Providence does this inside its own findings.
 */
function withTownUse(i: ProjectInputs, tree: TreeId, generic: Finding[]): Finding[] {
  const own = townRules(i.town).use?.(i);
  if (!own) return generic;
  const isUse = (f: Finding) => f.key === "use";
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

/** The state permits the entered facts trigger: the full name for the findings, the short one for the verdict. */
function stateTriggers(i: ProjectInputs): { long: string; short: string }[] {
  const out: { long: string; short: string }[] = [];
  if (i.wet) out.push({ long: wetPermit(i), short: i.wetAgency === "CRMC" ? "CRMC wetlands" : "RIDEM wetlands" });
  if (i.dist >= 1) out.push({ long: `RIPDES construction stormwater (${i.dist} acres)`, short: "RIPDES stormwater" });
  if (!i.sewer) out.push({ long: "RIDEM septic system (OWTS) approval", short: "RIDEM septic" });
  if (i.dot) out.push({ long: "RIDOT Physical Alteration Permit", short: "RIDOT road access" });
  return out;
}

/** The state permits finding, the same law for every kind of project; when they are due is the town's rule where it was read. */
function statePermitFinding(i: ProjectInputs): Finding {
  const trig = stateTriggers(i).map((x) => x.long);
  if (!trig.length) return { key: "permits", st: "pass", t: "No state permit triggers entered", p: "Confirm against the wetlands and flood layers in the Zoning Atlas map." };
  const rule = townRules(i.town).permitsRule;
  const t = `State permits triggered: ${trig.join(", ")}`;
  return rule
    ? { key: "permits", st: "flag", t, ...rule }
    : { key: "permits", st: "flag", t, p: `Many towns require these before preliminary approval. Check ${i.town}'s regulations.` };
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
  const statePermits = stateTriggers(i).map((x) => x.short);
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
