import { bodiesOf, bodiesRead, primaryBody } from "./bodies";
import { readAs, searchedOf } from "./searched";

/*
 * The 39 Rhode Island municipalities and how much of this site is read for each (ARD D53, chunk 1: four marks).
 *
 * A town (and a part of a town, and each kind of project) carries four marks, each read, partly read, or not read,
 * with a date and a note on what it covers:
 *   zoning    the town's own ordinance: use table, dimensions, parking, overlays, beyond the 2024 Zoning Atlas
 *   offices   its boards and offices, when they meet, and where their records are published
 *   steps     checklists, forms and pinpoints read from the town's regulations
 *   hearings  minutes and recordings read into documented concerns and example projects
 * The levels 1 to 4 are names for the common combinations and are worked out from the marks, never typed:
 *   1 state law and the Atlas; 2 offices; 3 offices and steps; 4 offices, steps and hearings. Zoning is shown beside
 * the level, because a town can have its ordinance read and its steps not (Charlestown, debt 20).
 * A mark is claimed only when it has been read, with a date (principle 9).
 */
export type Level = 1 | 2 | 3 | 4;
export type Mark = "zoning" | "offices" | "steps" | "hearings";
export const MARK_ORDER: Mark[] = ["zoning", "offices", "steps", "hearings"];
export interface MarkRead {
  /** ISO date it was read */
  read: string;
  /** Read in part: the note says what is left */
  partly?: boolean;
  note?: string;
}
export type Marks = Partial<Record<Mark, MarkRead>>;
export type MarkState = "read" | "partly" | "none";

export interface Part {
  name: string;
  /** The part's own marks, where they differ from the town's. The rest are the town's. */
  marks: Marks;
  level: Level;
  /** south, west, north, east (WGS84). An approximate box, not an official boundary. */
  box: [number, number, number, number];
  /** Why the part's edges are where they are (D4): records, a body that takes over review, or access to sources */
  reason: string;
  note: string;
}

export interface Town {
  name: string;
  county: "Bristol" | "Kent" | "Newport" | "Providence" | "Washington";
  marks: Marks;
  /** Worked out from the marks */
  level: Level;
  /** True while the town's reading is a trial that no person has confirmed */
  trial?: boolean;
  /** What the reading leaves out, where the marks' own notes would not say it */
  gaps?: string;
  /**
   * What has been read for commercial and institutional projects (ARD D31). A town's marks above apply to homes;
   * mixed use takes the homes marks for its housing and these for its commercial space.
   */
  commercial?: { marks: Marks; level: Level; gaps: string };
  /** Where the town's code of ordinances (and so its zoning) is published, from the Secretary of State's list */
  code?: { url: string; host: string; script: boolean };
  /** Parts of the town read to a different depth than the rest. Hearings and precedent are local, so a part can be level 4. */
  parts?: Part[];
}

export const MARKS: Record<Mark, { name: string; short: string; has: string; lacks: string }> = {
  zoning: {
    name: "Zoning from the ordinance", short: "Zoning",
    has: "The town's own ordinance is read for the use table, dimensions or parking, so those answers come from it rather than the 2024 Zoning Atlas.",
    lacks: "Zoning comes from the Rhode Island Zoning Atlas (September 2024). The ordinance may have changed since; check it.",
  },
  offices: {
    name: "Boards and records", short: "Boards",
    has: "The town's planning, zoning and governing boards, when they meet, and where their agendas and minutes are filed.",
    lacks: "The town's boards and where they publish records have not been read.",
  },
  steps: {
    name: "Local steps", short: "Steps",
    has: "Checklists, forms and pinpoints read from the town's land development regulations.",
    lacks: "Local checklists, forms, fees and notice rules have not been read. The steps shown are state law.",
  },
  hearings: {
    name: "Hearings and precedent", short: "Hearings",
    has: "Minutes and recordings read into documented concerns and example projects.",
    lacks: "No hearing records have been read into concerns or example projects.",
  },
};

