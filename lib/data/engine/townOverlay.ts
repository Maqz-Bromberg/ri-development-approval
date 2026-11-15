import { e, n, type Flow } from "./types";

export const TOWN_OVERLAY: Flow = {
  slug: "town-overlay",
  title: "Town overlay",
  blurb: "How a town's own reading is laid over state law, and what is claimed for each town.",
  intro:
    "State law is the base: the five routes, the statutory clocks, appeals. A town's reading is laid over it through a set of optional hooks. Each part of the engine asks the town's hook first; where the hook has an answer it is used, and where it returns nothing the engine falls back to state law, the Zoning Atlas, or a named gap. " +
    "Separately, a coverage level says how much of each town has been read, so the site never claims more than it has.",
  shows: [{ href: "/towns", label: "Towns and coverage" }],
  nodes: [
    n("ask", "data", "A part of the engine needs the town's rule", 2, 0, "Route classification, use, steps, findings and schedule each call the town's table with the town of the project on screen.", { where: ["lib/data/towns/overlay.ts"] }),
    n("has", "decision", "Is the town in the tables?", 2, 1.1, "Three towns are: Providence (steps, route rule, use table, findings, schedule), Cumberland (its commercial rules; its housing rules are still inside trees.ts) and Charlestown (use table and two overlays). A town that is absent gets state law only.", { where: ["lib/data/towns/overlay.ts#townRules"], note: "Debt 1: Cumberland's housing steps are not yet in their own folder, so engine.ts strips them for other towns by matching the word \"Cumberland\" and a list of source ids." }),
    n("state", "step", "State law and the Atlas only", 0, 2.4, "Level 1: the Zoning Atlas district, parcel and utilities, the route under state law, and its statutory clocks. Steps are the state-law ones with Cumberland's wording and documents taken out (forTown). The page says the town's own requirements have not been read.", { where: ["lib/engine.ts#forTown", "lib/data/towns.ts#LEVELS"] }),
    n("hooks", "town", "TownRules: the hooks", 3, 1.9, "classify and classifyCommercial (the route), use and useCommercial (is it allowed), overlayRules (overlay districts), commercialFindings and commercialRoute, commercialLines, omit (state steps the town does not have), permitsBefore (the stage by which state permits must be in hand), asksCommercial, routeText, kinds, unmappedOverlays, retired. Steps, findings and schedules sit beside it in their own tables.", { where: ["lib/types.ts#TownRules"] }),

    n("h1", "town", "Route", 0.6, 3.5, "classify and classifyCommercial. Providence counts new floor area and sorts 4 to 9 new units into administrative review; the state default sorts by unit count and affordability.", { where: ["lib/engine.ts#classify"], to: { href: "/engine/route", label: "Route classification" }, note: "ARD D2: state law lets a town raise the minor thresholds, so the route rule is per town." }),
    n("h2", "town", "Use", 1.8, 3.5, "use and useCommercial. A town's own use table answers in place of the Atlas where it was read (Providence, Charlestown, and Cumberland for commercial uses).", { where: ["lib/engine.ts#useTreatment"], to: { href: "/engine/use-density", label: "Use and density" }, note: "ARD D14 and D38." }),
    n("h3", "town", "Steps", 3, 3.5, "A town supplies whole steps for a route. They replace the state-law steps; state-law steps the town does not cover (building permit, occupancy) follow them, and omit drops a state step the town does not have.", { where: ["lib/data/towns/overlay.ts#townSteps", "lib/engine.ts#routeSteps"], to: { href: "/engine/steps", label: "Route steps" }, note: "ARD D1 and D15." }),
    n("h4", "town", "Findings", 4.2, 3.5, "A findings function reworks the generic list for the town; overlayRules and commercialFindings add the overlay and non-residential findings.", { where: ["lib/data/towns/overlay.ts#townFindings"], to: { href: "/engine/findings", label: "Law check" } }),
    n("h5", "town", "Schedule", 5.4, 3.5, "The town's own durations and key moments for a step, its permit gate, and its board calendar.", { where: ["lib/data/towns/overlay.ts#townPlan", "lib/calendar.ts#calendarFor"], to: { href: "/engine/schedule", label: "Schedule" }, note: "ARD D10: Cumberland wants state permits before the preliminary plan, Providence before the final." }),

    n("ans", "decision", "Does the hook return an answer?", 3, 5, "Every hook is optional, and most can return null for a case the town's reading does not cover (a use row or district that was not read).", { where: ["lib/engine.ts#withTownUse"] }),
    n("use", "output", "The town's reading is used", 1.5, 6.3, "The town's answer replaces the default. Until the planning office confirms it, a town's reading carries a trial mark that travels to the page.", { note: "ARD D11: nobody has been asked yet, so Providence and Charlestown are trial readings." }),
    n("fall", "gap", "Fall back: state law, the Atlas, or a named gap", 4.5, 6.3, "Not an error and not a pass: the default answers where there is one, and where none exists (a commercial use, an unread overlay) the finding says \"Not read\" and names the document that would answer it.", { note: "Principle 10: a gap is shown, not hidden." }),

    n("cov", "data", "Coverage level, per town, kind and part", 0, 0.1, "Levels 1 to 4: zoning only; offices and records; local steps; hearings and precedent. Homes and commercial are levelled separately, and a part of a town can be read further than the rest. A level is claimed only as read, with a date.", { where: ["lib/data/towns.ts#coverageFor", "lib/data/towns.ts#levelAt"], to: { href: "/towns", label: "The 39 towns and their levels" }, note: "Principle 9. Debt 20: the levels do not express a town whose zoning is read but whose steps are not (Charlestown)." }),
  ],
  edges: [
    e("ask", "has"),
    e("has", "state", "no", { out: "left", in: "top" }),
    e("has", "hooks", "yes"),
    e("hooks", "h1"), e("hooks", "h2"), e("hooks", "h3"), e("hooks", "h4"), e("hooks", "h5"),
    e("h1", "ans"), e("h2", "ans"), e("h3", "ans"), e("h4", "ans"), e("h5", "ans"),
    e("ans", "use", "yes"), e("ans", "fall", "null"),
    e("cov", "state", "labels", { dashed: true, out: "bottom", in: "top" }),
  ],
};
