import { district, readByUtility } from "./data/atlas";
import { TREES } from "./data/trees";
import { classify, deriveFlags, maxUnits, stepsFor, verdict } from "./engine";
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
  current?: boolean;
}

function measure(id: string, label: string, why: string, inputs: ProjectInputs): Scenario {
  const tree = classify(inputs);
  const steps = stepsFor(tree, deriveFlags(inputs, tree));
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
  };
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
