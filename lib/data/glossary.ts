/*
 * Plain-language definitions for the terms the approval route leans on.
 * "match" lists the spellings to recognise in running text (case-insensitive, longest first).
 * Definitions are summaries for orientation. The statute or ordinance cited on each step governs.
 */
export interface GlossaryTerm {
  id: string;
  term: string;
  match: string[];
  def: string;
  /** Source id in lib/data/sources.ts, where one applies */
  src?: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  { id: "major", term: "Major land development", match: ["major land development"], def: "A project too large for minor review. For housing, that means 10 or more units. It goes through master, preliminary and final plan stages, with public hearings.", src: "s3939" },
  { id: "minor", term: "Minor land development", match: ["minor land development"], def: "A smaller project, including multi-family housing of 9 units or fewer. It skips the master plan stage and has shorter review clocks.", src: "s3938" },
  { id: "comp", term: "Comprehensive permit", match: ["comprehensive permit"], def: "A single application to the Planning Board for housing where at least 25% of the units are deed-restricted as affordable. The board can adjust local zoning rules such as use and density as part of the same decision.", src: "s5304" },
  { id: "dpr", term: "Development plan review", match: ["development plan review"], def: "A design-focused review of a site plan for uses the zoning already allows, such as reusing an existing building. It can be decided by staff or by the board, depending on the local ordinance.", src: "s2449" },
  { id: "udr", term: "Unified development review", match: ["unified development review"], def: "Lets the Planning Board decide zoning relief (variances and special use permits) together with the plan, so the project doesn't need a separate trip to the Zoning Board of Review.", src: "s3950" },
  { id: "preapp", term: "Pre-application meeting", match: ["pre-application meeting", "pre-application conference", "pre-application"], def: "An informal first meeting with planning staff, and sometimes the board, to get comments on a concept before a formal application. Nothing is approved or denied." },
  { id: "master", term: "Master plan", match: ["master plan"], def: "The first formal stage for a major project. It sets the overall concept: layout, unit count, access and relief needed. Engineering detail comes later." },
  { id: "prelim", term: "Preliminary plan", match: ["preliminary plan"], def: "The engineered stage: full site, drainage, utility and landscape plans, with state permits in hand. Most of the board's conditions are set here." },
  { id: "final", term: "Final plan", match: ["final plan"], def: "The last stage, confirming that the plans match the approval and that legal documents, guarantees and taxes are in order. It is often delegated to staff." },
  { id: "completeness", term: "Certificate of completeness", match: ["certificate of completeness", "certified complete", "completeness"], def: "Staff's written confirmation that an application contains everything the checklist requires. The statutory review clock starts when it is issued, not when you file." },
  { id: "ao", term: "Administrative Officer", match: ["administrative officer"], def: "The town official, usually the planning director or town planner, who receives applications, certifies completeness and decides the items the regulations delegate to staff." },
  { id: "trc", term: "Technical Review Committee", match: ["technical review committee", "TRC"], def: "A staff-level committee (planning, engineering, fire, public works and others) that reviews an application and sends a recommendation to the Planning Board before the hearing." },
  { id: "pb", term: "Planning Board", match: ["planning board"], def: "The appointed board of residents that decides land development and subdivision applications. Its members are appointed, not elected." },
  { id: "zbr", term: "Zoning Board of Review", match: ["zoning board of review"], def: "The appointed board that hears variances and special use permits when they are not handled through unified development review, and certain appeals." },
  { id: "abutter", term: "Abutter", match: ["abutters", "abutter"], def: "An owner of neighbouring property who is entitled to written notice of a public hearing. The notice radius is set by the local regulations." },
  { id: "byright", term: "By right", match: ["by right", "by-right"], def: "Allowed by the zoning without a hearing or discretionary approval, as long as the dimensional rules are met." },
  { id: "sup", term: "Special use permit", match: ["special use permit"], def: "Permission for a use the zoning allows only after a public hearing and specific findings." },
  { id: "variance", term: "Variance", match: ["use variance", "dimensional variance", "variances", "variance"], def: "Relief from a zoning rule. A dimensional variance relaxes a measurement such as a setback or height. A use variance allows a use the district prohibits, and is much harder to get." },
  { id: "relief", term: "Zoning relief", match: ["zoning relief", "density relief", "use relief"], def: "Any permission to depart from the zoning: a variance, a special use permit, or an adjustment under a comprehensive permit." },
  { id: "rezone", term: "Zone change", match: ["zone change", "rezoning"], def: "An amendment to the zoning map or text. It is a legislative decision of the Town Council, made after an advisory recommendation from the Planning Board and a public hearing." },
  { id: "prd", term: "Conservation development", match: ["conservation development", "planned residential development", "PRD"], def: "A layout that clusters the buildings on part of the site and permanently protects the rest as open space, often in exchange for a higher density. The Zoning Atlas labels these figures \"PRD\"." },
  { id: "density", term: "Density", match: ["units per acre", "density bonus", "density"], def: "How many dwelling units the zoning allows on a given amount of land, stated as units per acre or as lot area per unit." },
  { id: "deed", term: "Deed-restricted", match: ["deed-restricted", "deed restriction", "deed restrictions"], def: "Bound by a recorded restriction that keeps a unit affordable to low- or moderate-income households for a set term, commonly 30 to 99 years." },
  { id: "loe", term: "Letter of eligibility", match: ["letter of eligibility"], def: "RIHousing's letter confirming that a proposal qualifies as low- and moderate-income housing. A comprehensive permit application needs it, or a subsidy award letter.", src: "s5304" },
  { id: "inclusionary", term: "Inclusionary zoning", match: ["inclusionary zoning"], def: "A local rule requiring a share of units in new developments to be affordable. Cumberland's section is reserved, so no share is required outside a comprehensive permit." },
  { id: "vesting", term: "Vesting", match: ["vesting", "vested"], def: "The period during which an approval stays valid and is protected from later rule changes. If it lapses before the next stage is filed, the approval is lost unless extended." },
  { id: "guarantee", term: "Improvement guarantee", match: ["improvement guarantee", "guarantee", "bond"], def: "A bond or other security the applicant posts so the town can finish roads, drainage and other public improvements if the developer does not." },
  { id: "ler", term: "Land evidence records", match: ["land evidence records", "land evidence"], def: "The Town Clerk's permanent record of deeds, plans and decisions. An approved plan takes effect once it is recorded there." },
  { id: "platlot", term: "Plat and lot", match: ["assessor's plat", "plat and lot", "plat-lot"], def: "The tax assessor's map reference for a parcel, written like \"AP 54 Lot 7\". Town records index projects by it." },
  { id: "ripdes", term: "RIPDES", match: ["RIPDES"], def: "Rhode Island's stormwater discharge permit program, run by RIDEM. Construction that disturbs one acre or more needs coverage under its construction general permit." },
  { id: "pap", term: "Physical Alteration Permit", match: ["physical alteration permit"], def: "RIDOT's permit for a driveway, curb cut or any other work that touches a state road." },
  { id: "wetlands", term: "Freshwater wetlands permit", match: ["freshwater wetlands"], def: "RIDEM's review of work in or near wetlands, streams and their buffers. The wetland edge is usually verified by RIDEM before design is fixed." },
  { id: "adu", term: "ADU", match: ["accessory dwelling unit", "ADUs", "ADU"], def: "Accessory dwelling unit: a second, smaller home on the same lot as a house, such as a basement or garage apartment." },
  { id: "co", term: "Certificate of occupancy", match: ["certificates of occupancy", "certificate of occupancy"], def: "The Building Official's sign-off that a finished building meets the code and the approved plans, and may be lived in." },
  { id: "gfa", term: "Gross floor area", match: ["gross floor area"], def: "The total floor area inside a building's outside walls, on every floor. State law and town regulations use it to sort commercial and mixed-use projects into minor and major review.", src: "s3932" },
  { id: "usetable", term: "Use table", match: ["table of uses", "use table"], def: "The table in a zoning ordinance that lists, for each district, which uses are permitted by right, which need a special use permit, and which are not allowed." },
  { id: "atlas", term: "Zoning Atlas", match: ["rhode island zoning atlas", "zoning atlas"], def: "HousingWorks RI's statewide map of what each zoning district allows, built with the National Zoning Atlas method. It reflects zoning as of September 2024." },
];

export const GLOSSARY_BY_ID: Record<string, GlossaryTerm> = Object.fromEntries(GLOSSARY.map((g) => [g.id, g]));

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SPELLINGS: [string, string][] = GLOSSARY.flatMap((g) => g.match.map((m) => [m.toLowerCase(), g.id] as [string, string]))
  .sort((a, b) => b[0].length - a[0].length);
const LOOKUP = new Map(SPELLINGS);
const PATTERN = new RegExp(`\\b(${SPELLINGS.map(([m]) => escape(m)).join("|")})\\b`, "gi");

export type GlossPart = string | { id: string; text: string };

/** Split text into plain runs and glossary terms. Each term is marked once per call, at its first use. */
export function glossParts(text: string, skip: Set<string> = new Set()): GlossPart[] {
  const out: GlossPart[] = [];
  let last = 0;
  for (const m of text.matchAll(PATTERN)) {
    const id = LOOKUP.get(m[0].toLowerCase());
    if (!id || skip.has(id)) continue;
    skip.add(id);
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push({ id, text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
