import type { AtlasDistrict, Finding, ProjectInputs, Step, StepPlan, TownRules, TreeId } from "../../types";
import { providenceFindings, PROVIDENCE_SCHEDULE } from "./providence/rules";
import { PROVIDENCE_RULES, PROVIDENCE_STEPS } from "./providence/steps";

/*
 * What each town lays over the state-law route. This is the first step of the split planned in
 * docs/plans/statewide.md: Cumberland's steps still live inside lib/data/trees.ts, and Providence is the
 * first town whose local reading sits in its own folder. A town absent from these tables gets state law only.
 */
export type TownFindings = (i: ProjectInputs, tree: TreeId, generic: Finding[], d: AtlasDistrict | undefined) => Finding[];

const STEPS: Record<string, Partial<Record<TreeId, Step[]>>> = { Providence: PROVIDENCE_STEPS };
const RULES: Record<string, TownRules> = { Providence: PROVIDENCE_RULES };
const FINDINGS: Record<string, TownFindings> = { Providence: providenceFindings };
const SCHEDULES: Record<string, Record<string, StepPlan>> = { Providence: PROVIDENCE_SCHEDULE };

export const townSteps = (town: string, tree: TreeId): Step[] | undefined => STEPS[town]?.[tree];
export const townRules = (town: string): TownRules => RULES[town] ?? {};
export const townFindings = (town: string): TownFindings | undefined => FINDINGS[town];
/** A town's own durations and key moments for a step, keyed "tree:step" like the shared schedule. */
export const townPlan = (town: string, tree: TreeId, stepId: string): StepPlan | undefined => SCHEDULES[town]?.[`${tree}:${stepId}`];
