import type { CommercialUse, Finding, Flags, ProjectInputs, Step, TownRules } from "../../../types";

/*
 * Westerly, read 2026-11-18 from the Zoning Ordinance, Chapter 260 (eCode360, `wezo`), its Zoning District Use Tables
 * (Attachment 11, `wezt`) and Appendix G (`wezg`). Chunk 3 of docs/plans/statewide-coverage.md (ARD D53): the town
 * whose ordinance departs furthest from the site's form after Charlestown. What it forces, and is built here:
 *   - an overlay stack: two aquifer zones as columns of the use table (P, Q for an aquifer protection permit, P/Q for
 *     permitted with sewer and a permit without), and an airport overlay with its own review;
 *   - a required affordable share (inclusionary zoning, § 260-50.2), shown on the affordable key as a town line;
 *   - one board deciding in two capacities: the Zoning Board "sitting as" the airport overlay's board of appeals;
 *   - a use allowed only on listed parcels (Appendix G), matched by plat and lot, never by owner (principle 7);
 *   - a cell that depends on floor area (P/S: permitted under 2,000 sq ft, special use permit above).
 * Westerly's overlays are not in the Zoning Atlas, so each is a tick. Of the overlays the ordinance names, the Historic
 * and River Corridor overlays are reserved and the Flood Hazard (2017) and Post Road (2006) overlays were repealed, so
 * they are left out. Not read: the dimensional schedule, the Salt Pond, Bed-and-Breakfast, Historic Mill, Granite
 * Street and Wells Street overlays' rules, the Watch Hill standards, the steps and the hearings.
 */

const COLS = ["RR-60", "LDR-43", "LDR-40", "MDR-30", "MDR-20", "HDR-15", "HDR-10", "HDR-6", "P-15", "DC1", "DC2", "NB", "HC", "GC", "SC-WH", "SC-G", "MC", "GI", "LI", "ORAT", "OS/R", "CR", "APZ", "WPZ"] as const;
type Col = (typeof COLS)[number];
/** P permitted, N not, S special use permit, Q aquifer protection permit, P/Q permitted with sewer (else Q), P/S permitted under 2,000 sq ft (else S), N/S* only on Appendix G's parcels, P* with a footnote */
type Cell = "P" | "N" | "S" | "Q" | "P/Q" | "P/S" | "N/S*" | "P*";
interface Row { name: string; q: string; cells: Record<Col, Cell> }
/** A row of the use table. Its quote is the row as printed, and its cells are the quote's last 24 words, column by column. */
const row = (r: { name: string; src: "wezt"; q: string }): Row => ({ name: r.name, q: r.q, cells: Object.fromEntries(r.q.split(" ").slice(-24).map((c, k) => [COLS[k], c as Cell])) as Record<Col, Cell> });

const HOMES = {
  one: row({ name: "Single family", src: "wezt", q: "Single family P P P P P P P P P N P P N N N N N N N N N N P P" }),
  two: row({ name: "Two family", src: "wezt", q: "Two family N N N N N N N S P N P S N N N N N N N N N N P P" }),
  three: row({ name: "Three family", src: "wezt", q: "Three family N N N N N N N S N N S S N N N N N N N N N N P P" }),
  multi: row({ name: "Multifamily, 4 or more units", src: "wezt", q: "Multifamily - 4 or N/S* N N/S* N/S* N S N S N N N N N N N N N N N N N N P/Q Q" }),
  mixed: row({ name: "Mixed-use development", src: "wezt", q: "Mixed-use N N N N N N N N P P P P P P P P N N N N N N P/Q Q" }),
};
const OTHER: Record<string, Row> = {
  retail: row({ name: "General merchandise, department store, furniture and household goods (the table lists shops by kind)", src: "wezt", q: "General N N N N N N N N N P P S P/S P/S P/S P/S P/S P/S P/S N N N Q Q" }),
  office: row({ name: "General commercial offices", src: "wezt", q: "General commercial N N N N N N N N S S P S P P S S N P P P N N P/Q P/Q" }),
  restaurant: row({ name: "Restaurant without alcohol", src: "wezt", q: "Restaurants (no N N N N N N N N N P P P P P P P P N N N N P* P/Q P/Q" }),
  industrial: row({ name: "Light manufacturing", src: "wezt", q: "Light manufacturing N N N N N N N N N N N N P P N N N P P S N N Q Q" }),
  school: row({ name: "Public school", src: "wezt", q: "Public schools, S S S S S S S S S P P S P P S S P P P P S S P/Q P/Q" }),
  hospital: row({ name: "Hospital", src: "wezt", q: "Hospitals N N N N N N N N P N P N S S N N N N N S N N Q Q" }),
  museum: row({ name: "Library or museum", src: "wezt", q: "Library or museum S S S S S S S S S S S S S S S S S S S S S S P/Q P/Q" }),
};
const otherRows = (u: CommercialUse): Row[] => (u === "institutional" ? [OTHER.school, OTHER.hospital, OTHER.museum] : [OTHER[u]]);

