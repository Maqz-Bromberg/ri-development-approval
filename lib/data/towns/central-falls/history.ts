import type { Precedent } from "../../../types";

/**
 * Central Falls's housing projects of 2024, followed through the Planning Board's minutes on the state Open Meetings
 * site, read 2026-11-19 (ARD D68), from the records search of chunk 7 (D67). The board has filed nothing on the state
 * site since May 2025. Map positions: parcels in RIDEM's tax parcel layer by plat and lot (centroid); districts from the
 * Zoning Atlas. Applicants are named only as businesses or organizations, and residents by role (principle 7).
 */
export const CENTRAL_FALLS_HISTORY: Omit<Precedent, "events" | "checked" | "town">[] = [
  {
    at: { lat: 41.891873, lon: -71.395581, exact: true }, parcels: ["CF 4-483"],
    name: "4 and 6 School Street", addr: "4 and 6 School Street", lot: "Plat 4, Lots 483 & 483A", zone: "R-3", units: 58, aff: 0, route: "major",
    routeLabel: "Major land development project (unified development review)",
    status: "approved", statusLabel: "Preliminary approved 5–0",
    notes: "58 homes on two lots merged to about 19,100 sq ft, by the Central Falls Affordable Housing Corporation, with dimensional variances for lot area per home, height, setbacks and lot coverage, each voted 5 to 0. Traffic was discussed, with a traffic engineer's report. How many homes are affordable is not in the minutes. Lot 483A was not found in RIDEM's layer.",
    src: ["cfpb240111"],
  },
  {
    at: { lat: 41.891226, lon: -71.397228, exact: true }, parcels: ["CF 4-378"],
    name: "79 School Street", addr: "79 School Street", lot: "Plat 4, Lot 378", zone: "R-3", units: 6, aff: 0, route: "minor",
    routeLabel: "Minor land development project (unified development review)",
    status: "unknown", statusLabel: "Revised to six homes; decision not in the minutes read",
    notes: "A nine-home building with variances for lot area per home, height, coverage and setbacks, revised after the March 2024 hearing to six homes, 35 ft instead of 40, and a deeper front yard; the Board accepted the changes 4 to 0 in April. The vote on the preliminary plan is not in the minutes read.",
    src: ["cfpb240424"],
  },
  {
    at: { lat: 41.890446, lon: -71.388905, exact: true }, parcels: ["CF 5-479"],
    name: "37 Ledge Street", addr: "37 Ledge Street", lot: "Plat 5, Lot 479", zone: "R-3", units: 25, aff: 0, route: "major",
    routeLabel: "Major land development project (unified development review)",
    status: "unknown", statusLabel: "Continued in July 2024; no later record",
    notes: "A 25-home building with three commercial spaces, by Tabares Bros 3, Inc., which needed a use variance for the commercial space. A resident raised parking and the commercial space; a Board member asked why the commercial units could not be homes, and the Board's attorney said a zone change could replace the use variance. Continued to September 2024; nothing later is in the records searched.",
    src: ["cfpb240522", "cfpb240724"],
  },
];
