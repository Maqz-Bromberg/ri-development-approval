import { analyze } from "./engine";
import type { Finding, ProjectInputs, TreeId } from "./types";

const ORDER = { fail: 0, flag: 1, info: 2, pass: 3 } as const;
export const FINDING_LABEL = { fail: "Blocker", flag: "Open", info: "Note", pass: "Pass" } as const;

/** The findings for the project, blockers and open questions first. Both the stage and its rail read this order. */
export function sortedFindings(i: ProjectInputs, tree: TreeId): Finding[] {
  return analyze(i, tree).map((f, n) => ({ f, n })).sort((a, b) => ORDER[a.f.st] - ORDER[b.f.st] || a.n - b.n).map(({ f }) => f);
}
