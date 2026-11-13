export type Kind = "elected" | "appointed" | "staff" | "state" | "utility";

/** Site conditions a document, authority or step can depend on. "a|b" means either. */
export type FlagKey = "wet" | "dot" | "acre" | "transit" | "rezone" | "relief" | "always";
export type Flags = Record<FlagKey, boolean>;

export type TreeId = "major" | "minor" | "comp" | "dpr" | "byright";

export interface Source {
  label: string;
  url: string;
}

export interface Contact {
  name: string;
  kind: Kind;
  lines: [string, string][];
  note: string;
  verify?: string;
  src: string[];
}

export interface Doc {
  title: string;
  /** Plain-language note shown under the title */
  note?: string;
  /** Flag expression; the document is shown only when it is true */
  cond?: string;
  /** Overrides the "Required for this site" chip */
  when?: string;
  /** Source id, pinpoint and verbatim quote the requirement comes from */
  src?: string;
  pin?: string;
  q?: string;
  /** Considerations to check before filing */
  checklist: string[];
}

export interface AuthRef {
  c: string;
  role: string;
  cond?: string;
}

export interface Step {
  id: string;
  title: string;
  /** The application that moves down the flow at this step */
  app: string;
  clock: { days?: number; text: string };
  what: string;
  auth: AuthRef[];
  /** Label for the authorities when they do not decide an application at this step (default "Decided by") */
  authLabel?: string;
  docs: Doc[];
  cond?: string;
  branch?: boolean;
  /** Objection ids worth preparing for at this step */
  objections?: string[];
}

export interface Tree {
  id: TreeId;
  name: string;
  rule: string;
  status: string;
  blurb: string;
  steps: Step[];
}

export interface ProjectInputs {
  /** Municipality of the site; set by the address lookup or the town picker */
  town: string;
  /** Street address the site facts were looked up from, if any */
  address: string;
  parcel: string;
  units: number;
  aff: number;
  /** Zoning district abbreviation (from the town's districts in the RI Zoning Atlas), or "other" */
  zone: string;
  lot: number;
  dist: number;
  type: "new" | "reuse";
  water: boolean;
  sewer: boolean;
  wet: boolean;
  dot: boolean;
  transit: boolean;
  rezone: boolean;
  /** Conservation development (Cumberland Zoning Art. 11): density bonus in exchange for open space */
  conservation: boolean;
  /** ISO date the project starts (day 0 of the schedule) */
  startDate: string;
}

export interface Finding {
  st: "pass" | "flag" | "fail" | "info";
  t: string;
  p: string;
  src?: string;
  pin?: string;
  q?: string;
}

export type PrecedentStatus = "approved" | "pending" | "administrative" | "unknown";

export interface Precedent {
  name: string;
  addr: string;
  lot: string;
  zone: string;
  units: number;
  aff: number;
  route: TreeId;
  routeLabel: string;
  status: PrecedentStatus;
  statusLabel: string;
  notes: string;
  src: string[];
  events: TimelineEvent[];
  parties?: Party[];
  coverage?: Coverage[];
  /** ISO date the public record was last checked for new events */
  checked: string;
}

export type TimelineStage = "trc" | "preapp" | "master" | "prelim" | "final" | "recorded" | "permit" | "start" | "co" | "other";

export interface TimelineEvent {
  /** ISO date; "YYYY-MM" when only the month is known */
  date: string;
  stage: TimelineStage;
  what: string;
  kind: "filed" | "certified" | "heard" | "continued" | "decided" | "reported";
  /** Ids in sources.ts */
  src: string[];
  /** Verbatim from a source document; required for "decided" */
  quote?: string;
}

export interface Party {
  role: "applicant" | "owner" | "engineer" | "attorney" | "architect" | "builder";
  name: string;
  src: string;
}

export interface Coverage {
  label: string;
  url: string;
  date: string;
  kind: "press" | "statement" | "video";
}

/** The part of a Precedent kept in timelines.json */
export type Timeline = Pick<Precedent, "events" | "parties" | "coverage" | "checked">;

export type ObjectionWeight = "material" | "partly" | "not";

/** One documented instance of a concern raised at a real hearing. Private residents are described by role only. */
export interface Heard {
  locality: string;
  date: string;
  body: string;
  project: string;
  who: string;
  said: string;
  answer?: string;
  outcome?: string;
  src: string[];
}

export interface Objection {
  id: string;
  topic: "Traffic and parking" | "Next door" | "Water and environment" | "Size and character" | "Services" | "Who will live there";
  said: string;
  weight: ObjectionWeight;
  boardView: string;
  response: string;
  say: string;
  bring: { step: string; doc: string }[];
  heard: Heard[];
}

export interface RecordLink {
  label: string;
  url: string;
  note: string;
}

export interface Locality {
  id: string;
  name: string;
  pilot?: boolean;
  intro: string;
  links: RecordLink[];
  tips?: string[];
  /** Hearing recordings, minutes, memos, testimony and press for this locality */
  media?: MediaItem[];
  /** True when this locality's hearings have been read and tagged into the common questions */
  indexed?: boolean;
}

export interface MediaItem {
  kind: "video" | "minutes" | "memo" | "news" | "livestream" | "testimony";
  label: string;
  url: string;
  date?: string;
  note: string;
}

export interface AtlasDistrict {
  abbrvname: string;
  name: string;
  type: string;
  family1_treatment: string;
  family2_treatment: string;
  family3_treatment: string;
  family4_treatment: string;
  accessory_treatment: string;
  affordable_treatment: string;
  family1_minlotacres: string | null;
  family4_minlotacres: string | null;
  family4_maxunitsperacre: string | null;
  family4_maxheightft: string | null;
  family4_minparking_1br: string | null;
  family4_minparking_2br: string | null;
  family4_water_required: string | null;
}

export type TickKind = "file" | "deadline" | "hearing" | "milestone";

export interface ScheduleTick {
  d: number;
  label: string;
  kind: TickKind;
  /** Document titles this moment concerns; "all" = every document in the step */
  docs?: string[] | "all";
  note?: string;
  /** Moment tied to the board's real calendar: its TRC meeting, the hearing, or the notice 14 days before the hearing */
  cal?: "trc" | "pb" | "notice";
}

export interface StepPlan {
  /** Planned duration in calendar days */
  est: number;
  /** Start at the same time as this step instead of after the previous one */
  with?: string;
  /** True when est comes from a statutory clock rather than an estimate */
  statutory?: boolean;
  ticks: ScheduleTick[];
}

/** One cycle of a board's published calendar: file by `cutoff`, TRC meets on `trc`, the board hears it on `pb`. */
export interface CalendarRow {
  cutoff: string;
  trc?: string;
  pb: string;
  /** True when the row is projected from the pattern, not read from a published schedule */
  est?: boolean;
}

export interface BoardCalendar {
  town: string;
  /** Year the published schedule covers (its later rows may fall in the next year) */
  year: number;
  /** Source id in sources.ts */
  src: string;
  /** ISO date the source was read */
  read: string;
  times?: { pb?: string; trc?: string };
  rows: CalendarRow[];
  pattern: { cutoffDaysBefore: number; note: string };
}
