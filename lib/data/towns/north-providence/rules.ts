import type { Finding, ProjectInputs, TownRules, TreeId } from "../../../types";
import { applies, sinceText, stillOpen, type Pending, type Version } from "../dated";

/*
 * North Providence, read 2026-11-18 (chunk 4 of docs/plans/statewide-coverage.md, ARD D62): the town whose ordinance is
 * under amendment. What it forces, and is built here on `../dated.ts`:
 *   - rules with dates: the use table as it stood before 2024 (the Town's 2014 compilation, `npzo14`) and as amended
 *     (Chapter 35 on ClerksHQ, `npzo`, the Town's code as saved on May 11, 2026), with the day each took effect;
 *   - a date the Town's own code gives two ways: § 35-39's history credits the table to Ord. 23-029Z Sub A of
 *     January 2, 2024 and to Ord. 24-009Z of June 4, 2024, without saying which cell changed when (ARD D13);
 *   - vesting on certification, not filing (§ 35-255), which is what decides which text applies;
 *   - an amendment pending before the Town Council (a Mixed-Use Commercial Corridor Overlay District), whose text is
 *     not in the records read;
 *   - an ordinance that disagrees with itself: the use table now permits two-family homes in RL and RG by right, while
 *     the dimensional table's footnote still asks a special use permit for two or more units.
 * Read: § 35-39's residential rows and adaptive reuse (Q), the RL and RG rows of § 35-40, vesting (§§ 35-253 to 35-255).
 * Not read: the dimensional rules for other districts, parking (art. VII), the land development regulations (Chapter
 * 31A), the historic overlay, and the flood hazard section, which the Town Council replaced on August 18, 2026
 * (Ord. 26-014Z). An unofficial redline of the 2014 compilation through Ord. 26-009Z (June 2026) was used as a reading
 * aid; it is not cited, and it misses at least one later amendment (Ord. 25-011Z, a map change of January 2026).
 */

const COLS = ["R12", "R8", "RL", "RG", "IS", "CP", "CV", "CG", "ML", "MG", "OS"] as const;
type Col = (typeof COLS)[number];
/** The Zoning Atlas's names for North Providence's districts, mapped to the use table's columns. */
const ATLAS: Record<string, Col> = { RS12: "R12", R8: "R8", RL10: "RL", RL13: "RL", RG: "RG", IS: "IS", CP: "CP", CV: "CV", CG: "CG", ML: "ML", MG: "MG", OS: "OS" };
type Value = "allowed" | "hearing" | "prohibited";
type Row = Record<Col, Value>;
/** A row of the use table from its quote: the last 11 words are the cells, Y, S (S@ with a footnote) or N. */
const cells = (q: string): Row => Object.fromEntries(q.split(" ").slice(-11).map((c, k) => [COLS[k], c.startsWith("Y") ? "allowed" : c.startsWith("S") ? "hearing" : "prohibited"])) as Row;

const OLD = { by: "the Town's 2014 compilation, which already includes Ord. 23-002Z of 2023", since: null };
const NEW = {
  since: "2024-06-04", by: "Ord. 24-009Z",
  orSince: { date: "2024-01-02", why: "The Town's code credits § 35-39's table both to Ord. 23-029Z Sub A of January 2, 2024 and to Ord. 24-009Z of June 4, 2024, without saying which cells changed on which day." },
};
const ROWS: Record<"one" | "two" | "multi", { name: string; versions: Version<Row>[] }> = {
  one: { name: "Single-family home", versions: [
    { ...OLD, src: "npzo14", pin: "§ 203, B.1 (2014)", q: "1. Single family detached dwelling Y Y Y S S S N N N N N", value: cells("1. Single family detached dwelling Y Y Y S S S N N N N N") },
    { ...NEW, src: "npzo", pin: "§ 35-39, B.1", q: "1. Single family detached dwelling Y Y Y Y Y Y N N N N N", value: cells("1. Single family detached dwelling Y Y Y Y Y Y N N N N N") },
  ] },
  two: { name: "Two-family home", versions: [
    { ...OLD, src: "npzo14", pin: "§ 203, B.3 (2014)", q: "3. Two family dwelling structure N N S@ S S S S N N N N", value: cells("3. Two family dwelling structure N N S@ S S S S N N N N") },
    { ...NEW, src: "npzo", pin: "§ 35-39, B.3", q: "3. Two family dwelling structure N N Y Y Y Y Y N N N N", value: cells("3. Two family dwelling structure N N Y Y Y Y Y N N N N") },
  ] },
  multi: { name: "Multi-family building (three or more homes)", versions: [
    { ...OLD, src: "npzo14", pin: "§ 203, B.4 (2014)", q: "4. Multi-family dwelling structure(3 or more) N N N S S S S N N N N", value: cells("4. Multi-family dwelling structure(3 or more) N N N S S S S N N N N") },
    { ...NEW, src: "npzo", pin: "§ 35-39, B.4", q: "4. Multi-family dwelling structure (3 or more dwelling units) N N N S N S S N N N N", value: cells("4. Multi-family dwelling structure (3 or more dwelling units) N N N S N S S N N N N") },
  ] },
};

