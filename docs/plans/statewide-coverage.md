# Plan: coverage for the rest of the state, in chunks

Status: agreed 2026-11-18 (Maqz: the recommended answers to decisions 1, 2 and 4; four marks in place of one level; level 2 everywhere before the edge cases; a stated window of recent years for busy cities). Built the same day, on branch `statewide-coverage`: chunk 1 (the four marks, the split of the steps, the stored comparison), chunk 2 (every town's boards from the state Open Meetings site), chunk 0 in part (Providence's review areas from the City's map and the ordinance, the City's own district at the address, every Commission case since 2023 listed), and chunk 3 in part (Westerly's use tables, overlays, inclusionary zoning and listed parcels). Chunk 4 was built later the same day (North Providence: rules with dates, D62). What is left, and what must be saved by hand, is in section 9 and `docs/manual-fetches.md`. ARD D53 to D60.

It keeps the current priority (ARD section 2): as much information as possible, with as little upkeep as possible. Gaps are named, not hidden (principle 10). Validation and staff sign-off come later (D11, D12).

## 1. Where coverage stands

| Town | Homes | Commercial | What is missing |
| --- | --- | --- | --- |
| Cumberland | 4 | 3 | Loading, signs, design standards, the overlay districts' rules, commercial hearings. Its steps are still inside `trees.ts` (debt 1). |
| Providence | 3 citywide, 4 in Fox Point and Wayland (five projects), trial | 3 | Section 2 |
| Charlestown | 1, zoning partly read | 1, use table read | Dimensional table, the other overlays, steps, offices, hearings. On tribal land the route still runs (debt 18). The wetlands step names RIDEM where CRMC decides (debt 19). |
| The other 36 | 1 | 1 | Everything local. 18 eCode360 copies are in `.sources/<town>/ordinance/`, fetched by script. Four of them are not the official copy, and Smithfield's has no zoning chapter. 24 towns' official ordinances are still to be saved by hand (`docs/ordinance-hosts.md`; Providence's is in hand). |

**What each stage of the new design falls back to for a town not read:**

| Stage | Read town | Town not read | Hard-coded today |
| --- | --- | --- | --- |
| Site | Town's use table, its own site facts (D5) | Zoning Atlas, state law | The address placeholder ("Cumberland") |
| Zoning & law | Town findings, overlay rules | Atlas figures, overlays as open gaps | A parking rule that names Cumberland in `ObjectionGuide.tsx` |
| Route & people | Town steps, offices, deciders | State-law steps, "Town Council" wording (debt 5), no contacts | "Cumberland's are on the Records page" in `RouteStage.tsx` |
| Calendar | Board dates from a read schedule | Fixed offsets | Board names chosen by "is it Cumberland" in `ScheduleView.tsx` |
| Hearing | The town's documented concerns | Cumberland's concerns, as the default locality | `ObjectionGuide.tsx` defaults to Cumberland; Records opens on Cumberland |

The disclaimer strip says "only Cumberland has been read in full". That stops being true when chunk 0 ends.

## 2. Chunk 0: the whole of Providence

**Aim.** Level 4 for homes across the city, level 3 or 4 for commercial, and every special body and district named. "Complete" means that each part of the city has its rules read or its gap named. It does not mean that the city has confirmed the reading. The trial mark stays (D11).

**Why first.** The city has the most varied institutions in the state. Its records are reachable by script (Open Meetings, YouTube captions), and its ordinance and regulations are already in hand. What it forces is mostly a change to the general form, not to Providence alone.

**Work, in order:**

1. **All City Plan Commission projects, 2023 to 2026.** List every land development item on the Commission's agendas (Open Meetings, entity 2767). Then read the multi-family, mixed-use and commercial items into `history.ts`, `timelines.json` and `hearings.ts`, by the same method as the trial. The Commission is one body for the whole city. So when its minutes are read, level 4 covers the whole city, and the Fox Point and Wayland box can go. Withdrawals and denials are recorded too (debt 9), with the approval column showing "denied" or "none recorded" (D29).
2. **Parts drawn where the route changes, not where records cluster** (D4). Providence has bodies that take over review in their own districts:
   - the I-195 Redevelopment District Commission (a state body; its projects "are not land development projects", which is already a note in `steps.ts`);
   - the Downtown Design Review Committee (in `town.ts`, without a route of its own);
   - the Capital Center Commission (not in the data at all);
   - the Historic District Commission's local historic districts, and the East Side overlay (named as a check in `steps.ts`, with no rule);
   - the waterfront districts, where CRMC decides.

   Each one becomes a part with its own steps and its own decider on the first line (principle 1). This needs parts as polygons with a stated reason, more than one per town (debt 6, Q5). Geometry: the city's zoning map service, if a script can reach it (to check). If it cannot, a hand-drawn outline that says it is approximate, as the present box does.
3. **The other boards' records.** The Zoning Board of Review (special use permits, which D14 makes the route for four or more units in R-1 and R-3), the Historic District Commission and the Downtown Design Review Committee. All post on Open Meetings. Read only items that are land development projects, or the relief such projects ask for.
4. **The ordinance articles not yet read.** Setbacks and coverage in the residential districts (Table 4-1). The design standards (§ 503 and the like). Setbacks for non-residential uses in residential districts. Reuse of an existing building (Q4). Each gap that `rules.ts` names today is read or kept named.
5. **The district list from the ordinance, not the 2024 Atlas** (debt 13, Q7). R-2 and C-1 are gone, and the picker should say where their land went. This needs the city's current zoning map (step 2's service).
6. **Commercial hearings** (phase 4 of the commercial plan). Traffic, deliveries, hours, noise and lighting become concern cards, tagged by kind of project.
7. **Supporters at hearings** (debt 8, an open question). Providence's minutes record them. Hearing prep gets a place for requests that are not objections.
8. **Take the Cumberland defaults out of the stages** (the table in section 1). Hearing and Records open on the project's town. The board names come from the town's data. The Cumberland parking rule moves into Cumberland's rules.

**Done when.** Every Providence project from 2023 to 2026 is listed, and each one is read or marked as not read with the reason. Each special district is a part with a decider. The quote check passes. The disclaimer and Towns page say two towns are read in full.

**Hand fetches for Maqz:** only providenceri.gov documents that a staff report or decision cites (403 to scripts, as before).

## 3. Chunk 1: foundations for many towns

No visible change. This is the work the statewide plan called step 1, and it has been put off. Charlestown is already the third town, and a fourth with steps would make it worse.

1. **The split** (debt 1). State-law routes go into `lib/data/state/`. Cumberland's steps go into `lib/data/towns/cumberland/`. The "Cumberland" word-match and the source-id patterns in `engine.ts` go. Check the output of all five routes before and after, for each read town.
2. **A stored comparison** (debt 3). A script runs a fixed set of sample projects through the engine for every town that has rules, and diffs the result against a saved copy. It is run by hand, like the other checks. It is not a scheduled job (ARD section 2).
3. **Coverage as several dimensions** (debt 20). Today one level covers both "zoning read" and "steps read". Proposed: per town (and per part), and per kind of project, four marks: zoning, steps and forms, offices and records, hearings and precedent. Each mark has a read date. The Towns map (D47) shades by the lowest mark, or by a chosen one. The levels 1 to 4 stay as names for common combinations, so that the present wording still holds.
4. **A town template** (`lib/data/towns/_template/`). The intake sheet from the statewide plan becomes typed fields: notice radius, Technical Review Committee or none, stages given to staff, unified development review or not, who hears relief, permit gate (D10), fee schedule, checklists, a use table as data. Reading a town then means filling files. This also answers Q2 (the smallest set of ordinance articles for level 3): the template lists them.
5. **Town-specific site facts** (Q3). Providence's commercial floor area is now asked everywhere (D30). The template declares any others, and Site shows them for that town only.

## 4. Chunk 2: level 2 for all 39 towns

Broad, cheap and reachable by script. This is the chunk that does most for the priority.

- **Boards and offices.** For each town: planning board or commission, zoning board, council, Technical Review Committee where there is one, historic district commission. Each with its Open Meetings entity id, the kind of decider (elected, appointed, staff), and the office's address. The Open Meetings dashboard lists every public body.
- **Meeting dates from Open Meetings**, fetched by a script that someone runs, for the Calendar. Dates that are posted are shown as posted. Dates after them are projected and marked "est.", as Cumberland's are.
- **Where records are published**: minutes, recordings (YouTube channel or other), the platform. The Records card file (D47) already has a card for every town that names this gap. This chunk fills those cards.
- **Coverage.** The offices-and-records mark (chunk 1) is set for each town as read.

The 24 ordinances to be saved by hand are listed here, so that Maqz can save them while this chunk is built. They are needed from chunk 3 on. The order is given in section 6.

## 5. Chunks 3 to 7: edge cases, each the hardest town of its kind

Each chunk reads one town that forces a change to the general form. After it, other towns of the same kind mean filling files. The order is by how much each one changes the design.

### Chunk 3: Westerly, the overlay stack

Read from the eCode360 copy in hand (`.sources/westerly/ordinance/`, Chapter 260, with its district use tables and dimensional schedule as attachments). What it forces:

| In Westerly | What the site must change |
| --- | --- |
| **About ten overlays**: Aquifer and Wellhead Protection, Flood Hazard, Salt Pond, Historic, Historic Mill, Airport Area, Post Road, Granite Street, Wells Street. Several may not be in the Atlas. | Today the site has one overlay at a time with its own rules (Charlestown). Westerly needs several overlays on one site, each able to add a condition, restrict a use or send the project to another body, and a rule for which one prevails. Unmapped overlays are offered as ticks (as `unmappedOverlays` already does). |
| **Inclusionary zoning is required**: "every residential subdivision or land development project that consists of six or more residential lots or dwelling units" (§ 260-50.2). | A town's required affordable share is a finding, and a line on the affordable key (D24, D25), beside the state's 25%. The share entered is checked against it. The same pattern serves Barrington, Lincoln and West Greenwich. **Needs a decision** (section 7). |
| **The Zoning Board "sitting as the Airport Area Overlay District"**, around the state airport. | One body that decides in two capacities. The step's first line says in which capacity it decides. Whether a state aviation body must also review is to be read. |
| **Watch Hill**: a National Register historic district, with its own development standards for its business district (§ 260-87.6). | Design standards by district, as findings that name their section, not as checks the site claims to run. |
| **Coast**: CRMC jurisdiction, barrier beaches, salt ponds. | Fix debt 19 first, so that the State permits step names CRMC where the lookup says CRMC. Salt pond towns are already flagged (D39). |
| **The ordinance names private owners** in lot-specific provisions. | Principle 7. A provision is cited by plat and lot. The owner's name is not shown, even in a quote. `verify_quotes.py` needs to allow a quote with a marked omission. |
| **Mixed-use development is permitted in named districts** (HC, GC, DC-1, DC-2) under its own section. | Probably fits D30 as it stands. Confirm while reading. |
| **The state line** (the Pawcatuck River). | Parcels and districts stop at the river. The map's view of the surroundings and the nearby-projects radius should say so, not show an empty area as if nothing were there. |

Finish Charlestown in the same chunk: the route on tribal land says that no town route applies, or whose route does (debt 18). Then the two coastal towns are read by the same rules.

Records: whether Westerly's Planning Board posts minutes and recordings in a form a script can read is to be checked at the start. If its minutes are thin, D7's line between concern and decision is tested again (Q1).

### Chunk 4: North Providence, an ordinance being amended

The 2026 redline and the amended ordinance are in `.sources/north-providence/ordinance/`. The town's code is on ClerksHQ, which answers scripts once the page address is found by hand. What it forces: **rules with dates.** A rule carries the date it took effect. While an amendment is pending, both texts are kept (D13 already keeps disagreeing values). The finding says which text applies to an application filed on a given day, or that this is a question for staff. Every town needs this eventually, because ordinances change after they are read.

**Built 2026-11-18 (ARD D62).** `lib/data/towns/dated.ts` keeps a rule as versions with the day each took effect, a second date where the sources disagree, and pending amendments. North Providence vests an application when it is certified complete, not when filed (§ 35-255), so the site tries the start date and the 25 days certification may take; where more than one text may apply it answers with the stricter and says to ask staff. Built on it: the use table's housing rows before 2024 (the Town's 2014 compilation) and since (Chapter 35 on ClerksHQ), RL and RG lot areas, adaptive reuse (from January 2, 2024), and the Mixed-Use Commercial Corridor Overlay pending before the Town Council. Found on the way: the Town's code lags the Council (it lacks Ord. 25-022Z of February 2026) and credits the table's present form to two ordinances five months apart; the 2026 redline used as a reading aid misses Ord. 25-011Z; the ordinance disagrees with itself on two-family homes in RL and RG. Not read: steps (Chapter 31A), other districts' dimensions, parking, the flood hazard section the Council replaced on August 18, 2026 (Ord. 26-014Z, two months after the redline's 26-009Z did the same).

