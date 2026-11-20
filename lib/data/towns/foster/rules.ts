import type { Finding, ProjectInputs, TownRules } from "../../../types";
import { cellsOf, useFinding, type Value } from "../useTable";

/*
 * Foster, read 2026-11-18 from its Zoning Ordinance, Chapter 38 (Municode, saved as a Word file, `fozo`). Chunk 6
 * (ARD D63): a small rural town with no public water or sewer. What it adds:
 *   - districts the Atlas no longer matches: since October 26, 2023 the ordinance has four districts (AR, GB, M, HC2);
 *     the 2024 Atlas still shows six (AR, GBM, MI, NC, R-SC and a municipal district), so only AR is answered here;
 *   - an ordinance that disagrees with itself: the 2023 use table permits multi-family structures as land development
 *     projects in AR, GB and HC2, while § 38-281 (last amended 2010) still asks a special use permit in "AR, NC and GBM";
 *   - very large lots: 300,000 sq ft for each multi-family structure of up to four bedrooms.
 * Not read: the GB and HC2 dimensional rules beyond the table, senior citizen group housing, the residential compound.
 */

const COLS = ["AR", "GB", "M", "HC2"] as const;
const ROW = {
  one: { src: "fozo", q: "1. Single-family detached dwelling Y Y N Y", pin: "§ 38-191, Residential uses 1" },
  multi: { src: "fozo", q: "4. Multi-family dwelling structure (See section 38-281) Y(LAND) Y(LAND) N Y(LAND)", pin: "§ 38-191, Residential uses 4" },
};

/** Districts in the Atlas that Foster's ordinance no longer has. */
export const FOSTER_RETIRED = {
  zones: ["GBM", "MI", "NC", "R-SC", "Mixed with Residential"],
  note: "Since October 26, 2023 Foster's ordinance has four districts: AR, GB (general business), M (municipal) and HC2 (highway commercial). The Zoning Atlas still shows the earlier ones; which district a site is in now needs the Town's official zoning map (§ 38-501).",
};

export function fosterUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  if (i.zone !== "AR") return null;
  if (i.units <= 1) {
    const c = cellsOf(COLS, ROW.one.q);
    return useFinding({ id: "fo-use", town: "Foster", what: "Single-family home", zone: "AR", value: c.AR === "Y" ? "allowed" : "prohibited", src: "fozo", pin: ROW.one.pin, q: ROW.one.q });
  }
  if (i.units === 2) {
    return useFinding({
      id: "fo-use", town: "Foster", what: "Two homes in one building", zone: "AR", value: "hearing", flag: true,
      why: ["Foster's table has no two-family row, and the ordinance does not define multi-family, so whether a two-home building is a multi-family structure is not written down. Read here as the stricter: a special use permit, as § 38-281 asks for multi-family."],
      src: "fozo", pin: ROW.multi.pin, q: ROW.multi.q, gap: "Whether Foster treats a two-family building as a multi-family structure: ask the zoning official",
    });
  }
  return useFinding({
    id: "fo-use", town: "Foster", what: "Multi-family building", zone: "AR", value: "hearing", flag: true,
    why: ["The use table, amended in 2023, permits it as a land development project; § 38-281, unchanged since 2010, says a special use permit or a comprehensive permit, in \"AR, NC and GBM\". The ordinance disagrees with itself, so the stricter reading is shown: ask the Planning Board which applies."],
    src: "fozo", pin: ROW.multi.pin, q: ROW.multi.q,
  });
}

export function fosterFindings(i: ProjectInputs): Finding[] {
  if (i.kind === "commercial" || i.units < 3 || i.zone !== "AR") return [];
  const beds = i.units * 2, lot = 300000 + Math.max(0, Math.min(beds, 10) - 4) * 25000;
  return [
    {
      id: "fo-sup", st: "flag", t: "§ 38-281: a special use permit, or a comprehensive permit, for multi-family housing",
      p: "The Zoning Board decides the special use permit after the Planning Board reviews the site plan and reports. A comprehensive permit for housing with at least 25% low- and moderate-income homes goes to the Planning Board instead. The section names districts (NC and GBM) the ordinance no longer has.",
      src: "fozo", pin: "§ 38-281", q: "Multifamily dwellings are permitted by obtaining a special use permit or a comprehensive permit pursuant to G.L. 1956, ch. 45-53 in the AR, NC and GBM districts.",
    },
    {
      id: "fo-lot", st: beds > 10 ? "flag" : i.lot >= lot ? "pass" : "fail",
      t: beds > 10 ? `Lot area: ${beds} bedrooms is more than one building may have (ten)` : `Lot area: ${lot.toLocaleString("en-US")} sq ft for one building of ${beds} bedrooms, ${i.lot.toLocaleString("en-US")} entered`,
      p: `A building of up to four bedrooms needs 300,000 sq ft (about 6.9 acres), and 25,000 more for each bedroom over four, up to ten; bedrooms are assumed at two a home.${beds > 10 ? " More than ten needs more than one building, each with its own lot area." : ""} Also 400 ft of frontage or more, 100 ft front and rear yards, 20% lot coverage, two stories and 35 ft at most, and two parking spaces a home. Wetlands do not count toward the area. Low- and moderate-income housing may get a bonus of up to eight bedrooms an acre, as RIDEM allows for the soils.`,
      src: "fozo", pin: "§ 38-281(1), (8)", q: "The minimum lot area for each multifamily use dwelling structure shall be 300,000 square feet",
    },
  ];
}

/** What the town lays over state law, registered in ../overlay.ts. Chunk 6, small rural towns (ARD D63): its housing rows, read in place of the Atlas. */
export const RULES: TownRules = {
  inclusionaryNone: { src: "fozo" }, use: fosterUse, moreFindings: (i) => fosterFindings(i), retired: FOSTER_RETIRED,
};
