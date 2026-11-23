# Documents to save by hand

Kept with `docs/plans/statewide-coverage.md` (ARD D53). Updated 2026-11-20, after the second hand fetch. This lists only what is still wanted, each with the closest link found: the document itself where it could be found, otherwise the page that lists it, otherwise the town's homepage with the path to follow. Everything here refuses a script or could not be found by one; since 2026-11-19 that includes eCode360 (ARD debt 36). eCode360, Municode and Central Falls's site answer a browser but not a script, so their links open normally for you. Earlier fetches are done and read; their record is in git and in `docs/ARD.md`'s log.

**Fetched by script on 2026-11-20, so off this list:** the land development regulations of Pawtucket (2024.1), Cranston (Feb 4, 2025), Warwick, East Providence (Jan 1, 2024) and Newport (2025), into `.sources/<city>/regulations/`; and Richmond's Plat 8A zoning map, for the Switch Road site, into `.sources/richmond/maps/`. Westerly's zoning map (2022) was already in hand.

**Saved by hand on 2026-11-20, and read (ARD D78):** Central Falls's regulations (April 23, 2025) and Woonsocket's (May 4, 2021, still before the state's 2023 rewrite); Warwick's code comparative table, in place of the amendments, which the City's site does not post; Newport's historic district maps from the City's MapGeo viewer; a screenshot of New Shoreham's GIS, which led to its Historic District Overlay as a map service the lookup now reads; Foster's dimensional sheet and zoning relief forms, and its GIS link, which led to its zoning layer, which the lookup and the map now use; New Shoreham's whole code, for Chapter 7; Glocester's Chapter 286, repealed in 2023; and the Providence Historic District Commission's standards of 1994 for six districts. A second copy of Westerly's zoning had the same amendments as the one read (to June 22, 2026), and is kept in `.sources/westerly/ordinance/`. Foster's "Updated Dimensional Regs" was byte for byte the same as its dimensional sheet (`fodim`) and was deleted; its "Zoning Board of Review Application" is the same as the relief forms (`forelief`), and is left unfiled.

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

None. Woonsocket's newest found is of 2021; if the City has adopted regulations since the state's 2023 rewrite, they are not on its site.

## 2. Maps that are not map data

A PDF or screenshot of the map is enough. Save into `.sources/<town>/maps/`. Newport's, New Shoreham's and Foster's are done; the last two turned out to be map services the site now asks directly.

- **Westerly**, the Airport Area Overlay's confliction area maps 2A to 2D, and the Aquifer, Wellhead and Salt Pond overlay maps: the [Planning page](https://www.westerlyri.gov/162/Planning) or the [Zoning page](https://www.westerlyri.gov/327/Zoning). The zoning map itself is in hand.

## 3. Ordinances and chapters still wanted

- **Scituate**, the zoning chapter. [Municode's](https://library.municode.com/ri/scituate/codes/code_of_ordinances) Download failed twice. Two other ways: open the zoning chapter on Municode and use its **Print** icon, then the browser's *Save as PDF*; or, failing that, select the chapter's text and paste it into a text file. The Town's own site links "Town Ordinances" to [eCode360](https://ecode360.com/SC4136), but that holds only the subdivision regulations, and Zoneomics shows nothing without its app. Into `.sources/scituate/ordinance/`.
- **Providence**, the staff report for 203 Douglas Avenue (26-047MIL), if one is ever posted. On the [2026 meeting materials](https://www.providenceri.gov/planning/2026-cpc-meeting-materials/) page it would sit under **July 28, 2026** or **August 18, 2026**, the two meetings it was listed for. It was continued to October 20, but was not on that agenda or on November 17's, so there may be nothing to find yet. The file saved earlier as "Referral-3622-21-25-Douglas-Ave" is a different case: CPC Referral 3622, rezoning 21 and 25 Douglas Avenue from R-4 to C-2, on the August 18 agenda. Into `.sources/providence/`.

## 4. Questions for a person, not fetches

Not published, or not in a form the site can read. They stay named gaps until someone answers.

- **New Shoreham, [Town Clerk](https://www.newshorehamri.gov/151/Town-Clerk)**: which copy of the zoning ordinance is official. The Town's website links to [eCode360's](https://ecode360.com/36749402), amended through Ord. 2025-03; the Secretary of State lists [ClerksHQ's](https://clerkshq.com/Content/NewShoreham-RI/books/code/NShoreAppE.htm), which stops at Ord. 2024-11.
- **North Smithfield, Town Clerk**: where the official zoning ordinance is published. The [Town Charter & Ordinances page](https://www.nsmithfieldri.org/284/Town-Charter-Ordinances) has no zoning chapter, and the eCode360 copy in hand is not the official one.
- **West Greenwich, [Planning Board](https://www.wgtownri.org/171/Planning-Board)**: the stenographer's transcripts of its comprehensive permit hearings, on request. Its minutes name speakers but not what they said.
- **Providence, [Department of Planning and Development](https://www.providenceri.gov/planning/)**: whether the Capital Center Commission still reviews development downtown, and where its district lies. Its last meeting on the state site was July 9, 2025, and the City's map layer for it is empty.
- **Newport, [Planning](https://www.newportri.gov/)**: whether the historic districts drawn in the City's MapGeo viewer are published as a map service (an ArcGIS or similar address), so the lookup could find them as it does Providence's and New Shoreham's. The City's ArcGIS Online account has none.
- **New Shoreham, Historic District Commission**: its published standards for certificates of appropriateness (§ 7-5(c) says it publishes them), and whether the GIS overlay (last edited 2017) and the list of lots in § 7-13 (2013) still agree.
- **Westerly, [Planning](https://www.westerlyri.gov/162/Planning)**: whether its 15% inclusionary share is of the units entered or of "the basic number dwelling units per acre permitted in the underlying zone"; whether the Route One Corridor Overlay is still pending; whether the zoning and overlay layers are published as a map service; and what the R-6 district on its zoning layer is.
- **Any town without its own line**: whether 7 to 9 homes over shops are a minor or major project (§ 45-23-32(19)(i)(C)). A reading the town makes.
