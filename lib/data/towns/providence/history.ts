import type { Precedent } from "../../../types";

/**
 * Housing projects from City Plan Commission agendas, minutes and staff reports, 2023 to 2026: every case on the
 * Commission's agendas since 2023 that gives a number of homes (agenda.json). The first five, in Fox Point and Wayland,
 * were read in the trial reading of 2026-11-13; the other sixteen on 2026-11-18, from the staff reports saved by hand
 * and the minutes on the state Open Meetings site.
 * Map positions: parcels found in RIDEM's tax parcel layer by plat and lot (centroid of the outlines).
 * No position for 135 Gano Street (its plat and lot were not in the records read), 11 W Friendship Street (AP 30 Lot 720)
 * and 217 Angell Street (AP 13 Lot 320): the state layer has no parcel by those numbers, which the City has since
 * renumbered or merged, and none is assumed.
 * Two more records were read and left out because no unit count is given: 386 Ives Street (extension, May 2026)
 * and 176 Gano Street with 38 Amy Street (rezoning, April 2024).
 * Where the City's own documents disagree (case numbers, dates, unit counts), the note says so.
 * People are named only as businesses or by their role (ARD principle 7).
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
  {
    at: { lat: 41.827625, lon: -71.399524, exact: true }, parcels: ["PR 012-0180-0000", "PR 012-0260-0000"],
    name: "116 Waterman Street", addr: "116 Waterman Street", lot: "AP 12 Lots 180 & 260 (now Lot 492)", zone: "C-2 (I-3E overlay)", units: 26, aff: 0, route: "major",
    routeLabel: "Major land development project (mixed use)",
    status: "approved", statusLabel: "Preliminary approved 3–1; a 26th unit approved 3–2 in 2025",
    notes: "A five-story mixed-use building on about 6,070 sq ft at Waterman and Brook Streets, replacing two houses; no parking required because the lot is under 10,000 sq ft. First heard in December 2022 and continued twice, for a community meeting and a better landscaping plan. The Commission granted 58 ft and five stories (50 ft and four allowed) for vertical mixed use, and a design waiver for homes within 20 ft of a main street once commercial space filled about 65% of the Brook Street frontage, each 3 to 1. Conditions: a noise-monitoring system and round-the-clock security or management on site. In 2025 a major change turned common space on the ground floor into a 26th apartment, approved 3 to 2; the minutes record that the plans before the Commission were not the ones filed for the building permit. The staff reports are dated January 24, 2022 and February 21, 2023 for hearings held in 2023.",
    src: ["psr116w2301", "pmin230124", "psr116w2302", "pmin230221", "psr116w2508", "pmin250819"],
  },
  {
    at: { lat: 41.819352, lon: -71.461591, exact: true }, parcels: ["PR 113-0232-0000", "PR 113-0233-0000", "PR 113-0235-0000", "PR 113-0244-0000"],
    name: "541 Hartford Avenue", addr: "541 Hartford Avenue", lot: "AP 113 Lots 232, 233, 235 & 244", zone: "C-2", units: 30, aff: 0, route: "major",
    routeLabel: "Major land development project, master and preliminary combined",
    status: "approved", statusLabel: "Master and preliminary approved 4–0",
    notes: "A 47 ft, four-story mixed-use building at Hartford and Glenbridge Avenues, on four lots to be merged into about 17,021 sq ft, within the height limit. The Commission combined the master and preliminary stages, deferred the state approvals to the final plan, granted design waivers for the width of recessed entries and the corner side build-to percentage, and cut parking by 13 spaces (33 required, 20 provided) for residential and commercial mixed use, all 4 to 0. Conditions: the City Engineer's and City Forester's approvals, an administrative subdivision to merge the lots, and encroachment permits with the building permit. The staff report is dated January 24, 2022 for the January 2023 hearing, and its file name gives case 22-058MA where the agenda gives 22-069MA.",
    src: ["psr541h2301", "pmin230124"],
  },
  {
    at: { lat: 41.82757, lon: -71.400055, exact: true }, parcels: ["PR 012-0183-0000", "PR 012-0184-0000"],
    name: "108–110 Waterman Street", addr: "108–110 Waterman Street", lot: "AP 12 Lots 183 & 184", zone: "C-2 (I-3E overlay)", units: 35, aff: 0, route: "major",
    routeLabel: "Major land development project (mixed use)",
    status: "approved", statusLabel: "Preliminary approved 4–0",
    notes: "A 60 ft, five-story building with retail on the ground floor and, by the preliminary plan, 35 homes, replacing a Queen Anne house in the College Hill National Register Historic District, on a lot of about 9,862 sq ft after an administrative subdivision; no parking required. At the July 2023 public informational meeting staff asked for time to study the building's historic significance and a roof deck, and the item was continued. In September staff found the building not significant enough to prevent demolition; the Commission granted the height for vertical mixed use and approved the master plan 6 to 0, on conditions that the building be documented for the state preservation office before demolition and the roof deck be removed. At the preliminary plan in July 2024 the building held 35 homes, up from 26 at the master plan, with the same height; the state approvals were deferred to the final plan and the plan approved 4 to 0, with the master plan's conditions and brick on the facade where masonry was shown. The files give case 22-030MA and the agendas 23-030MA.",
    src: ["psr108w2307", "pmin230718", "psr108w2309", "pmin230919", "psr108w2407", "pmin240716"],
  },
  {
    at: { lat: 41.793303, lon: -71.426729, exact: true }, parcels: ["PR 125-0002-0000", "PR 125-0004-0000"],
    name: "106 Reservoir Avenue", addr: "106 Reservoir Avenue", lot: "AP 125 Lots 2 & 4", zone: "C-2", units: 21, aff: 0, route: "minor",
    routeLabel: "Minor land development project (addition over a commercial building)",
    status: "approved", statusLabel: "Preliminary approved 4–0",
    notes: "Three stories of apartments over a one-story commercial building of about 3,172 sq ft, for a 40 ft, four-story building within the height limit. Staff said the project was minor and came to the Commission only for its parking adjustment: 12 spaces where the staff report counts 23 required and the agenda 22. Granted 4 to 0 because part of the parking is structured, and the preliminary plan approved 4 to 0 with the City Forester's and City Engineer's approvals as conditions. The staff report gives case 22-064MI and the agenda 23-064MI.",
    src: ["psr106r2402", "pmin240220"],
  },
  {
    at: { lat: 41.829635, lon: -71.400576, exact: true }, parcels: ["PR 013-0028-0000"],
    name: "279 Thayer Street", addr: "279 Thayer Street", lot: "AP 13 Lot 28", zone: "C-2 (I-3E overlay)", units: 16, aff: 0, route: "major",
    routeLabel: "Major land development project, major change",
    status: "approved", statusLabel: "Major change approved 5–0",
    notes: "A mixed-use building approved at four stories and 12 units, raised to five stories and 55 ft with 16 units. No parking required on a lot under 10,000 sq ft, and no design waivers needed. The height adjustment and the change were approved 5 to 0, on conditions that staff settle the colour of an illuminated metal strip, the placing of the fifth story and the joints between wall panels.",
    src: ["psr279t2409", "pmin240917"],
  },
  {
    at: { lat: 41.80127, lon: -71.426008, exact: true }, parcels: ["PR 049-0568-0000"],
    name: "400 Elmwood Avenue", addr: "400 Elmwood Avenue", lot: "AP 49 Lot 568", zone: "C-2", units: 24, aff: 0, route: "major",
    routeLabel: "Major land development project with unified development review (mixed use)",
    status: "approved", statusLabel: "Master and preliminary approved 4–0",
    notes: "A 55 ft, five-story building on a triangular corner lot of about 25,280 sq ft, first proposed with a vehicle repair shop and a restaurant on the ground floor. Continued in September 2024 at the applicant's request for community outreach, with a meeting hosted by the ward's councillor. In October the applicant withdrew the special use permit for vehicle repair, which also made the parking adjustment unnecessary. Through unified development review the Commission granted a side-yard variance, and it granted the height adjustment, combined the master and preliminary stages and deferred state approvals to the final plan, all 4 to 0.",
    src: ["psr400e2409", "pmin240917", "pmin241015"],
  },
  {
    name: "11 W Friendship Street", addr: "11 W Friendship Street", lot: "AP 30 Lot 720", zone: "C-1 (part R-4)", units: 26, aff: 0, route: "minor",
    routeLabel: "Minor land development project (about 2,043 sq ft commercial)",
    status: "approved", statusLabel: "Preliminary approved 5–0",
    notes: "A 45 ft, four-story building with two shops and 26 apartments on about 15,080 sq ft, within the height limit. Minor because its commercial space is under the City's line. Parking was cut to 14 spaces where 26 are required, granted 5 to 0 on staff's finding that the project conformed. Conditions: a landscaping plan with a solid fence beside the residential zone, and the City Engineer's approval of stormwater. The staff report gives case 22-051MI and the agenda 24-051MI.",
    src: ["psr11wf2409", "pmin240917"],
  },
  {
    at: { lat: 41.83551, lon: -71.425282, exact: true }, parcels: ["PR 069-0260-0000"],
    name: "551 Chalkstone Avenue", addr: "551 Chalkstone Avenue", lot: "AP 69 Lot 260", zone: "C-2", units: 23, aff: 0, route: "minor",
    routeLabel: "Minor land development project (mixed use)",
    status: "approved", statusLabel: "Preliminary approved 6–0",
    notes: "A five-story building of about 53 ft on a vacant corner lot of about 4,100 sq ft at Chalkstone and Camden Avenues, with a shop and 23 apartments. No parking required in C-2 on a lot this size; a member of the public asked about it, and staff said requiring parking would cut housing. The height adjustment (vertical mixed use with over half the space residential, § 1904.E.1) and the preliminary plan were approved 6 to 0.",
    src: ["psr551c2411", "pmin241119"],
  },
  {
    at: { lat: 41.849391, lon: -71.438396, exact: true }, parcels: ["PR 123-0165-0000", "PR 123-0166-0000", "PR 123-0171-0000"],
    name: "663 Admiral Street", addr: "663 Admiral Street", lot: "AP 123 Lots 165, 166 & 171", zone: "C-1 (Lot 171 R-2, parking only)", units: 48, aff: 0, route: "minor",
    routeLabel: "Minor land development project (mixed use)",
    status: "approved", statusLabel: "Preliminary approved 6–0",
    notes: "A 63 ft 3 in, five-story mixed-use building with 31 internal parking spaces where 48 are required and 45 ft and four stories are allowed, on about 21,026 sq ft once merged. An earlier approval of much the same plan had expired; under the new state thresholds it came back as a minor land development project. The ward's councillor raised resident behaviour, on-street parking and houses converted for students, and residents called it a dormitory; staff said it was multifamily housing because each unit is self-contained. Height and parking adjustments and the plan were approved 6 to 0, with short-term rentals prohibited and the lots to be merged.",
    src: ["psr663a2411", "pmin241119"],
  },
  {
    name: "217 Angell Street", addr: "217 Angell Street", lot: "AP 13 Lot 320", zone: "R-P", units: 32, aff: 0, route: "minor",
    routeLabel: "Minor land development project (residential)",
    status: "approved", statusLabel: "Preliminary approved 6–0",
    notes: "A 57 ft, five-story building of 32 three-bedroom condominiums with 45 parking spaces, mostly under the building, on a vacant lot of about 19,513 sq ft at Angell and Brook Streets and Fones Alley. Adjustments for height (45 ft allowed), corner side setbacks of 4 ft and none (10 ft required), a 21 ft 3 in rear yard (30 ft) and 68.75% building coverage (55%); impervious coverage over the limit was allowed by administrative modification. A nearby property owner opposed it through counsel and a land use consultant; one resident spoke in support. Approved 6 to 0, with the applicant's offer as conditions: no renting to undergraduates, renting to graduate students only by vote of the condominium board, and $500 fines for disruptive behaviour.",
    src: ["psr217a2503", "pmin250318"],
  },
  {
    at: { lat: 41.803171, lon: -71.426137, exact: true }, parcels: ["PR 049-0603-0000"],
    name: "327 Elmwood Avenue", addr: "327 Elmwood Avenue", lot: "AP 49 Lot 603", zone: "C-2", units: 44, aff: 44, route: "minor",
    routeLabel: "Minor land development project (mixed use, affordable)",
    status: "approved", statusLabel: "Preliminary approved 4–0",
    notes: "A 59 ft, five-story building with commercial space on the ground floor and 44 homes at 80% of area median income, by a nonprofit developer on land owned by the Providence Redevelopment Agency; the mix of incomes is set by income averaging. The lot is vacant and about 9,474 sq ft, so no parking is required; 22 bicycle spaces are provided. The height was sought to make the commercial space and the affordable housing viable. The height adjustment, a design waiver for entrances deeper than 6 ft (8 ft at the corner, more at the residential door) and the preliminary plan were approved 4 to 0. An earlier staff report for this site, from 2022, is on the City's site and not read.",
    src: ["psr327e2504", "pmin250415"],
  },
  {
    at: { lat: 41.817332, lon: -71.426952, exact: true }, parcels: ["PR 032-0050-0000"],
    name: "1107 Westminster Street", addr: "1107 Westminster Street", lot: "AP 32 Lot 50", zone: "C-2", units: 17, aff: 0, route: "minor",
    routeLabel: "Minor land development project (mixed use)",
    status: "approved", statusLabel: "Preliminary approved 4–0; extended a year in 2026",
    notes: "A 56 ft, five-story building on a vacant lot, with a shop for a third-party tenant on the ground floor and 17 apartments; no parking required, six spaces provided. The height adjustment was granted on the condition that it take effect only once the ordinance is amended, or a court decides, to allow adjustments for both height in feet and stories, the point on which a court had vacated 128 Wayland Avenue's approval. A design waiver for entrance width and the plan were approved 4 to 0, one member recused. In May 2026 the approval was extended by a year because a neighbouring development affected staging.",
    src: ["psr1107w2505", "pmin250520", "pmin260507"],
  },
  {
    at: { lat: 41.806313, lon: -71.41049, exact: true }, parcels: ["PR 048-0938-0000", "PR 048-0939-0000"],
    name: "290 and 298 Public Street", addr: "290 and 298 Public Street", lot: "AP 48 Lots 938 & 939", zone: "R-P", units: 39, aff: 0, route: "minor",
    routeLabel: "Minor land development project with unified development review (residential)",
    status: "approved", statusLabel: "Preliminary approved 4–0",
    notes: "A 49 ft, four-story building of 39 homes, affordable and for people with special needs, by a nonprofit developer on a through lot of about 21,115 sq ft. Adjustments for height (45 ft allowed), side setbacks of 6 and 7 ft (10 ft) and 20 parking spaces where 39 are required; through unified development review, variances for rear-yard and total impervious coverage, which staff tied to the accessibility the housing must meet. August 2025's hearing was continued for want of a quorum after two members recused; in September all relief and the plan were approved 4 to 0. How many homes are affordable is not given; the count above is left at zero for that reason.",
    src: ["psr290p2508", "pmin250819", "psr290p2509", "pmin250916"],
  },
  {
    at: { lat: 41.817854, lon: -71.422652, exact: true }, parcels: ["PR 029-0137-0000", "PR 029-0135-0000"],
    name: "885 Westminster Street", addr: "885 Westminster Street", lot: "AP 29 Lots 137 & 135", zone: "C-2", units: 74, aff: 0, route: "minor",
    routeLabel: "Minor land development project (about 2,425 sq ft commercial)",
    status: "approved", statusLabel: "Preliminary approved 5–0; extended a year in 2026",
    notes: "Three stories of apartments added to a two-story commercial building, about 64 ft and six stories counting a partial basement (50 ft and four allowed), with 38 parking spaces where 74 are required, on about 17,704 sq ft. Letters to the Commission asked for affordable units; the chair said it had no way to require them. Height and parking adjustments and a deferred signage plan were granted and the plan approved 5 to 0, on conditions including state permits at the final stage and merging with Lot 135. Extended a year in September 2026 while the applicant waits on other approvals. The case number is 24-053MIL on the agenda, 25-053MIL on the staff report and 23-053MIL on the extension.",
    src: ["psr885w2509", "pmin250916", "pmin260915"],
  },
  {
    at: { lat: 41.815727, lon: -71.440782, exact: true }, parcels: ["PR 035-0542-0000"],
    name: "31 Dike Street", addr: "31 Dike Street", lot: "AP 35 Lot 542", zone: "C-2", units: 28, aff: 0, route: "major",
    routeLabel: "Major land development project (mixed use)",
    status: "pending", statusLabel: "Master plan approved 5–0",
    notes: "A 66 ft, six-story building on about 5,851 sq ft after a subdivision, with 14 parking spaces on the ground floor (none required), 28 homes above and commercial space on the top floor. A design waiver from the 60% front build-to percentage and the height adjustment were granted, and the master plan approved 5 to 0, on condition that the preliminary design follow the staff's and Commission's design comments. The preliminary plan is still to come. The minutes put the homes on the second to fourth stories, the staff report on four upper stories.",
    src: ["psr31d2609", "pmin260915"],
  },
  {
    at: { lat: 41.83759, lon: -71.422581, exact: true }, parcels: ["PR 068-0846-0000"],
    name: "203 Douglas Avenue", addr: "203 Douglas Avenue", lot: "AP 68 Lot 846", zone: "C-2", units: 21, aff: 0, route: "minor",
    routeLabel: "Minor land development project (mixed use)",
    status: "pending", statusLabel: "Continued to October 20, 2026",
    notes: "A mixed-use building with commercial space on the ground floor and 21 apartments, seeking a height adjustment to 49 ft 2 in and five stories (50 ft and four allowed) and waivers for the transformer's location and a drainage plan. Listed for July 28, 2026, and continued at the applicant's request to August 18 and then to October 20. No staff report is posted yet.",
    src: ["pmin260818"],
  },
];
