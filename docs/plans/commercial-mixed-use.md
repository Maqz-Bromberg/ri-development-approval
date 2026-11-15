# Plan: mixed-use and commercial projects

Status: agreed 2026-11-14 (Maqz: the short list of uses, the mixed-use line flagged as open, coverage per kind of project). Phases 0 to 3 built the same day, with Providence's parking and dimensions as well; phase 4 (commercial records) is not. It extends `docs/plans/statewide-redesign.md`.

Maqz, on coverage: "ideally we'll read all in time and resolve this, but this project is finding the limits of what's publicly available, so there will be some gaps left regardless (and pointing to them is a major boon of the project)."

## 1. Why it is within reach

- **State law already draws the lines.** The definitions the site cites, R.I. Gen. Laws § 45-23-32(19)(i), make these a *minor* land development project:

  > "(A) Seven thousand five hundred (7,500) gross square feet of floor area of new commercial, manufacturing, or industrial development, or less; or (B) An expansion of up to fifty percent (50%) of existing floor area or up to ten thousand (10,000) square feet for commercial, manufacturing, or industrial structures; or (C) Mixed-use development consisting of up to six (6) dwelling units and two thousand five hundred (2,500) gross square feet of commercial space or less"

  Two more categories are minor: a change in use with no extensive construction (E), and adaptive reuse of up to 25,000 sq ft in a commercial zone (F). Anything over these is major. A town may raise the thresholds but not lower them. Development plan review, § 45-23-32(9), covers a change in use, adaptive reuse in a commercial zone, development in a growth centre, and educational or hospital buildings.
- **The record fetchers are not housing-specific.** `find.py` already lists every major and minor land development item on an agenda.
- **Providence's whole use table is already saved** (`.sources/providence/rules/pzo.txt`, Table 12-1), with its commercial rows: retail, offices, restaurants under and over 3,500 sq ft, and so on. Only its dwelling rows were read. Its heights (Tables 4-1, 5-1 and 9-1) are read for every district.
- **The review stages, clocks, appeals and state permits are the same law** for every kind of project.

## 2. A gap to close first: the mixed-use line

The route rule today sorts every project by dwelling units alone, outside Providence. Under (C), a project with homes and commercial space is minor only up to 6 units **and** 2,500 sq ft of commercial space. So 7 to 9 units with shops below are shown as minor when state law may make them major.

Whether (D), "multi-family residential … of nine (9) units or less", still covers a building with shops below is a reading question. A planner could take it either way.

**Proposal:**
- Ask for commercial floor area in every town, not only Providence.
- Where the project falls outside (C), keep the route the units give, and add an **Open** finding. It quotes (C), says the town may classify the project as major, and asks the applicant to confirm with staff.
- The route moves only where a town's regulations have been read and settle it (Providence's already do).

This is small, honest about the doubt, and can be built first.

## 3. What an applicant would enter

The first choice on Site selection becomes **what you plan to build**:

| Kind | Asks for | Route rule (state default) |
| --- | --- | --- |
| Homes | Units, affordable units (as now) | 3 to 9 minor, 10 or more major, 25% affordable a comprehensive permit |
| Homes with commercial space | Units, affordable units, commercial gross floor area | Minor up to 6 units and 2,500 sq ft (C); otherwise as section 2 |
| Commercial, office or industrial | Use (from a short list), new gross floor area, existing floor area if expanding | Minor up to 7,500 sq ft new (A), or an expansion within (B); major above |
| Change of use or reuse of a building | Use, the building's floor area, whether exterior work is extensive | Minor (E, F, G), or development plan review where the town designates it |

Facts that only apply to homes (the affordable share, the comprehensive permit) hide for commercial. The (i) cards and glossary gain gross floor area, change of use, adaptive reuse and use table.

## 4. What the check would say

| Finding | Homes today | Commercial and mixed-use |
| --- | --- | --- |
| Route | Units, affordability | Floor area, expansion share, change of use (section 3) |
| Is the use allowed | Zoning Atlas housing types; a level 3 town's own table | **The town's use table only.** The Atlas records housing types and nothing else. Where a town's table has not been read, the finding says so, links the ordinance, and claims nothing (ARD principle 9). |
| Density | Units per acre | Not for commercial. Floor area ratio and coverage where read; otherwise not checked, said plainly. |
| Height | Atlas, or the town's tables | The town's tables (Providence: read for every district) |
| Parking | Per unit | Per use and floor area, from the town's parking article (Providence Article 14, residential rows read) |
| State permits | Wetlands, stormwater, state road | The same, plus whatever the use triggers. The list grows only as each permit is read. |

## 5. Records and hearings

- Precedent records gain a kind of project and a floor area. Units become optional.
- Commercial hearings raise different concerns: traffic and deliveries, hours, noise, lighting, signs, smell, and late-night use. They become new concern cards on Hearing prep, read from the same minutes and recordings by the same method (D7), tagged by kind of project.
- The approval column (D29) works unchanged.

## 6. Coverage claims

