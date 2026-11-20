// Every check the site has, in one run: `npm run check`. Each reports and none edits (ARD principle 8). A check that
// needs the local source folder (.sources/, ARD D9) is skipped, and says so, on a clone where it has not been filled.
// Exits 1 if any check failed. `npm run check -- --fast` leaves out the type check, the slowest.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const fast = process.argv.includes("--fast");
const sources = existsSync(".sources");
const node = (script) => ["node", "--import", "./scripts/engine/register.mjs", script];

const CHECKS = [
  { name: "types", cmd: ["npx", "tsc", "--noEmit"], skip: fast && "--fast" },
  { name: "engine flowcharts", cmd: ["python3", "scripts/check_engine_flows.py"] },
  { name: "known answers", cmd: ["node", "--import", "./scripts/engine/register.mjs", "--test", "tests/*.test.ts"], summary: (out) => { const m = /ℹ pass (\d+)[\s\S]*ℹ fail (\d+)/.exec(out); return m ? `${m[1]} passed, ${m[2]} failed` : ""; } },
  { name: "engine snapshot", cmd: node("scripts/engine/snapshot.ts"), skip: !existsSync("scripts/engine/snapshot-digest.json") && !existsSync(".sources/engine-snapshot.json") && "no digest and no saved copy" },
  { name: "quotes", cmd: ["python3", "scripts/towns/verify_quotes.py"], skip: !sources && "no .sources folder" },
  { name: "timelines", first: true, cmd: ["python3", "scripts/timelines/verify.py", sources ? ".sources" : "/nonexistent", ...(sources ? [] : ["--offline"])] },
];

let failed = 0;
for (const c of CHECKS) {
  if (c.skip) { console.log(`–  ${c.name}: skipped, ${c.skip}`); continue; }
  const t = Date.now();
  const r = spawnSync(c.cmd[0], c.cmd.slice(1), { encoding: "utf8" });
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
  const lines = out.split("\n").filter(Boolean);
  const last = (c.summary ? c.summary(out) : ((c.first ? lines[0] : lines.pop()) ?? "")).slice(0, 140);
  const secs = ((Date.now() - t) / 1000).toFixed(1);
  if (r.status === 0) console.log(`✓  ${c.name} (${secs} s)${last ? `: ${last}` : ""}`);
  else {
    failed++;
    console.log(`✗  ${c.name} (${secs} s), exit ${r.status}`);
    console.log(out.split("\n").slice(-40).map((l) => `     ${l}`).join("\n"));
  }
}
console.log(failed ? `\n${failed} check${failed > 1 ? "s" : ""} failed.` : "\nAll checks passed.");
process.exitCode = failed ? 1 : 0;
