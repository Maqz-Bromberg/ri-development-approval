import type { AtlasDistrict, Finding, ProjectInputs, TownRules } from "../../../types";
import { cellsOf, useFinding, type Value } from "../useTable";

/*
 * Foster, read 2026-11-18 from its Zoning Ordinance, Chapter 38 (Municode, saved as a Word file, `fozo`). Chunk 6
 * (ARD D63): a small rural town with no public water or sewer. What it adds:
 *   - districts the Atlas no longer matches: since October 26, 2023 the ordinance has four districts (AR, GB, M, HC2);
 *     the 2024 Atlas still shows six (AR, GBM, MI, NC, R-SC and a municipal district). Since 2026-11-20 the Town's own
 *     zoning map layer (`fozgis`, January 2024) gives the district at a site and draws the map (ARD D78), and GB, HC2
 *     and M are added to the district list, answered from the use table's columns;
 *   - an ordinance that disagrees with itself: the 2023 use table permits multi-family structures as land development
 *     projects in AR, GB and HC2, while § 38-281 (last amended 2010) still asks a special use permit in "AR, NC and GBM";
 *   - very large lots: 300,000 sq ft for each multi-family structure of up to four bedrooms, and 200,000 sq ft for any
 *     other use in AR, GB and HC2 (the Planning Department's dimensional sheet, `fodim`);
 *   - the Zoning Board's own filing rules (`forelief`).
 * Not read: senior citizen group housing, the residential compound.
 */

const COLS = ["AR", "GB", "M", "HC2"] as const;
type Col = (typeof COLS)[number];
const ROW = {
  one: { src: "fozo", q: "1. Single-family detached dwelling Y Y N Y", pin: "§ 38-191, Residential uses 1" },
  multi: { src: "fozo", q: "4. Multi-family dwelling structure (See section 38-281) Y(LAND) Y(LAND) N Y(LAND)", pin: "§ 38-191, Residential uses 4" },
};
const NAME: Record<Col, string> = { AR: "AR", GB: "General Business (GB)", M: "Municipal (M)", HC2: "Highway Commercial 2 (HC2)" };

/** Districts in the Atlas that Foster's ordinance no longer has. */
export const FOSTER_RETIRED = {
  zones: ["GBM", "MI", "NC", "R-SC", "Mixed with Residential"],
  note: "Since October 26, 2023 Foster's ordinance has four districts: AR, GB (general business), M (municipal) and HC2 (highway commercial). The Zoning Atlas still shows the earlier ones. Look up the address: the lookup reads the Town's own zoning map (January 2024) and gives the present district; the official map is the one adopted with the ordinance (§ 38-501).",
};

/** Foster's 2023 districts the Atlas lacks, with the use table's columns in the Atlas's words; their figures are in Foster's own findings. */
const own = (abbrvname: string, name: string, type: string, one: string, multi: string): AtlasDistrict => ({
  abbrvname, name, type, family1_treatment: one, family2_treatment: "", family3_treatment: multi, family4_treatment: multi,
  accessory_treatment: "", affordable_treatment: "", family1_minlotacres: null, family4_minlotacres: null, family4_maxunitsperacre: null,
  family4_maxheightft: null, family4_minparking_1br: null, family4_minparking_2br: null, family4_water_required: null,
});
export const FOSTER_OWN = {
  list: [
    own("GB", "General Business", "Mixed with Residential", "Allowed/Conditional", "Public Hearing"),
    own("HC2", "Highway Commercial 2", "Mixed with Residential", "Allowed/Conditional", "Public Hearing"),
    own("M", "Municipal", "Nonresidential", "Prohibited", "Prohibited"),
  ],
  note: "One of Foster's four districts since October 26, 2023, which the 2024 Zoning Atlas does not have. Its outline is from the Town's zoning map layer (January 2024); what it allows is from the use table (§ 38-191). The Atlas's figures for density, height and parking do not exist for it: Foster's own are given in the findings.",
};

const colOf = (zone: string): Col | null => ((COLS as readonly string[]).includes(zone) ? (zone as Col) : null);

