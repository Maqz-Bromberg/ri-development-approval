import type { Finding, ProjectInputs } from "../../../types";
import { cellsOf, plain, useFinding, type Value } from "../useTable";

/*
 * Smithfield, read 2026-11-19 from its Zoning Ordinance (the Town's PDF, `smzo`, amended to January 6, 2026). Chunk 7
 * (ARD D67): not a city, but its zoning chapter is not on eCode360, so it was saved by hand with the cities. What it adds:
 *   - the Table of Uses' housing rows (§ 4.3) in place of the Atlas's, which differ from it widely: two-family homes are
 *     allowed only in the Planned Development district (the Atlas shows a hearing in four residential districts), and
 *     multi-family homes only in R-20M and PD (the Atlas shows a hearing in R-200, R-80 and R-Med); in Mixed Use and the
 *     Village no new single-family home is allowed (the Atlas shows a hearing).
 * Not read: the Economic Growth Overlay (§ 9.4), which the Atlas draws as a district and answers for; R-20MA, the
 * multi-family affordable district, whose uses the table sends to § 9.3, which is the Putnam Pike/Esmond Street Planned
 * Development District; the dimensional rules; the Administrative Review Team for non-residential zones (§ 10.9).
 */

const COLS = ["R200", "R80", "RMED", "R20", "R20M", "MU", "V", "C", "HC", "LI", "I", "PC", "PD"] as const;
type Col = (typeof COLS)[number];
const ROWS = {
  one: { what: "Single-family home", src: "smzo", q: "9. Dwelling, Single-Family detached P P P P P N N N N N N N P" },
  two: { what: "Two-family home", src: "smzo", q: "10. Dwelling, Two-Family N N N N N N N N N N N N P" },
  multi: { what: "Multi-family building", src: "smzo", q: "8A. Multi-Family N N N N P N N N N N N N P" },
};

export function smithfieldUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  if (!(COLS as readonly string[]).includes(i.zone)) return null;
  const col = i.zone as Col;
  const r = i.units >= 3 ? ROWS.multi : i.units === 2 ? ROWS.two : ROWS.one;
  const value = plain(cellsOf(COLS, r.q)[col]) ?? "prohibited";
  const why: string[] = [];
  if (col === "PD") why.push("The Planned Development district's own article (Article 9) was not read, and may limit what the table permits.");
  if (r !== ROWS.one && value === "prohibited" && col.startsWith("R") && col !== "R20") why.push("The Zoning Atlas shows a hearing here; the ordinance amended to January 2026 does not allow it.");
  return useFinding({ id: "sm-use", town: "Smithfield", what: r.what, zone: i.zone, value, why, src: "smzo", pin: "§ 4.3, Table of Uses, B. Residential uses", q: r.q });
}
