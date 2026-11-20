import type { AtlasDistrict, CommercialUse, Finding, ProjectInputs, StepPlan, TreeId } from "../../../types";

/*
 * Providence's findings for a site, and its own durations for the steps it changes.
 * Trial reading, 2026-11-13, with the Zoning Ordinance (official copy of July 22, 2026) read on 2026-11-14 for
 * the use table, building heights, parking, and Article 19 (modifications, land development projects, adjustments,
 * administrative development plan review). Setbacks, coverage and design standards were not read.
 * Keep `src`, `pin` and `q` on one line for scripts/towns/verify_quotes.py.
 */

/*
 * Table 12-1 of the Zoning Ordinance (official copy, July 22, 2026), dwelling rows.
 * P = permitted by right, S = special use permit, "" = not allowed. Keys are the ordinance's district names.
 * The ordinance has no R-2 or C-1 district. The 2024 Zoning Atlas, which fills the district list, still has both.
 */
type U = "P" | "S" | "";
const P3 = { two: "P", three: "P", multi: "P" } as const, S3 = { two: "S", three: "S", multi: "S" } as const;
const USE: Record<string, { two: U; three: U; multi: U }> = {
  "R-1A": S3, "R-1": S3, "R-3": { two: "P", three: "P", multi: "S" }, "R-4": P3, RP: P3,
  "C-2": P3, "C-3": P3, "D-1": P3, "W-2": { two: "", three: "P", multi: "P" }, "M-MU": P3,
  "I-1": { two: "", three: "", multi: "P" }, "I-2": P3,
};
/** Districts the 2024 Atlas lists that the current ordinance does not have. */
export const PROVIDENCE_GONE = ["R-2", "C-1"];
const GONE = new Set(PROVIDENCE_GONE);
/** The ordinance's name for an Atlas district: the Atlas splits D-1, M-MU and I-1 by height and writes RP as R-P. */
const ordZone = (z: string) => z.replace(/^(D-1|M-MU|I-1)-\d+$/, "$1").replace("R-P", "RP");
/** Maximum building height by district, from Tables 4-1, 5-1 and 9-1. */
const HEIGHT: Record<string, string> = {
  "R-1A": "40 ft, not to exceed 3 stories", "R-1": "40 ft, not to exceed 3 stories", "R-3": "45 ft, not to exceed 3 stories",
  "R-4": "45 ft", RP: "45 ft", "C-2": "50 ft, not to exceed 4 stories", "C-3": "50 ft, not to exceed 4 stories", "W-2": "75 ft",
};
const RESIDENTIAL = new Set(["R-1A", "R-1", "R-3", "R-4", "RP"]);

/** Whether the housing type is allowed in the district, from the ordinance's use table. Null where the table was not read for it. */
export function providenceUse(i: ProjectInputs): { value: "allowed" | "hearing" | "prohibited"; finding: Finding } | null {
  const z = ordZone(i.zone), row = USE[z];
  if (!row || i.units < 2) return null;
  const kind = i.units === 2 ? "Two-family" : i.units === 3 ? "Three-family" : "Multi-family (4 or more units)";
  const u = i.units === 2 ? row.two : i.units === 3 ? row.three : row.multi;
  const cite: Pick<Finding, "src" | "pin" | "q"> =
    i.units === 2 ? { src: "pzo", pin: `Table 12-1, use matrix, ${z} column`, q: "Dwelling - Two-Family S S P P P P P P P P Sec. 1202.L" }
    : i.units === 3 ? { src: "pzo", pin: `Table 12-1, use matrix, ${z} column`, q: "Dwelling – Three-Family S S P P P P P P P P P Sec. 1202.L" }
    : { src: "pzo", pin: `Table 12-1, use matrix, ${z} column`, q: "Dwelling - Multi-Family S S S P P P P P P P P P Sec. 1202.K" };
  if (u === "P") return { value: "allowed", finding: { st: "pass", t: `${kind} housing is permitted in ${z}`, p: "Permitted by right in the use table of the current ordinance (July 2026). The 2024 Zoning Atlas may show this district differently.", ...cite } };
  if (u === "S") return { value: "hearing", finding: { st: "flag", t: `${kind} housing in ${z} needs a special use permit`, p: i.units >= 4 ? "With a plan under review, the City Plan Commission decides the permit after a public hearing, under unified development review." : "With no plan review, the Zoning Board of Review decides the permit. Its procedure was not read.", ...cite } };
  return { value: "prohibited", finding: { st: "fail", t: `${kind} housing is not allowed in ${z}`, p: "The use table has no entry for this district. It would take a use variance, a zone change or a comprehensive permit.", ...cite } };
}

