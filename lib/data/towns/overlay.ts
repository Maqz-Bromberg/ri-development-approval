import type { AtlasDistrict, Finding, ProjectInputs, Step, StepPlan, TownRules, TreeId } from "../../types";
import { providenceFindings, PROVIDENCE_SCHEDULE } from "./providence/rules";
import { PROVIDENCE_RULES, PROVIDENCE_STEPS } from "./providence/steps";
import { cumberlandCommercialFindings, cumberlandCommercialUse } from "./cumberland/commercial";
import { TREES as CUMBERLAND_TREES } from "./cumberland/trees";
import { WESTERLY_UNMAPPED, airportStep, aquiferStep, westerlyCommercialUse, westerlyFindings, westerlyInclusionary, westerlyOverlay, westerlyOverlayFlags, westerlyUse } from "./westerly/rules";
import { northProvidenceFindings, northProvidenceUse } from "./north-providence/rules";
import { FOSTER_RETIRED, fosterFindings, fosterUse } from "./foster/rules";
import { EXETER_KINDS, EXETER_UNMAPPED, exeterAffordableLines, exeterFindings, exeterUse } from "./exeter/rules";
import { hopkintonFindings, hopkintonUse } from "./hopkinton/rules";
import { richmondUse } from "./richmond/rules";
import { GLOCESTER_KINDS, glocesterFindings, glocesterUse } from "./glocester/rules";
import { westGreenwichAffordableLines, westGreenwichFindings, westGreenwichUse } from "./west-greenwich/rules";
import { COMP_STEPS } from "./comp-steps";
import { pawtucketUse } from "./pawtucket/rules";
import { cranstonUse } from "./cranston/rules";
import { eastProvidenceAffordableLines, eastProvidenceFindings, eastProvidenceUse } from "./east-providence/rules";
import { woonsocketUse } from "./woonsocket/rules";
import { warwickUse } from "./warwick/rules";
import { NEWPORT_UNMAPPED, newportCoaStep, newportOverlay, newportOverlayFlags, newportUse } from "./newport/rules";
import { centralFallsFindings, centralFallsUse } from "./central-falls/rules";
import { smithfieldAffordableLines, smithfieldFindings, smithfieldUse } from "./smithfield/rules";
import { CHARLESTOWN_KINDS, CHARLESTOWN_UNMAPPED, charlestownCommercialUse, charlestownOverlay, charlestownUse } from "./charlestown/rules";

/*
 * What each town lays over the state-law route (lib/data/state/trees.ts). Each town's reading sits in its own folder.
 * Cumberland's steps moved out of the state routes into lib/data/towns/cumberland/trees.ts on 2026-11-18 (ARD debt 1);
 * its housing findings are still in lib/engine.ts. A town absent from these tables gets state law only.
 */
export type TownFindings = (i: ProjectInputs, tree: TreeId, generic: Finding[], d: AtlasDistrict | undefined) => Finding[];

