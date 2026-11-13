import { RIZA_LAYER_URL } from "./data/atlas";

/*
 * Address to site facts, in the browser. Order of work, after the approach in the Exeter zoning
 * record's geocode script (parcel outline from RIDEM tax parcels, OpenStreetMap for the street match):
 *   1. OpenStreetMap Nominatim turns the address into a point (limited to Rhode Island).
 *   2. The Rhode Island Zoning Atlas district layer gives the town and zoning district at that point.
 *   3. The Atlas's sewered-area and water-district layers say whether public sewer and water reach it.
 *   4. RIDEM's statewide tax parcels give the plat and lot, the acreage and the outline.
 * Every service is public and CORS-enabled. Wetlands, state-road frontage and transit are not looked up.
 */

const ATLAS = RIZA_LAYER_URL.replace(/\/\d+$/, "");
const PARCELS = "https://risegis.ri.gov/hosting/rest/services/RIDEM/Tax_Parcels/MapServer/0";
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
/** west, north, east, south */
const RI_BOX = "-71.91,42.02,-71.12,41.14";

export interface Candidate {
  label: string;
  lat: number;
  lon: number;
  /** True when the match is a building or address point, not just the street */
  precise: boolean;
}

export interface SiteFacts {
  town: string | null;
  zone: string | null;
  zoneName: string | null;
  water: boolean | null;
  sewer: boolean | null;
  platLot: string | null;
  acres: number | null;
  /** Parcel outline rings as [lon, lat] pairs */
  outline: number[][][] | null;
  /** Lookups that failed, by name */
  failed: string[];
  /**
   * True when the point itself hit no district or parcel (address points often sit in the road)
   * and the facts come from a 30 m search around it. The options then list every candidate.
   */
  nearby: boolean;
  zoneOptions: { zone: string; name: string }[];
  parcelOptions: ParcelOption[];
}

export interface ParcelOption {
  platLot: string;
  acres: number;
  outline: number[][][] | null;
}

async function getJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${res.status}`);
  const json = (await res.json()) as T & { error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  return json;
}

export async function geocode(address: string, signal?: AbortSignal): Promise<Candidate[]> {
  const q = /rhode island|\bRI\b/i.test(address) ? address : `${address}, Rhode Island`;
  const params = new URLSearchParams({ q, format: "jsonv2", limit: "5", countrycodes: "us", viewbox: RI_BOX, bounded: "1", addressdetails: "0" });
  const rows = await getJSON<{ display_name: string; lat: string; lon: string; category?: string; type?: string; addresstype?: string }[]>(`${NOMINATIM}?${params}`, signal);
  return rows.map((r) => ({
    label: r.display_name.replace(/, United States$/, ""),
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    precise: r.category !== "highway" && r.addresstype !== "road",
  }));
}

function pointQuery(lon: number, lat: number, extra: Record<string, string>, metres = 0): string {
  return new URLSearchParams({
    geometry: `${lon},${lat}`, geometryType: "esriGeometryPoint", inSR: "4326",
    spatialRel: "esriSpatialRelIntersects", f: "json", ...extra,
    ...(metres ? { distance: String(metres), units: "esriSRUnit_Meter" } : {}),
  }).toString();
}

type ZoneRows = { features: { attributes: { abbrvname: string; name: string; Jurisdiction: string } }[] };
type ParcelRows = { features: { attributes: { PlatLot: string; Acres: number }; geometry?: { rings: number[][][] } }[] };
const NEAR = 30;

export async function siteFacts(lon: number, lat: number, signal?: AbortSignal): Promise<SiteFacts> {
  const facts: SiteFacts = { town: null, zone: null, zoneName: null, water: null, sewer: null, platLot: null, acres: null, outline: null, failed: [], nearby: false, zoneOptions: [], parcelOptions: [] };
  const count = (layer: number) =>
    getJSON<{ count: number }>(`${ATLAS}/${layer}/query?${pointQuery(lon, lat, { returnCountOnly: "true" })}`, signal).then((r) => r.count > 0);
  const zones = (m = 0) => getJSON<ZoneRows>(`${ATLAS}/14/query?${pointQuery(lon, lat, { outFields: "abbrvname,name,Jurisdiction", returnGeometry: "false" }, m)}`, signal);
  const parcels = (m = 0) => getJSON<ParcelRows>(`${PARCELS}/query?${pointQuery(lon, lat, { outFields: "PlatLot,Acres", returnGeometry: "true", outSR: "4326", geometryPrecision: "6" }, m)}`, signal);
  // An address point often lands in the road, which belongs to no parcel, so widen the search once.
  const orNearby = async <T extends { features: unknown[] }>(q: (m?: number) => Promise<T>): Promise<{ rows: T; nearby: boolean }> => {
    const exact = await q();
    return exact.features.length ? { rows: exact, nearby: false } : { rows: await q(NEAR), nearby: true };
  };

  const [zone, sewer, water, parcel] = await Promise.allSettled([orNearby(zones), count(9), count(10), orNearby(parcels)]);

  if (zone.status === "fulfilled") {
    const rows = zone.value.rows.features.map((f) => f.attributes);
    facts.zoneOptions = rows.map((a) => ({ zone: a.abbrvname, name: a.name }));
    facts.town = rows[0]?.Jurisdiction ?? null;
    // On a district boundary the search finds more than one district, and guessing would be wrong.
    if (rows.length === 1) { facts.zone = rows[0].abbrvname; facts.zoneName = rows[0].name; }
    facts.nearby ||= zone.value.nearby && rows.length > 0;
  } else facts.failed.push("zoning district");
  if (sewer.status === "fulfilled") facts.sewer = sewer.value; else facts.failed.push("public sewer");
  if (water.status === "fulfilled") facts.water = water.value; else facts.failed.push("public water");
  if (parcel.status === "fulfilled") {
    facts.parcelOptions = parcel.value.rows.features.map((f) => ({ platLot: f.attributes.PlatLot, acres: f.attributes.Acres, outline: f.geometry?.rings ?? null }));
    const only = facts.parcelOptions.length === 1 ? facts.parcelOptions[0] : null;
    if (only) { facts.platLot = only.platLot; facts.acres = only.acres; facts.outline = only.outline; }
    facts.nearby ||= parcel.value.nearby && facts.parcelOptions.length > 0;
  } else facts.failed.push("parcel");
  return facts;
}

/** Outline rings as an SVG path in a size-by-size box, north up. */
export function outlinePath(rings: number[][][], size = 120, pad = 8): string {
  const pts = rings.flat();
  if (!pts.length) return "";
  const lat0 = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  const k = Math.cos((lat0 * Math.PI) / 180);
  const xs = pts.map((p) => p[0] * k), ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const scale = (size - 2 * pad) / Math.max(maxX - minX, maxY - minY, 1e-9);
  const ox = (size - (maxX - minX) * scale) / 2, oy = (size - (maxY - minY) * scale) / 2;
  return rings
    .map((r) => r.map((p, i) => `${i ? "L" : "M"}${(ox + (p[0] * k - minX) * scale).toFixed(1)},${(size - oy - (p[1] - minY) * scale).toFixed(1)}`).join(" ") + " Z")
    .join(" ");
}
