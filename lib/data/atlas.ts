import type { AtlasDistrict } from "../types";

/*
 * Rhode Island Zoning Atlas (RIZA), by HousingWorks RI using the National Zoning Atlas method.
 * The snapshot below is Cumberland's 12 districts from the public "RI Zoning Districts" feature layer
 * (data current as of September 2024). The site also queries the live layer and flags any difference.
 *
 * Treatment values: "Allowed/Conditional" (by right, possibly with conditions), "Public Hearing"
 * (needs a special permit at a hearing), "Prohibited", "Overlay".
 * Lot/density strings are keyed by utilities: "w/s" = public water OR sewer, "w+s" = both,
 * "no w/s" = neither; "if PRD" = planned residential / conservation development figure.
 */

export const RIZA_LAYER_URL =
  "https://services1.arcgis.com/CjMORKCN9JBntrcv/arcgis/rest/services/RIZoningAtlas1016_WFL1/FeatureServer/14";

export const RIZA_FIELDS = [
  "abbrvname", "name", "type",
  "family1_treatment", "family2_treatment", "family3_treatment", "family4_treatment",
  "accessory_treatment", "affordable_treatment",
  "family1_minlotacres", "family4_minlotacres", "family4_maxunitsperacre", "family4_maxheightft",
  "family4_minparking_1br", "family4_minparking_2br", "family4_water_required",
] as const;

export const RIZA_LINKS = {
  collection: "https://storymaps.arcgis.com/collections/6299257ceec34d22a38902713c875bd1?item=4",
  story: "https://storymaps.arcgis.com/stories/922e03ad65aa49139f32a43af695a823",
  app: "https://experience.arcgis.com/experience/e9b8450970b643ee9dd71188ce59e766/",
  nza: "https://www.zoningatlas.org/rhode-island",
  housingworks: "https://www.housingworksri.org/",
};

