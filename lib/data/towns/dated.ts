/*
 * Rules with dates (ARD D62, chunk 4 of docs/plans/statewide-coverage.md). A town's rule is kept as versions, each with
 * the day it took effect, so a finding can say which text applies to an application and when that is a question for
 * staff. North Providence forced it: its ordinance has been amended many times since its last compilation, the Town's
 * own code dates one amendment two ways, and another amendment is pending before the Town Council.
 *
 * Which text applies is the town's vesting rule. In North Providence an application is vested under the ordinance in
 * force on the day the Planning Board certifies it complete, not the day it is filed (§ 35-255). The site knows the day
 * the project starts (filing) and that certification follows within 25 days under state law, so a change inside that
 * window, or a date the sources disagree on, makes the answer "ask staff" rather than a guess.
 */

export interface Version<T> {
  value: T;
  /** ISO date the text took effect. Null for the oldest text read, in force before every dated version. */
  since: string | null;
  /** What made it: an ordinance number, or the compilation the oldest text comes from */
  by: string;
  src: string;
  pin: string;
  q: string;
  /** Another date a source gives for the same change (ARD D13): kept, and an application vested between the two goes to staff */
  orSince?: { date: string; why: string };
}

/** An amendment heard but not adopted. Never applied; shown beside the text in force. */
export interface Pending {
  what: string;
  /** Where it stands, from the latest record read */
  status: string;
  src: string;
  pin: string;
  q: string;
  /** What is not public about it */
  gap: string;
  /** ISO date of the latest record read: an application vested before it cannot be caught by the amendment */
  asOf: string;
}

/** Whether a pending amendment could still reach an application filed on `filed`: it vests after the latest record read. */
export const stillOpen = (p: Pending, filed: string, days = CERTIFY_DAYS) => addDays(/^\d{4}-\d{2}-\d{2}$/.test(filed) ? filed : new Date().toISOString().slice(0, 10), days) >= p.asOf;

/** Days from filing to the certification of completeness under the state's Development Review Act. */
export const CERTIFY_DAYS = 25;

const addDays = (iso: string, n: number) => new Date(Date.parse(iso) + n * 86400000).toISOString().slice(0, 10);
const nice = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function at<T>(vs: Version<T>[], day: string, alt: boolean): Version<T> {
  const eff = (v: Version<T>) => (alt && v.orSince ? v.orSince.date : v.since);
  const live = vs.filter((v) => eff(v) === null || eff(v)! <= day);
  return live.reduce((a, b) => ((eff(b) ?? "") >= (eff(a) ?? "") ? b : a), live[0] ?? vs[0]);
}

export interface Applies<T> {
  /** The text in force when the application is most likely certified: the latest that could apply */
  v: Version<T>;
  /** Set when another text could apply instead: why, in a sentence for the finding */
  unsure: string | null;
}

/**
 * The version of a rule that applies to an application filed on `filed`, vested on certification up to `days` later.
 * Every reading is tried: the earliest and latest day it may vest, under each date the sources give.
 */
export function applies<T>(vs: Version<T>[], filed: string, days = CERTIFY_DAYS): Applies<T> {
  const day = /^\d{4}-\d{2}-\d{2}$/.test(filed) ? filed : new Date().toISOString().slice(0, 10);
  const end = addDays(day, days);
  const options = [at(vs, day, false), at(vs, end, false), at(vs, day, true), at(vs, end, true)];
  const v = options[1];
  if (options.every((o) => o === v)) return { v, unsure: null };
  const changed = vs.find((x) => x.since && x.since > day && x.since <= end);
  if (changed) return { v, unsure: `The ordinance changed on ${nice(changed.since!)} (${changed.by}), between the day this project is filed and the day it may be certified complete, so either text may apply.` };
  const disputed = vs.find((x) => x.orSince && options.includes(x));
  return { v, unsure: disputed?.orSince ? `${disputed.orSince.why} An application vested between ${nice([disputed.since!, disputed.orSince.date].sort()[0])} and ${nice([disputed.since!, disputed.orSince.date].sort()[1])} may fall under either text.` : "More than one text may apply." };
}

/** "from Jun 4, 2024 (Ord. 24-009Z)" or "before 2024 (the 2014 compilation)" */
export const sinceText = (v: Version<unknown>, next?: Version<unknown>) =>
  v.since ? `in force from ${nice(v.since)} (${v.by})` : `in force until ${next?.since ? nice(next.since) : "the first amendment read"} (${v.by})`;
