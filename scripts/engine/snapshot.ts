/*
 * The stored comparison (ARD debt 3, D53 chunk 1). Runs a fixed set of sample projects through the engine, in every
 * town that has rules of its own and one that has none, and writes what comes out: the route each project gets, and
 * for all five routes the steps (with who decides each) and the findings. Run by hand, like the other checks.
 *
 *   node --import ./scripts/engine/register.mjs scripts/engine/snapshot.ts          # compare with the saved copy
 *   node --import ./scripts/engine/register.mjs scripts/engine/snapshot.ts --save   # save this run as the copy (.sources/engine-snapshot.json) and the digest
 *
 * A difference is not an error: it is what the change did. Read it, and save when it is what was meant.
 * The Zoning Atlas is live in the browser. Here each town's districts come from a saved copy of the layer
 * (atlas-districts.json, saved by fetch_atlas.ts, with the date it was fetched), registered as the site registers the
 * live ones; Cumberland uses its bundled districts, as the site does.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { analyze, classify, deriveFlags, normalizeInputs, stepsFor, visibleDocs } from "@/lib/engine";
import { atlasForTown, registerDistricts } from "@/lib/data/atlas";
import { setActiveTown } from "@/lib/town";
import type { AtlasDistrict, ProjectInputs, TreeId } from "@/lib/types";

const ATLAS = JSON.parse(readFileSync(new URL("./atlas-districts.json", import.meta.url), "utf8")) as { fetched: string; towns: Record<string, AtlasDistrict[]> };
for (const [town, list] of Object.entries(ATLAS.towns)) if (town !== "Cumberland") registerDistricts(town, atlasForTown(town, list));

// The saved copy is about 12 MB, so it is kept with the other local files in .sources/, not committed. What is committed
// is its digest, one hash per case, saved with it: a clone without the copy can still say which cases changed, and
// keeps a run that matches the digest as its own copy.
const OUT = new URL("../../.sources/engine-snapshot.json", import.meta.url);
const DIGEST = new URL("./snapshot-digest.json", import.meta.url);
const TREES: TreeId[] = ["byright", "dpr", "minor", "major", "comp"];

type Case = { name: string; p: Partial<ProjectInputs> };
const homes = (units: number, aff = 0, more: Partial<ProjectInputs> = {}): Partial<ProjectInputs> => ({ kind: "homes", units, aff, ...more });
const ZONES: Record<string, string[]> = {
  Cumberland: ["R-3", "C-1"],
  Providence: ["R-3", "C-2", "D-1"],
  Charlestown: ["R-20", "C-1"],
  Westerly: ["other", "HDR-6", "DC1"],
  "North Providence": ["RG", "IS"],
  Foster: ["AR", "GB", "HC2"],  // GB and HC2: districts of 2023 the Atlas lacks (ARD D78)
  Exeter: ["LB/R", "RE-2"],
  Glocester: ["R-2"],
  "West Greenwich": ["HB"],
  // Chunk 7 (ARD D67): a district where the city's table differs from the Atlas, and one with a rule of its own.
  Pawtucket: ["CD"], Cranston: ["A-8", "C-3"], "East Providence": ["C-3", "BPH"], Woonsocket: ["C-1"], Smithfield: ["R80"],
  Warwick: ["A-7", "V"], Newport: ["R-10"], "Central Falls": ["R-1"],
  // Chunk 5 (ARD D70).
  "New Shoreham": ["RC", "NHC"],
};
const SHAPES: Case[] = [
  { name: "3 homes", p: homes(3) },
  { name: "8 homes", p: homes(8) },
  { name: "12 homes", p: homes(12) },
  { name: "30 homes, 25% affordable", p: homes(30, 8) },
  { name: "8 homes, no sewer", p: homes(8, 0, { sewer: false }) },
  { name: "8 homes, no water or sewer", p: homes(8, 0, { sewer: false, water: false }) },
  { name: "8 homes over 3,000 sq ft of shops", p: { kind: "mixed", units: 8, aff: 0, commercial: 3000, gfa: 3000 } },
  { name: "retail, 8,000 sq ft", p: { kind: "commercial", use: "retail", gfa: 8000, units: 0 } },
  { name: "office, 15,000 sq ft", p: { kind: "commercial", use: "office", gfa: 15000, units: 0 } },
  { name: "light industry, 25,000 sq ft", p: { kind: "commercial", use: "industrial", gfa: 25000, units: 0 } },
];

/** Sites inside a town's review areas (ARD D53): the overlays the lookup would find. */
const AREAS: { town: string; zone: string; overlays: string[] }[] = [
  { town: "Providence", zone: "D-1-100", overlays: ["DD"] },
  { town: "Providence", zone: "D-1-100", overlays: ["DD", "HD"] },
  { town: "Providence", zone: "D-1-100", overlays: ["I195"] },
  { town: "Providence", zone: "W-2", overlays: ["ES"] },
  { town: "Providence", zone: "R-3", overlays: ["HD"] },
  { town: "Providence", zone: "R-3", overlays: ["I-3E"] },
  { town: "Westerly", zone: "HDR-6", overlays: ["APZ"] },
  { town: "Westerly", zone: "GC", overlays: ["AAO"] },
  { town: "New Shoreham", zone: "OHC", overlays: ["H"] },
];

