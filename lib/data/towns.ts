/*
 * The 39 Rhode Island municipalities and how much of this site is read for each.
 *   1 Zoning only: Atlas district, parcel, utilities, state-law route and statutory clocks.
 *   2 Offices and records: board and office contacts, meeting pattern, where records live.
 *   3 Local steps: checklists, forms and pinpoints read from the town's regulations.
 *   4 Hearings and precedent: minutes read into documented concerns and example projects.
 * Cumberland is level 4. Providence is a trial: level 3 across the city, level 4 in one part of it.
 * A level is claimed only when it has been read, with a date.
 */
export type Level = 1 | 2 | 3 | 4;

export interface Town {
  name: string;
  county: "Bristol" | "Kent" | "Newport" | "Providence" | "Washington";
  level: Level;
  /** ISO date the town's level was last set, with the reader's note */
  read?: string;
  /** True while the town's reading is a trial that no person has confirmed */
  trial?: boolean;
  /** What the level leaves out, where the general description of the level would overstate it */
  gaps?: string;
  /**
   * What has been read for commercial and institutional projects, where it differs from level 1 (ARD D31). A town's
   * level above applies to homes; mixed use takes the homes level for its housing and this for its commercial space.
   */
  commercial?: { level: Level; read: string; gaps: string };
  /** Where the town's code of ordinances (and so its zoning) is published, from the Secretary of State's list */
  code?: { url: string; host: string; script: boolean };
  /** A part of the town read to a higher level than the rest. Hearings and precedent are local, so level 4 can cover a neighbourhood. */
  part?: { name: string; level: Level; /** south, west, north, east (WGS84). An approximate box, not an official boundary. */ box: [number, number, number, number]; note: string };
}

const L1 = (county: Town["county"], names: string[]): Town[] => names.map((name) => ({ name, county, level: 1 }));

const ALL: Town[] = [
  ...L1("Bristol", ["Barrington", "Bristol", "Warren"]),
  ...L1("Kent", ["Coventry", "East Greenwich", "Warwick", "West Greenwich", "West Warwick"]),
  ...L1("Newport", ["Jamestown", "Little Compton", "Middletown", "Newport", "Portsmouth", "Tiverton"]),
  ...L1("Providence", ["Burrillville", "Central Falls", "Cranston", "East Providence", "Foster", "Glocester", "Johnston", "Lincoln", "North Providence", "North Smithfield", "Pawtucket", "Scituate", "Smithfield", "Woonsocket"]),
  {
    name: "Cumberland", county: "Providence", level: 4, read: "2026-11-13",
    commercial: {
      level: 3, read: "2026-11-14",
      gaps: "Read: the use table (Table 1) for the short list of uses, parking by use (§ 14-3, amended April 2026), and lot, yard, coverage and height rules for C-1, C-2, I-1 and I-2 (§ 5-3). The steps and checklists come from regulations that cover all land development, though they were read with housing in mind. Not read: loading, signs and design standards, the overlay districts' own rules, and no commercial hearings or projects.",
    },
  },
  {
    name: "Providence", county: "Providence", level: 3, read: "2026-11-13", trial: true,
    commercial: {
      level: 3, read: "2026-11-14",
      gaps: "Read: the city's floor-area lines for land development, Table 12-1's rows for retail, office, restaurants, light industry and four institutional uses, parking (Table 14-1 and its exemptions), loading, and heights and setbacks for the commercial, downtown, institutional, industrial and waterfront districts. Not read: setbacks for non-residential uses in residential districts, the design standards, and no commercial hearings or projects.",
    },
    gaps: "Read from the Land Development and Subdivision Review Regulations, the City Plan Commission's forms, and the Zoning Ordinance of July 2026 for its use table, heights, parking and review thresholds. Setbacks, coverage and design standards were not read, and no one at the city has confirmed any of it.",
    part: {
      name: "Fox Point and Wayland", level: 4, box: [41.8125, -71.4045, 41.8305, -71.376],
      note: "City Plan Commission records from 2023 to 2026 were read for five projects here. The box is an approximation drawn around them, not the city's neighbourhood boundary.",
    },
  },
  ...L1("Washington", ["Charlestown", "Exeter", "Hopkinton", "Narragansett", "New Shoreham", "North Kingstown", "Richmond", "South Kingstown", "Westerly"]),
];
/*
 * Each town's code of ordinances, as the Secretary of State lists it (sos.ri.gov, Open Government Center, municipal
 * ordinances), read 2026-11-14. `script` is whether the host answers a script: eCode360 and ClerksHQ do; Municode and
 * American Legal refuse (403), so those are saved by hand. ClerksHQ builds its contents in the browser, so a town's
 * zoning file has to be found once by hand there.
 */
