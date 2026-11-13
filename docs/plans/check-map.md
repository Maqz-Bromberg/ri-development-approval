# Plan: a zoning map on the Check page

Status: proposed, for review. Nothing built.

## What it is for

The Check page says which district the site is in and what that district allows, but never shows *where*. A map in the "What the zoning allows here" section would orient the applicant:

- where the site sits in its district, and how close a district line is
- what is already built around it, which is the first thing a planning board and the neighbours look at
- which nearby projects went through which approval route, and how they came out

## Sketch

```
 Your district
 What the zoning allows here
┌──────────────────────────────────────────┬──────────────────────────────┐
│  [map]                                   │  R-3 · Multi-Household …      │
│   ░░ R-3 ░░░░░│▒▒ C-1 ▒▒▒                 │  (the existing Atlas panel)   │
│   ░ ■ ■ □ ★ ■ │▒ ◆  ▒▒▒                   │                              │
│   ░ ■ □ ■ ■   │▒▒▒▒▒▒▒                    │                              │
│      ● Haley's Commons (pin)              │                              │
│  ┌ hover ─────────────────┐              │                              │
│  │ Multi-family home       │              │                              │
│  │ AP 28 Lot 65 · 0.63 ac  │              │                              │
│  │ 73% developed · R-3     │              │                              │
│  └─────────────────────────┘              │                              │
│  Legend: ■ single-family ■ multi-family ■ commercial ■ public ■ vacant  │
│          ● pins: comprehensive permit · major · minor · staff review     │
└──────────────────────────────────────────┴──────────────────────────────┘
 ★ = your site (parcel outline)
```

On a phone the map stacks above the Atlas panel at full width, with the legend under it.

## Layers

| Layer | Source | Coverage | Shows | Hover |
| --- | --- | --- | --- | --- |
| Zoning districts | RI Zoning Atlas, layer 14 (already queried for attributes) | All 39 towns, live | Outlines and labels. The project's district is tinted and the others are outlined. | District code and name, and how it treats the project's housing type (the same chip as the Atlas panel) |
| Surrounding parcels | RIDEM Tax Parcels (already queried for the site's own parcel) | Statewide, live | Parcels within about 400 m of the site, filled by the E-911 structure type | Structure type, plat/lot, acres, % developed, impervious sq ft |
| The site | Address lookup | Wherever an address was looked up | Parcel outline and a marker | Address, plat/lot, acres |
| Nearby projects | `history.ts` (8 Cumberland projects) | Cumberland only | Pins colored by approval route | Name, units (affordable), route, outcome, link to its row in the precedent table |

### Colours for surrounding parcels

The parcel layer's `E911_Type` collapses into six classes:

| Class | E-911 codes | Note |
| --- | --- | --- |
| Single-family | R1 | |
| Multi-family | R2, R4 | The state's "Multi-Family Home" covers everything from a two-family house to an apartment block. It carries no unit count. |
| Commercial and lodging | C1, C9, CL | |
| Public and institutional | P1–P8 | Government, school, church, gathering |
| Accessory or other | A1, A2, G1, G2, DV | |
| No structure recorded | None | Usually vacant land, roads or open space |

These codes say which structures the state's 911 system records, not the zoning use or the number of units. The legend will say so.

### Colours for project pins

The four route classes the site already uses: comprehensive permit, major land development, minor land development, and development plan review by staff. A pin's shape shows its status (approved, pending, approved by staff; none of the 8 was denied), so colour isn't the only signal. Six of the 8 have a plat/lot, so their parcels can be found exactly. The other two need a one-time geocode.

## What has to change

1. **Keep the site's coordinates.** The address lookup finds a point and a parcel outline, but `ProjectInputs` drops both. Add optional `lat`, `lon` and `outline`. They travel in the share link and the export like the other facts, so there is no new browser-only storage.
2. **Give the 8 projects a location.** Where `history.ts` has a plat/lot, query the parcel layer for its outline once and store the centroid. Otherwise geocode the street address once by hand. Store the coordinates in the file, not at runtime.
3. **Map component.** `components/ZoningMap.tsx`, client-only (`next/dynamic`, `ssr: false`), in the district section beside `AtlasPanel`.
4. **Queries.** District outlines per town, cached like the district attributes, with simplified geometry (`maxAllowableOffset`). Parcels per site, within 400 m, outlines simplified and capped at the service's 2,000 records. Both are fetched only when the map scrolls into view.

## Without an address

The example project and hand-entered projects have no point. The map then shows the whole town's districts with the project's district tinted, plus the precedent pins, and a prompt: "Look up an address to see the parcels around your site." Parcels load only once there is a site.

## Decisions for you

1. **Base map.** (a) **Leaflet with a light street basemap** (CARTO Positron, with a matching dark version). Users get street names to orient by. This adds a dependency (`leaflet`, ~40 KB gzipped) and a third-party tile service with attribution. (b) **Plain SVG, no basemap.** Districts and parcels only, no dependency and no tile requests, but no street names. Streets show only as gaps between parcels. Recommended: (a). Orientation is the point, and parcels without street names are hard to place.
2. **"Development classification".** This plan reads it two ways: existing parcels by structure type (statewide, live) *and* recent projects by approval route (Cumberland, 8 projects). If you meant only one, the other layer drops out.
3. **Radius.** 400 m (about 5 minutes' walk) is about the area a board considers "the neighbourhood" and keeps queries under the record cap in dense areas. Wider shows more, but needs paging in places like downtown Providence.

## Not in this plan

- Abutter lists for notice. The parcel layer has no owner names. That would need town assessor data.
- Unit counts for existing buildings. No statewide source has them.
- Wetlands, flood zones and transit stops on the map. These are possible later layers that would also inform the site facts the form asks for by hand.
