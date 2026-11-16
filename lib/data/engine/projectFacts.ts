import { e, n, type Flow } from "./types";

export const PROJECT_FACTS: Flow = {
  slug: "project-facts",
  title: "Project facts",
  blurb: "Where the facts come from, how they are held, and what is derived from them.",
  intro:
    "One record, ProjectInputs, is everything the engine is given. Four sources can fill it; it is completed with defaults, held in the browser, and handed to the engine, which recomputes the route, flags and steps on every change. " +
    "Nothing leaves the browser: a project is kept by share link and file, and browser storage is a convenience.",
  shows: [{ href: "/site", label: "Site" }, { href: "/law", label: "Check" }],
  nodes: [
    n("example", "data", "The example project", 0, 0, "A ten-unit homes project in Cumberland's R-3 district, so the first visit shows a worked answer. It says it is an example wherever the answer is shown.", { where: ["lib/engine.ts#DEFAULT_INPUTS"], note: "Principle 2: an answer is never shown apart from the facts it rests on." }),
    n("lookup", "data", "Site lookup", 1, 0, "Town, district, overlays, utilities, parcel, tribal land and wetlands agency from public map layers.", { to: { href: "/engine/site-lookup", label: "How the lookup works" } }),
    n("form", "data", "The form", 2, 0, "The applicant types or corrects: kind of project, units, affordable units, lot area, acres disturbed, the state-permit triggers, and for commercial projects the use and floor area. The form asks only for what the kind and the town need.", { where: ["components/IntakeForm.tsx"] }),
    n("saved", "data", "Share link, file or saved site", 3, 0, "A link carries the project in the part of the address after the #, which a server never receives. A file or a saved site (kept in this browser) is the same record. A project in a link wins over the one saved in the browser.", { where: ["lib/share.ts", "components/ProjectProvider.tsx"], note: "ARD D26 and D28." }),

    n("norm", "step", "Fill the gaps with defaults", 1.5, 1.2, "A project from storage, a link or a file may lack facts added since it was saved. It is merged over the defaults. A project saved before kinds existed that had commercial floor area is read as a mixed-use one.", { where: ["lib/engine.ts#normalizeInputs"] }),
    n("inputs", "data", "ProjectInputs", 1.5, 2.4, "The record. The kind (homes, homes with commercial space, commercial) decides which facts count: a homes project ignores commercial floor area, and a commercial project ignores units. Dates are ISO days, parsed as UTC so schedules do not shift with the viewer's timezone.", { where: ["lib/types.ts#ProjectInputs"] }),

    n("active", "step", "Set the active town", 0, 3.6, "Before anything renders, the provider writes the town to a module variable that the engine, the Atlas lookup and the contacts all read, so none of them takes a town argument.", { where: ["lib/town.ts#setActiveTown"], note: "Debt 2: it works because one project is on screen. A page comparing two towns would break it." }),
    n("override", "decision", "Route chosen by the visitor?", 3, 3.6, "The visitor can pick a route other than the one the facts give. The route used is that choice, or the engine's own when none is made.", { where: ["components/ProjectProvider.tsx"] }),
    n("persist", "step", "Keep it", 4.2, 3.6, "On every change the project (facts, route choice, ticked considerations, notes, hearing picks) is written to this browser's storage. A link packs only the facts that differ from the defaults, as base64url, so links stay short.", { where: ["lib/share.ts#pack", "components/ProjectProvider.tsx"] }),

    n("derive", "step", "Recompute: route, flags, steps", 1.5, 4.9, "Memoised on the facts: classify gives the route, deriveFlags the flags, stepsFor the steps; progress counts ticked considerations. Then the pages ask for findings, schedule and verdict from these.", { where: ["components/ProjectProvider.tsx#ProjectProvider"], to: { href: "/engine/route", label: "Route classification" } }),
    n("pages", "output", "The pages", 1.5, 6.1, "Check, Steps, Schedule, Hearing prep and the printed summary all read the same state, so they cannot disagree.", { to: { href: "/law", label: "Open the Check page" } }),
  ],
  edges: [
    e("example", "norm"), e("lookup", "norm"), e("form", "norm"), e("saved", "norm"),
    e("norm", "inputs"),
    e("inputs", "active", undefined, { out: "left", in: "top" }),
    e("inputs", "override", undefined, { out: "right", in: "top" }),
    e("inputs", "persist", "saves", { dashed: true, out: "right", in: "top" }),
    e("active", "derive"), e("override", "derive"),
    e("derive", "pages"),
  ],
};
