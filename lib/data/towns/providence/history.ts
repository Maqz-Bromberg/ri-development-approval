import type { Precedent } from "../../../types";

/**
 * Housing projects in Fox Point and Wayland from City Plan Commission agendas, minutes and staff reports, 2023 to 2026.
 * Trial reading, 2026-11-13. Map positions: parcels found in RIDEM's tax parcel layer by plat and lot (centroid of the outlines).
 * 135 Gano Street has no position: its plat and lot were not in the records read.
 * Two more records were read and left out because no unit count is given: 386 Ives Street (extension, May 2026)
 * and 176 Gano Street with 38 Amy Street (rezoning, April 2024).
 * Where the City's own documents disagree, the note says so.
 */
export const PROVIDENCE_HISTORY: Omit<Precedent, "events" | "checked" | "town">[] = [
  {
    at: { lat: 41.827944, lon: -71.380794, exact: true }, parcels: ["PR 015-0483-0000"],
    name: "27 East River Street", addr: "27 East River Street", lot: "AP 15 Lot 483", zone: "W-2", units: 355, aff: 0, route: "minor",
    routeLabel: "Minor land development project (no commercial space)",
    status: "approved", statusLabel: "Preliminary approved 5–0",
    notes: "A nine-story building on about 88,000 sq ft beside the Seekonk River, first shown as 326 units with 163 parking spaces. In October 2024 the Commission granted adjustments for 90 ft of height (75 ft allowed) and a 50% parking reduction by 3 to 1, on conditions: a traffic study, documented community outreach, and a search for one-to-one parking. The plan came back with 355 units and 281 spaces and was approved with seven conditions, among them state permits and the City Engineer's and Traffic Engineer's approval before the final plan. Coastal review by CRMC applies. The state parcel layer gives the lot as about 2.3 acres.",
    src: ["pmin241015", "pag251021", "psr27er2512", "pmin251216"],
  },
  {
    at: { lat: 41.827016, lon: -71.386567, exact: true }, parcels: ["PR 015-0238-0000", "PR 015-0239-0000", "PR 015-0240-0000"],
    name: "150 Pitman Street", addr: "150–158 Pitman Street", lot: "AP 15 Lot 498 (formerly Lots 238, 239 and 240)", zone: "C-2", units: 8, aff: 0, route: "minor",
    routeLabel: "Minor land development project, major change",
    status: "approved", statusLabel: "Major change approved 6–0",
    notes: "Approved as 16 units, then cut to 8 with 16 parking spaces because, the applicant's attorney said, buyers wanted more than one space each. A change of more than 20% in units is a major change and goes back to the Commission. A height adjustment to about 56 ft and five stories (50 ft and four allowed) and a waiver of the build-to percentage were granted. Conditions cover street trees, visibility of the green space from Pitman Street and the wood-look facade finish. The agenda places the lot in Wayland and the staff report in Fox Point, and the case number changes between records (22-051MI, 23-055MI).",
    src: ["pag241119", "pmin250819", "psr150p2509", "pmin250916"],
  },
  {
    at: { lat: 41.827606, lon: -71.388797, exact: true }, parcels: ["PR 014-0029-0000"],
    name: "128 Wayland Avenue", addr: "128 Wayland Avenue", lot: "AP 14 Lot 29", zone: "C-2", units: 22, aff: 0, route: "minor",
    routeLabel: "Minor land development project (about 515 sq ft commercial)",
    status: "approved", statusLabel: "Re-approved 6–0 after a court vacated the approval",
    notes: "A five-story mixed-use building on a 4,500 sq ft corner lot, with no vehicle parking required because the lot is under 10,000 sq ft. The 2024 approval was vacated by a court on the finding that the Commission could not adjust both height in feet and number of stories. The ordinance was amended and the Commission reheard the plan as a new preliminary submission. The owner of the property behind raised her retaining wall and foundation. The agenda gives 22 apartments and the staff report 23.",
    src: ["pag250916", "psr128w2509", "pmin250916"],
  },
  {
    at: { lat: 41.819322, lon: -71.397948, exact: true }, parcels: ["PR 018-0190-0000", "PR 018-0192-0000"],
    name: "269 Wickenden Street", addr: "269 Wickenden Street", lot: "AP 18 Lots 190 & 192", zone: "C-2", units: 74, aff: 0, route: "major",
    routeLabel: "Major land development project (mixed use)",
    status: "approved", statusLabel: "Preliminary approved 4–1",
    notes: "A five-story mixed-use building of about 65 ft 9 in on 10,108 sq ft, replacing two buildings. Two master plan applications in 2023, the second with more units and less parking. Neighbours appealed to the Zoning Board of Review sitting as Board of Appeal, which upheld the approval, and then to the Superior Court, which denied the appeal in September 2024. The preliminary plan was continued for detail on loading, bicycle storage and planting, then approved with five conditions. The agenda gives 74 units and the staff report 75.",
    src: ["pc241374", "pag250121", "pmin250121", "psr269w2502", "pmin250218"],
  },
  {
    name: "135 Gano Street", addr: "135 Gano Street", lot: "", zone: "", units: 54, aff: 0, route: "minor",
    routeLabel: "Minor land development project, administrative review",
    status: "administrative", statusLabel: "Staff review (outcome not posted)",
    notes: "A four-story residential building with 54 units and 54 internal parking spaces, listed by the City among projects reviewed by staff without a hearing. The page posts the plans and a traffic study but no decision letter, so the outcome is not known from the record.",
    src: ["padmin"],
  },
];