### Chunk 5: New Shoreham, an island

- The eCode360 copy is not the official one. The official code is on ClerksHQ. What forces: a source mark for "unofficial copy", which travels to the page (extends D35).
- Septic almost everywhere (183 mentions), many overlays (65) and planned districts, coastal rules throughout.
- A seasonal meeting pattern for the Calendar.

### Chunk 6: thin records, small rural towns

Foster, Exeter, West Greenwich, Glocester, Hopkinton, Richmond. Few or no multi-family projects, and possibly no staff planner. What forces:

- **"Read, and none found" as a result**, different from "not read". Level 4 with no precedent must say what was searched (years, bodies).
- **Private wells** (not read yet; D39 covers septic only).
- **Village districts** (Glocester: 23 mentions) that the Atlas may label as nonresidential. `TownRules.kinds` already allows the correction.
- West Greenwich adds a third town with inclusionary zoning (27 mentions).

**Built 2026-11-18 (ARD D63).** Each town's housing rows answer in place of the Atlas; a statewide finding for private wells (the septic cap where wells are used, and when a shared well becomes a public water system); `kinds: "Overlay"` for Glocester's village overlay and Exeter's groundwater overlay; West Greenwich's inclusionary zoning (2025) and Exeter's 20% share in mixed-use developments on the affordable key. Found: Foster renamed its districts in 2023 and the Atlas has the old ones; Foster's and Exeter's ordinances disagree with themselves on multi-family housing; Hopkinton's inclusionary section is repealed but still cited; Richmond splits multi-family housing by size and stops at 60 homes. Records: each planning and zoning board's agendas since 2023 searched for housing (`search_records.py`), shown on the Records card as "Read, and none found" or as the items found. What the search showed changes the premise of this chunk: these towns are not short of proposals. Their large ones are comprehensive permits (West Greenwich four of six since late 2024, Exeter three, Richmond three, Hopkinton two, up to 333 homes), which go to the Planning Board under the state's Low and Moderate Income Housing Act and bypass the use tables. Those cases were read into precedent on 2026-11-19 (ARD D64): twelve, one of them denied. Their comprehensive permit route was written from each town's own procedure the same day (D65); "none found" holds only for multi-family proposals in Foster and Glocester.

