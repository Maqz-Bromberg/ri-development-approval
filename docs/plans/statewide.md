# Plan: from Cumberland to all 39 municipalities

Status: draft for review. Nothing here is built.

## What is already statewide, and what is not

| Layer | Today | Statewide cost |
| --- | --- | --- |
| Zoning districts, permitted housing types, density, height, parking | Rhode Island Zoning Atlas, queried live. The address lookup already returns the town and district anywhere in the state. | None. Change `fetchAtlasDistricts("Cumberland")` to take the town. |
| Parcel, lot area, water and sewer | RIDEM tax parcels and the Atlas utility layers, statewide | None |
| State law: the review stages, the 9-unit line, the 25% comprehensive permit, statutory clocks, appeals | Written into `trees.ts` alongside Cumberland's local detail | Separate it out once (below) |
| State agencies: RIDEM, RIDOT, State Fire Marshal, RIHousing, Superior Court | In `contacts.ts` | Superior Court varies by county. The rest are shared. |
| Local regulations: checklists, application forms, notice radius, fees, which decisions are delegated to staff | Cumberland only | The real work, per town |
| Local offices and boards: names, addresses, meeting pattern | Cumberland only | Small, per town |
| Ordinance rules the Atlas doesn't capture, such as R-3's 10,000 + 5,000 sq ft formula | One hard-coded branch in `requiredArea` | Per town, only where the ordinance differs from the Atlas figure |
| Hearing records and precedent | Cumberland only | Large, per town. Optional for a town to be useful. |
| Where records are published | Six sample towns in `records.ts` | Small, per town |

The useful observation is that state law fixes the skeleton. Every town runs the same stages under chapters 45-23, 45-24 and 45-53. What differs is the local dressing on each stage. That is why covering the whole state is realistic here in a way it would not be across states.

## Design change: a state base with town overlays

Today each tree is one object that mixes state and local content. Split it:

```
lib/data/
  state/
    trees.ts        // the five routes: steps, statutory clocks, state-law documents and quotes
    contacts.ts     // state agencies
    glossary.ts
  towns/
    index.ts        // the 39 towns: name, county, coverage level, sources read and when
    cumberland/
      town.ts       // offices, boards, meeting pattern, record links
      overlay.ts    // per step: local documents, checklists, pinpoints, notice rules, fees
      rules.ts      // ordinance rules beyond the Atlas (density formula, local thresholds)
      hearings.ts   // documented concerns
      history.ts    // precedent
    north-providence/
      ...
```

`treeFor(town, route)` merges the state step with the town's overlay for that step. A town with no overlay still produces a correct route with state-law steps, state clocks, the right board names and the Atlas zoning check. That is a useful page on day one, and it is honest about what is missing.

Local variations the overlay has to be able to express, from what Cumberland already shows:

- an extra stage the state doesn't require (Cumberland runs comprehensive permits through a master plan stage),
- a stage delegated to staff or kept by the board,
- a Technical Review Committee, or none,
- whether unified development review is adopted and which board hears relief,
- the notice radius and who pays for notice,
- a local threshold, such as a size trigger for development plan review.

Before fixing the overlay shape, read two more towns that differ from Cumberland in kind: a city with a City Plan Commission (Providence), and a small rural town (Exeter, where the record structure is already understood from the Exeter zoning project).

## Coverage levels, shown to the user

Each town carries a level, and every page says which one it is looking at:

1. **Zoning only.** Atlas district, parcel and utilities, state-law route and clocks. Available for all 39 towns as soon as the split is done.
2. **Offices and records.** Board and office contacts, meeting pattern, where records live.
3. **Local steps.** Checklists, forms and pinpoints read from the town's regulations, with a date and a reader.
4. **Hearings and precedent.** Minutes read into documented concerns and example projects.

Cumberland is level 4. The current site implies it is the only town that works. With levels, a town at level 1 can still answer "can this be built here, by which route, and how long may the town take".

