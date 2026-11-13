# Plan: real project timelines, kept current by a GitHub Action

Status: draft for review. Nothing here is built.

## What changes for the applicant

The schedule shows statutory maximums and round estimates. A developer wants to know how long it actually took someone like them. The site already holds the raw material for eight Cumberland projects in `lib/data/history.ts`, with dated records such as "Jun 27, 2024: pre-application" and "Sep 25, 2025: preliminary plan approved 7–2". Those dates are free text, so nothing can be computed from them.

The goal is a small set of worked examples, each showing:

- the dated milestones the public record supports, from first appearance to the latest stage,
- the elapsed time between stages, beside the statutory clock for that stage,
- who the applicant, engineer, attorney and builder were, where the record names them,
- public statements and press coverage, linked,
- what is not known (construction start and completion usually aren't in planning records).

On the schedule page this becomes a second row under each step: "Statutory: 115 days. Haley's Commons: 91 days from hearing opened to vote, after two continuances."

## Data shape

Replace the free-text `record: string[]` with dated events, and keep everything sourced:

```ts
export interface TimelineEvent {
  date: string;                       // ISO; "2025-09" when only the month is known
  stage: "trc" | "preapp" | "master" | "prelim" | "final" | "recorded" | "permit" | "start" | "co" | "other";
  what: string;                       // "Preliminary plan approved 7–2"
  kind: "filed" | "certified" | "heard" | "continued" | "decided" | "reported";
  src: string[];                      // ids in sources.ts
  quote?: string;                     // verbatim, required for "decided"
}

export interface Precedent {
  // existing fields stay
  events: TimelineEvent[];
  parties?: { role: "applicant" | "owner" | "engineer" | "attorney" | "architect" | "builder"; name: string; src: string }[];
  coverage?: { label: string; url: string; date: string; kind: "press" | "statement" | "video" }[];
  /** ISO date the record was last checked for new events */
  checked: string;
}
```

Rules carried over from the existing data and from the Exeter zoning record:

- A decision needs a verbatim quote that appears in its source document, or the build fails.
- Companies and professionals acting in that role are named. Private residents are not.
- An outcome is stated only where a source states it.
- Elapsed times are computed, never typed.

## Sources, by what they can prove

| Milestone | Where it is public | Notes |
| --- | --- | --- |
| Pre-application, master, preliminary, final hearings and votes | Planning Board agendas and minutes (ClerkBase for Cumberland) | The core. Minutes for one meeting are attached to the next meeting's agenda. |
| Completeness certification | Staff memos attached to agendas | Stated in some memos ("Certified complete Aug 22, 2025"), absent in others |
| Applicant, engineer, attorney | Agenda item text and minutes | Usually named |
| Recording of the plan | Town Clerk land evidence records | Often searchable online but per-town, and not always free |
| Building permit issued, certificate of occupancy | The town's permit portal, where there is one | Coverage varies. Cumberland's needs checking. |
| Builder / general contractor | Building permit record, press | Often missing from planning records |
| Construction start, completion | Press, developer statements, state funding announcements | The weakest link. Mark as "reported" with the source. |
| Publicly funded projects | RIHousing board minutes and award announcements, state press releases | Good for affordable projects such as Steeple & Stone |

Expect solid data through final approval and patchy data after it. The page should say so plainly, not fill the gap with estimates.

## The action

`.github/workflows/timelines.yml`, triggered by `workflow_dispatch` (with an optional project name) and on a monthly schedule.

1. **Fetch.** `scripts/timelines/fetch.py` downloads new Planning Board agendas and attached minutes since each project's `checked` date into a cache directory (not committed). Same approach as `fetch_minutes.py` in the Exeter project.
2. **Find.** For each tracked project, search the new documents for its plat and lot, address and name. Also list multifamily items that match no tracked project, as candidates.
3. **Propose.** For each hit, draft `TimelineEvent` records with the quote and the source. This is the one step that benefits from a language model: reading a minutes passage and saying "this is a continuance to the August meeting". It runs with the passage as input and must return the verbatim span it relied on.
4. **Verify.** `scripts/timelines/verify.py` checks every proposed quote appears verbatim in the fetched document, every date parses, and no private resident is named (a check against the roles list). Anything that fails is dropped from the proposal and listed in the report.
5. **Open a pull request.** The action never commits to `main`. The pull request shows the new events per project, the candidates not yet tracked, and what failed verification. A person reviews and merges.

Step 3 needs an API key as a repository secret. Without one the action still runs steps 1, 2, 4 and 5 and reports the passages it found for a person to read. That is a workable first version and has no running cost.

## Order of work

1. Convert the eight existing records to dated `events` by hand, with quotes. This is a few hours and gives the display something real.
2. Build the display: a per-step "what actually happened" row on the schedule, and a timeline strip in the precedent table.
3. Fetch, find and verify scripts, run locally.
4. The workflow, without the model step.
5. The model step, behind the secret.
6. Post-approval milestones (recording, permit, completion) for two or three finished projects, to learn how much of it is really public.

## Risks and open questions

- **Eight projects is a small sample, and five are still pending.** Report ranges and name the projects. Don't average.
- **ClerkBase page structure may change.** The fetch step should fail loudly, not silently return nothing.
- **Naming businesses.** Naming the applicant LLC, engineer and attorney from a public agenda is ordinary, and it is what makes the examples useful to a developer. Should press quotes from named private individuals be linked but not quoted? I'd link only.
- **Selection.** Finished, approved projects are easier to document than withdrawn or denied ones, which biases the picture. Track denials and withdrawals deliberately.
- **Does this generalise?** The scripts assume ClerkBase. Exeter uses it too. Towns on CivicPlus or their own sites need their own fetcher, which the statewide plan covers.

## What I'd want decided before building

1. Is a pull request per run right, or should it open an issue and leave the edit to a person?
2. Is a language model in the loop acceptable, given the verbatim-quote check, or should the action stop at "here are the passages"?
3. Which two or three finished projects matter most for the post-approval milestones?
