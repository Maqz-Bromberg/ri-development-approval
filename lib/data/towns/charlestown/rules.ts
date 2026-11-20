import type { CommercialUse, Finding, ProjectInputs, TownRules } from "../../../types";

/*
 * Charlestown, read 2026-11-14 from the Zoning Ordinance, Chapter 218 (eCode360, `chzo`), and its Land Use Table
 * (Attachment 1, Supp 76 of January 2025, `chzt1`). Read to scope the design changes a town like it forces
 * (docs/plans/commercial-mixed-use.md, section 11; ARD D37, D38): overlays that change the answer, a use table whose
 * overlay column defers to the base district, an overlay with its own affordability line, and a district the
 * Atlas labels differently from the ordinance. Not read: the dimensional table, the other overlays' own rules, the
 * steps, offices and hearings. Keep `src`, `pin` and `q` on one line for verify_quotes.py.
 */

/** Y = permitted, S = special use permit, U = consult the underlying district (the overlay column only). Absent = not allowed. */
type Cell = "Y" | "S" | "U";
interface Row { name: string; src: "chzt1"; q: string; cells: Record<string, Cell> }
const y = (zs: string[], extra: Record<string, Cell> = {}) => ({ ...Object.fromEntries(zs.map((z) => [z, "Y" as Cell])), ...extra });

/** The Atlas's names for Charlestown's districts, as the Land Use Table's columns. The Atlas's municipal row is mislabelled. */
const tableZone = (z: string) => (z === "PDD" ? "PD" : z === "Mixed with Residential" ? "M" : z);
const ZONES = new Set(["R-20", "R-40", "R-2A", "R-3A", "C-1", "C-2", "C-3", "I", "PD", "OSR", "M", "TVD"]);

const HOMES: Record<"one" | "two" | "multi", Row> = {
  one: { name: "Dwelling, single family", src: "chzt1", q: "Dwelling, Single Family Y Y Y Y Y U Y", cells: y(["R-20", "R-40", "R-2A", "R-3A", "PD", "M"], { GWP: "U" }) },
  two: { name: "Dwelling, two family", src: "chzt1", q: "Dwelling, Two Family S S Y U Y", cells: { "R-2A": "S", "R-3A": "S", PD: "Y", GWP: "U", M: "Y" } },
  multi: { name: "Dwelling, multi-family", src: "chzt1", q: "Dwelling, Multi-family S S S U Y", cells: { "R-2A": "S", "R-3A": "S", PD: "S", GWP: "U", M: "Y" } },
};

/** The table lists shops and manufacturing by kind, so each use on the short list is read from a representative row. */
const OTHER: Record<string, Row> = {
  office: { name: "Professional office", src: "chzt1", q: "Professional Office Y Y Y Y U Y", cells: y(["C-1", "C-2", "C-3", "PD", "TVD"], { GWP: "U" }) },
  retail: { name: "Apparel or accessory shop (the table lists shops by kind)", src: "chzt1", q: "Apparel/Accessory Shop Y Y Y Y Y U Y", cells: y(["C-1", "C-2", "C-3", "I", "PD", "TVD"], { GWP: "U" }) },
  restaurant: { name: "Restaurant", src: "chzt1", q: "Restaurant Y Y Y Y U S", cells: y(["C-1", "C-2", "C-3", "PD"], { GWP: "U", TVD: "S" }) },
  industrial: { name: "Electronic manufacture (manufacturing is listed by product)", src: "chzt1", q: "Electronic Manufacture Y", cells: y(["I"]) },
  school: { name: "Elementary or high school", src: "chzt1", q: "Elementary/High School Y U Y", cells: y(["PD", "M"], { GWP: "U" }) },
  hospital: { name: "Hospital", src: "chzt1", q: "Hospital S S U S", cells: { "C-2": "S", "C-3": "S", GWP: "U", TVD: "S" } },
  museum: { name: "Museum", src: "chzt1", q: "Museum S S S S Y Y Y S S U Y Y", cells: { "R-20": "S", "R-40": "S", "R-2A": "S", "R-3A": "S", "C-1": "Y", "C-2": "Y", "C-3": "Y", I: "S", PD: "S", GWP: "U", M: "Y", TVD: "Y" } },
  worship: { name: "Church or place of worship", src: "chzt1", q: "Church/Place of Worship Y Y Y Y Y Y Y Y U Y", cells: y(["R-20", "R-40", "R-2A", "R-3A", "C-1", "C-2", "C-3", "PD", "TVD"], { GWP: "U" }) },
};
const otherRows = (u: CommercialUse): Row[] => (u === "institutional" ? [OTHER.school, OTHER.hospital, OTHER.museum, OTHER.worship] : [OTHER[u]]);

