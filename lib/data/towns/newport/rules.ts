import type { Finding, Flags, ProjectInputs, Step } from "../../../types";
import { cellsOf, plain, useFinding, type Value } from "../useTable";

/*
 * Newport, read 2026-11-19 from Title 17, Zoning (Municode, `nezo`, saved November 18, 2026). Chunk 7 (ARD D67).
 * What it adds:
 *   - the Table of Permitted Uses' housing rows in place of the Atlas's, with its own marks: Y by right, N not, and
 *     S-1 to S-4 a special use permit whose number is the set of criteria in § 17.109.020 it must meet;
 *   - conversions of an existing building to two-family or multi-family homes as rows of their own, used when the
 *     project reuses a building;
 *   - the Urban Village subdistrict (UV), where multi-family homes are permitted by right as up to 35% of a mixed-use
 *     project's floor area, or 50% when half the homes are workforce housing (§ 17.65.020);
 *   - historic district zoning (Chapter 17.80): a certificate of appropriateness from the Historic District Commission
 *     before any exterior work, as a step of its own. The Atlas does not map the historic districts, so the site's
 *     district is a tick on the form (HD).
 * Not read: the density rules of Chapters 17.16 to 17.48 (the table's asterisk), the SUP criteria beyond categories 1
 * and 3, the Commission's own rules and standards, CRMC's harbour rules.
 */

const COLS = ["R-3", "R-10", "R-10A", "R-20", "R-40", "R-40A", "R-60", "R-120", "R-160", "GB", "LB", "WB", "CI", "TM", "UV", "MT", "MK", "OS", "RD"] as const;
type Col = (typeof COLS)[number];
const ROWS = {
  one: { what: "Single-family home", src: "nezo", q: "Dwelling - Single-family dwellings Y Y Y Y Y Y Y Y Y Y Y Y N N N N N N N" },
  two: { what: "Two-family home", src: "nezo", q: "Dwelling - Two-family dwellings Y Y N Y Y N Y Y Y Y Y Y N N N N N N N" },
  multi: { what: "Multifamily building (three homes or more)", src: "nezo", q: "Dwellings - Multifamily dwellings S-1 S-1 N S-1 S-1 N N N N S-3 N S-3 N N N N N N N" },
  conv2: { what: "Conversion to a two-family home", src: "nezo", q: "Dwellings - Conversions to a two-family dwelling* Y Y S-1 Y Y S-1 Y Y Y Y Y Y N N N N N N -" },
  convM: { what: "Conversion to a multi-family building", src: "nezo", q: "Dwellings - Conversions to a multi-family dwelling* S-1 S-1 N S-1 S-1 S-1 S-1 S-1 S-1 N S-3 N N N N N N N N" },
};

export const NEWPORT_UNMAPPED = [
  { abbr: "HD", name: "Historic district (historic district zoning, Chapter 17.80)", where: "The city's Historic District Zoning Map, filed with the City Clerk (§ 17.80.030). Not found as map data." },
];

export function newportUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  if (!(COLS as readonly string[]).includes(i.zone)) return null;
  const col = i.zone as Col;
  const r = i.type === "reuse" && i.units >= 3 ? ROWS.convM : i.type === "reuse" && i.units === 2 ? ROWS.conv2 : i.units >= 3 ? ROWS.multi : i.units === 2 ? ROWS.two : ROWS.one;
  const cell = cellsOf(COLS, r.q)[col];
  const why: string[] = [];
  let value: Value = plain(cell) ?? "prohibited";
  const cat = cell.match(/^S-(\d)$/);
  if (cat) { value = "hearing"; why.push(`The special use permit must meet the criteria of category ${cat[1]} in § 17.109.020: parking, performance and development standards, bicycle parking, sidewalks, no added stormwater runoff and dark-sky lighting among them.`); }
  if (r === ROWS.multi && col === "UV") {
    if (i.kind === "mixed") { value = "allowed"; why.push("In the Urban Village, multi-family homes are permitted by right as up to 35% of a mixed-use project's floor area, or 50% if half the homes are workforce housing (§ 17.65.020)."); }
    else why.push("In the Urban Village, multi-family homes are permitted only as part of a mixed-use project, up to 35% of its floor area (§ 17.65.020).");
  }
  if (r === ROWS.conv2 || r === ROWS.convM) why.push("A conversion is subject to the density rules of the district's own chapter (the table's asterisk), not read here.");
  return useFinding({ id: "ne-use", town: "Newport", what: r.what, zone: i.zone, value, why, src: "nezo", pin: "§ 17.14.020, Table of Permitted Uses, Residential Uses", q: r.q });
}

