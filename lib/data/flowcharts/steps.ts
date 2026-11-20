import { e, n, type Flow } from "./types";

export const STEPS: Flow = {
  slug: "steps",
  title: "Route steps",
  blurb: "How the list of steps, documents and deciders is built for a route and a town.",
  intro:
    "A route is a list of steps, each with the application filed, who decides it, its statutory clock and its documents. The list starts from state law, is replaced or extended by the town's own steps where they have been read, gains any steps the town inserts for its review areas, and is then filtered to the steps that apply to this site and numbered.",
  shows: [{ href: "/route", label: "Route & people" }, { href: "/law", label: "Check" }],
  nodes: [
    n("in", "data", "Route and flags", 2, 0, "The route (a TreeId) and the condition flags, with the town of the project on screen.", { to: { href: "/engine/flags", label: "Condition flags" }, where: ["lib/engine.ts#stepsFor"] }),
    n("base", "step", "The route's state-law steps", 2, 1.2, "TREES holds each route's state-law steps: what is filed, who decides, the statutory clock, the documents state law requires with their sources and checklists. A town's own steps, Cumberland's among them, are in its folder (debt 1, eased 2026-11-18).", { where: ["lib/data/state/trees.ts#TREES", "lib/engine.ts#routeSteps"], note: "The five routes are major, minor, comp, dpr and byright." }),
    n("own", "decision", "Does the town have its own steps for this route?", 2, 2.4, "Cumberland has all five routes, read in full; Providence has minor, major and development plan review. A route the town has not read keeps the state-law steps, with the town's name put in where a step names it.", { town: true, where: ["lib/data/towns/overlay.ts#townSteps", "lib/engine.ts#forTown"] }),
    n("mine", "town", "Town's steps, then the state steps left over", 0.4, 3.6, "The town's whole steps come first, in its order. State-law steps follow unless the town's steps have the same id, or the town omits them (Providence's administrative review has no final stage). The building permit and occupancy stay as state law.", { where: ["lib/engine.ts#routeSteps"], note: "ARD D1: whole steps, not merged field by field. D15: a town can drop a state step." }),
    n("state", "step", "The state-law steps", 4.2, 3.6, "The state-law route as it stands, for a town whose steps for it were not read.", {}),
    n("extra", "town", "Steps the town inserts", 2, 4.9, "A town can add a step to every route, placed before a named step: Providence's certificate of appropriateness in a historic district, Westerly's aquifer protection permit and airport overlay review. Each carries its own condition, so it shows only where the site's overlays set it.", { town: true, where: ["lib/engine.ts#routeSteps"], note: "ARD D53: review areas found by the lookup on the town's own map layers set flags (TownRules.overlayFlags)." }),
    n("filt", "decision", "Does the step's condition hold?", 2, 6.2, "condOK on the step's own condition and the flags: either of several (a|b), or not one (!a). The zone change petition, a town's inserted steps and Providence's downtown design review carry one; the staff review there carries !ddrc, so one replaces the other.", { where: ["lib/engine.ts#condOK"] }),
    n("num", "step", "Number the steps", 2, 7.5, "Main-line steps are 1, 2, 3 and so on. The zone change is 1a, and other branch steps (the appeal) are marked with an arrow instead of a number.", { where: ["lib/engine.ts#stepsFor"] }),
    n("out", "output", "NumberedStep[]", 2, 8.8, "The steps the Check, Steps and Schedule pages show, and the verdict and schedule take as input.", { to: { href: "/route", label: "Open the Steps page" } }),

    n("docs", "step", "Inside each step: documents", 4.5, 7.5, "A document is shown if its own condition holds. Each carries a source, a pinpoint and a quote where one was read, and a checklist of practical considerations (guidance, not law). Hidden ones are counted on the step.", { where: ["lib/engine.ts#visibleDocs"], to: { href: "/engine/sources", label: "How claims are traced" } }),
    n("auth", "step", "Inside each step: who decides", 4.5, 8.8, "The authorities are listed with their roles, filtered the same way. A step whose authorities do not decide an application there (they set the rules) says \"Rules set by\" instead of \"Decided by\".", { where: ["components/RouteFlow.tsx", "lib/data/contacts.ts"], note: "Principle 1: who decides is on the first line of every step." }),
  ],
  edges: [
    e("in", "base"), e("base", "own"),
    e("own", "mine", "yes", { out: "left", in: "top" }), e("own", "state", "no", { out: "right", in: "top" }),
    e("mine", "extra", undefined, { out: "bottom", in: "left" }), e("state", "extra", undefined, { out: "bottom", in: "right" }),
    e("extra", "filt"),
    e("filt", "num", "yes"), e("num", "out"),
    e("out", "docs", undefined, { dashed: true, out: "right", in: "bottom" }),
    e("docs", "auth", undefined, { dashed: true }),
  ],
};
