# Plan: real board calendars for every Rhode Island municipality

Status: draft for review. Nothing here is built. Build on a separate branch (`board-calendars`) after review.

## What changes for the applicant

Today the schedule places a hearing a fixed number of days after filing (day 75 of the master plan step, for example). The real constraint is different: a board meets about once a month, and an application has to be filed by a cut-off some weeks before the meeting it wants to be heard at. Missing a cut-off by a day costs a month.

With real calendars, the schedule would:

- snap each filing to the next submission cut-off, and each hearing to the meeting that cut-off feeds,
- say "file by Jan 8 to be heard on Feb 26",
- show the month lost when a start date falls just after a cut-off,
- keep the statutory clock as the outer bound, and show both.

## What is known per municipality

| Fact | Source | Stability |
| --- | --- | --- |
| Meeting dates for the year | The board's adopted annual schedule (PDF or web page), or the Secretary of State's Open Meetings portal | Set once a year, changed occasionally |
| Submission cut-off for each meeting | The same annual schedule, where the town publishes one (Cumberland does: "2026 TRC and Planning Board Meeting Schedule") | Set once a year |
| Regular pattern, such as "last Thursday, 6:30 p.m." | Board web page | Rarely changes |
| Cancellations and special meetings | Open Meetings portal notices, filed at least 48 hours ahead | Changes through the year |
| Technical Review Committee dates | Same schedule, in towns that have a TRC | Set once a year |

The Open Meetings portal (`sos.ri.gov/publicinfo/openmeetings`) is the one statewide source, because the Open Meetings Act requires every public body to file its notices there. It gives meeting dates reliably. It does not give submission cut-offs. Those exist only in each town's own schedule, and some towns publish none and use a rule ("21 days before the meeting") written in their regulations.

## Data shape

One file per municipality, `lib/data/calendars/<town>.ts`, generated and then committed:

```ts
export interface BoardCalendar {
  town: string;                 // "Cumberland"
  body: "pb" | "trc" | "zbr" | "council";
  year: number;
  /** Fallback when a meeting has no listed cut-off: days before the meeting */
  cutoffRule?: { daysBefore: number; src: string };
  meetings: { date: string; cutoff?: string; note?: string; cancelled?: boolean }[];
  src: { label: string; url: string; read: string };  // read = date the source was read
  confidence: "published" | "rule" | "pattern";
}
```

`confidence` drives the label on screen: "from the board's published schedule", "meeting dates published, cut-off from the 21-day rule", or "estimated from the usual pattern (last Thursday)". The third is still a demo value and keeps the demo tag.

## Schedule engine change

`buildSchedule` in `lib/schedule.ts` currently adds `plan.est` days per step. The change:

1. Each tick of kind `hearing` gains a `body`. The step's filing tick gains `feeds: <hearing tick>`.
2. A new `snap(date, calendar)` returns the first meeting whose cut-off is on or after the filing date.
3. A step with a hearing ends at `max(snapped hearing + decision allowance, start)`, capped by the statutory deadline. If the cap comes first, the schedule shows the deadline and notes that the board must act by then.
4. When no calendar exists for the town and year, the current fixed offsets are used and the demo tag stays.

The `.ics` export and the what-if comparison both read `buildSchedule`, so they pick the change up without their own work. The what-if "approval recorded" column becomes more honest: 9 units against 10 would differ by real meetings, not by clock arithmetic.

## Collection, in three passes

**Pass 1: meeting dates for all 39 towns.** A script (`scripts/calendars/fetch_openmeetings.py`) queries the Open Meetings portal for each town's planning board and writes the dates. This covers every town at `confidence: "pattern"` or better, in one run. Open question: the portal has no documented API, so the first task is to check whether its search results can be read reliably, or whether each body's listing page has to be parsed. If neither is stable, fall back to the pattern from each board's web page.

**Pass 2: cut-offs.** For each town, find the annual schedule and read the cut-offs. This is a person-in-the-loop step: a script proposes the values from the PDF, and someone confirms them against the document before they are committed. Expect roughly a third of towns to publish a schedule with cut-offs, a third to state a rule in their regulations, and a third to state neither. Start with the towns that have the most multifamily applications.

**Pass 3: keep it current.** A scheduled GitHub Action re-reads the portal weekly, opens a pull request when a meeting is cancelled, moved or added, and opens an issue each December for towns whose next-year schedule is not in the repo yet. It shares its structure with the action in `real-timelines-action.md`.

## Order of work

1. Cumberland end to end: calendar file from the published 2026 schedule, engine change, schedule and `.ics` output, demo tag removed for Cumberland. This proves the design on the one town that already has steps.
2. Pass 1 for all towns, stored but only shown on the Records page ("next Planning Board meeting: …"), since other towns have no steps yet.
3. Pass 2 for the towns the statewide plan brings in next.
4. The weekly action.

## Risks and open questions

- **Cut-offs are not uniform.** Some towns have one cut-off for completeness review and another for the agenda. The shape above has one. Check five towns before fixing it.
- **A year boundary.** A project starting in October needs next year's calendar, which is usually adopted in December. Until then, project next year from the pattern and mark those dates as estimated.
- **Joint and special meetings** don't fit the monthly pattern. Show them when the portal lists them. Never predict them.
- **Who is responsible when a date is wrong.** A wrong cut-off costs the applicant a month. Every date needs its source link and read date beside it, and the page should say to confirm with the planning office before relying on it.
- **Decision at the hearing or later.** Boards often continue a hearing to the next meeting. Precedent data (Haley's Commons was continued from June to August 2025) suggests showing "one continuance is common" as a second, later estimate.

## What I'd want decided before building

1. Is one cut-off per meeting enough, or do we model completeness and agenda cut-offs separately?
2. Should a town with only pattern-level dates show them, or stay on the current estimates until its schedule is read?
3. Is a weekly pull request from an action acceptable, or should changes land automatically when only dates change?
