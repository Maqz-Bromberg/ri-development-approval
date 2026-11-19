import RAW from "./towns/records-searched.json";
import { historyFor } from "./history";
import type { Precedent } from "../types";

/*
 * "Read, and none found" (ARD D63, chunk 6). For a town whose records were searched for housing, what was searched
 * (scripts/towns/search_records.py: each planning and zoning board's agendas since 2023 on the state Open Meetings
 * site, and the minutes where an agenda mentioned housing or had no text) and what a person found in the hits. A town
 * with nothing found says so, with the boards and dates searched, which is a result and not a gap. The hits themselves
 * stay in .sources, because minutes name residents (principle 7).
 */

export interface SearchedBody { id: number; name: string; role: string; from: string | null; to: string | null; meetings: number; agendas: number; scans: number; noFiles: number; hits: number }
/** A housing item a person found among the hits: a proposal with homes, not yet read into a recorded project. */
export interface FoundItem { date: string; board: string; what: string; homes?: number; meeting: number }
export interface Searched { town: string; read: string; /** The first date searched: 2023 for the small towns, 2024 for the busy cities (D53 answer 5) */ since: string; bodies: SearchedBody[]; found: FoundItem[]; note?: string }

/** What was found in each town's hits, read by hand on the date given in the town's entry. Empty means none found. */
const FOUND: Record<string, { found: FoundItem[]; note?: string }> = {
  // Read 2026-11-18. A housing item is a proposal with more than one home, a two-family building, or a residential compound.
  // Applicants are named only as businesses (principle 7).
  Foster: {
    found: [
      { date: "2023-04-05", board: "Planning Board", what: "Pre-application for a residential compound (a minor subdivision of single-family lots) on a 30-acre lot", meeting: 1041512 },
      { date: "2024-10-16", board: "Planning Board", what: "Conversion of an existing building into a two-family home", homes: 2, meeting: 1064086 },
    ],
    note: "No multi-family proposal since 2023. Most housing items were the Planning Board's own work on the ordinance: multi-family standards (§ 38-281), residential compounds, low- and moderate-income housing and accessory dwelling units, from 2023 to 2025. The § 38-281 read on this site still has its 2010 text, so whether that work was adopted is not read.",
  },
  Exeter: {
    found: [
      { date: "2023-11-28", board: "Planning Board", what: "Solicity Project, 0 Ten Rod Road (RU-4): comprehensive permit, first 120 homes with at least 25% low- and moderate-income, then 155 to 164 at its third pre-application conference (Jan 27, 2026)", homes: 155, meeting: 1050756 },
      { date: "2025-09-23", board: "Planning Board", what: "Split Rock Mobile Home Park: expansion by 40 homes, half for low- and moderate-income households, recommended to the Town Council (Shoreline Properties, Inc.)", homes: 40, meeting: 1078983 },
      { date: "2026-06-08", board: "Planning Board", what: "Ten Rod Road Neighborhood, between 875 and 919 Ten Rod Road: comprehensive permit pre-application, about 300 homes with at least 30% low- and moderate-income (Crossroad Capital Fund VIII, LLC)", homes: 300, meeting: 1089977 },
      { date: "2026-06-23", board: "Planning Board", what: "Gardner Ridge, 415 Gardner Road (the former Shady Acres Nursing Home, RU-3): comprehensive permit, 20 condominiums in 10 duplexes, preliminary plan hearing; an adaptive reuse scheme was weighed first (MGT410, LLC)", homes: 20, meeting: 1090678 },
    ],
    note: "Three of the four are comprehensive permits, which go to the Planning Board under the state's Low and Moderate Income Housing Act rather than through the use table; the mobile home park's expansion goes to the Town Council.",
  },
  Glocester: {
    found: [
      { date: "2023-01-09", board: "Planning Board", what: "Rural residential compound at 16 Old Quarry Road (A-3), preliminary plan; final approval reported in July 2023", meeting: 1035340 },
      { date: "2023-11-07", board: "Planning Board", what: "Residential compound at 147 Huntinghouse Road (A-4), extension of the master plan approval", meeting: 1049684 },
    ],
    note: "No multi-family proposal since 2023, in the village overlay or elsewhere. Many of the boards' files are scans (42 of the Planning Board's, 36 of the Zoning Board's), which this search cannot read.",
  },
  Hopkinton: {
    found: [
      { date: "2023-01-04", board: "Planning Board", what: "Brushy Brook (Plat 32, many lots): comprehensive permit for 140 homes, a quarter affordable; preliminary plan hearings through 2023, its approval extended in September 2025, final plan application from October 2025", homes: 140, meeting: 1035069 },
      { date: "2023-02-01", board: "Planning Board", what: "Anderson Mixed Use, 916 Main Street: amendment to an approved development plan review (Woodland Ridge, LLC); how many homes is not in the agenda", meeting: 1036513 },
      { date: "2026-03-24", board: "Planning Board", what: "Clarks Falls, 0 Clarks Falls Road (Plat 7, Lots 11 and 14): comprehensive permit for 54 three-bedroom townhouses on a base density of 34; master plan extended in 2023, preliminary plan in 2026", homes: 54, meeting: 1086885 },
      { date: "2023-10-18", board: "Planning Board", what: "Residential compounds: seven lots at 16 Estas Way (final 2025), three lots at 233 Woodville Road, five lots (Twin Pines, LLC), ten lots at Canonchet Woods, a seven-lot compound with a street (2026), and one at 0 Dormar Road (2026)", meeting: 1048560 },
    ],
    note: "Both large proposals are comprehensive permits, as in Exeter and West Greenwich; the use table, which allows multi-family homes only in RFR-80 at 80,000 sq ft a home, is not their route.",
  },
  Richmond: {
    found: [
      { date: "2024-03-26", board: "Planning Board", what: "Richmond Place, 38 Stilson Road: comprehensive permit for 69 homes; waivers in 2024, preliminary plan in December 2024 (CT Properties, LLC)", homes: 69, meeting: 1066535 },
      { date: "2024-07-09", board: "Planning Board", what: "Gardiner Apartments, 102 Kingstown Road: a mixed-use development with a four-unit apartment building; master plan July 2024, preliminary plan October and November 2024 (Shoreline Properties, Inc.)", homes: 4, meeting: 1060340 },
      { date: "2025-07-22", board: "Planning Board", what: "Switch Road Partners, 299 Switch Road: comprehensive permit for eight new lots beside an existing home, with open space; preliminary plan hearings from January to March 2026", homes: 8, meeting: 1076909 },
      { date: "2025-12-09", board: "Planning Board", what: "West Shannock Road, 0 West Shannock Road: comprehensive permit pre-application for 13 single-family homes, a quarter or more affordable (WS Richmond Partners, LLC)", homes: 13, meeting: 1082165 },
      { date: "2026-08-13", board: "Planning Board", what: "Shannock Mill Redevelopment (Plat 10D, Lot 26): pre-application for a mixed-use major land development; how many homes is not in the agenda (Shannock Mill Project, LLC)", meeting: 1092222 },
      { date: "2026-10-13", board: "Planning Board", what: "1146 Main Street: adaptive reuse into eight homes, one deed-restricted affordable, approved by the Town Planner as a minor land development", homes: 8, meeting: 1094368 },
    ],
    note: "Three of the six are comprehensive permits, and one an adaptive reuse approved by staff under the state's 2023 law; only Gardiner Apartments went through the use table's routes.",
  },
  "West Greenwich": {
    found: [
      { date: "2024-10-21", board: "Planning Board", what: "Forest Hill Estates, 9 Nooseneck Hill Road: age-restricted condominiums, first 24 then 23; master plan January 2025, preliminary September 2025, final approved administratively by July 2026", homes: 23, meeting: 1064504 },
      { date: "2025-05-19", board: "Planning Board", what: "The VUE, Centre of New England Boulevard (12.9 acres): comprehensive permit, 333 apartments with 100 affordable; preliminary plan public hearing", homes: 333, meeting: 1074456 },
      { date: "2025-10-20", board: "Planning Board", what: "Lace Mill, 152 Mishnock Road: comprehensive permit, six apartments with three affordable; preliminary plan public hearing (KCMH Properties)", homes: 6, meeting: 1080042 },
      { date: "2025-11-17", board: "Planning Board", what: "Old Vine Estates, off Stubble Brook Road: subdivision of up to ten or eleven homes under inclusionary zoning, with an affordable duplex (Right Built, LLC)", homes: 10, meeting: 1081141 },
      { date: "2025-11-17", board: "Planning Board", what: "Raccoon Hill Townhomes, off Victory Highway: comprehensive permit, 52 affordable rental homes in a first phase and 12 more planned; master plan public hearing (Women's Development Corporation, on land of Rhode Island Housing)", homes: 52, meeting: 1081141 },
      { date: "2026-03-23", board: "Planning Board", what: "Bella View Estates, off Stubble Brook Road: comprehensive permit, 292 three-bedroom condominiums with 73 affordable; master plan public hearing (Soscia Construction Ltd)", homes: 292, meeting: 1086816 },
      { date: "2025-01-27", board: "Planning Board", what: "Residential compounds: a three-lot compound off Victory Highway (2023), Grand View Estates (2023), one at 214 Weaver Hill Road (final, 2025) and Breakheart (final, 2026)", meeting: 1069332 },
    ],
    note: "The busiest of the six: six proposals with homes since late 2024, four of them comprehensive permits, and the first project under the 2025 inclusionary zoning.",
  },
};

type Raw = Record<string, { read: string; since?: string; bodies: SearchedBody[] }>;
export function searchedOf(town: string): Searched | undefined {
  const r = (RAW as Raw)[town];
  const f = FOUND[town];
  return r && f ? { town, read: r.read, since: r.since ?? "2023-01-01", bodies: r.bodies, found: f.found, note: f.note } : undefined;
}

const fmt = (iso: string | null) => (iso ? new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }) : "");
/** "the Planning Board's (Jan 2023 to Nov 2026, 48 meetings) and the Zoning Board's (…)" */
export const searchedLine = (s: Searched) =>
  s.bodies.map((b) => `${b.name} (${b.meetings} meetings, ${fmt(b.from)} to ${fmt(b.to)}${b.scans ? `; ${b.scans} files scans, not read` : ""}${b.noFiles ? `; ${b.noFiles} with nothing filed` : ""})`).join(" and ");

/** The recorded project a found item became, matched by the project's name in the item's description (ARD D64). */
export const readAs = (town: string, f: FoundItem): Precedent | undefined =>
  historyFor(town).find((h) => f.what.toLowerCase().includes(h.name.toLowerCase()));
