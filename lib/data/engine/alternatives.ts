import { e, n, type Flow } from "./types";

export const ALTERNATIVES: Flow = {
  slug: "alternatives",
  title: "Alternatives",
  blurb: "How nearby variations of a project are tried through the whole engine and compared.",
  intro:
    "The rules have lines that make small changes matter: nine units or ten, a quarter of the units affordable, a conservation layout. " +
    "The engine proposes the few variations that cross such a line, runs each one through the whole pipeline as if it were the project, and lays the results beside the project as entered. " +
    "Comparing never changes the project; trying one keeps the entered facts so the visitor can go back.",
  shows: [{ href: "/site", label: "Site selection" }, { href: "/steps", label: "Steps" }],
  nodes: [
    n("in", "data", "The project as entered", 2.2, 0, "The facts, including the town and kind of project. The route choice is ignored here: each scenario is classified from its own facts.", { where: ["lib/whatif.ts#scenarios"] }),
    n("gen", "step", "Propose variations that cross a line", 2.2, 1.2, "Each candidate is a patch to the facts, with a one-sentence reason. A candidate that equals the project or one already proposed (compared as JSON) is dropped.", { where: ["lib/whatif.ts#scenarios"] }),

    n("nine", "step", "Nine units, or ten", 0, 2.6, "From ten or more units (not already a comprehensive permit): nine, the minor cap, which skips the master plan stage. From 3 to 9 new units: ten, which adds it, for comparison.", { where: ["lib/whatif.ts#scenarios"], note: "The state's minor cap, § 45-23-32." }),
    n("comp", "step", "A quarter affordable", 1.4, 2.6, "On three or more units, the smallest number that is at least 25%: opens the comprehensive permit, one application where the board can adjust use and density.", { where: ["lib/whatif.ts#scenarios"], note: "R.I. Gen. Laws § 45-53-4. The affordable share is also shaded against the federal tax-credit set-asides (ARD D24)." }),
    n("cons", "step", "Conservation development", 2.8, 2.6, "Only where the district's Atlas density has a figure \"if PRD\": cluster the buildings and keep 25% of the upland, for a higher density.", { where: ["lib/whatif.ts#scenarios", "lib/data/atlas.ts#readByUtility"] }),
    n("max", "step", "The most units the lot supports", 4.2, 2.6, "The largest unit count that meets the density rule with the use allowed. Offered only when it differs from the project's count.", { where: ["lib/engine.ts#maxUnits"], to: { href: "/engine/use-density", label: "Use and density" } }),
    n("line", "step", "A line in mixed use or commercial", 5.6, 2.6, "Mixed use over 6 units or 2,500 sq ft of commercial space, below 10 units: the state's minor line. A commercial project: the largest of the town's floor-area lines below the area entered.", { where: ["lib/whatif.ts#scenarios", "lib/engine.ts#commercialLines"], town: true }),

    n("meas", "step", "Run each through the engine", 2.8, 4.1, "measure() takes a variation's facts and runs classify, deriveFlags, stepsFor, verdict and buildSchedule, then deciders. It is the same code the pages use, so the comparison cannot disagree with the project's own answer.", { where: ["lib/whatif.ts#measure"] }),
    n("sc", "data", "A scenario", 2.8, 5.4, "The facts, the route and its name, the number of approval steps before the building permit, the public hearings on the main line, the statutory review days, the days from the start date to the recorded approval, the fails and flags, and the deciders.", { where: ["lib/whatif.ts#Scenario"], note: "Principle 3: counts and dates the rules give, not a score." }),

    n("cmp", "output", "The comparison", 1, 6.9, "The project as entered beside each variation, with what changes: route, steps, hearings, days, blockers, who decides.", { where: ["components/Compare.tsx"], to: { href: "/site", label: "Open Site selection" } }),
    n("try", "step", "Try one", 4.6, 6.9, "Replaces the project's facts with the variation's and keeps the facts as entered, with a banner on Site selection, Check and Steps to go back to them, or to keep the variation as the project.", { where: ["components/ProjectProvider.tsx#ProjectProvider"], note: "ARD D21. Debt 15: the kept entry lives only in the browser, so a link made mid-trial carries the variation, not the entry." }),
  ],
  edges: [
    e("in", "gen"),
    e("gen", "nine"), e("gen", "comp"), e("gen", "cons"), e("gen", "max"), e("gen", "line"),
    e("nine", "meas"), e("comp", "meas"), e("cons", "meas"), e("max", "meas"), e("line", "meas"),
    e("meas", "sc"),
    e("sc", "cmp"), e("sc", "try"),
  ],
};
