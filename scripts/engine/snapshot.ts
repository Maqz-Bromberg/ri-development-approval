/*
 * The stored comparison (ARD debt 3, D53 chunk 1). Runs a fixed set of sample projects through the engine, in every
 * town that has rules of its own and one that has none, and writes what comes out: the route each project gets, and
 * for all five routes the steps (with who decides each) and the findings. Run by hand, like the other checks.
 *
 *   node --import ./scripts/engine/register.mjs scripts/engine/snapshot.ts          # compare with the saved copy
 *   node --import ./scripts/engine/register.mjs scripts/engine/snapshot.ts --save   # save this run as the copy (.sources/engine-snapshot.json)
 *
 * A difference is not an error: it is what the change did. Read it, and save when it is what was meant.
 * The Zoning Atlas is live in the browser and absent here, so findings that need a district's Atlas figures show as
 * they do when the Atlas does not answer. Cumberland's bundled districts are the exception.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { analyze, classify, deriveFlags, normalizeInputs, stepsFor, visibleDocs } from "@/lib/engine";
import { setActiveTown } from "@/lib/town";
import type { ProjectInputs, TreeId } from "@/lib/types";

// The saved copy is about 3 MB, so it is kept with the other local files in .sources/, not committed. A fresh clone
// saves one from a commit known to be right, then compares each change against it.
const OUT = new URL("../../.sources/engine-snapshot.json", import.meta.url);
const TREES: TreeId[] = ["byright", "dpr", "minor", "major", "comp"];

type Case = { name: string; p: Partial<ProjectInputs> };
const homes = (units: number, aff = 0, more: Partial<ProjectInputs> = {}): Partial<ProjectInputs> => ({ kind: "homes", units, aff, ...more });
const ZONES: Record<string, string[]> = {
  Cumberland: ["R-3", "C-1"],
  Providence: ["R-3", "C-2", "D-1"],
  Charlestown: ["R-20", "C-1"],
  Westerly: ["other", "HDR-6", "DC1"],
  "North Providence": ["RG", "IS"],
  Foster: ["AR"],
  Exeter: ["LB/R", "RE-2"],
  Glocester: ["R-2"],
  "West Greenwich": ["HB"],
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
];

function run() {
  const out: Record<string, unknown> = {};
  const runs = [
    ...Object.entries(ZONES).flatMap(([town, zones]) => zones.flatMap((zone) => SHAPES.map((c) => ({ town, zone, overlays: [] as string[], c })))),
    ...AREAS.flatMap((a) => SHAPES.filter((c) => /^(8 homes|12 homes|retail)/.test(c.name)).map((c) => ({ ...a, c }))),
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
          findings: analyze(i, tree).map((x) => `${x.st} ${x.id ?? ""}: ${x.t}`),
        };
      }
      out[`${town} ${zone}${overlays.length ? ` in ${overlays.join("+")}` : ""} ${c.name}`] = { route: auto, routes };
    }
  }
  return out;
}

const now = run();
if (process.argv.includes("--save") || !existsSync(OUT)) {
  writeFileSync(OUT, JSON.stringify(now, null, 1) + "\n");
  console.log(`Saved ${Object.keys(now).length} cases to .sources/engine-snapshot.json`);
} else {
  const saved = JSON.parse(readFileSync(OUT, "utf8")) as Record<string, unknown>;
  let diffs = 0;
  for (const k of new Set([...Object.keys(saved), ...Object.keys(now)])) {
    const a = JSON.stringify(saved[k] ?? null, null, 1).split("\n"), b = JSON.stringify(now[k] ?? null, null, 1).split("\n");
    if (a.join() === b.join()) continue;
    diffs++;
    console.log(`\n== ${k}`);
    const sa = new Set(a), sb = new Set(b);
    for (const l of a) if (!sb.has(l)) console.log(`- ${l.trim()}`);
    for (const l of b) if (!sa.has(l)) console.log(`+ ${l.trim()}`);
  }
  console.log(diffs ? `\n${diffs} of ${Object.keys(now).length} cases differ.` : `All ${Object.keys(now).length} cases match the saved copy.`);
  process.exitCode = diffs ? 1 : 0;
}
