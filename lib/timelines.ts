import { historyFor } from "./data/history";
import { isRecording } from "./data/sources";
import { getActiveTown } from "./town";
import type { Precedent, TimelineEvent, TreeId } from "./types";

const DAY = 86400000;
const FULL = /^\d{4}-\d{2}-\d{2}$/;

export function eventTime(date: string): number {
  return FULL.test(date) ? Date.parse(date) : Date.parse(`${date}-15`);
}

/** The earliest and latest moment a date can mean: one day when the day is known, the whole month when it is not. */
export function eventRange(date: string): [number, number] {
  if (FULL.test(date)) { const t = Date.parse(date); return [t, t]; }
  const lo = Date.parse(`${date}-01`);
  const d = new Date(lo);
  return [lo, Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)];
}

export const isMonthOnly = (date: string) => !FULL.test(date);

/** "Sep 25, 2025", or "Sep 2025" when only the month is known. */
export function fmtEventDate(date: string): string {
  const d = new Date(eventTime(date));
  return FULL.test(date)
    ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    : d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

/*
 * What backs each event. This is computed from the data, and scripts/timelines/verify.py enforces the first level.
 *   quoted  a verbatim quote that verify.py found in the cited document
 *   scanned a quote transcribed by eye from a scanned page; verify.py reports it and cannot match it
 *   transcript a quote from a recording's automatic captions, matched by script against what the machine heard
 *   cited   a source is linked, but no quote is checked against it
 *   press   a news report, linked and not fetched
 *   carried the date came from the earlier record and was not found in a fetched document
 */
export type Evidence = "quoted" | "scanned" | "transcript" | "cited" | "press" | "carried";

export const EVIDENCE: Record<Evidence, { label: string; how: string }> = {
  quoted: { label: "Quote checked", how: "A sentence from the source is stored, and a script confirmed it appears word for word in the document." },
  scanned: { label: "Read from a scan", how: "The source is a scanned page with no searchable text. A sentence was transcribed by eye, and no script has matched it against the page." },
  transcript: { label: "Machine transcript", how: "From the automatic captions of the meeting recording. A script matched the words against the captions, but captions mishear names, numbers and addresses. Listen at the linked time before relying on it." },
  cited: { label: "Source linked", how: "The event comes from the linked document, but no sentence is stored and checked. A person read it." },
  press: { label: "Press report", how: "From a news story. Not fetched or quoted, and the paper may be wrong or may differ from the town record." },
  carried: { label: "Not yet checked", how: "The date came from an earlier version of the record and has not been found in a fetched document." },
};

export function evidenceOf(e: TimelineEvent): Evidence {
  if (e.unverified) return "carried";
  if (e.kind === "reported") return "press";
  if (e.scan) return "scanned";
  if (e.quote && e.src.length > 0 && e.src.every(isRecording)) return "transcript";
  return e.quote ? "quoted" : "cited";
}

export interface Span {
  project: string;
  stage: string;
  from: string;
  to: string;
  /** Elapsed calendar days: lowest and highest the dates allow. Equal when both days are known. */
  min: number;
  max: number;
  /** True when an end is month-only or not yet checked, so the figure is approximate */
  approx: boolean;
  /** Why the figure is approximate, in words */
  why: string[];
  continuances: number;
}

/** Elapsed time from the first event of a stage to its decision, for one project. Null when the stage has no decision or no earlier event. */
export function spanOf(h: Precedent, stage: string): Span | null {
  const evs = h.events.filter((e) => e.stage === stage).sort((a, b) => eventTime(a.date) - eventTime(b.date));
  const end = evs.find((e) => e.kind === "decided");
  const first = evs[0];
  if (!end || !first || first === end) return null;
  const [fLo, fHi] = eventRange(first.date), [tLo, tHi] = eventRange(end.date);
  const why: string[] = [];
  if (isMonthOnly(first.date)) why.push(`the start is known only to the month (${fmtEventDate(first.date)})`);
  if (isMonthOnly(end.date)) why.push(`the decision is known only to the month (${fmtEventDate(end.date)})`);
  if (first.unverified) why.push("the start date has not been checked against a document");
  if (end.unverified) why.push("the decision date has not been checked against a document");
  return {
    project: h.name, stage, from: first.date, to: end.date,
    min: Math.max(0, Math.round((tLo - fHi) / DAY)), max: Math.round((tHi - fLo) / DAY),
    approx: why.length > 0, why,
    continuances: evs.filter((e) => e.kind === "continued").length,
  };
}

export function spansOfProject(h: Precedent): Span[] {
  return [...new Set(h.events.map((e) => e.stage))].flatMap((s) => spanOf(h, s) ?? []);
}

/** Documented spans for a step on this route, one per project of the same town that ran the same route. */
export function spansFor(tree: TreeId, stage: string, town = getActiveTown()): Span[] {
  return historyFor(town).filter((h) => h.route === tree).flatMap((h) => spanOf(h, stage) ?? []);
}

export function spanDays(s: Span): string {
  return s.min === s.max ? `${s.max} days` : `about ${s.min}–${s.max} days`;
}

export function describeSpan(s: Span): string {
  const n = s.continuances;
  const how = n > 0 ? `, after ${n === 1 ? "one continuance" : `${n} continuances`}` : "";
  const flag = s.approx ? " (approximate: " + s.why[0] + ")" : "";
  return `${s.project}: ${s.min === s.max && !s.approx ? "" : "≈ "}${spanDays(s)} from first appearance to decision${how}${flag}`;
}

/** 0 to 1 across the units of the projects shown, so colour reads against the scale of these developments. */
export function unitScale(units: number[]): (n: number) => number {
  const lo = Math.min(...units), hi = Math.max(...units);
  return (n) => (hi === lo ? 0.5 : (n - lo) / (hi - lo));
}

/** Gradient from a pale yellow-green to a deep teal. Returns the background and a readable text colour. */
export function unitColor(t: number): { bg: string; fg: string } {
  const k = Math.round(Math.max(0, Math.min(1, t)) * 100);
  return { bg: `color-mix(in oklab, #1d5c6b ${k}%, #f1e7a6)`, fg: k > 48 ? "#ffffff" : "#1d2a26" };
}

export type Season = "spring" | "summer" | "fall" | "winter";

/** Meteorological seasons: March to May, June to August, September to November, December to February. */
export function seasonOf(monthIndex: number): Season {
  if (monthIndex >= 2 && monthIndex <= 4) return "spring";
  if (monthIndex <= 7 && monthIndex >= 5) return "summer";
  if (monthIndex >= 8 && monthIndex <= 10) return "fall";
  return "winter";
}

/** How far a project has been approved, from its recorded decisions. */
export type ApprovalDegree = "none" | "master" | "prelim" | "final" | "denied";

export const APPROVAL: Record<ApprovalDegree, { label: string; rank: number }> = {
  none: { label: "No approval recorded", rank: 0 },
  master: { label: "Master plan approved", rank: 1 },
  prelim: { label: "Preliminary plan approved", rank: 2 },
  final: { label: "Final plan approved or later", rank: 3 },
  denied: { label: "Denied", rank: -1 },
};

const STAGE_DEGREE: Partial<Record<string, ApprovalDegree>> = { master: "master", prelim: "prelim", final: "final", recorded: "final", permit: "final", start: "final", co: "final" };

/**
 * The degree of approval a project has reached: the latest decision on a review stage, so a later rehearing or a
 * vacated approval counts as it stands now. Decisions on appeals and other matters are left out. Without a recorded
 * decision, the status line is read for a master plan approval; otherwise nothing is claimed.
 */
export function approvalOf(h: Precedent): { degree: ApprovalDegree; event?: TimelineEvent } {
  const decided = h.events
    .filter((e) => e.kind === "decided" && STAGE_DEGREE[e.stage])
    .sort((a, b) => eventTime(a.date) - eventTime(b.date));
  const last = decided[decided.length - 1];
  if (last) return { degree: /\b(denied|rejected|disapproved)\b/i.test(last.what) ? "denied" : STAGE_DEGREE[last.stage]!, event: last };
  if (/master plan approved/i.test(h.statusLabel)) return { degree: "master" };
  if (/\b(denied|rejected)\b/i.test(h.statusLabel)) return { degree: "denied" };
  return { degree: "none" };
}
