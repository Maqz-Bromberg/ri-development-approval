import type { Precedent } from "../../../types";

/**
 * West Greenwich's comprehensive permit cases since 2023, read 2026-11-19 from the Planning Board's minutes on the state Open
 * Meetings site (ARD D64). They were found by the records search of chunk 6 (D63, lib/data/searched.ts). Map positions:
 * parcels found in RIDEM's tax parcel layer by plat and lot (centroid of the outlines); districts from the Zoning Atlas
 * at that point. Applicants are named only as businesses, and residents by role (principle 7).
 */
export const WEST_GREENWICH_HISTORY: Omit<Precedent, "events" | "checked" | "town">[] = [
  {
    at: { lat: 41.660024, lon: -71.555541, exact: true }, parcels: ["WG 1-4-5"],
    name: "The VUE", addr: "687 Centre of New England Boulevard", lot: "AP 1 Lot 4-5", zone: "SMD", units: 333, aff: 100, route: "comp",
    routeLabel: "Comprehensive permit (major land development)",
    status: "approved", statusLabel: "Preliminary approved 4–0; final by staff",
    notes: "Two buildings on a vacant 12.9-acre parcel in the Centre of New England: 100 affordable age-restricted apartments, almost all one-bedroom, and 233 market-rate apartments, with 438 parking spaces. Shown as condominiums at the pre-application in December 2024. The Board granted a height of up to 70 ft (60 ft allowed) and found multi-family housing acceptable in the SMD district, where the use table does not allow it, because of its affordable and age-restricted homes; conditions include building the affordable homes first or alongside the market-rate ones and a peer review of the traffic study. The applicant said the project would lift the town above the state's 10% affordable target. Final plan approved by staff, reported in January 2026.",
    src: ["wgpb241216", "wgpb250519", "wgpb260128"],
  },
  {
    at: { lat: 41.656965, lon: -71.58402, exact: true }, parcels: ["WG 4-18"],
    name: "Lace Mill", addr: "152 Mishnock Road", lot: "AP 4 Lot 18", zone: "RFR-1", units: 6, aff: 3, route: "comp",
    routeLabel: "Comprehensive permit (minor)",
    status: "approved", statusLabel: "Approved 3–0",
    notes: "Six apartments in three two-story buildings on a vacant lot of about 1.3 acres, three affordable, by KCMH Properties. Public water from the Kent County Water Authority, and three septic systems, one for each pair of homes. The town administrator told the hearing that under recent changes to state law, until the town reaches 10% affordable homes a denial would most likely be overturned in court, leaving the project with no conditions from the Board. Approved with eleven conditions, among them privacy fencing and planting for the neighbours, no further tree cutting, and limited construction hours.",
    src: ["wgpb250421", "wgpb251020"],
  },
  {
    at: { lat: 41.61645, lon: -71.664597, exact: true }, parcels: ["WG 14-15-6"],
    name: "Raccoon Hill Townhomes", addr: "Off Victory Highway", lot: "AP 14 Lot 15-6", zone: "RFR-2", units: 52, aff: 52, route: "comp",
    routeLabel: "Comprehensive permit (major land development)",
    status: "pending", statusLabel: "Master plan approved 4–0",
    notes: "All-affordable townhouses by the Women's Development Corporation on land of Rhode Island Housing: 52 rentals in a first phase and 12 two-bedroom homes for sale planned in a second. First shown as 44. The master plan was approved with two adjustments, multi-family housing in RFR-2 and laundry waste combined with the septic effluent, and ten conditions; neighbours' well water was the main concern, so the first condition is drawdown testing of abutting wells in the dry months. The applicant's consultant said it would raise the town's affordable share from 1.77% by 2.4 points. A well-testing work session followed in July 2026.",
    src: ["wgpb250721", "wgpb250915", "wgpb251117", "wgpb260720"],
  },
  {
    at: { lat: 41.63567, lon: -71.704679, exact: true }, parcels: ["WG 28-25"],
    name: "Bella View Estates", addr: "Off Stubble Brook Road", lot: "AP 28 Lot 25", zone: "RFR-2", units: 292, aff: 73, route: "comp",
    routeLabel: "Comprehensive permit (major land development)",
    status: "denied", statusLabel: "Master plan denied 5–0",
    notes: "292 three-bedroom condominiums, 73 affordable, by a construction company, on about 107 acres in an area where residents said wells already run short. The Board's counsel advised that without competent evidence of water for the homes the applicant had not met the state's test for the density bonus, and that the master plan did not show all the wells and septic systems the statute asks a master plan to show. The Board rejected every requested adjustment and denied the master plan, each 5 to 0, and adopted a written decision in April; the applicant's attorney argued the decision came too late and was perfunctory. Whether it was appealed is not in the records read.",
    src: ["wgpb260323", "wgpb260331", "wgpb260420"],
  },
];
