import type { Finding, ProjectInputs, TownRules } from "../../../types";
import { cellsOf, plain, useFinding, type Value } from "../useTable";
import { COMP_STATUS, COMP_STEPS } from "../comp-steps";

/*
 * Exeter, read 2026-11-18 from its Zoning Ordinance, Appendix A (Municode, saved as a Word file, `exzo`). Chunk 6
 * (ARD D63). What it adds:
 *   - apartments only inside a mixed-use commercial development (§ 4.6): a commercial building of 3,000 sq ft or more,
 *     homes on the upper floors, an acre of land a home, and 20% of the homes deed-restricted for low and moderate
 *     income for 30 years: a required affordable share in a fourth town;
 *   - a table and a section that disagree: § 4.6 allows the development by special use permit in B and LB/R, the table
 *     says N in B and "SY" in LB-R, a cell that is neither S nor Y;
 *   - an overlay the Atlas does not map (the Planned Village Overlay District) and one it maps as a district (GWOL);
 *   - a footnote (16) on many cells that the table no longer explains: the development plan review section it seems to
 *     point to was repealed on December 4, 2023.
 * Not read: the dimensional table, the planned village development's own rules, conservation development (whose
 * duplex lot of 65,340 sq ft applies only inside one), and the Planned District, whose column is blank.
 */

const COLS = ["RE-2", "RU-3", "RU-4", "CR-5", "B", "LB-R", "LI", "OS/PL", "GWOL", "PD", "PVOD"] as const;
type Col = (typeof COLS)[number];
const ATLAS: Record<string, Col> = { "RE-2": "RE-2", "RU-3": "RU-3", "RU-4": "RU-4", "CR-5": "CR-5", B: "B", "LB/R": "LB-R", LI: "LI", "OS/PL": "OS/PL", PD: "PD" };
const ROWS = {
  one: { what: "Single-family home", src: "exzo", q: "1. Single-family structures Y Y Y Y N N N N N - Y", tokens: ["Y", "Y", "Y", "Y", "N", "N", "N", "N", "N", "-", "Y"], pin: "Table 2.4, row 1" },
  two: { what: "Two-family home", src: "exzo", q: "38. Two-family dwelling structures Y N N N N Y (16) N N N - Y", tokens: ["Y", "N", "N", "N", "N", "Y (16)", "N", "N", "N", "-", "Y"], pin: "Table 2.4, row 38" },
  mixed: { what: "Homes in a mixed-use commercial development", src: "exzo", q: "39. Mixed use commercial development N N N N N SY (16) N N N - Y", tokens: ["N", "N", "N", "N", "N", "SY (16)", "N", "N", "N", "-", "Y"], pin: "Table 2.4, row 39" },
};

export const EXETER_UNMAPPED = [{ abbr: "PVOD", name: "Planned Village Overlay District", where: "not in the Zoning Atlas: ask the Town for its map" }];
export const EXETER_KINDS: Record<string, string> = { GWOL: "Overlay" };

const colOf = (i: ProjectInputs): Col | null => ((i.overlays ?? []).includes("PVOD") ? "PVOD" : ATLAS[i.zone] ?? null);

