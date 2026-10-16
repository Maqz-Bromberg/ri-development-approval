# RI Building Plan Approval

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
| `/` | Landing page with the cartoon approval trail. The builder walks to the first step with unchecked items, and a flag goes up at each completed step. |
| `/project` | Project input, zoning and law check, review-clock bar, flowchart (applications down the centre, authorities feeding in from the right), expandable step sheets with per-document checklists, precedent, and development-type trees |
| `/schedule` | The approval route laid out from your start date. **Timeline** view: one row per step, with bars for statutory review clocks and estimates, and ticks for filings, deadlines, hearings and milestones. Each tick drops down to the documents and checklist items due then. **Calendar** view: month grids with the same events. **Download .ics** puts every tick in your calendar. |
| `/atlas` | Cumberland's 12 zoning districts from the **Rhode Island Zoning Atlas** (HousingWorks RI): how each treats 1-, 2-, 3- and 4+-family housing and ADUs, plus minimum lots, units per acre, height and parking. It queries the live atlas layer and flags any difference from the bundled snapshot. The atlas map and StoryMap load on request. |
| `/objections` | **Common questions**, matched to the locality's own hearing records: documented concerns from Cumberland Planning Board minutes, staff memos, meeting videos and press, each with the applicant's response and the vote. Residents are named by role only. Each has the board's view, what to do, an example note and the plan sheet to bring. Non-indexed towns list their recording sources for the backend to transcribe. |
| `/records` | Where Town Council and Planning Board records are published (Cumberland plus sample towns): agendas, meeting video, minutes PDFs, memos, press and testimony, with reading tips and the Cumberland precedent table |

Project inputs and checklist ticks are saved in the browser (`localStorage`, key `ri-plan-approval:v1`).

## Where the data lives

Everything the backend will eventually serve sits in `lib/data/`, one file per concern:

- `trees.ts`: one approval tree per development type (`major`, `minor`, `comp`, `dpr`, `byright`). Each step has an application, a clock, authorities, and documents. Each document has an optional `src` + `pin` + verbatim `q` quote, and a `checklist` of considerations. `cond` expressions (`wet`, `dot`, `acre`, `relief`, `rezone`, `transit`, joined with `|`) show or hide items for the site.
- `sources.ts`: every statute, regulation, agenda and article that is quoted
- `contacts.ts`: authorities and offices. `verify` marks details from older or secondary sources.
- `history.ts`: precedent from Cumberland Planning Board agendas
- `records.ts`: where each locality publishes its agendas, minutes, video and press. `indexed: true` marks localities whose records have been read into the common questions.
- `atlas.ts`: the Zoning Atlas layer URL, Cumberland's district snapshot, and parsers for the atlas's utility-keyed lot and density strings
- `schedule.ts`: per-step durations (statutory or estimated) and the dated ticks, each naming the documents it concerns
- `objections.ts`: common questions. Each one's `heard` entries cite the minutes, memo or video they came from, and the `say` notes are drafting examples, not quotes.

`lib/engine.ts` holds the rules: classification (9-unit minor cap, 25% comprehensive-permit threshold), permitted use from the Zoning Atlas, density (the ordinance formula for R-3, atlas figures elsewhere, and the conservation-development density), parking, height, site flags, and the findings for the law check. It flags where the atlas and recent Cumberland decisions disagree. `lib/schedule.ts` lays the steps out on dates and writes the `.ics`.

## Adding a municipality

1. Add its sources to `sources.ts` and its offices to `contacts.ts`.
2. Copy the trees in `trees.ts`, then change the local pinpoints, quotes and checklists.
3. Add its record links to `records.ts`.
4. Query its districts from the Zoning Atlas layer (`fetchAtlasDistricts("<Town>")`), and add any ordinance-specific density rule to `requiredArea` in `engine.ts`.
5. Read its hearing minutes and videos into `heard` entries, then set `indexed: true` in `records.ts`.

## Not yet built

- Plan-set extraction: uploaded files are only listed, and the site facts are entered by hand.
- Live GIS joins (parcels, zoning, FEMA flood, RIDEM wetlands)
- Fees: Cumberland's current fee schedule was not available.
- Precedent outcomes: read from minutes through May 2026. Later minutes are not yet read.
- Video transcription: meeting videos are linked, not transcribed. The backend should transcribe them and tag objections the way the minutes were tagged by hand.
- Business days: schedules count calendar days, as the statutes do. Meeting dates are estimated, not taken from the board calendar.