export function fosterUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  const col = colOf(i.zone);
  if (!col) return null;
  const at = NAME[col];
  if (i.units <= 1) {
    const c = cellsOf(COLS, ROW.one.q);
    return useFinding({ id: "fo-use", town: "Foster", what: "Single-family home", zone: at, value: c[col] === "Y" ? "allowed" : "prohibited", src: "fozo", pin: ROW.one.pin, q: ROW.one.q });
  }
  const multi = cellsOf(COLS, ROW.multi.q)[col];
  if (multi === "N") return useFinding({ id: "fo-use", town: "Foster", what: i.units === 2 ? "Two homes in one building" : "Multi-family building", zone: at, value: "prohibited", src: "fozo", pin: ROW.multi.pin, q: ROW.multi.q });
  if (i.units === 2) {
    return useFinding({
      id: "fo-use", town: "Foster", what: "Two homes in one building", zone: at, value: "hearing", flag: true,
      why: ["Foster's table has no two-family row, and the ordinance does not define multi-family, so whether a two-home building is a multi-family structure is not written down. Read here as the stricter: a special use permit, as § 38-281 asks for multi-family."],
      src: "fozo", pin: ROW.multi.pin, q: ROW.multi.q, gap: "Whether Foster treats a two-family building as a multi-family structure: ask the zoning official",
    });
  }
  return useFinding({
    id: "fo-use", town: "Foster", what: "Multi-family building", zone: at, value: "hearing", flag: true,
    why: [`The use table, amended in 2023, permits it as a land development project; § 38-281, unchanged since 2010, says a special use permit or a comprehensive permit, in "AR, NC and GBM"${col === "AR" ? "" : `, districts that do not include ${col}`}. The ordinance disagrees with itself, so the stricter reading is shown: ask the Planning Board which applies.`],
    src: "fozo", pin: ROW.multi.pin, q: ROW.multi.q,
  });
}

export function fosterFindings(i: ProjectInputs): Finding[] {
  const col = colOf(i.zone);
  if (i.kind === "commercial" || !col || col === "M") return [];
  const out: Finding[] = [];
  if (i.units <= 2 && col !== "AR") {
    // In AR the Atlas's own minimum lot (4.6 acres) gives the same figure; GB and HC2 are not in the Atlas.
    out.push({
      id: "fo-dim", st: i.lot >= 200000 ? "pass" : "fail", t: `Lot area: 200,000 sq ft in ${col}, ${i.lot.toLocaleString("en-US")} entered`,
      p: `A lot in ${col} needs 200,000 sq ft (about 4.6 acres), 300 ft of frontage and width, 35 ft front and 50 ft side and rear yards, a 30 ft buffer strip at the side and rear, and buildings 35 ft high at most. ${col === "HC2" ? "A single-family home may cover 3% of the lot." : "Buildings may cover 25% of the net buildable area, the lot less its setbacks, buffers and wetlands."} Nothing but a mailbox within 30 ft of the road.`,
      src: "fodim", pin: `Dimensional Regulations, ${col}`, q: "Minimum lot size 200,000 square feet",
    });
  }
  if (i.units >= 2) {
    out.push({
      id: "fo-zbr", st: "info", t: "Foster's relief hearings: file by the first of the month before, and mail the notices yourself",
      p: "A special use permit or variance is heard by the Zoning Board of Review, or by the Planning Board where the project is a land development project under unified review (the form names both). The application is due by the first of the month before the meeting, with a $100 fee and the advertising, stenographer and recording costs; at most three applications are heard a meeting, first come first scheduled, and an incomplete one is rejected. The applicant mails the hearing notice by certified mail to every owner within 200 ft and returns the receipts before the hearing, or the hearing is put off a month. The Board decides within 15 days of the hearing; an appeal goes to Superior Court within 20 days of the decision's recording.",
      src: "forelief", pin: "Zoning Relief, Application Procedure 1 to 4; Hearing Procedures 9 and 10", q: "be filed on or before the first of the month prior to the meeting",
    });
  }
  if (i.units < 3) return out;
  const beds = i.units * 2, lot = 300000 + Math.max(0, Math.min(beds, 10) - 4) * 25000;
  return [
    ...out,
    {
      id: "fo-sup", st: "flag", t: "§ 38-281: a special use permit, or a comprehensive permit, for multi-family housing",
      p: `The Zoning Board decides the special use permit after the Planning Board reviews the site plan and reports. A comprehensive permit for housing with at least 25% low- and moderate-income homes goes to the Planning Board instead. The section names districts (NC and GBM) the ordinance no longer has${col === "AR" ? "" : `, and not ${col}`}.`,
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
  inclusionaryNone: { src: "fozo" }, use: fosterUse, moreFindings: (i) => fosterFindings(i), retired: FOSTER_RETIRED, ownDistricts: FOSTER_OWN,
};
