import type { Finding, ProjectInputs } from "../../../types";
import { cellsOf, useFinding, type Value } from "../useTable";

/*
 * Woonsocket, read 2026-11-19 from its Zoning Ordinance, Appendix C (ClerksHQ, `wozo`). Chunk 7 (ARD D67). What it adds:
 *   - the housing rows of § 4.4 in place of the Atlas's, with the table's own marks: P permitted, NP not permitted,
 *     P* permitted only above the ground floor, A only as accessory to a permitted use (§ 4.1);
 *   - homes in Urban Commercial (C-1) only on upper stories, where the Atlas allows two-family and multi-family homes
 *     and prohibits single-family ones; and homes in Mixed Use Industrial/Commercial (MU-2) only as accessory uses,
 *     where the Atlas prohibits them.
 * The Downtown Overlay is already an overlay in the Atlas; its article (§ 12) was not read, nor the dimensional rules.
 */

const COLS = ["R-1", "R-2", "R-3", "R-4", "MU-1", "C-1", "C-2", "MU-2", "I-1", "I-2", "PR-1", "PR-2"] as const;
type Col = (typeof COLS)[number];
const ROWS = {
  one: { what: "Single-family home", src: "wozo", q: "1. Single Family Dwelling P P P P P P* NP A NP NP NP NP" },
  two: { what: "Two-family home", src: "wozo", q: "2. Two-family dwelling NP NP P P P P* NP A NP NP NP NP" },
  multi: { what: "Multifamily building (three homes or more)", src: "wozo", q: "3. Multifamily dwelling, three or more units NP NP NP P P P* NP A NP NP NP NP" },
};

export function woonsocketUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  if (!(COLS as readonly string[]).includes(i.zone)) return null;
  const r = i.units >= 3 ? ROWS.multi : i.units === 2 ? ROWS.two : ROWS.one;
  const cell = cellsOf(COLS, r.q)[i.zone as Col];
  const why: string[] = [];
  let value: Value = cell === "P" ? "allowed" : "prohibited";
  if (cell === "P*") {
    if (i.kind === "mixed") { value = "allowed"; why.push("Homes are permitted here only above the ground floor (§ 4.1-5), so the ground floor must hold the commercial space."); }
    else why.push("Homes are permitted here only above the ground floor (§ 4.1-5). A building with shops or offices on the ground floor and homes above would be.");
  }
  if (cell === "A") why.push("Homes are permitted here only as accessory to a permitted use (§ 4.1-4), not as the main use of the lot.");
  return useFinding({ id: "wo-use", town: "Woonsocket", what: r.what, zone: i.zone, value, why, src: "wozo", pin: "§ 4.4, Residential uses", q: r.q });
}
