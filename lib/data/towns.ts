import { bodiesOf, bodiesRead, primaryBody } from "./bodies";

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
    parts: [{
      name: "Fox Point and Wayland",
      marks: { hearings: { read: "2026-11-13", note: "City Plan Commission records from 2023 to 2026 were read for five projects here." } },
      box: [41.8125, -71.4045, 41.8305, -71.376],
      reason: "Drawn around the five projects whose records were read.",
      note: "The box is an approximation drawn around them, not the city's neighbourhood boundary.",
    }],
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

function build(name: string, county: Town["county"]): Town {
  const r = READ[name];
  const marks: Marks = { ...r?.marks };
  if (!marks.offices) { const o = officesFromState(name); if (o) marks.offices = o; }
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