### Chunk 7: busy cities with ordinances saved by hand

Pawtucket first (eCode360, by script, 66 mentions of development plan review). Then Cranston, Warwick, East Providence, Woonsocket, Newport and Central Falls. What forces:

- **Volume.** More precedent than one person can read. Read a recent window (for example 2024 to 2026), and say so in the coverage line.
- **An ordinance made of several documents.** Warwick posts its zoning appendix and its amendments as separate PDFs. The text in force is the base plus the amendments in order, and the coverage line says what date it is current to.
- **Newport**: historic district review as a stage of its own in most of the city, with CRMC on the harbour.
- **Smithfield** (not a city, but the same problem of access): its zoning chapter is not on eCode360 at all. It stays a named gap until the town's own copy is found.

**Built 2026-11-19 (ARD D67).** Eight use tables read in place of the Atlas: the seven cities and Smithfield, whose ordinance (amended to January 2026) was found on the Town's site. The tables disagree with the Atlas often, most in Smithfield (two-family homes only in Planned Development) and Cranston (no two-family homes in A districts); each finding says so. Newport's certificate of appropriateness is a step of its own, set by a ticked historic district; East Providence's waterfront inclusionary zoning (25%) is on the affordable key. Warwick turned out to be on Municode, so its ordinance is one codified text, not a base and amendments; whether Municode is current with the city's posted amendments is an open issue. Records: the cities' boards are searched from 2024, and the window is stated; their results are read in a following change. Each city's route is still state law. What is left is in `docs/review-after-chunk-7.md`, section B.

