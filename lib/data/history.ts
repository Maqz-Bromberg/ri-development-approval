import type { Precedent, Timeline } from "../types";
import TIMELINES from "./timelines.json";
import { PROVIDENCE_HISTORY } from "./towns/providence/history";
import PROVIDENCE_TIMELINES from "./towns/providence/timelines.json";
import { WEST_GREENWICH_HISTORY } from "./towns/west-greenwich/history";
import WEST_GREENWICH_TIMELINES from "./towns/west-greenwich/timelines.json";
import { EXETER_HISTORY } from "./towns/exeter/history";
import EXETER_TIMELINES from "./towns/exeter/timelines.json";
import { HOPKINTON_HISTORY } from "./towns/hopkinton/history";
import HOPKINTON_TIMELINES from "./towns/hopkinton/timelines.json";
import { RICHMOND_HISTORY } from "./towns/richmond/history";
import RICHMOND_TIMELINES from "./towns/richmond/timelines.json";
import { PAWTUCKET_HISTORY } from "./towns/pawtucket/history";
import PAWTUCKET_TIMELINES from "./towns/pawtucket/timelines.json";
import { CRANSTON_HISTORY } from "./towns/cranston/history";
import CRANSTON_TIMELINES from "./towns/cranston/timelines.json";
import { WARWICK_HISTORY } from "./towns/warwick/history";
import WARWICK_TIMELINES from "./towns/warwick/timelines.json";
import { WOONSOCKET_HISTORY } from "./towns/woonsocket/history";
import WOONSOCKET_TIMELINES from "./towns/woonsocket/timelines.json";
import { EAST_PROVIDENCE_HISTORY } from "./towns/east-providence/history";
import EAST_PROVIDENCE_TIMELINES from "./towns/east-providence/timelines.json";
import { NEWPORT_HISTORY } from "./towns/newport/history";
import NEWPORT_TIMELINES from "./towns/newport/timelines.json";
import { CENTRAL_FALLS_HISTORY } from "./towns/central-falls/history";
import CENTRAL_FALLS_TIMELINES from "./towns/central-falls/timelines.json";

/**
 * Cumberland multifamily items from Planning Board agendas, minutes and staff memos. Outcomes only where a source states them.
 * Map positions (`at`): parcels found in RIDEM's tax parcel layer by plat and lot (centroid of the outlines),
 * except Berkeley Mill (the parcel at its street address, 30 Martin Street) and 80 Bear Hill Road
 * (street address point only: four parcels meet there, so none is assumed). Looked up 2026-11-13.
 */
