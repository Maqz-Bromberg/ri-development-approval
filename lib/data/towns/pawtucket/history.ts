import type { Precedent } from "../../../types";

/**
 * Pawtucket's larger housing projects since 2024, followed to a decision through the City Planning Commission's minutes
 * on the state Open Meetings site, read 2026-11-19 (ARD D68). They were found by the records search of chunk 7 (D67,
 * lib/data/searched.ts). Map positions: parcels found in RIDEM's tax parcel layer by plat and lot (centroid of the
 * outlines), or the street address point where the parcel was not found; districts from the minutes. Applicants are
 * named only as businesses, and residents by role (principle 7).
 */
export const PAWTUCKET_HISTORY: Omit<Precedent, "events" | "checked" | "town">[] = [
  {
    at: { lat: 41.877372, lon: -71.391246, exact: true }, parcels: ["PA 530567", "PA 530568"],
    name: "258 Pine Street", addr: "258 Pine Street", lot: "AP 53 Lots 567 & 568", zone: "CT", units: 190, aff: 0, route: "major",
    routeLabel: "Major land development project (unified development review)",
    status: "approved", statusLabel: "Final approved; amended to 190 homes",
    notes: "A mixed-use building on a vacant 2.2-acre lot beside the Pawtucket-Central Falls Transit Center, by Rise Above All Properties, LLC: 177 homes and two shops at the preliminary plan, 179 at the final, and 190 after a major amendment that split the L-shaped building and added parking. The preliminary approval asked for curb cuts coordinated with Public Works, access agreements, a final pro forma, a merger of the two lots and a sewer permit. No affordable share is stated.",
    src: ["papc240220", "papc241119", "papc250715", "papc251203"],
  },
  {
    at: { lat: 41.880839, lon: -71.391844, exact: true }, parcels: ["PA 440592"],
    name: "327 Pine Street", addr: "327 Pine Street", lot: "AP 44 Lot 592", zone: "CT", units: 136, aff: 0, route: "major",
    routeLabel: "Development plan review (Joint Planning Commission)",
    status: "approved", statusLabel: "Phase 2 approved 3–0",
    notes: "A 136-home building, the second phase of a 183-home project with 153 parking spaces, approved by the Joint Planning Commission on the Technical Review Committee's conditions, among them that seven homes (5%) be accessible. No affordable share is stated.",
    src: ["papc240521"],
  },
  {
    at: { lat: 41.879599, lon: -71.393711, exact: true }, parcels: ["PA 440438"],
    name: "225 Conant Street", addr: "225 Conant Street", lot: "AP 44 Lot 438", zone: "CT", units: 42, aff: 0, route: "major",
    routeLabel: "Development plan review (more than ten homes)",
    status: "approved", statusLabel: "Final approved 7–0",
    notes: "An abandoned mill turned into 42 homes and two commercial spaces by Wickstead House LLC, with no variance; the Commission waived a stormwater requirement at the preliminary plan, one member voting against.",
    src: ["papc250121", "papc250520"],
  },
  {
    at: { lat: 41.879382, lon: -71.389541, exact: true }, parcels: ["PA 440583"],
    name: "125 Goff Avenue", addr: "125 Goff Avenue", lot: "AP 44 Lot 583", zone: "CT", units: 140, aff: 0, route: "major",
    routeLabel: "Major land development project (unified development review)",
    status: "approved", statusLabel: "Preliminary approved, reheard and approved 7–0; final by staff",
    notes: "A 140-home building with 163 parking spaces beside an existing 140-home apartment building, by Lofts Landlord LLC. A variance from the Conant Thread district's sidewalk standard passed 5 to 1, and a coffee shop was dropped. The preliminary plan, approved in May 2025, was heard again in July for a notice problem; an abutter's attorney asked for a continuance over the traffic study and the district's design goals, and the Commission approved it again with two conditions on fire access and the Goff Avenue bus lane. Final approval was left to staff.",
    src: ["papc250318", "papc250520", "papc250715"],
  },
  {
    at: { lat: 41.871136, lon: -71.380486, exact: true }, parcels: ["PA 230672"],
    name: "Pennrose at Tidewater Landing", addr: "177 School Street", lot: "AP 23 Lot 672", zone: "RTW", units: 72, aff: 72, route: "major",
    routeLabel: "Major land development project (combined master and preliminary plan)",
    status: "approved", statusLabel: "Master and preliminary approved 5–0",
    notes: "A six-story building of 72 affordable homes for households at up to 80% of area median income, above a parking garage, on city land in the Riverfront Tidewater district, by Pennrose LLC; part of the Tidewater Landing redevelopment around the stadium. No one spoke at the hearing.",
    src: ["papc250819", "papc251118"],
  },
  {
    at: { lat: 41.862483, lon: -71.346262, exact: false },
    name: "The Paddock", addr: "651 Narragansett Park Drive", lot: "AP 41 Lot 391", zone: "CG and MO", units: 95, aff: 0, route: "comp",
    routeLabel: "Comprehensive permit (major land development)",
    status: "approved", statusLabel: "Preliminary approved 8–0",
    notes: "Two three-story apartment buildings and 35 townhouses, 95 homes, with a community building and six acres of open space on a vacant 9.9-acre lot, by Blackstone Valley Development Corporation with The ARC of Blackstone Valley, presented as affordable and workforce housing. Adjustments for height, the number of buildings on a lot and parking. A neighbour opposed it for its scale, noise, safety and property values. The affordable share is not stated in the minutes; the count is left at zero.",
    src: ["papc250415", "papc250715"],
  },
  {
    at: { lat: 41.879962, lon: -71.388221, exact: true }, parcels: ["PA 440509", "PA 440532"],
    name: "71 Dexter Street", addr: "71 Dexter Street and 0 Beatty Street", lot: "AP 44 Lots 509 & 532", zone: "CT", units: 150, aff: 0, route: "major",
    routeLabel: "Development plan review (Joint Planning Commission)",
    status: "approved", statusLabel: "Preliminary approved 2022, extended 4–0",
    notes: "A six-story building with 150 homes, 9,129 sq ft of commercial space and 87 parking spaces, given preliminary approval in September 2022 and a year's extension in February 2024. Nothing later was found in the records searched.",
    src: ["papc240220"],
  },
  {
    at: { lat: 41.890103, lon: -71.360076, exact: true }, parcels: ["PA 100316", "PA 100317", "PA 100318"],
    name: "Cameron Street duplexes", addr: "36, 42 and 48 Cameron Street", lot: "AP 10 Lots 316, 317 & 318", zone: "RT", units: 6, aff: 6, route: "comp",
    routeLabel: "Comprehensive permit (minor land development)",
    status: "approved", statusLabel: "Preliminary approved 6–0",
    notes: "Three two-family homes, all affordable for sale, on three vacant lots merged into one, by Justice Assistance Holdings LLC. Residents of Cameron Street asked about parking, trash storage and how the buildings would look.",
    src: ["papc260106"],
  },
  {
    at: { lat: 41.877719, lon: -71.394397, exact: true }, parcels: ["PA 440561"],
    name: "180 Weeden Street", addr: "180 Weeden Street", lot: "AP 44 Lot 561", zone: "CT", units: 38, aff: 0, route: "major",
    routeLabel: "Major land development project",
    status: "approved", statusLabel: "Preliminary approved 7–0",
    notes: "A former mill turned into 29 market-rate rental homes, studios to two bedrooms, with nine townhouses on the east of the site, by 180 Weeden St LLC, with no relief requested. The townhouses were already being built when staff found they had not been sent for planning review, so they joined the mill as one project. Conditions included consultation with Amtrak and the size of the parallel parking spaces.",
    src: ["papc250916", "papc251203"],
  },
];
