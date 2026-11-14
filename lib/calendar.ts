import { CUMBERLAND_CALENDAR } from "./data/calendars/cumberland";
import { PROVIDENCE_CALENDAR } from "./data/towns/providence/town";
import type { BoardCalendar, CalendarRow } from "./types";

const DAY = 86400000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d));

/** Last Thursday of a month, or the first Thursday in December (the pattern the published table follows). */
function patternMeeting(y: number, m: number): Date {
  if (m === 11) {
    const d = utc(y, 11, 1);
    return new Date(d.getTime() + ((4 - d.getUTCDay() + 7) % 7) * DAY);
  }
  const last = utc(y, m + 1, 0);
  return new Date(last.getTime() - ((last.getUTCDay() - 4 + 7) % 7) * DAY);
}

/** The nth given weekday of a month, such as the third Tuesday. */
function nthWeekday(y: number, m: number, weekday: number, nth: number): Date {
  const first = utc(y, m, 1);
  return new Date(first.getTime() + (((weekday - first.getUTCDay() + 7) % 7) + (nth - 1) * 7) * DAY);
}

/**
 * The published rows, extended by the town's usual pattern for the following year or two.
 * Projected rows carry `est: true` and are shown as estimates. Joint and special meetings are never predicted.
 */
export function rowsWithPattern(cal: BoardCalendar, throughYear: number): CalendarRow[] {
  const rows = [...cal.rows];
  const lastPb = rows.reduce((a, r) => (r.pb > a ? r.pb : a), "");
  for (let y = cal.year + 1; y <= throughYear; y++) {
    for (let m = 0; m < 12; m++) {
      const rule = cal.pattern.rule;
      const pb = rule ? nthWeekday(y, m, rule.weekday, rule.nth) : patternMeeting(y, m);
      if (iso(pb) <= lastPb) continue;
      rows.push({ cutoff: iso(new Date(pb.getTime() - cal.pattern.cutoffDaysBefore * DAY)), pb: iso(pb), est: true });
    }
  }
  return rows.sort((a, b) => (a.cutoff < b.cutoff ? -1 : 1));
}

export function calendarFor(town: string): BoardCalendar | null {
  return town === "Cumberland" ? CUMBERLAND_CALENDAR : town === "Providence" ? PROVIDENCE_CALENDAR : null;
}

export interface Snap {
  /** The cycle this filing feeds */
  row: CalendarRow;
  /** The cycle just missed, when the filing falls within `lostWithin` days after its cut-off */
  missed?: { row: CalendarRow; daysLate: number };
}

/** The first cycle whose cut-off is on or after the filing date; null when the calendar and pattern run out. */
export function snap(cal: BoardCalendar, filing: string): Snap | null {
  const rows = rowsWithPattern(cal, +filing.slice(0, 4) + 2);
  const i = rows.findIndex((r) => r.cutoff >= filing);
  if (i === -1) return null;
  const prev = rows[i - 1];
  const late = prev ? Math.round((Date.parse(filing) - Date.parse(prev.cutoff)) / DAY) : Infinity;
  return { row: rows[i], missed: prev && late <= 14 ? { row: prev, daysLate: late } : undefined };
}