### Then: the rest, by county

After chunk 7, every kind of town has a pattern. The remaining towns are read in county batches, starting with the most multi-family activity, by filling the template. Each batch is one branch and one ARD log line.

## 6. Ordinances to save by hand, in the order needed

| For chunk | Towns | Host |
| --- | --- | --- |
| 4 | North Providence (ClerksHQ: open the zoning title once and note its address) | ClerksHQ |
| 5 | New Shoreham (the official ClerksHQ copy, to compare with the eCode360 copy) | ClerksHQ |
| 6 | Foster, Exeter, Hopkinton (Municode); Richmond (ClerksHQ) | Municode, ClerksHQ |
| 7 | Cranston, East Providence, Newport, Central Falls (Municode); Warwick (city site); Woonsocket (ClerksHQ); Smithfield (town site, if it can be found) | Mixed |
| Later | Bristol, Burrillville, Jamestown, Narragansett, North Kingstown, Scituate, South Kingstown, Tiverton, Warren, West Warwick (Municode); Middletown (American Legal); North Smithfield (town site) | Mixed |

Save into `.sources/<town>/ordinance/` under any name, then run `scripts/towns/organize_sources.py`.

## 7. Decisions for Maqz (answered 2026-11-18: 1, 2 and 4 as recommended; 3 yes; 5 yes)

