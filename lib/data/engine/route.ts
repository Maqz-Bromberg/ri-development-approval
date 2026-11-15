import { TREES } from "../trees";
import { e, n, type Flow } from "./types";

const out = (id: keyof typeof TREES) => `${TREES[id].name}. Rule: ${TREES[id].rule}.`;

export const ROUTE: Flow = {
  slug: "route",
  title: "Route classification",
  blurb: "How a project is sorted into one of five approval routes.",
  intro:
    "The route is the first thing the engine decides, because it fixes every later stage, document and deadline. A project is first split by what is being built. Each town can supply its own rule; where it does not, state law's lines apply, in a fixed order. " +
    "The visitor can then override the result, to see another route's steps.",
  shows: [{ href: "/site", label: "Site selection" }, { href: "/steps", label: "Steps" }],
  nodes: [
    n("facts", "data", "Project facts", 2.2, 0, "Kind, units, affordable units, reuse or new, lot area, commercial floor area, and for commercial projects the work (new, expansion, change of use) and floor areas.", { where: ["lib/types.ts#ProjectInputs"] }),
    n("kind", "decision", "What is being built?", 2.2, 1.1, "Commercial or institutional projects take one branch; homes, and homes with commercial space, the other.", { where: ["lib/engine.ts#classify"] }),

    n("ctown", "decision", "Does the town have its own commercial rule?", 0.4, 2.4, "A town whose regulations draw their own floor-area lines supplies classifyCommercial.", { town: true, where: ["lib/types.ts#TownRules"] }),
    n("crule", "town", "The town's floor-area lines", 0, 3.7, "Providence: a change of use goes to administrative development plan review on a lot of 40,000 sq ft or more, and otherwise needs a building permit only. Over 20,000 sq ft of new floor area is major, 10,000 to 20,000 is minor. Under 10,000, new work over 2,500 sq ft in C-2, C-3, M-MU or W-2 gets administrative review; anything else a building permit.", { where: ["lib/data/towns/providence/rules.ts#providenceClassifyCommercial"], note: "Higher than the state's lines. Providence's regulations Art. 2." }),
    n("cstate", "step", "State law, § 45-23-32(19)(i)", 1.3, 3.7, "A change of use without extensive construction is minor. An expansion within the larger of 10,000 sq ft and half the existing floor area is minor, more is major. New floor area up to 7,500 sq ft is minor, more is major.", { where: ["lib/engine.ts#classifyCommercialState"], note: "A town can raise these lines, and the finding says the town's own regulations were not read." }),

    n("mix", "step", "Commercial space counts only for mixed use", 4.1, 2.4, "A homes project is read with zero commercial floor area, whatever the form holds. A mixed-use project keeps it.", { where: ["lib/engine.ts#classify"], note: "Debt 16: mixed use beyond the state's line (6 units and 2,500 sq ft) is flagged as a finding, not routed. The route stays the one the units give." }),
    n("htown", "decision", "Does the town have its own rule?", 4.1, 3.6, "A town whose regulations sort projects differently supplies classify. Providence does; Cumberland uses the state defaults.", { town: true, where: ["lib/data/towns/overlay.ts#townRules"] }),
    n("hrule", "town", "The town's rule", 2.55, 3.6, "Providence: a quarter or more affordable is the comprehensive permit. Reuse of a building is administrative review on a lot of 40,000 sq ft or more, otherwise a building permit. Ten or more new units is major above 2,500 sq ft of commercial space, otherwise minor. Four to nine new units is administrative review; fewer, a building permit.", { where: ["lib/data/towns/providence/steps.ts#PROVIDENCE_RULES"], note: "ARD D2, D15." }),

    n("d1", "decision", "3 or more units and 25% affordable?", 4.1, 4.8, "At least a quarter of the units affordable, on three or more, opens the comprehensive permit.", { where: ["lib/engine.ts#classify"], note: "R.I. Gen. Laws § 45-53-4." }),
    n("d2", "decision", "Reuse of a building, under 9 units?", 4.1, 5.9, "Adaptive reuse of a building at fewer than 9 units goes to development plan review.", { where: ["lib/engine.ts#classify"] }),
    n("d3", "decision", "10 or more units?", 4.1, 7, "Ten or more is a major land development.", { where: ["lib/engine.ts#classify"], note: "Nine units or fewer is the state's minor cap, § 45-23-32." }),
    n("d4", "decision", "3 or more units?", 4.1, 8.1, "Three to nine is a minor land development.", { where: ["lib/engine.ts#classify"] }),

    n("comp", "output", TREES.comp.name, 2.55, 4.8, out("comp"), { to: { href: "/steps", label: "See its steps" } }),
    n("dpr", "output", TREES.dpr.name, 2.55, 5.9, out("dpr")),
    n("major", "output", TREES.major.name, 2.55, 7, out("major")),
    n("minor", "output", TREES.minor.name, 2.55, 8.1, out("minor")),
    n("byright", "output", TREES.byright.name, 4.1, 9.2, `${out("byright")} One or two units, no land development review.`),

    n("tree", "data", "Route (TreeId)", 0.5, 6.4, "One of major, minor, comp, dpr, byright. The visitor may override it from the project panel; the route used is then the choice, and the engine's own is kept as the automatic one. Flags, steps, findings and the schedule all take this value.", { where: ["components/ProjectProvider.tsx#ProjectProvider"], to: { href: "/engine/flags", label: "Next: condition flags" } }),
  ],
  edges: [
    e("facts", "kind"),
    e("kind", "ctown", "commercial"), e("kind", "mix", "homes or mixed"),
    e("ctown", "crule", "yes"), e("ctown", "cstate", "no"),
    e("mix", "htown"),
    e("htown", "hrule", "yes"), e("htown", "d1", "no"),
    e("d1", "comp", "yes"), e("d1", "d2", "no"),
    e("d2", "dpr", "yes"), e("d2", "d3", "no"),
    e("d3", "major", "yes"), e("d3", "d4", "no"),
    e("d4", "minor", "yes"), e("d4", "byright", "no"),
    e("crule", "tree"), e("cstate", "tree"),
    e("hrule", "tree", undefined, { out: "left", in: "right" }),
    e("comp", "tree", undefined, { out: "left", in: "right" }),
    e("dpr", "tree", undefined, { out: "left", in: "right" }),
    e("major", "tree", undefined, { out: "left", in: "right" }),
    e("minor", "tree", undefined, { out: "left", in: "right" }),
    e("byright", "tree", undefined, { out: "bottom", in: "bottom" }),
  ],
};
