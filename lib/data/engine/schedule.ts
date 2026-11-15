import { e, n, type Flow } from "./types";

export const SCHEDULE: Flow = {
  slug: "schedule",
  title: "Schedule",
  blurb: "How the steps are laid out in time, with the permit wait and the board's real meetings.",
  intro:
    "The schedule walks the steps in order from the start date. Each step gets a length, from the town's own plan if it has one and the shared plan if not; some run alongside another step; one waits for state permits; and filing dates are snapped to the board's published meeting calendar. " +
    "All dates are UTC days, so the plan does not shift with the viewer's timezone.",
  shows: [{ href: "/schedule", label: "Schedule" }],
  nodes: [
    n("in", "data", "Steps, start date and town", 2.2, 0, "The numbered steps, the project's start date, and the town. The cursor starts at the start date.", { where: ["lib/schedule.ts#buildSchedule"], to: { href: "/engine/steps", label: "Route steps" } }),
    n("plan", "decision", "Does the town have a plan for this step?", 2.2, 1.2, "A town's plan gives the step's length in days and its key moments (filing, notice, hearing, decision deadline).", { where: ["lib/schedule.ts#planFor"], town: true }),
    n("tp", "town", "The town's plan", 0, 2.4, "Providence's own durations and moments, keyed by route and step.", { where: ["lib/data/towns/overlay.ts#townPlan"] }),
    n("sp", "step", "The shared plan, then a default", 4.4, 2.4, "SCHEDULE[tree:step], then SCHEDULE[step], then a 30-day step with one filing moment. Lengths are statutory clocks where there is one (flagged as such) and estimates where there is not.", { where: ["lib/data/schedule.ts"], note: "Estimates are labelled estimates on the page." }),
    n("with", "decision", "Runs alongside another step?", 2.2, 3.7, "The state permits stage runs alongside the master plan stage, and the appeal window alongside the recording of the plan. Such a step starts when its partner does.", { where: ["lib/schedule.ts#buildSchedule"] }),
    n("wy", "step", "Start with the partner", 0.2, 4.9, "Same start as the partner step. The cursor is not moved by it.", {}),
    n("wn", "step", "Start at the cursor", 4.2, 4.9, "The end of the previous step.", {}),
    n("gate", "decision", "Is this the permit gate?", 2.2, 6.1, "The stage by which state permits must be in hand: the preliminary plan in Cumberland, the final plan in Providence.", { where: ["lib/schedule.ts#buildSchedule", "lib/types.ts#TownRules"], town: true, note: "ARD D10." }),
    n("lag", "step", "Wait for the permits", 4.6, 7.3, "If the gated step would end before the permit step does, its start is pushed back by the difference.", { where: ["lib/schedule.ts#buildSchedule"] }),
    n("end", "step", "End = start + length", 2.2, 8.5, "In calendar days.", {}),
    n("cal", "decision", "Board calendar and a hearing moment?", 2.2, 9.7, "Does the town publish a board calendar, and does the step have a hearing moment? Cumberland and Providence do. The step's filing date is matched to a cycle.", { where: ["lib/calendar.ts#calendarFor", "lib/calendar.ts#snap"] }),
    n("snap", "town", "Snap to the board's cycle", 0, 10.9, "The first cycle whose filing cut-off is on or after the filing date. The staff review, the hearing and the notice (14 days before) take their real dates. A filing within 14 days after a cut-off says which meeting it just missed. If the board meets after a statutory deadline, the step says the board must act earlier or the deadline be extended by agreement. The step ends no earlier than its hearing.", { where: ["lib/schedule.ts#buildSchedule", "lib/calendar.ts#snap"] }),
    n("pat", "step", "Published rows, then the town's pattern", 0, 12.1, "Where the published calendar runs out, rows are projected from the town's usual pattern (Cumberland's last Thursday; Providence's nth weekday) and marked as estimates. Joint and special meetings are never predicted.", { where: ["lib/calendar.ts#rowsWithPattern"], note: "Dates from a published schedule and projected ones are shown differently." }),
    n("off", "step", "Moments at their offsets", 4.4, 10.9, "Without a calendar each moment is the step's start plus its offset in days.", {}),
    n("out", "output", "PlannedStep[]", 2.2, 13.3, "Each step with its start, end and dated moments. The cursor moves to the end unless the step ran alongside.", { where: ["lib/schedule.ts#PlannedStep"] }),
    n("use", "output", "Schedule page, timeline and calendar file", 4.6, 13.3, "The Schedule page and project timeline draw it; toICS writes one all-day event per moment, with each step's considerations listed as done or open.", { where: ["lib/schedule.ts#toICS"], to: { href: "/schedule", label: "Open the Schedule" } }),
  ],
  edges: [
    e("in", "plan"),
    e("plan", "tp", "yes"), e("plan", "sp", "no"),
    e("tp", "with"), e("sp", "with"),
    e("with", "wy", "yes"), e("with", "wn", "no"),
    e("wy", "gate"), e("wn", "gate"),
    e("gate", "lag", "yes"), e("gate", "end", "no"),
    e("lag", "end", undefined, { out: "bottom", in: "right" }),
    e("end", "cal"),
    e("cal", "snap", "yes"), e("cal", "off", "no"),
    e("snap", "pat", undefined, { dashed: true }),
    e("snap", "out"), e("off", "out"),
    e("out", "use"),
  ],
};
