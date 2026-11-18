# Where each town's zoning ordinance is published

From the Secretary of State's list of municipal ordinance databases (sos.ri.gov, Open Government Center, municipal ordinances), read 2026-11-14. The same links are in `lib/data/towns.ts` (`code`), shown on the Towns page, and offered beside every gap in the check that a town's ordinance would answer.

## By script: 14 towns on eCode360

`scripts/towns/fetch_ecode.py` saves each town's zoning and subdivision chapters, and their attachments, into `.sources/<town>/ordinance/`, and writes a survey to `.sources/ECODE.md`.

Barrington, Charlestown, Coventry, Cumberland, East Greenwich, Glocester, Johnston, Lincoln (LI1805), Little Compton, Pawtucket, Portsmouth, Smithfield, West Greenwich, Westerly. All fetched on 2026-11-14, except **Smithfield's zoning chapter, which is not in its eCode360 code**: only its subdivision regulations are. Smithfield's zoning has to be found on the town's own site.

General Code's own list also has eCode360 codes for Cranston, New Shoreham, North Smithfield and Scituate, but the Secretary of State lists other hosts for those four, so the eCode360 copies may not be current. The fetcher still takes them and the survey marks them.

## By hand: 25 towns (3 of them since fetched by script)

Save the zoning chapter (and, where it is a separate document, the land development and subdivision regulations) into `.sources/<town>/ordinance/` under any name, then run `scripts/towns/organize_sources.py`, which turns each PDF or page into text and lists it in `.sources/INDEX.md`.

| Host | Towns | How |
| --- | --- | --- |
| Municode (refuses scripts) | Bristol, Burrillville, Central Falls, Cranston, East Providence, Exeter, Foster, Hopkinton, Jamestown, Narragansett, Newport, North Kingstown, Providence, Scituate, South Kingstown, Tiverton, Warren, West Warwick | Open the town's code, go to the zoning chapter (often an appendix), and use the download or print button to save it as a PDF. Providence's ordinance is already in hand as source `pzo`. |
| American Legal (refuses scripts) | Middletown | The same: the chapter's print or download view, saved as a PDF. |
| ClerksHQ (answers scripts) | North Providence, Richmond, Woonsocket: **fetched by script on 2026-11-18** (`scripts/towns/fetch_clerkshq.py`, which keeps the addresses). New Shoreham: its ClerksHQ page has board records and no town code, so its official copy is still to be found. | The contents load in the browser. Open the zoning title once and note the address of its page (`clerkshq.com/Content/<Town>-ri/…htm`); after that a script can fetch it. |
| The town's own website | North Smithfield, Warwick | Warwick posts its zoning ordinance (Appendix A) and amendments as PDFs on the city site; North Smithfield on its charter and ordinances page. |

## Which town to read next, for the form

The survey in `.sources/ECODE.md` counts, for each eCode360 town, the features the site's present form does not handle: form-based districts, village and planned districts, overlays, use tables by number, a different name for special use permits, floor area ratios, coastal and septic rules. See `docs/plans/commercial-mixed-use.md`, section 11, for the town chosen and why.