export const LEVELS: Record<Level, { name: string; has: string; lacks: string }> = {
  1: { name: "Zoning only", has: "The Zoning Atlas district, parcel and utilities, the approval route under state law, and the statutory review clocks.", lacks: "This town's checklists, forms, fees, notice rules and office contacts have not been read." },
  2: { name: "Offices and records", has: "Level 1, plus the town's boards, when they meet, and where its records are published.", lacks: "Local checklists and forms have not been read." },
  3: { name: "Local steps", has: "Level 2, plus checklists and forms read from the town's regulations.", lacks: "Hearing records have not been read into documented concerns." },
  4: { name: "Hearings and precedent", has: "Level 3, plus hearing minutes read into documented concerns and example projects.", lacks: "" },
};

export const markState = (m?: MarkRead): MarkState => (!m ? "none" : m.partly ? "partly" : "read");

/**
 * Whether a town reaches its level on a mark read only in part (ARD D65): its boards from the state site only, its steps
 * for one route only, its hearings for some cases only. The level counts a mark read in part; the keys say how many.
 */
export const levelInPart = (t: { level: Level; marks: Marks }): boolean =>
  (["offices", "steps", "hearings"] as Mark[]).slice(0, t.level - 1).some((m) => markState(t.marks[m]) === "partly");

/** The level a set of marks amounts to. Each level needs the ones below it. */
export function levelOf(m: Marks): Level {
  if (!m.offices) return 1;
  if (!m.steps) return 2;
  return m.hearings ? 4 : 3;
}

/*
 * Level 2 for every town, from the state Open Meetings site (scripts/towns/fetch_bodies.py, ARD D53 chunk 2).
 * It gives the boards, their meeting dates and where minutes are filed, but not the planning office's address or
 * hours, nor the town's own record pages and recordings, so the mark is "partly" unless the town was read by hand.
 */
/*
 * Hearings and precedent from a search of the boards' records for housing (ARD D63): partly read, since what was found
 * is listed but not read into recorded projects, and "none found" is said as a result.
 */
function hearingsFromSearch(name: string): MarkRead | undefined {
  const s = searchedOf(name);
  if (!s) return undefined;
  const n = s.found.length, r = s.found.filter((f) => readAs(name, f)).length;
  return { read: s.read, partly: true, note: `The planning and zoning boards' agendas since ${s.since.slice(0, 4)} were searched for housing: ${n ? `${n} item${n === 1 ? "" : "s"} found and listed on the Records card, ${r ? `${r} read into example projects from the minutes` : "not yet read into example projects"}` : "none found"}. Recordings and the towns' own record pages were not read.` };
}

function officesFromState(name: string): MarkRead | undefined {
  const read = bodiesRead(name);
  if (!read || !primaryBody(name, "planning")) return undefined;
  const roles = new Set(bodiesOf(name).map((b) => b.role));
  const named = ["planning", "zoning", "council", "trc", "historic", "design"].filter((r) => roles.has(r as never)).length;
  return {
    read, partly: true,
    note: `${named} land-use board${named === 1 ? "" : "s"} found on the state Open Meetings site, with when they meet and how their minutes are filed. The planning office's address, hours and the town's own record pages and recordings are not read.`,
  };
}

