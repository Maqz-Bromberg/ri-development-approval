/*
 * Open questions, kept as we go. Add to the top of an area when one comes up, and change its status when it is settled.
 * "review" = deferred to a larger review after the design draft, as agreed.
 */
export type QStatus = "open" | "review" | "decided";

export interface OpenQuestion {
  area: "Board calendars" | "Real timelines" | "Statewide" | "Providence trial" | "Verification" | "Site-wide";
  q: string;
  status: QStatus;
  /** What was decided or assumed so far */
  note?: string;
}

export const OPEN_QUESTIONS: OpenQuestion[] = [
  { area: "Board calendars", q: "How do cancellations and special meetings reach the site?", status: "review", note: "Planned: a weekly GitHub check of the town schedule and the Open Meetings notices that opens an issue, not an edit. Until then every date links to its source." },
  { area: "Board calendars", q: "One filing cut-off per meeting, or separate completeness and agenda cut-offs?", status: "open", note: "One, from Cumberland's schedule. Check about five towns before fixing the shape." },
  { area: "Board calendars", q: "Show pattern-only dates for towns whose schedule has not been read?", status: "decided", note: "Only for Cumberland beyond its published rows, marked est. Other towns keep fixed offsets." },
  { area: "Board calendars", q: "Who is responsible when a date is wrong?", status: "open", note: "Each date shows its source and read date, and the schedule says to confirm with the planning office." },

  { area: "Real timelines", q: "Should an automatic check open a pull request or an issue?", status: "review", note: "A pull request with a report, never an edit to the data." },
  { area: "Real timelines", q: "Is a language model acceptable in the loop, given the verbatim-quote check?", status: "review", note: "Not built. The action stops at the passages." },
  { area: "Real timelines", q: "Which finished projects matter most for post-approval milestones?", status: "open", note: "The From build view exists and is empty." },
  { area: "Real timelines", q: "Link press quotes from named private individuals, or quote them?", status: "open", note: "Plan leans to link only." },
  { area: "Real timelines", q: "How do we track denials and withdrawals, so the examples are not only the successes?", status: "open" },
  { area: "Real timelines", q: "Two dates are not yet checked against a document: Haley's Commons Jun 26, 2025 and Waterman Pond's Oct 21, 2025 TRC.", status: "open", note: "Marked as not yet checked on the timeline." },

  { area: "Verification", q: "Can the risk at each stage be scored so it can be summed per record?", status: "review", note: "The flowchart gives low, medium and high only." },
  { area: "Verification", q: "How often should old records be re-audited by sample?", status: "review" },
  { area: "Verification", q: "Which new-region designations need their own fetcher, and who confirms each town's sheet?", status: "review", note: "Drafted as notes on the verification page." },

  { area: "Providence trial", q: "Is a level for part of a town the right model, or should level 4 always mean the whole town?", status: "open", note: "Built as Providence level 3, Fox Point and Wayland level 4. The box is approximate." },
  { area: "Providence trial", q: "Can level 3 be claimed when the zoning ordinance was not read?", status: "open", note: "Claimed with a stated gap. The alternative is level 2 until it is read." },
  { area: "Providence trial", q: "A route now depends on commercial floor area, a fact no other town asks for. Do town-specific inputs belong on the intake form?", status: "open", note: "Shown only for Providence." },
  { area: "Providence trial", q: "Projects under 10 units fall outside Commission review in Providence. What do they get?", status: "open", note: "Shown as building permit only, with a flag. Development plan review under Article 19 was not read." },
  { area: "Providence trial", q: "May a date read by eye from a scanned page count as a decision?", status: "open", note: "Allowed with a mark. Four events." },
  { area: "Providence trial", q: "Supporters spoke at Providence hearings, and asked for things such as bicycle parking. Hearing prep has no place for them.", status: "open" },
  { area: "Providence trial", q: "Who asks the city for scripted access to its documents, and for staff to confirm the sheet?", status: "open" },
  { area: "Providence trial", q: "The full list, with what was found, is in docs/providence-trial-review.html.", status: "review" },

  { area: "Statewide", q: "Which town is the second with full local steps: North Providence, or one as unlike Cumberland as possible?", status: "open" },
  { area: "Statewide", q: "Is asking town planning staff to confirm their town's sheet part of the plan, and who asks?", status: "open" },
  { area: "Statewide", q: "Housing only, or any development?", status: "open", note: "Housing only keeps the routes to five." },
  { area: "Statewide", q: "Town in the URL (/cumberland/steps), or stay with the town in the project and share link?", status: "open", note: "Currently in the project state." },
  { area: "Statewide", q: "The Hearing prep page still draws its examples from Cumberland's hearings for every town. Hide, label or keep?", status: "open" },
  { area: "Statewide", q: "Documents with no source are shown for every town. Are they all generic?", status: "open", note: "Counted as generic; not each one read." },

  { area: "Site-wide", q: "Automated maintenance across the site: when, and with what tooling?", status: "review", note: "After the design is fully drafted." },
];
