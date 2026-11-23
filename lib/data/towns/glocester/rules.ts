import type { Finding, ProjectInputs, TownRules } from "../../../types";
import { cellsOf, plain, useFinding, type Value } from "../useTable";

/*
 * Glocester, read 2026-11-18 from its Zoning Ordinance, Chapter 350 (eCode360, `glzo`) and its Table of Use
 * Regulations (Attachment 1, `glzt`). Chunk 6 (ARD D63). What it adds:
 *   - a village overlay the Atlas draws as two districts: the Village Overlay District (VD) and its Center District (CD)
 *     are overlays in the ordinance (Article XIII, 2012) that unify the zoning beneath them, with their own columns in
 *     the use table. Marked as overlays here, so the lookup no longer reads a site in Chepachet as on a boundary, and
 *     the overlay's column answers in place of the base district's;
 *   - multi-family homes only in the village: in VD only with retail, in CD with no more than three homes.
 * Inclusionary zoning: none (ARD D68). The zoning points to Chapter 286, Affordable Housing, which was repealed on
 * December 7, 2023 (`gl286`, read 2026-11-20).
 * Not read: the village's design standards, the dimensional table beyond the two-family row, the Planned District.
 */

const COLS = ["A-4", "A-3", "R-2", "B-1", "B-2", "I", "VD", "CD"] as const;
type Col = (typeof COLS)[number];
const ROWS = {
  one: { what: "Single-family home", src: "glzt", q: "1. Single-family dwelling YES YES YES NO NO NO YES NO", tokens: undefined as string[] | undefined },
  two: { what: "Two-family home", src: "glzt", q: "2. Two-family dwelling YES YES YES NO NO NO NO NO", tokens: undefined as string[] | undefined },
  // The cell for VD reads "YES (w/ Retail), NO (w/o Retail)", and the row says "no more than 3 units in Center District".
  multi: { what: "Multi-family building or apartment house", src: "glzt", q: "3. Multifamily structure or", tokens: ["NO", "NO", "NO", "NO", "NO", "NO", "RETAIL", "YES"] },
};

export const GLOCESTER_KINDS: Record<string, string> = { VD: "Overlay", CD: "Overlay" };

const colOf = (i: ProjectInputs): Col | null => {
  const o = i.overlays ?? [];
  if (o.includes("CD") || i.zone === "CD") return "CD";
  if (o.includes("VD") || i.zone === "VD") return "VD";
  return (COLS as readonly string[]).includes(i.zone) ? (i.zone as Col) : null;
};

export function glocesterUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  const col = colOf(i);
  if (!col) return null;
  const r = i.units >= 3 ? ROWS.multi : i.units === 2 ? ROWS.two : ROWS.one;
  const cell = cellsOf(COLS, r.q, r.tokens)[col];
  const why: string[] = [];
  let value: Value;
  if (cell === "RETAIL") { value = i.kind === "mixed" ? "allowed" : "prohibited"; why.push("In the Village District an apartment house is allowed only with retail."); }
  else if (r === ROWS.multi && col === "CD" && i.units > 3) { value = "prohibited"; why.push("In the Center District no more than three homes."); }
  else value = plain(cell) ?? "prohibited";
  const at = col === "CD" ? "the Village Overlay's Center District" : col === "VD" ? "the Village Overlay District" : i.zone;
  if (col === "CD" || col === "VD") why.push("The village overlay's own column applies over the base district's.");
  return useFinding({ id: "gl-use", town: "Glocester", what: r.what, zone: at, value, why, src: "glzt", pin: "Attachment 1, Section 2, Residential uses", q: r.q });
}

export function glocesterFindings(i: ProjectInputs): Finding[] {
  const out: Finding[] = [];
  const o = i.overlays ?? [];
  if (o.includes("VD") || o.includes("CD")) {
    out.push({
      id: "gl-village", st: "info", t: `Village Overlay District${o.includes("CD") ? ", Center District" : ""}: the village's own rules apply`,
      p: "The overlay unifies the commercial, agricultural and residential zoning beneath it in Chepachet, for walkable mixed use at a village scale. Its design standards are not read here.",
      src: "glzo", pin: "Article XIII, § 350-106 ff.", q: "The Village Overlay District is broken down into two subdistricts",
      gap: "The Village Overlay District's design and dimensional standards (Article XIII)",
    });
  }
  if (i.kind !== "commercial" && i.units === 2 && ["A-4", "A-3", "R-2"].includes(i.zone)) {
    out.push({
      id: "gl-two", st: i.lot >= 60000 ? "pass" : "flag", t: `Two-family lot: 60,000 sq ft, ${i.lot.toLocaleString("en-US")} entered`,
      p: "A two-family dwelling needs 60,000 sq ft and 175 ft of frontage, with 40 ft front, 60 ft side and 40 ft rear yards, 8% coverage and 35 ft height.",
      src: "glzo", pin: "Chapter 350, Table 1, Dimensional Requirements", q: "Two-family dwelling 60,000 175 40 60 40 8% 35",
    });
  }
  return out;
}

/** What the town lays over state law, registered in ../overlay.ts. Chunk 6, small rural towns (ARD D63): its housing rows, read in place of the Atlas. */
export const RULES: TownRules = {
  use: glocesterUse, moreFindings: (i) => glocesterFindings(i), kinds: GLOCESTER_KINDS,
  // The zoning's general references still point to an Affordable Housing chapter (Ch. 286), repealed on December 7, 2023 (`gl286`).
  inclusionaryNone: { src: "glzo", note: "The zoning's list of general references still points to an Affordable Housing chapter, Chapter 286, which the Town Council repealed on December 7, 2023; the chapter is now reserved." },
};