/*
 * Table 12-1's rows for the short list of non-residential uses (ARD D30), read 2026-11-14 from the official copy of
 * July 22, 2026, by column position and checked against the row's count of marks and the multi-family row read by hand.
 * Each `q` is the row as printed, so verify_quotes.py can find it. P = permitted, S = special use permit, absent = not allowed.
 */
type Cell = "P" | "S";
interface UseRow { name: string; src: "pzo"; q: string; cells: Record<string, Cell> }
const all = (zs: string[], c: Cell = "P") => Object.fromEntries(zs.map((z) => [z, c])) as Record<string, Cell>;
const ROWS: Record<string, UseRow> = {
  office: { name: "Office", src: "pzo", q: "Office P P P P P P P P P P P", cells: all(["RP", "C-2", "C-3", "D-1", "W-2", "W-3", "M-1", "M-MU", "I-1", "I-2", "PS"]) },
  retailSmall: { name: "Retail Goods Establishment, 3,500 sq ft or less", src: "pzo", q: "Retail Goods Establishment - P P P P P P P P P P 3,500sf or less GFA", cells: all(["C-2", "C-3", "D-1", "W-2", "W-3", "M-1", "M-2", "M-MU", "I-1", "I-2"]) },
  retailLarge: { name: "Retail Goods Establishment, more than 3,500 sq ft", src: "pzo", q: "Retail Goods Establishment - P P P P P P P P P More than 3,500sf GFA", cells: all(["C-2", "C-3", "D-1", "W-2", "W-3", "M-1", "M-MU", "I-1", "I-2"]) },
  restSmall: { name: "Restaurant, 3,500 sq ft or less", src: "pzo", q: "Restaurant - 3,500sf or less P P P P P P P P P P GFA", cells: all(["C-2", "C-3", "D-1", "W-2", "W-3", "M-1", "M-2", "M-MU", "I-1", "I-2"]) },
  restLarge: { name: "Restaurant, more than 3,500 sq ft", src: "pzo", q: "Restaurant - more than 3,500sf P P P P P P P P GFA", cells: all(["C-2", "C-3", "D-1", "W-2", "M-1", "M-MU", "I-1", "I-2"]) },
  industrial: { name: "Industrial - Light", src: "pzo", q: "Industrial - Light P P P P P", cells: all(["C-3", "W-3", "M-1", "M-2", "M-MU"]) },
  school: { name: "Educational Facility, primary or secondary", src: "pzo", q: "Educational Facility - Primary or P P P P P P P P P P P P", cells: all(["R-1A", "R-1", "R-3", "R-4", "RP", "C-2", "C-3", "D-1", "W-2", "M-MU", "I-2", "PS"]) },
  health: { name: "Healthcare Institution", src: "pzo", q: "Healthcare Institution S P S P P P", cells: { "C-2": "S", "C-3": "P", "D-1": "S", "M-1": "P", "M-MU": "P", "I-1": "P" } },
  cultural: { name: "Cultural Facility", src: "pzo", q: "Cultural Facility P P P P P P P P P P P P P P", cells: all(["R-1A", "R-1", "R-3", "R-4", "RP", "C-2", "C-3", "D-1", "W-2", "M-MU", "I-1", "I-2", "PS", "OS"]) },
  worship: { name: "Place of Worship", src: "pzo", q: "Place of Worship P P P P P P P P P P P P P", cells: all(["R-1A", "R-1", "R-3", "R-4", "RP", "C-2", "C-3", "D-1", "W-2", "M-MU", "I-1", "I-2", "PS"]) },
};
/** The ordinance's districts, as Table 12-1's columns. A district outside these was not in the table read. */
const TABLE_ZONES = new Set(["R-1A", "R-1", "R-3", "R-4", "RP", "C-2", "C-3", "D-1", "W-2", "W-3", "M-1", "M-2", "M-MU", "I-1", "I-2", "PS", "OS", "CD"]);
const Q_KEY = "P indicates that the use is permitted in the district. S indicates that the use is a special use in the district and requires a special use permit. If a cell is blank, the use is not allowed in the district.";

