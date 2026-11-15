import { e, n, type Flow } from "./types";

export const USE_DENSITY: Flow = {
  slug: "use-density",
  title: "Use and density",
  blurb: "Is the use allowed in the district, and does the lot have room for it.",
  intro:
    "Two questions about the land, answered separately. Use: is this kind of building allowed in the district, needs a hearing, or is prohibited. Density: how much lot area the unit count needs, and whether the lot has it. " +
    "Both ask the town's own reading first, and where it has none the Zoning Atlas answers, or the engine says it has no answer.",
  shows: [{ href: "/site", label: "Site selection" }, { href: "/project", label: "Check" }],
  nodes: [
    n("site", "data", "District, units and kind of project", 2.2, 0, "The zoning district (from the lookup or the picker), the unit count, the kind of project and the town.", { where: ["lib/types.ts#ProjectInputs"] }),
    n("ck", "decision", "Commercial project?", 2.2, 1.1, "Non-residential uses are answered from the town's table alone. The Atlas records housing types and nothing else.", { where: ["lib/engine.ts#useTreatment"] }),

    n("ctab", "town", "The town's use table for the use", 0.2, 2.4, "Providence, Charlestown and Cumberland have read the table of uses for the short list of commercial uses (retail, office, restaurant, light industrial, institutional). The row for the district gives allowed, public hearing or prohibited.", { town: true, where: ["lib/types.ts#TownRules", "lib/data/towns/overlay.ts#townRules"] }),
    n("cgap", "gap", "Not read: whether the use is allowed here", 0.2, 3.7, "The town's table for this use or district has not been read, so the treatment is \"unknown\" and the finding says so, naming the town's table of permitted uses as what would answer it. Nothing is passed by default.", { where: ["lib/engine.ts#commercialUseFinding"], note: "ARD D31, principle 10." }),

    n("htab", "decision", "Did the town read its use table for homes?", 3.8, 2.4, "A town read to level 3 answers the housing question from its own ordinance (Providence's July 2026 use table, Charlestown's Land Use Table).", { town: true, where: ["lib/engine.ts#useTreatment"], note: "ARD D14, D38." }),
    n("hyes", "town", "The town's answer", 2.5, 3.7, "Allowed, public hearing or prohibited, with the finding that quotes the ordinance. Where the district or row was not read the hook returns nothing and the Atlas answers.", { where: ["lib/engine.ts#withTownUse"] }),
    n("atlas", "step", "The Atlas's treatment for this housing type", 5.1, 3.7, "The Atlas field for the unit count: one-family, two-family, three-family or four or more. Its value, Allowed/Conditional, Public Hearing, Prohibited or Overlay, becomes allowed, hearing, prohibited, overlay or unknown.", { where: ["lib/data/atlas.ts#treatmentFor"], note: "A district missing from the Atlas, or a 2024 district the ordinance has since dropped, gives unknown." }),
    n("treat", "output", "Treatment: allowed, hearing, prohibited or unknown", 2.5, 5, "Feeds the relief flag (a hearing or prohibition means relief is needed unless the route is a zone change or comprehensive permit) and the first finding of the law check. Under a comprehensive permit, a prohibition is open and not a blocker, since the permit can grant the adjustment.", { to: { href: "/engine/flags", label: "Condition flags" } }),

    n("dstart", "data", "Lot area, units and utilities", 0, 6.4, "The lot area entered, the unit count, whether public water and sewer reach the site, and whether the project is a conservation development.", { where: ["lib/types.ts#ProjectInputs"] }),
    n("m", "decision", "Mixed use in Cumberland C-1 or C-2?", 2.2, 6.4, "Cumberland's ordinance gives mixed-use buildings in these two districts their own density, so there is no lot-area figure here.", { where: ["lib/engine.ts#requiredArea"] }),
    n("m1", "town", "Checked with the commercial space", 4.7, 6.4, "One unit per 5,000 sq ft of land with public sewer, 7,000 with water only, 10,000 with neither (§ 5-3 notes). The lot is compared with units times that figure instead.", { where: ["lib/data/towns/cumberland/commercial.ts#cumberlandMixedArea"], note: "ARD D33." }),
    n("c", "decision", "Conservation layout with a bonus density?", 2.2, 7.6, "A cluster layout that keeps at least 25% of the upland as open space, in exchange for a higher density. Chosen by the applicant.", { where: ["lib/engine.ts#requiredArea"] }),
    n("c1", "step", "Area from the bonus density", 4.7, 7.6, "Units divided by the Atlas's units per acre \"if PRD\", or the PRD minimum lot, whichever is larger, times 43,560 sq ft per acre. The basis is recorded as riza-prd.", { where: ["lib/engine.ts#requiredArea"] }),
    n("o", "decision", "Cumberland R-2 (up to 2 units) or R-3?", 2.2, 8.8, "Cumberland's own ordinance formulas apply in these cases only.", { where: ["lib/engine.ts#requiredArea"] }),
    n("o1", "town", "Cumberland's lot-area-per-unit rule", 4.7, 8.8, "With public water and sewer: 10,000 sq ft for the first unit plus 5,000 for each more (R-2 up to 2 units, R-3). With one utility, R-3: 30,000 plus 10,000 for each more. With neither: no figure, and the finding warns of a much larger requirement. The Atlas's own figure is shown beside it when they differ by more than 1,000 sq ft.", { where: ["lib/engine.ts#requiredArea", "lib/engine.ts#analyzeRaw"], note: "Cumberland Zoning Art. 3. Debt 1: still inside engine.ts, not the town's folder." }),
    n("a", "decision", "Atlas has a density or minimum lot?", 2.2, 10, "Read for the site's utilities: both water and sewer, one of them, or neither.", { where: ["lib/data/atlas.ts#readByUtility"] }),
    n("a1", "step", "Area from the Atlas density", 4.7, 10, "Units divided by the Atlas's maximum units per acre, or the minimum lot, whichever is larger, times 43,560. The basis is recorded as riza.", { where: ["lib/engine.ts#requiredArea"] }),
    n("none", "gap", "No density figure", 0, 10, "Nothing is checked, and the page does not pass the lot. The Atlas has no figure for the district, so the density finding is left out and the lot-area check does not run.", { note: "Principle 10." }),

    n("cmp", "step", "Compare: does the lot have the area?", 4.7, 11.3, "The lot entered, in square feet, against the area needed. A shortfall sets densityFail, and the finding says by how much and what could close it: relief, fewer units, a conservation layout or a comprehensive permit's density bonus.", { where: ["lib/engine.ts#deriveFlags"] }),
    n("max", "step", "Most units the lot supports", 2.2, 11.3, "Tries 1 to 300 units, keeps the largest count whose area fits the lot and whose use is allowed, and stops at the first count that does not fit. Returns 0 where no rule is known. Used by the alternatives.", { where: ["lib/engine.ts#maxUnits"], to: { href: "/engine/alternatives", label: "Alternatives" } }),
    n("done", "output", "densityFail", 4.7, 12.5, "True when a rule exists and the lot falls short. Together with the treatment it sets the relief flag.", { to: { href: "/engine/flags", label: "Condition flags" } }),
  ],
  edges: [
    e("site", "ck"),
    e("ck", "ctab", "yes"), e("ck", "htab", "no"),
    e("ctab", "cgap", "no row"),
    e("ctab", "treat", "row read", { out: "right", in: "left" }),
    e("htab", "hyes", "yes"), e("htab", "atlas", "no"),
    e("hyes", "treat"), e("atlas", "treat", undefined, { out: "bottom", in: "right" }),
    e("cgap", "treat", "unknown", { dashed: true, out: "right", in: "bottom" }),

    e("dstart", "m"),
    e("m", "m1", "yes"), e("m", "c", "no"),
    e("c", "c1", "yes"), e("c", "o", "no"),
    e("o", "o1", "yes"), e("o", "a", "no"),
    e("a", "a1", "yes"), e("a", "none", "no"),
    e("m1", "cmp", undefined, { out: "right", in: "right" }),
    e("c1", "cmp", undefined, { out: "right", in: "right" }),
    e("o1", "cmp", undefined, { out: "right", in: "right" }),
    e("a1", "cmp"),
    e("cmp", "done"), e("cmp", "max", "also", { dashed: true }),
  ],
};
