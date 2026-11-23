/*
 * A town's own map layers, asked by the site lookup once it knows the town (ARD D53, chunk 0). Each area found at the
 * point becomes an overlay of the project, which the town's rules turn into findings and steps. The base zoning layer
 * gives the town's present district beside the 2024 Atlas's, so a district the Atlas still lists but the town has
 * retired is caught at the address (debt 13).
 *
 * A town whose own zoning map is newer than the Atlas's districts throughout (Foster's, since its districts were renamed
 * in 2023) can say so with `replaces`: the lookup then takes the town's district as the site's, and the map draws the
 * town's outlines in place of the Atlas's. An area with `draw` is drawn on the map as an overlay too.
 *
 * Kept free of the engine so the lookup stays light. Every service here was checked to answer a browser (CORS) and a
 * script: Providence's on 2026-11-18, Foster's and New Shoreham's on 2026-11-20.
 */
export interface TownLayer {
  abbr: string; name: string; url: string;
  /** The field that names the area, where there are several */
  nameField?: string;
  /** Drawn on the town's zoning map as an overlay (a dashed outline) */
  draw?: boolean;
}
export interface TownZoning {
  url: string; field: string; label: string;
  /** The field with the district's full name */
  nameField?: string;
  /**
   * The town's map replaces the Atlas's districts: the lookup takes its district and the map draws its outlines. Each
   * district it may give, with the Atlas's kind of district for the map's colour; a polygon with any other code (water,
   * a road, a cemetery) is not a district and is left out.
   */
  replaces?: Record<string, string>;
}
export interface TownLayers { zoning?: TownZoning; areas: TownLayer[] }

const PVD = "https://webgis.providenceri.gov/server/rest/services/Planning/Zoning/MapServer";
const I195 = "https://risegis.ri.gov/hosting/rest/services/RIDOA/I195_Redev_Districts/MapServer/0";

export const TOWN_LAYERS: Record<string, TownLayers> = {
  Providence: {
    zoning: { url: `${PVD}/15`, field: "Code", label: "the City's zoning map" },
    areas: [
      { abbr: "HD", name: "Historic Overlay District", url: `${PVD}/11`, nameField: "ARCGIS.PLANNING.ZONINGOVERLAYDISTRICTS_FC.AREA" },
      { abbr: "HD", name: "Historic Overlay District (a landmark or industrial and commercial building)", url: `${PVD}/12`, nameField: "Category" },
      { abbr: "DD", name: "Downcity Overlay District", url: `${PVD}/5` },
      { abbr: "ES", name: "East Side I-195 Overlay District", url: `${PVD}/7` },
      { abbr: "I195", name: "I-195 Redevelopment District", url: I195 },
      { abbr: "I-3E", name: "Educational Institutional Overlay District", url: `${PVD}/8` },
      { abbr: "I-3H", name: "Healthcare Institutional Overlay District", url: `${PVD}/9` },
      { abbr: "TOD", name: "Transit-Oriented Development Overlay District", url: `${PVD}/6` },
    ],
  },
  // The Town's GIS viewer's zoning layer (source fozgis), "zoning_from_town_1_12_2024": the four districts of 2023.
  Foster: {
    zoning: {
      url: "https://services3.arcgis.com/8RrO0ekquQVFmkUS/arcgis/rest/services/Zoning_2024_view_layer/FeatureServer/0",
      field: "Zone", nameField: "Descript", label: "the Town's zoning map (2024)",
      replaces: { AR: "Primarily Residential", GB: "Mixed with Residential", HC2: "Mixed with Residential", M: "Nonresidential" },
    },
    areas: [],
  },
  // The Town's GIS (source nshdgis): the Historic District Overlay, three areas, last edited July 2017.
  "New Shoreham": {
    areas: [
      { abbr: "H", name: "Historic Overlay", url: "https://services2.arcgis.com/sM9etn5CxYxjHglg/arcgis/rest/services/HistoricDistrictOverlay/FeatureServer/0", draw: true },
    ],
  },
};
