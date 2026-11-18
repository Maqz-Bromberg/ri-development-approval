import RAW from "./bodies.json";
import type { Contact } from "../types";

/*
 * Every town's land-use boards, from the state Open Meetings site (scripts/towns/fetch_bodies.py, ARD D53 chunk 2).
 * What is here is where and when the boards meet and how their minutes are filed, not a reading of the minutes.
 * The fetch is run by hand; `read` is its date for each town.
 */
export interface Body {
  id: number;
  name: string;
  role: "planning" | "zoning" | "council" | "trc" | "design" | "historic" | "conservation" | "special";
  kind: "elected" | "appointed" | "state";
  url: string;
  /** Meetings listed on the site (it lists the latest hundred), and how many since 2023 */
  meetings: number;
  since2023: number;
  first: string | null;
  last: string | null;
  upcoming: string[];
  cancelled: string[];
  minutesFiled: number;
  /** Median days from a meeting to its minutes being filed, over the minutes the site lists */
  minutesLagDays: number | null;
  primary?: boolean;
  place?: string | null;
  phone?: string | null;
  /** Whether the latest minutes have a text layer (can be quoted) or are a scan */
  minutesForm?: "text" | "scan" | "not a PDF";
  pattern?: { text: string; time: string | null; perYear: number; count: number } | null;
  recent?: string[];
}
type File = { source?: string; towns: Record<string, { read: string; bodies: Body[] }> };
const DATA = RAW as File;

export const OPEN_MEETINGS = "https://opengov.sos.ri.gov/OpenMeetings";
export const ROLE_LABEL: Record<Body["role"], string> = {
  planning: "Planning board", zoning: "Zoning board", council: "Council", trc: "Technical review", design: "Design review",
  historic: "Historic district commission", conservation: "Conservation commission", special: "State commission",
};

export const bodiesRead = (town: string) => DATA.towns[town]?.read;
/** A town's boards that have met since 2023, the main one of each kind first. */
export function bodiesOf(town: string): Body[] {
  const order = Object.keys(ROLE_LABEL);
  return (DATA.towns[town]?.bodies ?? [])
    .filter((b) => b.since2023 > 0 || (b.last ?? "") >= "2023")
    .sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role) || Number(!!b.primary) - Number(!!a.primary) || b.since2023 - a.since2023);
}
export function primaryBody(town: string, role: Body["role"]): Body | undefined {
  const all = bodiesOf(town).filter((b) => b.role === role);
  return all.find((b) => b.primary) ?? all[0];
}

const day = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** "About 12 a year, usually the third Tuesday of the month, at 4:45 PM. Last met Nov 17, 2026." */
export function meetsLine(b: Body): string {
  const p = b.pattern;
  const when = p ? `About ${p.perYear} a year, ${p.text}${p.time ? `, at ${p.time.replace(/^0/, "").replace(/(AM|PM)$/, " $1")}` : ""}.` : "";
  const last = b.last ? ` Last met ${day(b.last)}.` : "";
  const next = b.upcoming.length ? ` Next posted: ${day(b.upcoming[0])}.` : "";
  return `${when}${last}${next}`.trim() || "No recent meetings listed.";
}

/** How the board's minutes are filed, and whether they can be quoted. */
export function minutesLine(b: Body): string {
  if (!b.minutesFiled) return "No minutes filed on the state site. Look on the town's own site.";
  const lag = b.minutesLagDays != null ? `, usually ${b.minutesLagDays} days after the meeting` : "";
  const form = b.minutesForm === "scan" ? " The latest are scanned pages with no text." : b.minutesForm === "text" ? " The latest have searchable text." : "";
  return `Filed on the state Open Meetings site${lag}.${form}`;
}

/** The contact ids the steps use, the kind of board each one is, and the role it plays where a town has not said. */
const CONTACT_ROLE: Record<string, { role: Body["role"]; name?: RegExp; note: string }> = {
  pb: { role: "planning", note: "Decides land development projects and subdivisions, and gives the council advisory opinions on zone changes." },
  zbr: { role: "zoning", note: "Decides variances and special use permits, and hears appeals of the zoning officer's decisions." },
  council: { role: "council", note: "The governing body. Adopts the zoning ordinance and map, and decides zone changes." },
  trc: { role: "trc", note: "Reviews applications for completeness and technical matters before the planning board." },
  hdc: { role: "historic", note: "Decides certificates of appropriateness for work in local historic districts." },
  i195: { role: "special", name: /I-195/, note: "A state commission that owns and redevelops the land freed by moving Route I-195, and reviews development on it." },
};

/**
 * A town's board as a contact, in place of Cumberland's office with the name changed (debt 5). The role note is the
 * generic one the caller passes; the lines are what the state site says.
 */
export function contactFromBodies(town: string, id: string, note?: string): Contact | undefined {
  const r = CONTACT_ROLE[id];
  const b = r && (r.name ? bodiesOf(town).find((x) => x.role === r.role && r.name!.test(x.name)) : primaryBody(town, r.role));
  if (!b) return undefined;
  const lines: [string, string][] = [["Meets", meetsLine(b)]];
  if (b.place) lines.push(["Where", b.place]);
  if (b.phone) lines.push(["Phone", `${b.phone} (the contact on its meeting notices)`]);
  lines.push(["Minutes", minutesLine(b)]);
  return {
    name: b.name, kind: b.kind === "state" ? "state" : b.kind, lines, note: note ?? r.note,
    verify: `Read from the state Open Meetings site on ${bodiesRead(town)}. The office's address, hours and staff were not read.`,
    src: ["sosom"], links: [{ label: "Meetings, agendas and minutes", url: b.url }],
  };
}
