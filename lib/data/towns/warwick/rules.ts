import type { Finding, ProjectInputs, TownRules } from "../../../types";
import { RANK, cellsOf, plain, useFinding, type Value } from "../useTable";
import { CITY_STATUS, cityRoute } from "../cityRoutes";

/*
 * Warwick, read 2026-11-19 from its Zoning Ordinance, Appendix A (Municode, `wazo`, saved November 18, 2026). Chunk 7
 * (ARD D67). The city also posts its amendments as separate PDFs on its own site; Municode's text is the codified one,
 * and whether it includes the latest amendments was not checked. What it adds:
 *   - the Table of Use Regulations' housing rows, which go by the size of the development: one home, two, three or
 *     four, five to ten, and ten or more. Ten homes fall in two rows (102.1 and 103) that answer differently in the
 *     Village District; the stricter is shown;
 *   - no homes beyond two-family in any residential district: three or more need the Planned District Residential
 *     overlay (PDR or PDR-L, subsection 308), which is a zone change (footnote 3);
 *   - City Centre Warwick: five or more homes permitted in Intermodal and Gateway, in Intermodal only within a larger
 *     mixed-use building of more than one story (footnote 23).
 * The Atlas's PDR, SFC, IE and IH are overlays or planned districts whose articles were not read; the Atlas answers.
 */

const COLS = ["OS", "A-40", "A-15", "A-10", "A-7", "O", "WB", "GB", "LI", "GI", "IM", "G", "V"] as const;
type Col = (typeof COLS)[number];
const ROWS = {
  one: { what: "Single-family home", src: "wazo", q: "101. Detached single-family dwelling unit No Yes Yes Yes Yes Yes(1) No Yes(1) No No No No Yes" },
  two: { what: "Two-family home", src: "wazo", q: "101.1 Two-Family No S S S S S No S No No No No Yes" },
  four: { what: "Three- or four-family home", src: "wazo", q: "four or less dwelling units No No(3) No(3) No(3) No(3) No(3) No No(3) No No No No Yes" },
  ten: { what: "Multifamily building, five to ten homes", src: "wazo", q: "between five and ten dwelling units No No(3) No(3) No(3) No(3) No(3) No No(3) No No Yes(23) Yes S" },
  more: { what: "Development of ten homes or more", src: "wazo", q: "ten or more dwelling units No No(3) No(3) No(3) No(3) No(3) No No(3) No No Yes Yes No" },
};

function read(r: (typeof ROWS)[keyof typeof ROWS], col: Col, i: ProjectInputs): { value: Value; why: string[] } {
  const cell = cellsOf(COLS, r.q)[col];
  const why: string[] = [];
  let value = plain(cell) ?? "prohibited";
  if (cell === "No(3)") why.push("A zone change to the Planned District Residential overlay (PDR or PDR-L, subsection 308) would make it eligible.");
  if (cell === "Yes(1)") why.push("On the A-7 district's dimensional rules.");
  if (cell === "Yes(23)") {
    if (i.kind === "mixed") why.push("Only as part of a larger mixed-use development in a building of more than one story, with the Planning Board's approval.");
    else { value = "prohibited"; why.push("Here homes are allowed only as part of a larger mixed-use development in a building of more than one story, not as the main use."); }
  }
  return { value, why };
}

export function warwickUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  if (!(COLS as readonly string[]).includes(i.zone)) return null;
  const col = i.zone as Col;
  const rows = i.units >= 11 ? [ROWS.more] : i.units === 10 ? [ROWS.ten, ROWS.more] : i.units >= 5 ? [ROWS.ten] : i.units >= 3 ? [ROWS.four] : i.units === 2 ? [ROWS.two] : [ROWS.one];
  const read2 = rows.map((r) => ({ r, ...read(r, col, i) })).sort((a, b) => RANK[b.value] - RANK[a.value]);
  const { r, value, why } = read2[0];
  if (read2.length === 2 && read2[0].value !== read2[1].value) why.push("Ten homes fall in two rows of the table, 102.1 (five to ten) and 103 (ten or more), which answer differently here. The stricter is shown: ask the Planning Department.");
  return useFinding({ id: "wa-use", town: "Warwick", what: r.what, zone: i.zone, value, why, src: "wazo", pin: "Table of Use Regulations, 100. Residential uses", q: r.q });
}

/** What the city lays over state law, registered in ../overlay.ts. Chunk 7, the busy cities (ARD D67): its housing rows in place of the Atlas, and its practice on its routes (D69). */
export const RULES: TownRules = {
  routeStatus: CITY_STATUS, use: warwickUse, moreFindings: (i, t) => cityRoute("Warwick", t),
  inclusionaryNone: { src: "wazo", note: "A Planned District Residential project may have up to 15% more homes if at least a quarter are sold or rented below market (subsection 308), an incentive, not a requirement." },
};
