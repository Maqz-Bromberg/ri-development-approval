import type { CommercialUse, Finding, ProjectInputs } from "../../../types";

/*
 * Cumberland's rules for non-residential uses, read 2026-11-14 from the Zoning Ordinance: Table 1 (the use table, an
 * eCode360 attachment, Supp 19 of April 2026), Appendix A (use definitions), § 5-3 (commercial and industrial
 * dimensions) and § 14-3 (parking by use, amended April 15, 2026). The first of Cumberland's rules to sit in its own
 * folder rather than in trees.ts (ARD debt 1). Keep `src`, `pin` and `q` on one line for verify_quotes.py.
 */

type Cell = "Y" | "S";
interface UseRow { name: string; src: "czt1"; q: string; cells: Record<string, Cell> }
const yes = (zs: string[]) => Object.fromEntries(zs.map((z) => [z, "Y"])) as Record<string, Cell>;

/** Table 1's columns. Overlays (BMMU, AHMU) are not in it; they have their own rules in Article 9, not read. */
const ZONES = new Set(["A-1", "A-2", "R-1", "R-2", "R-3", "C-1", "C-2", "I-1", "I-2", "OS"]);

const ROWS: Record<string, UseRow> = {
  // Appendix A: "56. Limited business service — Advertising agency; business office; ..." The nearest row to a general office.
  office: { name: "Limited business service (business office)", src: "czt1", q: "56. Limited business service N N N N N Y Y Y N N", cells: yes(["C-1", "C-2", "I-1"]) },
  retailSmall: { name: "Retail trade, 15,000 sq ft total GFA or less", src: "czt1", q: "74. Retail trade, 15,000 square feet total GFA N N N N N Y Y N N N or less", cells: yes(["C-1", "C-2"]) },
  retailLarge: { name: "Retail trade, more than 15,000 sq ft total GFA", src: "czt1", q: "75. Retail trade, more than 15,000 square feet N N N N N N Y N N N total GFA", cells: yes(["C-2"]) },
  restaurant: { name: "Restaurant", src: "czt1", q: "78. Restaurant1 N N N N N Y Y Y N N", cells: yes(["C-1", "C-2", "I-1"]) },
  // Manufacturing is listed product by product (rows 94 to 116). Machinery is a typical light-industrial row.
  industrial: { name: "Machinery and machine parts (manufacturing is listed by product)", src: "czt1", q: "108. Machinery and machine parts N N N N N N N Y Y N", cells: yes(["I-1", "I-2"]) },
  school: { name: "Educational institution, elementary through high school, private", src: "czt1", q: "25. Educational institutions: Elementary N S Y Y Y Y Y N N S 18-3(l) through high school, private", cells: { "A-2": "S", "R-1": "Y", "R-2": "Y", "R-3": "Y", "C-1": "Y", "C-2": "Y", OS: "S" } },
  health: { name: "Medical and health services: hospital, medical services, clinic", src: "czt1", q: "28. Medical and health services N N N N N N N N N N hospital/medical services/clinic", cells: {} },
  cultural: { name: "Nonprofit library, museum or art gallery", src: "czt1", q: "41. Nonprofit library, museum or art gallery N N N N N Y Y N N N", cells: yes(["C-1", "C-2"]) },
  worship: { name: "Religious services", src: "czt1", q: "27. Religious services N N N N N Y Y N N N", cells: yes(["C-1", "C-2"]) },
};

function rowsFor(use: CommercialUse, area: number): UseRow[] {
  switch (use) {
    case "office": return [ROWS.office];
    case "retail": return [area > 15000 ? ROWS.retailLarge : ROWS.retailSmall];
    case "restaurant": return [ROWS.restaurant];
    case "industrial": return [ROWS.industrial];
    case "institutional": return [ROWS.school, ROWS.health, ROWS.cultural, ROWS.worship];
  }
}

const WORD: Record<Cell | "", string> = { Y: "allowed", S: "a special use", "": "prohibited" };
const areaOf = (i: ProjectInputs) => (i.kind === "mixed" ? i.commercial : i.gfa);

