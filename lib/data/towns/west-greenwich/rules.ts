import type { Finding, ProjectInputs, TownRules } from "../../../types";
import { cellsOf, plain, useFinding, type Value } from "../useTable";
import { COMP_STATUS, COMP_STEPS } from "../comp-steps";

/*
 * West Greenwich, read 2026-11-18 from its Zoning Ordinance, Chapter 400 (eCode360, `wgzo`) and its Zoning Use
 * Categories (Attachment 1, `wgzt`). Chunk 6 (ARD D63). What it adds:
 *   - inclusionary zoning (Article XXV, added February 12, 2025): 15% affordable at five or more homes or lots, rounded
 *     up, one market-rate bonus home for each affordable one, no fee in lieu; conservation design developments exempt;
 *   - two-family homes allowed only on large or served lots: 4 acres with 2 buildable in RFR-2, 1.25 buildable acres
 *     and public water in RFR-1;
 *   - multi-family homes by special use permit in Highway Business, and permitted in the Senior Village District.
 * The Atlas's SMD is the table's Exit 7 district, IA and IB its Industrial A and B. Not read: the dimensional rules
 * beyond the two-family note, the Senior Village District's rules, conservation design development.
 */

const COLS = ["RFR-2", "RFR-1", "OSPL", "NB", "HB", "EX7", "INDA", "INDB", "CZD", "SVD"] as const;
type Col = (typeof COLS)[number];
const ATLAS: Record<string, Col> = { "RFR-2": "RFR-2", "RFR-1": "RFR-1", OSPL: "OSPL", NB: "NB", HB: "HB", SMD: "EX7", IA: "INDA", IB: "INDB", CZD: "CZD", SVD: "SVD" };
const ROWS = {
  one: { what: "Single-family home", src: "wgzt", q: "01 Single-family P P X P P X X X X P" },
  two: { what: "Two-family home", src: "wgzt", q: "02 Two-family P** P** X X X X X X X P" },
  multi: { what: "Multi-family building", src: "wgzt", q: "03 Multifamily X X X X S X X X X P" },
};

export function westGreenwichUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  const col = ATLAS[i.zone];
  if (!col) return null;
  const r = i.units >= 3 ? ROWS.multi : i.units === 2 ? ROWS.two : ROWS.one;
  const cell = cellsOf(COLS, r.q)[col];
  let value = plain(cell) ?? "prohibited";
  const why: string[] = [];
  if (cell === "P**") {
    if (col === "RFR-1" && !i.water) { value = "prohibited"; why.push("In RFR-1 a two-family home needs public water, and this site has none entered."); }
    else why.push(col === "RFR-2" ? "In RFR-2 the lot must be at least 4 acres, 2 of them buildable." : "In RFR-1 the lot must have 1.25 buildable acres and public water.");
  }
  if (col === "SVD" && r !== ROWS.one) why.push("The Senior Village District's own rules are not read here.");
  return useFinding({ id: "wg-use", town: "West Greenwich", what: r.what, zone: i.zone, value, why, src: "wgzt", pin: "Attachment 1, Residential uses", q: r.q });
}

/** § 400-217: 15% of the homes at five or more, rounded up. */
export const westGreenwichInclusionary = (units: number) => (units >= 5 ? Math.ceil(units * 0.15) : 0);

export function westGreenwichFindings(i: ProjectInputs): Finding[] {
  if (i.kind === "commercial" || i.units < 5) return [];
  const need = westGreenwichInclusionary(i.units);
  return [
    {
      id: "wg-inclusionary", st: i.aff >= need ? "pass" : "fail", t: `Inclusionary zoning: ${need} of ${i.units} homes must be affordable, ${i.aff} entered`,
      p: `Five or more new homes or lots need 15% affordable, rounded up, built before or with the market-rate homes and in the same style; they may be accessory dwelling units, or built off site if the Planning Board allows. A conservation design development is exempt. Paying a fee instead is not allowed.`,
      src: "wgzo", pin: "§§ 400-216, 400-217", q: "at least 15% of the units proposed for the project must qualify as affordable housing",
    },
    {
      id: "wg-inclusionary-bonus", st: "info", t: `Density bonus: ${need} more market-rate home${need === 1 ? "" : "s"} for the affordable ones`,
      p: "One market-rate home is added for each affordable one, with the lot area per home reduced to fit them, and dimensional variances available for the bonus. Off-site units lose the bonus.",
      src: "wgzo", pin: "§ 400-220", q: "Payment of fees in lieu of development shall be prohibited.",
    },
  ];
}

export const westGreenwichAffordableLines = (i: ProjectInputs) => (i.kind !== "commercial" && i.units >= 5 ? [{ short: "15%: West Greenwich inclusionary zoning", what: "Five or more homes or lots need 15% affordable, rounded up, with one bonus market-rate home for each; no fee in lieu.", src: "wgzo", need: westGreenwichInclusionary(i.units) }] : []);

/** What the town lays over state law, registered in ../overlay.ts. Chunk 6, small rural towns (ARD D63): its housing rows in place of the Atlas, and its comprehensive permit route (D65). */
export const RULES: TownRules = {
  steps: { comp: COMP_STEPS["West Greenwich"] }, routeStatus: COMP_STATUS, use: westGreenwichUse, moreFindings: (i) => westGreenwichFindings(i), inclusionaryRead: true, affordableLines: westGreenwichAffordableLines,
};
