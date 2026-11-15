import { e, n, type Flow } from "./types";

export const VERDICT: Flow = {
  slug: "verdict",
  title: "Verdict and deciders",
  blurb: "How the headline answer is added up from the findings and the steps.",
  intro:
    "The verdict is deliberately plain arithmetic over what the other parts have already produced: it counts, sums and lists, and adds no judgement of its own. " +
    "Next to it, two small functions name who holds the decision, for the route bar and for hearing prep.",
  shows: [{ href: "/project", label: "Check" }, { href: "/summary", label: "Summary" }, { href: "/hearing", label: "Hearing prep" }],
  nodes: [
    n("find", "data", "Findings", 0.2, 0, "The law check's list for this project and route.", { to: { href: "/engine/findings", label: "Law check" }, where: ["lib/engine.ts#analyze"] }),
    n("steps", "data", "Numbered steps", 2.2, 0, "The route's steps for this site.", { to: { href: "/engine/steps", label: "Route steps" } }),
    n("facts", "data", "Project facts", 4.2, 0, "The state-permit triggers entered or applied from the lookup.", {}),

    n("fails", "step", "fails and flags", 0.2, 1.3, "fails are the findings with status fail: something that blocks the project as entered. flags are the ones with status flag: open, to be settled with the town or by relief. Info and pass are not counted.", { where: ["lib/engine.ts#verdict"] }),
    n("days", "step", "reviewDays", 2.2, 1.3, "The sum of the statutory town review clocks of the main-line steps, in days. Branch steps (a zone change, the appeal) are left out, and so are steps with no clock.", { where: ["lib/engine.ts#verdict"], note: "A statutory maximum, not a forecast. The schedule lays the steps out in time, and the records show what has taken." }),
    n("perm", "step", "statePermits", 4.2, 1.3, "Wetlands (CRMC or RIDEM, by the jurisdiction layer), RIPDES stormwater at one acre or more, RIDEM septic with no public sewer, and RIDOT road access. The same triggers as the state-permits finding.", { where: ["lib/engine.ts#verdict"], note: "Debt 19: the State permits step still names RIDEM as the decider where CRMC is." }),

    n("v", "output", "Verdict: fails, flags, reviewDays, statePermits", 2.2, 2.7, "The headline in the project bar and the printed summary. It is shown with the facts it rests on, and never as a score.", { where: ["lib/engine.ts#Verdict"], note: "Principle 3: no more precision than the data has." }),

    n("dec", "step", "deciders: who holds each step", 0.8, 4.3, "For each main-line step, in order, the first authority whose condition holds. A step whose authorities do not decide an application there (it has a \"Rules set by\" label) is skipped, and an authority already named is not repeated.", { where: ["lib/engine.ts#deciders"], note: "Principle 1: who decides is on the first line of every step." }),
    n("hb", "step", "hearingBody: where the public hearings are", 3.6, 4.3, "The authority of the first main-line step that has likely questions attached. Defaults to the Planning Board.", { where: ["lib/engine.ts#hearingBody"] }),
    n("rb", "output", "The route bar", 0.8, 5.6, "The sequence of deciders as coloured marks, each by kind: elected, appointed, staff, state, utility.", { where: ["components/Authority.tsx"] }),
    n("hp", "output", "Hearing prep", 3.6, 5.6, "Which board's hearing the questions and the hearing sheet are written for.", { to: { href: "/hearing", label: "Open Hearing prep" } }),
  ],
  edges: [
    e("find", "fails"), e("steps", "days"), e("facts", "perm"),
    e("fails", "v"), e("days", "v"), e("perm", "v"),
    e("steps", "dec", undefined, { dashed: true, out: "left", in: "top" }),
    e("steps", "hb", undefined, { dashed: true, out: "right", in: "top" }),
    e("dec", "rb"), e("hb", "hp"),
  ],
};
