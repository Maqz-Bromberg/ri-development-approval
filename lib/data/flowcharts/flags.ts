import { e, n, type Flow } from "./types";

export const FLAGS: Flow = {
  slug: "flags",
  title: "Condition flags",
  blurb: "Ten true-or-false facts that decide which steps, documents and deciders apply.",
  intro:
    "The engine does not hold a separate list of steps for each kind of site. It holds one list per route, and every step, document and authority may carry a condition written in the flags. " +
    "The flags are derived once from the project and the route, and everything that is shown is filtered through them. A condition \"a|b\" holds when either flag is true.",
  shows: [{ href: "/route", label: "Route & people" }],
  nodes: [
    n("facts", "data", "Site facts", 0.4, 0, "Wetlands present, state road access, acres disturbed, public water, public sewer, near frequent transit, zone change needed.", { where: ["lib/types.ts#ProjectInputs"], to: { href: "/engine/project-facts", label: "Project facts" } }),
    n("treat", "data", "Use treatment", 2.4, 0, "Allowed, hearing, prohibited or unknown, from the town's table or the Atlas.", { to: { href: "/engine/use-density", label: "Use and density" }, where: ["lib/engine.ts#useTreatment"] }),
    n("need", "data", "Area the units need", 4, 0, "The lot area the unit count needs under the density rule, or none where no rule is known; for mixed use in Cumberland's commercial districts, units times the per-unit area.", { to: { href: "/engine/use-density", label: "Use and density" }, where: ["lib/engine.ts#requiredArea"] }),
    n("tree", "data", "Route", 5.6, 0, "The route in use, which is the visitor's choice if there is one.", { to: { href: "/engine/route", label: "Route classification" } }),

    n("direct", "step", "Straight from the facts", 0.4, 1.3, "wet, dot (state road) and transit, rezone, pubwater and pubsewer are the facts themselves. acre is true when the disturbed area is one acre or more. septic is true when there is no public sewer, since an onsite system needs RIDEM's approval. always is true.", { where: ["lib/engine.ts#deriveFlags"], note: "ARD D39 added septic." }),
    n("userelief", "step", "Use needs relief", 2.4, 1.3, "The use is prohibited, or allowed only after a public hearing.", { where: ["lib/engine.ts#deriveFlags"] }),
    n("dfail", "step", "Lot is short", 4, 1.3, "A density rule exists and the lot area is below it.", { where: ["lib/engine.ts#deriveFlags"] }),

    n("relief", "decision", "relief: use or density needs it", 3.2, 2.6, "True when the route is not a zone change or a comprehensive permit, and either the use needs relief or the lot is short. In other words, the project needs relief the route does not already give. A zone change is the relief for use; a comprehensive permit can grant both. It switches on the unified development review request at the master plan stage, and the changes to relief granted at master plan at the preliminary stage.", { where: ["lib/engine.ts#deriveFlags"], note: "Debt 4: the flag assumes the state's definitions, which Providence's dimensional adjustments do not fit." }),

    n("rec", "data", "Flags", 2.4, 3.9, "wet, dot, acre, septic, pubwater, pubsewer, transit, rezone, relief, always.", { where: ["lib/types.ts#Flags", "lib/engine.ts#deriveFlags"] }),
    n("cond", "decision", "condOK: does any named flag hold?", 2.4, 5.1, "A condition is a list of flag names joined by |. No condition means always. This is the one test every filter below uses.", { where: ["lib/engine.ts#condOK"] }),

    n("steps", "output", "Steps shown", 0.2, 6.4, "A step with a condition is dropped when it does not hold. The zone change petition is the one that needs rezone, and it is drawn as a branch off the main line.", { where: ["lib/engine.ts#stepsFor"], to: { href: "/engine/steps", label: "Route steps" } }),
    n("docs", "output", "Documents shown", 1.9, 6.4, "A document with a condition is hidden when it does not hold: the RIDEM wetlands determination needs wet, the stormwater permit acre, the septic approval septic, the RIDOT permit dot, the parking cap transit, and the unified development review request relief.", { where: ["lib/engine.ts#visibleDocs"] }),
    n("auth", "output", "Deciders shown", 3.6, 6.4, "An authority with a condition is listed only when it holds: the water and sewer offices need public water or sewer, RIDEM needs wet, acre or septic, and RIDOT needs a state road. The deciders for the headline come from the same test.", { where: ["lib/engine.ts#deciders"], to: { href: "/engine/verdict", label: "Verdict and deciders" } }),
    n("hid", "gap", "Hidden, and said so", 5.3, 6.4, "A step lists how many conditional items it hides because they do not apply to the facts entered, so a missing document is never silent.", { where: ["components/RouteFlow.tsx"], note: "Principle 10." }),
  ],
  edges: [
    e("facts", "direct"), e("treat", "userelief"), e("need", "dfail"),
    e("userelief", "relief"), e("dfail", "relief"), e("tree", "relief", undefined, { out: "bottom", in: "right" }),
    e("direct", "rec"), e("relief", "rec"),
    e("rec", "cond"),
    e("cond", "steps"), e("cond", "docs"), e("cond", "auth"), e("cond", "hid"),
  ],
};