function rowsFor(use: CommercialUse, area: number): UseRow[] {
  switch (use) {
    case "office": return [ROWS.office];
    case "retail": return [area > 3500 ? ROWS.retailLarge : ROWS.retailSmall];
    case "restaurant": return [area > 3500 ? ROWS.restLarge : ROWS.restSmall];
    case "industrial": return [ROWS.industrial];
    case "institutional": return [ROWS.school, ROWS.health, ROWS.cultural, ROWS.worship];
  }
}

const WORD: Record<"P" | "S" | "", string> = { P: "permitted", S: "a special use", "": "not allowed" };

/** Whether a non-residential use is allowed in the district, from Table 12-1. Null for a district the table doesn't have. */
export function providenceCommercialUse(i: ProjectInputs): { value: "allowed" | "hearing" | "prohibited"; finding: Finding } | null {
  const z = ordZone(i.zone);
  if (!TABLE_ZONES.has(z)) return null;
  const area = i.kind === "mixed" ? i.commercial : i.gfa;
  const rows = rowsFor(i.use, area);
  const marks: (Cell | "")[] = rows.map((r) => (r.cells[z] as Cell | undefined) ?? "");
  const value = marks.every((m) => m === "P") ? "allowed" : marks.every((m) => m === "") ? "prohibited" : "hearing";
  const part = i.kind === "mixed" ? " for the commercial space" : "";
  const cite = { src: "pzo", pin: `Table 12-1, ${rows.map((r) => r.name).join("; ")}, ${z} column`, q: rows.length === 1 ? rows[0].q : Q_KEY };
  if (rows.length > 1) {
    return {
      value,
      finding: {
        st: value === "allowed" ? "pass" : value === "prohibited" ? "fail" : "flag",
        t: `Institutional uses in ${z}: ${rows.map((r, k) => `${r.name.split(",")[0].toLowerCase()} ${WORD[marks[k]]}`).join("; ")}`,
        p: "Table 12-1 lists each institutional use on its own row. A special use needs a permit after a public hearing; with a plan under review the City Plan Commission decides it.",
        ...cite,
      },
    };
  }
  const name = rows[0].name;
  if (value === "allowed") return { value, finding: { st: "pass", t: `${name}${part}: permitted in ${z}`, p: "Permitted by right in the use table of the current ordinance (July 2026).", ...cite } };
  if (value === "hearing") return { value, finding: { st: "flag", t: `${name}${part}: a special use in ${z}`, p: "It needs a special use permit after a public hearing. With a plan under review, the City Plan Commission decides it.", ...cite } };
  return { value, finding: { st: "fail", t: `${name}${part}: not allowed in ${z}`, p: "The use table has no entry for this use in this district. It would take a use variance or a zone change.", ...cite } };
}

/**
 * A non-residential project's route under the city's regulations, Art. 2: a land development project at 10,000 sq ft
 * of new floor area, minor to 20,000, major above. Below that, a building permit, with administrative development
 * plan review for a new building over 2,500 sq ft in C-2, C-3, M-MU and W-2, and for a change of use on a lot of
 * 40,000 sq ft or more (as for housing).
 */
export function providenceClassifyCommercial(i: ProjectInputs): TreeId {
  if (i.work === "change") return i.lot >= 40000 ? "dpr" : "byright";
  if (i.gfa > 20000) return "major";
  if (i.gfa >= 10000) return "minor";
  return ["C-2", "C-3", "M-MU", "W-2"].includes(ordZone(i.zone)) && i.gfa > 2500 && i.work === "new" ? "dpr" : "byright";
}

/** The route finding for a non-residential project in Providence. */
export function providenceCommercialRoute(i: ProjectInputs, tree: TreeId): Finding {
  if (tree === "major") return { st: "info", t: `Major land development project: more than 20,000 sq ft of new floor area`, p: "The city's own lines, higher than the state's.", src: "pregs", pin: "Art. 2, Major land development project (C)(1)-(2)", q: "More than 20,000 square feet of new gross floor area of commercial, institutional, manufacturing, or industrial development" };
  if (tree === "minor") return { st: "info", t: `Minor land development project: ${i.gfa.toLocaleString("en-US")} sq ft of new floor area`, p: "Between 10,000 and 20,000 sq ft of new floor area is minor review in Providence.", src: "pregs", pin: "Art. 2, Minor land development project (B)(1)-(2)", q: "Between 10,000 and 20,000 square feet of new gross floor area of commercial, institutional, manufacturing, or industrial development" };
  return { st: "info", t: `Not a land development project: under 10,000 sq ft of new floor area`, p: tree === "dpr" ? "It gets administrative development plan review, decided by staff with no hearing." : "It goes to a building permit, with the zoning checked there.", src: "pregs", pin: "Art. 2, A(1)", q: "New construction of 10,000 square feet or more in gross floor area" };
}

