/*
 * How Site selection finds each fact: the layer it asks, how it asks, what it fills or suggests, and what it misses.
 * Shown on /docs/site-facts, one section per fact, linked from the end of each (i) card's "Where to find it".
 * Add a fact here when a new layer starts answering it. Keep it true to lib/lookup.ts.
 */
export type FactHow = "applied" | "suggested" | "yours";

export interface FactSource {
  /** The field key, as in FIELD_HELP and the anchors on /docs/site-facts */
  id: string;
  title: string;
  how: FactHow;
  /** The public layer, with a link to it */
  layer?: { label: string; url: string };
  /** How the layer is asked, in words */
  query: string;
  /** What the answer can get wrong */
  misses: string;
  /** How to check it yourself */
  check: string;
}

const ATLAS = "https://services1.arcgis.com/CjMORKCN9JBntrcv/arcgis/rest/services/RIZoningAtlas1016_WFL1/FeatureServer";

export const FACT_SOURCES: FactSource[] = [
  {
    id: "address", title: "Address to a point", how: "applied",
    layer: { label: "OpenStreetMap Nominatim search", url: "https://nominatim.openstreetmap.org/" },
    query: "The typed address is searched within Rhode Island. Up to five matches come back; you pick one if there are several. A click on the map skips this and uses the point clicked.",
    misses: "A match to the street rather than the building is flagged. Address points often sit in the road, so the lookups below then widen to 30 m around the point.",
    check: "The found place shows on the map, ringed, before anything is applied.",
  },
  {
    id: "town", title: "Municipality", how: "applied",
    layer: { label: "RI Zoning Atlas, districts layer (Jurisdiction)", url: `${ATLAS}/14` },
    query: "The zoning district under the point names its town. The statewide map's outlines come from the Atlas's jurisdictions layer.",
    misses: "Rarely wrong. A point on a town line takes the district it falls in.",
    check: "The town on the tax bill.",
  },
  {
    id: "zone", title: "Zoning district", how: "applied",
    layer: { label: "RI Zoning Atlas, districts layer", url: `${ATLAS}/14` },
    query: "The district polygon containing the point. On a boundary, every district within 30 m is offered and you choose. In Foster, whose districts were renamed in 2023, the Town's own zoning map is asked instead; Providence's is asked beside the Atlas.",
    misses: "The Atlas reflects zoning as of September 2024. A later rezoning or a new ordinance is not in it (Providence's 2026 ordinance dropped two districts, which the picker marks). Foster's map layer is dated January 2024, and it is a working map, not the official one (§ 38-501).",
    check: "The town's official zoning map, or the planning office.",
  },
  {
    id: "parcel", title: "Parcel (plat and lot)", how: "applied",
    layer: { label: "RIDEM statewide tax parcels", url: "https://risegis.ri.gov/hosting/rest/services/RIDEM/Tax_Parcels/MapServer/0" },
    query: "The parcel containing the point, or every parcel within 30 m when the point is in the road, for you to choose.",
    misses: "Parcel lines are the assessor's, not a survey. Recent splits and mergers may be missing.",
    check: "The town's assessor's database or tax bill.",
  },
  {
    id: "lot", title: "Lot area", how: "applied",
    layer: { label: "RIDEM statewide tax parcels (Acres)", url: "https://risegis.ri.gov/hosting/rest/services/RIDEM/Tax_Parcels/MapServer/0" },
    query: "The parcel's acreage, converted to square feet and rounded to the nearest 100.",
    misses: "The assessor's figure, not a survey. It can differ from the deed by several percent.",
    check: "A survey or the recorded plat.",
  },
  {
    id: "water", title: "Public water", how: "applied",
    layer: { label: "RI Zoning Atlas, water districts layer", url: `${ATLAS}/10` },
    query: "Whether the point falls inside a public water district.",
    misses: "Inside a district does not mean a main runs past the lot, or that it has capacity.",
    check: "The water supplier, by letter. Most towns ask for that letter at preliminary plan.",
  },
  {
    id: "sewer", title: "Public sewer", how: "applied",
    layer: { label: "RI Zoning Atlas, sewered areas layer", url: `${ATLAS}/9` },
    query: "Whether the point falls inside a sewered area.",
    misses: "Inside a sewered area does not mean a connection is available or approved.",
    check: "The sewer authority, by letter.",
  },
  {
    id: "dot", title: "Access onto a state road", how: "applied",
    layer: { label: "RIDOT road centrelines", url: "https://risegis.ri.gov/hosting/rest/services/RIDOT/Road_Centerlines/MapServer" },
    query: "Road centrelines within 15 m of the parcel's bounding box (30 m of the point if no parcel was found) whose road type is STATE. Ticked when one is found.",
    misses: "A corner lot shows the cross street too, and the driveway may not open onto the state road. Untick it if it doesn't.",
    check: "Where the driveway will be on the site plan. RIDOT's Physical Alteration Permit applies to work in the state road.",
  },
  {
    id: "wet", title: "Wetlands on or near the site", how: "applied",
    layer: { label: "National Wetlands Inventory, 2014 (RIGIS)", url: "https://www.rigis.org/" },
    query: "Mapped wetlands within 30 m, about 100 ft, of the parcel's bounding box. Ticked when one is found.",
    misses: "The inventory is drawn from aerial photographs. It misses small and forested wetlands, and its edges are not RIDEM's. A box around an odd-shaped parcel reaches further than the parcel.",
    check: "A wetland biologist's flagging, verified by RIDEM (or CRMC on the coast).",
  },
  {
    id: "transit", title: "Near frequent transit", how: "applied",
    layer: { label: "RIPTA bus stops, October 2026 (RIGIS)", url: "https://www.rigis.org/" },
    query: "RIPTA stops within 201 m, which is 1/8 mile, of the point, with the routes that serve them. Ticked when one is found.",
    misses: "How often the buses come is not checked, and the law's cap needs frequent service. Mobility hubs within 1/4 mile also count and are not checked.",
    check: "RIPTA's timetables for the routes listed, against the frequency the 2026 law sets.",
  },
  { id: "units", title: "Dwelling units", how: "yours", query: "Not looked up.", misses: "", check: "Your plans." },
  { id: "aff", title: "Deed-restricted affordable units", how: "yours", query: "Not looked up. The share is shaded against the lines in law that it meets.", misses: "", check: "Your financing and the deed restriction." },
  { id: "type", title: "Building work", how: "yours", query: "Not looked up. The parcel map shows whether a structure is recorded, which is a hint only.", misses: "", check: "Your plans." },
  { id: "commercial", title: "Commercial floor area", how: "yours", query: "Not looked up.", misses: "", check: "Your plans." },
  { id: "kind", title: "What you plan to build", how: "yours", query: "A choice.", misses: "", check: "" },
  { id: "use", title: "Use", how: "yours", query: "A choice. The parcel map's structure type hints at the present use only.", misses: "", check: "" },
  { id: "work", title: "Building work", how: "yours", query: "A choice.", misses: "", check: "" },
  { id: "gfa", title: "Gross floor area", how: "yours", query: "Not looked up.", misses: "", check: "Your architect's area plan." },
  { id: "existingGfa", title: "Existing floor area", how: "yours", query: "Not looked up. The assessor's record has it, but the state parcel layer does not carry it.", misses: "", check: "The town's assessor's database." },
  { id: "extensive", title: "Extensive construction", how: "yours", query: "A choice.", misses: "", check: "" },
  { id: "dist", title: "Land disturbed", how: "yours", query: "Not looked up. The lot's whole area is shown beside it as an upper bound.", misses: "", check: "Your engineer's grading plan." },
  { id: "startDate", title: "Start date", how: "yours", query: "Not looked up.", misses: "", check: "" },
  { id: "rezone", title: "Seek a zone change", how: "yours", query: "A choice, not a fact about the site.", misses: "", check: "" },
  { id: "conservation", title: "Conservation development", how: "yours", query: "A choice. The district's figures say whether it would raise the density.", misses: "", check: "" },
];

export const HOW_LABEL: Record<FactHow, string> = {
  applied: "Filled in from a public layer; yours to change",
  suggested: "Suggested from a public layer",
  yours: "Only you know it",
};