A town read for housing has not been read for commercial use. Coverage needs a second dimension: the level per town (or part) **per kind of project**. Until a town's commercial rows are read, its commercial checks are level 1:
- the state-law route and clocks;
- the town's ordinance linked;
- no permitted-use answer.

The Towns page and the summary show this.

## 7. Data shape (ARD rows when built)

- `ProjectInputs`: `kind` (homes, mixed, commercial, reuse), `use` (from a short list), `gfa` (new gross floor area), `existingGfa`, `extensiveWork`. `commercial` folds into `gfa` for mixed use.
- `TownRules.use` takes a use as well as a housing type. A town's use table becomes data (district by use, P or S or blank) with its source pinpoint, so reading a table is filling a file, not writing code.
- `classify` follows section 3, with the town's own rule first (as D2).
- `Precedent`: `kind`, `gfa`; `units` optional.
- `towns.ts`: coverage per kind of project (section 6).

## 8. Phases

0. **The mixed-use line** (section 2). Small, and fixes a real gap.
1. **Kinds of project in the inputs and the route rule**, with the state defaults. Commercial checks say plainly that permitted use is not read.
2. **Providence's commercial use rows, heights and parking per use**, from the ordinance already in hand. That makes Providence the first town read for commercial use.
3. **Cumberland's use table**, which needs the rest of its ordinance fetched (only Article 3 is saved).
4. **Commercial items in the records**: precedent and concerns for one part of a town first, as the Providence trial did.

## 9. Questions for Maqz

1. Which uses matter first? A short list (retail, office, restaurant, light industrial, institutional) keeps the use tables small to read.
2. For the mixed-use line: flag it as open (proposed), or route 7 to 9 units with commercial space as major outright?
3. Is coverage per kind of project (section 6) the right way to claim what has been read?

## 10. Where the gaps can be filled from (checked 2026-11-14)

| Gap | Source | Reach |
| --- | --- | --- |
| Providence: parking for commercial uses | Zoning Ordinance Table 14-1, in the copy already saved (`pzo`) | In hand |
| Providence: setbacks, coverage, height for commercial districts | Tables 5-1 (commercial), 6-1 (downtown), 7-1 (institutional), 9-1 (waterfront), in `pzo` | In hand |
| Cumberland: use table | Zoning Ordinance Table 1, an eCode360 attachment with a text layer, with Appendix A's use definitions beside it | Script |
| Cumberland: dimensional rules and parking | Articles 5 and 14, on eCode360 and Zoneomics | Script |
| 17 more towns' ordinances | eCode360: Barrington, Charlestown, Coventry, Cranston, East Greenwich, Glocester, Johnston, Lincoln, Little Compton, New Shoreham, North Smithfield, Pawtucket, Portsmouth, Scituate, Smithfield, West Greenwich, Westerly | Script |
| The other 21 towns' ordinances | Not on eCode360. Likely Municode, which refuses scripts, or the town's own site | By hand, as Providence's was |
| Whether a town reviews 7 to 9 homes over shops as major | A reading the town makes, not a published fact | Ask the planning office; stays a gap until one says |

**Done the same day:** the first four rows above. Cumberland's sources (`czt1`, `czA`, `cz5`, `cz14`) were fetched by `fetch_sources.py`; Providence's were read from `pzo`. Reading them also corrected Cumberland's housing parking (one space per unit since April 2026) and its mixed-use density (ARD D33).

**Still gaps:** Cumberland's loading, signs and design standards, and the overlay districts (BMMU, AHMU); Providence's setbacks for non-residential uses in residential districts, and design standards; commercial hearings and projects in both towns; the 37 other towns. Next is the eCode360 fetcher for the 17 towns there, and a list of the 21 others to save by hand.

## 11. The next town to read, for what it would change: Charlestown

Surveyed 2026-11-14 from the eCode360 copies (`.sources/ECODE.md`, written by `fetch_ecode.py`). Charlestown is the eCode360 town, with an official copy, whose ordinance departs furthest from the form the site has: it scores high on every marker the site does not handle except form-based codes. Westerly is a close second (85 overlay and 87 aquifer mentions, plus inclusionary zoning and floor area ratios). What reading Charlestown would force:

