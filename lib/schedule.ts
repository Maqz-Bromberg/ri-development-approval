import { calendarFor, snap, type Snap } from "./calendar";
import { SCHEDULE } from "./data/schedule";
import { townPlan, townRules } from "./data/towns/overlay";
import type { NumberedStep } from "./engine";
import type { Doc, ScheduleTick, StepPlan, TreeId } from "./types";

export interface PlannedTick extends ScheduleTick {
  id: string;
  date: Date;
  /** True when the date comes from a projected meeting pattern, not a published schedule */
  est?: boolean;
  /** True when the date comes from the board's published calendar */
  published?: boolean;
}

export interface PlannedStep {
  step: NumberedStep;
  plan: StepPlan;
  start: Date;
  end: Date;
  ticks: PlannedTick[];
  /** The board cycle this step's filing was snapped to, when a calendar applies */
  cycle?: Snap;
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

export function planFor(tree: TreeId, stepId: string, town = "Cumberland"): StepPlan {
  return townPlan(town, tree, stepId) ?? SCHEDULE[`${tree}:${stepId}`] ?? SCHEDULE[stepId] ?? { est: 30, ticks: [{ d: 0, label: "Start", kind: "file", docs: "all" }] };
}

/** Lay the steps out in sequence from the start date. Steps with `with` run alongside that step. */
export function buildSchedule(tree: TreeId, steps: NumberedStep[], startISO: string, town = "Cumberland"): PlannedStep[] {
  const cal = calendarFor(town);
  const gate = townRules(town).permitsBefore ?? "prelim";
  const start0 = parseISO(startISO);
  const out: PlannedStep[] = [];
  let cursor = start0;
  steps.forEach((step) => {
    const plan = planFor(tree, step.id, town);
    const partner = plan.with ? out.find((p) => p.step.id === plan.with) : undefined;
    let start = partner ? partner.start : cursor;
    if (!partner && step.id === gate) {
      // The gated stage needs the state permits, so its decision can't come before they are in hand.
      // Cumberland's regulations gate the preliminary plan. Providence's gate the final plan.
      const permitsIn = out.filter((p) => p.plan.with).reduce<Date | null>((a, p) => (!a || p.end > a ? p.end : a), null);
      const lag = permitsIn ? daysBetween(addDays(start, plan.est), permitsIn) : 0;
      if (lag > 0) start = addDays(start, lag);
    }
    let end = addDays(start, plan.est);
    const cycle = cal && plan.ticks.some((t) => t.cal === "pb") ? snap(cal, isoDay(start)) ?? undefined : undefined;
    let ticks: PlannedTick[] = plan.ticks.map((t, i) => ({ ...t, id: `${step.id}-${i}`, date: addDays(start, t.d) }));
    if (cycle) {
      const { row, missed } = cycle;
      const pb = parseISO(row.pb);
      const est = !!row.est;
      ticks = ticks.map((t) => {
        if (t.cal === "pb") return { ...t, date: pb, est, published: !est };
        if (t.cal === "trc" && row.trc) return { ...t, date: parseISO(row.trc), published: true };
        if (t.cal === "notice") return { ...t, date: addDays(pb, -14), est };
        return t;
      });
      const first = ticks[0];
      const lead = `File a complete application by ${fmtDate(parseISO(row.cutoff), { month: "short", day: "numeric" })} to be heard on ${fmtDate(pb, { month: "short", day: "numeric", year: "numeric" })}${est ? " (projected from the usual pattern)" : ""}.`;
      const lost = missed ? ` Filing ${missed.daysLate} day${missed.daysLate === 1 ? "" : "s"} after the ${fmtDate(parseISO(missed.row.cutoff), { month: "short", day: "numeric" })} cut-off costs a cycle: the ${fmtDate(parseISO(missed.row.pb), { month: "short", day: "numeric" })} meeting is missed.` : "";
      ticks[0] = { ...first, note: [first.note, lead + lost].filter(Boolean).join(" ") };
      ticks = ticks.map((t) => {
        if (t.kind !== "deadline" || !/Decision deadline/.test(t.label) || t.date >= pb) return t;
        return { ...t, note: [t.note, "The board's next meeting falls after this statutory date. The board must act by then, so expect the hearing to be set earlier or the deadline extended by agreement."].filter(Boolean).join(" ") };
      });
      if (pb > end) end = pb;
    }
    out.push({ step, plan, start, end, ticks, cycle });
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

/** A tick's considerations with whether each is dealt with: what the calendar shows beside the date. */
export interface TickProgress { items: { text: string; on: boolean }[]; done: number; total: number }

/**
 * An iCalendar file with one all-day event per tick. With `progress`, each event lists its considerations as
 * done or open, and one that is fully dealt with is marked so in its title and its category.
 */
export function toICS(plan: PlannedStep[], project: string, progress?: (step: PlannedStep, tick: PlannedTick) => TickProgress | null, link?: string): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//RI Building Plan Approval//EN", "CALSCALE:GREGORIAN"];
  plan.forEach((p) => p.ticks.forEach((t) => {
    const d = isoDay(t.date).replace(/-/g, "");
    const next = isoDay(addDays(t.date, 1)).replace(/-/g, "");
    const pr = progress?.(p, t) ?? null;
    const complete = !!pr && pr.total > 0 && pr.done === pr.total;
    const desc = [
      `${project} · ${p.step.title}${t.note ? ` · ${t.note}` : ""}`,
      pr && pr.total ? `Considerations ${pr.done} of ${pr.total} dealt with:\n${pr.items.map((x) => `${x.on ? "[x]" : "[ ]"} ${x.text}`).join("\n")}` : "",
      link ? `Open the project: ${link}` : "",
    ].filter(Boolean).join("\n\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${t.id}-${d}@ri-plan-approval`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d}`,
      `DTEND;VALUE=DATE:${next}`,
      `SUMMARY:${icsEscape(`${complete ? "Done: " : ""}Step ${p.step.n}: ${t.label}${pr && pr.total && !complete ? ` (${pr.done}/${pr.total})` : ""}`)}`,
      `DESCRIPTION:${icsEscape(desc)}`,
      ...(complete ? ["CATEGORIES:Done"] : []),
      "END:VEVENT",
    );
  }));
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
