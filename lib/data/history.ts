import type { Precedent } from "../types";

/** Cumberland multifamily items from Planning Board agendas, minutes and staff memos. Outcomes only where a source states them. */
export const HISTORY: Precedent[] = [
  {
    name: "Haley's Commons", addr: "75 Manville Hill Road", lot: "AP 54 Lots 7 & 8", zone: "R-1", units: 10, aff: 3, route: "comp",
    routeLabel: "Major land development / comprehensive permit",
    record: ["Jun 27, 2024: pre-application", "Jun 26 to Aug 28, 2025: preliminary hearing continued", "Sep 25, 2025: preliminary plan approved 7–2"],
    status: "approved", statusLabel: "Preliminary approved 7–2",
    notes: "Ten for-sale units, three affordable, in R-1. Adjustments for multi-household use, density (18 units per acre against about 15 nearby), setbacks, lot coverage and a 6-ft parking setback. An abutter's opposition was withdrawn after the applicant dropped the height waiver and back decks and added an opaque fence and trees. Sewer backflow preventers were added. Approved with the five staff conditions.",
    src: ["pb240627", "min250731", "min250925", "vid250925"],
  },
  {
    name: "475 Mendon Road", addr: "475 Mendon Road", lot: "AP 14 Lot 14", zone: "C-1", units: 9, aff: 5, route: "comp",
    routeLabel: "Major land development / comprehensive permit",
    record: ["Jun 26 & Jul 31, 2025: pre-application"],
    status: "pending", statusLabel: "Pre-application",
    notes: "First proposed as 12 units with 3 affordable, revised to one 9-unit building beside an existing apartment building. Affordable share set at 25% of the 20 combined units (5). It meets 40% lot coverage, with 18 parking spaces and a surface drainage basin. The board raised greenery, emergency access and screening along Old Mendon Road.",
    src: ["pb250731", "min250731", "vid250731"],
  },
  {
    name: "Blackstone Residences", addr: "618 Broad Street", lot: "AP 11 Lot 69", zone: "C-1", units: 16, aff: 4, route: "comp",
    routeLabel: "Major land development / comprehensive permit",
    record: ["Certified complete Aug 22, 2025", "Sep 25, 2025: master plan hearing (part I)"],
    status: "pending", statusLabel: "Master plan heard",
    notes: "Cut from 21 to 16 units and from 63% to 39.9% lot coverage, as a cottage cluster of 3-bedroom townhomes. The 35,580 sq ft lot allows 7 units by right, so five adjustments are sought. Density is 19.5 units per acre against about 27 in the nearby mill housing. Staff recommended approval with 99-year deed restrictions and Fire Department sign-off.",
    src: ["pb250925", "min250925"],
  },
  {
    name: "The Homes at Waterman Pond", addr: "106 & 110 Bear Hill Road", lot: "AP 17 Lots 21 & 14", zone: "R-3", units: 18, aff: 0, route: "major",
    routeLabel: "Major land development / conservation development",
    record: ["Oct 21, 2025: Technical Review Committee", "Mar 26, 2026: pre-application", "May 28, 2026: continued at applicant's request", "Jun 25, 2026: master plan hearing"],
    status: "pending", statusLabel: "Master plan hearing",
    notes: "18 two-bedroom condos on 4.26 acres, with about 60% conserved as open space. Upland of 99,486 sq ft would allow 33 units. Parking: 76 spaces against 36 required. The public raised traffic and wetlands/runoff, and the applicant filed a traffic memo. Staff conditions: Water Department letter, sidewalk location, draft conservation easement, and state permit applications.",
    src: ["pb260326", "memoWP", "min260528", "pb260625", "vb2025"],
  },
  {
    name: "Berkeley Mill apartments", addr: "30 Martin Street", lot: "", zone: "BMMU", units: 24, aff: 0, route: "dpr",
    routeLabel: "Administrative review (mill overlay)",
    record: ["Jun 17, 2025: Technical Review Committee", "Jul 1, 2025: approved administratively"],
    status: "administrative", statusLabel: "Approved by staff",
    notes: "24 one-bedroom apartments inside the existing mill, with no new development. The 2018 Berkeley Mill Mixed-Use district allows up to 75 units and 1 parking space per unit instead of 2. A recorded covenant acknowledges the area's industrial character.",
    src: ["min250731"],
  },
  {
    name: "80 Bear Hill Road condominiums", addr: "80 Bear Hill Road", lot: "", zone: "", units: 12, aff: 0, route: "major",
    routeLabel: "Major land development",
    record: ["Apr 2017: master plan approved unanimously (press report)"],
    status: "approved", statusLabel: "Master plan approved",
    notes: "Two 6-unit condominium buildings. Abutters raised traffic and the buffer to existing homes. The source is a newspaper report, not town records.",
    src: ["call2017"],
  },
  {
    name: "Steeple & Stone (St. Patrick Church)", addr: "295 & 305 Broad Street", lot: "AP 4 Lots 266 & 264", zone: "C-1", units: 60, aff: 60, route: "comp",
    routeLabel: "Major land development / comprehensive permit",
    record: ["Jan 2023: preliminary plan approved, 44 units", "Sep 25, 2025: pre-application for 60 units", "Dec 4, 2025: revised preliminary hearing"],
    status: "pending", statusLabel: "Revision heard",
    notes: "100% affordable rental, deed-restricted for 99 years: 21 units in the church and 39 in a new 3-storey building. 61 parking spaces for 73 bedrooms, against 69 in the 44-unit plan. Parking for school pickup and funding were raised. Bond: $186,942.",
    src: ["min250925", "pb251204", "vid251204"],
  },
  {
    name: "AJ Home Addition", addr: "50 Oakwood Avenue", lot: "AP 9 Lot 287", zone: "R-2", units: 4, aff: 2, route: "minor",
    routeLabel: "Minor land development / comprehensive permit",
    record: ["Sep 25, 2025: pre-application"],
    status: "pending", statusLabel: "Pre-application",
    notes: "Adds a two-family building beside an existing two-family house.",
    src: ["pb250925"],
  },
];