/** Paths the shapes above miss: a town's own lot-area rule, conservation density, transit parking, permits on a commercial site. */
const MORE: { town: string; zone: string; c: Case }[] = [
  { town: "Cumberland", zone: "R-3", c: { name: "12 homes, conservation", p: homes(12, 0, { conservation: true }) } },
  { town: "Cumberland", zone: "R-3", c: { name: "8 homes near transit", p: homes(8, 0, { transit: true }) } },
  { town: "Cumberland", zone: "R-3", c: { name: "8 homes, water only", p: homes(8, 0, { sewer: false }) } },
  { town: "Cumberland", zone: "R-2", c: { name: "2 homes", p: homes(2) } },
  { town: "Cumberland", zone: "R-1", c: { name: "8 homes", p: homes(8) } },
  { town: "Cumberland", zone: "R-1", c: { name: "30 homes, 25% affordable", p: homes(30, 8) } },
  { town: "Cumberland", zone: "BMMU", c: { name: "24 homes", p: homes(24) } },
  { town: "Cumberland", zone: "C-1", c: { name: "12 homes on 5,000 sq ft", p: homes(12, 0, { lot: 5000 }) } },
  { town: "Cumberland", zone: "C-1", c: { name: "8 homes over 3,000 sq ft of shops, no sewer", p: { kind: "mixed", units: 8, aff: 0, commercial: 3000, gfa: 3000, sewer: false } } },
  { town: "Cumberland", zone: "C-1", c: { name: "retail, 8,000 sq ft, wetlands", p: { kind: "commercial", use: "retail", gfa: 8000, units: 0, wet: true } } },
  { town: "Providence", zone: "C-2", c: { name: "retail, 8,000 sq ft, wetlands", p: { kind: "commercial", use: "retail", gfa: 8000, units: 0, wet: true } } },
  { town: "Westerly", zone: "HDR-6", c: { name: "12 homes, conservation", p: homes(12, 0, { conservation: true }) } },
  { town: "Exeter", zone: "RE-2", c: { name: "8 homes near transit", p: homes(8, 0, { transit: true }) } },
  { town: "Foster", zone: "GB", c: { name: "1 home", p: homes(1) } },
  { town: "Foster", zone: "M", c: { name: "1 home", p: homes(1) } },
];

