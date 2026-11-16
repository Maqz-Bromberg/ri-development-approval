# Plan: the agenda layout (redesign v2, full viewport)

Status: proposed 2026-11-16 and answered by Maqz the same day (answers in section 9). Built on the branch `agenda-layout` the same day, all eight phases in one pass (see D42 to D44 and debts 22 to 25 in the ARD for what differs). Its decisions go into `docs/ARD.md` as D42 and after, as each phase lands.

The design is `design/redesign v2/agenda-full.html`. It is a working prototype on the Cumberland major route, with data copied from the repository. `agenda.html` is the same design in a scaled frame, with the design notes. `directions.html` holds the three earlier directions it came from. Where this plan and the prototype differ, the plan wins: the prototype was drawn in plain HTML, and some of what it shows (the map, the layers box) is a diagram of a part the site already has.

## 1. What the design changes

| Now | In the design |
| --- | --- |
| Nine equal links: Overview, Site selection, Check, Steps, Schedule, Hearing prep, Zoning atlas, Records, Towns | **Five stages**, each with a live subtitle: Site (the address), Zoning & law (blockers and open questions), Route & people, Calendar (the next date), Hearing (the date and the questions picked). Then a **Reference** menu (Atlas, Towns, Records, Glossary, Documentation) and a **save chip**. |
| Pages scroll as documents, with a header and a footer | **An app shell that fills the window.** The header is fixed. Below it are three columns: a rail on the left (the site card and an outline of the stage), the stage in the centre (the only part that scrolls), and a tray on the right. |
| The project summary panel on the left (D22) | **A site card** at the top of the rail: address, plat and lot, district, units, route, and the verdict in one line. Each fact links to its field. |
| Nothing is carried between pages except the project | **The tray** carries three things on every stage: **pinned** items (a finding, document, contact, date, site fact or hearing question), the **hearing sheet**, and the **contacts on your route** grouped by kind of body. |
| "Take this project with you" on the Steps page; saved sites on Site selection | **The save chip** shows "N changes not saved" or "Saved", with the changes listed on hover. Save writes the project to Your sites. Its card also has the project file and the share link. |
| Check, then Steps | **Zoning & law** (the verdict, its facts, every finding with its quote, the statutory clocks) is its own stage. **Route & people** repeats the verdict in short, links back to the check, and lists the steps. |
| A step row shows its title and who decides | Each row shows the deciding bodies as **coloured chips with their mode** (Legislative, Quasi-judicial, Administrative, Permitting, Service letter), with a hover card. Opened, a step shows its documents with considerations, contact cards, **its moments on the calendar**, and **the questions to expect at its hearing**. |
| Schedule: a timeline and a month calendar | **Calendar:** one Gantt chart with season bands, ticks by kind of moment, and a panel under the chosen row with the documents due then and who you deal with. The month calendar stays as a second view (section 9). |
| Each page has a coloured heading | **Each stage has a band**: a wash colour, an icon, a short lead, and **reference chips** that link the sources for that stage. |
| Fredoka, Nunito Sans, IBM Plex Mono | **Bitter** for headings, **Atkinson Hyperlegible** for text, on trial against Nunito Sans (section 7) |

Three widths: **wide** (1320 px and up) has all three columns; **laptop** (960 to 1319 px) puts the stages on a second header row and shrinks the tray to an icon strip that opens over the page; **narrow** (under 960 px) hides the stage subtitles, opens the rail from an "Outline" button, and keeps the title, the deciding bodies and the progress in each step row. Phones are left for later, as Maqz asked.

## 2. Where everything goes

The engine, the data and most components stay. The work is mostly in the shell, a new set of styles, and splitting or reshaping the workspaces.

