# Documents to save by hand

Kept with `docs/plans/statewide-coverage.md` (ARD D53). Updated 2026-11-20. This lists only what is still wanted. Each host below refuses a script or needs a person on the page; since 2026-11-19 that includes eCode360 (ARD debt 36). Earlier fetches are done and read; their record is in git and in `docs/ARD.md`'s log.

## How to save, and how to check it worked

1. Save each file into the folder named for it below (for example `.sources/pawtucket/regulations/`), creating the folder if it is not there. The name the browser gives the file is fine.
   - A **PDF**: open it and save it, or right-click the link and choose *Save link as*.
   - A **web page**: *File → Save Page As*, and choose **Webpage, HTML only**.
2. Run `python3 scripts/towns/organize_sources.py`. It turns each new file to text and lists it in `.sources/INDEX.md` under **In hand, not yet cited**. Nothing more is needed from you; I register each one when I read it.

### On each host

- **eCode360** (Pawtucket, Cranston, Glocester and 15 others): open the chapter, click the **download** icon above the text (or *Print*), keep "include subsections" ticked, and save the PDF. The PDF's footer says "Downloaded from ecode360.com…", which is how the copy is identified.
- **Municode** (East Providence, Newport, Central Falls, Warwick, Scituate and others): open `https://library.municode.com/ri/<town>/codes/code_of_ordinances` (the town as written in `lib/data/towns.ts`, for example `east_providence`). Find the chapter in the contents on the left, open it, use **Download** above the text, choose the whole chapter, and save it as a PDF or Word file.
- **A town or city website**: the Planning Department's page usually lists its regulations as PDFs; if not, search the site for "land development regulations" or "subdivision regulations".

## 1. The cities' land development regulations (their review routes, ARD D69)

The cities' routes on the site are state law, with each city's practice read from its minutes. These would give each city its own steps, clocks and checklists. Save each into `.sources/<city>/regulations/`.

| City | What | Where to look |
| --- | --- | --- |
| Pawtucket | Subdivision and Development Review Regulations; and the map or text that says which districts make up the Riverfront District (§ 410-14.2) | eCode360 (PA1467), or the Department of Planning and Redevelopment's page |
| Cranston | Subdivision and Land Development Regulations (the City Plan Commission's; eCode360's Subdivisions chapter is only the code's) | The Planning Department's page |
| Warwick | Land Development and Subdivision Review Regulations; and the zoning amendments the city has posted since 2024, to check Municode's Appendix A is current | The Planning Department's page; <https://www.warwickri.gov/city-council-legislative-department/pages/code-ordinances> |
| East Providence | Land Development and Subdivision Regulations; and the Waterfront Commission's rules and procedure | Municode (Chapter 19 and any regulations chapter); the Waterfront Commission's page |
| Woonsocket | The current Land Development and Subdivision Regulations, if newer than Appendix B on ClerksHQ (dated 2017) | The Planning Department's page |
| Newport | Land Development and Subdivision Regulations; the Historic District Commission's rules, filing deadlines and meeting schedule | Municode; the Historic District Commission's page |
| Central Falls | Land Development and Subdivision Regulations; and the Planning Board's and Zoning Board's minutes since May 2025, which are not on the state site | The city's website (Municode for the regulations) |

## 2. Maps that are not map data

Each fills a "tick on the form" or a district the Zoning Atlas has wrong. A PDF is enough. Save into `.sources/<town>/maps/`.

- **Newport**: the Historic District Zoning Map (filed with the City Clerk, § 17.80.030). Try the Planning or GIS page first.
- **New Shoreham**: the Historic District Map (§ 317).
- **Foster**: the official zoning map adopted with the October 2023 districts (§ 38-501). The Atlas still shows the old districts.
- **Richmond**: the zoning map, for the Switch Road site, which has no district at its parcel's centre in the Atlas.
- **Westerly**: the Official Zoning Map (§ 260-16, July 1, 2019, as amended); the Airport Area Overlay's confliction area maps 2A to 2D; and the Aquifer, Wellhead and Salt Pond overlay maps, if the Planning or Zoning office posts them. Search <https://www.westerlyri.gov/Search?searchPhrase=zoning%20map>.

## 3. Ordinances and chapters still wanted

- **New Shoreham**: the Historic District Zoning Ordinance, which the zoning incorporates (§ 317). Into `.sources/new-shoreham/ordinance/`.
- **Glocester**: Chapter 286, Affordable Housing (eCode360, GL2062). The zoning points to it, so the site cannot yet say Glocester has no inclusionary requirement. Into `.sources/glocester/ordinance/`.
- **Scituate**: its zoning chapter from Municode, the official copy (it would not download on 2026-11-18; worth one more try). Into `.sources/scituate/ordinance/`.
- **Providence**: the Historic District Commission's design standards for each district; and the staff report for 203 Douglas Avenue (26-047MIL) once posted, under its meeting in the [2026 meeting materials](https://www.providenceri.gov/planning/2026-cpc-meeting-materials/). providenceri.gov refuses scripts; save from the browser. Into `.sources/providence/`.

## 4. Questions for a person, not fetches

Not published, or not in a form the site can read. They stay named gaps until someone answers.

- **New Shoreham, Town Clerk**: which copy of the zoning ordinance is official. The Town's website links to eCode360; the Secretary of State lists ClerksHQ, where there is none.
- **North Smithfield, Town Clerk**: where the official zoning ordinance is published. The eCode360 copy in hand is not the official one.
- **West Greenwich, Planning Board**: the stenographer's transcripts of its comprehensive permit hearings, on request. Its minutes name speakers but not what they said.
- **Providence, Planning**: whether the Capital Center Commission still reviews development downtown, and where its district lies. Its last meeting on the state site was July 9, 2025, and the City's map layer for it is empty.
- **Westerly, Planning**: whether its 15% inclusionary share is of the units entered or of "the basic number dwelling units per acre permitted in the underlying zone"; whether the Route One Corridor Overlay is still pending; whether the zoning and overlay layers are published as a map service; and what the R-6 district on its zoning layer is.
- **Any town without its own line**: whether 7 to 9 homes over shops are a minor or major project (§ 45-23-32(19)(i)(C)). A reading the town makes.