1. **"Complete" Providence**: level 4 across the city by reading all the Commission's projects from 2023 to 2026, with parts only where another body takes over review (section 2, step 2)? Recommended. The alternative is to keep parts drawn around clusters of records, which is closer to the trial but leaves most of the city at level 3.
2. **Inclusionary zoning**: a required finding plus a town line on the affordable key, without changing the route? Recommended. It touches D24 and D25 and four towns.
3. **Coverage as four marks** in place of one level (chunk 1, step 3): yes, or keep one level and extend the gap text?
4. **Order**: chunk 2 (level 2 everywhere) before the edge-case towns? Recommended, because it is cheap, reachable by script, and fills the Records cards that the new design already shows. The alternative is Westerly straight after the foundations.
5. **Recent window for busy cities** (chunk 7): is it acceptable to read only recent years, with the window stated?

## 8. ARD rows when built

- Chunk 0: parts by route (amends D4, closes debt 6 for Providence), the district list from the ordinance (debt 13), denials and supporters (debts 8 and 9).
- Chunk 1: the split (debt 1), the stored comparison (debt 3), coverage marks (debt 20), the town template (Q2, Q3).
- Chunk 3: overlay stack, inclusionary lines, a body in two capacities, omissions in quotes (principle 7), debts 18 and 19 closed.
- Chunk 4: dated rules.
- Chunk 5: unofficial copies (extends D35).
- Chunk 6: "read, none found".
- Chunk 7: read windows, ordinances assembled from amendments.

## 9. Progress, 2026-11-18

| Chunk | Built | Left |
| --- | --- | --- |
| 0. Providence | Review areas looked up on the City's zoning service and the state's I-195 layer, with their routes from the ordinance (D57, D59); the City's present district beside the Atlas's; the Historic District Commission and I-195 Commission as deciders; every City Plan Commission case since 2023 listed on the Records card (`agenda.json`: 83 cases on 55 agendas, 20 giving a number of homes, 3 agendas scanned with no text), each marked read or a gap. **2026-11-18, evening:** all 20 cases with homes read into precedent (19 projects, from the minutes and a staff report for each but 203 Douglas, which has none yet; hearings mark now citywide, partly); the Historic District Commission's procedure, clock and schedule, and both boards' meetings and filing | The other boards' records; the Commission's design standards per district; Table 4-1 and the design standards; commercial hearings; supporters; the Capital Center question |
| 1. Foundations | Four marks (D54); the steps split, with the stored comparison (D56); overlay flags, inserted steps and "not" conditions (D58) | Cumberland's housing findings out of `analyze`; a town template folder; town-specific site facts (Q3) |
| 2. Level 2 everywhere | Every town's boards, their meeting pattern and minutes, as contacts and on the Records cards (D55) | The planning office's address and hours, the towns' own record pages and recordings |
| 3. Westerly | Use tables with the aquifer zones, Appendix G, multifamily conditions, inclusionary zoning on the key, the airport overlay's review (D60) | Dimensional schedule, the other overlays, Watch Hill standards, steps, hearings, the town's overlay map; debts 18 and 19 for Charlestown |
| 4. North Providence | Rules with dates (D62): the use table's housing rows as dated versions, RL and RG lot areas, adaptive reuse, vesting on certification, a pending overlay; zoning mark partly read | Steps (Chapter 31A); the overlay's text when it is published; other districts' dimensions and parking; flood hazard |
| 5 to 7 | Not started. Ordinances for 24 towns in hand by 2026-11-18, filed for reading in `.sources/<town>/ordinance/` (North Providence's 2026 redline included, now there rather than at the top of the repository) | As planned; what is still to save is in `docs/manual-fetches.md` section 3 |