/*
 * Parking (Table 14-1, § 1410) and dimensions (Tables 4-1 to 9-1) for the short list of non-residential uses, read
 * 2026-11-14 from the same copy of the ordinance. Setbacks in the residential districts and the design standards were
 * not read; they are named as gaps.
 */
type Dim = { height: string; front: string; side: string; rear: string; cover?: string; src: "pzo"; pin: string; q?: string };
function providenceDim(zone: string): Dim | null {
  const z = ordZone(zone);
  const sub = zone.match(/^(?:D-1|M-MU|I-1)-(\d+)$/)?.[1];
  switch (z) {
    case "C-2": return { height: "50 ft, not to exceed 4 stories", cover: "none", front: "a build-to zone of 0 to 5 ft", side: "none, or 10 ft beside a residential district", rear: "none, or 10 ft beside a residential district", src: "pzo", pin: "Table 5-1", q: "Maximum Building Height 50’, not to exceed 4 stories 50’, not to exceed 4 stories" };
    case "C-3": return { height: "50 ft, not to exceed 4 stories", cover: "none", front: "none, unless a multi-tenant retail center (§ 503.B)", side: "none, or 10 ft beside a residential district", rear: "none, or 20 ft beside a residential district", src: "pzo", pin: "Table 5-1", q: "Maximum Building Height 50’, not to exceed 4 stories 50’, not to exceed 4 stories" };
    case "D-1": return sub
      ? { height: `${sub} ft (sub-district D-1-${sub}); at least 3 stories`, front: "on an A Street, a build-to zone of 0 to 8 ft for 80% of the frontage; on a B Street, none", side: "a 0 ft build-to line", rear: "none", src: "pzo", pin: "Table 6-1 and § 602.B", q: `D-1-${sub} equals a maximum building height of ${sub} feet` }
      : { height: "by height sub-district (§ 602.B); at least 3 stories", front: "on an A Street, a build-to zone of 0 to 8 ft for 80% of the frontage; on a B Street, none", side: "a 0 ft build-to line", rear: "none", src: "pzo", pin: "Table 6-1" };
    case "I-1": case "I-2": return { height: `${z === "I-2" ? 75 : sub === "200" ? 200 : 75} ft, lower near a residential district on a sliding scale`, front: "none", side: "none, or beside a residential district 6 ft plus 4 ft for each 12 ft of height over 12 ft", rear: "none, or 30 ft beside a residential district", src: "pzo", pin: "Table 7-1", q: "up to 75 ’. (Figure 7-1) up to 200 ’. (Figure 7-1) up to 75’. (Figure 7-1)" };
    case "M-MU": case "M-1": case "M-2": return { height: `${z === "M-MU" ? (sub === "90" ? 90 : 75) : z === "M-1" ? 75 : 90} ft`, front: `none, or ${z === "M-2" ? 20 : 10} ft with a residential district across the street`, side: `none, or ${z === "M-MU" ? 10 : 20} ft beside a residential district`, rear: "none, or 20 ft beside a residential district", src: "pzo", pin: "Table 8-1", q: "Maximum Building 75’ 90’ 75’ 90’ Height" };
    case "W-2": case "W-3": return { height: z === "W-2" ? "75 ft" : "90 ft", front: "none", side: "6 ft", rear: `none, or ${z === "W-2" ? 20 : 30} ft beside a residential district`, src: "pzo", pin: "Table 9-1", q: "Maximum Building Height 75’ 90’" };
    default: return null;
  }
}

const P500: Partial<Record<CommercialUse, { label: string; src: "pzo"; q: string }>> = {
  office: { label: "1 per 500 sq ft", src: "pzo", q: "Office 1 per 500sf GFA 1 per 5,000sf GFA 50%" },
  retail: { label: "1 per 500 sq ft", src: "pzo", q: "Retail Goods Establishment 1 per 500sf GFA" },
  restaurant: { label: "1 per 500 sq ft", src: "pzo", q: "Restaurant 1 per 500sf GFA" },
};