/** Adaptive reuse of a commercial building (§ 35-39 Q), added by Ord. 23-030Z Sub A; not in the 2014 text. */
const REUSE: Version<boolean>[] = [
  { value: false, since: null, by: "the Town's 2014 compilation, which has no adaptive reuse section", src: "npzo14", pin: "§ 203 (no adaptive reuse provision)", q: "4. Multi-family dwelling structure(3 or more) N N N S S S S N N N N" },
  { value: true, since: "2024-01-02", by: "Ord. 23-030Z Sub A", src: "npzo", pin: "§ 35-39 Q.1", q: "Adaptive reuse for the conversion of any commercial building, including offices, schools, religious facilities, medical buildings, and malls into residential units or mixed-use developments is a permitted use" },
];

export const NP_PENDING: Pending = {
  what: "A Mixed-Use Commercial Corridor Overlay District (a new Article XV)",
  status: "Introduced before the Town Council on August 18, 2026 and continued in September and October; on the agenda again for November 4, 2026, whose minutes are not yet filed.",
  src: "npcc261006", pin: "Item 13", q: "amending the North Providence Zoning Ordinance establishing a mixed-use commercial corridor overlay district",
  asOf: "2026-11-04",
  gap: "The proposed ordinance's text and map, which are not in the Town Council's agendas or minutes, and whether the Planning Board has reviewed it (its 2026 agendas do not list it): ask the Town Clerk or the Planning Department",
};

const RANK: Record<Value, number> = { allowed: 0, hearing: 1, prohibited: 2 };
const ST: Record<Value, Finding["st"]> = { allowed: "pass", hearing: "flag", prohibited: "fail" };
const WORD: Record<Value, string> = { allowed: "permitted", hearing: "allowed by special use permit", prohibited: "not allowed" };
const col = (i: ProjectInputs): Col | null => ATLAS[i.zone] ?? null;

export function northProvidenceUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  const c = col(i);
  if (!c) return null;
  const row = ROWS[i.units >= 3 ? "multi" : i.units === 2 ? "two" : "one"];
  const { v, unsure } = applies(row.versions, i.startDate);
  const reuse = i.type === "reuse" && applies(REUSE, i.startDate).v.value;
  let value = reuse ? "allowed" : v.value[c];
  const older = row.versions[0].value[c], newer = row.versions[1].value[c];
  const notes: string[] = [];
  if (reuse) notes.push("Converting a commercial building to homes is permitted in any district under the adaptive reuse section (§ 35-39 Q.6), whatever the table says.");
  if (unsure && older !== newer) notes.push(`${unsure} Before the change it was ${WORD[older]}; after it, ${WORD[newer]}. Ask the Planning Department which applies.`);
  else if (older !== newer) notes.push(v === row.versions[0] ? `The table changed in 2024 (${row.versions[1].by}): since then it is ${WORD[newer]} here.` : `The table changed in 2024: before, it was ${WORD[older]} here.`);
  // The ordinance disagrees with itself (ARD D13): the use table permits two homes in RL and RG; § 35-40's footnote still asks a permit.
  const footnote = !reuse && i.units >= 2 && (c === "RL" || c === "RG") && v.value[c] === "allowed";
  if (footnote) notes.push("But the dimensional table (§ 35-40) still marks RL and RG with a special use permit for two or more units. The ordinance disagrees with itself here: ask the zoning official whether a permit is needed.");
  // Where either text may apply, answer with the stricter, and say so.
  if (!reuse && unsure && older !== newer) value = RANK[older] > RANK[newer] ? older : newer;
  return {
    value,
    finding: {
      id: "np-use", st: footnote || (unsure && older !== newer) ? "flag" : ST[value],
      t: `${row.name}: ${WORD[value]} in ${i.zone}${reuse ? " (adaptive reuse)" : ""}`,
      p: `${notes.join(" ")}${notes.length ? " " : ""}From North Providence's use table, ${sinceText(v, row.versions[row.versions.indexOf(v) + 1])}, not the Zoning Atlas, which still shows the older table in several districts.`,
      src: v.src, pin: v.pin, q: v.q,
    },
  };
}

