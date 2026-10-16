import type { StepPlan } from "../types";

/*
 * Planned duration and key moments ("ticks") for each step, in calendar days from the step's start.
 * Durations marked statutory come from the review clocks in R.I. Gen. Laws ch. 45-23 / 45-53;
 * the rest are planning estimates. Keys are "tree:step" with a fallback of "step".
 * Each tick lists the documents it concerns, so a tick on the timeline opens those checklists.
 */
export const SCHEDULE: Record<string, StepPlan> = {
  zoning: {
    est: 21,
    ticks: [
      { d: 0, label: "Pull zoning, Atlas and GIS data", kind: "file", docs: ["Zoning district and permitted use", "Parcel geometry from statewide GIS"] },
      { d: 14, label: "Density and use check complete", kind: "milestone", docs: ["Lot area per dwelling unit", "Inclusionary zoning status", "Parking cap near transit"] },
      { d: 21, label: "Pick the route: by right, relief, zone change or comprehensive permit", kind: "milestone" },
    ],
  },
  rezone: {
    est: 150,
    ticks: [
      { d: 0, label: "File the zone change petition", kind: "file", docs: "all" },
      { d: 45, label: "Planning Board advisory recommendation", kind: "hearing", docs: ["Planning Board recommendation to the Town Council"] },
      { d: 120, label: "Town Council public hearing", kind: "hearing", docs: ["Who the governing body is"] },
      { d: 150, label: "Town Council vote", kind: "milestone", note: "Legislative decision. No statutory deadline." },
    ],
  },
  preapp: {
    est: 60, statutory: true,
    ticks: [
      { d: 0, label: "Submit the pre-application package", kind: "file", docs: ["Pre-application submission", "Concept site plan and building massing"] },
      { d: 15, label: "Completeness certified (latest)", kind: "deadline", docs: ["Completeness review"] },
      { d: 60, label: "Meeting held. If none is scheduled by now, you may file the master plan.", kind: "hearing", docs: ["Concept site plan and building massing"] },
    ],
  },
  master: {
    est: 115, statutory: true,
    ticks: [
      { d: 0, label: "File the master plan application", kind: "file", docs: "all" },
      { d: 25, label: "Completeness certified (latest)", kind: "deadline" },
      { d: 45, label: "Technical Review Committee review", kind: "milestone", docs: ["Neighbourhood impact analysis", "Buildable area and constraints plan"] },
      { d: 61, label: "Mail and publish hearing notice (14 days before)", kind: "file", docs: ["Abutter list on mailing labels, with notice paid by you", "Unified development review request"] },
      { d: 75, label: "Planning Board public hearing", kind: "hearing", note: "Bring answers to the common questions for this step." },
      { d: 115, label: "Decision deadline. Silence counts as approval.", kind: "deadline", docs: ["Decision deadline", "Vesting"] },
    ],
  },
  state: {
    est: 120, with: "master",
    ticks: [
      { d: 0, label: "Apply for state permits and utility letters", kind: "file", docs: "all" },
      { d: 30, label: "Water and sewer letters in hand", kind: "milestone", docs: ["Water service confirmation", "Sewer service confirmation"] },
      { d: 120, label: "State permits in hand (estimate)", kind: "milestone", docs: ["Local rule on state permits", "RIDEM freshwater wetlands determination or permit", "RIPDES construction stormwater permit", "RIDOT Physical Alteration Permit, or a letter that it will issue"] },
    ],
  },
  prelim: {
    est: 115, statutory: true,
    ticks: [
      { d: 0, label: "File the preliminary plan", kind: "file", docs: "all" },
      { d: 25, label: "Completeness certified (latest)", kind: "deadline" },
      { d: 40, label: "Technical Review Committee review", kind: "milestone", docs: ["Engineered plans at 1\" = 40'", "Police traffic officer advisory report"] },
      { d: 61, label: "Mail abutter notice (14 days before)", kind: "file", docs: ["Abutter notice"] },
      { d: 75, label: "Planning Board public hearing", kind: "hearing", docs: ["Landscape plan", "Street lighting plan", "Parking computations"] },
      { d: 115, label: "Decision deadline. Board also approves the guarantee.", kind: "deadline", docs: ["Improvement guarantee and construction schedule", "Decision deadline"] },
    ],
  },
  "minor:prelim": {
    est: 80, statutory: true,
    ticks: [
      { d: 0, label: "File the preliminary plan", kind: "file", docs: "all" },
      { d: 15, label: "Completeness certified (25 days with relief)", kind: "deadline" },
      { d: 80, label: "Decision deadline (95 days after certification with relief)", kind: "deadline", docs: ["Decision deadline", "Unified development review request"] },
    ],
  },
  "dpr:prelim": {
    est: 80,
    ticks: [
      { d: 0, label: "File the development plan review application", kind: "file", docs: "all" },
      { d: 80, label: "Decision (Cumberland minor timelines)", kind: "deadline" },
    ],
  },
  final: {
    est: 60, statutory: true,
    ticks: [
      { d: 0, label: "File the final plan", kind: "file", docs: "all" },
      { d: 15, label: "Completeness certified (25 if changed)", kind: "deadline" },
      { d: 60, label: "Decision deadline", kind: "deadline", docs: ["Decision deadline"] },
    ],
  },
  "minor:final": { est: 25, statutory: true, ticks: [{ d: 0, label: "File the final plan", kind: "file", docs: "all" }, { d: 25, label: "Decision deadline", kind: "deadline" }] },
  "dpr:final": { est: 25, ticks: [{ d: 0, label: "File the final development plan", kind: "file", docs: "all" }, { d: 25, label: "Decision. Then one year to obtain building permits.", kind: "deadline" }] },
  "comp:final": { est: 45, statutory: true, ticks: [{ d: 0, label: "File the final plan with affordability documents", kind: "file", docs: "all" }, { d: 45, label: "Decision deadline", kind: "deadline" }] },
  elig: {
    est: 60,
    ticks: [
      { d: 0, label: "Request the RIHousing letter of eligibility", kind: "file", docs: ["Letter of eligibility", "Eligibility threshold"] },
      { d: 60, label: "Letter in hand (estimate)", kind: "milestone", docs: ["Density bonus (public sewer and water)"] },
    ],
  },
  "comp:preapp": {
    est: 30, statutory: true,
    ticks: [
      { d: 0, label: "Request the pre-application conference", kind: "file", docs: "all" },
      { d: 30, label: "Conference held, or you may proceed", kind: "hearing" },
    ],
  },
  record: {
    est: 30,
    ticks: [
      { d: 0, label: "Sign the approved plan", kind: "file", docs: "all" },
      { d: 20, label: "Appeal window closes (20 days from recording and posting)", kind: "deadline" },
      { d: 30, label: "Plan recorded in the Land Evidence Records", kind: "milestone" },
    ],
  },
  "comp:record": {
    est: 30,
    ticks: [
      { d: 0, label: "Decision recorded (within 20 days)", kind: "file", docs: "all" },
      { d: 30, label: "Start the 12-month construction clock", kind: "deadline", docs: ["Construction deadlines"] },
    ],
  },
  appeal: {
    est: 20, with: "record",
    ticks: [
      { d: 0, label: "Decision recorded and posted", kind: "milestone" },
      { d: 20, label: "Last day to file an appeal", kind: "deadline", docs: "all" },
    ],
  },
  zcheck: { est: 14, ticks: [{ d: 0, label: "Submit the plot plan", kind: "file", docs: "all" }, { d: 14, label: "Zoning sign-off", kind: "milestone" }] },
  building: {
    est: 60,
    ticks: [
      { d: 0, label: "Apply for the building permit and fire review", kind: "file", docs: "all" },
      { d: 30, label: "Fire plan review appointment", kind: "milestone", docs: ["Sprinkler and fire alarm plans for fire plan review"] },
      { d: 60, label: "Building permit issued (estimate)", kind: "milestone", docs: ["Utility connection applications", "RIDOT Physical Alteration Permit"] },
    ],
  },
  "byright:building": { est: 45, ticks: [{ d: 0, label: "Apply for the building permit", kind: "file", docs: "all" }, { d: 45, label: "Permit issued (estimate)", kind: "milestone" }] },
  occupy: {
    est: 365,
    ticks: [
      { d: 0, label: "Construction starts", kind: "file", docs: ["Inspection requests and as-built drawings"] },
      { d: 120, label: "Framing and rough inspections", kind: "milestone", docs: ["Inspection requests and as-built drawings"] },
      { d: 330, label: "Public improvements inspected and accepted", kind: "hearing", docs: ["Request for release of the improvement guarantee"] },
      { d: 365, label: "Certificate of occupancy: move in", kind: "milestone", docs: "all" },
    ],
  },
  "byright:occupy": {
    est: 240,
    ticks: [
      { d: 0, label: "Construction starts", kind: "file", docs: "all" },
      { d: 240, label: "Certificate of occupancy", kind: "milestone" },
    ],
  },
};
