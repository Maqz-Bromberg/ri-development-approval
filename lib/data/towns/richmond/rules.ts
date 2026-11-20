import type { Finding, ProjectInputs, TownRules } from "../../../types";
import { cellsOf, plain, useFinding, type Value } from "../useTable";
import { COMP_STATUS, COMP_STEPS } from "../comp-steps";

/*
 * Richmond, read 2026-11-18 from its Zoning Ordinance, Chapter 18.16 Use Regulations (ClerksHQ, `rizo16`, as amended
 * March 17, 2026). Chunk 6 (ARD D63). What it adds: a use table that splits multi-family housing by size (3 to 4, 5 to
 * 12, 13 to 60 homes), so the number of homes, not only the district, decides; anything over 60 is not in the table
 * and so prohibited. In an overlay, "U" means the underlying district's rule. The Atlas's PDR2, PDR3 and PUB are not
 * columns of the table and are not answered. Richmond repealed its inclusionary zoning chapter (18.18) on May 21, 2024.
 * Not read: the multi-family standards (§ 18.36.100, Chapters 18.41 and 18.42), dimensions, the aquifer overlay.
 */

const COLS = ["R-3", "R-2", "R-1", "NB", "GB", "LI", "I", "PD", "PUD-VC", "FT", "SV", "AGR", "AQA", "AQB", "COS"] as const;
type Col = (typeof COLS)[number];
const ATLAS: Record<string, Col> = { "R-3": "R-3", "R-2": "R-2", "R-1": "R-1", NB: "NB", GB: "GB", LI: "LI", I: "I", PD: "PD", PUDVC: "PUD-VC", FT: "FT", SV: "SV", COS: "COS" };
const ROWS = {
  one: { what: "Single-family home", src: "rizo16", q: "101 Single family detached dwelling P P P P X X X X P X P P U U X" },
  two: { what: "Two-family building", src: "rizo16", q: "102 Two-family structure P P P P X X X X P X P P U U X" },
  mixed: { what: "Homes in a mixed-use building", src: "rizo16", q: "103 Dwelling unit in a mixed-use building X X X P P X X P P X P X U U X" },
  m4: { what: "Multi-family building of 3 to 4 homes", src: "rizo16", q: "104 Multi-family building(s): 3-4 dwelling units X P P X P X X P P X P X U U X" },
  m12: { what: "Multi-family building of 5 to 12 homes", src: "rizo16", q: "105 Multi-family building(s): 5-12 dwelling units X X X X P X X P P X X X U U X" },
  m60: { what: "Multi-family building of 13 to 60 homes", src: "rizo16", q: "106 Multi-family building(s): 13-60 dwelling units X X X X X X X X P X X X U U X" },
};

export function richmondUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  const col = ATLAS[i.zone];
  if (!col) return null;
  if (i.units > 60 && i.kind !== "mixed") {
    return useFinding({ id: "ri-use", town: "Richmond", what: `A building of ${i.units} homes`, zone: i.zone, value: "prohibited", why: ["Richmond's table stops at 60 homes, and a use not in the table is prohibited."], src: "rizo16", pin: "§ 18.16.010 C", q: "Uses not included in the table are prohibited." });
  }
  const r = i.kind === "mixed" ? ROWS.mixed : i.units >= 13 ? ROWS.m60 : i.units >= 5 ? ROWS.m12 : i.units >= 3 ? ROWS.m4 : i.units === 2 ? ROWS.two : ROWS.one;
  let value = plain(cellsOf(COLS, r.q)[col]) ?? "prohibited";
  const why: string[] = [];
  if ((i.overlays ?? []).includes("AGRO")) {
    const agr = cellsOf(COLS, r.q).AGR;
    if (agr !== "U" && plain(agr) === "prohibited") { value = "prohibited"; why.push("The Agricultural Overlay does not allow it."); }
  }
  if (r !== ROWS.one && r !== ROWS.two && value !== "prohibited") why.push(r === ROWS.m60 ? "Chapter 18.42 sets its own standards, not read here." : "Its standards (§ 18.36.100) are not read here.");
  return useFinding({ id: "ri-use", town: "Richmond", what: r.what, zone: i.zone, value, why, src: "rizo16", pin: "§ 18.16.010, Table of uses, Residential", q: r.q });
}

/** What the town lays over state law, registered in ../overlay.ts. Chunk 6, small rural towns (ARD D63): its housing rows in place of the Atlas, and its comprehensive permit route (D65). */
export const RULES: TownRules = {
  steps: { comp: COMP_STEPS.Richmond }, routeStatus: COMP_STATUS, use: richmondUse,
};