/** Appendix G's parcels, by plat and lot. Multi-unit housing by special use permit in RR-60, LDR-40 and MDR-30 only here. */
const APPENDIX_G: [string, string][] = [["11", "6"], ["15", "14"], ["19", "6"], ["19", "58"], ["43", "40"], ["44", "10"], ["53", "18"], ["62", "12"], ["82", "5A"], ["91", "1"], ["92", "1"], ["101", "2"], ["140", "1"]];
/** Plat and lot from the parcel map's PlatLot ("WE 011-0006-0000") or a typed one ("Plat 11 Lot 6"). */
function platLot(parcel: string): [string, string] | null {
  const m = parcel.toUpperCase().match(/(\d+)\D+0*(\d+[A-Z]?)/);
  return m ? [String(Number(m[1])), m[2].replace(/^0+(?=\d)/, "")] : null;
}
export const onAppendixG = (i: ProjectInputs) => { const p = platLot(i.parcel ?? ""); return !!p && APPENDIX_G.some(([a, b]) => a === p[0] && b === p[1]); };

type Value = "allowed" | "hearing" | "prohibited";
const ST: Record<Value, Finding["st"]> = { allowed: "pass", hearing: "flag", prohibited: "fail" };
const WORD: Record<Value, string> = { allowed: "permitted", hearing: "allowed by permit", prohibited: "not allowed" };
const inAquifer = (i: ProjectInputs): "APZ" | "WPZ" | null => ((i.overlays ?? []).includes("WPZ") ? "WPZ" : (i.overlays ?? []).includes("APZ") ? "APZ" : null);

/** A cell read for this site: the district's, then the aquifer zone's column, which can only add a permit or forbid. */
function read(r: Row, i: ProjectInputs, gfa = 0): { value: Value; why: string[] } | null {
  const z = i.zone as Col;
  if (!COLS.includes(z) || z === "APZ" || z === "WPZ") return null;
  const why: string[] = [];
  let value: Value;
  const c = r.cells[z];
  if (c === "P") value = "allowed";
  else if (c === "P*") { value = "allowed"; why.push("the table adds a footnote for this district"); }
  else if (c === "S") { value = "hearing"; why.push("a special use permit"); }
  else if (c === "P/S") { value = gfa > 2000 ? "hearing" : "allowed"; why.push(gfa > 2000 ? "a special use permit over 2,000 sq ft" : "permitted up to 2,000 sq ft"); }
  else if (c === "N/S*") {
    value = onAppendixG(i) ? "hearing" : "prohibited";
    why.push(onAppendixG(i) ? "a special use permit, because the parcel is listed in Appendix G, on at least 50 contiguous acres (§ 260-63 B)" : "only on the parcels Appendix G lists, and this parcel is not one of them (check the plat and lot)");
  } else value = "prohibited";
  const aq = inAquifer(i);
  if (aq && value !== "prohibited") {
    const a = r.cells[aq];
    if (a === "N") { value = "prohibited"; why.push(`not in the ${aq === "WPZ" ? "Wellhead" : "Aquifer"} Protection Zone`); }
    else if (a === "Q" || (a === "P/Q" && !i.sewer)) { if (value === "allowed") value = "hearing"; why.push(`an aquifer protection permit in the ${aq === "WPZ" ? "Wellhead" : "Aquifer"} Protection Zone${a === "P/Q" ? ", because there is no public sewer" : ""}`); }
  }
  return { value, why };
}

const via = (i: ProjectInputs) => `${i.zone}${inAquifer(i) ? ` in the ${inAquifer(i) === "WPZ" ? "Wellhead" : "Aquifer"} Protection Zone` : ""}`;