/** The towns read by hand, beyond what the state site gives. Everything else is the state site, or nothing. */
const READ: Record<string, Omit<Town, "name" | "county" | "level" | "commercial" | "parts"> & { commercial?: { marks: Marks; gaps: string }; parts?: Omit<Part, "level">[] }> = {
  Cumberland: {
    marks: {
      zoning: { read: "2026-11-14", partly: true, note: "Read: parking (§ 14-3, amended April 2026), R-3's area formula, mixed-use density in C-1 and C-2, and the use table for the short list of non-residential uses. Housing types and the other dimensions still come from the Atlas." },
      offices: { read: "2026-11-13" },
      steps: { read: "2026-11-13" },
      hearings: { read: "2026-11-13", note: "Planning Board minutes and recordings from 2024 to 2026, for multifamily projects." },
    },
    commercial: {
      marks: { zoning: { read: "2026-11-14", partly: true, note: "Read: the use table (Table 1) for the short list of uses, parking by use (§ 14-3), and lot, yard, coverage and height rules for C-1, C-2, I-1 and I-2 (§ 5-3). Not read: loading, signs, design standards and the overlay districts' own rules." }, offices: { read: "2026-11-13" }, steps: { read: "2026-11-13", note: "The regulations cover all land development, though they were read with housing in mind." } },
      gaps: "No commercial hearings or projects have been read.",
    },
  },
  Providence: {
    trial: true,
    marks: {
      zoning: { read: "2026-11-14", partly: true, note: "The Zoning Ordinance of July 2026 is read for its use table, heights, parking and review thresholds. Setbacks, coverage and design standards are not read." },
      offices: { read: "2026-11-13" },
      steps: { read: "2026-11-13", note: "From the Land Development and Subdivision Review Regulations and the City Plan Commission's forms." },
      hearings: { read: "2026-11-18", partly: true, note: "City Plan Commission: every case on its agendas since 2023 that gives a number of homes (19 projects), with 150 Pitman Street and 135 Gano Street, read from the staff reports and the minutes; decisions in scanned minutes were read by eye. Not read: commercial cases, and the records of the Zoning Board, the Historic District Commission and the Downtown Design Review Committee." },
    },
    gaps: "No one at the city has confirmed any of it.",
    commercial: {
      marks: {
        zoning: { read: "2026-11-14", partly: true, note: "Read: Table 12-1's rows for retail, office, restaurants, light industry and four institutional uses, parking (Table 14-1 and its exemptions), loading, and heights and setbacks for the commercial, downtown, institutional, industrial and waterfront districts. Not read: setbacks for non-residential uses in residential districts, and the design standards." },
        offices: { read: "2026-11-13" },
        steps: { read: "2026-11-14", note: "The city's floor-area lines for land development." },
      },
      gaps: "No commercial hearings or projects have been read.",
    },
  },
  // Chunk 6, small rural towns (ARD D63): the housing rows of each use table, and what they force.
  Foster: {
    marks: { zoning: { read: "2026-11-18", partly: true, note: "Chapter 38: the use table's housing rows for AR and the multi-family standards (§ 38-281). Not read: the other districts' dimensions, senior citizen group housing, the residential compound." } },
    gaps: "Foster renamed its districts on October 26, 2023 (AR, GB, M, HC2); the Zoning Atlas still shows the earlier ones, so outside AR the district at a site needs the Town's own zoning map. The 2023 use table permits multi-family buildings as land development projects, while § 38-281 still asks a special use permit in districts that no longer exist. The table has no two-family row.",
  },
  Exeter: {
    marks: { zoning: { read: "2026-11-18", partly: true, note: "Appendix A: the use table's housing rows, mixed-use commercial development with its affordable share (§ 4.6). Not read: dimensions, conservation development, the planned village development, adaptive reuse beyond its density." }, steps: { read: "2026-11-19", partly: true, note: "The comprehensive permit route, from the town's own procedure (ARD D65). The other routes are state law." }  },
    gaps: "Apartments are allowed only in a mixed-use commercial development, where § 4.6 and the use table disagree on the business district; a cell reads \"SY\"; footnote 16 points to a section repealed in December 2023. The Planned Village Overlay District is not in the Zoning Atlas.",
  },
  Hopkinton: {
    marks: { zoning: { read: "2026-11-18", partly: true, note: "The district use table's housing rows and the lot area for two-family and multi-family homes. Not read: the aquifer overlay's permits, cluster development, the special districts (RS, CS, MS)." }, steps: { read: "2026-11-19", partly: true, note: "The comprehensive permit route, from the town's own procedure (ARD D65). The other routes are state law." }  },
    gaps: "Inclusionary zoning (§ 5.3) is reserved, but the affordable housing fund (§ 5.4) still takes fees under it.",
  },
  Richmond: {
    marks: { zoning: { read: "2026-11-18", partly: true, note: "Chapter 18.16's housing rows, which split multi-family housing by size (to 4, 12 and 60 homes). Not read: the multi-family standards (§ 18.36.100, Chapters 18.41 and 18.42), dimensions, the aquifer overlay." }, steps: { read: "2026-11-19", partly: true, note: "The comprehensive permit route, from the town's own procedure (ARD D65). The other routes are state law." }  },
  },
  Glocester: {
    marks: { zoning: { read: "2026-11-18", partly: true, note: "The Table of Use Regulations' housing rows, the village overlay (Article XIII) as the column that applies, and the two-family lot. Not read: the village's design standards and the Planned District." } },
    gaps: "The Zoning Atlas draws the Village Overlay District and its Center District as districts; here they are read as the overlays the ordinance makes them.",
  },
  "West Greenwich": {
    marks: { zoning: { read: "2026-11-18", partly: true, note: "Chapter 400: the use table's housing rows, the two-family lot conditions and inclusionary zoning (Article XXV, 2025). Not read: dimensions, the Senior Village District, conservation design development." }, steps: { read: "2026-11-19", partly: true, note: "The comprehensive permit route, from the town's own procedure (ARD D65). The other routes are state law." }  },
  },
  "North Providence": {
    marks: {
      zoning: { read: "2026-11-18", partly: true, note: "Chapter 35, with dates: the use table's housing rows as they stood before 2024 and since, the RL and RG lot areas, adaptive reuse (§ 35-39 Q) and vesting on certification (§ 35-255). Not read: other districts' dimensions, parking, the land development regulations (Chapter 31A), the historic overlay and the flood hazard section." },
    },
    gaps: "North Providence's ordinance is under amendment. The Town's own website posts a compilation of 2014; its code on ClerksHQ (saved by the Town in May 2026) credits the use table's present form to two ordinances five months apart, and does not include the cannabis retail use the Town Council adopted on February 3, 2026 (Ord. 25-022Z), so the official code lags the Council. A Mixed-Use Commercial Corridor Overlay District is before the Town Council (introduced August 18, 2026), with no text or map in its records. The Council replaced the flood hazard section on August 18, 2026 (Ord. 26-014Z), which is not read. The use table permits two-family homes in RL and RG by right while the dimensional table's footnote still asks a special use permit.",
    commercial: {
      marks: {},
      gaps: "Only the housing rows of the use table were read.",
    },
  },
  // Chunk 7, the busy cities (ARD D67): each city's housing rows in place of the Atlas, and what each forces.
  Pawtucket: {
    marks: { steps: { read: "2026-11-19", partly: true, note: "How the city runs its routes, from its board's minutes of 2024 to 2026: who decides, which stages are combined, what is left to staff. Its own land development regulations were not read, and the steps are state law." }, zoning: { read: "2026-11-19", partly: true, note: "Chapter 410: the Table of Use Regulations' housing rows (amended through December 2023), with its mixed residential and commercial row. Not read: dimensions, the development plan review thresholds as a route, the Mill Building Reuse overlay, the riverfront districts' design rules." } },
    gaps: "The table does not allow two-family homes in Commercial Downtown or Conant Thread, where the Zoning Atlas does. Riverfront Tidewater (RTW, 2021) is in the table but not in the Atlas.",
  },
  Cranston: {
    marks: { steps: { read: "2026-11-19", partly: true, note: "How the city runs its routes, from its board's minutes of 2024 to 2026: who decides, which stages are combined, what is left to staff. Its own land development regulations were not read, and the steps are state law." }, zoning: { read: "2026-11-19", partly: true, note: "Title 17 (eCode360): the Table of Principal Use's housing rows, with homes above a ground-floor business. Not read: the B-2 density formula, dimensions, the Mixed Use Planned District." } },
    gaps: "The table, amended in January 2026, allows two-family homes in no A district; the Zoning Atlas shows them in four. Cranston's code is on eCode360, not Municode, where the state's list of codes still points.",
  },
  "East Providence": {
    marks: { steps: { read: "2026-11-19", partly: true, note: "How the city runs its routes, from its board's minutes of 2024 and 2025: who decides, which stages are combined, what is left to staff. Its own land development regulations were not read, and the steps are state law." }, zoning: { read: "2026-11-19", partly: true, note: "Chapter 19: the schedule of use regulations (§ 19-98), the Waterfront District's schedule (§ 19-481) and its inclusionary zoning (§ 19-485). Not read: the multi-family standards (§ 19-216 et seq.), dimensions, the waterfront performance standards." } },
    gaps: "The schedule permits \"mixed-use\" in the commercial districts without saying whether it may include homes; multi-family homes are not allowed in C-3 to C-5, where the Atlas shows a hearing. The stricter reading is shown. The Metacomet waterfront subdistrict is not in the Atlas.",
  },
  Woonsocket: {
    marks: { steps: { read: "2026-11-19", partly: true, note: "How the city runs its routes, from its board's minutes of 2024 to 2026: who decides, which stages are combined, what is left to staff. Its own land development regulations were not read, and the steps are state law." }, zoning: { read: "2026-11-19", partly: true, note: "Appendix C: § 4.4's housing rows, with the table's marks for upper-story and accessory uses. Not read: dimensions, the Downtown Overlay's article." } },
    gaps: "In Urban Commercial (C-1) homes are allowed only above the ground floor, and in MU-2 only as accessory uses; the Zoning Atlas reads both otherwise.",
  },
  Warwick: {
    marks: { steps: { read: "2026-11-19", partly: true, note: "How the city runs its routes, from its board's minutes of 2024 to 2026: who decides, which stages are combined, what is left to staff. Its own land development regulations were not read, and the steps are state law." }, zoning: { read: "2026-11-19", partly: true, note: "Appendix A (Municode): the Table of Use Regulations' housing rows by size of development, with footnotes 1, 3 and 23. Not read: the Planned District Residential overlay (subsection 308), City Centre Warwick's design standards, dimensions." } },
    gaps: "No residential district allows more than two homes on a lot without a zone change to the Planned District Residential overlay. Ten homes fall in two rows of the table, which answer differently in the Village District. Warwick also posts amendments on its own site; whether Municode's text has the latest is not checked.",
  },
  Newport: {
    marks: { steps: { read: "2026-11-19", partly: true, note: "How the city runs its routes, from its board's minutes of 2025 and 2026: who decides, which stages are combined, what is left to staff. Its own land development regulations were not read, and the steps are state law." }, zoning: { read: "2026-11-19", partly: true, note: "Title 17: the Table of Permitted Uses' housing and conversion rows, the special use permit categories, the Urban Village's mixed-use homes (§ 17.65.020), and historic district zoning (Chapter 17.80) as a step of its own. Not read: the districts' density chapters, the Historic District Commission's own rules, CRMC's harbour rules." } },
    gaps: "Newport's historic districts are not in the Zoning Atlas; the Historic District Zoning Map is filed with the City Clerk, and was not found as map data. Whether a site is in one is a tick on the form.",
  },
  "Central Falls": {
    marks: { steps: { read: "2026-11-19", partly: true, note: "How the city runs its routes, from its board's minutes of 2024: who decides, which stages are combined, what is left to staff. Its own land development regulations were not read, and the steps are state law." }, zoning: { read: "2026-11-19", partly: true, note: "Appendix A: Table 1's housing rows and adaptive reuse (§ 304(7)). Not read: dimensions, parking." } },
    gaps: "The Zoning Atlas's CT district has no column in Table 1.",
  },
  Smithfield: {
    marks: { zoning: { read: "2026-11-19", partly: true, note: "The Town's PDF, amended to January 6, 2026: the Table of Uses' housing rows (§ 4.3) and inclusionary zoning (§ 5.10). Not read: the Economic Growth Overlay, R-20MA's uses, the Planned Development district's article, dimensions." } },
    gaps: "The Table of Uses allows two-family homes only in Planned Development and multi-family homes only in R-20M and Planned Development; the Zoning Atlas shows a hearing for them in most residential districts. The table sends R-20MA's uses to § 9.3, which is another district's section.",
  },
  Westerly: {
    marks: {
      zoning: { read: "2026-11-18", partly: true, note: "Chapter 260: the use tables for housing, mixed use and the short list of other uses, with the aquifer zones' columns; inclusionary zoning (§ 260-50.2); multifamily in HDR-6 and HDR-15 (§ 260-63) and on Appendix G's parcels; the Airport Area and Aquifer and Wellhead overlays' review. Not read: the dimensional schedule, the other overlays' rules and the Watch Hill standards." },
    },
    gaps: "Westerly's overlays are not in the Zoning Atlas, so they are ticked by hand. The Town's online GIS shows four of them and the airport's areas, but not the aquifer and wellhead zones or the Salt Pond overlay, and it is a viewer behind a disclaimer, not a service the lookup can ask. Its zoning layer also has an R-6 district, which the ordinance does not; the only R-6 in the ordinance is a 1998 map amendment, so it may be an old label. Westerly has seven fire districts (on the GIS); whether each reviews plans is not read. A Route One Corridor Overlay District with five sub-corridors was heard by the Planning Board in November 2025 and recommended to the Town Council, which heard an update on December 15, 2025; no adoption appears in the council's agendas and minutes on the state site to November 2026, and the ordinance copy read (amended to June 2026) does not have it. Whether it is pending is not read.",
    commercial: {
      marks: { zoning: { read: "2026-11-18", partly: true, note: "The use tables' rows for the short list of uses, with the aquifer zones' columns and the 2,000 sq ft line for shops. Not read: the dimensions, parking and the town's own review lines." } },
      gaps: "Its steps and hearings have not been read.",
    },
  },
  Charlestown: {
    marks: {
      zoning: { read: "2026-11-14", partly: true, note: "Chapter 218: the Land Use Table for housing and the short list of other uses, with the Groundwater Protection overlay's column, and the Mixed-Use Zoning Overlay's density and affordability rule. Not read: the dimensional table and the other overlays' rules." },
    },
    commercial: {
      marks: { zoning: { read: "2026-11-14", partly: true, note: "The Land Use Table's rows for the short list of uses, with the Groundwater Protection overlay's column. Not read: the town's own review lines, dimensions and parking." } },
      gaps: "Its steps and hearings have not been read.",
    },
  },
};

