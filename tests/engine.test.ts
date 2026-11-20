/*
 * Known answers for the engine: what state law, a town's ordinance or a decision in docs/ARD.md says the answer is.
 * The stored comparison (scripts/engine/snapshot.ts) says whether the engine changed; these say whether it is right.
 * Each expectation names where it comes from. Run with `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze, classify, condOK, deriveFlags, maxUnits, normalizeInputs, requiredArea } from "@/lib/engine";
import { townRules } from "@/lib/data/towns/overlay";
import { setActiveTown } from "@/lib/town";
import type { Finding, Flags, ProjectInputs, TreeId } from "@/lib/types";

/** A project in a town, with the engine reading that town, as ProjectProvider sets it. */
function project(p: Partial<ProjectInputs>): ProjectInputs {
  const i = normalizeInputs({ address: "", parcel: "", ...p });
  setActiveTown(i.town);
  return i;
}
const homes = (town: string, units: number, more: Partial<ProjectInputs> = {}) => project({ town, kind: "homes", units, aff: 0, ...more });
const findings = (i: ProjectInputs, tree: TreeId = classify(i)): Finding[] => analyze(i, tree);

test("the state's review categories by number of homes (R.I. Gen. Laws § 45-23-32)", () => {
  // Barrington has no reading of its own here, so state law answers.
  assert.equal(classify(homes("Barrington", 2)), "byright");
  assert.equal(classify(homes("Barrington", 3)), "minor");
  assert.equal(classify(homes("Barrington", 9)), "minor", "nine units or less is minor");
  assert.equal(classify(homes("Barrington", 10)), "major");
});

test("a quarter affordable opens the comprehensive permit (§ 45-53-4)", () => {
  assert.equal(classify(homes("Barrington", 4, { aff: 1 })), "comp", "25%");
  assert.equal(classify(homes("Barrington", 3, { aff: 1 })), "comp", "33%");
  assert.equal(classify(homes("Barrington", 5, { aff: 1 })), "minor", "20% is not enough");
  assert.equal(classify(homes("Barrington", 30, { aff: 8 })), "comp", "8 of 30 is the smallest quarter");
  assert.equal(classify(homes("Barrington", 30, { aff: 7 })), "major");
});

test("a commercial project's category under state law (§ 45-23-32(19)(i)(A), (B), (E); ARD D30)", () => {
  const com = (more: Partial<ProjectInputs>) => classify(project({ town: "Barrington", kind: "commercial", use: "retail", units: 0, ...more }));
  assert.equal(com({ work: "new", gfa: 7500 }), "minor", "(A) 7,500 sq ft or less");
  assert.equal(com({ work: "new", gfa: 7501 }), "major");
  assert.equal(com({ work: "expand", gfa: 10000, existingGfa: 5000 }), "minor", "(B) up to 10,000 sq ft");
  assert.equal(com({ work: "expand", gfa: 15000, existingGfa: 30000 }), "minor", "(B) up to half the existing floor area");
  assert.equal(com({ work: "expand", gfa: 16000, existingGfa: 30000 }), "major");
  assert.equal(com({ work: "change", extensive: false, gfa: 50000 }), "minor", "(E) a change of use without extensive construction");
});

test("Providence's own lines (ARD D2, D15, D30; its Regulations, Art. 2)", () => {
  assert.equal(classify(homes("Providence", 3, { zone: "R-3" })), "byright", "up to 3 units");
  assert.equal(classify(homes("Providence", 4, { zone: "R-3" })), "dpr", "4 to 9 new units: staff review in one stage");
  assert.equal(classify(homes("Providence", 9, { zone: "R-3" })), "dpr");
  assert.equal(classify(homes("Providence", 10, { zone: "C-2", kind: "mixed", commercial: 2500 })), "minor", "10 or more with up to 2,500 sq ft of commercial space");
  assert.equal(classify(homes("Providence", 10, { zone: "C-2", kind: "mixed", commercial: 3000 })), "major");
  assert.equal(classify(homes("Providence", 12, { zone: "D-1-100", overlays: ["DD"] })), "dpr", "Downcity overlay: not a land development project (§ 1904.C.2.b)");
  const com = (gfa: number) => classify(project({ town: "Providence", zone: "C-2", kind: "commercial", use: "office", work: "new", units: 0, gfa }));
  assert.equal(com(10000), "minor", "10,000 to 20,000 sq ft");
  assert.equal(com(20001), "major");
});