/** Parking under Table 14-1 and its exemptions in § 1410.B. */
function providenceCommercialParking(i: ProjectInputs, part: string): Finding {
  const z = ordZone(i.zone);
  const area = i.kind === "mixed" ? i.commercial : i.gfa;
  if (z === "D-1") return { st: "pass", t: `Parking${part}: none required downtown`, p: "Bicycle parking is not required either.", src: "pzo", pin: "§ 1410.B.1", q: "The D-1 District is exempt from all off-street vehicle and bicycle parking requirements." };
  if ((z === "R-4" || z === "C-2") && i.lot <= 10000) return { st: "pass", t: `Parking${part}: none required on a lot of 10,000 sq ft or less in ${z}`, p: "The exemption is for the lot, whatever the use.", src: "pzo", pin: "§ 1410.B.7", q: "In the R-4 and C-2 districts, all lots of 10,000 square feet or less are exempt from parking" };
  const rate = P500[i.use];
  if (!rate) {
    return i.use === "industrial"
      ? { st: "info", t: `Parking${part}: 1 per 5 employees`, p: "Not counted here: the form does not ask for employees. Bicycle parking: 1 per 5 employees, half of them long-term.", src: "pzo", pin: "Table 14-1, Industrial - Light", q: "Industrial - Light 1 per 5 employees 1 per 5 employees 50%" }
      : { st: "info", t: `Parking${part}: by the kind of institution`, p: "A healthcare institution or cultural facility 1 per 500 sq ft; a primary or secondary school 1 per 3 employees; a place of worship 1 per 8 seats (1 per 5 in R-1 and R-3).", src: "pzo", pin: "Table 14-1", q: "Health Care Institution 1 per 500sf GFA" };
  }
  const exempt = ["RP", "C-2", "C-3"].includes(z) ? 2500 : 0;
  const half = i.zone === "M-MU-90";
  const n = Math.ceil((Math.max(0, area - exempt) / 500) * (half ? 0.5 : 1));
  const notes = [exempt ? "the first 2,500 sq ft exempt in this district (§ 1410.B.5)" : "", half ? "the requirement halved in M-MU-90 (§ 1410.B.6)" : ""].filter(Boolean);
  return {
    st: "info", t: `Parking${part}: ${n} space${n === 1 ? "" : "s"} (${rate.label})`,
    p: `${notes.length ? `Counted with ${notes.join(", and ")}. ` : ""}Bicycle parking is also required above 10,000 sq ft.`,
    src: "pzo", pin: `Table 14-1, ${USE_ROW[i.use]}`, q: rate.q,
  };
}
const USE_ROW: Record<CommercialUse, string> = { office: "Office", retail: "Retail Goods Establishment", restaurant: "Restaurant", industrial: "Industrial - Light", institutional: "institutional uses" };

/** What Providence's ordinance says about a non-residential project beyond its use. "mixed": the commercial space of a mixed-use building. */
export function providenceCommercialFindings(i: ProjectInputs, part: "all" | "mixed"): Finding[] {
  const label = part === "mixed" ? " for the commercial space" : "";
  const out: Finding[] = [providenceCommercialParking(i, label)];
  if (part === "mixed") return out;
  const area = i.gfa;
  const loadAt = i.use === "industrial" ? 10000 : 20000;
  if (area >= loadAt) {
    out.push({ st: "info", t: "Loading: at least 1 off-street loading space", p: `A ${i.use === "industrial" ? "industrial use of 10,000 to 40,000" : "commercial or institutional use of 20,000 to 100,000"} sq ft needs one, kept apart from the parking.`, src: "pzo", pin: "Table 14-2", q: i.use === "industrial" ? "10,000 - 40,000sf GFA 1 loading spaces" : "20,000 - 100,000sf GFA 1 loading space" });
  }
  const d = providenceDim(i.zone);
  if (d) {
    out.push({
      st: "info", t: `${ordZone(i.zone)}: height ${d.height}${d.cover ? `, building coverage ${d.cover}` : ""}`,
      p: `Front: ${d.front}. Side: ${d.side}. Rear: ${d.rear}. The City Plan Commission can adjust these in land development review; staff can modify a dimension by up to 15%.`,
      src: d.src, pin: d.pin, q: d.q,
    });
  } else {
    out.push({
      st: "info", t: `Not read: setbacks and coverage for a non-residential use in ${ordZone(i.zone)}`,
      p: "The residential districts' table (4-1) sets them by building type, and was read for heights only.",
      gap: "Providence Zoning Ordinance, Table 4-1",
    });
  }
  out.push({
    st: "info", t: "Not read: the district's design standards",
    p: "Façade, entrance, transparency and materials standards apply to new non-residential buildings and can be waived through development plan review.",
    gap: "Providence Zoning Ordinance, the design standards section of the district's article (for example § 503 for C-2 and C-3)",
  });
  return out;
}

