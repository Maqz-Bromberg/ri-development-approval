import type { AtlasDistrict, Finding, ProjectInputs, Step, StepPlan, TownRules, TreeId } from "../../types";
import { providenceFindings, PROVIDENCE_SCHEDULE } from "./providence/rules";
import { PROVIDENCE_RULES, PROVIDENCE_STEPS } from "./providence/steps";
import { cumberlandCommercialFindings, cumberlandCommercialUse } from "./cumberland/commercial";
import { TREES as CUMBERLAND_TREES } from "./cumberland/trees";
import { CHARLESTOWN_KINDS, CHARLESTOWN_UNMAPPED, charlestownCommercialUse, charlestownOverlay, charlestownUse } from "./charlestown/rules";

/*
 * What each town lays over the state-law route (lib/data/state/trees.ts). Each town's reading sits in its own folder.
 * Cumberland's steps moved out of the state routes into lib/data/towns/cumberland/trees.ts on 2026-11-18 (ARD debt 1);
 * its housing findings are still in lib/engine.ts. A town absent from these tables gets state law only.
 */
export type TownFindings = (i: ProjectInputs, tree: TreeId, generic: Finding[], d: AtlasDistrict | undefined) => Finding[];

const steps = <T extends { steps: Step[] }>(trees: Record<TreeId, T>) => Object.fromEntries(Object.entries(trees).map(([k, t]) => [k, t.steps])) as Record<TreeId, Step[]>;
const STEPS: Record<string, Partial<Record<TreeId, Step[]>>> = { Providence: PROVIDENCE_STEPS, Cumberland: steps(CUMBERLAND_TREES) };
const RULES: Record<string, TownRules> = {
  Providence: PROVIDENCE_RULES,
  // Cumberland's steps are in cumberland/trees.ts; its housing findings are still in engine.ts (debt 1).
  Cumberland: {
    useCommercial: cumberlandCommercialUse, commercialFindings: cumberlandCommercialFindings,
    routeStatus: Object.fromEntries(Object.entries(CUMBERLAND_TREES).map(([k, t]) => [k, t.status])),
    routeText: Object.fromEntries(Object.entries(CUMBERLAND_TREES).map(([k, t]) => [k, { rule: t.rule, blurb: t.blurb, stateTerms: true }])),
  },
  // Read to scope the design changes a town with overlays forces (ARD D38). Its use table answers in place of the Atlas.
  Charlestown: { use: charlestownUse, useCommercial: charlestownCommercialUse, overlayRules: charlestownOverlay, unmappedOverlays: CHARLESTOWN_UNMAPPED, kinds: CHARLESTOWN_KINDS },
};
const FINDINGS: Record<string, TownFindings> = { Providence: providenceFindings };
const SCHEDULES: Record<string, Record<string, StepPlan>> = { Providence: PROVIDENCE_SCHEDULE };

export const townSteps = (town: string, tree: TreeId): Step[] | undefined => STEPS[town]?.[tree];
export const townRules = (town: string): TownRules => RULES[town] ?? {};
export const townFindings = (town: string): TownFindings | undefined => FINDINGS[town];
/** A town's own durations and key moments for a step, keyed "tree:step" like the shared schedule. */
export const townPlan = (town: string, tree: TreeId, stepId: string): StepPlan | undefined => SCHEDULES[town]?.[`${tree}:${stepId}`];