const steps = <T extends { steps: Step[] }>(trees: Record<TreeId, T>) => Object.fromEntries(Object.entries(trees).map(([k, t]) => [k, t.steps])) as Record<TreeId, Step[]>;
const STEPS: Record<string, Partial<Record<TreeId, Step[]>>> = {
  Providence: PROVIDENCE_STEPS, Cumberland: steps(CUMBERLAND_TREES),
  // The comprehensive permit route from the town's own text (ARD D65).
  ...Object.fromEntries(Object.entries(COMP_STEPS).map(([town, s]) => [town, { comp: s }])),
};
const RULES: Record<string, TownRules> = {
  Providence: PROVIDENCE_RULES,
  // Cumberland's steps are in cumberland/trees.ts; its housing findings are still in engine.ts (debt 1).
  Cumberland: {
    useCommercial: cumberlandCommercialUse, commercialFindings: cumberlandCommercialFindings,
    routeStatus: Object.fromEntries(Object.entries(CUMBERLAND_TREES).map(([k, t]) => [k, t.status])),
    routeText: Object.fromEntries(Object.entries(CUMBERLAND_TREES).map(([k, t]) => [k, { rule: t.rule, blurb: t.blurb, stateTerms: true }])),
  },
  // Read to scope the design changes a town with overlays forces (ARD D38). Its use table answers in place of the Atlas.
  Charlestown: {
    use: charlestownUse, useCommercial: charlestownCommercialUse, overlayRules: charlestownOverlay, unmappedOverlays: CHARLESTOWN_UNMAPPED, kinds: CHARLESTOWN_KINDS,
    // The Mixed-Use Zoning Overlay's own share (§ 218-47 B(2)), on the affordable key (ARD D53 decision 2; D38's open item).
    affordableLines: (i) => ((i.overlays ?? []).includes("MUZ") && i.units > 1 ? [{ short: "59%: Charlestown Mixed-Use Zoning Overlay", what: "More than one home on a lot in the overlay needs 59% of the homes, rounded down, to be low or moderate income.", src: "chzo", need: Math.floor(i.units * 0.59) }] : []),
  },
  // Read for its ordinance under amendment: rules with dates, a pending amendment, vesting on certification (ARD D62, chunk 4).
  "North Providence": {
    use: northProvidenceUse, moreFindings: northProvidenceFindings, inclusionaryNone: { src: "npzo" },
  },
  // Chunk 6, small rural towns (ARD D63): each town's housing rows, read in place of the Atlas.
  Foster: { inclusionaryNone: { src: "fozo" }, use: fosterUse, moreFindings: (i) => fosterFindings(i), retired: FOSTER_RETIRED },
  Exeter: { routeStatus: { comp: "From the town's own procedure, read 2026-11-19" }, use: exeterUse, moreFindings: (i) => exeterFindings(i), unmappedOverlays: EXETER_UNMAPPED, kinds: EXETER_KINDS, affordableLines: exeterAffordableLines },
  Hopkinton: { routeStatus: { comp: "From the town's own procedure, read 2026-11-19" }, use: hopkintonUse, moreFindings: (i) => hopkintonFindings(i) },
  Richmond: { routeStatus: { comp: "From the town's own procedure, read 2026-11-19" }, use: richmondUse },
  Glocester: { use: glocesterUse, moreFindings: (i) => glocesterFindings(i), kinds: GLOCESTER_KINDS },
  "West Greenwich": {
    routeStatus: { comp: "From the town's own procedure, read 2026-11-19" }, use: westGreenwichUse, moreFindings: (i) => westGreenwichFindings(i), inclusionaryRead: true, affordableLines: westGreenwichAffordableLines,
  },
  // Chunk 7, the busy cities (ARD D67): each city's housing rows, read in place of the Atlas.
  Pawtucket: { use: pawtucketUse, inclusionaryNone: { src: "pazo" } },
  Cranston: { use: cranstonUse, inclusionaryNone: { src: "crzo" } },
  "East Providence": { use: eastProvidenceUse, moreFindings: (i) => eastProvidenceFindings(i), affordableLines: eastProvidenceAffordableLines },
  Woonsocket: { use: woonsocketUse, inclusionaryNone: { src: "wozo" } },
  Warwick: { use: warwickUse, inclusionaryNone: { src: "wazo", note: "A Planned District Residential project may have up to 15% more homes if at least a quarter are sold or rented below market (subsection 308), an incentive, not a requirement." } },
  Newport: {
    use: newportUse, inclusionaryNone: { src: "nezo" }, overlayRules: newportOverlay, unmappedOverlays: NEWPORT_UNMAPPED, overlayFlags: newportOverlayFlags,
    extraSteps: [{ step: newportCoaStep, before: ["record", "building"] }],
  },
  "Central Falls": { use: centralFallsUse, moreFindings: (i) => centralFallsFindings(i), inclusionaryNone: { src: "cfzo", note: "Parking is reduced by a quarter for each affordable home where at least 15% are deed-restricted, an incentive, not a requirement." } },
  // Not a city, but its zoning was saved by hand with them (the plan's chunk 7).
  Smithfield: { use: smithfieldUse, moreFindings: (i) => smithfieldFindings(i), affordableLines: smithfieldAffordableLines, inclusionaryRead: true },
  // Read for its overlay stack, inclusionary zoning and listed parcels (ARD D53, chunk 3).
  Westerly: {
    use: westerlyUse, useCommercial: westerlyCommercialUse, overlayRules: westerlyOverlay, unmappedOverlays: WESTERLY_UNMAPPED,
    overlayFlags: westerlyOverlayFlags, moreFindings: (i) => westerlyFindings(i), inclusionaryRead: true,
    extraSteps: [{ step: aquiferStep, before: ["building"] }, { step: airportStep, before: ["building"] }],
    affordableLines: (i) => (i.kind !== "commercial" && i.units >= 6 ? [{ short: "15%: Westerly inclusionary zoning", what: "Six or more homes need 15% of the units low- or moderate-income, deed-restricted for 99 years, with one bonus market-rate unit for each.", src: "wezo", need: westerlyInclusionary(i.units) }] : []),
  },
};
const FINDINGS: Record<string, TownFindings> = { Providence: providenceFindings };
const SCHEDULES: Record<string, Record<string, StepPlan>> = { Providence: PROVIDENCE_SCHEDULE };

export const townSteps = (town: string, tree: TreeId): Step[] | undefined => STEPS[town]?.[tree];
export const townRules = (town: string): TownRules => RULES[town] ?? {};
export const townFindings = (town: string): TownFindings | undefined => FINDINGS[town];
/** A town's own durations and key moments for a step, keyed "tree:step" like the shared schedule. */
export const townPlan = (town: string, tree: TreeId, stepId: string): StepPlan | undefined => SCHEDULES[town]?.[`${tree}:${stepId}`];
