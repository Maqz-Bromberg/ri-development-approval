import { RIZA_LAYER_URL } from "./data/atlas";
import type { TreeId } from "./types";

/*
 * Map data for the Check page, in the browser, from the same public services as the address lookup:
 *   - zoning district outlines: Rhode Island Zoning Atlas, layer 14, one feature per district per town
 *   - parcels around the site: RIDEM tax parcels, with the state E-911 structure type of each
 * Coordinates come back as WGS84 [lon, lat] rings and are turned into Leaflet's [lat, lon] here.
 */

const PARCELS = "https://risegis.ri.gov/hosting/rest/services/RIDEM/Tax_Parcels/MapServer/0";
/** Metres around the site within which parcels are drawn */
export const RADIUS = 400;
const PAGE = 2000;
/** Pages of parcels to fetch at most. Three pages is 6,000 parcels, more than any 400 m circle in the state holds. */
const MAX_PAGES = 3;

export type LatLon = [number, number];
export type Ring = LatLon[];

export interface DistrictShape {
  abbr: string;
  name: string;
  /** Outer rings and holes together. Leaflet fills them even-odd, so the order doesn't matter. */
  rings: Ring[];
}

export type StructureClass = "single" | "multi" | "commercial" | "public" | "other" | "none";

export interface Parcel {
  id: string;
  cls: StructureClass;
  /** The state's E-911 description, as given */
  desc: string;
  acres: number | null;
  /** Impervious share of the parcel, 0–1 (RIDEM `PctImp`). `PctDev` is left out: it mixes 0–1 and 0–100 scales. */
  pctImp: number | null;
  impSqft: number | null;
  rings: Ring[];
}

/*
 * Six classes from the E-911 structure type. Colours validated as a categorical set, all pairs, against the page
 * background (dataviz validator: CVD ΔE ≥ 9.2, normal-vision ΔE ≥ 19.2). Three sit below 3:1 contrast, so
 * every class is also named in the legend with its count and in each parcel's hover text.
 */
export const STRUCTURE: Record<StructureClass, { label: string; color: string | null; note?: string }> = {
  single: { label: "Single-family", color: "#6da7ec", note: "Includes mobile, bungalow and seasonal homes." },
  multi: { label: "Multi-family", color: "#184f95", note: "The state's \"Multi-Family Home\" covers a two-family house and an apartment block alike, with no unit count." },
  commercial: { label: "Commercial and industrial", color: "#eb6834", note: "Includes lodging." },
  public: { label: "Public and institutional", color: "#1baf7a", note: "Government, schools, churches, healthcare, cemeteries." },
  other: { label: "Accessory or other", color: "#a3a9a2", note: "Accessory buildings, utilities, farms, gated access points." },
  none: { label: "No structure recorded", color: null, note: "Usually vacant land, a road or open space." },
};
export const STRUCTURE_ORDER: StructureClass[] = ["single", "multi", "commercial", "public", "other", "none"];

/** E-911 structure type code to class. Codes listed by the parcel layer itself (distinct values, Nov 2026). */
export function structureClass(code: string | null | undefined): StructureClass {
  if (!code || code === "None") return "none";
  if (["R1", "R3", "R5", "R6"].includes(code)) return "single";
  if (["R2", "R4"].includes(code)) return "multi";
  if (["C1", "C9", "CL", "I1", "B2", "B4", "H1"].includes(code)) return "commercial";
  if (code.startsWith("P")) return "public";
  return "other";
}

/** Route colours for project pins: the same validated set, shown only when the parcels are grey. */
export const ROUTE_COLOR: Partial<Record<TreeId, string>> = {
  comp: "#184f95",
  major: "#eb6834",
  minor: "#1baf7a",
  dpr: "#6da7ec",
};

const toRings = (rings: number[][][]): Ring[] => rings.map((r) => r.map((p) => [p[1], p[0]] as LatLon));