## Implications for the interface

- **Town comes from the address.** The municipality select becomes a consequence of the lookup, with a manual override. It is already half-true: the lookup returns the town today and warns when it isn't Cumberland.
- **Town in the URL.** `/cumberland/steps` and so on, generated with `generateStaticParams` so the static export still works. Share links carry the town.
- **No hard-coded "Cumberland".** It appears in component text in about a dozen places (headings, the verdict, the trail heading, the summary). These read from the town record.
- **District list per town.** The zone select and the `CUMBERLAND_DISTRICTS` snapshot become a per-town fetch with a bundled snapshot. 39 snapshots are a few hundred kilobytes, so load them per town, not in the main bundle.
- **Authority kinds stay.** The elected, appointed, staff, state and utility icons already describe any town. A city council and a town council are both "elected".
- **An index page.** A state map or a list of the 39 towns with their coverage level. This is also the honest progress report for the project.
- **Atlas page.** Becomes per-town, with a statewide comparison that the Atlas data already supports ("towns where 4+ family housing is allowed by right in any district").
- **Engine.** `classify` is state law and stays. `requiredArea` takes a town rules object. `analyze` findings that cite Cumberland precedent move into the town's data.

## Order of work

1. **The split, with Cumberland as the only town.** No visible change. This is the risky refactor and should land alone, with the current output compared before and after for all five routes.
2. **Level 1 for all 39 towns.** Town index, per-town Atlas snapshot, town in the URL, hard-coded names removed. The site now answers the zoning question statewide.
3. **Level 2 for all 39.** A table of boards, offices and record locations. Mostly one sitting of careful reading per handful of towns. The Open Meetings portal lists every body.
4. **Level 3 for a second town.** North Providence is the natural choice, since its 2026 zoning ordinance redline is already in the repository. It will show what the overlay shape got wrong.
5. **Level 3 for the towns with the most multifamily activity**, in order. Each needs its land development regulations read, which is the slow part: a regulation document per town, checked by a person.
6. **Level 4 where records allow**, using the pipeline in `real-timelines-action.md`.

## How a town gets read

Reading 39 sets of regulations is the cost that decides whether this finishes. A workable method:

- A per-town intake sheet lists the questions the overlay needs answered (about 30: notice radius, TRC or none, delegated stages, fee schedule location, checklist appendix, and so on).
- A script fetches the town's regulations (most are on eCode360, Municode or a town PDF) and drafts answers with the pinpoint and a verbatim quote for each.
- A build check confirms every quote appears in the fetched document, as the Exeter project does for decisions.
- A person confirms the sheet. Ideally the town's planning staff are asked to confirm it. That is the "town staff verify final versions" promise already in the site footer, and it is the only route to the data being trusted.
- Each town records who read it and when, and an action flags towns whose regulations have changed since.

## Risks and open questions

- **The Atlas is as of September 2024.** Ordinances have changed since, and 2026 state law changed parking and other rules. The site already flags Atlas-versus-practice differences for Cumberland. Statewide, that flagging has to come from the town's rules file, so level 1 towns carry a standing "verify against the current ordinance" notice.
- **Staleness scales with coverage.** One town is easy to keep current. 39 are not, without the read date on every fact and an action that watches for change.
- **Towns differ more than expected.** Providence has its own institutions, and some small towns have no planner on staff. The overlay shape must be tested on unlike towns before 39 are attempted.
- **Liability and tone.** Statewide, the site will be read as a statewide authority. Coverage levels and read dates need to be prominent, not in a footer.
- **Scope.** Is the aim housing only, as now, or any development? Housing only keeps the routes to five.

## What I'd want decided before building

1. Is level 1 for all towns worth shipping on its own, before any second town has local steps?
2. North Providence as the second full town, or a town chosen to be as unlike Cumberland as possible?
3. Is asking town planning staff to confirm their town's sheet part of the plan, and who asks?