function run() {
  const out: Record<string, unknown> = {};
  const runs = [
    ...Object.entries(ZONES).flatMap(([town, zones]) => zones.flatMap((zone) => SHAPES.map((c) => ({ town, zone, overlays: [] as string[], c })))),
    ...AREAS.flatMap((a) => SHAPES.filter((c) => /^(8 homes|12 homes|retail)/.test(c.name)).map((c) => ({ ...a, c }))),
    ...MORE.map((m) => ({ ...m, overlays: [] as string[] })),
  ];
  for (const { town, zone, overlays, c } of runs) {
    setActiveTown(town);
    {
      const i = normalizeInputs({ ...c.p, town, zone, overlays, address: "", parcel: "" });
      const auto = classify(i);
      const routes: Record<string, unknown> = {};
      for (const tree of TREES) {
        const f = deriveFlags(i, tree);
        routes[tree] = {
          steps: stepsFor(tree, f).map((s) => ({
            step: `${s.n} ${s.id}: ${s.title} [${s.auth.map((a) => `${a.c} ${a.cond ?? ""}`.trim()).join(", ")}]`,
            clock: s.clock.text, what: s.what,
            docs: visibleDocs(s, f).map((d) => `${d.title} (${d.src ?? "no source"} ${d.pin ?? ""})`.replace(" )", ")")),
          })),
          // The whole finding, not only its title: a refactor that changed a quote or dropped a source must show here.
          findings: analyze(i, tree).map((x) => ({ f: `${x.st} ${x.id ?? ""}: ${x.t}`, p: x.p, src: x.src, pin: x.pin, q: x.q, gap: x.gap })),
        };
      }
      out[`${town} ${zone}${overlays.length ? ` in ${overlays.join("+")}` : ""} ${c.name}`] = { route: auto, routes };
    }
  }
  return out;
}

const now = run();
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(v)).digest("hex").slice(0, 16);
const digestOf = (cases: Record<string, unknown>) => Object.fromEntries(Object.entries(cases).map(([k, v]) => [k, hash(v)]));
// One case a line, so the commit that changes the engine shows which cases it changed.
const writeDigest = (d: Record<string, string>) =>
  writeFileSync(DIGEST, `{\n${Object.entries(d).map(([k, v]) => ` ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n")}\n}\n`);
const total = Object.keys(now).length;
// A fresh clone has no .sources folder yet.
const saveCopy = () => { mkdirSync(new URL(".", OUT), { recursive: true }); writeFileSync(OUT, JSON.stringify(now, null, 1) + "\n"); };

if (process.argv.includes("--save")) {
  saveCopy();
  writeDigest(digestOf(now));
  console.log(`Saved ${total} cases to .sources/engine-snapshot.json, and their digest to scripts/engine/snapshot-digest.json`);
} else {
  // The digest is committed, so this part runs anywhere: which cases differ from the commit's engine, not how.
  const digest = existsSync(DIGEST) ? (JSON.parse(readFileSync(DIGEST, "utf8")) as Record<string, string>) : {};
  const mine = digestOf(now);
  const changed = [...new Set([...Object.keys(digest), ...Object.keys(mine)])].filter((k) => digest[k] !== mine[k]);
  let diffs = 0;
  const hadCopy = existsSync(OUT);
  if (hadCopy) {
    // The full copy is local: it shows how each case differs.
    const saved = JSON.parse(readFileSync(OUT, "utf8")) as Record<string, unknown>;
    for (const k of new Set([...Object.keys(saved), ...Object.keys(now)])) {
      const a = JSON.stringify(saved[k] ?? null, null, 1).split("\n"), b = JSON.stringify(now[k] ?? null, null, 1).split("\n");
      if (a.join() === b.join()) continue;
      diffs++;
      console.log(`\n== ${k}`);
      const sa = new Set(a), sb = new Set(b);
      for (const l of a) if (!sb.has(l)) console.log(`- ${l.trim()}`);
      for (const l of b) if (!sa.has(l)) console.log(`+ ${l.trim()}`);
    }
    if (!diffs && changed.length) console.log(`The local copy matches, but ${changed.length} cases differ from the committed digest: the copy was saved from another commit. Save it again from one known to be right.`);
  } else {
    for (const k of changed) console.log(`differs from the committed digest: ${k}`);
    // A run that matches the commit's digest is the commit's engine, so it is safe to keep as the local copy.
    if (!changed.length) saveCopy();
  }
  const bad = diffs || changed.length;
  console.log(bad
    ? `\n${diffs ? `${diffs} of ${total} cases differ from the saved copy; ` : ""}${changed.length} differ from the committed digest.`
    : `All ${total} cases match ${hadCopy ? "the saved copy and " : ""}the committed digest${hadCopy ? "" : ", and the run is kept as the local copy"}.`);
  process.exitCode = bad ? 1 : 0;
}