| Stage | URL | Built from | New |
| --- | --- | --- | --- |
| Landing (no site yet) | `/` | `StartCard`, `TownPicker`, `SavedSites`, the file import in `ShareTools`, `KindKey` | A landing that leads to choosing a site, in three designs on trial (section 7). Every design offers: find a site, open a project file, recent and saved sites, and the example. Replaces the hero, `ApprovalTrail` and the feature cards. |
| Site | `/site` | `AddressLookup`, `ZoningMap` (with its D40 key, unchanged), `ZonePicker`, `IntakeForm`, `Compare`, `SavedSites`, `AltBanner` | The form as rows of facts in four groups (Where, District, Project, The land). Each row has its (i), a "suggested by the lookup" mark (D19's "matches"), and an outline when it differs from the saved version. The alternatives as routes (section 3). |
| Zoning & law | `/law` (was `/project`) | `Verdict`, `LawCheck` | Status badges, the Gap tag, a pin on each finding, and the bar of statutory clocks. The rail lists the findings. On trial: the alternatives folded in here (section 7). |
| Route & people | `/route` (was `/steps`) | `RouteFlow`, `DocChecklist`, `ContactCard`, `Authority`, `PrecedentTable`, the route menu from `ProjectSummary` | Kind chips with their mode, the step row grid, each step's calendar moments and questions, the note icon, pins on documents and contacts. "Projects like yours" stays at the end. The rail lists the steps with the kinds of body in each. |
| Calendar | `/calendar` (was `/schedule`) | `lib/schedule.ts`, `lib/calendar.ts`, `useCalendarFile`, `Season`, the month calendar in `ScheduleView` | The Gantt chart and the panel for a moment, with a Gantt / Month switch. The rail has the start date, the key, the .ics file and print. |
| Hearing | `/hearing` | `ObjectionGuide` (topic filter, search, heard lists with their evidence classes) | A band with the date, place, notice date and board; a master or preliminary switch for routes with two hearings; cards in two columns; pins. |
| Reference | `/towns`, `/records`, `/glossary`, `/docs`, `/docs/sources` (new), `/after-approval`, `/verification`, `/summary`, `/engine`, `/dev` | As now | Opened from the Reference menu and the footer. These keep a normal scrolling page under the same header, without the rail and the tray. `/atlas` goes, as already planned (D27). |

Old URLs are kept as small client pages that send the visitor on and keep the `#` part, as `/objections` does now. A share link (`#p=`) and the deep links (`/site#f-units`, `/steps#d-master`) must still work.

The Next.js route groups do this without changing URLs: `app/(stages)/layout.tsx` holds the shell, and `app/(reference)/layout.tsx` holds the plain page. The root layout keeps the providers and the fonts.

## 3. New parts, and how they work

**The stage registry** (`lib/stages.ts`). One list of the five stages: id, URL, label, icon, wash colour, and a function that writes the subtitle from the project. The header, the landing, the rail and the "Continue to" buttons all read it.

**The example tag.** While the project on screen is the example, the Site tab carries **EXAMPLE** in red to the right of its label, and the site card and the verdict say "Example project" (principle 2). The tag goes as soon as the visitor enters a site of their own, opens a file, a link or a saved site.

**Choosing a site first.** A site is chosen when the visitor applies a lookup, clicks a parcel, enters a town and district by hand, opens a saved site, a project file or a share link, or picks "Open the example" on purpose. Until then the other four stages are dimmed in the header, with "Choose a site first" as their subtitle. Whether they can still be opened is a trial (section 7): in the gated version, opening one shows a short card instead of the stage ("These answers are for one site. Choose it first, or open the example."), with the find box and the example button. A share link or a file always opens past the gate.

**Recent and saved sites on the landing.** The saved sites already built (D28) are listed on the landing, with up to five recent projects kept automatically beside them. Both use the browser's local storage, not cookies, as D28 decided: the visitor sees the same thing, but a cookie holds about 4 KB and is sent to a server with every request. The landing says the list is this browser only.

**Opening a project file from the landing.** The file import in `ShareTools` becomes a shared action, offered on the landing as "Open a project file". Reading a site specification document into the facts is a later piece of work. Until then the landing names it as coming, and the Demo list keeps the plans upload as a stand-in.

**Alternatives as routes.** The table of alternatives at the end of Site is rewritten as a list of routes. Each row is one alternative: your entry, the most units the lot supports by right, the unit count under the minor threshold, and, where it opens one, the affordable share that changes the route (D24). Each row shows its route, stages, hearings, relief needed and the estimated date the approval is recorded. A row whose route differs from your entry's carries a **Route changes** mark in the route colour, and every cell that differs from your entry is shaded. "Try it" keeps your entry, with the `AltBanner` back to it (D21). The rows come from `lib/whatif.ts`.

**Notes.** Each opened step has a note icon at the right of its "Documents and considerations" heading. With no note, the icon offers "Add a note", which opens a small pop-up with a text box, saved as you type. With a note, the icon changes to a comment icon with a dot, and the pop-up shows the note to read or edit. A note that came in a project file or a share link is shown the same way, marked with where it came from. The comment icon also appears in the closed step row, beside the hearing and pin marks, so notes can be seen without opening every step.

**Progress on steps and documents.** The design's rings and counts are built as drawn ("3/18" on a step, "2 of 5" on a document, bars in the rail). Maqz will review them with subject experts. Until then this is a recorded exception to principle 3, marked in the ARD.

**The disclaimer footer.** The site may be shown to subject experts without Maqz there, so the disclaimers must stand on their own and lead to how every answer is made.
- A slim strip fixed at the bottom of the shell, on every stage: "Development version. Not reviewed or confirmed by any town or state agency. Not legal advice." with links to **How the engine decides** (`/engine`), **Documentation** (`/docs`) and **Sources and citations** (`/docs/sources`).
- At the end of each stage and on every reference page, the full text of today's footer, extended: how the answers are worked out (the flowcharts), what has been read for this town (its coverage level, the trial mark for Providence, read dates), that every requirement cites its source, and where to report an error.
- In print, the full text at the end.
- `/docs/sources` is new: every cited source from `sources.ts`, by town and kind, with its link and what cites it. It is generated from the data, so it needs no upkeep.
- `/engine` becomes reachable from the footer. D41 called it private for now, so the ARD row changes with this.

**Kinds of body.** The five kinds keep their colours, which match the design already. Each gets a mode and a one-line description, in the data (`lib/data/kinds.ts`), not in a component. The descriptions are written per kind, not per town. Cumberland's "wants them before preliminary approval" becomes a line in the town's reading.

**Pins.** A pin is stored as `{ id, type, resolved?, at }`. The id points at something on the site: `f:<finding id>`, `d:<step>|<document>`, `c:<contact id>`, `t:<tick id>`, `x:<field id>`, `o:<objection id>`. The label and the detail are worked out from the data each time the tray is drawn, not copied, so a pin follows the project. If the project changes so that a pinned thing no longer applies, its pin says so and stays until it is unpinned. Pins are part of the project (`Saved.pins`), in the share link and in the project file (principle 5).

Findings have no id today. Each finding in `analyze` gets a stable one (such as `density`, `wetlands`, `overlay:<name>`). This also lets the rail link to a finding.

**The save chip.** It uses the saved sites already built (D28). "Save" writes the project on screen to Your sites under its address, and replaces the earlier copy. "N changes not saved" compares the project on screen with that copy: parcel, units, facts, considerations ticked, notes, pins and the hearing sheet. A project that has not been saved yet says so. The chip makes no warning on leaving (D26). Its card says that Your sites is this browser only, and gives the project file, the share link and the complete printed review. "Take this project with you" on the Steps page goes.

**The stage icons.** The design's icons as one SVG sprite rendered once in the shell, and an `<Icon name>` that uses it (`components/Icon.tsx`). The topic marks in `ObjectionGuide` and the zoning marks in `ZonePicker` stay as they are.

**Reference chips.** One list per stage (`lib/data/stageRefs.ts`) of real links: a source by its id, a glossary entry, a records page, the Atlas. Every "#" in the prototype becomes a real link or is removed. The Reference menu shows the current stage's chips first.

**Hover cards.** The design uses CSS-only cards. We keep `Popover`, which measures itself and keeps 24 px from the edges, and restyle it.

**Widths.** The width classes come from CSS media queries, not from JavaScript as in the prototype. Then the server and the browser draw the same first screen. Only the tray and the rail opened over the page are client state.

## 4. Where the design conflicted with decisions or principles

All settled by Maqz on 2026-11-16 (section 9).

| # | Design | Conflict | Decided |
| --- | --- | --- | --- |
| a | Narrow width hides the deciding bodies in step rows | Principle 1 | Keep them at every width: coloured kind marks, with the names on a second line |
| b | Rings and counts on steps and documents | Principle 3, and Maqz's "0/18 checks" note of 2026-11-13 | Built as drawn, for review with subject experts; a recorded exception until then |
| c | The verdict and the site card never say "example" | Principle 2 | EXAMPLE in red on the Site tab; "Example project" on the site card and the verdict. Gating on a chosen site and three landings on trial. |
| d | "3 of 7 prepared" in the Hearing subtitle | Principle 3 | "3 questions on your sheet" |
| e | No coverage note or trial mark after the landing | Principle 9, ARD section 2 | A coverage line in the site card, linking to Towns; and in the full footer |
| f | No demo tags | Principle 4 | Every `DemoTag` that applies is kept |
| g | "Try it" only shows a toast | D21 | `AltBanner` kept. Alternatives rewritten as routes, with route changes marked; placement on trial |
| h | A small layers box on an SVG map | D40 | The Leaflet map and its D40 key are kept as they are |
| i | No step notes | Notes are part of the project | The note icon and pop-up, turning into a comment icon when a note exists |
| j | Precedent only as a reference chip | It is on Steps now | Kept at the end of Route & people |
| k | Bitter headings | D17 decided Nunito Sans | A trial of the two |
| l | No footer | The disclaimer is in today's footer | The strip and the full footer in section 3, linking to the engine, the documentation and the sources |

## 5. Things a fixed-window app breaks, and the fix

- **Printing.** Under `@media print` the shell becomes a normal page: header, rail, tray and strip hidden, the stage at full length, the full disclaimer at the end.
- **Deep links and "Go to it".** The centre column scrolls, not the window. `scrollIntoView` works inside it. The prototype's `goTo` (scroll, then flash the target) becomes one helper used by the rail, the tray and the facts links.
- **Back and scroll position.** The browser does not keep a scroll position for an inner column. The shell keeps one per stage for this visit.
- **Keyboard.** The centre column gets `tabindex="-1"` and the focus when the stage changes, so the arrow keys and Page Down scroll it.
- **Phones.** Under 720 px the shell is not fixed. The page scrolls as a document: header, the stage, then the tray as a section at the end, then the footer. This is cheap, and keeps the site usable on a phone until phones are designed.

## 6. What goes

- `ProjectSummary` as a panel and bar (D22), replaced by the site card and the header's subtitles. Its route menu moves to the verdict on Route & people.
- `ProjectWorkspace`, `StepsWorkspace` and `SiteWorkspace` in their present form, replaced by one workspace per stage.
- The landing's `ApprovalTrail`, `TrailHeading` and `Vignettes`, and the feature cards.
- `ShareTools` as a section. Its actions move into the save chip's card and the landing.
- The CSS for all of the above. `globals.css` is 1,350 lines. The new styles go into a file per area (shell, stages, tray) so the old rules can be deleted with their components.

## 7. Trials

Declared in `lib/trials.ts`, each naming its pages (D16), and decided after the build. The first option is what the site shows until then.

| Trial | Options | Pages |
| --- | --- | --- |
| Type | **Bitter headings, Atkinson Hyperlegible text** (the design) · **Nunito Sans** for both (today) | Every page |
| Choosing a site first | **Open:** every stage can be opened, showing the example with its tag · **Gated:** the other stages wait for a chosen site | The five stages |
| Landing | **Find your site:** the design's landing, with the find box first, then who you'll meet and the five stages · **Map first:** the statewide town map across the page with the search box over it, recent and saved sites beside it · **Three ways in:** three equal cards (look up an address, pick on the map, open a project file), with recent and saved sites below | `/` |
| Alternatives | **On Site,** as the list of routes at the end of the page · **In the check,** folded under the verdict on Zoning & law, closed by default | `/site`, `/law` |

Every landing option keeps the same parts: find a site, open a project file, recent and saved sites, the example, the coverage line and the disclaimer. They differ in what leads.

## 8. Phases

Each phase leaves the site whole.

1. **Groundwork.** Fonts and colour tokens (both type options), the icon sprite, the stage registry, kinds with modes, finding ids, and `Saved.pins` in the store, the link and the file.
2. **The shell.** The route groups, the header with the five stages and the EXAMPLE tag, the Reference menu, the rail, an empty tray, the three widths, the disclaimer strip and footer, `/docs/sources`, printing and the phone fallback. The present pages render inside it, unchanged. The old URLs are redirected.
3. **Zoning & law and Route & people.** The two stages that change most, built from `LawCheck`, `Verdict` and `RouteFlow`. Pins on findings, documents and contacts. Rings and counts. The note icon.
4. **Site.** The fact rows, the alternatives as routes, the band. The map and the key do not change.
5. **Calendar.** The Gantt chart and the moment panel, from `buildSchedule`, with the switch to the month calendar.
6. **Hearing and the tray.** The hearing band, the stage switch, the cards; the tray's pins, sheet and contacts; the laptop strip.
7. **The save chip, the landing and the gate.** Save, the list of changes, the card's actions. Recent sites. The three landings and the gate, on trial.
8. **Trials declared, then clean-up.** The four trials in `lib/trials.ts` and on `/dev`. Delete what section 6 lists. Update the ARD (decisions replaced, debts, log) and the engine flowcharts for finding ids and the gate (debt 21).

The ARD gets its rows as each phase lands, not all at the end.

## 9. Answers (Maqz, 2026-11-16)

1. **Who decides at narrow width:** as proposed.
2. **Rings and counts:** keep them for now. Maqz will review them with subject experts.
3. **The example:** as proposed, with EXAMPLE in red to the right of Site in the header. Also try gating the rest of the site on the choice of a site, and trial landing designs that lead with site selection. The landing should offer opening a saved project file, and later a site specification document, and list recent or saved sites.
4. **Trust markings:** add the disclaimer footer. The site may be shown to subject experts without Maqz there, so the disclaimers link to the engine flowcharts, the documentation and the citations.
5. **Alternatives:** list them as routes, with a route change marked. Perhaps better folded into the check: a trial once built.
6. **The map and its key:** keep them as they were. The prototype's map was a diagram.
7. **Notes:** a note icon inline with "Documents and considerations", opening a pop-up, which becomes a comment icon once there is a note, for instance one opened from a file.
8. **Fonts:** a trial of Nunito Sans against Bitter.
9. **The month calendar:** keep it as a switch. Experts will be asked whether it helps, perhaps more in print; a nice demo meanwhile.
10. **The rest, as recommended:** URLs renamed to `/law`, `/route` and `/calendar` with redirects; precedent at the end of Route & people; the illustrated trail dropped from the landing; Save replaces the site's one copy.

Still open: whether to commit `design/redesign v2` with this plan.
