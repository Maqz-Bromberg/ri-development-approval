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
  // Chunk 7 (ARD D67): the busy cities, searched from 2024. Read 2026-11-19 from the agendas' project headings.
  Pawtucket: {
    found: [
      { date: "2024-02-20", board: "City Planning Commission", what: "71 Dexter Street and 0 Beatty Street: a six-story building with 150 homes and 9,129 sq ft of commercial space; a year's extension of its approval", homes: 150, meeting: 1054157 },
      { date: "2024-02-20", board: "City Planning Commission", what: "258 Pine Street (CT): a mixed-use building with 180 homes, preliminary plan in 2024; a major amendment in December 2025 for more homes on a smaller footprint, and final plan (Rise Above All Properties LLC)", homes: 180, meeting: 1054157 },
      { date: "2024-04-16", board: "City Planning Commission", what: "240 Main Street (CD): a five-story mixed-use building with 20 homes in place of a vacant building", homes: 20, meeting: 1057319 },
      { date: "2024-05-21", board: "City Planning Commission", what: "327 Pine Street (CT): a 136-home building in a 183-home project, development plan review before the Joint Planning Commission", homes: 136, meeting: 1058967 },
      { date: "2024-05-21", board: "City Planning Commission", what: "49 North Union Street: adaptive reuse with commercial space on the ground floor and 27 apartments above", homes: 27, meeting: 1058967 },
      { date: "2025-01-21", board: "City Planning Commission", what: "225 Conant Street (MO): an abandoned mill turned into 42 homes and two commercial spaces, preliminary plan; final plan in May 2025 (Wickstead House LLC)", homes: 42, meeting: 1069146 },
      { date: "2025-03-18", board: "City Planning Commission", what: "125 Goff Avenue: a 140-home building beside an existing 140-home apartment building", homes: 140, meeting: 1071706 },
      { date: "2025-04-15", board: "City Planning Commission", what: "141 Power Road (RS): adaptive reuse of an office building into 17 homes and a small office", homes: 17, meeting: 1073018 },
      { date: "2025-04-15", board: "City Planning Commission", what: "The Paddock, 651 Narragansett Park Drive: comprehensive permit for two apartment buildings and 35 townhouses, 95 homes; pre-application in April 2025, preliminary plan in July 2025", homes: 95, meeting: 1073018 },
      { date: "2025-07-15", board: "City Planning Commission", what: "282 and 310 East Avenue (CG): a mixed-use development with 77 homes and 18,090 sq ft of commercial space, pre-application workshop", homes: 77, meeting: 1076677 },
      { date: "2025-07-15", board: "City Planning Commission", what: "210 Conant Street (CT): adaptive reuse of a former mill storage building, master plan; preliminary plan in August 2025 (179 Conant Realty LLC)", meeting: 1076677 },
      { date: "2025-08-19", board: "City Planning Commission", what: "Pennrose at Tidewater Landing, 177 School Street (RTW, on city land): 72 homes, all affordable, above a parking garage; combined master and preliminary plan in November 2025 (Pennrose LLC)", homes: 72, meeting: 1077713 },
      { date: "2025-09-16", board: "City Planning Commission", what: "180 Weeden Street (CT): adaptive reuse of a former mill, master plan; preliminary plan in December 2025 (180 Weeden St LLC)", meeting: 1078820 },
      { date: "2026-01-06", board: "City Planning Commission", what: "Cameron Street duplexes, 36, 42 and 48 Cameron Street (RT): comprehensive permit for three two-family homes, all affordable, preliminary plan (Justice Assistance Holdings LLC)", homes: 6, meeting: 1083213 },
      { date: "2026-05-19", board: "City Planning Commission", what: "45 Division Street (RTW): 325 rental homes and a garage of about 500 cars, preliminary plan (Wood Partners)", homes: 325, meeting: 1089233 },
      { date: "2026-06-16", board: "City Planning Commission", what: "Nulco Lofts Phase 2, 30 Beecher Street (CT): 120 homes at master plan, 123 at the preliminary plan in November 2026, beside the existing mill lofts (Nulco Lofts LLC, Piccadilly LLC)", homes: 123, meeting: 1089966 },
    ],
    note: "The busiest of the cities read: sixteen proposals with homes since 2024, most of them in Conant Thread and the riverfront districts, several mill conversions, and two comprehensive permits. The Board of Appeals' housing items are dimensional variances, two-family to three-family conversions and use variances in RT.",
  },
  "Central Falls": {
    found: [
      { date: "2024-01-11", board: "Planning Board", what: "4 and 6 School Street: 58 homes on merged lots, preliminary plan (Central Falls Affordable Housing Corporation)", homes: 58, meeting: 1052803 },
      { date: "2024-03-27", board: "Planning Board", what: "79 School Street: a nine-home building with variances for density, height, coverage and setbacks, cut in April 2024 to six homes and 35 feet", homes: 6, meeting: 1056524 },
      { date: "2024-03-27", board: "Planning Board", what: "690 Lonsdale Avenue: a six-home building, preliminary plan with zoning relief", homes: 6, meeting: 1056524 },
      { date: "2024-05-22", board: "Planning Board", what: "37 Ledge Street: a 25-home building with three commercial spaces, master and preliminary plan, through July 2024 (Tabares Bros 3, Inc.)", homes: 25, meeting: 1059094 },
      { date: "2024-11-20", board: "Planning Board", what: "16 to 24 Central Street, 518 and 532 Roosevelt Avenue: a major land development for a mixed-use residential building (Pawtucket Central Falls Development Corp.); how many homes is not in the lines read", meeting: 1065656 },
    ],
    note: "The city's boards have filed nothing on the state site since May 2025, so the search ends there: whatever came after is on the city's own pages, not read. In April 2024 the Planning Board took up the Osram mixed-use special overlay district (OMUSOD), for the mill blocks between Division and Blackstone Streets; it is now Sec. 603 of the ordinance, not read, and not in the Zoning Atlas.",
  },
  Cranston: {
    found: [
      { date: "2024-03-05", board: "Planning Commission", what: "Residences at Oaklawn Ave (B-2 with conditions): a two-story building of 12 homes, preliminary plan", homes: 12, meeting: 1055362 },
      { date: "2024-05-07", board: "Planning Commission", what: "Legion Bowl, 661 Park Avenue (C-3 with conditions): a mixed-use redevelopment with 69 homes over shops, master plan extended in May 2024 and again in June 2026, to July 2028", homes: 69, meeting: 1058176 },
      { date: "2024-06-06", board: "Planning Commission", what: "Itri Commons (C-2): a mixed-use building converted to homes and a new building of six attached single-family homes, with zoning relief", homes: 6, meeting: 1059395 },
      { date: "2025-01-08", board: "Zoning Board", what: "11 Dart Street (A-8): two more homes in an apartment building, for 15 on an undersized lot, with a use variance (Imperial Apartments, LLC)", homes: 15, meeting: 1067905 },
      { date: "2025-03-04", board: "Planning Commission", what: "1388 and 1390 Cranston Street (C-2): a church building redeveloped and four large apartment buildings (N.E Development Fund, 1 LLC)", meeting: 1071076 },
      { date: "2025-03-04", board: "Planning Commission", what: "Cranston Print Works, 1381 Cranston Street: the historic mill buildings turned into mixed-use buildings with 100 homes and 881 self-storage units, preliminary plan in April 2025", homes: 100, meeting: 1071076 },
      { date: "2025-06-03", board: "Planning Commission", what: "Champlin Heights (B-2): 152 multi-family homes with a street extension, preliminary plan extended to June 2027 (Champlin Heights II, LLC)", homes: 152, meeting: 1075059 },
      { date: "2025-11-04", board: "Planning Commission", what: "Independence Way (C-2 and C-4): pre-application for 192 homes with a zone change; master plan in November 2026 for 54 townhouses, conditioned on the zone change (Elsey Holdings LLC)", homes: 54, meeting: 1080526 },
      { date: "2025-12-02", board: "Planning Commission", what: "Scituate Avenue: a multi-family development, preliminary plan with a major amendment (West Bay, LLC); how many homes is not in the agenda", meeting: 1081579 },
      { date: "2026-01-06", board: "Planning Commission", what: "1681 Cranston Street: pre-application for a mixed-use development with homes and a restaurant", meeting: 1083151 },
      { date: "2026-04-07", board: "Planning Commission", what: "Narragansett Blvd Condos (B-2 and EI): pre-application for 19 townhouses", homes: 19, meeting: 1087365 },
      { date: "2026-09-01", board: "Planning Commission", what: "425 Hope Road: comprehensive permit pre-application for 12 homes, three of them deed-restricted affordable, in place of a house", homes: 12, meeting: 1092787 },
    ],
    note: "Twelve proposals with homes since 2024, the largest (Champlin Heights, Cranston Print Works, Legion Bowl) long in review with extensions. Most of both boards' other housing items are two-family homes on undersized lots and conversions to two-family homes. A Mixed-Use Centers and Corridors zoning project was presented in draft in October 2026.",
  },
  "East Providence": {
    found: [
      { date: "2024-04-08", board: "Planning Board", what: "500 Veterans Memorial Parkway (Waterfront District): a mixed-use development, on which the Board advised the Waterfront Commission on consistency with the Comprehensive Plan, in April and December 2024; how many homes is not in the agendas (Metacomet Property LLC)", meeting: 1057027 },
      { date: "2024-10-15", board: "Planning Board", what: "100 Wampanoag Trail (R-3): a former nursing home renovated with a third floor into 44 homes, which needed a use variance; then 26 apartments as an adaptive reuse needing no relief, master plan in November 2024 and preliminary plan in May 2025 (Touchdown Realty Group LLC)", homes: 26, meeting: 1064313 },
      { date: "2025-01-13", board: "Planning Board", what: "Taunton Avenue affordable homes, 330, 350 and 354 Taunton Avenue: conversion into 144 affordable homes with community space, final plan (ONE Neighborhood Builders)", homes: 144, meeting: 1068870 },
      { date: "2025-12-08", board: "Planning Board", what: "1019 to 1029 South Broadway (C-2): a lot with two two-family homes split in two, with a use variance for two-family homes in C-2", homes: 4, meeting: 1082137 },
      { date: "2026-01-12", board: "Planning Board", what: "A 17-home building of one-bedroom apartments with an accessory dwelling unit and parking, preliminary plan as a minor land development (S&D Realty Company, LLC)", homes: 17, meeting: 1083634 },
      { date: "2026-11-09", board: "Planning Board", what: "53 to 55 School Street (R-6): a nonconforming six-home building made seven with an accessory dwelling unit, with a use variance; and 674 North Broadway, a house converted to several homes with a new multi-family building, rescheduled", homes: 7, meeting: 1095576 },
    ],
    note: "Fewer proposals than the other cities, and two of the largest are conversions (a nursing home, and 144 affordable homes on Taunton Avenue). The Waterfront District's projects go to the Waterfront Commission, whose records were not searched; the Planning Board only advises on them. In June 2026 the Board advised the City Council on an amendment to allow attached single-family homes wherever two-family or multi-family homes are allowed.",
  },
  Newport: {
    found: [
      { date: "2024-03-25", board: "Zoning Board", what: "102–108 Girard Avenue (R-10): a special use permit first for 24 homes in four buildings, cut to 16 in three, modified to 18; then a four-home addition to one of the three new buildings, preliminary plan before the Planning Board in late 2025 (NRI 104-108 Girard Partnership)", homes: 22, meeting: 1056348 },
      { date: "2025-03-03", board: "Planning Board", what: "Waites Wharf (Waterfront Business): two hotel buildings and a seven-home multi-family building, with special use permits for both (Harbour Realty, LLC)", homes: 7, meeting: 1071044 },
      { date: "2025-06-02", board: "Planning Board", what: "525 Broadway (R-10): three buildings of 37 one-bedroom homes, with seven more over the line in Middletown, by a category 1 special use permit; amended to two buildings of 38 homes, preliminary plan to May 2026 (525 Broadway LLC)", homes: 38, meeting: 1075117 },
      { date: "2026-06-01", board: "Planning Board", what: "Coggeshall School, 0 Van Zandt Avenue: adaptive reuse of the former school into 26 homes under an agreement with the city, and new homes on three merged lots beside it; final plan by November 2026", homes: 26, meeting: 1089703 },
    ],
    note: "Few new buildings: Newport's housing items are mostly the Zoning Board's, for conversions (two-family to multi-family, a third home in a two-family house) and their parking, in historic neighbourhoods. The Planning Board also reviews demolitions of old houses (a two-family and a multi-family one among them) and certifies the city's housing grant applications.",
  },
  // Chunk 5 (ARD D70), searched from 2023 like the small towns. Applicants named only as businesses or public bodies.
  "New Shoreham": {
    found: [
      { date: "2023-03-22", board: "Zoning Board", what: "West Side Road affordable rentals, Plat 18, Lot 2-3: eight duplexes, sixteen rentals for year-round residents, by special use permit under § 405 (Block Island Housing Board); granted October 2023", homes: 16, meeting: 1040674 },
      { date: "2023-04-26", board: "Zoning Board", what: "The Thomas Property, High Street (Plat 8, Lot 218): two accessory dwelling units for town employees in a new building, by the Town; a modification of the plan in September 2024", homes: 2, meeting: 1042094 },
      { date: "2025-06-25", board: "Zoning Board", what: "149 Old Town Road (Plat 6, Lot 72-2): expansion of a home under a previously approved special use permit for a detached multi-family development, through 2025 (Muddy Paws, LLC)", meeting: 1075977 },
    ],
    note: "Housing on the island comes one or two homes at a time: most items are accessory dwelling units for year-round residents (§ 513), and the Planning Board's own work on the ordinance's accessory dwelling, adaptive reuse and comprehensive permit sections for state law. The one project with more than two homes is the Housing Board's, under § 405. The boards meet the year round; the summer dip is shallow.",
  },
  Warwick: {
    found: [
      { date: "2024-06-12", board: "Planning Board", what: "1187 Post Road (1187 and 1191): 11 homes, master plan with a recommendation to the City Council for a Planned District Residential overlay (2024); preliminary plan in January 2026, demolishing a commercial building", homes: 11, meeting: 1059609 },
      { date: "2024-07-10", board: "Planning Board", what: "One Metro Center Boulevard (Plat 278, Lot 145): scaled back from 214 homes to 78, preliminary plan hearing", homes: 78, meeting: 1060675 },
      { date: "2024-07-10", board: "Planning Board", what: "1515 Centerville Road: 14 homes on a 62,375 sq ft lot in A-7 with the PDR overlay, master plan (2024); preliminary plan for a 14-unit condominium in January 2026", homes: 14, meeting: 1060675 },
      { date: "2024-09-11", board: "Planning Board", what: "Allen property, Centerville Road, beside the YMCA (Plats 241 and 242): pre-application for 150 homes without municipal sewers; master plan approved with conditions in November 2025, with no zoning relief", homes: 150, meeting: 1062728 },
      { date: "2025-04-09", board: "Planning Board", what: "1880 Post Road (Gateway, City Centre Warwick): 177 homes in two buildings, preliminary plan in April 2025 and April 2026", homes: 177, meeting: 1072839 },
      { date: "2025-05-14", board: "Planning Board", what: "9 Post Road (General Business, historic overlay): a mixed-use building with six homes and a café under the PUD overlay, where five are allowed, master plan", homes: 6, meeting: 1074325 },
      { date: "2025-09-10", board: "Planning Board", what: "211 Commonwealth Avenue and College Hill Road: ten homes on 1.87 acres in A-15 with the PDR overlay, preliminary plan", homes: 10, meeting: 1078430 },
      { date: "2025-10-08", board: "Planning Board", what: "85 Toll Gate Road: three homes, one of two existing houses converted to two, with a PDR-L overlay zone change", homes: 3, meeting: 1079513 },
      { date: "2026-02-11", board: "Planning Board", what: "Posnegansett Avenue (Plat 300): seven duplexes, 14 homes, by special use permit, master plan; withdrawn without prejudice in June 2026", homes: 14, meeting: 1084795 },
      { date: "2026-02-11", board: "Planning Board", what: "445 Palmer Avenue: seven duplexes, 14 homes, by special use permit; amended in October and November 2026 to four lots with open space", homes: 14, meeting: 1084795 },
      { date: "2026-04-08", board: "Planning Board", what: "3033 Post Road: multi-family homes at 14 an acre, with a zone change to A-7 PDR and density above what the overlay allows, master plan", meeting: 1087381 },
      { date: "2026-05-13", board: "Planning Board", what: "The former Russell Aldrich Junior High School (Plat 288, Lot 485): advisory opinion to the City Council on a PDR overlay of up to 12 homes an acre, with no development plan yet", meeting: 1088875 },
    ],
    note: "Most of Warwick's proposals for more than two homes go through a zone change to the Planned District Residential overlay, as its use table requires; the two largest are in City Centre Warwick and on Metro Center Boulevard. The Zoning Board's housing items are two-family conversions and accessory dwelling units.",
  },
  Woonsocket: {
    found: [
      { date: "2024-03-12", board: "Zoning Board", what: "256 Privilege Street (R-4): 12 townhouse apartments on a lot 899 sq ft short of the area for 12, where 11 are allowed by right; dimensional variance (CT Renovation & Design, LLC)", homes: 12, meeting: 1055250 },
      { date: "2024-07-16", board: "Planning Board", what: "1067 Mendon Road (rezoned from R-2 to MU-1): a 35-home multi-family building where the district's density allows 15, master plan hearings through 2024; 24 homes at the preliminary plan in March 2025 (D&D Realty Mendon, LLC)", homes: 24, meeting: 1060953 },
      { date: "2024-07-16", board: "Planning Board", what: "60 Mendon Road (R-2), the former Ballou Home for the Aged: a 21-unit condominium approved in 2022, extended in 2024 with a use variance for 21 homes; then an adaptive reuse of the vacant nursing home into 26 apartments, November and December 2025 (EJS Investments, Inc.; Mendon Commons LLC)", homes: 26, meeting: 1060953 },
      { date: "2025-09-16", board: "Planning Board", what: "592 Manville Road (R-3): adaptive reuse of a vacant commercial building into three homes", homes: 3, meeting: 1078724 },
      { date: "2025-12-09", board: "Planning Board", what: "Bernon Mills, 115 and 119 Front Street and 125 Court Street (MU-1): 60 homes, 16 existing and 44 new, with a new ten-home building on Front Street", homes: 44, meeting: 1082239 },
      { date: "2026-02-17", board: "Planning Board", what: "Ballou Townhomes, 129 Ballou Street (R-3): adaptive reuse into 16 one-bedroom townhomes for sale, master plan; 15 apartments at the preliminary plan in May 2026 (LandUse.co, Jacavone Investment Corp.)", homes: 15, meeting: 1085243 },
      { date: "2026-05-14", board: "Planning Board", what: "4th Ave Condominiums, 0 4th Avenue (R-4): a new 15-unit condominium, master plan in May and preliminary plan in October 2026 (JDM Holdings LLC)", homes: 15, meeting: 1089107 },
      { date: "2026-05-14", board: "Planning Board", what: "The Longley Building, 194 Main Street and 0 High Street (C-1): adaptive reuse of a commercial building into shops and apartments, with parking relief; how many homes is not clear from the agendas", meeting: 1089107 },
      { date: "2026-05-14", board: "Planning Board", what: "46 Thomas Street: conversion of a commercial building into 13 apartments, or 11 in a second option, preliminary plan in July 2026 (GMM Realty, LLC)", homes: 11, meeting: 1089107 },
      { date: "2026-11-17", board: "Planning Board", what: "24 Hazel Street (I-1): adaptive reuse of a four-story mill into 49 homes, master plan hearing (LandUse.co, C W Rodrigues Enterprises, LLC)", homes: 49, meeting: 1095968 },
    ],
    note: "Adaptive reuse under the state's 2023 law is Woonsocket's commonest route to new homes: six of the ten, in mills, a nursing home and commercial buildings, several in districts whose use table would not allow them. The Zoning Board's other housing items are mostly variances for two-family homes in R-3 and R-4.",
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
