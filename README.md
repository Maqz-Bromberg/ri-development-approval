# RI Building Plan Approval

[![The approval trail: nine steps from zoning check to move-in for a 10-unit major land development in Cumberland, RI](docs/hero.png)](https://maqz-bromberg.github.io/ri-development-approval/)

**Live site: [maqz-bromberg.github.io/ri-development-approval](https://maqz-bromberg.github.io/ri-development-approval/)**

A Next.js site that turns a Rhode Island building project into its approval route. It shows every step, who decides it, the documents and forms to file, a checklist for each document, the source law quoted for each requirement, contacts, past approvals like yours, and notes for answering common objections at the hearing.

Pilot municipality: **Cumberland, RI**. Rules were read in October 2026. Town staff verify final versions.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Pages

| Route | What it does |
|---|---|
| `/` | **Landing**, leading to choosing a site: a find box, open a project file, recent and saved sites, the example, and who you'll meet. Three designs on trial in development (`lib/trials.ts`). Every page after it is an app shell: a header with five stages (each with a live subtitle), a Reference menu and a save chip; a rail with the site card and an outline; a tray with pins, the hearing sheet and the route's contacts; and a disclaimer strip. |
| `/site` | **Site**, where an applicant starts: where (address or the map), the district, the project and the land, your sites, then nearby alternatives listed as routes (a mark where the route changes) and the five routes. |
| `/docs` | **Documentation**, meant to grow: how site facts are found, how records are checked, and **`/docs/sources`**, every cited source by town and kind, generated from the data. |
| `/law` | **Zoning & law.** The verdict, every finding with its rule and quote (each can be pinned), and the statutory clocks. (`/project` redirects here.) |
| `/route` | **Route & people.** One row per step: what you file, who decides it (coloured chips with the body's mode), the clock and progress. Rows open to documents, the step's moments on the calendar, questions to expect, notes and contacts. Precedent at the end. (`/steps` redirects here.) |
| `/summary` | The whole project on one printable page, with notes and the considerations dealt with |
| `/calendar` | **Calendar.** A Gantt chart from your start date with a panel under the chosen moment, and a month view. The rail has the start date, the key, the .ics file and print. (`/schedule` redirects here.) |
| `/hearing` | **Hearing**, titled for the body that holds the hearings: its date, place and notice, a switch where a route has two hearings, and questions matched to the town's own hearings, in two columns, each pinnable. |
| `/atlas` | Cumberland's 12 zoning districts from the **Rhode Island Zoning Atlas** (HousingWorks RI), with lot and density figures shown for your site's utilities |
| `/records` | Where Town Council and Planning Board records are published (Cumberland plus sample towns), with reading tips and the precedent table |
| `/glossary` | Plain-language definitions. Across the site these terms carry a dotted underline and show the definition on hover, focus or tap. |

Project inputs, ticks and notes are saved in the browser (`localStorage`, key `ri-plan-approval:v1`) as a convenience. To keep a project, use a share link (the whole project is encoded in the link's `#p=` fragment, and nothing is sent to a server), a downloaded project file, or the printable summary.

### Trying design variants

Under `npm run dev` a **Trial** button sits at the bottom right, on the pages that have a design on trial (none at the moment: the last ones were decided). Variants are declared in `lib/trials.ts` and every active one is listed, with links, under "Design trials in progress" on `/dev`. The published site always uses the first option of each.

## Where the data lives

Everything the backend will eventually serve sits in `lib/data/`, one file per concern:

- `glossary.ts`: plain-language terms and the spellings to recognise in text
- `trees.ts`: one approval tree per development type (`major`, `minor`, `comp`, `dpr`, `byright`). Each step has an application, a clock, authorities, and documents. Each document has an optional `src` + `pin` + verbatim `q` quote, and a `checklist` of considerations. `cond` expressions (`wet`, `dot`, `acre`, `relief`, `rezone`, `transit`, joined with `|`) show or hide items for the site.
- `sources.ts`: every statute, regulation, agenda and article that is quoted
- `contacts.ts`: authorities and offices. `verify` marks details from older or secondary sources.
- `history.ts`: precedent from Cumberland Planning Board agendas
- `records.ts`: where each locality publishes its agendas, minutes, video and press. `indexed: true` marks localities whose records have been read into the common questions.
- `atlas.ts`: the Zoning Atlas layer URL, Cumberland's district snapshot, and parsers for the atlas's utility-keyed lot and density strings
- `schedule.ts`: per-step durations (statutory or estimated) and the dated ticks, each naming the documents it concerns
- `objections.ts`: common questions. Each one's `heard` entries cite the minutes, memo or video they came from, and the `say` notes are drafting examples, not quotes.

`lib/engine.ts` holds the rules: classification (9-unit minor cap, 25% comprehensive-permit threshold), permitted use from the Zoning Atlas, density (the ordinance formula for R-3, atlas figures elsewhere, and the conservation-development density), parking, height, site flags, and the findings for the law check. It flags where the atlas and recent Cumberland decisions disagree. `lib/schedule.ts` lays the steps out on dates and writes the `.ics`. `lib/whatif.ts` builds the nearby alternatives, `lib/lookup.ts` turns an address into site facts, and `lib/share.ts` encodes a project into a link or file.

## Adding a municipality

How the data is shaped, and each decision behind it, is in `docs/ARD.md`. Providence is the worked example.

1. Add its sources to `sources.ts`, with a short prefix on each id.
2. Give it a folder, `lib/data/towns/<town>/`, with its steps and route rule, findings and schedule, contacts and calendar, recorded projects with dated events, and hearing concerns. Register it in `lib/data/towns/overlay.ts`.
3. Set its level in `towns.ts`, marked `trial` until its planning office has confirmed the reading. A part of a town can carry a higher level.
4. Fetch what it cites into `.sources/` and run the checks in `scripts/towns/README.md`. Every quote must match its document.
5. Districts come live from the Zoning Atlas. Nothing to add unless the ordinance differs from it.

Cumberland predates this shape: its steps are still inside `trees.ts`.

## Not yet built

- Plan-set extraction: uploaded files are only listed.
- Flood zone lookup. A bus stop's frequency and mobility hubs are not checked.
- Commercial use tables beyond Providence, parking and dimensional rules for commercial uses, and commercial hearings and precedent. The check names each of these as a gap.
- Fees: Cumberland's current fee schedule was not available.
- Precedent outcomes: read from minutes through May 2026. Later minutes are not yet read.
- Video transcription: meeting videos are linked, not transcribed. The backend should transcribe them and tag objections the way the minutes were tagged by hand.
- Business days: schedules count calendar days, as the statutes do. Meeting dates are estimated, not taken from the board calendar.

The stand-ins are labelled on the site and listed in `components/Demo.tsx`. Plans for the larger gaps are in `docs/plans/`: real board calendars, real project timelines kept current by a GitHub Action, and extending to all 39 municipalities.
