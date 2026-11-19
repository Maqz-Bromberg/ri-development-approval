import type { Precedent } from "../../../types";

/**
 * Richmond's comprehensive permit cases since 2023, read 2026-11-19 from the Planning Board's minutes on the state Open
 * Meetings site (ARD D64). They were found by the records search of chunk 6 (D63, lib/data/searched.ts). Map positions:
 * parcels found in RIDEM's tax parcel layer by plat and lot (centroid of the outlines); districts from the Zoning Atlas
 * at that point. Applicants are named only as businesses, and residents by role (principle 7).
 */
export const RICHMOND_HISTORY: Omit<Precedent, "events" | "checked" | "town">[] = [
  {
    at: { lat: 41.516009, lon: -71.685982, exact: true }, parcels: ["RI 04B-059-000", "RI 04B-059-002", "RI 04B-059-003"],
    name: "Richmond Place", addr: "38 Stilson Road", lot: "Plat 4B, Lots 59, 59-2 & 59-3", zone: "GB", units: 69, aff: 18, route: "comp",
    routeLabel: "Comprehensive permit (major land development)",
    status: "approved", statusLabel: "Preliminary approved (all in favour)",
    notes: "69 two-bedroom condominiums in 34 buildings of one to three homes on 9.8 acres of GB beside I-95, in the Aquifer Protection Overlay; 18 low- and moderate-income homes for sale at up to 120% of area median income. Public water and a shared septic system. The master plan (December 2021) granted relief from the use and density rules, the aquifer overlay, the yield plan and private-street standards. Approved with six conditions, among them that the condominium declaration tell buyers of the industrial uses next door.",
    src: ["ripb240326", "ripb241022", "ripb241210"],
  },
  {
    at: { lat: 41.469731, lon: -71.706332, exact: true }, parcels: ["RI 08A-011-000"],
    name: "Switch Road", addr: "299 Switch Road", lot: "Plat 8A Lot 11", zone: "", units: 8, aff: 2, route: "comp",
    routeLabel: "Comprehensive permit (subdivision)",
    status: "approved", statusLabel: "Preliminary approved (all in favour)",
    notes: "Eight new house lots beside the existing home, two of them affordable, with an open space lot, near Sandy Pond. Peer reviews of traffic, stormwater and the effect on the pond were required; the approval's conditions include five years of water testing four times a year, limits on fertilizer and pesticides, and a conservation easement. The applicant asked to keep wells on the lots rather than in the open space. The Atlas gives no district at the parcel's centre.",
    src: ["ripb250820", "ripb260113", "ripb260310"],
  },
  {
    at: { lat: 41.457909, lon: -71.647491, exact: true }, parcels: ["RI 09D-036-000"],
    name: "West Shannock Road", addr: "0 West Shannock Road", lot: "Plat 9D Lot 36", zone: "R-2", units: 13, aff: 4, route: "comp",
    routeLabel: "Comprehensive permit (subdivision)",
    status: "pending", statusLabel: "Pre-application",
    notes: "Thirteen single-family homes, four of them low- and moderate-income, on about 11 acres. Pre-application in December 2025.",
    src: ["ripb251209"],
  },
];