const inHD = (i: ProjectInputs) => (i.overlays ?? []).includes("HD");
export const newportOverlayFlags = (i: ProjectInputs): Partial<Flags> => ({ historic: inHD(i) });

export function newportOverlay(_i: ProjectInputs, abbr: string): Finding[] | null {
  if (abbr !== "HD") return null;
  return [{
    id: "ne-area-hd", st: "flag", t: "Historic district: a certificate of appropriateness from the Historic District Commission",
    p: "Before any construction, alteration or demolition that affects a building's exterior in a historic district, the Historic District Commission must issue a certificate of appropriateness. The building official issues no permit until it does. New construction must be compatible with the surrounding historic area in size, scale, siting, massing, setback, materials and details.",
    src: "nezo", pin: "§ 17.80.050(A)(3)", q: "The building official shall not issue a building permit until the commission has issued a certificate of appropriateness.",
  }];
}

export const newportCoaStep: Step = {
  id: "coa", title: "Certificate of appropriateness", cond: "historic", app: "Certificate of appropriateness application, filed with the Office of Planning, Zoning, Development and Inspections",
  clock: { days: 45, text: "45 days from filing to decide, or up to 90 with a finding that more study is needed; no decision in time counts as approval" },
  what: "In a historic district, the Historic District Commission approves the design of new construction, alterations and demolition before a building permit is issued. It passes only on exterior features, applying the Newport standards adapted from the Secretary of the Interior's. It may give conceptual approval of a new building's location, size, scale and massing first, with the final details later. Its decisions are in writing, and are appealed to the Zoning Board of Review.",
  auth: [
    { c: "hdc", role: "Decides the certificate; may give conceptual approval of a new building's massing first" },
    { c: "zbr", role: "Hears appeals of the Commission's decisions, on the Commission's record" },
  ],
  objections: ["design"],
  docs: [
    {
      title: "Which work needs a certificate", src: "nezo", pin: "§ 17.80.050(A)(1)", q: "the owner must apply for and receive a certificate of appropriateness from the commission",
      checklist: ["Find whether the site is in a historic district on the city's Historic District Zoning Map", "Painting and ordinary repair that change no design, material or appearance need none (§ 17.80.100)"],
    },
    {
      title: "Filing and completeness", src: "nezo", pin: "§ 17.80.050(B)(1)", q: "Incomplete applications shall be returned to the applicant within seven working days of receipt",
      checklist: ["File with the Office of Planning, Zoning, Development and Inspections", "Bring site plans, elevations and photographs, and what the Commission's rules ask for"],
    },
    {
      title: "Conceptual approval first, for new construction", src: "nezo", pin: "§ 17.80.050(C)(4)", q: "Conceptual approval does not assure that the commission will issue a certificate of appropriateness.",
      checklist: ["Ask for conceptual approval of the location, size, scale and massing", "Then the final details: windows, siding, trim and materials"],
    },
    {
      title: "Standards for new construction", src: "nezo", pin: "§ 17.80.060(C)", q: "shall be compatible with the surrounding historic area in terms of size, scale, siting, massing, setback, materials and details",
      checklist: ["New buildings may read as new and need not imitate an older style (§ 17.80.060(C)(3))", "Demolition of a contributing building that keeps its integrity is not approved (§ 17.80.060(D))"],
    },
    {
      title: "45 days, or it counts as approved", src: "nezo", pin: "§ 17.80.080", q: "is deemed to constitute approval",
      checklist: ["With a finding that more study is needed, the Commission has up to 90 days"],
    },
    {
      title: "Appeal to the Zoning Board of Review", src: "nezo", pin: "§ 17.80.110", q: "shall not substitute its own judgment for that of the commission",
      checklist: ["The Board reverses only for prejudicial procedural error, clear error or a decision the record does not support", "So the case for the design is made at the Commission, on its record"],
    },
  ],
};
