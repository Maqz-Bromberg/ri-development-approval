import type { Heard, Objection } from "../../../types";

/*
 * Concerns documented at City Plan Commission hearings on Fox Point and Wayland projects, and in one court decision.
 * Trial reading, 2026-11-13. Residents are described by role, never by name, though the minutes name them.
 * `q` is a sentence from the first source, word for word, checked by scripts/towns/verify_quotes.py.
 * Entries with no `q` come from scanned minutes that no script could read; they were read by eye.
 * Entries whose first source is a recording (`pvid…`) come from YouTube's automatic captions: a machine transcript.
 * Their `q` is copied exactly as the captions have it, mishearings included, and `t` is the second the passage starts.
 * A machine transcript supports a concern. A decision is taken from the minutes (docs/ARD.md, D7).
 * Keep `src` before `q` on the same line.
 */
const ER = "27 East River Street, W-2";
const H = (date: string, body: string, project: string, rest: Omit<Heard, "locality" | "date" | "body" | "project">): Heard => ({ locality: "providence", date, body, project, ...rest });
const CPC = "City Plan Commission";
/** The January 2025 hearing on 269 Wickenden Street. Its minutes say only that a discussion ensued; the recording runs to an hour of public comment. */
const W = (rest: Omit<Heard, "locality" | "date" | "body" | "project" | "outcome">): Heard =>
  H("2025-01-21", `${CPC} (preliminary plan hearing)`, "269 Wickenden Street, 74 units, C-2", { ...rest, outcome: "Continued, then approved 4–1 in February" });