const MUNI = (t: string) => ({ url: `https://library.municode.com/ri/${t}/codes/code_of_ordinances`, host: "Municode", script: false });
const ECODE = (c: string) => ({ url: `https://ecode360.com/${c}`, host: "eCode360", script: true });
const CHQ = (t: string) => ({ url: `https://clerkshq.com/${t}-ri`, host: "ClerksHQ", script: true });
const CODE: Record<string, Town["code"]> = {
  Barrington: ECODE("BA1328"), Bristol: MUNI("bristol"), Burrillville: MUNI("burrillville"), "Central Falls": MUNI("central_falls"),
  Charlestown: ECODE("CH1115"), Coventry: ECODE("CO1733"), Cranston: MUNI("cranston"), Cumberland: ECODE("CU3602"),
  "East Greenwich": ECODE("EA2109"), "East Providence": MUNI("east_providence"), Exeter: MUNI("exeter"), Foster: MUNI("foster"),
  Glocester: ECODE("GL2062"), Hopkinton: MUNI("hopkinton"), Jamestown: MUNI("jamestown"), Johnston: ECODE("JO1987"),
  Lincoln: ECODE("LI1805"), "Little Compton": ECODE("LI4093-DIV-02"),
  Middletown: { url: "https://codelibrary.amlegal.com/codes/middletown/latest/overview", host: "American Legal", script: false },
  Narragansett: MUNI("narragansett"), Newport: MUNI("newport"), "New Shoreham": CHQ("newshoreham"), "North Kingstown": MUNI("north_kingstown"),
  "North Providence": CHQ("northprovidence"), "North Smithfield": { url: "https://www.nsmithfieldri.org/town-charter-ordinances", host: "the town's website", script: true },
  Pawtucket: ECODE("PA1467"), Portsmouth: ECODE("PO2650"), Providence: MUNI("providence"), Richmond: CHQ("richmond"),
  Scituate: MUNI("scituate"), Smithfield: ECODE("SM2013"), "South Kingstown": MUNI("south_kingstown"), Tiverton: MUNI("tiverton"),
  Warren: MUNI("warren"), Warwick: { url: "https://www.warwickri.gov/city-council-legislative-department/pages/code-ordinances", host: "the city's website", script: true },
  "West Greenwich": ECODE("WE3645"), "West Warwick": MUNI("west_warwick"), Westerly: ECODE("WE1997"), Woonsocket: CHQ("woonsocket"),
};
/** Level 1 towns whose zoning has been partly read from the ordinance, ahead of their steps. */
const PARTLY: Record<string, Partial<Town>> = {
  Charlestown: {
    read: "2026-11-14",
    gaps: "Zoning partly read from the ordinance (Chapter 218): the Land Use Table for housing and the short list of other uses, with the Groundwater Protection overlay's column, and the Mixed-Use Zoning Overlay's density and affordability rule. Read to scope what such a town changes in the design. Not read: the dimensional table, the other overlays' rules, the steps, offices and hearings.",
    commercial: { level: 1, read: "2026-11-14", gaps: "The Land Use Table's rows for the short list of uses are read, with the Groundwater Protection overlay's column. Not read: the town's own review lines, dimensions, parking, steps and hearings." },
  },
};
export const TOWNS: Town[] = ALL.map((t) => ({ ...t, ...PARTLY[t.name], code: CODE[t.name] })).sort((a, b) => a.name.localeCompare(b.name));

export const LEVELS: Record<Level, { name: string; has: string; lacks: string }> = {
  1: { name: "Zoning only", has: "The Zoning Atlas district, parcel and utilities, the approval route under state law, and the statutory review clocks.", lacks: "This town's checklists, forms, fees, notice rules, office contacts and meeting calendar have not been read." },
  2: { name: "Offices and records", has: "Level 1, plus the town's boards and offices and where its records are published.", lacks: "Local checklists and forms have not been read." },
  3: { name: "Local steps", has: "Level 2, plus checklists and forms read from the town's regulations.", lacks: "Hearing records have not been read into documented concerns." },
  4: { name: "Hearings and precedent", has: "Level 3, plus hearing minutes read into documented concerns and example projects.", lacks: "" },
};

export function townInfo(name: string): Town {
  return TOWNS.find((t) => t.name === name) ?? { name, county: "Providence", level: 1 };
}

/** True when the town's rules have been read into this site beyond state law. */
export const hasLocalRules = (town: string) => townInfo(town).level >= 3;

/**
 * The level that applies to a site. Inside a town's better-read part it is the part's level.
 * `inPart` is null when the town has such a part but the site's position is unknown (a hand-entered project).
 */
/** What has been read for a kind of project in a town: its level, what it leaves out, and whether it is on trial. */
export function coverageFor(town: string, kind: "homes" | "mixed" | "commercial"): { level: Level; gaps?: string; trial?: boolean } {
  const t = townInfo(town);
  if (kind !== "commercial") return { level: t.level, gaps: t.gaps, trial: t.trial };
  return t.commercial
    ? { level: t.commercial.level, gaps: t.commercial.gaps, trial: t.trial }
    : { level: 1, gaps: "Only the state's review lines and the state-law steps apply. This town's use table, its own lines and its regulations have not been read for non-residential projects." };
}

export function levelAt(town: string, lat?: number, lon?: number): { level: Level; inPart: boolean | null } {
  const t = townInfo(town);
  if (!t.part) return { level: t.level, inPart: false };
  if (lat === undefined || lon === undefined) return { level: t.level, inPart: null };
  const [s, w, n, e] = t.part.box;
  const inside = lat >= s && lat <= n && lon >= w && lon <= e;
  return { level: inside ? t.part.level : t.level, inPart: inside };
}