export function westerlyUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  const r = i.kind === "mixed" ? HOMES.mixed : i.units >= 4 ? HOMES.multi : i.units === 3 ? HOMES.three : i.units === 2 ? HOMES.two : HOMES.one;
  const got = read(r, i);
  if (!got) return null;
  const { value, why } = got;
  return {
    value,
    finding: {
      st: ST[value], t: `${r.name}: ${WORD[value]} in ${via(i)}`,
      p: `${why.length ? `Here it needs ${why.join(", and ")}. ` : ""}Westerly's use table answers, not the Zoning Atlas${i.kind !== "mixed" && ["DC1", "DC2", "NB", "HC", "GC", "SC-WH", "SC-G", "P-15"].includes(i.zone) ? ", which lists homes in this district by hearing because it counts mixed-use development; homes alone are not allowed here, homes with commercial space are" : ""}.`,
      src: "wezt", pin: "Attachment 11, Standard Use Table, Residential", q: r.q,
    },
  };
}

export function westerlyCommercialUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  const rows = otherRows(i.use);
  const res = rows.map((r) => read(r, i, i.gfa));
  if (res.some((x) => !x)) return null;
  const vals = res.map((x) => x!.value);
  const value: Value = vals.every((v) => v === "allowed") ? "allowed" : vals.every((v) => v === "prohibited") ? "prohibited" : "hearing";
  const part = i.kind === "mixed" ? " for the commercial space" : "";
  return {
    value,
    finding: {
      st: ST[value], t: rows.length > 1 ? `Institutional uses in ${via(i)}: ${rows.map((r, k) => `${r.name.toLowerCase()} ${WORD[vals[k]]}`).join("; ")}` : `${rows[0].name.split(" (")[0]}${part}: ${WORD[value]} in ${via(i)}`,
      p: [res[0]!.why.length ? `It needs ${res[0]!.why.join(", and ")}.` : "", rows[0].name.includes("(") ? "The use table lists shops by kind: find the row for yours." : ""].filter(Boolean).join(" ") || "From Westerly's use table.",
      src: "wezt", pin: "Attachment 11, Standard Use Table", q: rows[0].q,
    },
  };
}

/** Westerly's required affordable share (§ 260-50.2 B): 15% of the units at six or more, rounded half up. */
export function westerlyInclusionary(units: number): number {
  return units >= 6 ? Math.floor(units * 0.15 + 0.5) : 0;
}

export function westerlyFindings(i: ProjectInputs): Finding[] {
  const out: Finding[] = [];
  if (i.kind !== "commercial" && i.units >= 6) {
    const need = westerlyInclusionary(i.units);
    out.push({
      id: "we-inclusionary", st: i.aff >= need ? "pass" : "fail",
      t: `Inclusionary zoning: ${need} of ${i.units} homes must be affordable, ${i.aff} entered`,
      p: `Six or more homes need 15% low- or moderate-income units, deed-restricted for 99 years, with a monitoring agency the Planning Board approves. Each required affordable unit earns one more market-rate unit, with the lot area per unit reduced to fit them. The ordinance counts 15% of "the basic number dwelling units per acre permitted in the underlying zone": this site takes 15% of the units entered, so confirm the count with the planning office.`,
      src: "wezo", pin: "§ 260-50.2 B", q: "In every residential subdivision or land development project that consists of six or more residential lots or dwelling units",
    });
    out.push({
      id: "we-inclusionary-bonus", st: "info", t: `Density bonus: ${need} more market-rate home${need === 1 ? "" : "s"} for the affordable ones`,
      p: "The bonus units are added to the units the district allows, and the minimum lot area per unit shrinks to make room for them.",
      src: "wezo", pin: "§ 260-50.2 C", q: "All projects subject to inclusionary zoning shall be allowed the addition of one market rate unit for each affordable unit required",
    });
  }
  if (i.kind !== "commercial" && i.units >= 4 && (i.zone === "HDR-6" || i.zone === "HDR-15")) {
    const acres = i.zone === "HDR-6" ? 2 : 4, per = i.zone === "HDR-6" ? 6000 : 15000;
    const need = Math.max(acres * 43560, i.units * per);
    out.push(i.zone === "HDR-6" ? {
      id: "we-density", st: i.lot >= need ? "pass" : "flag",
      t: `Density (ordinance): ${need.toLocaleString("en-US")} sq ft for ${i.units} multifamily units, ${i.lot.toLocaleString("en-US")} entered`,
      p: `A multifamily lot in HDR-6 needs 2 acres and 6,000 sq ft per unit, from Westerly's schedule, not the Atlas's figure. Impervious surface is limited to 40%, and the yards are 25 ft front, 22.5 ft side and 25 ft rear.${i.lot < need ? ` Short by ${(need - i.lot).toLocaleString("en-US")} sq ft; inclusionary bonus units reduce the area per unit.` : ""}`,
      src: "wezd", pin: "Attachment 10, HDR-6, Multifamily", q: "Multifamily 2 acres/ 140 40.0%",
    } : {
      id: "we-density", st: i.lot >= need ? "pass" : "flag",
      t: `Density (ordinance): ${need.toLocaleString("en-US")} sq ft for ${i.units} multifamily units, ${i.lot.toLocaleString("en-US")} entered`,
      p: `A multifamily lot in HDR-15 needs 4 acres and 15,000 sq ft per unit, from Westerly's schedule, not the Atlas's figure. Impervious surface is limited to 37%, and the yards are 30 ft all round.${i.lot < need ? ` Short by ${(need - i.lot).toLocaleString("en-US")} sq ft; inclusionary bonus units reduce the area per unit.` : ""}`,
      src: "wezd", pin: "Attachment 10, HDR-15, Multifamily", q: "Multifamily - See §§ 260-62. 4 acres/ 150 37.0%",
    });
    out.push({
      id: "we-multi", st: i.lot >= acres * 43560 ? "info" : "flag",
      t: `Multifamily in ${i.zone}: a special use permit, and a lot of ${acres} acres for a multifamily building`,
      p: `Townhouse buildings of up to four units may go on any conforming lot; a larger multifamily building needs ${acres} acres. Buildings sit as far as practicable from neighbouring one- and two-family homes, behind a ${i.zone === "HDR-6" ? 20 : 30} ft landscape buffer, and no unit may have more than two bedrooms.`,
      src: "wezo", pin: "§ 260-63 A(3)", q: "Multifamily buildings may be permitted only on lots with a minimum of two acres in HDR-6 and a minimum of four acres in HDR-15 Zoning Districts.",
    });
  }
  if (i.kind !== "commercial" && i.units >= 4) {
    out.push({
      id: "we-relief-board", st: "info", t: "Special use permits go to the Planning Board when it reviews the project",
      p: "A special use permit or variance for a project the Planning Board is already reviewing is decided by the Planning Board under unified development review, after a public hearing. Otherwise the Zoning Board decides it.",
      src: "wezo", pin: "§ 260-45.3 A", q: "shall qualify for unified development review conducted and decided by the Planning Board",
    });
  }
  return out;
}

