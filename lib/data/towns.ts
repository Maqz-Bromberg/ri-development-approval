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
  /** A part of the town read to a higher level than the rest. Hearings and precedent are local, so level 4 can cover a neighbourhood. */
  part?: { name: string; level: Level; /** south, west, north, east (WGS84). An approximate box, not an official boundary. */ box: [number, number, number, number]; note: string };
}

const L1 = (county: Town["county"], names: string[]): Town[] => names.map((name) => ({ name, county, level: 1 }));

const ALL: Town[] = [
  ...L1("Bristol", ["Barrington", "Bristol", "Warren"]),
  ...L1("Kent", ["Coventry", "East Greenwich", "Warwick", "West Greenwich", "West Warwick"]),
  ...L1("Newport", ["Jamestown", "Little Compton", "Middletown", "Newport", "Portsmouth", "Tiverton"]),
  ...L1("Providence", ["Burrillville", "Central Falls", "Cranston", "East Providence", "Foster", "Glocester", "Johnston", "Lincoln", "North Providence", "North Smithfield", "Pawtucket", "Scituate", "Smithfield", "Woonsocket"]),
  { name: "Cumberland", county: "Providence", level: 4, read: "2026-11-13" },
  {
    name: "Providence", county: "Providence", level: 3, read: "2026-11-13", trial: true,
    gaps: "Read from the Land Development and Subdivision Review Regulations and the City Plan Commission's forms. The Zoning Ordinance itself was not read, and no one at the city has confirmed any of it.",
    part: {
      name: "Fox Point and Wayland", level: 4, box: [41.8125, -71.4045, 41.8305, -71.376],
      note: "City Plan Commission records from 2023 to 2026 were read for five projects here. The box is an approximation drawn around them, not the city's neighbourhood boundary.",
    },
  },
  ...L1("Washington", ["Charlestown", "Exeter", "Hopkinton", "Narragansett", "New Shoreham", "North Kingstown", "Richmond", "South Kingstown", "Westerly"]),
];
export const TOWNS: Town[] = ALL.sort((a, b) => a.name.localeCompare(b.name));

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
export function levelAt(town: string, lat?: number, lon?: number): { level: Level; inPart: boolean | null } {
  const t = townInfo(town);
  if (!t.part) return { level: t.level, inPart: false };
  if (lat === undefined || lon === undefined) return { level: t.level, inPart: null };
  const [s, w, n, e] = t.part.box;
  const inside = lat >= s && lat <= n && lon >= w && lon <= e;
  return { level: inside ? t.part.level : t.level, inPart: inside };
}