const COUNTY: Record<Town["county"], string[]> = {
  Bristol: ["Barrington", "Bristol", "Warren"],
  Kent: ["Coventry", "East Greenwich", "Warwick", "West Greenwich", "West Warwick"],
  Newport: ["Jamestown", "Little Compton", "Middletown", "Newport", "Portsmouth", "Tiverton"],
  Providence: ["Burrillville", "Central Falls", "Cranston", "Cumberland", "East Providence", "Foster", "Glocester", "Johnston", "Lincoln", "North Providence", "North Smithfield", "Pawtucket", "Providence", "Scituate", "Smithfield", "Woonsocket"],
  Washington: ["Charlestown", "Exeter", "Hopkinton", "Narragansett", "New Shoreham", "North Kingstown", "Richmond", "South Kingstown", "Westerly"],
};

/*
 * Each town's code of ordinances, as the Secretary of State lists it (sos.ri.gov, Open Government Center, municipal
 * ordinances), read 2026-11-14. `script` is whether the host answers a script: eCode360 and ClerksHQ do; Municode and
 * American Legal refuse (403), so those are saved by hand. ClerksHQ builds its contents in the browser, so a town's
 * zoning file has to be found once by hand there.
 */
const MUNI = (t: string) => ({ url: `https://library.municode.com/ri/${t}/codes/code_of_ordinances`, host: "Municode", script: false });
// eCode360 answered scripts until November 2026; on 2026-11-19 it began refusing them (403, a Cloudflare check), so its
// pages are now saved by hand like Municode's (ARD debt 36).
const ECODE = (c: string) => ({ url: `https://ecode360.com/${c}`, host: "eCode360", script: false });
const CHQ = (t: string) => ({ url: `https://clerkshq.com/${t}-ri`, host: "ClerksHQ", script: true });
const CODE: Record<string, Town["code"]> = {
  Barrington: ECODE("BA1328"), Bristol: MUNI("bristol"), Burrillville: MUNI("burrillville"), "Central Falls": MUNI("central_falls"),
  Charlestown: ECODE("CH1115"), Coventry: ECODE("CO1733"), Cranston: ECODE("CR6930"), Cumberland: ECODE("CU3602"),
  "East Greenwich": ECODE("EA2109"), "East Providence": MUNI("east_providence"), Exeter: MUNI("exeter"), Foster: MUNI("foster"),
  Glocester: ECODE("GL2062"), Hopkinton: MUNI("hopkinton"), Jamestown: MUNI("jamestown"), Johnston: ECODE("JO1987"),
  Lincoln: ECODE("LI1805"), "Little Compton": ECODE("LI4093-DIV-02"),
  Middletown: { url: "https://codelibrary.amlegal.com/codes/middletown/latest/overview", host: "American Legal", script: false },
  Narragansett: MUNI("narragansett"), Newport: MUNI("newport"), "New Shoreham": CHQ("newshoreham"), "North Kingstown": MUNI("north_kingstown"),
  "North Providence": CHQ("northprovidence"), "North Smithfield": { url: "https://www.nsmithfieldri.org/town-charter-ordinances", host: "the town's website", script: true },
  Pawtucket: ECODE("PA1467"), Portsmouth: ECODE("PO2650"), Providence: MUNI("providence"), Richmond: CHQ("richmond"),
  Scituate: MUNI("scituate"), Smithfield: { url: "https://www.smithfieldri.gov/home/showpublisheddocument/5628/639283461558730000", host: "the town's website", script: false }, "South Kingstown": MUNI("south_kingstown"), Tiverton: MUNI("tiverton"),
  Warren: { url: "https://library.municode.com/ri/warren/codes/zoning_ordinance", host: "Municode", script: false }, Warwick: MUNI("warwick"),
  "West Greenwich": ECODE("WE3645"), "West Warwick": MUNI("west_warwick"), Westerly: ECODE("WE1997"), Woonsocket: CHQ("woonsocket"),
};