test("Cumberland's lot area per unit (Zoning Art. 3; ARD D71)", () => {
  assert.equal(requiredArea(homes("Cumberland", 10, { zone: "R-3" }))?.sqft, 10000 + 9 * 5000, "with water and sewer: 10,000 plus 5,000 a unit");
  assert.equal(requiredArea(homes("Cumberland", 10, { zone: "R-3", sewer: false }))?.sqft, 30000 + 9 * 10000, "with one utility: 30,000 plus 10,000 a unit");
  assert.equal(requiredArea(homes("Cumberland", 10, { zone: "R-3", sewer: false, water: false })), null, "no figure without either");
  assert.equal(maxUnits(homes("Cumberland", 10, { zone: "R-3", lot: 56600 })), 10, "56,600 sq ft holds 10 units, not 11");
});

test("Cumberland's parking: one space per unit since April 15, 2026 (§ 14-3; ARD D33)", () => {
  const p = findings(homes("Cumberland", 12, { zone: "R-3", lot: 200000 })).find((f) => f.key === "parking");
  assert.equal(p?.src, "cz14");
  assert.match(p?.t ?? "", /^Parking: 12 spaces required \(1 per unit\)/);
});

test("near frequent transit, at most one space a unit (2026 state law)", () => {
  for (const town of ["Cumberland", "Barrington"]) {
    const p = findings(homes(town, 12, { zone: "R-3", lot: 200000, transit: true })).find((f) => f.key === "parking");
    assert.equal(p?.src, "ridsp", town);
  }
});

test("when state permits are due is the town's rule (ARD D10)", () => {
  const permits = (town: string, zone: string) => findings(homes(town, 12, { zone, lot: 200000, wet: true })).find((f) => f.key === "permits");
  assert.equal(permits("Cumberland", "R-3")?.src, "cregs", "before the preliminary plan");
  assert.equal(permits("Providence", "R-3")?.src, "pregs", "before the final plan");
  const other = permits("Barrington", "R-3");
  assert.equal(other?.src, undefined, "not read: no source");
  assert.match(other?.p ?? "", /Check Barrington's regulations/);
});

test("a large septic system starts at 5,000 gallons a day (250-RICR-150-10-6 § 6.39; 115 gallons a bedroom, two a home)", () => {
  const large = (units: number) => findings(homes("Barrington", units, { sewer: false })).some((f) => f.pin === "250-RICR-150-10-6, § 6.39(A)(1)");
  assert.equal(large(21), false, "21 homes: 4,830 gallons");
  assert.equal(large(22), true, "22 homes: 5,060 gallons");
});

test("a shared well serving 25 people is a public water system (40 C.F.R. § 141.2; four people a two-bedroom home)", () => {
  const pws = (units: number) => findings(homes("Barrington", units, { water: false })).some((f) => f.id === "well-public-system");
  assert.equal(pws(6), false, "24 people");
  assert.equal(pws(7), true, "28 people");
});

test("Westerly's inclusionary zoning starts at six homes (§ 260-50.2; ARD D60)", () => {
  const lines = (units: number) => townRules("Westerly").affordableLines?.(homes("Westerly", units, { zone: "HDR-6" })) ?? [];
  assert.equal(lines(5).length, 0);
  assert.equal(lines(6).length, 1);
});

test("on tribal land, the town's zoning is not run (ARD D38)", () => {
  const f = findings(homes("Charlestown", 8, { reservation: "Narragansett Indian Reservation" }));
  assert.equal(f.length, 1);
  assert.equal(f[0].st, "fail");
});

test("a finding keeps its id when only the numbers change, so pins survive (ARD D43)", () => {
  const ids = (units: number) => findings(homes("Cumberland", units, { zone: "R-3", lot: 200000 }), "major").map((f) => f.id);
  assert.deepEqual(ids(12), ids(14));
  for (const town of ["Cumberland", "Providence", "Westerly", "Exeter"]) {
    const list = findings(homes(town, 12, { lot: 200000, sewer: false, water: false }), "major").map((f) => f.id);
    assert.equal(new Set(list).size, list.length, `${town}: ids are unique`);
  }
});

test("a step's condition: a|b is either, !a is not a", () => {
  const f = { wet: true, dot: false, septic: false } as Flags;
  assert.equal(condOK(undefined, f), true);
  assert.equal(condOK("wet|dot", f), true);
  assert.equal(condOK("dot", f), false);
  assert.equal(condOK("!septic", f), true);
  assert.equal(condOK("!wet", f), false);
});

test("no public sewer means a RIDEM septic approval; a coastal wetland means CRMC (ARD D39, debt 19)", () => {
  const i = homes("Charlestown", 8, { sewer: false, wet: true, wetAgency: "CRMC" });
  const flags = deriveFlags(i, classify(i));
  assert.equal(flags.septic, true);
  assert.equal(flags.coastal, true);
});
