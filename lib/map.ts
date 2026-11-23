import { RIZA_LAYER_URL } from "./data/atlas";
import { withTimeout } from "./lookup";
import { townRules } from "./data/towns/overlay";
import { TOWN_LAYERS } from "./data/townLayers";
import type { TreeId } from "./types";

/*
 * Map data for the Check page, in the browser, from the same public services as the address lookup:
 *   - zoning district outlines: Rhode Island Zoning Atlas, layer 14, one feature per district per town; or the town's
 *     own zoning map where it replaces the Atlas's (lib/data/townLayers.ts), and the town's own areas marked `draw`
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
  /** The Atlas's kind of district: "Primarily Residential", "Mixed with Residential" or "Nonresidential" */
  type: string;
  /** True for an overlay district, which lies on top of base districts */
  overlay: boolean;
  /** Outer rings and holes together. Leaflet fills them even-odd, so the order doesn't matter. */
  rings: Ring[];
  /** Whose map it comes from, where it is not the Atlas */
  from?: string;
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

export type ZoneKind = "res" | "mixed" | "nonres";

/*
 * The Atlas's three kinds of district, coloured the same in the district picker and on the map.
 * Yellow, magenta and violet from the reference categorical set: none is used by the parcel or route colours.
 * Validated all pairs against the page background (CVD ΔE 16.3 worst, normal-vision ΔE 19.6). Yellow and magenta
 * sit below 3:1 contrast, so a kind is never shown by colour alone: it carries its icon and its name.
 */
export const ZONE_KIND: Record<ZoneKind, { label: string; color: string; sub: string }> = {
  res: {
    label: "Primarily residential", color: "#eda100",
    sub: "Mostly homes. Some allow only single-family houses, others two-family, multi-family or accessory units.",
  },
  mixed: {
    label: "Mixed with residential", color: "#e87ba4",
    sub: "Shops, offices or mills with homes allowed alongside: village centres, commercial corridors, mixed-use overlays.",
  },
  nonres: {
    label: "Nonresidential", color: "#6250d6",
    sub: "Industrial, open space and other districts where new homes are generally not allowed.",
  },
};
export const ZONE_KIND_ORDER: ZoneKind[] = ["res", "mixed", "nonres"];

/** The kind of a district, from the Atlas's `type`. An unknown type reads as nonresidential, the most cautious. */
export function zoneKind(type: string | null | undefined): ZoneKind {
  if (type === "Primarily Residential") return "res";
  if (type === "Mixed with Residential") return "mixed";
  return "nonres";
}

export interface TownShape {
  name: string;
  /** Number of zoning districts, and the share of land where 4+ family housing is allowed by right, as the Atlas states them */
  districts: number | null;
  by4: string | null;
  rings: Ring[];
}

let townCache: Promise<TownShape[]> | null = null;

/** The 39 municipal outlines from the Zoning Atlas's jurisdictions layer, simplified to about 80 m. Cached for the visit. */
export function townShapes(): Promise<TownShape[]> {
  if (!townCache) {
    const params = new URLSearchParams({
      where: "1=1", outFields: "JURISDICTION,NumZoningDistricts,Per4_ByRight", returnGeometry: "true",
      outSR: "4326", geometryPrecision: "4", maxAllowableOffset: "0.0008", f: "json",
    });
    townCache = getJSON<{ features: { attributes: { JURISDICTION: string; NumZoningDistricts: number | null; Per4_ByRight: string | null }; geometry?: { rings: number[][][] } }[] }>(
      `${RIZA_LAYER_URL.replace(/\/\d+$/, "/12")}/query?${params}`,
    ).then((r) => r.features.filter((f) => f.geometry).map((f) => ({
      name: f.attributes.JURISDICTION, districts: f.attributes.NumZoningDistricts, by4: f.attributes.Per4_ByRight, rings: toRings(f.geometry!.rings),
    })));
    townCache.catch(() => { townCache = null; });
  }
  return townCache;
}

const toRings = (rings: number[][][]): Ring[] => rings.map((r) => r.map((p) => [p[1], p[0]] as LatLon));