function build(name: string, county: Town["county"]): Town {
  const r = READ[name];
  const marks: Marks = { ...r?.marks };
  if (!marks.offices) { const o = officesFromState(name); if (o) marks.offices = o; }
  if (!marks.hearings) { const h = hearingsFromSearch(name); if (h) marks.hearings = h; }
  const parts = r?.parts?.map((p) => ({ ...p, level: levelOf({ ...marks, ...p.marks }) }));
  const commercial = r?.commercial ? { ...r.commercial, marks: { offices: marks.offices, ...r.commercial.marks }, level: levelOf({ offices: marks.offices, ...r.commercial.marks }) } : undefined;
  return { name, county, ...r, marks, level: levelOf(marks), parts, commercial, code: CODE[name] };
}

export const TOWNS: Town[] = (Object.entries(COUNTY) as [Town["county"], string[]][])
  .flatMap(([county, names]) => names.map((n) => build(n, county)))
  .sort((a, b) => a.name.localeCompare(b.name));

export function townInfo(name: string): Town {
  return TOWNS.find((t) => t.name === name) ?? { name, county: "Providence", marks: {}, level: 1 };
}

/** True when the town's steps have been read into this site beyond state law. */
export const hasLocalRules = (town: string) => !!townInfo(town).marks.steps;