export const CUMBERLAND_DISTRICTS: AtlasDistrict[] = [
  { abbrvname: "A-1", name: "Agricultural Medium Density and One-Household", type: "Primarily Residential", family1_treatment: "Allowed/Conditional", family2_treatment: "Prohibited", family3_treatment: "Prohibited", family4_treatment: "Prohibited", accessory_treatment: "Allowed/Conditional", affordable_treatment: "Public Hearing", family1_minlotacres: "5; 0.69 if PRD; 0.46 if PRD w/ w/s; 0.23 if PRD w/ w+s", family4_minlotacres: null, family4_maxunitsperacre: null, family4_maxheightft: null, family4_minparking_1br: null, family4_minparking_2br: null, family4_water_required: null },
  { abbrvname: "A-2", name: "Agricultural Medium Density and One-Household", type: "Primarily Residential", family1_treatment: "Allowed/Conditional", family2_treatment: "Prohibited", family3_treatment: "Prohibited", family4_treatment: "Prohibited", accessory_treatment: "Allowed/Conditional", affordable_treatment: "Public Hearing", family1_minlotacres: "1.84; 0.69 if PRD; 0.46 if PRD w/ w/s; 0.23 if PRD w/ w+s", family4_minlotacres: null, family4_maxunitsperacre: null, family4_maxheightft: null, family4_minparking_1br: null, family4_minparking_2br: null, family4_water_required: null },
  { abbrvname: "R-1", name: "One-Household Low Density", type: "Primarily Residential", family1_treatment: "Allowed/Conditional", family2_treatment: "Prohibited", family3_treatment: "Prohibited", family4_treatment: "Prohibited", accessory_treatment: "Allowed/Conditional", affordable_treatment: "Public Hearing", family1_minlotacres: "no w/s: 1.84; 0.69 if PRD | w/s: 0.92; 0.46 if PRD | w+s: 0.5; 0.23 if PRD", family4_minlotacres: null, family4_maxunitsperacre: null, family4_maxheightft: null, family4_minparking_1br: null, family4_minparking_2br: null, family4_water_required: null },
  { abbrvname: "R-2", name: "Two-Household Medium Density", type: "Primarily Residential", family1_treatment: "Allowed/Conditional", family2_treatment: "Allowed/Conditional", family3_treatment: "Prohibited", family4_treatment: "Prohibited", accessory_treatment: "Allowed/Conditional", affordable_treatment: "Public Hearing", family1_minlotacres: "w/s: 0.69; 0.46 if PRD | w+s: 0.23; 0.23 if PRD", family4_minlotacres: null, family4_maxunitsperacre: null, family4_maxheightft: null, family4_minparking_1br: null, family4_minparking_2br: null, family4_water_required: null },
  { abbrvname: "R-3", name: "Multi-Household Dwelling", type: "Primarily Residential", family1_treatment: "Allowed/Conditional", family2_treatment: "Allowed/Conditional", family3_treatment: "Allowed/Conditional", family4_treatment: "Allowed/Conditional", accessory_treatment: "Allowed/Conditional", affordable_treatment: "Public Hearing", family1_minlotacres: "w/s: 0.69; 0.46 if PRD | w+s: 0.23; 0.23 if PRD", family4_minlotacres: "w/s: 1.4; 0.55 if PRD | w+s: 0.57; 0.27 if PRD", family4_maxunitsperacre: "w/s: 2.9; 7.3 if PRD | w+s: 6.9; 14.5 if PRD", family4_maxheightft: "35", family4_minparking_1br: "2", family4_minparking_2br: "2", family4_water_required: "Yes" },
  { abbrvname: "C-1", name: "Limited Commercial", type: "Mixed with Residential", family1_treatment: "Prohibited", family2_treatment: "Allowed/Conditional", family3_treatment: "Allowed/Conditional", family4_treatment: "Allowed/Conditional", accessory_treatment: "Prohibited", affordable_treatment: "Public Hearing", family1_minlotacres: null, family4_minlotacres: "1.8", family4_maxunitsperacre: "4.4", family4_maxheightft: "45", family4_minparking_1br: "2", family4_minparking_2br: "2", family4_water_required: "No" },
  { abbrvname: "C-2", name: "General Commercial", type: "Mixed with Residential", family1_treatment: "Prohibited", family2_treatment: "Allowed/Conditional", family3_treatment: "Allowed/Conditional", family4_treatment: "Allowed/Conditional", accessory_treatment: "Prohibited", affordable_treatment: "Public Hearing", family1_minlotacres: null, family4_minlotacres: "1.8", family4_maxunitsperacre: "4.4", family4_maxheightft: "45", family4_minparking_1br: "2", family4_minparking_2br: "2", family4_water_required: "No" },
  { abbrvname: "BMMU", name: "Berkeley Mill Mixed-Use Special Overlay", type: "Mixed with Residential", family1_treatment: "Prohibited", family2_treatment: "Prohibited", family3_treatment: "Prohibited", family4_treatment: "Public Hearing", accessory_treatment: "Not Mentioned", affordable_treatment: "Public Hearing", family1_minlotacres: null, family4_minlotacres: null, family4_maxunitsperacre: null, family4_maxheightft: null, family4_minparking_1br: "1", family4_minparking_2br: "1", family4_water_required: "Yes" },
  { abbrvname: "AHMU", name: "Ann & Hope Mixed-Use Special Overlay", type: "Mixed with Residential", family1_treatment: "Prohibited", family2_treatment: "Prohibited", family3_treatment: "Prohibited", family4_treatment: "Public Hearing", accessory_treatment: "Not Mentioned", affordable_treatment: "Public Hearing", family1_minlotacres: null, family4_minlotacres: null, family4_maxunitsperacre: null, family4_maxheightft: null, family4_minparking_1br: null, family4_minparking_2br: null, family4_water_required: "Yes" },
  { abbrvname: "I-1", name: "Light Industrial", type: "Nonresidential", family1_treatment: "Prohibited", family2_treatment: "Prohibited", family3_treatment: "Prohibited", family4_treatment: "Prohibited", accessory_treatment: "Prohibited", affordable_treatment: "Public Hearing", family1_minlotacres: null, family4_minlotacres: null, family4_maxunitsperacre: null, family4_maxheightft: null, family4_minparking_1br: null, family4_minparking_2br: null, family4_water_required: null },
  { abbrvname: "I-2", name: "General Industrial", type: "Nonresidential", family1_treatment: "Prohibited", family2_treatment: "Prohibited", family3_treatment: "Prohibited", family4_treatment: "Prohibited", accessory_treatment: "Prohibited", affordable_treatment: "Public Hearing", family1_minlotacres: null, family4_minlotacres: null, family4_maxunitsperacre: null, family4_maxheightft: null, family4_minparking_1br: null, family4_minparking_2br: null, family4_water_required: null },
  { abbrvname: "OS", name: "Open Space District", type: "Nonresidential", family1_treatment: "Prohibited", family2_treatment: "Prohibited", family3_treatment: "Prohibited", family4_treatment: "Prohibited", accessory_treatment: "Prohibited", affordable_treatment: "Public Hearing", family1_minlotacres: null, family4_minlotacres: null, family4_maxunitsperacre: null, family4_maxheightft: null, family4_minparking_1br: null, family4_minparking_2br: null, family4_water_required: null },
];

