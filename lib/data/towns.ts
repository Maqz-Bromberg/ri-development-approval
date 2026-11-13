/*
 * The 39 Rhode Island municipalities and how much of this site is read for each.
 *   1 Zoning only: Atlas district, parcel, utilities, state-law route and statutory clocks.
 *   2 Offices and records: board and office contacts, meeting pattern, where records live.
 *   3 Local steps: checklists, forms and pinpoints read from the town's regulations.
 *   4 Hearings and precedent: minutes read into documented concerns and example projects.
 * Only Cumberland is above level 1. A level is claimed only when it has been read, with a date.
 */
export type Level = 1 | 2 | 3 | 4;

export interface Town {
  name: string;
  county: "Bristol" | "Kent" | "Newport" | "Providence" | "Washington";
  level: Level;
  /** ISO date the town's level was last set, with the reader's note */
  read?: string;
}

const L1 = (county: Town["county"], names: string[]): Town[] => names.map((name) => ({ name, county, level: 1 }));

const ALL: Town[] = [
  ...L1("Bristol", ["Barrington", "Bristol", "Warren"]),
  ...L1("Kent", ["Coventry", "East Greenwich", "Warwick", "West Greenwich", "West Warwick"]),
  ...L1("Newport", ["Jamestown", "Little Compton", "Middletown", "Newport", "Portsmouth", "Tiverton"]),
  ...L1("Providence", ["Burrillville", "Central Falls", "Cranston", "East Providence", "Foster", "Glocester", "Johnston", "Lincoln", "North Providence", "North Smithfield", "Pawtucket", "Providence", "Scituate", "Smithfield", "Woonsocket"]),
  { name: "Cumberland", county: "Providence", level: 4, read: "2026-11-13" },
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
