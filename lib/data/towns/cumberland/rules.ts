import type { AreaNeed, AtlasDistrict, Finding, FindingKey, ProjectInputs, Step, TownRules, TreeId } from "../../../types";
import { cumberlandCommercialFindings, cumberlandCommercialUse, cumberlandMixedArea } from "./commercial";
import { TREES } from "./trees";

/*
 * Cumberland's housing rules and precedent, laid over the state-law findings (lib/engine.ts, `stateFindings`). Until
 * 2026-11-20 these were the engine's own findings, stripped out again for every other town (ARD debt 1). Read from the
 * Zoning Ordinance (Art. 3 lot area per unit, § 14-3 parking as amended April 15, 2026, § 15-12 inclusionary zoning),
 * the Land Development and Subdivision Regulations (§ 5-GH), the Planning Board's minutes and the Waterman Pond memo.
 * Keep `src`, `pin` and `q` on one line for verify_quotes.py.
 */

const SQFT_PER_ACRE = 43560;
const Q_WS = "10,000 square feet minimum lot size for the first unit plus 5,000 square feet for each additional unit";
const Q_ONE = "30,000 square feet per unit plus 10,000 square feet for each additional unit";

/**
 * Lot area per unit from Article 3: 10,000 sq ft plus 5,000 a unit with water and sewer, 30,000 plus 10,000 with one of
 * them, in R-3 and for one or two units in R-2. In C-1 and C-2 a mixed-use project's density is § 5-3's, checked with
 * the commercial space (`cumberlandMixedArea`). A conservation development takes the Atlas's figure.
 */
export const cumberlandArea: NonNullable<TownRules["area"]> = (i, { upa, minLot }) => {
  if (i.kind === "mixed" && (i.zone === "C-1" || i.zone === "C-2")) return null;
  if (i.conservation && upa.prd) return undefined;
  const cite = { src: "cz3", pin: "Art. 3, lot area per unit", q: i.water && i.sewer ? Q_WS : Q_ONE };
  if (i.zone === "R-2" && i.units <= 2) return i.water && i.sewer ? { sqft: 10000 + (i.units - 1) * 5000, basis: "ordinance", cite } : null;
  if (i.zone === "R-3") {
    const atlasSqft = upa.base ? Math.max((i.units / upa.base) * SQFT_PER_ACRE, (minLot.base ?? 0) * SQFT_PER_ACRE) : undefined;
    if (i.water && i.sewer) return { sqft: 10000 + (i.units - 1) * 5000, basis: "ordinance", atlasSqft, cite };
    if (i.water || i.sewer) return { sqft: 30000 + (i.units - 1) * 10000, basis: "ordinance", atlasSqft, cite };
    return null;
  }
  return undefined;
};

/** State permits before the preliminary plan (§ 5-GH(2)(a)(3)). */
export const CUMBERLAND_PERMITS: NonNullable<TownRules["permitsRule"]> = {
  p: "Under Cumberland's regulations, these must be in hand before preliminary approval.",
  src: "cregs", pin: "§ 5-GH(2)(a)(3)", q: "including permits related to freshwater wetlands, floodplains, preliminary suitability for individual septic disposal systems, public water systems, and connections to state roads",
};

/** Findings Cumberland's records add after the use finding. */
function useNotes(i: ProjectInputs): Finding[] {
  const out: Finding[] = [];
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
  return out;
}

/** The findings that follow density, before which a missing density figure is said. */
const AFTER_DENSITY = new Set<FindingKey | undefined>(["parking", "height", "affordable", "inclusionary"]);

/** Cumberland's ordinance and precedent, laid over the state-law findings by their keys, in the same order. */
export function cumberlandFindings(i: ProjectInputs, tree: TreeId, generic: Finding[], d: AtlasDistrict | undefined, need: AreaNeed | null): Finding[] {
  const out: Finding[] = [];
  let densitySaid = false;
  for (const f of generic) {
    if (!densitySaid && AFTER_DENSITY.has(f.key)) {
      densitySaid = true;
      if (!need && i.zone === "R-3") out.push({ st: "flag", t: "Density without public water or sewer", p: "R-3 density is listed only for sites with one or both utilities. Expect a much larger lot requirement.", src: "cz3", pin: "Art. 3" });
    }
    switch (f.key) {
      case "use":
        // The use finding quotes the Atlas's own word for the treatment. (Not atlas.ts's treatmentFor: atlas.ts reads overlay.ts, which reads this file.)
        out.push(tree === "comp" && d && f.q === "Prohibited" ? { ...f, p: `${f.p} Haley's Commons was approved this way in R-1 in September 2025.` } : f, ...useNotes(i));
        break;
      case "density":
        if (need?.basis === "riza-prd") out.push({ ...f, src: "memoWP", pin: "Staff memo, Waterman Pond (R-3 conservation development)", q: "a minimum of 25% of the site’s upland area must be preserved as open space" });
        else if (need?.basis === "riza" && i.lot < need.sqft) out.push({ ...f, p: `${f.p} Blackstone Residences sought a density adjustment through a comprehensive permit for this reason.` });
        else out.push(f);
        break;
      case "parking":
        // The ordinance went to one space per unit on April 15, 2026; the Atlas and the 2024 memo predate it.
        if (i.transit) out.push(f);
        else out.push({ key: "parking", st: "info", t: `Parking: ${i.units} spaces required (1 per unit)`, p: "Cumberland's ordinance was amended on April 15, 2026 to one space per dwelling unit. The Zoning Atlas (2024) and the 2024 staff memo for Waterman Pond, which counted 2 per unit, are from before it. Plan visitor spaces and snow storage on top: parking is one of the most common concerns at Cumberland hearings.", src: "cz14", pin: "§ 14-3(a), parking requirements by use", q: "Dwelling Unit 1 spaces per D.U." });
        break;
      case "height":
        out.push({ ...f, p: `${f.p} Haley's Commons dropped a height waiver to win over an abutter.` });
        break;
      case "inclusionary":
        out.push({ key: "inclusionary", st: "info", t: "No affordable units required", p: `Cumberland's inclusionary zoning section is reserved. A comprehensive permit would need ${Math.ceil(i.units * 0.25)} affordable units.`, src: "cz15", pin: "§ 15-12 Inclusionary zoning", q: "(Reserved)" });
        break;
      default:
        out.push(f);
    }
  }
  return out;
}

/** What the town lays over state law, registered in ../overlay.ts: its steps for all five routes (trees.ts), its housing findings (above) and its commercial rules (commercial.ts). */
export const RULES: TownRules = {
  steps: Object.fromEntries(Object.entries(TREES).map(([k, t]) => [k, t.steps])) as Record<TreeId, Step[]>,
  findings: cumberlandFindings, area: cumberlandArea, mixedArea: cumberlandMixedArea, permitsRule: CUMBERLAND_PERMITS,
  useCommercial: cumberlandCommercialUse, commercialFindings: cumberlandCommercialFindings,
  routeStatus: Object.fromEntries(Object.entries(TREES).map(([k, t]) => [k, t.status])),
  routeText: Object.fromEntries(Object.entries(TREES).map(([k, t]) => [k, { rule: t.rule, blurb: t.blurb, stateTerms: true }])),
};
