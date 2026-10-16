import { SCHEDULE } from "./data/schedule";
import type { NumberedStep } from "./engine";
import type { Doc, ScheduleTick, StepPlan, TreeId } from "./types";

export interface PlannedTick extends ScheduleTick {
  id: string;
  date: Date;
}

export interface PlannedStep {
  step: NumberedStep;
  plan: StepPlan;
  start: Date;
  end: Date;
  ticks: PlannedTick[];
}

const DAY = 86400000;

/** Parse YYYY-MM-DD as a UTC date, so schedules don't shift with the viewer's timezone. */
export function parseISO(s: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : new Date(Date.UTC(2026, 10, 2));
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY);
}

export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function fmtDate(d: Date, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }): string {
  return d.toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY);
}

export function planFor(tree: TreeId, stepId: string): StepPlan {
  return SCHEDULE[`${tree}:${stepId}`] ?? SCHEDULE[stepId] ?? { est: 30, ticks: [{ d: 0, label: "Start", kind: "file", docs: "all" }] };
}

/** Lay the steps out in sequence from the start date. Steps with `with` run alongside that step. */
export function buildSchedule(tree: TreeId, steps: NumberedStep[], startISO: string): PlannedStep[] {
  const start0 = parseISO(startISO);
  const out: PlannedStep[] = [];
  let cursor = start0;
  steps.forEach((step) => {
    const plan = planFor(tree, step.id);
    const partner = plan.with ? out.find((p) => p.step.id === plan.with) : undefined;
    let start = partner ? partner.start : cursor;
    if (!partner && step.id === "prelim") {
      // Preliminary approval needs the state permits, so its decision can't come before they are in hand.
      const permitsIn = out.filter((p) => p.plan.with).reduce<Date | null>((a, p) => (!a || p.end > a ? p.end : a), null);
      const lag = permitsIn ? daysBetween(addDays(start, plan.est), permitsIn) : 0;
      if (lag > 0) start = addDays(start, lag);
    }
    const end = addDays(start, plan.est);
    out.push({
      step, plan, start, end,
      ticks: plan.ticks.map((t, i) => ({ ...t, id: `${step.id}-${i}`, date: addDays(start, t.d) })),
    });
    if (!partner) cursor = end;
  });
  return out;
}

/** The documents a tick concerns, limited to those visible for this site. */
export function tickDocs(tick: ScheduleTick, docs: Doc[]): Doc[] {
  if (!tick.docs) return [];
  if (tick.docs === "all") return docs;
  return docs.filter((d) => (tick.docs as string[]).includes(d.title));
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** An iCalendar file with one all-day event per tick. */
export function toICS(plan: PlannedStep[], project: string): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//RI Building Plan Approval//EN", "CALSCALE:GREGORIAN"];
  plan.forEach((p) => p.ticks.forEach((t) => {
    const d = isoDay(t.date).replace(/-/g, "");
    const next = isoDay(addDays(t.date, 1)).replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${t.id}-${d}@ri-plan-approval`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d}`,
      `DTEND;VALUE=DATE:${next}`,
      `SUMMARY:${icsEscape(`Step ${p.step.n}: ${t.label}`)}`,
      `DESCRIPTION:${icsEscape(`${project} · ${p.step.title}${t.note ? ` · ${t.note}` : ""}`)}`,
      "END:VEVENT",
    );
  }));
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