| What | In Charlestown | What the site would have to change |
| --- | --- | --- |
| **Overlay districts** | Groundwater Protection, Historic Village, Mixed-Use Zoning (MUZ) and flood overlays on top of base districts (§ 218-33 D). The Atlas holds MUZ as a polygon in the same layer as the districts. | **Done today, statewide:** the lookup kept treating a point in an overlay as a district boundary, and the picker offered overlays as districts. Ten Atlas overlays in nine towns were affected. Now the base district and its overlays are kept apart, overlays are drawn dashed, and each is an open gap in the check. **Still to do:** overlay rules as data, combined with the base district's. |
| **A use table that defers between columns** | The Land Use Table has a column for the Groundwater Protection overlay, with a fourth value: "U = Consult underlying district". | A use permission is no longer one cell: it is the base district's cell, then the overlay's, which can defer, restrict or allow. `useCommercial` and `use` take the overlays as well as the district. |
| **Land the town's zoning may not govern** | The ordinance names the "Narragansett Indian Tribe Settlement Lands" apart from its districts. The Atlas maps the Narragansett Reservation (1,939 acres, owned by the tribe, managed by the federal Bureau of Indian Affairs) in its Native Lands layer. | The lookup asks that layer too, and on it the check does not run the town's rules as if they applied: it says whose rules govern is not read here, and stops short of a route. A first case of a site the whole model does not fit. |
| **A second state wetlands authority** | Coastal ponds and the Salt Pond Region special area plan. RIDEM's wetland-jurisdiction layer answers "CRMC" for the MUZ point above. | The wetlands permit is CRMC's (an appointed state council) or RIDEM's by place, from that layer: a new authority on the step that decides it, kept visible as the site does for every decider (principle 1). |
| **No public sewer** | Septic everywhere; density rests on soils and groundwater rules. | A septic permit becomes a state permit on most projects. It needs its source read (RIDEM's onsite wastewater rules) before the site claims it. |
| **A village district the Atlas may mislabel** | The Traditional Village District is "to encourage small-scale business and residential uses"; the Atlas types it Nonresidential, with 4+ family prohibited. | A town's reading can override the Atlas's kind of district, as D14 lets it override permitted use. |

Not Charlestown's, but seen in the survey and needing a decision before those towns are read: **inclusionary zoning** in Barrington, Lincoln, West Greenwich and Westerly (a required affordable share, often with a density bonus), where the site now says only Cumberland's section is reserved; **floor area ratios** in Westerly and Lincoln; and **Smithfield**, whose zoning chapter is not on eCode360 at all.

Charlestown's Planning Commission records are on the state Open Meetings site, which scripts can read, so hearings and precedent could follow the rules the way they did for Providence.

### 11a. Read on 2026-11-14: what Charlestown changed, and what it still asks of the design

Charlestown's Land Use Table and two overlays were read (`lib/data/towns/charlestown/rules.ts`, ARD D38), enough to scope the design changes before more ordinances are fetched. Each row is a change to the site's general form, not to Charlestown alone.

| Change | State | Where it shows |
| --- | --- | --- |
| A town's own use table replaces the Atlas's answer for any town, not only through Providence's own code | Built (`withTownUse`) | Check: the use finding; the district picker's tags |
| Overlays apart from districts, from the Atlas or declared by the town where the Atlas has no map of them | Built: Atlas overlays found by the lookup; unmapped ones (Charlestown's Groundwater Protection) offered as ticks | Site selection: the overlay ticks under the district picker; the map's dashed outlines |
| An overlay's own findings, and its column in the use table (Y, S, U for "consult the underlying district", or absent) | Built for Charlestown; other overlays stay named gaps | Check: the overlay's findings; the use finding names which column answered |
| An overlay can allow what the district forbids (homes over shops in C-1 and C-2 under the Mixed-Use Zoning Overlay) | Built for Charlestown | Check: the use finding changes when the overlay is ticked |
| A town's correction of the Atlas's kind of district (Traditional Village District) and of its labels (the municipal district) | Built (`TownRules.kinds`, and the table's own names) | The district picker's groups, the map's colours |
| Land the town's zoning may not govern (tribal land, from the Atlas's Native Lands layer) | Built: the lookup finds it and the check stops short of the town's rules | Check: one blocker naming the gap. **Needs design:** the route, steps and schedule still show the ordinary route there. They should say none applies, or whose does. |
| CRMC or RIDEM as the wetlands authority, by place | Built in the lookup and the findings | Check: the state permit names CRMC. **Needs design:** the State permits step lists RIDEM as decider; it should name CRMC there, as principle 1 asks. |
| An overlay with its own affordability line (59% low or moderate income for more than one home in the Mixed-Use Zoning Overlay) | Built as a finding | **Needs design:** the affordable-share key (D24/D25) shows the state's 25% and the federal lines only; a town's or overlay's line belongs in it, and can be stricter than the comprehensive permit's |
| Uses listed by kind of business, not by category (no "retail" row; shops by kind) | Built with representative rows, said in the finding | **Needs design:** the short list may need a second level (kind of shop, kind of manufacturing) once more towns read this way |
| Septic and well approvals as conditions (the overlay names them) | Built for septic, statewide (ARD D39): RIDEM's rules read; the approval is a state permit, a document on the State permits step and a finding wherever there is no public sewer, with the large-system line and the salt pond and Narrow River areas | The critical resource areas are flagged by town, not looked up: RIDEM's "critical resource area" layer holds only small unlabelled polygons. Wells (private water) are not read. |
| A level-1 town with its zoning partly read | Built as a note in the coverage text | **Needs design:** coverage levels count steps, offices and hearings, not zoning; a town can have its ordinance read and still be level 1 |

The Atlas's own data quirks met on the way, now handled: overlays in the district layer (D36), a district whose abbreviation is its kind ("Mixed with Residential" for Charlestown's municipal district), and a planned district the ordinance calls PD and the Atlas PDD.