type Value = "allowed" | "hearing" | "prohibited";
const VALUE: Record<Cell | "", Value> = { Y: "allowed", S: "hearing", U: "allowed", "": "prohibited" };
const WORD: Record<Value, string> = { allowed: "permitted", hearing: "a special use", prohibited: "not allowed" };

/**
 * A row's answer for the site: the base district's cell, then the Groundwater Protection overlay's if the site is in
 * it. The overlay's column can defer (U), require a special use permit, or leave the use out, which prohibits it.
 */
function cell(row: Row, i: ProjectInputs): { value: Value; via: string } {
  const base = (row.cells[tableZone(i.zone)] as Cell | undefined) ?? "";
  if (!(i.overlays ?? []).includes("GWP")) return { value: VALUE[base], via: tableZone(i.zone) };
  const g = (row.cells.GWP as Cell | undefined) ?? "";
  return g === "U" ? { value: VALUE[base], via: `${tableZone(i.zone)}, which the GWP overlay defers to` } : { value: VALUE[g], via: "the GWP overlay" };
}

const ST: Record<Value, Finding["st"]> = { allowed: "pass", hearing: "flag", prohibited: "fail" };
const inMuz = (i: ProjectInputs) => (i.overlays ?? []).includes("MUZ") && (i.zone === "C-1" || i.zone === "C-2");

/** Whether the housing type is allowed, from the Land Use Table, with the overlays applied. Null outside the table. */
export function charlestownUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  if (!ZONES.has(tableZone(i.zone))) return null;
  // The Mixed-Use Zoning Overlay allows homes on C-1 and C-2 lots only with commercial space below or in front (§ 218-47 B(3)).
  if (inMuz(i)) {
    return i.kind === "mixed"
      ? { value: "allowed", finding: { st: "pass", t: `Homes with commercial space: allowed in ${i.zone} under the Mixed-Use Zoning Overlay`, p: "The overlay allows homes on upper floors, and at the side or rear of the ground floor, of a building with commercial space. Its density and affordability rule follows.", src: "chzo", pin: "§ 218-47 B(3)", q: "New building construction on any C1 or C2 zoned lot in the Mixed-Use Zoning Overlay District shall not have less square footage devoted to commercial use than the square footage of the footprint of the building" } }
      : { value: "prohibited", finding: { st: "fail", t: `Homes alone are not allowed in ${i.zone}, even under the Mixed-Use Zoning Overlay`, p: "The overlay allows homes only in a building with at least its footprint in commercial space. Choose homes with commercial space to check that.", src: "chzo", pin: "§ 218-47 B(3)", q: "New building construction on any C1 or C2 zoned lot in the Mixed-Use Zoning Overlay District shall not have less square footage devoted to commercial use than the square footage of the footprint of the building" } };
  }
  const row = i.units >= 3 ? HOMES.multi : i.units === 2 ? HOMES.two : HOMES.one;
  const { value, via } = cell(row, i);
  return { value, finding: { st: ST[value], t: `${row.name.replace("Dwelling, ", "").replace(/^./, (c) => c.toUpperCase())} housing: ${WORD[value]} in ${via}`, p: value === "prohibited" ? "The Land Use Table does not allow it here. A use not listed for a district is not allowed." : "From the town's Land Use Table, not the Zoning Atlas.", src: "chzt1", pin: `Land Use Table, ${row.name}`, q: row.q } };
}

