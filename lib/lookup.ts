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
  /** Tribal or other federally managed land at the point (the Atlas's Native Lands layer), by name. Town zoning may not govern it. */
  reservation: string | null;
  /** Which agency's wetland rules apply here, from RIDEM's wetland jurisdiction layer: CRMC on the coast, RIDEM inland */
  wetAgency: "CRMC" | "DEM" | null;
  /** Overlay districts at the point. The Atlas keeps them in the same layer as base districts, marked "Overlay". */
  overlays: { zone: string; name: string }[];
  parcelOptions: ParcelOption[];
}

export interface ParcelOption {
  platLot: string;
  acres: number;
  outline: number[][][] | null;
}

/** How long one request may take before it counts as not answering. The state's services can hang rather than refuse. */
export const SERVICE_TIMEOUT_MS = 20000;

/** The caller's signal, ended early after `ms`: a hung service then fails like one that refused. */
export function withTimeout(signal: AbortSignal | undefined, ms = SERVICE_TIMEOUT_MS): AbortSignal {
  const t = AbortSignal.timeout(ms);
  return signal ? AbortSignal.any([signal, t]) : t;
}

async function getJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal: withTimeout(signal) });
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

type ZoneRows = { features: { attributes: { abbrvname: string; name: string; Jurisdiction: string; family4_treatment: string | null } }[] };
type ParcelRows = { features: { attributes: { PlatLot: string; Acres: number }; geometry?: { rings: number[][][] } }[] };
const NEAR = 30;
/** RIDEM's wetland permitting jurisdiction: which of RIDEM or CRMC regulates wetlands at a point. */
const WET_JURISDICTION = "https://risegis.ri.gov/hosting/rest/services/RIDEM/Boundaries_and_Regulatory_Overlays_v2/MapServer/7";

/** The services a point lookup asks, in the order the lookup shows them while it waits. */
export const LOOKUP_SERVICES = [
  { key: "atlas", label: "Zoning Atlas" },
  { key: "parcels", label: "state parcel map" },
  { key: "roads", label: "RIDOT roads" },
  { key: "wetlands", label: "wetlands inventory" },
  { key: "stops", label: "RIPTA stops" },
] as const;
export type LookupService = (typeof LOOKUP_SERVICES)[number]["key"];
/** Told when each service has answered (true) or failed or timed out (false). */
export type OnService = (key: LookupService, ok: boolean) => void;

function report<T>(p: Promise<T>, key: LookupService, on?: OnService): Promise<T> {
  if (on) p.then(() => on(key, true), () => on(key, false));
  return p;
}