export const PROVIDENCE_HEARD: Record<string, Heard[]> = {
  traffic: [
    W({
      who: "The president of the neighbourhood association, a shop owner and residents", said: "The loading zone faced Wickenden Street, two narrow lanes, where a truck could not back out without stopping traffic. One asked where residents' moving trucks would load at all.",
      answer: "The Commission continued the plan for detail on loading. By February, Public Works had approved a loading space on Brook Street instead.",
      src: ["pvid250121", "pmin250218"], q: "we will never be able to see a truck back out without halting traffic in that area", t: 9870,
    }),
    H("2024-10-15", `${CPC} (dimensional adjustments)`, `${ER}, 326 units as first proposed`, {
      who: "Two residents at public comment", said: "Opposed the project over added traffic, along with its height and reduced parking.",
      answer: "The Commission would not let the adjustments take effect until a preliminary plan was filed that took a traffic study into account.", outcome: "Adjustments granted 3–1, with conditions",
      src: ["pmin241015"], q: "The adjustments shall not become effective until a preliminary plan which considers the traffic",
    }),
    H("2025-12-16", `${CPC} (preliminary plan)`, `${ER}, 355 units`, {
      who: "The applicant's traffic engineer, questioned by the Commission and the public", said: "Reported driveways at level of service B or better and the nearby roundabout at C or better. Members of the public asked about deliveries.",
      answer: "The engineer said deliveries mostly fall outside peak hours. The Commission made the study subject to the City Traffic Engineer's approval.", outcome: "Approved 5–0",
      src: ["pmin251216"], q: "The traffic study shall be subject to the Traffic Engineer’s approval prior to final plan approval.",
    }),
  ],
  parking: [
    W({
      who: "A resident who lives a block away, a coffee shop owner of 40 years on the street, and others", said: "With no parking in the building, the cars of 74 households would go onto streets where residents and customers already circle for a space.",
      answer: "No answer from the applicant is in the part of the recording read. The exemption for small lots was not reopened.",
      src: ["pvid250121"], q: "I live a block away from from where this building is going to be and already there isn't enough parking", t: 9750,
    }),
    W({
      who: "An attorney for seven abutters", said: "The two lots together measure 10,108 sq ft, over the line for the parking exemption. Carving off 108 sq ft as open space to get under it was not permissible, since the strip was neither permanent open space nor reserved for a public purpose.",
      answer: "By February the staff report said the applicant had instead obtained an administrative modification from Inspection and Standards to qualify as a lot under 10,000 sq ft.",
      src: ["pvid250121", "psr269w2502"], q: "the way that they're trying to get around this is by carving off a 108 Square ft lot at the south portion of the building", t: 8910,
    }),
    W({
      who: "Four supporters, among them a high-school student and two transport advocates", said: "Welcomed a building with no parking. It would draw residents without cars, and a garage would add cost that renters pay.",
      src: ["pvid250121"], q: "we love the fact that there's no parking included", t: 10110,
    }),
    H("2024-10-15", `${CPC} (dimensional adjustments)`, `${ER}, 326 units as first proposed`, {
      who: "A City Council member, by letter, and residents", said: "Objected to a 50% parking reduction, 163 spaces for 326 units.",
      answer: "The applicant offered compact spaces to get closer to one space per unit. The Commission made that search a condition, and the revised plan had 281 spaces for 355 units.", outcome: "Adjustments granted 3–1, with conditions",
      src: ["pmin241015"], q: "The applicant shall explore ways to provide one to one parking by exploring options like leasing",
    }),
    H("2025-08-19", `${CPC} (major change)`, "150 Pitman Street, 16 units cut to 8, C-2", {
      who: "The applicant's attorney, answering the chair", said: "The reverse case. An approved 16-unit building was cut to 8 units because buyers wanted more than one parking space each.",
      answer: "A commissioner said the design underused the site, and a resident asked for more homes on it.", outcome: "Continued, then approved 6–0 in September",
      src: ["pmin250819"], q: "the change was being requested due to increased demand for parking where potential buyers wanted",
    }),
    H("2024-09-23", "Superior Court (appeal of a master plan approval)", "269 Wickenden Street, 75 units, C-2", {
      who: "Neighbours, on appeal", said: "Argued that splitting off a 108 sq ft lot, to bring the site to 10,000 sq ft and exempt it from parking, was a way round the requirement.",
      answer: "The court called the manoeuvre troubling but did not rule on it, because no subdivision application was before it.", outcome: "Appeal denied",
      src: ["pc241374"], q: "apparent maneuver to bypass parking standards seems to undermine",
    }),
  ],
  character: [
    W({
      who: "An abutter of 20 years, and several residents", said: "Wickenden Street is two- and three-story buildings, and a five-story building on the corner does not fit. Comparing its height with a church missed the point: the comparison is the buildings next to it.",
      answer: "The height adjustment had been granted with the master plan in 2023 and upheld on appeal, so this hearing did not reopen it.",
      src: ["pvid250121", "psr269w2502"], q: "street is a bunch of two story thre story buildings like putting that giant building on the corner it just doesn't fit in", t: 10830,
    }),
    H("2025-12-16", `${CPC} (preliminary plan)`, `${ER}, 355 units`, {
      who: "The president of a parks conservancy and three residents", said: "Concerned about the building's size and massing beside nearby parks. One said it should be scaled back, another that it was wrong for the site.",
      answer: "The architect said the height had come down 10 ft since the first plan and the parking was screened to read as townhouses from the street.", outcome: "Approved 5–0",
      src: ["pmin251216"], q: "the building’s size and massing on nearby parks",
    }),
    H("2024-09-23", "Superior Court (appeal of a master plan approval)", "269 Wickenden Street, 75 units, C-2", {
      who: "Neighbours, on appeal", said: "Relied on the 2001 neighbourhood plan for College Hill, Wayland and Fox Point to argue the building did not fit Wickenden Street.",
      answer: "The Board of Appeal and the court held that the neighbourhood plan is not part of the Comprehensive Plan, so the Commission's findings did not have to follow it.", outcome: "Appeal denied",
      src: ["pc241374"], q: "findings did not need to be consistent with the CWF neighborhood plan was not clearly erroneous",
    }),
  ],
  variances: [
    W({
      who: "An attorney for seven abutters", said: "The average grade had been worked out the wrong way. Taken from the four corners of the foundation, the lowest level would be a basement and count as a story. The margin was an inch and a half.",
      answer: "The plan heard in February carried a height diagram, and the staff report found the lowest level more than half below grade, so a cellar.",
      src: ["pvid250121", "psr269w2502"], q: "this is a difference of one and a half inches so positioning of where the", t: 9240,
    }),
    H("2024-10-15", `${CPC} (dimensional adjustments)`, `${ER}, 326 units as first proposed`, {
      who: "A commissioner", said: "Was uncomfortable granting height and parking adjustments before seeing a traffic study and more developed plans, and voted no.",
      answer: "Staff compared it to voting on adjustments at a master plan stage. The chair proposed granting them on conditions.", outcome: "Adjustments granted 3–1, with conditions",
      src: ["pmin241015"], q: "was uncomfortable taking action without seeing a traffic study and more developed plans",
    }),
    H("2024-09-23", "Superior Court (appeal of a master plan approval)", "269 Wickenden Street, 75 units, C-2", {
      who: "Neighbours, on appeal", said: "Argued the lowest level was a basement, not a cellar, which would make the building one story taller than the adjustment allowed.",
      answer: "The court left it to the preliminary plan, where the applicant had to show the level was a cellar. The 2025 plan included a height diagram for that purpose.", outcome: "Appeal denied",
      src: ["pc241374"], q: "providing further clarification on this issue at the preliminary plan stage",
    }),
    H("2025-09-16", `${CPC} (preliminary plan, reheard)`, "128 Wayland Avenue, 22 apartments, C-2", {
      who: "The City's solicitor, explaining a court ruling", said: "The first approval was vacated because the court found the Commission could not adjust both the height in feet and the number of stories.",
      answer: "The ordinance was amended to allow both, and the plan was treated as a new preliminary submission.", outcome: "Re-approved 6–0",
      src: ["pmin250916"],
    }),
  ],
  stormwater: [
    H("2025-12-16", `${CPC} (preliminary plan)`, `${ER}, 355 units`, {
      who: "The chair", said: "Asked whether the engineers had run the numbers to show the drainage system would work, and how the plan met the coastal rules.",
      answer: "The engineer said the plan was conceptual. The Commission made it subject to the City Engineer's approval before the final plan.", outcome: "Approved 5–0",
      src: ["pmin251216"], q: "The drainage plan shall be subject to the City Engineer’s approval prior to final plan approval.",
    }),
  ],
  trees: [
    W({
      who: "The co-chair of a park group, who planted the street trees with neighbours in 1991", said: "The row of elms along Wickenden Street took decades of care to grow and could not be replaced by new planting. It is always easier to take trees down during large construction.",
      answer: "The February approval made the landscaping plan subject to the City Forester and the applicant responsible for the street trees.",
      src: ["pvid250121", "pmin250218"], q: "it's always easier to take trees down when you're doing large construction", t: 10470,
    }),
    H("2025-12-16", `${CPC} (preliminary plan)`, `${ER}, 355 units`, {
      who: "A commissioner", said: "Said the applicant should consult the City and the conservancy when developing the landscaping plan.",
      answer: "The applicant agreed to work with the City Forester, and it became a condition.", outcome: "Approved 5–0",
      src: ["pmin251216"], q: "The applicant shall coordinate and request advice from the City Forester on the appropriate plant",
    }),
    H("2025-02-18", `${CPC} (preliminary plan)`, "269 Wickenden Street, 74 units, C-2", {
      who: "The Commission", said: "Had continued the plan a month earlier for detail on street trees and a planted buffer in the rear yard.",
      answer: "Approved with the landscaping plan subject to the City Forester, and the applicant responsible for planting and maintaining the street trees.", outcome: "Approved 4–1",
      src: ["pmin250218", "pmin250121"],
    }),
  ],
  lighting: [
    H("2025-12-16", `${CPC} (preliminary plan)`, `${ER}, 355 units`, {
      who: "The Commission, as a condition", said: "Required an updated lighting plan with cut-off, dark-sky fixtures at the final plan.",
      outcome: "Approved 5–0",
      src: ["pmin251216"], q: "An updated and fully compliant lighting plan that employs cut-off and dark sky compliant fixtures",
    }),
  ],
  construction: [
    H("2025-09-16", `${CPC} (preliminary plan, reheard)`, "128 Wayland Avenue, 22 apartments, C-2", {
      who: "The owner of the property behind the site", said: "Concerned about how her retaining wall and foundation had been evaluated, and asked that the applicant carry liability insurance and post a bond.",
      answer: "The applicant had filed an engineer's memo on the walls. The chair said bonds are for public improvements, and that insurance and trespass belong to the permitting process.", outcome: "Approved 6–0",
      src: ["pmin250916"],
    }),
  ],
  emergency: [
    W({
      who: "A shop owner on the street for 40 years", said: "Asked whether fire trucks could make the turn from Brook Street onto Wickenden Street, with deliveries also made from the street.",
      src: ["pvid250121"], q: "will the fire trucks be able to make that that that swing onto", t: 10620,
    }),
  ],
  affordability: [
    W({
      who: "Three residents", said: "None of the 74 units was to be affordable, so the building would not help those in the housing crisis. One asked what share would be affordable, another how many bedrooms the units had, since the shortage is of homes for families.",
      answer: "Supporters replied that new market-rate homes also bring rents down. At a later hearing on another project the chair said the Commission has no mechanism to require affordable units.",
      src: ["pvid250121", "pmin250916"], q: "what percentage of your apartments will be classified as affordable or lowincome", t: 11070,
    }),
  ],
  outreach: [
    H("2024-10-15", `${CPC} (dimensional adjustments)`, `${ER}, 326 units as first proposed`, {
      who: "A City Council member, by letter, and three residents", said: "Said there had been no community engagement and asked that the plan not be heard, or be continued, until outreach had taken place.",
      answer: "The applicant said he had spoken to another councillor and to neighbours. The Commission made documented outreach a condition, and the 2025 presentation described it.", outcome: "Adjustments granted 3–1, with conditions",
      src: ["pmin241015"], q: "The applicant shall conduct and document community outreach.",
    }),
  ],
  design: [
    W({
      who: "A resident", said: "The building looked cheaply built for a main business street: the drawings showed fibre cement siding and asphalt shingles that looked the same. The neighbourhood association asked whether the applicant would be held to the quality shown in the renderings.",
      src: ["pvid250121"], q: "this building as presented feels and looks cheaply constructed and sets a poor building material standard", t: 11010,
    }),
    H("2025-08-19", `${CPC} (major change)`, "150 Pitman Street, 16 units cut to 8, C-2", {
      who: "A commissioner", said: "Asked whether the applicant would use wood instead of a material made to look like wood, and why the building left a gap over the garage like a missing tooth.",
      answer: "The item was continued a month for a revised design. The approval then required alternative colours or treatments for the wood-look finish.", outcome: "Continued, then approved 6–0",
      src: ["pmin250819"], q: "asked if the applicant was open to use wood as a treatment instead of",
    }),
    H("2025-09-16", `${CPC} (preliminary plan, reheard)`, "128 Wayland Avenue, 22 apartments, C-2", {
      who: "A commissioner", said: "Asked for real wood, or a different shade of panel, in place of fibre cement made to look like wood.",
      answer: "Condition of approval: solid coloured panels instead of the wood grain.", outcome: "Approved 6–0",
      src: ["pmin250916"],
    }),
  ],
};

