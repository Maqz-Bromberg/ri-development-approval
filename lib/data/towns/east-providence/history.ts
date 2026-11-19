import type { Precedent } from "../../../types";

/**
 * East Providence's larger housing projects since 2024, followed to a decision through the Planning Board's minutes on
 * the state Open Meetings site, read 2026-11-19 (ARD D68), from the records search of chunk 7 (D67). Map positions:
 * parcels in RIDEM's tax parcel layer by map, block and parcel (centroid); districts from the minutes or the Zoning
 * Atlas. Applicants are named only as businesses or organizations, and residents by role (principle 7).
 */
export const EAST_PROVIDENCE_HISTORY: Omit<Precedent, "events" | "checked" | "town">[] = [
  {
    at: { lat: 41.797525, lon: -71.358591, exact: true }, parcels: ["EP 408-10-24"],
    name: "100 Wampanoag Trail", addr: "100 Wampanoag Trail", lot: "Map 408, Block 10, Parcel 24", zone: "R-3", units: 26, aff: 0, route: "major",
    routeLabel: "Major land development project (adaptive reuse)",
    status: "approved", statusLabel: "Preliminary approved with conditions, 4–0",
    notes: "A former nursing home on 1.5 acres in R-3, where multi-family homes are not allowed. First 44 homes with a third-floor addition, which needed a use variance and dimensional variances; the petitioner asked for the hearing to be continued. It returned as an adaptive reuse of 26 market-rate apartments that met the state's adaptive reuse rules, so no use or dimensional relief was needed. Neighbours, through an attorney, asked for conditions; the master plan was approved with conditions voted one by one, among them peer review of the site plan and traffic study, and the preliminary plan with twelve. By Touchdown Realty Group LLC.",
    src: ["eppb241015", "eppb241120", "eppb250512"],
  },
  {
    at: { lat: 41.821021, lon: -71.365552, exact: true }, parcels: ["EP 306-1-12.1", "EP 306-1-13", "EP 306-1-14"],
    name: "Taunton Avenue affordable homes", addr: "330, 350 and 354 Taunton Avenue", lot: "Map 306, Block 1, Parcels 12.1, 13 & 14", zone: "C-2", units: 144, aff: 144, route: "major",
    routeLabel: "Major land development project",
    status: "approved", statusLabel: "Final approved unanimously",
    notes: "A conversion into 144 affordable homes with community space, by ONE Neighborhood Builders. Its preliminary approval was extended in December 2024, and the Board, which had kept the final plan for itself at the preliminary stage, approved it in January 2025 once the state permits (RIDEM stormwater, a RIDOT physical alteration permit) were in hand.",
    src: ["eppb241209", "eppb250113"],
  },
];
