import { e, n, type Flow } from "./types";

/*
 * The engine as its parts. Each node opens the flowchart of that part's mechanics (slug under /engine).
 * Order down the page is the order of work: the facts, the route, the checks, the outputs.
 */
export const OVERVIEW: Flow = {
  slug: "",
  title: "How the engine works",
  blurb: "The parts of the engine, and how a project moves through them.",
  size: "lg",
  intro:
    "The engine turns a site and a project into three answers: can this be built here, by which route and who decides each step, and how long the town may take. " +
    "It runs in the visitor's browser, with no server, on every change to the facts. The boxes below are its parts, in the order of work. " +
    "Hover a box for what it does; click it for the flowchart of how it works.",
  shows: [
    { href: "/site", label: "Site selection" },
    { href: "/project", label: "Check" },
    { href: "/steps", label: "Steps" },
    { href: "/schedule", label: "Schedule" },
  ],
  nodes: [
    n("lookup", "data", "Site lookup", 0, 0, "Turns an address or a map click into site facts: the town, the zoning district and its overlays, whether public water and sewer reach the site, the tax parcel, whether it is tribal land, and which agency regulates wetlands. All from public map services, queried from the browser.", {
      sub: "address to site facts", where: ["lib/lookup.ts#siteFacts"], to: { href: "/engine/site-lookup", label: "How the lookup works" },
    }),
    n("facts", "data", "Project facts", 1, 0, "The one record every other part reads: what is being built (homes, homes with commercial space, or commercial), how many units, the lot, the district, the utilities, the state-permit triggers. It is filled from the lookup, the form, a share link or a saved site, and recomputed on every change.", {
      sub: "what the engine is given", where: ["lib/types.ts#ProjectInputs", "components/ProjectProvider.tsx#ProjectProvider"], to: { href: "/engine/project-facts", label: "How the facts are held" },
    }),
    n("town", "town", "Town overlay", 0, 1, "The seam between state law and a town's own reading. Each part below asks the town first; where the town has been read, its answer replaces the state default or the Atlas's. A town that has not been read gets state law only, and says so.", {
      sub: "state law, then the town", where: ["lib/data/towns/overlay.ts", "lib/data/towns.ts#coverageFor"], to: { href: "/engine/town-overlay", label: "How a town's reading is laid over state law" },
    }),
    n("route", "step", "Route classification", 1, 1, "Sorts the project into one of five approval routes: major or minor land development, comprehensive permit, development plan review, or a building permit only. The route fixes every later stage and deadline.", {
      sub: "which of five routes", town: true, where: ["lib/engine.ts#classify"], to: { href: "/engine/route", label: "How the route is chosen" },
    }),
    n("usedensity", "step", "Use and density", 0, 2, "Two questions about the land: is this use allowed in the district, and does the lot have the area the unit count needs. The answers feed the condition flags and the law check.", {
      sub: "allowed here? room enough?", town: true, where: ["lib/engine.ts#useTreatment", "lib/engine.ts#requiredArea"], to: { href: "/engine/use-density", label: "How use and density are decided" },
    }),
    n("flags", "step", "Condition flags", 1, 2, "Ten true-or-false facts about the site (wetlands, state road, an acre disturbed, septic, public water or sewer, transit, zone change, relief needed, always). Steps, documents and deciders each carry a condition on these, so the flags decide what is shown.", {
      sub: "what applies to this site", where: ["lib/engine.ts#deriveFlags", "lib/engine.ts#condOK"], to: { href: "/engine/flags", label: "How the flags are derived" },
    }),
    n("findings", "step", "Law check", 2, 2, "Reads the project against the rules and returns findings: pass, flag, fail or info, each with the law it rests on and a quote. Where something has not been read, the finding says so as a named gap instead of passing.", {
      sub: "findings with their sources", town: true, where: ["lib/engine.ts#analyze"], to: { href: "/engine/findings", label: "How findings are assembled" },
    }),
    n("steps", "step", "Route steps", 1, 3, "Builds the list of steps for the route: the state-law steps, the town's own steps where it has them, filtered to those that apply to this site and numbered. Each step carries its documents, who decides it, and its statutory clock.", {
      sub: "what to file, in order", town: true, where: ["lib/engine.ts#stepsFor"], to: { href: "/engine/steps", label: "How the steps are built" },
    }),
    n("verdict", "output", "Verdict and deciders", 2, 3, "The headline: what blocks the project, what is open, how many days the town may take in total, which state permits are triggered, and who holds the decision at each step.", {
      sub: "the headline answer", where: ["lib/engine.ts#verdict", "lib/engine.ts#deciders"], to: { href: "/engine/verdict", label: "How the verdict is added up" },
    }),
    n("alt", "step", "Alternatives", 3, 3, "Runs the whole engine again for nearby variations (nine units instead of ten, a quarter affordable, a conservation layout, the most units the lot allows) and lays the results beside the project as entered.", {
      sub: "what if it were different", where: ["lib/whatif.ts#scenarios"], to: { href: "/engine/alternatives", label: "How alternatives are tried" },
    }),
    n("schedule", "output", "Schedule", 1, 4, "Lays the steps out in time from a start date: each step's length, steps that run alongside, the wait for state permits, and filing dates snapped to the board's real meeting calendar.", {
      sub: "when each step happens", town: true, where: ["lib/schedule.ts#buildSchedule"], to: { href: "/engine/schedule", label: "How the schedule is laid out" },
    }),
    n("records", "data", "Records and timelines", 2, 4, "What past projects actually took: dated events from minutes and recordings, each with an evidence class computed from how it was checked. The engine turns them into typical times for a step and into the approval each project reached.", {
      sub: "what has actually happened", where: ["lib/timelines.ts"], to: { href: "/engine/records", label: "How records become timelines" },
    }),
    n("sources", "data", "Sources and quotes", 3, 1, "Every requirement carries the id of the document it comes from, a pinpoint, and a verbatim quote where one was read. Scripts check each quote against the stored document word for word.", {
      sub: "where every claim comes from", where: ["lib/data/sources.ts", "components/Cite.tsx"], to: { href: "/engine/sources", label: "How claims are traced" },
    }),
  ],
  edges: [
    e("lookup", "facts", "fills"),
    e("facts", "route"),
    e("town", "route", "asks first", { dashed: true }),
    e("town", "usedensity", "asks first", { dashed: true }),
    e("route", "flags"),
    e("usedensity", "flags"),
    e("route", "findings", undefined, { out: "right", in: "top" }),
    e("flags", "steps"),
    e("findings", "verdict"),
    e("steps", "verdict"),
    e("steps", "schedule"),
    e("verdict", "alt", "compare"),
    e("records", "schedule", "typical times", { dashed: true }),
    e("sources", "findings", "cites", { dashed: true, out: "bottom", in: "right" }),
  ],
};