/** Whether a non-residential use is allowed, from the Land Use Table, with the Groundwater Protection overlay applied. */
export function charlestownCommercialUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  if (!ZONES.has(tableZone(i.zone))) return null;
  const rows = otherRows(i.use);
  const res = rows.map((r) => cell(r, i));
  const value: Value = res.every((r) => r.value === "allowed") ? "allowed" : res.every((r) => r.value === "prohibited") ? "prohibited" : "hearing";
  const part = i.kind === "mixed" ? " for the commercial space" : "";
  if (rows.length > 1) {
    return { value, finding: { st: ST[value], t: `Institutional uses in ${tableZone(i.zone)}: ${rows.map((r, k) => `${r.name.toLowerCase()} ${WORD[res[k].value]}`).join("; ")}`, p: "The Land Use Table lists each on its own row.", src: "chzt1", pin: "Land Use Table, institutional rows", q: rows[0].q } };
  }
  const r = rows[0];
  return { value, finding: { st: ST[value], t: `${r.name.split(" (")[0]}${part}: ${WORD[value]} in ${res[0].via}`, p: r.name.includes("(") ? `The Land Use Table ${r.name.split("(")[1].replace(")", "")}: find the row for yours.` : "From the town's Land Use Table.", src: "chzt1", pin: `Land Use Table, ${r.name.split(" (")[0]}`, q: r.q } };
}

/** The Mixed-Use Zoning Overlay's own rules: its density and affordability line, and review of all work in it. */
function muzFindings(i: ProjectInputs): Finding[] {
  const out: Finding[] = [];
  if (i.kind !== "commercial" && i.units > 1) {
    const need = Math.floor(i.units * 0.59);
    out.push({
      st: i.aff >= need ? "pass" : "fail",
      t: `Mixed-Use Zoning Overlay: ${i.units} homes need ${need} low or moderate income units, ${i.aff} entered`,
      p: "More than one home on a lot in the overlay needs 59% of the homes, rounded down, to be low or moderate income, and every state and local approval, including septic and well.",
      src: "chzo", pin: "§ 218-47 B(2)", q: "No more than one dwelling unit per lot is permitted in the Mixed Use Zoning Overlay District, unless low or moderate income housing units are provided at a rate of fifty-nine (59) percent to each and every market rate dwelling unit",
    });
  }
  out.push({ st: "info", t: "Mixed-Use Zoning Overlay: development plan review for any work needing a building permit", p: "Every addition, alteration or new building in the overlay is reviewed first under Article XII.", src: "chzo", pin: "§ 218-47 B(1)", q: "shall first be reviewed pursuant to the provisions of ARTICLE XII, Development Plan Review and Land Development Review" });
  return out;
}

/** An overlay's findings: read for MUZ, the use column only for GWP. */
export function charlestownOverlay(i: ProjectInputs, abbr: string): Finding[] | null {
  if (abbr === "MUZ") return muzFindings(i);
  if (abbr === "GWP") {
    return [{
      st: "flag", t: "Groundwater Protection Overlay: only its column in the Land Use Table is read",
      p: "The use above takes the overlay's column, which defers to the district for most uses and leaves some out. Its other rules, which typically limit coverage, impervious surface and storage of hazardous materials, are not read.",
      gap: "Charlestown's zoning ordinance, the Groundwater Protection Overlay District article",
    }];
  }
  return null;
}

/** Overlays the ordinance has that the Atlas does not map. The site's lookup cannot find them, so the applicant ticks them. */
export const CHARLESTOWN_UNMAPPED = [{ abbr: "GWP", name: "Groundwater Protection Overlay" }];

/**
 * Where the ordinance's own purpose for a district differs from the Atlas's kind. The Atlas types the Traditional
 * Village District nonresidential; its purpose (§ 218-33) is small-scale business and residential uses.
 */
export const CHARLESTOWN_KINDS: Record<string, string> = { TVD: "Mixed with Residential" };

/** What the town lays over state law, registered in ../overlay.ts. Read to scope the design changes a town with overlays forces (ARD D38). Its use table answers in place of the Atlas. */
export const RULES: TownRules = {
  use: charlestownUse, useCommercial: charlestownCommercialUse, overlayRules: charlestownOverlay, unmappedOverlays: CHARLESTOWN_UNMAPPED, kinds: CHARLESTOWN_KINDS,
  // The Mixed-Use Zoning Overlay's own share (§ 218-47 B(2)), on the affordable key (ARD D53 decision 2; D38's open item).
  affordableLines: (i) => ((i.overlays ?? []).includes("MUZ") && i.units > 1 ? [{ short: "59%: Charlestown Mixed-Use Zoning Overlay", what: "More than one home on a lot in the overlay needs 59% of the homes, rounded down, to be low or moderate income.", src: "chzo", need: Math.floor(i.units * 0.59) }] : []),
};
