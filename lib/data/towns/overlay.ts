import type { StepPlan, Step, TownFindings, TownRules, TreeId } from "../../types";
import { RULES as providence } from "./providence/rules";
import { RULES as cumberland } from "./cumberland/rules";
import { RULES as charlestown } from "./charlestown/rules";
import { RULES as westerly } from "./westerly/rules";
import { RULES as northProvidence } from "./north-providence/rules";
import { RULES as foster } from "./foster/rules";
import { RULES as exeter } from "./exeter/rules";
import { RULES as hopkinton } from "./hopkinton/rules";
import { RULES as richmond } from "./richmond/rules";
import { RULES as glocester } from "./glocester/rules";
import { RULES as westGreenwich } from "./west-greenwich/rules";
import { RULES as pawtucket } from "./pawtucket/rules";
import { RULES as cranston } from "./cranston/rules";
import { RULES as eastProvidence } from "./east-providence/rules";
import { RULES as woonsocket } from "./woonsocket/rules";
import { RULES as warwick } from "./warwick/rules";
import { RULES as newport } from "./newport/rules";
import { RULES as centralFalls } from "./central-falls/rules";
import { RULES as newShoreham } from "./new-shoreham/rules";
import { RULES as smithfield } from "./smithfield/rules";

/*
 * What each town lays over the state-law route (lib/data/state/trees.ts). Each town's reading sits in its own folder,
 * whose rules.ts exports it as `RULES`; adding a town is that file and one line here. A town absent from this table
 * gets state law only. Cumberland's steps moved out of the state routes on 2026-11-18, and its housing findings out of
 * lib/engine.ts on 2026-11-20 (ARD debt 1).
 */
const TOWNS: Record<string, TownRules> = {
  Providence: providence,
  Cumberland: cumberland,
  Charlestown: charlestown,
  Westerly: westerly,
  "North Providence": northProvidence,
  Foster: foster,
  Exeter: exeter,
  Hopkinton: hopkinton,
  Richmond: richmond,
  Glocester: glocester,
  "West Greenwich": westGreenwich,
  Pawtucket: pawtucket,
  Cranston: cranston,
  "East Providence": eastProvidence,
  Woonsocket: woonsocket,
  Warwick: warwick,
  Newport: newport,
  "Central Falls": centralFalls,
  "New Shoreham": newShoreham,
  Smithfield: smithfield,
};

export const townRules = (town: string): TownRules => TOWNS[town] ?? {};
export const townSteps = (town: string, tree: TreeId): Step[] | undefined => TOWNS[town]?.steps?.[tree];
export const townFindings = (town: string): TownFindings | undefined => TOWNS[town]?.findings;
/** A town's own durations and key moments for a step, keyed "tree:step" like the shared schedule. */
export const townPlan = (town: string, tree: TreeId, stepId: string): StepPlan | undefined => TOWNS[town]?.schedule?.[`${tree}:${stepId}`];
