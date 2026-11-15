# Plan: from one site in one district to Rhode Island-wide clearance

Status: proposed 2026-11-14 and answered by Maqz the same day (answers marked **Answered**). Built so far: saved sites, hearing picks in the project, the affordable share key. Nothing else here is built. Once agreed, it is built on its own branch, in the phases at the end. Decisions it makes go into `docs/ARD.md`.

It answers Maqz's redesign notes of 2026-11-14: saving inputs, taking the project away, summaries by stage, the Rhode Island-wide vision, the Zoning atlas page, and Records.

## 1. Saving everything the applicant enters

**What is kept today.** The facts, the route chosen by hand, the ticked considerations and the notes are saved in the browser as they change. They also travel in the share link, the project file (JSON) and the calendar (.ics). Those tools sit in "Take this project with you" on the Steps page and on the Summary page.

**What is not kept, and so can be lost:**

| Input | Where it lives now | Lost when |
| --- | --- | --- |
| An address typed but not looked up, or a lookup not yet applied | The page only | Leaving the page |
| Plan files dropped on Site selection | The page only, names only | Leaving the page |
| The entry kept while an alternative is tried (D21) | Browser only, not in the link or file | Switching device, or sharing mid-trial |
| What the map layers said, and when | Memory only (a cache) | Reload. It is looked up again, and the answer may have changed. |
| Everything, in a private window or with storage blocked | Memory only | Closing the tab |

**Proposal.**

1. **One project file holds everything.** `Saved` gets a version 2 with:
   - the kept entry;
   - a snapshot of the lookup, with its date, so the file records what the map said when the facts were taken;
   - the names of dropped files.

   The share link stays short and carries what it carries now. The file is the complete record (ARD principle 5).
2. **A download icon in the project summary**, the panel on the left. It opens a short menu: download project file, copy share link, print the complete review, calendar, open a project file. "Take this project with you" on the Steps page becomes that menu, and the section goes. A dot on the icon shows changes made since the last download. This is a quiet reminder, not a prompt.
3. **A warning only where something would really be lost.** Browsers allow a warning only on leaving the site or closing the tab, with their own fixed wording. Moving between this site's pages raises nothing, and needs nothing, because inputs are saved as they change. Proposed triggers:
   - the browser cannot save (a private window or blocked storage) and there are inputs;
   - a lookup result is shown but not applied;
   - plan files have been dropped (once they are read, this matters more).

   Not a trigger: unsaved-to-file changes in general. That would warn on every close and be ignored.

**Answered:** nothing that can be stored should warn, and everything can be stored, so no leave warning is planned. Instead:
- **Built:** hearing prep's picked questions are part of the project. They are saved in the browser, in the share link and in the project file.
- **Built:** "Save site" on Site selection keeps any number of sites in this browser, each the whole project, listed whenever the visitor comes back, with an (i) explaining it. It uses local storage rather than a cookie: a cookie holds about 4 KB and goes to a server with every page.
- **Still to do:** the project file's version 2 (the kept entry, the lookup snapshot, file names), and the download icon and menu in the summary.

## 2. Summaries to print: complete, or one stage at a time

Noted now, to carry forward; the formatting waits until the design is settled.

- **Complete review:** the Summary page as it is, from the download menu.
- **One stage:** a print button on each step row on the Steps page. It prints that step's documents, considerations, notes, the questions likely at its hearing, and the project facts the step rests on. This is a print stylesheet plus `?stage=` on the Summary page, not a new layout.
- Both carry the date printed, the coverage level of the town, and the trial mark where it applies (ARD section 2: trust markings travel).

## 3. Rhode Island-wide clearance

The prototype answers one question for one site in one district. "Rhode Island-wide general development clearance" can mean two things, and they lead to different designs:

**A. Any site in any of the 39 towns, one project at a time.** Mostly built: Site selection, coverage levels, the town picker. What remains is to remove the pilot framing:
- the header subtitle and the overview's Cumberland features;
- the Records and Hearing pages' fixed towns (section 5);
- the example project, which could be offered for any town rather than fixed in Cumberland R-3;
- the state/town split in `trees.ts` (ARD debt 1), which a third town needs anyway.

**B. Where in Rhode Island a project could go.** Start from the project (12 units, 25% affordable, public sewer) and show every district in the state that allows it by right, by hearing or not at all. The Zoning Atlas already holds this for every district, and its jurisdictions layer has each town's share of land by right. That makes it a live-data feature with no upkeep, and the clearest statewide view the site could offer. A project could then hold several candidate sites, and compare them the way alternatives are compared now.