async function getJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${res.status}`);
  const json = (await res.json()) as T & { error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  return json;
}

const districtCache = new Map<string, Promise<DistrictShape[]>>();

/** Every zoning district outline in a town, simplified to about 5 m. Cached for the visit. */
export function districtShapes(town: string): Promise<DistrictShape[]> {
  let p = districtCache.get(town);
  if (!p) {
    const params = new URLSearchParams({
      where: `Jurisdiction='${town.replace(/'/g, "''")}'`,
      outFields: "abbrvname,name",
      returnGeometry: "true",
      outSR: "4326",
      geometryPrecision: "5",
      maxAllowableOffset: "0.00005",
      f: "json",
    });
    p = getJSON<{ features: { attributes: { abbrvname: string; name: string }; geometry?: { rings: number[][][] } }[] }>(
      `${RIZA_LAYER_URL}/query?${params}`,
    ).then((r) => r.features.filter((f) => f.geometry).map((f) => ({ abbr: f.attributes.abbrvname, name: f.attributes.name, rings: toRings(f.geometry!.rings) })));
    p.catch(() => districtCache.delete(town));
    districtCache.set(town, p);
  }
  return p;
}

type ParcelRows = {
  features: { attributes: { PlatLot: string; Acres: number | null; E911_Type: string | null; E911Desc: string | null; PctImp: number | null; IMP_sqft: number | null }; geometry?: { rings: number[][][] } }[];
  exceededTransferLimit?: boolean;
};

/** Parcels within `RADIUS` metres of a point, paged. `truncated` is true if even the last page was full. */
export async function parcelsNear(lat: number, lon: number, signal?: AbortSignal): Promise<{ parcels: Parcel[]; truncated: boolean }> {
  const out: Parcel[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const params = new URLSearchParams({
      geometry: `${lon},${lat}`, geometryType: "esriGeometryPoint", inSR: "4326",
      spatialRel: "esriSpatialRelIntersects", distance: String(RADIUS), units: "esriSRUnit_Meter",
      outFields: "PlatLot,Acres,E911_Type,E911Desc,PctImp,IMP_sqft",
      returnGeometry: "true", outSR: "4326", geometryPrecision: "6", maxAllowableOffset: "0.00001",
      orderByFields: "OBJECTID", resultOffset: String(page * PAGE), resultRecordCount: String(PAGE),
      f: "json",
    });
    const rows = await getJSON<ParcelRows>(`${PARCELS}/query?${params}`, signal);
    rows.features.forEach((f) => {
      if (!f.geometry) return;
      const a = f.attributes;
      out.push({
        id: a.PlatLot, cls: structureClass(a.E911_Type), desc: a.E911Desc && a.E911Desc !== "None" ? a.E911Desc : "No structure recorded",
        acres: a.Acres, pctImp: a.PctImp, impSqft: a.IMP_sqft, rings: toRings(f.geometry.rings),
      });
    });
    if (!rows.exceededTransferLimit && rows.features.length < PAGE) return { parcels: out, truncated: false };
  }
  return { parcels: out, truncated: true };
}

/** Even-odd point in polygon over all rings of a shape. */
export function inRings(pt: LatLon, rings: Ring[]): boolean {
  let inside = false;
  const [y, x] = pt;
  rings.forEach((r) => {
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [yi, xi] = r[i], [yj, xj] = r[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
  });
  return inside;
}

/** Average of the outer ring's vertices: a label or lookup point, not a true centroid. */
export function ringCenter(rings: Ring[]): LatLon {
  const r = rings.reduce((a, b) => (b.length > a.length ? b : a), rings[0] ?? []);
  if (!r.length) return [0, 0];
  return [r.reduce((s, p) => s + p[0], 0) / r.length, r.reduce((s, p) => s + p[1], 0) / r.length];
}

/** Metres between two points (haversine). */
export function metresBetween(a: LatLon, b: LatLon): number {
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (b[0] - a[0]) * rad, dLon = (b[1] - a[1]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
