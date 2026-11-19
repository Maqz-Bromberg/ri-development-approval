import type { Precedent } from "../../../types";

/**
 * Woonsocket's larger housing projects since 2024, followed to a decision through the Planning Board's minutes on the
 * state Open Meetings site, read 2026-11-19 (ARD D68), from the records search of chunk 7 (D67). The minutes record each
 * motion and every member's vote. Map positions: parcels in RIDEM's tax parcel layer by map, plat and lot (centroid);
 * districts from the minutes. Applicants are named only as businesses, and residents by role (principle 7).
 */
export const WOONSOCKET_HISTORY: Omit<Precedent, "events" | "checked" | "town">[] = [
  {
    at: { lat: 42.005022, lon: -71.479369, exact: true }, parcels: ["WO C6-48-12"],
    name: "1067 Mendon Road", addr: "1067 Mendon Road", lot: "Map C6, Lot 48-12", zone: "MU-1", units: 24, aff: 0, route: "major",
    routeLabel: "Major land development project (unified development review)",
    status: "approved", statusLabel: "Preliminary approved 4–0",
    notes: "A multi-family building by D&D Realty Mendon, LLC on a lot rezoned from R-2 to MU-1 in 2024, which the Planning Board recommended in September. First 35 homes where the district's density allows 15; after five months of hearings, cut to 24 to answer concerns about its size and bulk, with variances for density and frontage granted at the master plan. Multi-family homes are permitted in MU-1; the relief was for how many.",
    src: ["wopb240716", "wopb241217", "wopb250318"],
  },
  {
    at: { lat: 42.016719, lon: -71.482737, exact: true }, parcels: ["WO A6-46-2"],
    name: "60 Mendon Road", addr: "60 Mendon Road", lot: "Map A6, Lot 46-2", zone: "R-2", units: 26, aff: 0, route: "major",
    routeLabel: "Major land development project, then adaptive reuse (combined master and preliminary plan)",
    status: "approved", statusLabel: "Combined master and preliminary approved, with a traffic condition",
    notes: "The former Ballou Home for the Aged, a vacant nursing home in R-2, where multi-family homes are not allowed. A 21-unit condominium was approved in 2022 and extended in 2024, with a use variance from the Zoning Board; it never went ahead. In 2025 it returned as an adaptive reuse into 26 apartments (thirteen one-bedroom, thirteen two-bedroom), by Mendon Commons LLC. An abutter testified about traffic on Mendon Road; the Board reopened the hearing, accepted a traffic arrangement the residents proposed, with signs, and made it a condition.",
    src: ["wopb240716", "wopb251209"],
  },
  {
    at: { lat: 42.00143, lon: -71.512388, exact: true }, parcels: ["WO D3-15-61"],
    name: "Bernon Mills", addr: "115 and 119 Front Street, 125 Court Street", lot: "Map D3, Lots 15-16A, 15-16B & 15-61", zone: "MU-1 (Downtown Overlay)", units: 72, aff: 72, route: "major",
    routeLabel: "Major land development project (unified development review)",
    status: "approved", statusLabel: "Master plan approved 5–0 at 72 homes",
    notes: "A mill redevelopment already approved for 60 homes (16 existing, 44 new), raised to 72 with a new ten-home building on Front Street, all deed-restricted affordable workforce housing, presented with NeighborWorks. The master plan and its zoning relief were approved in December 2025. Two of the three lots were not found in RIDEM's layer; the map point is the third.",
    src: ["wopb251209"],
  },
  {
    at: { lat: 41.992029, lon: -71.523786, exact: true }, parcels: ["WO F2-5-3"],
    name: "Ballou Townhomes", addr: "129 Ballou Street", lot: "Map F2, Lot 5-3", zone: "R-3", units: 15, aff: 0, route: "major",
    routeLabel: "Major land development project (adaptive reuse)",
    status: "pending", statusLabel: "Master plan approved; preliminary plan heard",
    notes: "An adaptive reuse of a commercial building into small, inexpensive homes for sale, by LandUse.co for Jacavone Investment Corp.: 16 at the master plan, approved with conditions on a swing gate, no expansion of the footprint, trash trucks' turning, snow removal, dark-sky lighting and a request for no parking on one side of Ballou Street; 15 at the preliminary plan in May 2026, with a housing grant applied for. The preliminary decision is not in the minutes read.",
    src: ["wopb260319"],
  },
  {
    at: { lat: 41.999192, lon: -71.527521, exact: true }, parcels: ["WO D2-3-13"],
    name: "4th Ave Condominiums", addr: "0 4th Avenue", lot: "Map D2, Lot 3-13", zone: "R-4", units: 15, aff: 0, route: "major",
    routeLabel: "Major land development project (unified development review)",
    status: "pending", statusLabel: "Master plan approved 4–0; preliminary plan heard",
    notes: "A new 15-home condominium in R-4, where three homes are allowed by right on the lot, by JDM Holdings LLC, with relief for lot area and parking (16 spaces where 30 are required). The master plan and its zoning relief were approved in June 2026; the preliminary plan was heard in October 2026, and its decision is not in the minutes read.",
    src: ["wopb260616"],
  },
];
