import type { Finding, ProjectInputs } from "../../../types";
import { RANK, WORD, cellsOf, plain, useFinding, type Value } from "../useTable";

/*
 * Pawtucket, read 2026-11-19 from its Zoning Ordinance, Chapter 410 (eCode360, `pazo`) and its Table of Use
 * Regulations (Attachment 1, `pazt`, amended through December 20, 2023). Chunk 7 (ARD D67). What it adds:
 *   - four housing rows in place of the Atlas's: one-family, two-family, three- or four-family, and five or more;
 *   - mixed residential and commercial use as a row of its own, which permits homes in RD3, CD, CMU, CT, RCD and RTW;
 *   - the Riverfront Tidewater district (RTW, 2021), which the Atlas does not map.
 * The table differs from the Atlas in two places: two-family homes are not allowed in Commercial Downtown (CD) or
 * Conant Thread (CT), where the Atlas says they are. The Mill Building Reuse District (MBRD) is an overlay on MB and MO
 * whose article was not read; the Atlas answers there. Not read: the dimensional tables, the development plan review
 * thresholds (10 and 20 homes) as a route, the riverfront districts' design rules.
 */

const COLS = ["RL", "RS", "RT", "RM", "RE", "RD1", "RD2", "RD3", "CL", "CG", "CD", "CMU", "CT", "MO", "MB", "PO", "PC", "RCD", "RTW"] as const;
type Col = (typeof COLS)[number];
const ROWS = {
  one: { what: "One-family home", src: "pazt", q: "A. One-family dwelling Y Y Y Y Y N N Y N N N N N N N N N Y Y" },
  two: { what: "Two-family home", src: "pazt", q: "B. Two-family dwelling N N Y Y Y N N Y Y Y N Y N N N N N Y Y" },
  three: { what: "Three- or four-family home", src: "pazt", q: "C. Three- or four-family N N N Y Y N N Y Y Y Y Y S N N N N Y Y" },
  multi: { what: "Multifamily building (5 homes or more)", src: "pazt", q: "D. Multifamily (5 dwelling N N N Y Y N N Y Y Y Y Y Y S N N N Y Y" },
  mixed: { what: "Mixed residential and commercial use", src: "pazt", q: "L. Mixed N N N S N N N Y N N Y Y Y N N N N Y Y" },
};

export function pawtucketUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  if (!(COLS as readonly string[]).includes(i.zone)) return null;
  const col = i.zone as Col;
  let r = i.units >= 5 ? ROWS.multi : i.units >= 3 ? ROWS.three : i.units === 2 ? ROWS.two : ROWS.one;
  let value = plain(cellsOf(COLS, r.q)[col]) ?? "prohibited";
  const why: string[] = [];
  if (i.kind === "mixed") {
    const m = plain(cellsOf(COLS, ROWS.mixed.q)[col]) ?? "prohibited";
    if (RANK[m] > RANK[value]) why.push(`Homes alone are ${WORD[value]} here, but the table's row for mixed residential and commercial use says ${WORD[m]}. The stricter reading is shown: ask the Planning Department whether homes over a permitted commercial use count as mixed use.`);
    else if (m !== value) why.push(`Homes alone would be ${WORD[value]} here; the table's row for mixed residential and commercial use answers for a building with commercial space.`);
    r = ROWS.mixed; value = m;
  }
  if ((col === "CD" || col === "CT") && i.units === 2) why.push("The Zoning Atlas shows two-family homes as allowed here; the table amended through December 2023 does not.");
  return useFinding({ id: "pa-use", town: "Pawtucket", what: r.what, zone: i.zone, value, why, src: "pazt", pin: "Attachment 1, 1. Residential uses", q: r.q });
}