export function northProvidenceFindings(i: ProjectInputs, _tree: TreeId): Finding[] {
  const out: Finding[] = [];
  const c = col(i);
  if (i.kind !== "commercial") {
    out.push({
      id: "np-vesting", st: "info", t: "Which version of the ordinance applies: the one in force when your application is certified complete",
      p: "North Providence vests an application on the day the Planning Board (or the zoning or building official) certifies it complete, not the day it is filed. An amendment adopted between filing and certification applies to it. The findings here are worked out for the project's start date and the 25 days certification may take.",
      src: "npzo", pin: "§ 35-255", q: "vested under the zoning ordinance and regulations in effect at the time of certification not the date of application",
    });
  }
  if (i.kind !== "commercial" && i.units >= 2 && (c === "RG" || c === "RL")) {
    const rg = c === "RG";
    const need = rg ? 8000 + 6000 * (i.units - 1) : i.zone === "RL13" ? 16000 : 15000;
    out.push({
      id: "np-density", st: !rg && i.units > 2 ? "fail" : i.lot >= need ? "pass" : "flag",
      t: rg ? `Lot area (ordinance): ${need.toLocaleString("en-US")} sq ft for ${i.units} homes, ${i.lot.toLocaleString("en-US")} entered` : `Lot area (ordinance): ${need.toLocaleString("en-US")} sq ft for two homes in ${i.zone}`,
      p: rg ? `RG needs 8,000 sq ft for the first home and 6,000 for each more, and a lot 100 ft wide for two or more.${i.lot < need ? ` Short by ${(need - i.lot).toLocaleString("en-US")} sq ft.` : ""}` : `${i.zone} allows at most two homes on a lot, with ${i.zone === "RL13" ? "8,000" : "7,000"} sq ft more for the second.${i.units > 2 ? " More than two needs a different district." : ""}`,
      src: "npzo", pin: "§ 35-40", q: rg ? "8,000 sf for first unit plus 6,000 sf per additional unit" : i.zone === "RL13" ? "8,000 sf plus 8,000 sf for second unit" : "8,000 sf plus 7,000 sf for second unit",
    });
  }
  if (i.type === "reuse") {
    const { v, unsure } = applies(REUSE, i.startDate);
    out.push(v.value ? {
      id: "np-reuse", st: unsure ? "flag" : "info", t: "Adaptive reuse: homes in a converted commercial building are permitted in any district",
      p: `${unsure ? `${unsure} ` : ""}At least half the existing floor area must become homes. With the existing footprint, 20% low- and moderate-income homes and public water and sewer, density is at least 15 homes an acre; existing setbacks and height stay as legal nonconforming; parking is one space per home.`,
      src: v.src, pin: v.pin, q: v.q,
    } : {
      id: "np-reuse", st: "flag", t: "Adaptive reuse: the town's section did not exist yet on this date",
      p: "The adaptive reuse section took effect on January 2, 2024 (Ord. 23-030Z Sub A). Before then the use table alone answers; state law on adaptive reuse may still apply.",
      src: REUSE[1].src, pin: REUSE[1].pin, q: REUSE[1].q,
    });
  }
  if (stillOpen(NP_PENDING, i.startDate)) out.push({
    id: "np-pending", st: "flag", t: `An amendment is pending: ${NP_PENDING.what}`,
    p: `${NP_PENDING.status} If it is adopted before your application is certified complete, it applies to it (§ 35-255). Where the corridors run and what the overlay allows are not public in the records read.`,
    src: NP_PENDING.src, pin: NP_PENDING.pin, q: NP_PENDING.q, gap: NP_PENDING.gap,
  });
  return out;
}

/** What the town lays over state law, registered in ../overlay.ts. Read for its ordinance under amendment: rules with dates, a pending amendment, vesting on certification (ARD D62, chunk 4). */
export const RULES: TownRules = {
  use: northProvidenceUse, moreFindings: northProvidenceFindings, inclusionaryNone: { src: "npzo" },
};
