import { e, n, type Flow } from "./types";

export const RECORDS: Flow = {
  slug: "records",
  title: "Records and timelines",
  blurb: "How a past project's dated events become typical times and an approval degree.",
  intro:
    "The engine does not forecast how long a town will take. It shows what it has taken, for projects of the same town and route, as ranges computed from dated events, each event carrying an evidence class that says how it was checked. " +
    "How a record gets onto a timeline, with the risk at each stage, is written up on its own page.",
  shows: [{ href: "/records", label: "Records" }, { href: "/verification", label: "How records are checked" }],
  nodes: [
    n("rec", "data", "A public record", 2, 0, "Agendas, minutes, memos, a meeting recording, a court decision, a news story.", { to: { href: "/engine/sources", label: "How claims are traced" } }),
    n("ev", "step", "A dated event is written", 2, 1.2, "Date (a day, or only the month), stage, what happened, kind (filed, certified, heard, continued, decided, reported), the sources, and a quote. Held in each town's timelines file.", { where: ["lib/types.ts#TimelineEvent", "lib/data/timelines.json"], note: "A decision needs a quote. One resting only on machine captions must say why in gap (ARD D7)." }),
    n("chk", "step", "Checked by script", 2, 2.4, "Dates parse, sources exist, quotes are found word for word. Parties are business or professional roles, never residents.", { where: ["scripts/timelines/verify.py"], note: "Principle 7: residents are described by role, never by name." }),
    n("cls", "decision", "Evidence class, computed from the event", 2, 3.6, "Never typed. In order: not yet checked (the date was carried over), press report, read from a scan, machine transcript (a quote, every source a recording), quote checked (a quote), source linked (no quote).", { where: ["lib/timelines.ts#evidenceOf", "lib/timelines.ts#EVIDENCE"], note: "ARD D6." }),

    n("span", "step", "Span: first appearance to decision", 0, 5, "For one project and stage: from its first event to its decision, as the lowest and highest the dates allow. Equal when both days are known. Approximate, and says why, when an end is month-only or not yet checked. Continuances are counted.", { where: ["lib/timelines.ts#spanOf"] }),
    n("for", "step", "Spans of the same town and route", 0, 6.3, "All projects of the active town that ran the same route, for a given step. Shown with each project's name and no average.", { where: ["lib/timelines.ts#spansFor"], note: "Principle 3: no averages over a handful of projects." }),
    n("appr", "step", "Approval degree", 3.8, 5, "The latest decision on a review stage (master, preliminary, final, or recording and after) sets the degree, so a vacated approval counts as it stands. A decision whose text says denied counts as denied. Appeals are left out. With no decision recorded, the status line is read for a master plan approval; otherwise nothing is claimed.", { where: ["lib/timelines.ts#approvalOf"], note: "ARD D29." }),
    n("hist", "gap", "Only approved projects are recorded", 1.9, 6.3, "Withdrawals and denials appear in the agendas and not yet in the data, so the times are those of projects that got somewhere.", { note: "Debt 9." }),

    n("card", "output", "Documented times beside each step", 0, 7.7, "On the Schedule page, under a step: how long this town took on this route, project by project, with the evidence behind each date.", { where: ["components/ScheduleView.tsx"], to: { href: "/schedule", label: "Open the Schedule" } }),
    n("tl", "output", "Timeline lanes and hover cards", 3.8, 7.7, "A lane for each project, its events marked by evidence class, the approval column, and a card for each event with its quote and source.", { where: ["components/ProjectTimeline.tsx"], to: { href: "/records", label: "Open Records" } }),
  ],
  edges: [
    e("rec", "ev"), e("ev", "chk"), e("chk", "cls"),
    e("cls", "span", undefined, { out: "bottom", in: "top" }), e("cls", "appr", undefined, { out: "bottom", in: "top" }),
    e("span", "for"), e("appr", "hist", undefined, { dashed: true, out: "bottom", in: "right" }),
    e("for", "card"), e("appr", "tl"),
  ],
};
