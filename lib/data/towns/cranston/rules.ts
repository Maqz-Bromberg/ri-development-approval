import type { Finding, ProjectInputs } from "../../../types";
import { cellsOf, plain, useFinding, type Value } from "../useTable";

/*
 * Cranston, read 2026-11-19 from Title 17, Zoning (eCode360, `crzo`, downloaded November 18, 2026; § 17.20.010 last
 * amended by Ord. 2026-2, January 20, 2026). Chunk 7 (ARD D67). Cranston's code moved from Municode to eCode360.
 * What it adds:
 *   - the Table of Principal Use's housing rows in place of the Atlas's. They differ from the Atlas: two-family homes
 *     are not allowed in any A district, where the Atlas shows a hearing in A-80, A-12 and A-8 and allows them in A-20;
 *   - homes above a ground-floor business, permitted in C-1, C-2, C-3, EI and G, which answers for mixed use;
 *   - a G (government) column the Atlas does not map. The Mixed Use Planned District (MPD) is a rezoning, and the Atlas
 *     answers there.
 * Not read: the B-2 density formula (§ 17.20.090), the dimensional tables, the MPD article.
 */

const COLS = ["A-80", "A-20", "A-12", "A-8", "A-6", "B-1", "B-2", "C-1", "C-2", "C-3", "C-4", "C-5", "M-1", "M-2", "S-1", "EI", "G"] as const;
type Col = (typeof COLS)[number];
const ROWS = {
  one: { what: "Single-family home", src: "crzo", q: "Single-family dwelling Y Y Y Y Y Y Y Y Y N N N N N N Y N" },
  two: { what: "Two-family home", src: "crzo", q: "Two-family dwelling N N N N N Y Y Y Y N N N N N N Y N" },
  multi: { what: "Multi-family building", src: "crzo", q: "Multi-family dwelling N N N N N N Y Y Y N N N N N N Y N" },
  above: { what: "Homes above a ground-floor business", src: "crzo", q: "Residence above first story business use N N N N N N N Y Y Y N N N N N Y Y" },
};

export function cranstonUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  if (!(COLS as readonly string[]).includes(i.zone)) return null;
  const col = i.zone as Col;
  let r = i.units >= 3 ? ROWS.multi : i.units === 2 ? ROWS.two : ROWS.one;
  let value = plain(cellsOf(COLS, r.q)[col]) ?? "prohibited";
  const why: string[] = [];
  if (i.kind === "mixed" && value !== "allowed" && plain(cellsOf(COLS, ROWS.above.q)[col]) === "allowed") {
    why.push(`As homes alone they are not allowed here; homes above a ground-floor business are.`);
    r = ROWS.above; value = "allowed";
  }
  if (r === ROWS.multi && col === "B-2") why.push("In B-2 the number of homes follows the formula in § 17.20.090, not read here.");
  if (r === ROWS.two && col.startsWith("A-")) why.push("The Zoning Atlas shows two-family homes as possible in some A districts; the table as amended in 2026 does not.");
  return useFinding({ id: "cr-use", town: "Cranston", what: r.what, zone: i.zone, value, why, src: "crzo", pin: "§ 17.20.030, Table of Principal Use, Residential", q: r.q });
}