/** Whether a non-residential use is allowed in the district, from Table 1. Null outside its ten districts. */
export function cumberlandCommercialUse(i: ProjectInputs): { value: "allowed" | "hearing" | "prohibited"; finding: Finding } | null {
  const z = i.zone;
  if (!ZONES.has(z)) return null;
  const rows = rowsFor(i.use, areaOf(i));
  const marks: (Cell | "")[] = rows.map((r) => (r.cells[z] as Cell | undefined) ?? "");
  const value = marks.every((m) => m === "Y") ? "allowed" : marks.every((m) => m === "") ? "prohibited" : "hearing";
  const part = i.kind === "mixed" ? " for the commercial space" : "";
  const cite = { src: "czt1", pin: `Table 1, ${rows.map((r) => r.name.split(" (")[0]).join("; ")}, ${z} column`, q: rows[0].q };
  if (rows.length > 1) {
    return {
      value,
      finding: {
        st: value === "allowed" ? "pass" : value === "prohibited" ? "fail" : "flag",
        t: `Institutional uses in ${z}: ${rows.map((r, k) => `${r.name.split(":")[0].split(",")[0].toLowerCase()} ${WORD[marks[k]]}`).join("; ")}`,
        p: "Table 1 lists each on its own row. A hospital or clinic is prohibited in every district; a medical or dental office (row 30) is allowed in C-1, C-2 and I-1. A use not listed is prohibited.",
        ...cite,
      },
    };
  }
  const r = rows[0];
  const note = i.use === "industrial" ? " Manufacturing is listed by product in rows 94 to 116, mostly in I-1 and I-2; find yours." : i.use === "office" ? " Appendix A lists business offices under this row, and professional offices (accounting, legal, engineering) under professional service, which is allowed in the same districts." : "";
  if (value === "allowed") return { value, finding: { st: "pass", t: `${r.name}${part}: allowed in ${z}`, p: `Allowed by Table 1 of the zoning ordinance.${note}`, ...cite } };
  if (value === "hearing") return { value, finding: { st: "flag", t: `${r.name}${part}: a special use in ${z}`, p: `It needs a special use permit, decided with the plan under unified development review.${note}`, ...cite } };
  return { value, finding: { st: "fail", t: `${r.name}${part}: prohibited in ${z}`, p: `Table 1 does not allow this use in ${z}. It would take a use variance or a zone change.${note}`, ...cite } };
}

/** § 5-3's three tables, by the public utilities the lot has. Index: C-1, C-2, I-1, I-2. */
const DIM = {
  none: { label: "without public water or sewer", lot: "80,000", width: 100, front: [40, 40, 40, 40], side: 20, rear: 20, cover: [40, 40, 40, 60], density: "one unit per 10,000 sq ft of land suitable for development", src: "cz5", q: "(a) Dimensional regulations for areas without water facilities or public sewers. C-1 C-2 I-1 I-2 Minimum lot area (square feet) 80,000" },
  one: { label: "with public water or sewer but not both", lot: "40,000", width: 50, front: [20, 20, 20, 20], side: 10, rear: 10, cover: [40, 40, 40, 60], density: "one unit per 5,000 sq ft with public sewer, or per 7,000 sq ft of land suitable for development without it", src: "cz5", q: "(b) Dimensional regulations for areas with water facilities or public sewers but not both. C-1 C-2 I-1 I-2 Minimum lot area (square feet) 40,000" },
  both: { label: "with public water and sewer", lot: "5,000", width: 25, front: [15, 10, 10, 10], side: 10, rear: 10, cover: [40, 50, 80, 80], density: "one unit per 5,000 sq ft of land area", src: "cz5", q: "(c) Dimensional regulations for areas with both water facilities and public sewers. C-1 C-2 I-1 I-2 Minimum lot area (square feet) 5,000" },
} as const;
const COL: Record<string, number> = { "C-1": 0, "C-2": 1, "I-1": 2, "I-2": 3 };
const HEIGHT = [45, 45, 75, 75];
const dimFor = (i: ProjectInputs) => (i.water && i.sewer ? DIM.both : i.water || i.sewer ? DIM.one : DIM.none);

/** Mixed-use residential density in C-1 and C-2 (§ 5-3 notes), in sq ft of land per unit. Null outside them. */
export function cumberlandMixedArea(i: ProjectInputs): number | null {
  if (i.zone !== "C-1" && i.zone !== "C-2") return null;
  return i.water && i.sewer ? 5000 : i.sewer ? 5000 : i.water ? 7000 : 10000;
}