export function district(abbrv: string, list: AtlasDistrict[] = CUMBERLAND_DISTRICTS): AtlasDistrict | undefined {
  return list.find((d) => d.abbrvname === abbrv);
}

export type Treatment = "allowed" | "hearing" | "prohibited" | "overlay" | "unknown";

export function treatmentFor(d: AtlasDistrict | undefined, units: number): { value: Treatment; raw: string; field: string } {
  if (!d) return { value: "unknown", raw: "", field: "" };
  const field = units >= 4 ? "family4_treatment" : units === 3 ? "family3_treatment" : units === 2 ? "family2_treatment" : "family1_treatment";
  const raw = d[field as keyof AtlasDistrict] as string;
  const value: Treatment = raw === "Allowed/Conditional" ? "allowed" : raw === "Public Hearing" ? "hearing" : raw === "Prohibited" ? "prohibited" : raw === "Overlay" ? "overlay" : "unknown";
  return { value, raw, field };
}

export function housingTypeLabel(units: number): string {
  return units >= 4 ? "4+ family" : units === 3 ? "3-family" : units === 2 ? "2-family" : "1-family";
}

/**
 * Read a RIZA lot/density string for the site's utilities.
 * "w/s: 2.9; 7.3 if PRD | w+s: 6.9; 14.5 if PRD" -> { base: 6.9, prd: 14.5 } when both utilities are present.
 */
export function readByUtility(raw: string | null, water: boolean, sewer: boolean): { base: number | null; prd: number | null } {
  if (!raw) return { base: null, prd: null };
  const key = water && sewer ? "w+s" : water || sewer ? "w/s" : "no w/s";
  const segments = raw.split("|").map((s) => s.trim());
  let seg = segments.find((s) => s.startsWith(`${key}:`));
  if (!seg && segments.length === 1 && !segments[0].includes(":")) seg = segments[0];
  if (!seg) return { base: null, prd: null };
  const body = seg.includes(":") ? seg.slice(seg.indexOf(":") + 1) : seg;
  const parts = body.split(";").map((s) => s.trim());
  const num = (s?: string) => { const m = s?.match(/[\d.]+/); return m ? parseFloat(m[0]) : null; };
  const base = num(parts.find((p) => !p.includes("PRD")));
  const prd = num(parts.find((p) => p.includes("PRD")));
  return { base, prd };
}

/** Query the live RIZA layer for a jurisdiction's districts (CORS-enabled ArcGIS REST). */
export async function fetchAtlasDistricts(jurisdiction: string, signal?: AbortSignal): Promise<AtlasDistrict[]> {
  const params = new URLSearchParams({
    where: `Jurisdiction='${jurisdiction.replace(/'/g, "''")}'`,
    outFields: RIZA_FIELDS.join(","),
    returnGeometry: "false",
    f: "json",
  });
  const res = await fetch(`${RIZA_LAYER_URL}/query?${params}`, { signal });
  if (!res.ok) throw new Error(`Atlas query failed (${res.status})`);
  const json = (await res.json()) as { features?: { attributes: AtlasDistrict }[]; error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  return (json.features ?? []).map((f) => f.attributes);
}

/** Fields whose live value differs from the snapshot, per district. */
export function diffAgainstSnapshot(live: AtlasDistrict[]): { abbrvname: string; fields: string[] }[] {
  const out: { abbrvname: string; fields: string[] }[] = [];
  live.forEach((l) => {
    const s = district(l.abbrvname);
    if (!s) { out.push({ abbrvname: l.abbrvname, fields: ["new district"] }); return; }
    const fields = RIZA_FIELDS.filter((f) => String(l[f] ?? "") !== String(s[f] ?? ""));
    if (fields.length) out.push({ abbrvname: l.abbrvname, fields: [...fields] });
  });
  return out;
}
