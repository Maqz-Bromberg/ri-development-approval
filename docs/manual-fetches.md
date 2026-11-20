# Documents to save by hand

Kept with `docs/plans/statewide-coverage.md` (ARD D53). Updated 2026-11-20. This lists only what is still wanted, each with the closest link found: the document itself where it could be found, otherwise the page that lists it, otherwise the town's homepage with the path to follow. Everything here refuses a script or could not be found by one; since 2026-11-19 that includes eCode360 (ARD debt 36). eCode360, Municode and Central Falls's site answer a browser but not a script, so their links open normally for you. Earlier fetches are done and read; their record is in git and in `docs/ARD.md`'s log.

**Fetched by script on 2026-11-20, so off this list:** the land development regulations of Pawtucket (2024.1), Cranston (Feb 4, 2025), Warwick, East Providence (Jan 1, 2024) and Newport (2025), into `.sources/<city>/regulations/`; and Richmond's Plat 8A zoning map, for the Switch Road site, into `.sources/richmond/maps/`. Westerly's zoning map (2022) was already in hand.

## How to save, and how to check it worked

1. Save each file into the folder named for it below (for example `.sources/woonsocket/regulations/`), creating the folder if it is not there. The name the browser gives the file is fine.
   - A **PDF**: open it and save it, or right-click the link and choose *Save link as*.
   - A **web page**: *File → Save Page As*, and choose **Webpage, HTML only**.
2. Run `python3 scripts/towns/organize_sources.py`. It turns each new file to text and lists it in `.sources/INDEX.md` under **In hand, not yet cited**. Nothing more is needed from you; I register each one when I read it.

### On each host

- **eCode360**: open the chapter, click the **download** icon above the text (or *Print*), keep "include subsections" ticked, and save the PDF.
- **Municode**: open the town's code, find the chapter in the contents on the left, open it, use **Download** above the text, choose the whole chapter, and save it as a PDF or Word file.
- **A town's own website**: where only the homepage is linked below, the path to follow is given with it.

## 1. Land development regulations still wanted