/** Parking under § 14-3, from the floor area where the table counts it; seats, employees and beds are left to the applicant. */
function parking(i: ProjectInputs, part: string): Finding {
  const a = areaOf(i);
  const n = (per: number) => Math.ceil(a / per);
  const pin = "§ 14-3(a), parking requirements by use";
  switch (i.use) {
    case "office": return { st: "info", t: `Parking${part}: ${n(400)} spaces (1 per 400 sq ft)`, p: "Fractions round up. Medical and professional offices take the same rate.", src: "cz14", pin, q: "Office: 1 space per 400 square feet GFA" };
    case "retail": return { st: "info", t: `Parking${part}: ${n(300)} spaces (1 per 300 sq ft), plus 1 per employee`, p: "Add one space for each employee on the largest shift. Convenience stores take 1 per 300 sq ft alone; furniture and appliance stores 1 per 500.", src: "cz14", pin, q: "Other retail uses 1 space per 300 square feet GFA, plus 1 space per employee (largest shift)" };
    case "restaurant": return { st: "info", t: `Parking${part}: at least ${n(300)} spaces (1 per 300 sq ft, or 1 per 4 seats if more)`, p: "Whichever is greater: count the seats. Fast food takes 1 per 2 seats or 1 per 150 sq ft.", src: "cz14", pin, q: "Restaurant 1 space per 4 seats or 1 space per 300 square feet GFA, whichever is greater" };
    case "industrial": return { st: "info", t: `Parking${part}: 1 per employee on the largest shift, plus 1 per company vehicle`, p: "Not counted here: the form does not ask for employees.", src: "cz14", pin, q: "Manufacturing, processing, assembly or packaging 1 space per employee (largest shift) plus 1 space for each company vehicle" };
    case "institutional": return { st: "info", t: `Parking${part}: by the kind of institution`, p: `A place of worship 1 per 3 seats plus 1 per room; a primary or junior high school 3 per classroom, a high school 1 per 5 students; a hospital 1 per 2 beds plus 1 per 2 employees; a library or museum 1 per 500 sq ft (${n(500)} here).`, src: "cz14", pin, q: "Place of worship 1 space per 3 seats plus 1 per room" };
  }
}

/**
 * What Cumberland's ordinance says about a non-residential project, beyond the use: parking, and the lot, yards,
 * coverage and height for its district and utilities. For a mixed-use building, `part` is "mixed": the parking for
 * its commercial space, and the mixed-use density.
 */
export function cumberlandCommercialFindings(i: ProjectInputs, part: "all" | "mixed"): Finding[] {
  const out: Finding[] = [];
  const label = part === "mixed" ? " for the commercial space" : "";
  out.push(parking(i, label));
  const c = COL[i.zone];
  const d = dimFor(i);
  if (part === "mixed") {
    const per = cumberlandMixedArea(i);
    if (per) {
      const need = i.units * per;
      out.push({
        st: i.lot >= need ? "pass" : "fail",
        t: `Mixed-use density: ${need.toLocaleString("en-US")} sq ft of land for ${i.units} units, ${i.lot.toLocaleString("en-US")} entered`,
        p: `In ${i.zone}, the ordinance sets mixed-use residential density at ${d.density}. The Zoning Atlas gives a different figure for the district; the ordinance governs. It matches what staff told Blackstone Residences in 2025.`,
        src: "cz5", pin: `§ 5-3, notes to the table for areas ${d.label}`, q: d.q,
      });
    }
    return out;
  }
  if (c === undefined) {
    out.push({
      st: "info", t: `Not read: yards, coverage and height for this use in ${i.zone}`,
      p: "Cumberland's dimensional rules for agricultural, residential and open-space districts (§ 5-2) were not read for non-residential uses.",
      gap: "Cumberland's zoning ordinance, § 5-2",
    });
  } else {
    out.push({
      st: "info",
      t: `${i.zone}, ${d.label}: ${HEIGHT[c]} ft high, ${d.cover[c]}% lot coverage, yards ${d.front[c]} ft front, ${d.side} ft side, ${d.rear} ft rear`,
      p: `Minimum lot ${d.lot} sq ft and ${d.width} ft of frontage. In a principally built area the front yard can be reduced to the average of its neighbours (§ 5-4).`,
      src: "cz5", pin: `§ 5-3, areas ${d.label}`, q: d.q,
    });
  }
  out.push({
    st: "info", t: "Not read: loading, signs, landscaping and design standards",
    p: "Loading spaces (§ 14-4 and 14-5), signs (Article 13) and the development plan review standards (Appendix B) also apply to a commercial building.",
    gap: "Cumberland's zoning ordinance: § 14-4, Article 13 and Appendix B",
  });
  return out;
}