export function providenceFindings(i: ProjectInputs, tree: TreeId, generic: Finding[], d: AtlasDistrict | undefined): Finding[] {
  const out: Finding[] = [];
  const commercial = i.commercial ?? 0;
  const z = ordZone(i.zone);

  if (i.type === "reuse") {
    out.push({
      st: "flag", t: "Reuse of an existing building: probably not a land development project",
      p: `The thresholds count new floor area, so ${i.units} units inside an existing building do not reach them. ${i.lot >= 40000 ? "A change of use on a lot of 40,000 sq ft or more gets administrative development plan review." : "Below a 40,000 sq ft lot that leaves the building permit."} Ask the administrative officer to confirm the category in writing.`,
      src: "pregs", pin: "§ 1002.A", q: "the administrative officer shall advise the applicant as to which category of approval is required for a project",
    });
  } else if (i.units >= 10) {
    out.push({
      st: "info",
      t: commercial > 2500
        ? `Major land development project: ${i.units} units with more than 2,500 sq ft of commercial space`
        : `Minor land development project: ${i.units} units with ${commercial > 0 ? "no more than 2,500 sq ft of" : "no"} commercial space`,
      p: "In Providence the commercial floor area, not the unit count, separates minor from major. A residential building of any size is a minor project.",
      src: "pregs", pin: "Art. 2, Minor land development project (B)(3)", q: "units and between 0 and 2,500 gross square feet of commercial space",
    });
  } else if (i.units >= 4) {
    out.push({
      st: "info", t: `Administrative development plan review: ${i.units} units of new construction`,
      p: "Too small to be a land development project, which starts at 10 units. Planning staff review new multi-family buildings for the ordinance's design standards, in one stage and with no hearing.",
      src: "pzo", pin: "§ 1905.C.1.c", q: "All new construction of rowhouse developments and multi-family dwellings.",
    });
  } else {
    out.push({
      st: "info", t: `${i.units} unit${i.units === 1 ? "" : "s"}: a building permit, with no plan review in most cases`,
      p: "Two exceptions the site cannot tell from these facts: new rowhouses of any size, and any new building over 2,500 sq ft in the C-2, C-3, M-MU and W-2 districts, both of which get administrative development plan review.",
      src: "pzo", pin: "§ 1905.C.1.b", q: "All new construction of more than 2,500 square feet of gross floor area, including additions to",
    });
  }
  if (tree === "comp") {
    out.push({ st: "flag", t: "Comprehensive permit: Providence's own procedure was not read", p: "The steps shown for this route are state law only. Ask planning staff how the City Plan Commission handles a comprehensive permit application." });
  }

  const use = providenceUse(i);
  generic.filter((g) => g.key !== "route").forEach((g) => {
    const isUse = g.key === "use";
    if (isUse && GONE.has(i.zone)) {
      out.push({
        st: "flag", t: `${i.zone} is not a district in the current ordinance`,
        p: "The district list here comes from the Zoning Atlas of September 2024. Providence's ordinance as of July 2026 has no R-2 or C-1 district. Find the parcel's present district on the City's zoning map and choose that one.",
        src: "pzo", pin: "Table 12-1, use matrix, column headings", q: "Use R-1A R-1 R-3 R-4 RP C-2 C-3 D-1 W-2 W-3 M-1 M-2 M-MU I-1 I-2 PS OS CD Use Standard",
      });
      return;
    }
    if (isUse && use) { out.push(use.finding); return; }
    if (g.key === "parking" && !i.transit) {
      if (z === "D-1") {
        out.push({ st: "pass", t: "Parking: none required downtown", p: "Bicycle parking is not required either.", src: "pzo", pin: "§ 1410.B.1", q: "The D-1 District is exempt from all off-street vehicle and bicycle parking requirements." });
      } else if ((z === "R-4" || z === "C-2") && i.lot > 0 && i.lot <= 10000) {
        out.push({
          st: "pass", t: `Parking: none required on a lot of 10,000 sq ft or less in ${z}`,
          p: "128 Wayland Avenue, on 4,500 sq ft, provides no vehicle parking. Expect the question anyway: at 269 Wickenden Street neighbours challenged a lot split that brought the site down to 10,000 sq ft, and a court called it troubling.",
          src: "pzo", pin: "§ 1410.B.7", q: "In the R-4 and C-2 districts, all lots of 10,000 square feet or less are exempt from parking",
        });
      } else if (i.zone === "M-MU-90") {
        out.push({ ...g, p: "In the M-MU-90 sub-district the requirement of one space per unit may be reduced by half.", src: "pzo", pin: "§ 1410.B.6", q: "In the M-MU-90 Sub-District of the M-MU District, parking requirements may be reduced by 50% of" });
      } else {
        out.push({
          st: "info", t: `Parking: ${i.units} spaces required (1 per unit)`,
          p: i.units >= 10
            ? "The City Plan Commission can cut the requirement by up to half as a dimensional adjustment. It did so at 27 East River Street, after asking the applicant to look for ways to reach one space per unit."
            : "Bicycle parking is also required for multi-family buildings, at 1 space per 5 dwellings.",
          src: "pzo", pin: "Table 14-1", q: "Dwelling - Multi-Family 1 per dwelling unit",
        });
      }
      return;
    }
    if (g.key === "height") return; // replaced below from the ordinance's own tables
    // The state permits finding says Providence's rule itself (`permitsRule` in steps.ts).
    out.push(g);
  });
  void d;

  if (HEIGHT[z] && i.units >= 3) {
    const more = RESIDENTIAL.has(z) ? "up to 12 ft and one story more" : "up to 24 ft and two stories more";
    out.push({
      st: "info", t: `Height limit: ${HEIGHT[z]}`,
      p: i.units >= 10
        ? `Through land development project review the City Plan Commission can adjust this by ${more}, on stated grounds such as structured parking or public open space. 128 Wayland Avenue and 150 Pitman Street each got a fifth story in C-2, and 27 East River Street 90 ft in W-2. One approval was vacated in court over how the ordinance then worded feet and stories.`
        : "Below 10 units there is no Commission adjustment. Staff can grant a 15% modification of a dimensional requirement. Beyond that it takes a variance.",
      ...(z === "C-2" || z === "C-3"
        ? { src: "pzo", pin: "Table 5-1, maximum building height", q: "50’, not to exceed 4 stories" }
        : { src: "pzo", pin: `${z === "W-2" ? "Table 9-1" : "Table 4-1"}, maximum building height` }),
    });
  }
  if (i.units >= 10 && i.type === "new") {
    out.push({
      st: "info", t: "What the Commission can adjust, and how far",
      p: `Setbacks by 10 ft, height by ${RESIDENTIAL.has(z) ? "12 ft and one story" : "24 ft and two stories"}, dwelling unit density by 50%, and required parking by 50%${RESIDENTIAL.has(z) ? ", and building coverage by 25%" : ""}. Each needs one of the listed grounds.`,
      src: "pzo", pin: "§ 1904.E.2", q: "The City Plan Commission adjustments are limited to the following thresholds:",
    });
  }
  if (i.zone === "W-2") {
    out.push({
      st: "flag", t: "Waterfront district: expect coastal review",
      p: "At 27 East River Street the Coastal Resources Management Council required public access to the water, a stormwater plan and soil testing. Its approval is filed with the final plan.",
      src: "psr27er2512", pin: "Environmental Impact", q: "The project falls under the purview of the CRMC as it is located within the coastal zone.",
    });
  }
  if (i.units >= 10 && i.type === "new") {
    out.push({
      st: "info", t: "No demolition or site work until the final plan is approved",
      p: "This covers demolition, foundation and building permits, so the carrying cost of the site runs through the whole review.",
      src: "pzo", pin: "§ 1904.B", q: "No demolition, foundation, or building permits will be issued, and no site work will be allowed for any development requiring approval",
    });
  }
  out.push({
    st: "flag", t: "The district list comes from the 2024 Zoning Atlas, and the ordinance has changed since",
    p: "For Providence the use table, building heights, parking and the Commission's adjustments on this page were read from the ordinance of July 2026. Setbacks, coverage and design standards were not, and the Atlas still lists two districts the ordinance no longer has. Confirm the parcel's district on the City's zoning map.",
    src: "pzo", pin: "Official copy, July 22, 2026",
  });
  return out;
}