const BASE: Omit<Precedent, "events" | "checked" | "town">[] = [
  {
    at: { lat: 41.975489, lon: -71.465087, exact: true }, parcels: ["CU 054-0007-000", "CU 054-0008-000"],
    name: "Haley's Commons", addr: "75 Manville Hill Road", lot: "AP 54 Lots 7 & 8", zone: "R-1", units: 10, aff: 3, route: "comp",
    routeLabel: "Major land development / comprehensive permit",
    status: "approved", statusLabel: "Preliminary approved 7–2",
    notes: "Ten for-sale units, three affordable, in R-1. Adjustments for multi-household use, density (18 units per acre against about 15 nearby), setbacks, lot coverage and a 6-ft parking setback. An abutter's opposition was withdrawn after the applicant dropped the height waiver and back decks and added an opaque fence and trees. Sewer backflow preventers were added. Approved with the five staff conditions.",
    src: ["pb240627", "min250731", "min250925", "vid250925"],
  },
  {
    at: { lat: 41.920889, lon: -71.408813, exact: true }, parcels: ["CU 014-0014-000"],
    name: "475 Mendon Road", addr: "475 Mendon Road", lot: "AP 14 Lot 14", zone: "C-1", units: 9, aff: 5, route: "comp",
    routeLabel: "Major land development / comprehensive permit",
    status: "pending", statusLabel: "Pre-application",
    notes: "First proposed as 12 units with 3 affordable, revised to one 9-unit building beside an existing apartment building. Affordable share set at 25% of the 20 combined units (5). It meets 40% lot coverage, with 18 parking spaces and a surface drainage basin. The board raised greenery, emergency access and screening along Old Mendon Road.",
    src: ["pb250731", "min250731", "vid250731"],
  },
  {
    at: { lat: 41.915937, lon: -71.403095, exact: true }, parcels: ["CU 011-0069-000"],
    name: "Blackstone Residences", addr: "618 Broad Street", lot: "AP 11 Lot 69", zone: "C-1", units: 16, aff: 4, route: "comp",
    routeLabel: "Major land development / comprehensive permit",
    status: "pending", statusLabel: "Master plan heard",
    notes: "Cut from 21 to 16 units and from 63% to 39.9% lot coverage, as a cottage cluster of 3-bedroom townhomes. The 35,580 sq ft lot allows 7 units by right, so five adjustments are sought. Density is 19.5 units per acre against about 27 in the nearby mill housing. Staff recommended approval with 99-year deed restrictions and Fire Department sign-off.",
    src: ["pb250925", "min250925"],
  },
  {
    at: { lat: 41.946542, lon: -71.393324, exact: true }, parcels: ["CU 017-0021-000", "CU 017-0014-000"],
    name: "The Homes at Waterman Pond", addr: "106 & 110 Bear Hill Road", lot: "AP 17 Lots 21 & 14", zone: "R-3", units: 18, aff: 0, route: "major",
    routeLabel: "Major land development / conservation development",
    status: "pending", statusLabel: "Master plan hearing",
    notes: "18 two-bedroom condos on 4.26 acres, with about 60% conserved as open space. Upland of 99,486 sq ft would allow 33 units. Parking: 76 spaces against 36 required. The public raised traffic and wetlands/runoff, and the applicant filed a traffic memo. Staff conditions: Water Department letter, sidewalk location, draft conservation easement, and state permit applications.",
    src: ["pb260326", "memoWP", "min260528", "pb260625", "vb2025"],
  },
  {
    at: { lat: 41.92692, lon: -71.425776, exact: true }, parcels: ["CU 034-0188-000"],
    name: "Berkeley Mill apartments", addr: "30 Martin Street", lot: "", zone: "BMMU", units: 24, aff: 0, route: "dpr",
    routeLabel: "Administrative review (mill overlay)",
    status: "administrative", statusLabel: "Approved by staff",
    notes: "24 one-bedroom apartments inside the existing mill, with no new development. The 2018 Berkeley Mill Mixed-Use district allows up to 75 units and 1 parking space per unit instead of 2. A recorded covenant acknowledges the area's industrial character.",
    src: ["min250731"],
  },
  {
    at: { lat: 41.945979, lon: -71.394682, exact: false },
    name: "80 Bear Hill Road condominiums", addr: "80 Bear Hill Road", lot: "", zone: "", units: 12, aff: 0, route: "major",
    routeLabel: "Major land development",
    status: "approved", statusLabel: "Master plan approved",
    notes: "Two 6-unit condominium buildings. Abutters raised traffic and the buffer to existing homes. The source is a newspaper report, not town records.",
    src: ["call2017"],
  },
  {
    at: { lat: 41.906706, lon: -71.392487, exact: true }, parcels: ["CU 004-0266-000", "CU 004-0264-000"],
    name: "Steeple & Stone (St. Patrick Church)", addr: "295 & 305 Broad Street", lot: "AP 4 Lots 266 & 264", zone: "C-1", units: 60, aff: 60, route: "comp",
    routeLabel: "Major land development / comprehensive permit",
    status: "pending", statusLabel: "Revision heard",
    notes: "100% affordable rental, deed-restricted for 99 years: 21 units in the church and 39 in a new 3-storey building. 61 parking spaces for 73 bedrooms, against 69 in the 44-unit plan. Parking for school pickup and funding were raised. Bond: $186,942.",
    src: ["min250925", "pb251204", "vid251204"],
  },
  {
    at: { lat: 41.916537, lon: -71.391803, exact: true }, parcels: ["CU 009-0287-000"],
    name: "AJ Home Addition", addr: "50 Oakwood Avenue", lot: "AP 9 Lot 287", zone: "R-2", units: 4, aff: 2, route: "minor",
    routeLabel: "Minor land development / comprehensive permit",
    status: "pending", statusLabel: "Pre-application",
    notes: "Adds a two-family building beside an existing two-family house.",
    src: ["pb250925"],
  },
];

/** Records joined to their dated events. A project with no entry in its town's timelines file fails the build. */
function join(town: string, base: Omit<Precedent, "events" | "checked" | "town">[], timelines: unknown): Precedent[] {
  return base.map((b) => {
    const t = (timelines as Record<string, Timeline>)[b.name];
    if (!t) throw new Error(`No timeline for ${b.name} (${town})`);
    return { town, ...b, ...t };
  });
}

/** Every recorded project, from every town read so far. Each carries its town. */
export const HISTORY: Precedent[] = [
  ...join("Cumberland", BASE, TIMELINES), ...join("Providence", PROVIDENCE_HISTORY, PROVIDENCE_TIMELINES),
  // Comprehensive permit cases in the small towns of chunk 6 (ARD D64).
  ...join("West Greenwich", WEST_GREENWICH_HISTORY, WEST_GREENWICH_TIMELINES), ...join("Exeter", EXETER_HISTORY, EXETER_TIMELINES),
  ...join("Hopkinton", HOPKINTON_HISTORY, HOPKINTON_TIMELINES), ...join("Richmond", RICHMOND_HISTORY, RICHMOND_TIMELINES),
  ...join("Pawtucket", PAWTUCKET_HISTORY, PAWTUCKET_TIMELINES), ...join("Cranston", CRANSTON_HISTORY, CRANSTON_TIMELINES), ...join("Warwick", WARWICK_HISTORY, WARWICK_TIMELINES), ...join("Woonsocket", WOONSOCKET_HISTORY, WOONSOCKET_TIMELINES), ...join("East Providence", EAST_PROVIDENCE_HISTORY, EAST_PROVIDENCE_TIMELINES), ...join("Newport", NEWPORT_HISTORY, NEWPORT_TIMELINES), ...join("Central Falls", CENTRAL_FALLS_HISTORY, CENTRAL_FALLS_TIMELINES),
];

/** The recorded projects of one town. */
export const historyFor = (town: string): Precedent[] => HISTORY.filter((h) => h.town === town);

/** Anchor id for a project's row in the precedent table, also used by the map's project list. */
export function precedentId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
