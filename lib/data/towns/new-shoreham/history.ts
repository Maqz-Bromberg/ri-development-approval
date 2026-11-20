import type { Precedent } from "../../../types";

/**
 * New Shoreham's housing project since 2023 with more than two homes, read 2026-11-19 from the Planning Board's and
 * Zoning Board of Review's minutes on the state Open Meetings site (ARD D70), from the records search of chunk 5. Map
 * position: the parcel beside it (Plat 18, Lot 2-2), since Lot 2-3 is not in RIDEM's layer. The district is the one the
 * Zoning Board's decision gives; the Zoning Atlas shows RA there.
 */
export const NEW_SHOREHAM_HISTORY: Omit<Precedent, "events" | "checked" | "town">[] = [
  {
    at: { lat: 41.179469, lon: -71.581729, exact: false },
    name: "West Side Road affordable rentals", addr: "West Side Road", lot: "Plat 18, Lot 2-3", zone: "NHC", units: 16, aff: 16, route: "dpr",
    routeLabel: "Special use permit for affordable housing (§ 405), with development plan review",
    status: "approved", statusLabel: "Special use permit granted 4–0",
    notes: "Eight duplexes of two-bedroom homes, sixteen rentals for year-round residents, by the Block Island Housing Board, on an 80,097 sq ft lot where the zone needs 20,000 a home: § 405 lets the density rise for affordable housing the Housing Board sponsors, and the Town worked out that sixteen were allowed. No dimensional relief was needed; town sewer and water serve it. The Planning Board gave a favorable advisory in May 2023, after hearing that a grant from Rhode Island Housing had not come through, and the Zoning Board's hearings ran from March to October 2023, with stipulations on guest parking and the driveway.",
    src: ["nspb230510", "nszb231025"],
  },
];