/** The overlays Westerly's ordinance has in force. The Zoning Atlas maps none of them. */
export const WESTERLY_UNMAPPED = [
  // Which are on the Town's own GIS, from its layer legend (source wegis, saved by Maqz on 2026-11-18).
  { abbr: "APZ", name: "Aquifer Protection Zone (Aquifer and Wellhead Protection Overlay)", where: "not on the Town's online GIS either: ask the Planning office for its map" },
  { abbr: "WPZ", name: "Wellhead Protection Zone (Aquifer and Wellhead Protection Overlay)", where: "not on the Town's online GIS either: ask the Planning office for its map" },
  { abbr: "AAO", name: "Airport Area Overlay District", where: "on the Town's online GIS as Airport 1 and 2 Overlay Areas, with the airport hazard zones A to E (westerly.mapxpress.net)" },
  { abbr: "SPO", name: "Salt Pond Overlay District", where: "not on the Town's online GIS either: ask the Planning office for its map" },
  { abbr: "BBO", name: "Bed-and-Breakfast Overlay District", where: "on the Town's online GIS (westerly.mapxpress.net): look the parcel up there" },
  { abbr: "HMO", name: "Historic Mill Overlay District", where: "on the Town's online GIS (westerly.mapxpress.net): look the parcel up there" },
  { abbr: "GSO", name: "Granite Street Overlay District", where: "on the Town's online GIS (westerly.mapxpress.net): look the parcel up there" },
  { abbr: "WSO", name: "Wells Street Overlay District", where: "on the Town's online GIS (westerly.mapxpress.net): look the parcel up there" },
];

export function westerlyOverlayFlags(i: ProjectInputs): Partial<Flags> {
  return { aquifer: !!inAquifer(i), airport: (i.overlays ?? []).includes("AAO") };
}