export function exeterUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  const col = colOf(i);
  if (!col) return null;
  const at = col === "PVOD" ? "the Planned Village Overlay District" : i.zone;
  if (i.units >= 3 && i.kind !== "mixed") {
    return useFinding({
      id: "ex-use", town: "Exeter", what: "Multi-family housing on its own", zone: at, value: "prohibited",
      why: ["Exeter's table has no multi-family row: apartments are allowed only in a mixed-use commercial development (§ 4.6) in B and LB/R, or in a planned village development in the PVOD. A comprehensive permit with low- and moderate-income homes is the other route."],
      src: "exzo", pin: ROWS.mixed.pin, q: ROWS.mixed.q,
    });
  }
  const r = i.units >= 3 ? ROWS.mixed : i.units === 2 ? ROWS.two : ROWS.one;
  const cell = cellsOf(COLS, r.q, r.tokens)[col];
  const why: string[] = [];
  let value = plain(cell), flag = false, gap: string | undefined;
  if (cell === "-") { value = "hearing"; flag = true; why.push("The Planned District's column is blank for this use."); gap = "How Exeter treats this use in the Planned District: ask the Planning Board"; }
  else if (cell.startsWith("SY")) { value = "hearing"; flag = true; why.push("The cell reads \"SY\", neither a special use permit (S) nor permitted (Y); § 4.6 says a special use permit, which is shown."); }
  if (cell.includes("(16)")) why.push("The cell carries footnote 16, which the table no longer explains.");
  if (r === ROWS.mixed && col === "B") { value = "prohibited"; flag = true; why.push("The table says no in B, but § 4.6 allows a mixed-use commercial development with homes in B and LB/R by special use permit. The ordinance disagrees with itself, so the stricter reading is shown: ask the Planning Board."); }
  return useFinding({ id: "ex-use", town: "Exeter", what: r.what, zone: at, value: value ?? "prohibited", why, flag, gap, src: "exzo", pin: r.pin, q: r.q });
}

/** § 4.6's affordable share: 20% of the homes in a mixed-use commercial development, at least one. */
export const exeterMixedShare = (units: number) => Math.max(1, Math.ceil(units * 0.2));
const mixedHere = (i: ProjectInputs) => i.kind === "mixed" && i.units >= 1 && ["B", "LB/R"].includes(i.zone);

export function exeterFindings(i: ProjectInputs): Finding[] {
  const out: Finding[] = [];
  if (mixedHere(i)) {
    const need = exeterMixedShare(i.units);
    out.push({
      id: "ex-mixed-share", st: i.aff >= need ? "pass" : "fail", t: `Mixed-use commercial development: ${need} of ${i.units} homes must be affordable, ${i.aff} entered`,
      p: "At least 20% of the homes, and 20% of their floor area, deed-restricted for 30 years for low- and moderate-income households, and never fewer than one.",
      src: "exzo", pin: "§ 4.6(5)", q: "A minimum of 20 percent of the number of residential units, and a minimum of 20 percent of the floor area of the residential units, must be deed restricted for a minimum of 30 years",
    });
    const need2 = i.units * 43560;
    out.push({
      id: "ex-mixed-acre", st: i.lot >= need2 ? "pass" : "fail", t: `An acre of land for each home: ${need2.toLocaleString("en-US")} sq ft for ${i.units}, ${i.lot.toLocaleString("en-US")} entered`,
      p: "Homes are studios, one- or two-bedroom apartments of 600 to 1,250 sq ft on the second or third floor, over a commercial building of at least 3,000 sq ft, and their floor area may not exceed the commercial space's. It is a minor or major land development project.",
      src: "exzo", pin: "§ 4.6(4)", q: "Mixed use commercial developments must have at a minimum one acre of land per each residential unit proposed.",
    });
  }
  return out;
}

export const exeterAffordableLines = (i: ProjectInputs) => (mixedHere(i) ? [{ short: "20%: Exeter mixed-use commercial development", what: "Homes in a mixed-use commercial development need 20% of the units, at least one, deed-restricted for 30 years for low- and moderate-income households.", src: "exzo", need: exeterMixedShare(i.units) }] : []);

/** What the town lays over state law, registered in ../overlay.ts. Chunk 6, small rural towns (ARD D63): its housing rows in place of the Atlas, and its comprehensive permit route (D65). */
export const RULES: TownRules = {
  steps: { comp: COMP_STEPS.Exeter }, routeStatus: COMP_STATUS, use: exeterUse, moreFindings: (i) => exeterFindings(i), unmappedOverlays: EXETER_UNMAPPED, kinds: EXETER_KINDS, affordableLines: exeterAffordableLines,
};
