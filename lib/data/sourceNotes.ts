/*
 * What the Providence trial (Nov 13, 2026) taught about taking on a new town: each kind of source it needed,
 * each view the data feeds, and how each can be kept true. Shown on /dev.
 * `check`: built = a script does it today; partial = part of it; none = a person has to.
 */
export type CheckState = "built" | "partial" | "none";

export interface SourceNote {
  source: string;
  where: string;
  /** Can a script fetch it? */
  fetch: string;
  feeds: string;
  breaks: string;
  verify: string;
  check: CheckState;
}

export const SOURCE_NOTES: SourceNote[] = [
  { source: "Land development regulations", where: "A dated PDF on the city's site",
    fetch: "No. The site answers 403 to a script. Saved by hand.",
    feeds: "Steps, checklists, fees, clocks, appeal routing, the minor and major thresholds",
    breaks: "Amended yearly. Each amendment is a new file name, so the old link keeps working and goes stale without a 404.",
    verify: "verify_quotes.py matches every stored quote word for word. Watch the Commission's page for a changed regulations link, not the file.", check: "built" },
  { source: "Application forms", where: "PDFs on the city's site, reissued each January",
    fetch: "No, as above.",
    feeds: "Who to contact, how many copies, recording fees, the councillor rule, the no-site-work rule",
    breaks: "Named staff change. The form restates the ordinance, so it can lag an amendment.",
    verify: "Quote check. Re-read each January when the forms are reissued.", check: "built" },
  { source: "Board meeting schedule", where: "A yearly PDF",
    fetch: "No, as above.",
    feeds: "Filing deadlines and meeting dates on the schedule",
    breaks: "In 2026 the Commission met on other days than its schedule in four months of twelve, plus a special meeting.",
    verify: "Compare stored rows weekly with the meeting list on the state Open Meetings site, which a script can read for every public body in the state.", check: "none" },
  { source: "State Open Meetings site", where: "opengov.sos.ri.gov, one page per public body",
    fetch: "Yes, with pauses. It answers 429 to quick runs of requests.",
    feeds: "Agendas, minutes, actual meeting dates. The same fetcher works for all 39 towns.",
    breaks: "Minutes arrive about a month late. Most are scans with no text (23 of 36 since 2024). A meeting can have several notice files.",
    verify: "verify.py for dated events. Scanned minutes need text recognition before any quote can be matched: four events are marked as read by eye.", check: "partial" },
  { source: "Staff reports", where: "One PDF per agenda item on the city's site",
    fetch: "No, as above.",
    feeds: "Lot size, district, units, relief requested, recommendation",
    breaks: "They disagree with the agenda: 22 units against 23, 74 against 75, two case numbers for one project, two neighbourhoods for one lot.",
    verify: "Quote check. Where two city documents differ, store both and say so. Do not pick one.", check: "partial" },
  { source: "Court decisions", where: "courts.ri.gov",
    fetch: "Yes.",
    feeds: "Appeal history, and ordinance text quoted by the court",
    breaks: "The ordinance a decision quotes can be amended afterwards, as section 1904.E was.",
    verify: "Quote check, with the pinpoint saying the ordinance is quoted through the decision. Replace with the ordinance itself once it is read.", check: "built" },
  { source: "Zoning ordinance", where: "A PDF over 10 MB on the city's site",
    fetch: "No. Refused to a script, and too large for the fetch tool used in the trial.",
    feeds: "Should feed height, parking, setbacks and the development plan review thresholds. Today the 2024 Zoning Atlas stands in.",
    breaks: "Amended in 2025 and 2026. The Atlas does not know.",
    verify: "Not read, and the site says so on every Providence page. Reading it is the first job before the trial label comes off.", check: "none" },
  { source: "City web pages", where: "Board, department and staff pages",
    fetch: "No, as above. One board's page was not found at all.",
    feeds: "Contacts, members, meeting place, the list of staff-decided projects",
    breaks: "People and addresses change without notice. An office moved in December 2025.",
    verify: "A dated re-read. Each contact shows its source and what could not be confirmed.", check: "none" },
  { source: "State parcel layer", where: "RIDEM tax parcels, by plat and lot",
    fetch: "Yes.",
    feeds: "Map pins for recorded projects",
    breaks: "A merged lot was missing under its new number. One lot area differs from the staff report by about 13,000 sq ft.",
    verify: "Re-resolve each stored parcel id monthly and report any that no longer exist.", check: "none" },
  { source: "Hearing transcripts and video", where: "Transcripts on request. Video on YouTube.",
    fetch: "Not attempted.",
    feeds: "Nothing yet. Minutes for items with zoning relief say only that a transcript exists.",
    breaks: "The most contested hearings are the least described in the minutes.",
    verify: "Captions or a records request, with anything machine-transcribed marked as such.", check: "none" },
];

export interface ViewNote {
  view: string;
  from: string;
  wrongWhen: string;
  guard: string;
  check: CheckState;
}

/** Every view a town's data reaches, with what would make it wrong and what stands guard. */
export const VIEW_NOTES: ViewNote[] = [
  { view: "Check: route and findings", from: "towns/<town>/rules.ts, steps.ts",
    wrongWhen: "A threshold is misread, or a finding outlives an amendment",
    guard: "Quotes are checked. The logic is not: add a few sample projects per town with the route and finding titles they should give, and fail the build when they change.", check: "partial" },
  { view: "Steps and checklists", from: "towns/<town>/steps.ts",
    wrongWhen: "A document title referenced by the schedule or by hearing prep no longer exists",
    guard: "A one-off script confirmed every reference for Providence. Make it a build check.", check: "partial" },
  { view: "Schedule and calendar", from: "towns/<town>/town.ts, rules.ts",
    wrongWhen: "The board meets off its published pattern, or the new year's schedule is not read",
    guard: "Open Meetings comparison, weekly. An issue, not an edit.", check: "none" },
  { view: "Who decides, and contacts", from: "towns/<town>/town.ts",
    wrongWhen: "Staff or offices change",
    guard: "Read date on each contact, and a yearly re-read. Shown as unconfirmed until staff confirm the sheet.", check: "none" },
  { view: "Records timeline and precedent table", from: "towns/<town>/history.ts, timelines.json",
    wrongWhen: "A real sentence is attached to the wrong event, or a later meeting changes the outcome",
    guard: "verify.py for quotes. The monthly action only looks for new Cumberland agendas: it needs a second fetcher for Open Meetings.", check: "partial" },
  { view: "Map pins", from: "towns/<town>/history.ts",
    wrongWhen: "Parcels merge or are renumbered",
    guard: "Parcel re-resolve, monthly.", check: "none" },
  { view: "Hearing prep", from: "towns/<town>/hearings.ts",
    wrongWhen: "A summary says more than the minutes do, or a resident is named",
    guard: "Each entry carries a checked sentence where the minutes have text. A name scan of the data files found none: make it a build check against the names in the cached minutes.", check: "partial" },
  { view: "Coverage note and Towns page", from: "lib/data/towns.ts",
    wrongWhen: "A level is claimed that the data does not back",
    guard: "Build check: level 3 needs steps, level 4 needs precedent and heard concerns, and trial stays set until a confirmation is recorded.", check: "none" },
];
