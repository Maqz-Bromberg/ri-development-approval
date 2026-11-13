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
  { group: "Verification", title: "Quote check for the whole site", status: "idea", effort: "M",
    now: "About 70 requirements in trees.ts carry a source, a pinpoint and a quote. Nothing checks those quotes against the statute or regulation text.",
    idea: "Point the same fetch and match at trees.ts and the findings in engine.ts. It is the same pattern and covers the claims readers rely on most. Start with the statutes, which are stable pages." },
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
  { group: "Maintenance", title: "Staleness of town levels", status: "idea", effort: "S",
    now: "Each town has a level and Cumberland has a read date. Nothing flags old reads.",
    idea: "Store a read date per fact. Show a notice on any town page whose read is older than a year, and open an issue from the same check." },
  { group: "Maintenance", title: "Stand-in list kept honest", status: "idea", effort: "S",
    now: "The list of demo parts is written by hand and can drift from the site.",
    idea: "Have each demo tag register its id, and fail the build when a tag has no entry in the list or an entry has no tag." },
];
