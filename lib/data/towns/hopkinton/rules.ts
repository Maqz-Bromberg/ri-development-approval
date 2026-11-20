import type { Finding, ProjectInputs, TownRules } from "../../../types";
import { cellsOf, plain, useFinding, type Value } from "../useTable";
import { COMP_STATUS, COMP_STEPS } from "../comp-steps";

/*
 * Hopkinton, read 2026-11-18 from its Zoning Ordinance (Municode, saved as a Word file, `hozo`). Chunk 6 (ARD D63).
 * What it adds:
 *   - multi-family homes permitted by right only in the rural district (RFR-80), at 80,000 sq ft a home;
 *   - inclusionary zoning repealed but still cited: § 5.3 is "Reserved", while the affordable housing fund (§ 5.4)
 *     still takes fees "under the Town of Hopkinton Inclusionary Zoning Ordinance (Section 5.3)".
 * The Atlas's R-1 is the ordinance's RES-1. The special districts (RS, CS, MS) follow each parcel's own zone change
 * and are not answered here. Not read: the aquifer overlay's permits, cluster development, dimensions beyond lot size.
 */

const COLS = ["RFR-80", "RES-1", "NB", "C", "M", "EGD", "AQP", "AQS"] as const;
type Col = (typeof COLS)[number];
const ATLAS: Record<string, Col> = { "RFR-80": "RFR-80", "R-1": "RES-1", NB: "NB", C: "C" };
const ROWS = {
  one: { what: "Single-family home", src: "hozo", q: "01 Single Family P P P N N N P P" },
  two: { what: "Two-family home", src: "hozo", q: "02 Two Family P N P N N N P P" },
  multi: { what: "Multi-family building", src: "hozo", q: "03 Multi Family P N N N N N P P" },
};

export function hopkintonUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  const col = ATLAS[i.zone];
  if (!col) return null;
  const r = i.units >= 3 ? ROWS.multi : i.units === 2 ? ROWS.two : ROWS.one;
  const value = plain(cellsOf(COLS, r.q)[col]) ?? "prohibited";
  return useFinding({ id: "ho-use", town: "Hopkinton", what: r.what, zone: i.zone, value, why: i.zone === "R-1" ? ["The Atlas's R-1 is the ordinance's RES-1."] : [], src: "hozo", pin: "Section 5, District use regulations, table: Residential", q: r.q });
}

export function hopkintonFindings(i: ProjectInputs): Finding[] {
  const out: Finding[] = [];
  if (i.kind !== "commercial" && i.units >= 2) {
    const need = i.units * 80000;
    out.push({
      id: "ho-lot", st: i.lot >= need ? "pass" : "fail", t: `Lot area: ${need.toLocaleString("en-US")} sq ft for ${i.units} homes (80,000 a home), ${i.lot.toLocaleString("en-US")} entered`,
      p: "For two-family and multi-family buildings the minimum lot is the number of homes times 80,000 sq ft, about 1.8 acres a home.",
      src: "hozo", pin: "Section 6, Dimensional regulations, note 6", q: "For two-family and multifamily dwellings, the minimum lot size shall be determined by multiplying the number of units by eighty thousand (80,000) square feet.",
    });
    out.push({
      id: "ho-inclusionary", st: "info", t: "Inclusionary zoning: repealed, though still cited",
      p: "The section for inclusionary zoning (5.3) is reserved, so no affordable share is required by it; but the Affordable Housing Fund (5.4) still names fees paid under it. Whether a share or a fee is asked under the subdivision regulations or another rule is not read.",
      src: "hozo", pin: "Sections 5.3 and 5.4", q: "Hopkinton Inclusionary Zoning Ordinance (Section 5.3)",
      gap: "Whether Hopkinton asks an affordable share or a fee in lieu anywhere since § 5.3 was repealed: ask the Planning Department",
    });
  }
  return out;
}

/** What the town lays over state law, registered in ../overlay.ts. Chunk 6, small rural towns (ARD D63): its housing rows in place of the Atlas, and its comprehensive permit route (D65). */
export const RULES: TownRules = {
  steps: { comp: COMP_STEPS.Hopkinton }, routeStatus: COMP_STATUS, use: hopkintonUse, moreFindings: (i) => hopkintonFindings(i),
};
