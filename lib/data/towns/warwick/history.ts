import type { Precedent } from "../../../types";

/**
 * Warwick's larger housing projects since 2024, followed to a decision through the Planning Board's minutes on the state
 * Open Meetings site, read 2026-11-19 (ARD D68), from the records search of chunk 7 (D67). Warwick's minutes are short
 * summaries. Map positions: parcels in RIDEM's tax parcel layer by plat and lot (centroid), or the street point where
 * the parcel was not found; districts from the Zoning Atlas there unless the minutes give one. Applicants are named
 * only as businesses (principle 7).
 */
export const WARWICK_HISTORY: Omit<Precedent, "events" | "checked" | "town">[] = [
  {
    at: { lat: 41.724827, lon: -71.458584, exact: false },
    name: "One Metro Center Boulevard", addr: "One Metro Center Boulevard", lot: "Plat 278 Lot 145", zone: "GI", units: 78, aff: 0, route: "major",
    routeLabel: "Major land development project",
    status: "approved", statusLabel: "Preliminary approved unanimously",
    notes: "78 homes, down from a previous applicant's 200 (the agenda said 214), with a contribution toward repairing Kilvert Street with Public Works. The parcel was not found in RIDEM's layer, so the map point is the street; the Zoning Atlas shows General Industrial there.",
    src: ["wapb240710"],
  },
  {
    at: { lat: 41.747265, lon: -71.426132, exact: true }, parcels: ["WK 296 162", "WK 296 579"],
    name: "1187 Post Road", addr: "1187 and 1191 Post Road", lot: "Plat 296 Lots 162 & 579", zone: "A-7 and GB, to PDR", units: 11, aff: 0, route: "major",
    routeLabel: "Major land development project with a zone change to the PDR overlay",
    status: "approved", statusLabel: "Preliminary approved unanimously",
    notes: "Eleven condominiums in place of a commercial building, which needed a zone change to the Planned District Residential overlay and so the City Council; the Board recommended it. At the preliminary plan the Board praised the layout and design, and no one from the public spoke.",
    src: ["wapb240710", "wapb260114"],
  },
  {
    at: { lat: 41.696776, lon: -71.515642, exact: true }, parcels: ["WK 251 11", "WK 251 12"],
    name: "1515 Centerville Road", addr: "1515 Centerville Road and Legris Avenue", lot: "Plat 251 Lots 11 & 12", zone: "A-7, to PDR", units: 14, aff: 0, route: "major",
    routeLabel: "Major land development project with a zone change to the PDR overlay",
    status: "approved", statusLabel: "Preliminary approved unanimously",
    notes: "Fourteen condominiums on a vacant site, which needed a zone change and so the City Council. At the preliminary plan an abutter raised stormwater, and the approval was conditioned on working out the outfalls with Public Works.",
    src: ["wapb240710", "wapb260114"],
  },
  {
    at: { lat: 41.729832, lon: -71.436044, exact: true }, parcels: ["WK 322 336"],
    name: "1880 Post Road", addr: "1880 Post Road", lot: "Plat 322 Lot 336", zone: "G", units: 177, aff: 0, route: "major",
    routeLabel: "Major land development project (City Centre Warwick, Gateway district)",
    status: "approved", statusLabel: "Preliminary approved; final left to staff",
    notes: "177 homes in two buildings near the airport, approved at the preliminary plan as submitted in April 2025 and again in April 2026, when the Board left the final plan to the administrator. Members welcomed it as affordable housing and asked about soundproofing and lighting with the airport behind it. How many homes are affordable is not in the minutes.",
    src: ["wapb250409", "wapb260408"],
  },
  {
    at: { lat: 41.695768, lon: -71.491631, exact: true }, parcels: ["WK 241 2", "WK 242 1", "WK 242 25", "WK 242 3"],
    name: "Allen property, Centerville Road", addr: "Centerville Road, beside the YMCA", lot: "Plat 242 Lots 1, 3 & 25 and Plat 241 Lot 2", zone: "A-15", units: 150, aff: 0, route: "major",
    routeLabel: "Major land development project",
    status: "approved", statusLabel: "Master plan approved with conditions",
    notes: "A residential development reached through the YMCA's roadway, improved to public standards, with no zoning relief; 150 homes without municipal sewers at the pre-application in September 2024. The master plan was approved with conditions in November 2025; how many homes it holds is not in those minutes.",
    src: ["wapb251112"],
  },
  {
    at: { lat: 41.763934, lon: -71.390898, exact: true }, parcels: ["WK 291 31", "WK 291 32"],
    name: "9 Post Road", addr: "9 Post Road", lot: "Plat 291 Lots 31 & 32", zone: "GB", units: 6, aff: 0, route: "major",
    routeLabel: "Major land development project (PUD overlay)",
    status: "approved", statusLabel: "Master plan approved unanimously",
    notes: "Six homes over commercial space in a new mixed-use building in General Business with the historic overlay, one more than the overlay's density allows, with setback and parking relief. The Board's chairman recused himself.",
    src: ["wapb250514"],
  },
  {
    at: { lat: 41.712844, lon: -71.485872, exact: true }, parcels: ["WK 260 39"],
    name: "211 Commonwealth Avenue", addr: "211 Commonwealth Avenue and College Hill Road", lot: "Plat 260 Lot 39 (by the street address)", zone: "A-15 with PDR", units: 10, aff: 0, route: "major",
    routeLabel: "Major land development project (PDR overlay)",
    status: "approved", statusLabel: "Preliminary approved unanimously",
    notes: "Ten homes on 1.87 acres in the A-15 Planned District Residential overlay, after the applicant took staff's advice to reduce the number of homes, added extensive landscaping and kept the stone walls, to be rebuilt into the site.",
    src: ["wapb251008"],
  },
];