/*
 * Durations and key moments where Providence differs from the shared schedule: no committee meeting,
 * the City Plan Commission's own names, and one filing deadline about four weeks before each meeting.
 * Clocks are from the regulations (Arts. 4 and 5). Keys are "tree:step".
 */
const preapp = (wait: string): StepPlan => ({
  est: 21,
  ticks: [
    { d: 0, label: "Ask Commission staff for a pre-application meeting, and write to the ward councillor", kind: "file", docs: "all" },
    { d: 21, label: `Meeting held (estimate). ${wait}`, kind: "milestone" },
  ],
});
const rezone: StepPlan = {
  est: 150,
  ticks: [
    { d: 0, label: "File the zone change petition with the City Council", kind: "file", docs: "all" },
    { d: 45, label: "City Plan Commission advisory recommendation", kind: "hearing", cal: "pb", docs: ["Bring the building, not only the map change"] },
    { d: 150, label: "City Council vote (estimate)", kind: "milestone", note: "Legislative decision. No statutory deadline. The Council's committee steps were not read." },
  ],
};

export const PROVIDENCE_SCHEDULE: Record<string, StepPlan> = {
  "dpr:preapp": preapp("Not required."),
  "dpr:prelim": {
    est: 40, statutory: true,
    ticks: [
      { d: 0, label: "File the development plan review application", kind: "file", docs: "all" },
      { d: 15, label: "Completeness certified (latest)", kind: "deadline" },
      { d: 40, label: "Decision deadline, 25 days after certification", kind: "deadline", docs: ["Decision deadline"] },
    ],
  },
  "minor:preapp": preapp("Not required."),
  "major:preapp": preapp("With no meeting set within 60 days of asking, you may file."),
  "minor:rezone": rezone,
  "major:rezone": rezone,
  "minor:prelim": {
    est: 80, statutory: true,
    ticks: [
      { d: 0, label: "File the complete preliminary plan", kind: "file", docs: "all" },
      { d: 15, label: "Completeness certified (25 days when a hearing is needed)", kind: "deadline" },
      { d: 30, label: "Newspaper and mailed notice, if a public hearing is needed", kind: "file", cal: "notice", docs: ["Public hearing notice, placed and paid for by you", "Unified development review form, notice list and affidavit"] },
      { d: 44, label: "City Plan Commission meeting, when the Commission decides", kind: "hearing", cal: "pb", note: "Staff decide instead when no adjustment, waiver or relief is requested.", docs: ["Request for an adjustment or design waiver", "Traffic study, if asked", "Renderings from the street"] },
      { d: 80, label: "Decision deadline (95 days after certification with a hearing)", kind: "deadline", docs: ["Decision deadline"] },
    ],
  },
  "major:master": {
    est: 115, statutory: true,
    ticks: [
      { d: 0, label: "File the complete master plan application", kind: "file", docs: "all" },
      { d: 25, label: "Completeness certified (latest)", kind: "deadline" },
      { d: 40, label: "Newspaper and mailed hearing notice (14 days before)", kind: "file", cal: "notice", docs: ["Public hearing"] },
      { d: 54, label: "City Plan Commission public hearing", kind: "hearing", cal: "pb", note: "Bring answers to the common questions for this step." },
      { d: 115, label: "Decision deadline. Silence counts as approval.", kind: "deadline", docs: ["Decision deadline", "Vesting"] },
    ],
  },
  "major:state": {
    est: 180, with: "master",
    ticks: [
      { d: 0, label: "Start state permits, the stormwater plan and the traffic study", kind: "file", docs: "all" },
      { d: 180, label: "State permits in hand (estimate). Due before final approval.", kind: "milestone", docs: ["Permits due before final approval"] },
    ],
  },
  "major:prelim": {
    est: 115, statutory: true,
    ticks: [
      { d: 0, label: "File the complete preliminary plan", kind: "file", docs: "all" },
      { d: 25, label: "Completeness certified (latest)", kind: "deadline" },
      { d: 40, label: "Mail abutter notice (14 days before)", kind: "file", cal: "notice", docs: ["Abutter notice"] },
      { d: 54, label: "City Plan Commission meeting", kind: "hearing", cal: "pb", docs: ["Answers to what the Commission asked at the hearing"] },
      { d: 115, label: "Decision deadline", kind: "deadline", docs: ["Decision deadline"] },
    ],
  },
};
