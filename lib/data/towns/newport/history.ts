import type { Precedent } from "../../../types";

/**
 * Newport's housing projects since 2024, followed to a decision through the Planning Board's minutes on the state Open
 * Meetings site, read 2026-11-19 (ARD D68), from the records search of chunk 7 (D67). Under unified development review
 * the Planning Board decides the special use permits and variances itself. Map positions: parcels in RIDEM's tax parcel
 * layer by plat and lot (centroid); districts from the minutes. Applicants are named only as businesses (principle 7).
 */
export const NEWPORT_HISTORY: Omit<Precedent, "events" | "checked" | "town">[] = [
  {
    at: { lat: 41.505145, lon: -71.301357, exact: true }, parcels: ["NE 6 1"],
    name: "525 Broadway", addr: "0 (525) Broadway", lot: "TAP 6, Lot 1", zone: "R-10", units: 38, aff: 0, route: "dpr",
    routeLabel: "Development plan review (unified development review)",
    status: "approved", statusLabel: "Special use permit and variances approved; final recorded",
    notes: "Three buildings of 37 one-bedroom homes, with seven more on the part of the lot in Middletown, by 525 Broadway LLC. Middletown's Planning Board denied a use variance for its part, where multi-family homes are not permitted, so the project was redrawn within Newport as two buildings of 38 one-bedroom homes presented as workforce housing. The Planning Board granted a category 1 special use permit and variances for density, parking, height and lot coverage in September 2025; traffic and density were raised at the hearing. The final plan was recorded on April 15, 2026.",
    src: ["nepb250804", "nepb250908", "nepb260511"],
  },
  {
    at: { lat: 41.513534, lon: -71.314511, exact: true }, parcels: ["NE 3 11"],
    name: "102–108 Girard Avenue", addr: "102 to 108 Girard Avenue", lot: "TAP 3, Lot 11", zone: "R-10", units: 22, aff: 0, route: "dpr",
    routeLabel: "Development plan review (unified development review)",
    status: "approved", statusLabel: "Variances and special use permit approved unanimously",
    notes: "Three new apartment buildings of six homes each, and a four-home addition to the westernmost for 22 in all, the new ones accessible senior homes with an elevator, by NRI 104-108 Girard Partnership. The Board granted variances for a side yard, lot coverage and parking placement, and a category 1 special use permit, on condition that senior parking be marked; leases are for at least a year, with no subletting.",
    src: ["nepb251201"],
  },
];
