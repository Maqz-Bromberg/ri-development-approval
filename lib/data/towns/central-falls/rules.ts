import type { Finding, ProjectInputs, TownRules, TreeId } from "../../../types";
import { cellsOf, plain, useFinding, type Value } from "../useTable";
import { CITY_STATUS, cityRoute } from "../cityRoutes";

/*
 * Central Falls, read 2026-11-19 from its Zoning Ordinance, Appendix A (Municode, `cfzo`, saved November 18, 2026).
 * Chunk 7 (ARD D67). What it adds:
 *   - Table 1's housing rows in place of the Atlas's: two-family homes by special use permit in R-1, multi-family
 *     (three homes or more) by special use permit in R-1 and R-2, and permitted in R-3, C-1, C-2 and C-D;
 *   - adaptive reuse (§ 304(7)): converting a commercial building, school, religious or medical building or mall to
 *     homes is permitted in any district if at least half its floor area becomes homes, at no less than 15 homes an acre
 *     when it keeps its footprint and a fifth of the homes are low- and moderate-income.
 * The Atlas's CT has no column in Table 1; the Atlas answers there. Not read: the dimensional tables, parking.
 * Its Land Development and Subdivision Regulations (adopted April 23, 2025, `cfldr`) were read on 2026-11-20 for the
 * route: the state's process and clocks, with a required pre-application meeting for major projects and the Technical
 * Review Committee's part.
 */

const COLS = ["R-1", "R-2", "R-3", "C-1", "C-2", "C-D", "M-1", "M-2", "P", "CM"] as const;
type Col = (typeof COLS)[number];
const ROWS = {
  one: { what: "One-household home", src: "cfzo", q: "11 One-household detached dwelling Y Y Y Y N N N N N N" },
  two: { what: "Two-household home", src: "cfzo", q: "12 Two-household dwelling S Y Y Y Y Y N N N N" },
  multi: { what: "Multi-household building (three homes or more)", src: "cfzo", q: "14 Multi-household dwelling, three or more units S S Y Y Y Y N N N N" },
};

export function centralFallsUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  if (!(COLS as readonly string[]).includes(i.zone)) return null;
  const r = i.units >= 3 ? ROWS.multi : i.units === 2 ? ROWS.two : ROWS.one;
  const value = plain(cellsOf(COLS, r.q)[i.zone as Col]) ?? "prohibited";
  const why = value !== "allowed" && i.type === "reuse" ? ["If the building being reused is commercial, a school, a religious or medical building or a mall, adaptive reuse permits homes in any district (§ 304(7)); see the finding on it."] : [];
  return useFinding({ id: "cf-use", town: "Central Falls", what: r.what, zone: i.zone, value, why, src: "cfzo", pin: "§ 305, Table 1, 1.0 Residential", q: r.q });
}

export function centralFallsFindings(i: ProjectInputs): Finding[] {
  if (i.type !== "reuse" || i.kind === "commercial") return [];
  const share = Math.ceil(i.units * 0.2);
  return [{
    id: "cf-adaptive-reuse", st: "info", t: "Adaptive reuse: homes permitted in any district, if the building was commercial or institutional",
    p: `Converting a commercial building, including offices, schools, religious facilities, medical buildings and malls, to homes or mixed use is permitted wherever it is, if at least half its existing floor area becomes homes and no recorded environmental restriction bars it. Kept within its footprint and with at least 20% low- and moderate-income homes (${share} of ${i.units}), it may have no fewer than 15 homes an acre; otherwise as many as the housing and health codes allow. Its existing setbacks and height stay as they are.`,
    src: "cfzo", pin: "§ 304(7)", q: "adaptive reuse for the conversion of any commercial building including offices, schools, religious facilities, medical buildings, and malls into residential units or mixed-use developments is a permitted use",
  }];
}

/** What the city lays over state law, registered in ../overlay.ts. Chunk 7, the busy cities (ARD D67): its housing rows in place of the Atlas, and its practice on its routes (D69). */
/**
 * The city's Land Development and Subdivision Regulations, adopted April 23, 2025 (`cfldr`, read 2026-11-20): they follow
 * the state's 2023 process and clocks, with two additions of the city's own. On the minor and major routes.
 */
const REGS: Record<"minor" | "major", Finding> = {
  major: {
    id: "cf-regs", st: "info", t: "Central Falls's 2025 regulations: the state's process and clocks, with a required pre-application meeting",
    p: "The regulations adopted on April 23, 2025 follow the state's stages and decision periods. Two things are the city's own: at least one pre-application meeting is required before a major project is filed (staff certify the pre-application submission within 15 days and hold the meeting within 45 more; after 60 days without one the applicant may file anyway), and the Technical Review Committee reviews the application and makes recommendations before the Planning Board's first meeting on it.",
    src: "cfldr", pin: "Section 5.E, Pre-application meetings and concepts", q: "One or more pre-application meeting shall be held for all Major Land Development or Subdivision applications",
  },
  minor: {
    id: "cf-regs", st: "info", t: "Central Falls's 2025 regulations: the state's process and clocks, with the final plan by the Technical Review Committee",
    p: "The regulations adopted on April 23, 2025 follow the state's stages and decision periods. The administrative officer decides a minor project unless it needs a variance, a special use permit or a new street, which go to the Planning Board with a public hearing under unified review. The final plan is approved by the Technical Review Committee, which reports to the Planning Board.",
    src: "cfldr", pin: "Section 5.G(c), Final plan", q: "Final plans shall be reviewed and approved by the Technical Review Committee",
  },
};
const regsFindings = (t: TreeId): Finding[] => (t === "minor" || t === "major" ? [REGS[t]] : []);

/** The city's routes: state law, checked against its 2025 regulations, with its practice from its board's minutes. */
const CF_READ = "State law, as the city's 2025 regulations follow it (read 2026-11-20); its practice read from its minutes, 2026-11-19";
const CF_STATUS = { ...CITY_STATUS, minor: CF_READ, major: CF_READ };

export const RULES: TownRules = {
  routeStatus: CF_STATUS, use: centralFallsUse, moreFindings: (i, t) => [...centralFallsFindings(i), ...cityRoute("Central Falls", t), ...regsFindings(t)],
  inclusionaryNone: { src: "cfzo", note: "Parking is reduced by a quarter for each affordable home where at least 15% are deed-restricted, an incentive, not a requirement." },
};
