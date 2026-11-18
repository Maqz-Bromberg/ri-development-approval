import { district, readByUtility } from "./data/atlas";
import { TREES, TREE_ORDER } from "./data/state/trees";
import { classify, commercialLines, condOK, deciders, deriveFlags, fmt, maxUnits, stepsFor, verdict } from "./engine";
import { buildSchedule, daysBetween } from "./schedule";
import type { ProjectInputs, TreeId } from "./types";
import { routeText } from "./engine";

export interface Scenario {
  id: string;
  label: string;
  /** What changes, in one sentence */
  why: string;
  inputs: ProjectInputs;
  tree: TreeId;
  route: string;
  /** Steps on the main line, before the building permit */
  approvalSteps: number;
  /** Public hearings on the main line */
  hearings: number;
  /** Statutory town review, in days */
  reviewDays: number;
  /** Days from the start date to the recorded approval, as the schedule lays it out */
  approvalDays: number;
  fails: number;
  flags: number;
  /** Who holds the decision on the main line, by contact id */
  deciders: string[];
  /** The main-line steps before the building permit, by id and title, with who holds each (a contact id) where someone decides it */
  steps: { id: string; title: string; who?: string }[];
  current?: boolean;
}

function measure(id: string, label: string, why: string, inputs: ProjectInputs, forced?: TreeId): Scenario {
  const tree = forced ?? classify(inputs);
  const f = deriveFlags(inputs, tree);
  const steps = stepsFor(tree, f);
  const v = verdict(inputs, tree, steps);
  const plan = buildSchedule(tree, steps, inputs.startDate, inputs.town);
  const done = plan.find((p) => p.step.id === "record") ?? plan.find((p) => p.step.id === "final") ?? plan.find((p) => p.step.id === "zcheck");
  const main = steps.filter((s) => !s.branch);
  const before = main.findIndex((s) => s.id === "building");
  return {
    id, label, why, inputs, tree, route: routeText(tree).name,
    approvalSteps: before === -1 ? main.length : before,
    hearings: plan.filter((p) => !p.step.branch).reduce((a, p) => a + p.ticks.filter((t) => t.kind === "hearing" && /hearing/i.test(t.label)).length, 0),
    reviewDays: v.reviewDays,
    approvalDays: done && plan.length ? daysBetween(plan[0].start, done.end) : 0,
    fails: v.fails.length,
    flags: v.flags.length,
    deciders: deciders(steps, f),
    steps: (before === -1 ? main : main.slice(0, before)).map((s) => ({ id: s.id, title: s.title, who: s.auth.find((a) => condOK(a.cond, f))?.c })),
  };
}

/**
 * The same project on each of the five routes, for comparing the routes themselves (ARD D51): each is measured as if the town
 * treated the project that way, whether or not the facts pick it. `current` marks the route the project is on.
 */
export function routeScenarios(i: ProjectInputs, current: TreeId): Scenario[] {
  return TREE_ORDER.map((k) => ({ ...measure(k, routeText(k, i.town).name, routeText(k, i.town).rule, i, k), current: k === current }));
}

/**
 * The project as entered, beside the nearby alternatives the rules make cheap to compare:
 * the 9/10-unit line, the 25% affordable share, conservation development, and the lot's maximum.
 * The route override is ignored here, since each scenario is classified from its own facts.
 */
export function scenarios(i: ProjectInputs): Scenario[] {
  const out: Scenario[] = [{ ...measure("current", "Your project", "As entered.", i), current: true }];
  const seen = new Set([JSON.stringify(i)]);
  const add = (id: string, label: string, why: string, patch: Partial<ProjectInputs>) => {
    const next = { ...i, ...patch };
    next.aff = Math.min(next.aff, next.units);
    const key = JSON.stringify(next);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(measure(id, label, why, next));
  };
  // A commercial project's alternatives are its floor-area lines: the largest one under the floor area entered.
  if (i.kind === "commercial") {
    const line = commercialLines(i.town).filter((l) => l < i.gfa && i.work !== "change").pop();
    if (line) add("under", `Keep the new floor area to ${fmt(line)} sq ft`, `${fmt(line)} sq ft of new floor area is a line in ${i.town}'s review: under it the review is lighter.`, { gfa: line });
    return out;
  }
  if (i.kind === "mixed" && (i.units > 6 || i.commercial > 2500) && i.units < 10) {
    add("mixedline", "6 units and 2,500 sq ft of commercial space", "Within the state's minor line for mixed use, which settles the route without asking the town.", { units: Math.min(i.units, 6), commercial: Math.min(i.commercial, 2500), aff: Math.min(i.aff, 6) });
  }
  const share = i.units ? i.aff / i.units : 0;
  const comp = i.units >= 3 && share >= 0.25;

  if (i.units >= 10 && !comp) {
    add("nine", "Build 9 units", "Nine units or fewer is a minor land development, which skips the master plan stage.", { units: 9 });
  }
  if (i.units >= 3 && i.units <= 9 && !comp && i.type === "new") {
    add("ten", "Build 10 units", "The tenth unit makes it a major land development, which adds the master plan stage.", { units: 10 });
  }
  if (i.units >= 3 && !comp) {
    const n = Math.ceil(i.units * 0.25);
    add("comp", `Make ${n} of ${i.units} units affordable`, "A quarter of the units deed-restricted opens the comprehensive permit: one application, and the board can adjust use and density.", { aff: n });
  }
  const d = district(i.zone);
  if (!i.conservation && readByUtility(d?.family4_maxunitsperacre ?? null, i.water, i.sewer).prd) {
    add("conservation", "Conservation development", "Cluster the buildings and keep at least 25% of the upland as open space, in exchange for a higher density.", { conservation: true });
  }
  const max = maxUnits(i);
  if (max > 0 && max !== i.units) {
    add("max", `Build ${max} units, the most the lot supports`, max > i.units ? "The density rule leaves room for more units on this lot." : "The largest unit count that meets the density rule without relief.", { units: max });
  }
  return out;
}
