/*
 * A town's own map layers, asked by the site lookup once it knows the town (ARD D53, chunk 0). Each area found at the
 * point becomes an overlay of the project, which the town's rules turn into findings and steps. The base zoning layer
 * gives the town's present district beside the 2024 Atlas's, so a district the Atlas still lists but the town has
 * retired is caught at the address (debt 13).
 *
 * Kept free of the engine so the lookup stays light. Every service here was checked to answer a browser (CORS) and a
 * script on 2026-11-18.
 */
export interface TownLayer { abbr: string; name: string; url: string; /** The field that names the area, where there are several */ nameField?: string }
export interface TownLayers { zoning?: { url: string; field: string; label: string }; areas: TownLayer[] }

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
};
