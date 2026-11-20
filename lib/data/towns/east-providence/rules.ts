import type { Finding, ProjectInputs, TownRules } from "../../../types";
import { cellsOf, plain, useFinding, type Value } from "../useTable";
import { CITY_STATUS, cityRoute } from "../cityRoutes";

/*
 * East Providence, read 2026-11-19 from Chapter 19, Zoning (Municode, `epzo`, saved November 18, 2026). Chunk 7
 * (ARD D67). What it adds:
 *   - the schedule of use regulations (§ 19-98) in place of the Atlas: two-family homes by special use permit in R-4,
 *     R-5 and R-6 (the Atlas allows them), multi-family (three homes or more, § 19-1) by special use permit in R-5, C-1
 *     and C-2, and not allowed in C-3 to C-5, where the Atlas shows a hearing. The schedule permits "mixed-use" in C-1
 *     to C-5 without saying whether homes may be part of it: the stricter reading is shown, and the finding says so;
 *   - the Waterfront District's own schedule (§ 19-481) for its subdistricts, where development plan review involves
 *     the Waterfront Commission, and a conditional use is the Commission's to grant;
 *   - inclusionary zoning in the Waterfront District only (§ 19-485): 25% affordable at a net five homes or more,
 *     rounded up, two market-rate homes for each affordable one, or a fee in lieu without the bonus.
 * Not read: the multi-family standards (§ 19-216 et seq.), the dimensional schedule, the waterfront performance
 * standards (§ 19-482), the Metacomet subdistrict (not in the Atlas).
 */

const COLS = ["R-1", "R-2", "R-3", "R-4", "R-5", "R-6", "O-1", "C-1", "C-2", "C-3", "C-4", "C-5", "I-1", "I-2", "I-3", "BT"] as const;
type Col = (typeof COLS)[number];
const ROWS = {
  one: { what: "Single-family home", src: "epzo", q: "Single-family Y Y Y Y Y Y N N N N N N N N N N" },
  two: { what: "Two-family home", src: "epzo", q: "Two-family N N N S S S N N N N N N N N N N" },
  multi: { what: "Multi-family building (three homes or more)", src: "epzo", q: "conformance with N N N N S N N S S N N N N N N N" },
  mixed: { src: "epzo", q: "Mixed-Use N N N N N N N Y Y Y Y Y N N N N" },
};

// The Waterfront District's columns, in the order § 19-481 prints them, and the Atlas's subdistricts in each.
const WF = ["PD", "DRPA", "CPTA", "BPH", "VMP", "KP", "MET"] as const;
type Wf = (typeof WF)[number];
const WF_ATLAS: Record<string, Wf> = { PD: "PD", DR: "DRPA", PA: "DRPA", CP: "CPTA", TA: "CPTA", BPH: "BPH", VMP: "VMP", KP: "KP" };
const WF_ROWS = {
  one: { what: "Single-family home", src: "epzo", q: "Single-family C N N N C C C" },
  two: { what: "Two-family home", src: "epzo", q: "Two-family Y N N N Y Y Y" },
  three: { what: "Three-family home", src: "epzo", q: "Three-family Y N C N Y Y Y" },
  apt: { what: "Apartment or condominium building", src: "epzo", q: "Apartment/ Y C Y Y Y Y Y" },
};

export const eastProvidenceWaterfront = (i: ProjectInputs) => i.zone in WF_ATLAS;

function waterfrontUse(i: ProjectInputs): { value: Value; finding: Finding } {
  const r = i.units >= 4 ? WF_ROWS.apt : i.units === 3 ? WF_ROWS.three : i.units === 2 ? WF_ROWS.two : WF_ROWS.one;
  const cell = cellsOf(WF, r.q)[WF_ATLAS[i.zone]];
  const why = ["In the Waterfront District, development plan review gives the East Providence Waterfront Commission a large part in the scale of the project and the character of its uses."];
  if (cell === "C") {
    why.push("A conditional use is a discretionary grant under the waterfront article, not a special use permit from the Zoning Board.");
    return useFinding({ id: "ep-use", town: "East Providence", what: r.what, zone: i.zone, value: "hearing", word: "a conditional use", why, src: "epzo", pin: "§ 19-481, Residential and related uses", q: r.q });
  }
  return useFinding({ id: "ep-use", town: "East Providence", what: r.what, zone: i.zone, value: plain(cell) ?? "prohibited", why, flag: cell === "Y", src: "epzo", pin: "§ 19-481, Residential and related uses", q: r.q });
}

