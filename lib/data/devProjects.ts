/*
 * Verification and maintenance projects, with where each stands and an idea for it.
 * status: built = works today; partial = started; idea = nothing built.
 * effort: S = an afternoon, M = a few days, L = needs a decision or a larger review first.
 */
export type ProjectStatus = "built" | "partial" | "idea";

export interface DevProject {
  group: "Verification" | "Maintenance";
  title: string;
  status: ProjectStatus;
  effort: "S" | "M" | "L";
  now: string;
  idea: string;
}

export const DEV_PROJECTS: DevProject[] = [
  { group: "Verification", title: "Quote check for timelines", status: "built", effort: "S",
    now: "verify.py finds every stored quote word for word in the fetched document, and fails a decision with no quote.",
    idea: "Run it on every pull request, not only in the monthly action." },
  { group: "Verification", title: "Quote check for the whole site", status: "built", effort: "S",
    now: "scripts/towns/verify_quotes.py checks any data file against the local source folder. All 186 stored quotes match: 115 for Providence, 71 for Cumberland and state law. The first full run found one fault, a full stop added to a quote from Cumberland's ordinance. One more value comes from live data and cannot be matched.",
    idea: "Run it on every pull request. That needs the sources in the runner, which means fetching the ones a script can reach and deciding what to do about the ones saved by hand." },
  { group: "Verification", title: "Zoning Atlas against the ordinance", status: "partial", effort: "M",
    now: "Reading Providence's ordinance of July 2026 showed the 2024 Atlas is wrong for it: two districts no longer exist, and four or more units are now possible by special use permit where the Atlas says prohibited. Providence's use, height and parking findings now come from the ordinance.",
    idea: "For each town read to level 3, store its use table and height limits beside the Atlas values and show the differences. Level 1 towns keep the Atlas, with the standing notice that it is from September 2024." },
  { group: "Verification", title: "Machine transcripts of meeting recordings", status: "partial", effort: "M",
    now: "fetch_captions.py takes YouTube's automatic captions. Ten concerns from one Providence hearing are on the site, each marked as a machine transcript and linked to its moment in the recording. A decision may rest on one only where the minutes leave a gap, with the reason stated.",
    idea: "Read the remaining recordings for the trial area. For a recording with no captions, run speech recognition locally on the audio." },
  { group: "Verification", title: "Text recognition for scanned minutes", status: "idea", effort: "S",
    now: "Of the 36 Providence minutes filed since 2024, 23 are scans. Four dated events were transcribed by eye and are marked so on the timeline.",
    idea: "Run ocrmypdf in the fetch step and match quotes against its output, marked as machine-read. Keep the read-by-eye mark for anything recognition gets wrong." },
  { group: "Verification", title: "Sample projects per town", status: "idea", effort: "S",
    now: "A town's route rule and findings are code, checked once by running four sample projects by hand.",
    idea: "Store those samples with the route and finding titles they should give, and fail the build when the output changes. It is the before-and-after comparison the statewide plan asks for, kept." },
  { group: "Verification", title: "Where the city's documents disagree", status: "idea", effort: "S",
    now: "Unit counts, case numbers and neighbourhood names differ between agendas and staff reports for three of five Providence projects. The notes say so in prose.",
    idea: "Give a record field more than one sourced value, and show both. A disagreement is information for the applicant, and a prompt to ask staff." },
  { group: "Verification", title: "Close the two unchecked dates", status: "partial", effort: "S",
    now: "Haley's Commons Jun 26, 2025 and Waterman Pond's Oct 21, 2025 TRC are marked not yet checked on the timeline.",
    idea: "Find the agenda or minutes that carry each date, add a quote, and drop the flag. verify.py already rejects a flagged event that also has a quote, so the flag cannot be forgotten." },
  { group: "Verification", title: "Catch misreadings, not only invented quotes", status: "idea", effort: "M",
    now: "A real sentence can be attached to the wrong event, such as a continuance recorded as a decision. Nothing catches that.",
    idea: "For decisions only, require the quote to contain a decision word (approved, denied, voted, passed) and a vote or date. Add a second independent reader for decisions, an AI or a person who sees only the passage and must name the outcome. Differences go to the reviewer." },
  { group: "Verification", title: "Risk score per stage", status: "idea", effort: "L",
    now: "The verification page rates each of seven stages low, medium or high.",
    idea: "Give each stage a likelihood and an impact on a small fixed scale, show the product, and roll up to a tier per record. Keep it coarse. A number like 87% would claim more precision than the data has." },
  { group: "Verification", title: "Sample audit of old records", status: "idea", effort: "M",
    now: "Records carry a checked date and are not re-read.",
    idea: "Each month, pick three events at random, re-fetch their sources and re-run the match. Report the miss rate on the verification page. That number is the honest measure of how far to trust the rest." },
  { group: "Verification", title: "Videos and transcripts", status: "idea", effort: "M",
    now: "Meeting videos are linked and never read. Hearing prep draws partly on them.",
    idea: "Pull captions where the platform provides them, store the text, and quote against that. Mark anything from a machine transcript as such." },
  { group: "Verification", title: "Names of private people", status: "partial", effort: "S",
    now: "verify.py restricts roles. It cannot tell a company from a person by name.",
    idea: "Flag any party name that does not contain a business or professional marker (LLC, Inc, Law, Engineering, Associates) and send it to the reviewer." },
  { group: "Verification", title: "Town sheets confirmed by staff", status: "idea", effort: "L",
    now: "No town's local steps have been confirmed by its planning office.",
    idea: "A one-page sheet per town of the roughly 30 questions the overlay needs, each answered with a quote. Send it to staff and record who confirmed and when." },

  { group: "Maintenance", title: "Meeting calendar watch", status: "idea", effort: "M",
    now: "Cumberland's 2026 dates are read once. A cancellation or a new year's schedule would not be noticed.",
    idea: "Weekly action: fetch the schedule PDF and the state Open Meetings notices, compare against the stored rows, and open an issue on a change. In December, open an issue for towns with no next-year schedule. An issue, not an edit, so a person confirms." },
  { group: "Maintenance", title: "Source link check", status: "idea", effort: "S",
    now: "sources.ts holds every cited URL. Links to town sites and PDFs move.",
    idea: "Monthly action: request each URL, record status and a content hash, and open one issue listing the dead or changed ones. The fetch step in the timelines action already does the download." },
  { group: "Maintenance", title: "Statute and regulation change watch", status: "idea", effort: "M",
    now: "State law changed in 2026 (parking near transit, permit timing) and the site learned of it by hand.",
    idea: "Hash the cited statute pages and Cumberland's regulations PDF monthly. A changed hash opens an issue naming the requirements in trees.ts that cite it. Pair it with the quote check above so a changed sentence fails." },
  { group: "Maintenance", title: "Zoning Atlas drift", status: "partial", effort: "S",
    now: "The browser compares the live layer with the bundled Cumberland snapshot and flags differences to the user.",
    idea: "Run the same comparison in an action, so the snapshot is refreshed by a pull request and the flag is not the only signal." },
  { group: "Maintenance", title: "Monthly timelines action", status: "partial", effort: "S",
    now: "Written and run locally. Guesses the agenda file name for each Thursday, and has not run on GitHub.",
    idea: "Trigger it once by hand, read the report it opens, and fix the file-name guess if it misses a meeting. Compare the Thursdays it checked with the real schedule." },
  { group: "Maintenance", title: "Checks on every pull request", status: "idea", effort: "S",
    now: "The only workflow deploys to Pages. Nothing runs typecheck, build or verify.py before a merge.",
    idea: "Add a workflow that runs typecheck, build and verify.py --offline on every pull request." },
  { group: "Maintenance", title: "Open Meetings fetcher for every town", status: "partial", effort: "M",
    now: "The trial read the Providence City Plan Commission's agendas and minutes from the state Open Meetings site with a short script. Every public body in the state files there.",
    idea: "Make it the second fetcher beside the ClerkBase one: body id in the town's record, a pause between requests, and the same report of new meetings. It also gives real meeting dates to check each calendar against." },
  { group: "Maintenance", title: "Sources a script cannot fetch", status: "partial", effort: "M",
    now: "providenceri.gov refuses scripted requests. fetch_sources.py lists those files to save by hand.",
    idea: "Ask the city for permission or a feed, which fits the plan to have staff confirm the sheet. Until then, keep a dated hash of each hand-saved file in the repository so a changed document is noticed at the next save." },
  { group: "Maintenance", title: "Coverage claims checked at build", status: "idea", effort: "S",
    now: "A town's level, and the level of a part of it, are typed in by hand.",
    idea: "Fail the build when a level is claimed without the data behind it, and keep the trial mark until a confirmation with a name and date is recorded." },
  { group: "Maintenance", title: "Staleness of town levels", status: "idea", effort: "S",
    now: "Each town has a level and Cumberland has a read date. Nothing flags old reads.",
    idea: "Store a read date per fact. Show a notice on any town page whose read is older than a year, and open an issue from the same check." },
  { group: "Maintenance", title: "Stand-in list kept honest", status: "idea", effort: "S",
    now: "The list of demo parts is written by hand and can drift from the site.",
    idea: "Have each demo tag register its id, and fail the build when a tag has no entry in the list or an entry has no tag." },
];
