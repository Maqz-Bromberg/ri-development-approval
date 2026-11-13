import { HISTORY } from "./data/history";
import type { Precedent, TimelineEvent, TreeId } from "./types";

const DAY = 86400000;
const FULL = /^\d{4}-\d{2}-\d{2}$/;

export function eventTime(date: string): number {
  return FULL.test(date) ? Date.parse(date) : Date.parse(`${date}-15`);
}

/** "Sep 25, 2025", or "Sep 2025" when only the month is known. */
export function fmtEventDate(date: string): string {
  const d = new Date(eventTime(date));
  return FULL.test(date)
    ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    : d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

export interface Span {
  project: string;
  from: string;
  to: string;
  /** Elapsed calendar days, computed from the event dates; null when either date is month-only */
  days: number | null;
  continuances: number;
}

/** Elapsed time from the first event of a stage to its decision, for one project. Null when the stage has no decision or no earlier event. */
export function spanOf(h: Precedent, stage: string): Span | null {
  const evs = h.events.filter((e) => e.stage === stage).sort((a, b) => eventTime(a.date) - eventTime(b.date));
  const end = evs.find((e) => e.kind === "decided");
  const first = evs[0];
  if (!end || !first || first === end) return null;
  const both = FULL.test(first.date) && FULL.test(end.date);
  return {
    project: h.name,
    from: first.date,
    to: end.date,
    days: both ? Math.round((eventTime(end.date) - eventTime(first.date)) / DAY) : null,
    continuances: evs.filter((e: TimelineEvent) => e.kind === "continued").length,
  };
}

/** Documented spans for a step on this route, one per project that ran the same route. */
export function spansFor(tree: TreeId, stage: string): Span[] {
  return HISTORY.filter((h) => h.route === tree).flatMap((h) => spanOf(h, stage) ?? []);
}

export function describeSpan(s: Span): string {
  const n = s.continuances;
  const how = n > 0 ? `, after ${n === 1 ? "one continuance" : `${n} continuances`}` : "";
  return s.days === null
    ? `${s.project}: ${fmtEventDate(s.from)} to ${fmtEventDate(s.to)}${how}`
    : `${s.project}: ${s.days} days from first appearance to decision${how}`;
}