/** The marks that apply to a kind of project: commercial has its own; homes and mixed use take the town's. */
export function marksFor(town: string, kind: "homes" | "mixed" | "commercial"): Marks {
  const t = townInfo(town);
  if (kind !== "commercial") return t.marks;
  return t.commercial?.marks ?? { offices: t.marks.offices };
}

/** What has been read for a kind of project in a town: its level, what it leaves out, and whether it is on trial. */
export function coverageFor(town: string, kind: "homes" | "mixed" | "commercial"): { level: Level; marks: Marks; gaps?: string; trial?: boolean } {
  const t = townInfo(town);
  if (kind !== "commercial") return { level: t.level, marks: t.marks, gaps: t.gaps, trial: t.trial };
  return t.commercial
    ? { level: t.commercial.level, marks: t.commercial.marks, gaps: t.commercial.gaps, trial: t.trial }
    : { level: levelOf(marksFor(town, "commercial")), marks: marksFor(town, "commercial"), gaps: "Only the state's review lines and the state-law steps apply. This town's use table, its own lines and its regulations have not been read for non-residential projects." };
}

/**
 * The part of a town a site falls in, and the level there. `inPart` is null when the town has parts but the site's
 * position is unknown (a hand-entered project).
 */
export function levelAt(town: string, lat?: number, lon?: number): { level: Level; inPart: boolean | null; part?: Part; marks: Marks } {
  const t = townInfo(town);
  if (!t.parts?.length) return { level: t.level, inPart: false, marks: t.marks };
  if (lat === undefined || lon === undefined) return { level: t.level, inPart: null, marks: t.marks };
  const part = t.parts.find(({ box: [s, w, n, e] }) => lat >= s && lat <= n && lon >= w && lon <= e);
  return part ? { level: part.level, inPart: true, part, marks: { ...t.marks, ...part.marks } } : { level: t.level, inPart: false, marks: t.marks };
}

/** A one-line summary of a set of marks, for a tooltip or a list: "Zoning partly · Boards · Steps · no hearings". */
export function marksLine(m: Marks): string {
  return MARK_ORDER.map((k) => {
    const s = markState(m[k]);
    return s === "read" ? MARKS[k].short : s === "partly" ? `${MARKS[k].short} partly` : `no ${MARKS[k].short.toLowerCase()}`;
  }).join(" · ");
}