| City | What | Link | Save into |
| --- | --- | --- | --- |
| Woonsocket | The current Land Development and Subdivision Regulations, if newer than [Appendix B on ClerksHQ](https://clerkshq.com/Content/Woonsocket-ri/books/code/woonappb.htm) (2017) | [woonsocketri.gov](https://www.woonsocketri.gov/): look for *Planning & Development* (the Planning Division) under Departments. Its menu does not load for a script, so the path is not checked. | `.sources/woonsocket/regulations/` |
| Central Falls | Land Development and Subdivision Regulations (adopted April 23, 2025) | [centralfallsri.us](https://centralfallsri.us/): look for Planning under Departments; the site refuses scripts, so the path is not checked. its board minutes are on [ClerksHQ](https://clerkshq.com/Content/CentralFalls-ri/planningzoning/2025/nov19_25pzag.htm), which I can fetch myself. | `.sources/central-falls/regulations/` |
| Warwick | The zoning amendments the City Council has passed since 2024, to check Municode's Appendix A is current | [warwickri.gov](https://www.warwickri.gov/): look for the City Council's *Code of Ordinances* page (the address used before now gives "not found"; the [Planning Board page](https://www.warwickri.gov/385/Planning-Board) holds the Board's own documents) | `.sources/warwick/ordinance/` |

## 2. Maps that are not map data

Each fills a "tick on the form" or a district the Zoning Atlas has wrong. A PDF or screenshot of the map is enough. Save into `.sources/<town>/maps/`.

- **Newport**, the Historic District Zoning Map (§ 17.80.030, filed with the City Clerk): start at the [Historic District Commission's page](https://www.newportri.gov/City-Hall/Boards-Commissions/Commissions/Historic-District-Commission). Its "Historic District" PDF is an annual report, not the map; if the map is not there, the [City Clerk](https://www.newportri.gov/) holds it.
- **New Shoreham**, the Historic District Map (§ 317): the Town's [Historic District page](https://www.newshorehamri.gov/395/Historic-District), or its [GIS maps](https://bigis.maps.arcgis.com/home/index.html), whose Zoning Districts map has the historic district in its legend.
- **Foster**, the official zoning map adopted with the October 2023 districts (§ 38-501): the [Zoning Documents](https://www.townoffoster.com/232/Zoning-Documents) page, or the [GIS map](https://experience.arcgis.com/experience/8078d5749dd4422aa4093e805220c854).
- **Westerly**, the Airport Area Overlay's confliction area maps 2A to 2D, and the Aquifer, Wellhead and Salt Pond overlay maps: the [Planning page](https://www.westerlyri.gov/162/Planning) or the [Zoning page](https://www.westerlyri.gov/327/Zoning). The zoning map itself is in hand.

## 3. Ordinances and chapters still wanted

- **New Shoreham**, the Historic District Zoning Ordinance (incorporated by § 317; Chapter 7 of the Revised Ordinances): eCode360's [New Shoreham code](https://ecode360.com/NE4081), Chapter 7, or the [Historic District Commission's page](https://www.newshorehamri.gov/186/Historic-District-Commission). Into `.sources/new-shoreham/ordinance/`.
- **Glocester**, Chapter 286, Affordable Housing: eCode360's [Glocester code](https://ecode360.com/GL2062), Chapter 286. The zoning points to it, so the site cannot yet say Glocester has no inclusionary requirement. Into `.sources/glocester/ordinance/`.
- **Scituate**, the zoning chapter, the official copy: [Scituate on Municode](https://library.municode.com/ri/scituate/codes/code_of_ordinances). It would not download on 2026-11-18; worth one more try. Into `.sources/scituate/ordinance/`.
- **Providence**, the Historic District Commission's design standards for each district: the [Commission's page](https://www.providenceri.gov/planning/providence-historic-district-commission-phdc/). And the staff report for 203 Douglas Avenue (26-047MIL) once posted: the [2026 meeting materials](https://www.providenceri.gov/planning/2026-cpc-meeting-materials/), under its meeting date. providenceri.gov refuses scripts. Into `.sources/providence/`.

## 4. Questions for a person, not fetches

Not published, or not in a form the site can read. They stay named gaps until someone answers.

- **New Shoreham, [Town Clerk](https://www.newshorehamri.gov/151/Town-Clerk)**: which copy of the zoning ordinance is official. The Town's website links to [eCode360's](https://ecode360.com/36749402), amended through Ord. 2025-03; the Secretary of State lists [ClerksHQ's](https://clerkshq.com/Content/NewShoreham-RI/books/code/NShoreAppE.htm), which stops at Ord. 2024-11.
- **North Smithfield, Town Clerk**: where the official zoning ordinance is published. The [Town Charter & Ordinances page](https://www.nsmithfieldri.org/284/Town-Charter-Ordinances) has no zoning chapter, and the eCode360 copy in hand is not the official one.
- **West Greenwich, [Planning Board](https://www.wgtownri.org/171/Planning-Board)**: the stenographer's transcripts of its comprehensive permit hearings, on request. Its minutes name speakers but not what they said.
- **Providence, [Department of Planning and Development](https://www.providenceri.gov/planning/)**: whether the Capital Center Commission still reviews development downtown, and where its district lies. Its last meeting on the state site was July 9, 2025, and the City's map layer for it is empty.
- **Westerly, [Planning](https://www.westerlyri.gov/162/Planning)**: whether its 15% inclusionary share is of the units entered or of "the basic number dwelling units per acre permitted in the underlying zone"; whether the Route One Corridor Overlay is still pending; whether the zoning and overlay layers are published as a map service; and what the R-6 district on its zoning layer is.
- **Any town without its own line**: whether 7 to 9 homes over shops are a minor or major project (§ 45-23-32(19)(i)(C)). A reading the town makes.
