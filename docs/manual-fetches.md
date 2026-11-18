# Documents to save by hand

Kept with `docs/plans/statewide-coverage.md` (ARD D53). Everything here was checked on 2026-11-18 and refuses a script, or could not be found by one. Save each file anywhere inside `.sources/` under the name the browser gives it, then run `python3 scripts/towns/organize_sources.py`. An ordinance goes in `.sources/<town>/ordinance/` (see `docs/ordinance-hosts.md`).

Grouped by the chunk that needs it, first needed first. Each line says what it would answer on the site.

## Chunk 0: the whole of Providence

providenceri.gov sits behind a firewall (Sucuri) that refuses scripts after a few requests. On 2026-11-18 a plain request got through twice and was then refused, so the site stays a by-hand source.

| What | Where | What it answers |
| --- | --- | --- |
| Staff reports for each City Plan Commission project, 2023 to 2026 | The year pages under [CPC meeting materials archive](https://www.providenceri.gov/planning/cpc-meeting-materials-archive/) (2023, 2024, 2025, 2026) | Lot size, district, units, relief and the recommendation for each project in `lib/data/towns/providence/agenda.json`. This is the reading that turns a listed project into precedent. Save only the staff reports for multi-family, mixed-use and commercial cases; the list marks which ones they are. |
| Historic District Commission standards and guidelines | providenceri.gov, Historic District Commission page | The gap on the certificate of appropriateness step: what the Commission's standards require, and which work staff can approve. |
| Historic District Commission meeting and filing schedule | The same page | The certificate step's clock, now "not read". |
| Downtown Design Review Committee schedule and application | providenceri.gov, Downtown Design Review Committee page | The design review step's clock and documents, now "not read". |
| Zoning Board of Review meeting schedule | providenceri.gov, Zoning Board of Review page | The board's contact lines (its meetings are on the state site, its own page is not). |
| Transit-Oriented Development Overlay | Already in hand: Zoning Ordinance § 1105 (`pzo`) | Not a fetch: a reading. Listed so it is not forgotten. |

## Chunk 3: Westerly

| What | Where | What it answers |
| --- | --- | --- |
| Official zoning map, with the overlay districts | westerlyri.gov, Planning or GIS page (a PDF map, or a map service if the town publishes one) | Westerly's overlays are not in the Zoning Atlas and no map service was found, so a site's overlays are ticked by hand. A service would let the lookup find them, as it does for Providence. |
| Airport Area Overlay District maps and confliction area maps 2A to 2D | The same, or the Zoning Office | Whether a lot near the airport has a mapped confliction area (§ 260-51). |
| Aquifer Protection Zone and Wellhead Protection Zone maps | The same | Which zone a site is in (§ 260-52). RIDEM's statewide wellhead layer is not the town's overlay. |
| Planning Board recordings, if any | westerlyri.gov | Hearing concerns, as for Providence (D7). The Planning Board files its minutes on the state site with text, about 50 days after each meeting. |

## Chunk 4 onward: ordinances

The 24 official ordinances not on eCode360, in the order the chunks need them. `docs/ordinance-hosts.md` says how to save each kind of host.

| For chunk | Towns | Host |
| --- | --- | --- |
| 4 | North Providence | ClerksHQ: open the zoning title once and note the address of its page; a script can fetch it after that |
| 5 | New Shoreham (the official copy, to compare with the eCode360 copy in hand) | ClerksHQ |
| 6 | Foster, Exeter, Hopkinton | Municode |
| 6 | Richmond | ClerksHQ |
| 7 | Cranston, East Providence, Newport, Central Falls | Municode |
| 7 | Warwick (the zoning appendix and each amendment, which the city posts as separate PDFs) | The city's website |
| 7 | Woonsocket | ClerksHQ |
| 7 | Smithfield: its zoning chapter is not in its eCode360 code | The town's website, if it can be found there |
| Later | Bristol, Burrillville, Jamestown, Narragansett, North Kingstown, Scituate, South Kingstown, Tiverton, Warren, West Warwick | Municode |
| Later | Middletown | American Legal |
| Later | North Smithfield | The town's website |

## Not a fetch: questions for a person

These are not published, or not in a form the site can read. They stay named gaps until someone answers them.

- **Capital Center Commission (Providence).** Its last meeting on the state site was July 9, 2025, and the City's map layer for the Capital Center Special Development District is empty. Whether the Commission still reviews development downtown, and where its district lies, needs the City's planning office.
- **Westerly's inclusionary count.** The ordinance takes 15% of "the basic number dwelling units per acre permitted in the underlying zone"; the site takes 15% of the units entered. The planning office would say which.
- **Whether 7 to 9 homes over shops are minor or major** in any town without its own line (state law § 45-23-32(19)(i)(C)). A reading the town makes.
