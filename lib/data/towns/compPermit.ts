import type { Doc, Step } from "../../types";
import { TREES } from "../state/trees";

/*
 * A town's own comprehensive permit route (ARD D65), built from the state's (lib/data/state/trees.ts) with the town's
 * ordinance or regulations in place of "not read": who it must meet before filing, the clocks its own text sets, what it
 * adds to eligibility, and how it treats the final plan and appeals. Each step stays a whole step (D1). Read for the four
 * towns whose comprehensive permit cases were read into precedent (D64): Exeter, Hopkinton, Richmond, West Greenwich.
 */

const STATE = TREES.comp.steps;
const state = (id: string): Step => {
  const s = STATE.find((x) => x.id === id);
  if (!s) throw new Error(`No state comp step ${id}`);
  return s;
};

/** Since January 1, 2024 an appeal of a comprehensive permit goes to the Superior Court under § 45-53-5.1, not § 45-23-71. */
export const COMP_APPEAL_DOC: Doc = {
  title: "Appeal to the Superior Court within 20 days",
  src: "s5351", pin: "§ 45-53-5.1(a)", q: "A decision of a local review board may be appealed by the applicant or an aggrieved party",
  checklist: [
    "Note the date the decision was recorded and posted, which starts the 20 days",
    "The complaint names the Planning Board, and the applicant if a neighbour appeals",
    "An appeal of a final plan is limited to what the preliminary decision did not settle",
  ],
};

export interface TownComp {
  /** The town's rule for the pre-application conference */
  preapp: { what: string; doc: Doc };
  /** Extra eligibility rules the town adds to the state's 25% */
  elig?: Doc[];
  /** A stage the town adds before the preliminary plan (West Greenwich's master plan for a major project) */
  master?: Step;
  prelim: { clock: Step["clock"]; what: string; docs: Doc[]; cond?: string };
  /** A second version of the preliminary plan step, for projects the first does not cover (by condition) */
  prelimAlt?: Step;
  final: { clock: Step["clock"]; what: string; docs: Doc[] };
  appeal: { what: string; docs: Doc[] };
}

/** The town's whole comprehensive permit route. */
export function compRoute(t: TownComp): Step[] {
  const elig = state("elig"), preapp = state("preapp"), prelim = state("prelim"), final = state("final"), appeal = state("appeal");
  return [
    state("zoning"),
    { ...elig, docs: [...elig.docs, ...(t.elig ?? [])] },
    { ...preapp, what: t.preapp.what, docs: [t.preapp.doc] },
    ...(t.master ? [t.master] : []),
    { ...prelim, clock: t.prelim.clock, what: t.prelim.what, docs: [...t.prelim.docs, ...prelim.docs.filter((d) => d.title !== "Decision deadline")], ...(t.prelim.cond ? { cond: t.prelim.cond } : {}) },
    ...(t.prelimAlt ? [t.prelimAlt] : []),
    { ...final, clock: t.final.clock, what: t.final.what, docs: [...t.final.docs, ...final.docs] },
    state("record"),
    { ...appeal, what: t.appeal.what, docs: t.appeal.docs },
  ];
}
