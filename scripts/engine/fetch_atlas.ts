/*
 * Saves every municipality's districts from the live Zoning Atlas layer, so the stored comparison (snapshot.ts) runs the
 * Atlas's answers offline, as the site does in a browser. Districts are kept as the layer gives them, in its order, with
 * exact repeats (one row per mapped polygon) dropped; the towns' own corrections are applied when the snapshot loads them
 * (`atlasForTown`). Run by hand when the Atlas is updated, then run the snapshot and read what changed.
 *
 *   node --import ./scripts/engine/register.mjs scripts/engine/fetch_atlas.ts
 */
import { writeFileSync } from "node:fs";
import { RIZA_FIELDS, RIZA_LAYER_URL } from "@/lib/data/atlas";
import { TOWNS } from "@/lib/data/towns";
import type { AtlasDistrict } from "@/lib/types";

const OUT = new URL("./atlas-districts.json", import.meta.url);

async function districts(town: string): Promise<AtlasDistrict[]> {
  const params = new URLSearchParams({ where: `Jurisdiction='${town.replace(/'/g, "''")}'`, outFields: RIZA_FIELDS.join(","), returnGeometry: "false", f: "json" });
  const res = await fetch(`${RIZA_LAYER_URL}/query?${params}`, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`${town}: Atlas query failed (${res.status})`);
  const json = (await res.json()) as { features?: { attributes: AtlasDistrict }[]; error?: { message: string } };
  if (json.error) throw new Error(`${town}: ${json.error.message}`);
  const seen = new Set<string>();
  return (json.features ?? []).map((f) => f.attributes).filter((a) => {
    const key = JSON.stringify(RIZA_FIELDS.map((k) => a[k] ?? null));
    return seen.has(key) ? false : (seen.add(key), true);
  }).map((a) => Object.fromEntries(RIZA_FIELDS.map((k) => [k, a[k] ?? null])) as unknown as AtlasDistrict);
}

const out: Record<string, AtlasDistrict[]> = {};
for (const t of TOWNS) {
  out[t.name] = await districts(t.name);
  console.log(`${t.name}: ${out[t.name].length} districts`);
}
// One district a line, so a later fetch shows as a readable diff.
const towns = Object.entries(out).map(([t, ds]) => `  ${JSON.stringify(t)}: [\n${ds.map((d) => `   ${JSON.stringify(d)}`).join(",\n")}\n  ]`).join(",\n");
writeFileSync(OUT, `{\n "fetched": ${JSON.stringify(new Date().toISOString().slice(0, 10))},\n "layer": ${JSON.stringify(RIZA_LAYER_URL)},\n "towns": {\n${towns}\n }\n}\n`);
console.log(`Saved ${Object.keys(out).length} towns to scripts/engine/atlas-districts.json`);
