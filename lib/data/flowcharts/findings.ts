import { e, n, type Flow } from "./types";

export const FINDINGS: Flow = {
  slug: "findings",
  title: "Law check",
  blurb: "How a project is read against the rules, and how findings keep their sources and their gaps.",
  intro:
    "The law check returns a list of findings. Each has a status (pass, flag, fail or info), a title and an explanation, and where the rule was read, the document, the pinpoint and the quote it rests on. " +
    "Where a rule has not been read, the finding is a named gap and says what would answer it. The list is assembled in layers: tribal land stops it, then the kind of project and the town decide the base list, then overlays, septic and wetlands add to it.",
  shows: [{ href: "/law", label: "Check" }, { href: "/summary", label: "Summary" }],
  nodes: [
    n("in", "data", "Project, route and town", 2.2, 0, "The facts and the route (a TreeId). Called for the page on every change.", { where: ["lib/engine.ts#analyze"] }),
    n("res", "decision", "Is the site on tribal land?", 2.2, 1.1, "Set by the site lookup from the Atlas's Native Lands layer.", { where: ["lib/engine.ts#analyze"] }),
    n("resy", "gap", "One finding, and nothing else is run", 4.8, 1.1, "\"Not the town's zoning: the site is on\" the named reservation or tribal land. Whose rules govern, and who decides, is not read here, so the town's zoning is not run as if it applied.", { note: "ARD D38. Debt 18: the steps and schedule still show the ordinary route.", where: ["lib/engine.ts#analyze"] }),
    n("com", "decision", "Commercial project?", 2.2, 2.3, "Non-residential projects have their own list of findings.", { where: ["lib/engine.ts#analyzeBase"] }),
    n("gen", "step", "The state-law housing findings", 4.8, 2.3, "stateFindings: the review category and what it sets; the permitted use from the Atlas; public water required; density, from the town's own lot-area rule where it has one, else the Atlas; parking (two a home assumed, and said to be, where the Atlas has no figure) and height; the comprehensive permit's affordability line, or a note to check the town's inclusionary zoning; the state permits the facts trigger, with the town's rule on when they are due where it was read. Each carries a key (use, density, parking and so on), so a town can replace or amend one without matching its words.", { where: ["lib/engine.ts#stateFindings", "lib/engine.ts#statePermitFinding"], note: "ARD debt 1, cleared 2026-11-20: the list was Cumberland's reading, neutralised for other towns by string matching." }),

    n("comm", "step", "Commercial findings", 0.2, 3.5, "The route, in the town's own lines or the state's; a named gap if the town's regulations were not read for non-residential size; the use finding from the town's table, or \"Not read\"; a note that schools and hospitals may get development plan review; the town's parking, height and dimensions, or a gap; and the state permits triggered.", { where: ["lib/engine.ts#analyzeCommercial"], note: "ARD D30, D31.", town: true }),
    n("tf", "decision", "Does the town have its own findings?", 2.2, 3.5, "Providence's function takes the state-law list and reworks it, including its own use table and parking. Cumberland's adds its ordinance (parking, inclusionary zoning) and its precedent (Blackstone Residences, Berkeley Mill, Haley's Commons).", { where: ["lib/data/towns/overlay.ts#townFindings"], town: true }),
    n("tfy", "town", "The town's findings", 1, 4.8, "The town's function is given the state-law list, the route, the district and the lot area worked out, and returns the list to use. It matches findings by their key.", { where: ["lib/data/towns/providence/rules.ts#providenceFindings", "lib/data/towns/cumberland/rules.ts#cumberlandFindings"] }),
    n("tfn", "step", "The state-law list, with the town's use table swapped in", 3.4, 4.8, "Where the town read its use table, the findings drawn from the Atlas's use columns are removed and the town's finding takes their place. Under a comprehensive permit a prohibition is only a flag, since the permit can grant the adjustment.", { where: ["lib/engine.ts#withTownUse"], note: "ARD D14, D38." }),

    n("mix", "step", "Homes with commercial space add their own", 2.2, 6.1, "The state's mixed-use line (up to 6 units and 2,500 sq ft of commercial space is minor), the commercial use finding for the commercial part, and the town's commercial findings for it. Beyond the line the finding says the town may review it as major.", { where: ["lib/engine.ts#mixedFindings"], note: "Debt 16." }),
    n("ov", "step", "One finding for each overlay district", 2.2, 7.3, "An overlay changes the base district's rules. Where the town has read the overlay's article its findings are used (Charlestown's); otherwise the finding is \"Not read: the overlay\", with the article that would answer it. A blocker among the other findings may not hold under an overlay.", { where: ["lib/engine.ts#overlayFinding", "lib/engine.ts#overlayGap"], town: true, note: "ARD D36." }),
    n("sw", "decision", "No public sewer?", 2.2, 8.5, "An onsite wastewater system needs RIDEM's approval.", { where: ["lib/engine.ts#septicFindings"] }),
    n("swy", "step", "Septic findings", 4.8, 8.5, "RIDEM's approval of the system's plans (250-RICR-150-10-6 § 6.9(C)). A large system, designed for 5,000 gallons a day or more, is probable above about 44 bedrooms at 115 gallons each. In the Salt Pond and Narrow River towns, nitrogen-reducing technology may be required, with the critical resource area maps named as a gap. Without public water as well, wellFindings adds the septic cap where wells are used (345 gallons a day per 20,000 sq ft, § 6.45) and, from seven homes, that a shared well is probably a public water system (40 C.F.R. § 141.2).", { where: ["lib/engine.ts#septicFindings", "lib/engine.ts#wellFindings"], note: "ARD D39 and D63. Whether the site is inside the critical area is not looked up." }),
    n("crmc", "decision", "Wetlands under CRMC?", 2.2, 9.7, "RIDEM's wetland jurisdiction layer puts coastal sites with CRMC, whose permit is an Assent decided by an appointed council.", { where: ["lib/engine.ts#analyze"] }),
    n("crmcy", "step", "Note that the permit is CRMC's", 4.8, 9.7, "An info finding that the wetlands permit is CRMC's and the coastal program's rules apply.", { where: ["lib/engine.ts#analyze"] }),
    n("out", "output", "Finding[]", 2.2, 10.9, "Each finding: id (set last, by withIds: its source and its title with the digits taken out, so a pin or a link survives a change of numbers), st (pass, flag, fail, info), t (what), p (why it matters), src, pin and q (the document, the section and the exact quote) and gap (what would answer it, when it was not read).", { where: ["lib/types.ts#Finding", "lib/engine.ts#withIds"], note: "ARD D42: pins and the rail point at findings by this id.", to: { href: "/engine/sources", label: "How claims are traced" } }),
  ],
  edges: [
    e("in", "res"),
    e("res", "resy", "yes"), e("res", "com", "no"),
    e("com", "comm", "yes"), e("com", "tf", "no"),
    e("gen", "tf", "the list", { dashed: true, out: "bottom", in: "right" }),
    e("tf", "tfy", "yes"), e("tf", "tfn", "no"),
    e("comm", "ov", undefined, { out: "bottom", in: "left" }), e("tfy", "mix"), e("tfn", "mix"),
    e("mix", "ov"), e("ov", "sw"),
    e("sw", "swy", "yes"), e("sw", "crmc", "no"),
    e("swy", "crmc", undefined, { out: "bottom", in: "top" }),
    e("crmc", "crmcy", "yes"), e("crmc", "out", "no"),
    e("crmcy", "out", undefined, { out: "bottom", in: "right" }),
  ],
};