/** A whole town's district outlines is a large answer, so it gets longer than a point query. */
async function getJSON<T>(url: string, signal?: AbortSignal, ms = 30000): Promise<T> {
  const res = await fetch(url, { signal: withTimeout(signal, ms) });
  if (!res.ok) throw new Error(`${res.status}`);
  const json = (await res.json()) as T & { error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  return json;
}

const districtCache = new Map<string, Promise<DistrictShape[]>>();

type Features = { features: { attributes: Record<string, string | number | null>; geometry?: { rings: number[][][] } }[]; exceededTransferLimit?: boolean };
const SHAPE_PARAMS = { returnGeometry: "true", outSR: "4326", geometryPrecision: "5", maxAllowableOffset: "0.00005", f: "json" };

/**
 * Every outline in one of a town's own layers, simplified as the Atlas's are, paged: Foster's zoning layer is drawn
 * parcel by parcel, 2,362 polygons where a service gives 2,000 at a time. Five pages at most.
 */
async function townFeatures(url: string, fields: string[]): Promise<Features> {
  const out: Features = { features: [] };
  for (let page = 0; page < 5; page++) {
    const r = await getJSON<Features>(`${url}/query?${new URLSearchParams({ where: "1=1", outFields: fields.join(","), orderByFields: "OBJECTID", resultOffset: String(out.features.length), ...SHAPE_PARAMS })}`);
    out.features.push(...r.features);
    if (!r.exceededTransferLimit || !r.features.length) break;
  }
  return out;
}

/**
 * Every zoning district outline in a town, simplified to about 5 m, then the town's own areas it draws as overlays.
 * Where the town's zoning map replaces the Atlas's (Foster, ARD D78), its districts are drawn instead. Cached for the visit.
 */
export function districtShapes(town: string): Promise<DistrictShape[]> {
  let p = districtCache.get(town);
  const own = TOWN_LAYERS[town];
  if (!p && own?.zoning?.replaces) {
    const z = own.zoning, kinds = z.replaces!;
    const base = townFeatures(z.url, [z.field, z.nameField].filter((x): x is string => !!x)).then((r) => r.features
      .filter((f) => f.geometry && kinds[String(f.attributes[z.field])])
      .map((f): DistrictShape => {
        const abbr = String(f.attributes[z.field]);
        return { abbr, name: z.nameField ? String(f.attributes[z.nameField] ?? abbr) : abbr, type: kinds[abbr], overlay: false, rings: toRings(f.geometry!.rings), from: z.label };
      }));
    p = withAreas(town, base);
  }
  if (!p) {
    const params = new URLSearchParams({
      where: `Jurisdiction='${town.replace(/'/g, "''")}'`,
      outFields: "abbrvname,name,type,family4_treatment",
      returnGeometry: "true",
      outSR: "4326",
      geometryPrecision: "5",
      maxAllowableOffset: "0.00005",
      f: "json",
    });
    p = getJSON<{ features: { attributes: { abbrvname: string; name: string; type: string; family4_treatment: string | null }; geometry?: { rings: number[][][] } }[] }>(
      `${RIZA_LAYER_URL}/query?${params}`,
    ).then((r) => r.features.filter((f) => f.geometry).map((f) => ({ abbr: f.attributes.abbrvname, name: f.attributes.name, type: townRules(town).kinds?.[f.attributes.abbrvname] ?? f.attributes.type, overlay: f.attributes.family4_treatment === "Overlay" || townRules(town).kinds?.[f.attributes.abbrvname] === "Overlay", rings: toRings(f.geometry!.rings) })));
    p = withAreas(town, p);
  }
  if (!districtCache.has(town)) {
    p.catch(() => districtCache.delete(town));
    districtCache.set(town, p);
  }
  return p;
}

/** The districts, then the town's own areas marked `draw`, as overlays after them (so a point finds its base district first). An area that fails is left off. */
function withAreas(town: string, base: Promise<DistrictShape[]>): Promise<DistrictShape[]> {
  const areas = (TOWN_LAYERS[town]?.areas ?? []).filter((a) => a.draw);
  if (!areas.length) return base;
  const extra = Promise.allSettled(areas.map((a) => townFeatures(a.url, ["OBJECTID"]).then((r) => r.features.filter((f) => f.geometry)
    .map((f): DistrictShape => ({ abbr: a.abbr, name: a.name, type: "Overlay", overlay: true, rings: toRings(f.geometry!.rings), from: `${town}'s own map` })))));
  return Promise.all([base, extra]).then(([b, e]) => [...b, ...e.flatMap((x) => (x.status === "fulfilled" ? x.value : []))]);
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