export async function siteFacts(lon: number, lat: number, signal?: AbortSignal, onService?: OnService): Promise<SiteFacts> {
  const facts: SiteFacts = { town: null, zone: null, zoneName: null, water: null, sewer: null, platLot: null, acres: null, outline: null, failed: [], nearby: false, zoneOptions: [], overlays: [], parcelOptions: [], reservation: null, wetAgency: null };
  const count = (layer: number) =>
    getJSON<{ count: number }>(`${ATLAS}/${layer}/query?${pointQuery(lon, lat, { returnCountOnly: "true" })}`, signal).then((r) => r.count > 0);
  const zones = (m = 0) => getJSON<ZoneRows>(`${ATLAS}/14/query?${pointQuery(lon, lat, { outFields: "abbrvname,name,Jurisdiction,family4_treatment", returnGeometry: "false" }, m)}`, signal);
  const parcels = (m = 0) => getJSON<ParcelRows>(`${PARCELS}/query?${pointQuery(lon, lat, { outFields: "PlatLot,Acres", returnGeometry: "true", outSR: "4326", geometryPrecision: "6" }, m)}`, signal);
  // An address point often lands in the road, which belongs to no parcel, so widen the search once.
  const orNearby = async <T extends { features: unknown[] }>(q: (m?: number) => Promise<T>): Promise<{ rows: T; nearby: boolean }> => {
    const exact = await q();
    return exact.features.length ? { rows: exact, nearby: false } : { rows: await q(NEAR), nearby: true };
  };

  const native = getJSON<{ features: { attributes: { Unit_Nm: string | null; Loc_Own: string | null } }[] }>(`${ATLAS}/2/query?${pointQuery(lon, lat, { outFields: "Unit_Nm,Loc_Own", returnGeometry: "false" })}`, signal);
  const agency = getJSON<{ features: { attributes: { AGENCY: string | null } }[] }>(`${WET_JURISDICTION}/query?${pointQuery(lon, lat, { outFields: "AGENCY", returnGeometry: "false" })}`, signal);
  const [zone, sewer, water, parcel, nat, ag] = await Promise.allSettled([report(orNearby(zones), "atlas", onService), count(9), count(10), report(orNearby(parcels), "parcels", onService), native, agency]);
  if (nat.status === "fulfilled" && nat.value.features.length) {
    const a = nat.value.features[0].attributes;
    facts.reservation = [a.Unit_Nm, a.Loc_Own].filter(Boolean).join(", ") || "Native land";
  }
  if (ag.status === "fulfilled") {
    const v = (ag.value.features[0]?.attributes.AGENCY ?? "").trim().toUpperCase();
    facts.wetAgency = v === "CRMC" ? "CRMC" : v ? "DEM" : null;
  }

  if (zone.status === "fulfilled") {
    const all = zone.value.rows.features.map((f) => f.attributes);
    // An overlay sits on top of a base district, so a point inside one finds both: that is not a boundary.
    const rows = all.filter((a) => a.family4_treatment !== "Overlay");
    facts.overlays = all.filter((a) => a.family4_treatment === "Overlay").map((a) => ({ zone: a.abbrvname, name: a.name }));
    facts.zoneOptions = rows.map((a) => ({ zone: a.abbrvname, name: a.name }));
    facts.town = all[0]?.Jurisdiction ?? null;
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

/*
 * Facts the applicant still ticks by hand, suggested from public layers. None is applied without a click:
 *   - state road: RIDOT road centrelines within 15 m of the parcel (or 30 m of the point), ROADTYPE "STATE"
 *   - wetlands: the National Wetlands Inventory (2014, on RIGIS) within 30 m, about 100 ft, of the parcel
 *   - transit: RIPTA bus stops (October 2026, on RIGIS) within 201 m, which is 1/8 mile, of the point
 * The NWI misses small and forested wetlands and its edges are not RIDEM's. A stop's frequency is not checked.
 */
const ROADS = "https://risegis.ri.gov/hosting/rest/services/RIDOT/Road_Centerlines/MapServer/0";
const RIGIS = "https://services2.arcgis.com/S8zZg9pg23JUEexQ/arcgis/rest/services";
const WETLANDS = `${RIGIS}/BIO_NWI_Wetlands_2014_spf/FeatureServer/0`;
const STOPS = `${RIGIS}/TRANS_RIPTA_Bus_Stops_2024/FeatureServer/0`;
export const EIGHTH_MILE_M = 201;

export const SUGGEST_SOURCES = {
  roads: { label: "RIDOT road centrelines", url: "https://risegis.ri.gov/hosting/rest/services/RIDOT/Road_Centerlines/MapServer" },
  wetlands: { label: "National Wetlands Inventory, 2014 (RIGIS)", url: "https://www.rigis.org/" },
  stops: { label: "RIPTA bus stops, October 2026 (RIGIS)", url: "https://www.rigis.org/" },
} as const;

export interface SiteSuggestions {
  /** State roads at the site, by name and route number. Null when the lookup failed. */
  stateRoads: { name: string; route: string }[] | null;
  /** Mapped wetlands near the parcel, by type */
  wetlands: string[] | null;
  /** RIPTA stops within 1/8 mile, with their routes */
  stops: { name: string; routes: string[] }[] | null;
  /** True when the queries used the parcel's outline rather than only the point */
  parcel: boolean;
}

/** West, south, east, north of a parcel outline given as [lon, lat] rings. */
function envelope(rings: number[][][]): string {
  const pts = rings.flat();
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return `${Math.min(...xs)},${Math.min(...ys)},${Math.max(...xs)},${Math.max(...ys)}`;
}

function nearQuery(lon: number, lat: number, outline: number[][][] | null, metres: number, outFields: string): string {
  return new URLSearchParams({
    ...(outline?.length ? { geometry: envelope(outline), geometryType: "esriGeometryEnvelope" } : { geometry: `${lon},${lat}`, geometryType: "esriGeometryPoint" }),
    inSR: "4326", spatialRel: "esriSpatialRelIntersects", distance: String(metres), units: "esriSRUnit_Meter",
    outFields, returnGeometry: "false", resultRecordCount: "50", f: "json",
  }).toString();
}

export async function siteSuggestions(lon: number, lat: number, outline: number[][][] | null, signal?: AbortSignal, onService?: OnService): Promise<SiteSuggestions> {
  type Rows<A> = { features: { attributes: A }[] };
  const [roads, wet, stops] = await Promise.allSettled([
    report(getJSON<Rows<{ NAME: string | null; RTNO: string | null; ROADTYPE: string | null }>>(`${ROADS}/query?${nearQuery(lon, lat, outline, outline ? 15 : 30, "NAME,RTNO,ROADTYPE")}`, signal), "roads", onService),
    report(getJSON<Rows<{ WETLAND_TY: string | null }>>(`${WETLANDS}/query?${nearQuery(lon, lat, outline, 30, "WETLAND_TY")}`, signal), "wetlands", onService),
    report(getJSON<Rows<{ stop_name: string | null; route_info: string | null }>>(`${STOPS}/query?${nearQuery(lon, lat, null, EIGHTH_MILE_M, "stop_name,route_info")}`, signal), "stops", onService),
  ]);
  const uniq = <T,>(list: T[], key: (t: T) => string) => [...new Map(list.map((t) => [key(t), t])).values()];
  const title = (s: string) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
  return {
    parcel: !!outline?.length,
    stateRoads: roads.status === "fulfilled"
      ? uniq(roads.value.features.map((f) => f.attributes).filter((a) => (a.ROADTYPE ?? "").trim() === "STATE")
        .map((a) => ({ name: title((a.NAME ?? "").trim() || "Unnamed road"), route: (a.RTNO ?? "").trim() })), (r) => r.name + r.route)
      : null,
    wetlands: wet.status === "fulfilled" ? [...new Set(wet.value.features.map((f) => f.attributes.WETLAND_TY ?? "Wetland"))] : null,
    stops: stops.status === "fulfilled"
      ? uniq(stops.value.features.map((f) => {
          let routes: string[] = [];
          try { routes = (JSON.parse(f.attributes.route_info ?? "{}") as { route_id?: string[] }).route_id ?? []; } catch { /* no routes listed */ }
          return { name: f.attributes.stop_name ?? "Bus stop", routes };
        }), (s) => s.name)
      : null,
  };
}

/** Everything looked up for a point, cached for the visit so the form can check the facts against it on any page. */
export interface LookedUp { facts: SiteFacts; suggest: SiteSuggestions }
const lookCache = new Map<string, Promise<LookedUp>>();
const pointKey = (lat: number, lon: number) => `${lat.toFixed(6)},${lon.toFixed(6)}`;

export function lookUpPoint(lat: number, lon: number, signal?: AbortSignal, onService?: OnService): Promise<LookedUp> {
  const key = pointKey(lat, lon);
  let p = lookCache.get(key);
  if (!p) {
    p = siteFacts(lon, lat, signal, onService).then(async (facts) => ({ facts, suggest: await siteSuggestions(lon, lat, facts.outline, signal, onService) }));
    p.catch(() => lookCache.delete(key));
    // A lookup the services never answered is not kept, so trying again asks them again.
    p.then((r) => { if (unanswered(r.facts)) lookCache.delete(key); }, () => {});
    lookCache.set(key, p);
  }
  return p;
}

/** True when neither the Zoning Atlas nor the parcel map answered: nothing about the site is known beyond the point. */
export const unanswered = (f: SiteFacts) => f.failed.includes("zoning district") && f.failed.includes("parcel");

/** Replace the parcel a lookup settled on (the visitor picked another of the nearby ones) and redo the parcel-based suggestions. */
export function repinParcel(lat: number, lon: number, facts: SiteFacts): Promise<LookedUp> {
  const p = siteSuggestions(lon, lat, facts.outline).then((suggest) => ({ facts, suggest }));
  lookCache.set(pointKey(lat, lon), p);
  return p;
}

/** The street part of an address. The address search returns a house number as its own segment ("1, Park Row, …"), so it is joined back on. */
export function shortAddress(address: string): string {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1 && /^\d+[A-Za-z]?(-\d+)?$/.test(parts[0])) return `${parts[0]} ${parts[1]}`;
  return parts[0] ?? "";
}