/** Three concerns that came up in Providence and were not in the list drawn from Cumberland's hearings. */
export const PROVIDENCE_OBJECTIONS: Objection[] = [
  {
    id: "affordability", topic: "Who will live there",
    said: "None of it is affordable. How does this help?",
    weight: "not",
    boardView: "Providence's Commission has said it has no mechanism to require affordable units in a project that offers none. But housing for low and moderate income families is one of the grounds that makes a project eligible for a height, density or parking adjustment.",
    response: "Say what the rents or prices and the bedroom mix will be, without being asked. If you are asking for an adjustment, weigh whether a few income-restricted units would be a stronger ground than the one you have.",
    say: "These are market-rate homes: 12 one-bedrooms and 10 two-bedrooms. We are not asking for an adjustment on the ground of affordable housing, and we are not claiming this building solves the shortage on its own.",
    bring: [{ step: "zoning", doc: "Adjustments the Commission can grant" }],
    heard: [],
  },
  {
    id: "outreach", topic: "Size and character",
    said: "Nobody told the neighbourhood about this.",
    weight: "partly",
    boardView: "Legal notice is required and outreach is not. But Providence's application form tells applicants to inform the ward councillor and encourages them to meet neighbourhood groups, and the Commission has made documented outreach a condition.",
    response: "Meet the ward councillor and the nearest neighbourhood and parks groups before you file, and keep a dated record of who you met and what you changed. Bring that record to the hearing.",
    say: "We met the ward councillor in March and the neighbourhood association twice. After those meetings we lowered the building and screened the garage. The log is in your packet.",
    bring: [{ step: "preapp", doc: "Tell the ward councillor and neighbourhood groups" }],
    heard: [],
  },
  {
    id: "design", topic: "Size and character",
    said: "It looks cheap, and it doesn't fit the street.",
    weight: "partly",
    boardView: "Materials and design standards are in the Zoning Ordinance, and the Commission reviews elevations and renderings. It has attached conditions about facade materials to approvals.",
    response: "Show the materials honestly in the renderings and bring samples. If a finish imitates another material, expect to be asked for the real one or a plain alternative, and have a priced option ready.",
    say: "The upper floors are fibre cement panel in a solid colour, not a printed wood grain. Samples are on the table, and sheet A-4 shows them beside the neighbouring buildings.",
    bring: [{ step: "prelim", doc: "Elevations with transparency and height" }, { step: "prelim", doc: "Renderings from the street" }],
    heard: [],
  },
];
