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
| `/` | Landing page: the example project's verdict, and the cartoon approval trail. Select a stop to see who decides it and what you file. |
| `/project` | **Check.** Address lookup (district, parcel, lot area, water and sewer from public map layers), site facts, a verdict line, the zoning and law check with blockers first, a what-if comparison of nearby alternatives, the district's Atlas figures, and the five routes. Lists every part of the site that is a stand-in. |
| `/steps` | **Approval steps.** One row per step: what you file, who holds the decision (an icon per kind of authority, with role and contacts on hover or tap), and the clock. Each row opens to its documents, considerations, likely hearing questions, your notes and contacts. Share link, project file, email and printable summary. Precedent table. |
| `/summary` | The whole project on one printable page, with notes and the considerations dealt with |
| `/schedule` | The approval route laid out from your start date. **Timeline** view (approvals by default, or through move-in) with a today marker, statutory clocks and estimates, and ticks that open the documents due then. **Calendar** view. **Download .ics**. |
| `/hearing` | **Hearing prep**, titled for the body that holds the hearings. Questions matched to the town's own hearing records. Each card shows an example note and, where the question turns on a number, a line with your project's figures. Pick questions and print a one-page hearing sheet. `/objections` redirects here. |
| `/atlas` | Cumberland's 12 zoning districts from the **Rhode Island Zoning Atlas** (HousingWorks RI), with lot and density figures shown for your site's utilities |
| `/records` | Where Town Council and Planning Board records are published (Cumberland plus sample towns), with reading tips and the precedent table |
| `/glossary` | Plain-language definitions. Across the site these terms carry a dotted underline and show the definition on hover, focus or tap. |

Project inputs, ticks and notes are saved in the browser (`localStorage`, key `ri-plan-approval:v1`) as a convenience. To keep a project, use a share link (the whole project is encoded in the link's `#p=` fragment, and nothing is sent to a server), a downloaded project file, or the printable summary.

### Trying design variants

Under `npm run dev` a **Trial** button sits at the bottom right. It switches between variants (the consolidated steps list against the older flowchart and step sheets, tickable against read-only considerations, heading typeface, verdict on or off). Variants are declared in `components/Trial.tsx`. The published site always uses the first option of each.

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

1. Add its sources to `sources.ts` and its offices to `contacts.ts`.
2. Copy the trees in `trees.ts`, then change the local pinpoints, quotes and checklists.
3. Add its record links to `records.ts`.
4. Query its districts from the Zoning Atlas layer (`fetchAtlasDistricts("<Town>")`), and add any ordinance-specific density rule to `requiredArea` in `engine.ts`.
5. Read its hearing minutes and videos into `heard` entries, then set `indexed: true` in `records.ts`.

## Not yet built

- Plan-set extraction: uploaded files are only listed.
- Wetlands, flood, state-road and transit lookups. The address lookup covers district, parcel, lot area, water and sewer.
- Fees: Cumberland's current fee schedule was not available.
- Precedent outcomes: read from minutes through May 2026. Later minutes are not yet read.
- Video transcription: meeting videos are linked, not transcribed. The backend should transcribe them and tag objections the way the minutes were tagged by hand.
- Business days: schedules count calendar days, as the statutes do. Meeting dates are estimated, not taken from the board calendar.

The stand-ins are labelled on the site and listed in `components/Demo.tsx`. Plans for the larger gaps are in `docs/plans/`: real board calendars, real project timelines kept current by a GitHub Action, and extending to all 39 municipalities.