export function eastProvidenceUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  if (eastProvidenceWaterfront(i)) return waterfrontUse(i);
  if (!(COLS as readonly string[]).includes(i.zone)) return null;
  const col = i.zone as Col;
  const r = i.units >= 3 ? ROWS.multi : i.units === 2 ? ROWS.two : ROWS.one;
  const value = plain(cellsOf(COLS, r.q)[col]) ?? "prohibited";
  const why: string[] = [];
  if (r === ROWS.multi) why.push("Multi-family homes must also meet § 19-216 and the sections after it, not read here.");
  if (value === "prohibited" && i.kind === "mixed" && plain(cellsOf(COLS, ROWS.mixed.q)[col]) === "allowed")
    why.push(`The schedule permits "mixed-use" in ${col} without saying whether it may include homes. The stricter reading, the ${r === ROWS.multi ? "multi-family" : "housing"} row's, is shown: ask the Planning Department.`);
  return useFinding({ id: "ep-use", town: "East Providence", what: r.what, zone: i.zone, value, why, src: "epzo", pin: "§ 19-98(b), Residential and related uses", q: r.q });
}

/** § 19-485: 25% at a net five homes or more in the Waterfront District, rounded up. */
export const eastProvidenceInclusionary = (i: ProjectInputs) => (eastProvidenceWaterfront(i) && i.kind !== "commercial" && i.units >= 5 ? Math.ceil(i.units * 0.25) : 0);

export function eastProvidenceFindings(i: ProjectInputs): Finding[] {
  const need = eastProvidenceInclusionary(i);
  if (!need) return [];
  return [
    {
      id: "ep-inclusionary", st: i.aff >= need ? "pass" : "fail", t: `Waterfront inclusionary zoning: ${need} of ${i.units} homes must be affordable, ${i.aff} entered`,
      p: "New market-rate housing in the Waterfront District that adds a net five homes or more must make a quarter of them affordable, rounded up, with a monitoring agreement. The Waterfront Commission may allow them off site within the district.",
      src: "epzo", pin: "§ 19-485(1), (2)", q: "at least 25 percent of the units within the development must qualify as affordable housing",
    },
    {
      id: "ep-inclusionary-bonus", st: "info", t: `Density bonus: ${2 * need} more market-rate homes, or a fee in lieu without them`,
      p: "Two market-rate homes are allowed for each affordable one. A developer may pay a fee in lieu of building the affordable homes, and then gets no bonus.",
      src: "epzo", pin: "§ 19-485(4), (5)", q: "increased to two market rate units for each affordable unit",
    },
  ];
}

export const eastProvidenceAffordableLines = (i: ProjectInputs) => {
  const need = eastProvidenceInclusionary(i);
  return need ? [{ short: "25%: East Providence Waterfront District", what: "A net five or more new homes in the Waterfront District need 25% affordable, rounded up, with two bonus market-rate homes for each; a fee in lieu forgoes the bonus.", src: "epzo", need }] : [];
};

/** What the city lays over state law, registered in ../overlay.ts. Chunk 7, the busy cities (ARD D67): its housing rows in place of the Atlas, and its practice on its routes (D69). */
export const RULES: TownRules = {
  routeStatus: CITY_STATUS, use: eastProvidenceUse, moreFindings: (i, t) => [...eastProvidenceFindings(i), ...cityRoute("East Providence", t)], affordableLines: eastProvidenceAffordableLines,
};
