export type Kind = "elected" | "appointed" | "staff" | "state" | "utility";

/** Site conditions a document, authority or step can depend on. "a|b" means either. */
/** coastal: wetlands entered where CRMC regulates them (debt 19). historic, ddrc, i195, aquifer, airport: set by a town from the project's overlays (TownRules.overlayFlags), false elsewhere */
export type FlagKey = "wet" | "dot" | "acre" | "transit" | "rezone" | "relief" | "septic" | "pubwater" | "pubsewer" | "always" | "historic" | "ddrc" | "i195" | "aquifer" | "airport" | "coastal";
export type Flags = Record<FlagKey, boolean>;

export type TreeId = "major" | "minor" | "comp" | "dpr" | "byright";

export interface Source {
  label: string;
  url: string;
  /** The municipality the document belongs to, or "State". Only where the label does not name it. Used to file the local copy. */
  town?: string;
}

export interface Contact {
  name: string;
  kind: Kind;
  lines: [string, string][];
  note: string;
  verify?: string;
  src: string[];
  /** Pages that are not cited sources, such as a board's page on the state Open Meetings site */
  links?: { label: string; url: string }[];
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

/** What is being built. Each kind has its own facts, route rule and coverage (ARD D30, D31). */
export type ProjectKind = "homes" | "mixed" | "commercial";

/** The short list of non-residential uses read so far (ARD D30). "institutional" covers schools, healthcare, cultural facilities and places of worship. */
export type CommercialUse = "retail" | "office" | "restaurant" | "industrial" | "institutional";

/** Building work for a commercial project: new floor area, an expansion of a building, or a change of use of one. */
export type CommercialWork = "new" | "expand" | "change";

export interface ProjectInputs {
  /** Homes, homes with commercial space, or commercial (non-residential) */
  kind: ProjectKind;
  /** The non-residential use, for commercial projects and the commercial part of mixed use */
  use: CommercialUse;
  /** Commercial projects: new construction, an expansion, or a change of use */
  work: CommercialWork;
  /** Commercial projects: gross floor area built new (or added, for an expansion; or of the building, for a change of use), sq ft */
  gfa: number;
  /** Commercial expansions: the building's existing gross floor area, sq ft */
  existingGfa: number;
  /** Commercial change of use: whether extensive construction or exterior work is planned */
  extensive: boolean;
  /** Municipality of the site; set by the address lookup or the town picker */
  town: string;
  /** Overlay districts the site lies in, by abbreviation (from the lookup or the picker) */
  overlays: string[];
  /** Set by the lookup when the site is on tribal land the Atlas maps: town zoning may not govern it (ARD D38) */
  reservation?: string;
  /** Which agency regulates wetlands at the site, from the lookup: CRMC on the coast, RIDEM inland */
  wetAgency?: "CRMC" | "DEM";
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
  /** Gross sq ft of commercial floor area in a mixed-use project. Asked in every town since D30 (the state's mixed-use line). */
  commercial: number;
  /** ISO date the project starts (day 0 of the schedule) */
  startDate: string;
  /** Where the address lookup placed the site (WGS84). Unset for the example and for hand-entered projects. */
  lat?: number;
  lon?: number;
}

export interface Finding {
  /** Stable across changes to the numbers in the facts, so a pin or a link can point at it. Set by `analyze` when a rule does not give one. */
  id?: string;
  st: "pass" | "flag" | "fail" | "info";
  /** Set when the finding marks something not read, or not public: what would answer it. Gaps are shown as such (ARD D31). */
  gap?: string;
  t: string;
  p: string;
  src?: string;
  pin?: string;
  q?: string;
}

export type PrecedentStatus = "approved" | "pending" | "administrative" | "unknown";

export interface Precedent {
  /** Municipality whose records the project comes from */
  town: string;
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
  /** Map position: the centroid of its parcels, or the street address point when `exact` is false */
  at?: { lat: number; lon: number; exact: boolean };
  /** RIDEM tax parcel ids (PlatLot), when the parcels are known */
  parcels?: string[];
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
  /** Set when the date was carried over from an earlier record and not found in a fetched document. The text says why. */
  unverified?: string;
  /** True when the quote was read by eye from a scanned page with no text layer, so no script has matched it. */
  scan?: boolean;
  /** Why a decision rests on a recording's machine captions and not on minutes: the minutes are missing, scanned or silent. Required for such a decision. */
  gap?: string;
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

/** What a town changes in the state-law route: its own steps, its own sorting of projects, and its own findings. */
export interface TownRules {
  /** Which route a project takes, where the town's thresholds differ from the state defaults */
  classify?: (i: ProjectInputs) => TreeId;
  /** Whether the housing type is allowed in the district, from the town's own use table. Used in place of the Zoning Atlas when it answers. */
  use?: (i: ProjectInputs) => { value: "allowed" | "hearing" | "prohibited"; finding: Finding } | null;
  /** The route for a commercial project, where the town's regulations draw their own floor-area lines */
  classifyCommercial?: (i: ProjectInputs) => TreeId;
  /** An overlay district's own findings, where its article has been read. Null leaves the overlay as a named gap. */
  overlayRules?: (i: ProjectInputs, abbr: string) => Finding[] | null;
  /** Overlays the ordinance has that the Atlas does not map: offered as ticks, since the lookup cannot find them */
  unmappedOverlays?: { abbr: string; name: string }[];
  /** The Atlas's kind of district corrected from the ordinance, by abbreviation ("Primarily Residential" and so on) */
  kinds?: Record<string, string>;
  /** Parking, dimensions and the like for a non-residential use; "mixed" for the commercial space of a mixed-use building */
  commercialFindings?: (i: ProjectInputs, part: "all" | "mixed") => Finding[];
  /** The route finding for a commercial project, quoting the town's own lines */
  commercialRoute?: (i: ProjectInputs, tree: TreeId) => Finding;
  /** Floor-area lines (sq ft of new floor area) that change a commercial project's review, for the alternatives */
  commercialLines?: number[];
  /** Whether a non-residential use is allowed in the district, from the town's own use table. Null where that row or district was not read. */
  useCommercial?: (i: ProjectInputs) => { value: "allowed" | "hearing" | "prohibited"; finding: Finding } | null;
  /** State-law steps this town does not have on a route, by step id */
  omit?: Partial<Record<TreeId, string[]>>;
  /** The stage by which state permits must be in hand. Cumberland's regulations say preliminary. */
  permitsBefore?: "prelim" | "final";
  /** True when the route depends on commercial floor area, so the intake form asks for it */
  asksCommercial?: boolean;
  /** Districts the Zoning Atlas lists that the town's current ordinance no longer has. The district picker marks them. */
  retired?: { zones: string[]; note: string };
  /** Route names and rules as the town defines them, where they differ from the state defaults */
  /** `stateTerms`: the town words the route its own way but means what state law means by it, so the glossary applies. */
  routeText?: Partial<Record<TreeId, { name?: string; rule: string; blurb: string; stateTerms?: boolean }>>;
  /** How well each route is sourced in this town, where its steps were read. */
  routeStatus?: Partial<Record<TreeId, string>>;
  /** Flags the project's overlays set, so a step or document can depend on them (ARD D53: a review area's own step) */
  overlayFlags?: (i: ProjectInputs) => Partial<Flags>;
  /** Steps the town adds to any route (or the routes named), placed before the first of `before` that the route has. Their own `cond` decides whether they apply. */
  extraSteps?: { step: Step; before: string[]; trees?: TreeId[] }[];
  /** Findings the town adds after the generic ones (its inclusionary zoning, its own conditions on a use) */
  moreFindings?: (i: ProjectInputs, tree: TreeId) => Finding[];
  /** Affordable shares the town requires, for the affordable key beside the state's and federal lines (ARD D53, decision 2) */
  affordableLines?: (i: ProjectInputs) => { short: string; what: string; src: string; need: number }[];
  /** True when the town's inclusionary zoning was read, so its own findings answer it in place of the generic note */
  inclusionaryRead?: boolean;
}

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
  /** A sentence from src[0], word for word, that the summary rests on. Checked by scripts/towns/verify_quotes.py. */
  q?: string;
  /** Seconds into the recording, when src[0] is a meeting recording. The link opens there. */
  t?: number;
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
  /** `rule` names the usual meeting day (weekday 0 = Sunday; nth week of the month). Without it, Cumberland's last-Thursday pattern is used. */
  pattern: { cutoffDaysBefore: number; note: string; rule?: { weekday: number; nth: number } };
}

/** Something kept in the tray. The id points at a thing on the site (ARD D42): f:<finding>, d:<step>|<document>, c:<contact>, t:<tick>, x:<field>, o:<objection>. */
export type PinType = "finding" | "doc" | "contact" | "date" | "fact" | "question";

export interface Pin {
  id: string;
  type: PinType;
  /** Marked as dealt with in the tray */
  resolved?: boolean;
  /** ISO time it was pinned */
  at: string;
}

export const PIN_TYPE_OF: Record<string, PinType> = { f: "finding", d: "doc", c: "contact", t: "date", x: "fact", o: "question" };