**Recommendation:** finish A, because it is small. Build B as the overview's main view in place of the example's approval trail, after Records (section 5). Its map would share the static town map from section 5.

**Answered:** A, any site, one at a time. B is set aside.

**On commercial and mixed-use (Maqz asked what they would need).** Today a commercial or mixed district can be chosen, but the check still asks about housing in it. Providence's commercial floor area is used only to sort a housing project's route. What is housing-specific, and what is not:

| Part | Housing-specific? | What commercial or mixed-use would need |
| --- | --- | --- |
| Record fetchers (agendas, minutes, captions, sources) | No. They fetch any document. `find.py` already lists every major and minor land development item. | Nothing |
| Reading the records into events, concerns and precedent | Yes, by choice: only multifamily projects were read | Read commercial items too. Their concerns differ: traffic, hours, noise, lighting, deliveries. |
| The Zoning Atlas | Yes: it records housing types only | Each town's ordinance use table read for commercial uses (Providence's Table 12-1 has them; only its dwelling rows were read) |
| The route rule (`classify`) | Yes: it sorts by dwelling units and affordability | The town's thresholds for non-residential land development, usually floor area or land area, and when development plan review applies |
| Findings | Yes: density per unit, parking per unit, height for 4+ family | Floor area ratio, coverage, setbacks (unread for Providence), parking per use, and the use permission |
| State permits, review stages, clocks, appeals | No: the same law | Little |
| The project's facts and the precedent records | Yes: units and affordable units | A use and a floor area, with units optional |

Mixed-use housing is the nearer step: the housing check stands and the commercial part adds a use permission and floor area. Pure commercial is a second engine's worth of reading, town by town.

## 4. The Zoning atlas page

Agreed: the site is not an authority on zoning, and the page restates the Atlas. Proposal:
- Remove `/atlas` and `AtlasExplorer`.
- Keep the district's figures on Site selection, because the check uses them and shows where each number comes from.
- Keep the district picker's "browse by kind", which already compares a town's districts.
- Move the Atlas resource links (StoryMaps, the map, the national method, briefings) to a short "Sources we use" page under `/docs`.
- Replace the nav item with nothing.
- `/atlas` sends visitors to the Atlas's own map, with a line saying why.

Cost: the overview's "What your district allows" feature card goes, or points to the Atlas.

## 5. Records, joined with "Whose hearings?"

Today:
- Records lists six towns' record platforms, then two fixed precedent tables (Cumberland, Providence).
- Hearing prep has a "Whose hearings?" dropdown and a "Where Cumberland's hearings are recorded" box.

The two pages answer one question, "what happened at hearings like mine, and where do I read it?", from two ends.

**Proposal: one Records page, starting from a static map of the 39 towns.**

- **The map.** An SVG drawn once by a script from the Atlas's jurisdictions layer, simplified, about 30 KB, committed. Town lines don't change, so there is no upkeep, and nothing loads from a map service. Each town is a link shaded by coverage level, and read parts of towns are drawn as their own clickable areas (D4: Fox Point and Wayland today).
- **Choosing a town or part** filters everything below, and sets "Whose hearings?" on the Hearing page too (one shared selection, defaulting to the project's town).
- **Filters and search:** route, units, year, status, evidence class, and a text search over project names, addresses and documented concerns.
- **Results, in one place:**
  - where that town's records are published, which is the record-sources box now in Hearing prep;
  - its projects, as the timeline or the table;
  - its documented concerns, linking to the hearing cards.
- **The full route as an extension of "Whose hearings?"** For the chosen town, the route's stages in order. Each stage shows the body that hears it (elected, appointed or staff, ARD principle 1), where that body's agendas, minutes and recordings are published, and the past projects seen at that stage. This puts the route, its hearings and their records in one presentation. Hearing prep keeps the question cards and the hearing sheet, opened from a stage.

**Answered:** Hearing prep stays its own page. Records is linked from Hearing prep and from the documentation on how the site works, rather than standing in the main navigation.

## 6. Phases

Each phase leaves the site whole and gets its own row in the ARD.

1. **Keeping it.** Saved sites and hearing picks (built). Saved version 2, the download icon and menu in the summary, and print by stage noted in the code. Remove the Zoning atlas page (section 4).
2. **Records and hearings.** The static town map, the joined Records page, the shared town selection, filters and search.
3. **Statewide framing.** Copy and the example project made town-neutral, and the state/town split (debt 1).

Design of the print layouts waits until after phase 3.
