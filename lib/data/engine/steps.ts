import { e, n, type Flow } from "./types";

export const STEPS: Flow = {
  slug: "steps",
  title: "Route steps",
  blurb: "How the list of steps, documents and deciders is built for a route and a town.",
  intro:
    "A route is a list of steps, each with the application filed, who decides it, its statutory clock and its documents. The list starts from state law, is cleaned of Cumberland's wording for any other town, is replaced or extended by the town's own steps where they have been read, and is then filtered to the steps that apply to this site and numbered.",
  shows: [{ href: "/route", label: "Route & people" }, { href: "/law", label: "Check" }],
  nodes: [
    n("in", "data", "Route and flags", 2, 0, "The route (a TreeId) and the condition flags, with the town of the project on screen.", { to: { href: "/engine/flags", label: "Condition flags" }, where: ["lib/engine.ts#stepsFor"] }),
    n("base", "step", "The route's state-law steps", 2, 1.2, "TREES holds each route's steps: what is filed, who decides, the statutory clock, the documents with their sources and checklists. Cumberland's local detail is still inside them (debt 1).", { where: ["lib/data/trees.ts#TREES", "lib/engine.ts#routeSteps"], note: "The five routes are major, minor, comp, dpr and byright." }),
    n("cum", "decision", "Is the town Cumberland?", 2, 2.4, "Cumberland's steps are the pilot, read in full. For any other town the steps are cleaned first.", { where: ["lib/engine.ts#forTown"] }),
    n("keep", "step", "Steps as they are", 4.2, 3.6, "Cumberland's title, wording, clocks and documents are used unchanged.", {}),
    n("fort", "step", "Clean for another town (forTown)", 0.4, 3.6, "Drops the master plan stage for comprehensive permits, which is Cumberland's own practice. Replaces Cumberland's wording in a step's description with \"State law sets this stage; the town's own requirements have not been read yet\", and marks the clock \"Cumberland's local figure; confirm yours\". Keeps a document only if its source is state law or statewide data.", { where: ["lib/engine.ts#forTown", "lib/engine.ts#STATEWIDE_SRC"], note: "Debt 1 and 5: this works by matching the word \"Cumberland\" and a list of source-id patterns, and state-law steps still say \"Town Council\" and \"Town Clerk\" in cities." }),
    n("own", "decision", "Does the town have its own steps for this route?", 0.4, 4.9, "Providence has minor, major and development plan review. A route the town has not read keeps the cleaned state-law steps.", { town: true, where: ["lib/data/towns/overlay.ts#townSteps"] }),
    n("mine", "town", "Town's steps, then the state steps left over", 0, 6.2, "The town's whole steps come first, in its order. State-law steps follow unless the town's steps have the same id, or the town omits them (Providence's administrative review has no final stage). The building permit and occupancy stay as state law.", { where: ["lib/engine.ts#routeSteps"], note: "ARD D1: whole steps, not merged field by field. D15: a town can drop a state step." }),
    n("state", "step", "The cleaned state-law steps", 1.8, 6.2, "The state-law route with Cumberland's detail removed.", {}),
    n("filt", "decision", "Does the step's condition hold?", 2, 7.6, "condOK on the step's own condition and the flags. Only the zone change petition carries one (rezone).", { where: ["lib/engine.ts#condOK"] }),
    n("num", "step", "Number the steps", 2, 8.8, "Main-line steps are 1, 2, 3 and so on. The zone change is 1a, and other branch steps (the appeal) are marked with an arrow instead of a number.", { where: ["lib/engine.ts#stepsFor"] }),
    n("out", "output", "NumberedStep[]", 2, 10, "The steps the Check, Steps and Schedule pages show, and the verdict and schedule take as input.", { to: { href: "/route", label: "Open the Steps page" } }),

    n("docs", "step", "Inside each step: documents", 4.5, 8.8, "A document is shown if its own condition holds. Each carries a source, a pinpoint and a quote where one was read, and a checklist of practical considerations (guidance, not law). Hidden ones are counted on the step.", { where: ["lib/engine.ts#visibleDocs"], to: { href: "/engine/sources", label: "How claims are traced" } }),
    n("auth", "step", "Inside each step: who decides", 4.5, 10, "The authorities are listed with their roles, filtered the same way. A step whose authorities do not decide an application there (they set the rules) says \"Rules set by\" instead of \"Decided by\".", { where: ["components/RouteFlow.tsx", "lib/data/contacts.ts"], note: "Principle 1: who decides is on the first line of every step." }),
  ],
  edges: [
    e("in", "base"), e("base", "cum"),
    e("cum", "keep", "yes", { out: "right", in: "top" }), e("cum", "fort", "no", { out: "left", in: "top" }),
    e("fort", "own"),
    e("own", "mine", "yes", { out: "bottom", in: "top" }), e("own", "state", "no", { out: "right", in: "top" }),
    e("keep", "filt", undefined, { out: "bottom", in: "right" }),
    e("mine", "filt", undefined, { out: "bottom", in: "left" }), e("state", "filt"),
    e("filt", "num", "yes"), e("num", "out"),
    e("out", "docs", undefined, { dashed: true, out: "right", in: "bottom" }),
    e("docs", "auth", undefined, { dashed: true }),
  ],
};