export function westerlyOverlay(i: ProjectInputs, abbr: string): Finding[] | null {
  if (abbr === "APZ" || abbr === "WPZ") {
    return [{
      id: `we-${abbr.toLowerCase()}`, st: "flag", t: `${abbr === "WPZ" ? "Wellhead" : "Aquifer"} Protection Zone: the use table's column applies, and some uses need an aquifer protection permit`,
      p: "The permit is decided by the Zoning Board, on evidence that best practices protect the groundwater, and is in addition to any other relief. The use finding above already takes the zone's column into account. Storage of fuel and hazardous materials, impervious cover and car washing have their own rules in the section, which are not read here.",
      src: "wezo", pin: "§ 260-52", q: "an aquifer protection permit shall be required for those uses, as identified on the Zoning District Use Tables",
      gap: "The Aquifer and Wellhead Protection Overlay's performance standards (§ 260-52 F to H) and the zone maps, which are not on the Town's GIS",
    }];
  }
  if (abbr === "AAO") {
    return [{
      id: "we-airport", st: "flag", t: "Airport Area Overlay: development plan review by the Planning Board, and height limits near Westerly State Airport",
      p: "Any building other than a single-family home on a lot with a mapped confliction area goes to the Planning Board for development plan review. If it needs a variance, the Planning Board's review is advisory and the Zoning Board decides, sitting as the overlay's board of appeals. In the runway protection zone almost nothing may be built. The confliction area maps come from the airport's FAA Part 77 surfaces.",
      src: "wezo", pin: "§ 260-51 F", q: "the Planning Board review shall be advisory to the Zoning Board sitting as the Airport Area Overlay District Board of Appeals",
      gap: "The confliction area maps 2A to 2D. The Town's GIS shows the Airport 1 and 2 Overlay Areas and the hazard zones A to E, but not the confliction areas",
    }];
  }
  return null;
}

/** Development plan review in the airport overlay, where the Zoning Board decides in a second capacity. */
export const airportStep: Step = {
  id: "airport", title: "Airport overlay development plan review", cond: "airport", app: "One application for development plan review, with a height analysis against the airport's surfaces",
  clock: { text: "Not read: § 260-51 F sets its own procedure" },
  what: "On a lot with a mapped confliction area near Westerly State Airport, anything but a single-family home goes to the Planning Board for development plan review. Where a variance is needed, the Zoning Board decides it, sitting as the Airport Area Overlay District's board of appeals under the state airport zoning act, and the Planning Board's review is advisory.",
  auth: [
    { c: "pb", role: "Decides the development plan, or advises when a variance is needed" },
    { c: "zbr", role: "Decides variances, sitting as the Airport Area Overlay District Board of Appeals" },
  ],
  docs: [
    { title: "The Zoning Board in a second capacity", src: "wezo", pin: "§ 260-51, definition of Board of Appeals", q: "shall be the Airport Area Overlay District Board of Appeals to hear and decide all variances", checklist: ["Ask whether the lot has a mapped confliction area", "Plan for an FAA 7460-1 airspace analysis if the building is tall"] },
  ],
};

/** The aquifer protection permit, where the use table asks for one (cond "aquifer"). */
export const aquiferStep: Step = {
  id: "aquifer", title: "Aquifer protection permit, if the use table asks for one", cond: "aquifer", app: "Aquifer protection permit application, filed in the Zoning Office",
  clock: { text: "Not read" },
  what: "In the Aquifer and Wellhead Protection Overlay, a use marked Q in the use table, or P/Q without public sewer, needs an aquifer protection permit from the Zoning Board on top of any other relief.",
  auth: [{ c: "zbr", role: "Decides the aquifer protection permit" }],
  docs: [
    { title: "When the permit is needed", src: "wezo", pin: "§ 260-52", q: "An aquifer protection permit shall be in addition to any other relief the applicant/owner is required to obtain.", checklist: ["Read the use table's APZ and WPZ columns for your use", "Prepare the best management practice plan the section asks for"] },
  ],
};

/** What the town lays over state law, registered in ../overlay.ts. Read for its overlay stack, inclusionary zoning and listed parcels (ARD D53, chunk 3). */
export const RULES: TownRules = {
  use: westerlyUse, useCommercial: westerlyCommercialUse, overlayRules: westerlyOverlay, unmappedOverlays: WESTERLY_UNMAPPED,
  overlayFlags: westerlyOverlayFlags, moreFindings: (i) => westerlyFindings(i), inclusionaryRead: true,
  extraSteps: [{ step: aquiferStep, before: ["building"] }, { step: airportStep, before: ["building"] }],
  affordableLines: (i) => (i.kind !== "commercial" && i.units >= 6 ? [{ short: "15%: Westerly inclusionary zoning", what: "Six or more homes need 15% of the units low- or moderate-income, deed-restricted for 99 years, with one bonus market-rate unit for each.", src: "wezo", need: westerlyInclusionary(i.units) }] : []),
};
