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

  { area: "Providence trial", q: "Is a level for part of a town the right model, or should level 4 always mean the whole town?", status: "decided", note: "Yes (Nov 14, 2026). Parts are drawn where they are most useful to a developer, and source access may force a part. Today one approximate box per town. See docs/ARD.md, D3 and D4." },
  { area: "Providence trial", q: "Can level 3 be claimed when the zoning ordinance was not read?", status: "decided", note: "The ordinance of July 2026 was read on Nov 14 for the use table, heights, parking and Article 19. Setbacks, coverage and design standards remain unread, and the coverage note says so." },
  { area: "Providence trial", q: "What evidence class does a quote from a machine transcript get, and may it support a decision or only a concern?", status: "decided", note: "Its own class, Machine transcript. It supports a concern. A decision comes from the minutes unless they are missing, scanned or silent, and then the event says why (Nov 14, 2026). Keep this in view for other districts, whose records may differ." },
  { area: "Providence trial", q: "A route now depends on commercial floor area, a fact no other town asks for. Do town-specific inputs belong on the intake form?", status: "open", note: "Shown only for Providence." },
  { area: "Providence trial", q: "Projects under 10 units fall outside Commission review in Providence. What do they get?", status: "decided", note: "Read from the ordinance: 4 to 9 new units get administrative development plan review by staff, in one stage. Up to 3 units get a building permit. Reuse of an existing building counts no new floor area, which staff should confirm." },
  { area: "Providence trial", q: "The district list for Providence still comes from the 2024 Atlas, which has R-2 and C-1. Replace it with the ordinance's list?", status: "open", note: "A flag is shown for those two districts. Where their land went is on the City's zoning map, not read." },
  { area: "Providence trial", q: "May a date read by eye from a scanned page count as a decision?", status: "open", note: "Allowed with a mark. Four events." },
  { area: "Providence trial", q: "Supporters spoke at Providence hearings, and asked for things such as bicycle parking. Hearing prep has no place for them.", status: "open", note: "One entry under parking records four supporters at the Wickenden Street hearing. A proper place is still missing." },
  { area: "Providence trial", q: "Who asks the city for scripted access to its documents, and for staff to confirm the sheet?", status: "review", note: "Not yet. Files are fetched by hand for now, and validation for public use comes later (Nov 14, 2026)." },
  { area: "Providence trial", q: "The full list, with what was found, is in docs/providence-trial-review.html.", status: "review" },

  { area: "Statewide", q: "Which town is the second with full local steps: North Providence, or one as unlike Cumberland as possible?", status: "decided", note: "Nov 18, 2026 (ARD D53): the whole of Providence first, then one town for each kind of edge case, starting with Westerly. North Providence is the fourth chunk, for its ordinance under amendment." },
  { area: "Statewide", q: "Westerly's inclusionary share is 15% of \"the basic number dwelling units per acre permitted in the underlying zone\". Is that 15% of the units proposed, or of the units the lot allows?", status: "open", note: "The site takes 15% of the units entered. Only the planning office can say (docs/manual-fetches.md)." },
  { area: "Providence trial", q: "Does the Capital Center Commission still review development downtown, and where is its district?", status: "open", note: "Its last meeting on the state site was July 9, 2025, and the City's map layer for the district is empty." },
  { area: "Statewide", q: "Is asking town planning staff to confirm their town's sheet part of the plan, and who asks?", status: "open" },
  { area: "Statewide", q: "Housing only, or any development?", status: "open", note: "Housing only keeps the routes to five." },
  { area: "Statewide", q: "Town in the URL (/cumberland/steps), or stay with the town in the project and share link?", status: "open", note: "Currently in the project state." },
  { area: "Statewide", q: "The Hearing prep page still draws its examples from Cumberland's hearings for every town. Hide, label or keep?", status: "open" },
  { area: "Statewide", q: "Documents with no source are shown for every town. Are they all generic?", status: "open", note: "Counted as generic; not each one read." },

  { area: "Site-wide", q: "Automated maintenance across the site: when, and with what tooling?", status: "review", note: "After the design is fully drafted." },
];
