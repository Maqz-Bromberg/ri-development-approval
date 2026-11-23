import type { Finding, Flags, ProjectInputs, Step, TownRules } from "../../../types";
import { useFinding, type Value } from "../useTable";

/*
 * New Shoreham (Block Island), read 2026-11-19 from its Zoning Ordinance, Appendix E (`nszo`, eCode360's copy, which the
 * Town's website links to; the ClerksHQ copy the Secretary of State lists is older, stopping at Ord. 2024-11, so the
 * source carries a "which copy" mark, ARD D70). Chunk 5. New Shoreham has no use table: each zone's section lists its permitted uses, its
 * special uses and its land development uses. What it adds:
 *   - one house a lot in the residential and mixed-use zones, and a second dwelling on the lot only as a Secondary
 *     Dwelling Development, by special use permit with development plan review (§ 403);
 *   - multi-family homes only by special use permit in the three commercial zones (OHC, NHC, SC), and new ones only
 *     where there is municipal sewer and water (§ 404 B), at 20,000 sq ft of developable land a home;
 *   - density as developable land a home: RA 120,000 sq ft for new lots, RB 60,000, RC, RC/M and M 20,000 with
 *     public sewer or 40,000 without;
 *   - affordable housing (§ 405) by special use permit after the Block Island Housing Board's review: two homes on a lot
 *     with one affordable, each affordable home's lot area halved, and, until December 31, 2028 and only with a
 *     nonprofit sponsor, small multi-family buildings (two homes in RA and RB, four in RC, RC/M and M);
 *   - the Historic Overlay, administered by the Historic District Commission under its own ordinance (§ 317), not in
 *     the Zoning Atlas. Since 2026-11-20 the lookup finds it on the Town's GIS layer (`nshdgis`, ARD D78) and the map
 *     draws it, and its certificate of appropriateness is a step of its own, read from Chapter 7 of the Town's Code
 *     (`nsc7`): 45 days or deemed approved, up to 90 with a finding, exterior features only, appeal to the Zoning Board.
 * The Atlas's RCM is the ordinance's RC/M zone, and MU its Mixed Use (M) zone. Not read: the Planned Development zone's
 * affordable housing districts (§ 319), Flexible Design Residential Development (§ 402), the Coastal (C) and Waterfront
 * overlays, and the Historic District Commission's own published standards (§ 7-5(c)).
 */

type Zone = "RA" | "RB" | "RC" | "RC/M" | "M" | "OHC" | "NHC" | "SC";
const ATLAS: Record<string, Zone> = { RA: "RA", RB: "RB", RC: "RC", RCM: "RC/M", MU: "M", OHC: "OHC", NHC: "NHC", SC: "SC" };
const SECTION: Record<Zone, string> = { RA: "§ 306", RB: "§ 307", RC: "§ 308", "RC/M": "§ 309", M: "§ 310", OHC: "§ 311", NHC: "§ 312", SC: "§ 313" };
const MULTI: Zone[] = ["OHC", "NHC", "SC"];
const SECONDARY: Zone[] = ["RA", "RB", "RC", "RC/M", "M", "NHC", "SC"];

export const NEW_SHOREHAM_UNMAPPED = [
  { abbr: "H", name: "Historic Overlay (Historic District Commission, § 317)", where: "The Town's GIS, Historic District Overlay layer (last edited July 2017), and the lots listed in § 7-13 of the Town's Code." },
];

export function newShorehamUse(i: ProjectInputs): { value: Value; finding: Finding } | null {
  const z = ATLAS[i.zone];
  if (!z) return null;
  const pin = `${SECTION[z]} D and E`;
  const RES: Zone[] = ["RA", "RB", "RC", "RC/M", "M"];
  if (i.units >= 3 && RES.includes(z)) {
    // § 405 E: attached multi-family homes where otherwise prohibited, for affordable housing sponsored by a nonprofit, until 2028.
    const cap = z === "RA" || z === "RB" ? 2 : 4;
    if (i.aff > 0) return useFinding({ id: "ns-use", town: "New Shoreham", from: "zone sections", what: "Multi-family affordable housing", zone: i.zone, value: "hearing", why: [`Only as affordable housing sponsored by the Block Island Housing Board or another nonprofit housing entity, by special use permit with the Housing Board's review and development plan review: buildings of no more than ${cap} homes in ${z}. This provision expires on December 31, 2028, or sooner once the Town's affordable inventory reaches 80 owned and 100 rented homes. Without such a sponsor, multi-family homes are not allowed in ${z}.`], src: "nszo", pin: "§ 405 E(2), (3)", q: "may allow attached multi-family development in those zoning districts where such use is otherwise prohibited" });
  }
  if (i.units >= 3) {
    if (!MULTI.includes(z)) return useFinding({ id: "ns-use", town: "New Shoreham", from: "zone sections", what: "Multi-family homes", zone: i.zone, value: "prohibited", why: ["Multi-family development is a special use only in the Old Harbor Commercial, New Harbor Commercial and Service Commercial zones, and through a Planned Development district."], src: "nszo", pin, q: "Single Family Dwelling Units (one per lot)" });
    const noUtilities = i.type !== "reuse" && !(i.sewer && i.water);
    const why = noUtilities ? ["New multi-family homes are allowed only where there is municipal sewer and water, and this site has not both entered. With both, they are a special use in this zone."] : ["Allowed by special use permit from the Zoning Board, which asks the Planning Board's advice."];
    const value: Value = noUtilities ? "prohibited" : "hearing";
    if (i.type === "reuse") why.push("In an existing building without municipal sewer, at least 20,000 sq ft of lot a home (§ 404 A).");
    return useFinding({ id: "ns-use", town: "New Shoreham", from: "zone sections", what: "Multi-family homes", zone: i.zone, value, why, src: "nszo", pin: "§ 404 B", q: "New Multi-Family Development is allowed only within the area served by municipal sewer and water" });
  }
  if (i.units === 2) {
    if (i.aff > 0 && ["RA", "RB", "RC", "RC/M", "M"].includes(z)) return useFinding({ id: "ns-use", town: "New Shoreham", from: "zone sections", what: "Two homes on a lot, one affordable", zone: i.zone, value: "hearing", why: ["With an affordable home, two homes may share a lot where one is the limit, and may be attached as a two-family house, by special use permit after the Block Island Housing Board's review, with development plan review."], src: "nszo", pin: "§ 405 C(3)", q: "may allow the development of up to two dwelling units (one market rate and one affordable or two affordable)" });
    if (!SECONDARY.includes(z)) return useFinding({ id: "ns-use", town: "New Shoreham", from: "zone sections", what: "Two homes on a lot", zone: i.zone, value: "prohibited", why: ["The zone lists one house a lot and no secondary dwelling."], src: "nszo", pin, q: "Single Family Dwelling Unit (one per lot)" });
    return useFinding({ id: "ns-use", town: "New Shoreham", from: "zone sections", what: "Two homes on a lot (Secondary Dwelling Development)", zone: i.zone, value: "hearing", why: ["New Shoreham has no two-family use. A second dwelling on the lot is a Secondary Dwelling Development: a special use permit from the Zoning Board, with the Planning Board's advice and development plan review, and the Historic District Commission's advice on siting and massing."], src: "nszo", pin: "§ 403 B", q: "A Secondary Dwelling Development is allowed only by Special Use Permit." });
  }
  return useFinding({ id: "ns-use", town: "New Shoreham", from: "zone sections", what: "Single-family home", zone: i.zone, value: "allowed", why: ["One house a lot."], src: "nszo", pin, q: "Single Family Dwelling Units" });
}

/** Developable land a home (§§ 306 to 313 B), in sq ft, for a new lot. */
function perHome(z: Zone, sewer: boolean): number {
  if (z === "RA") return 120000;
  if (z === "RB") return 60000;
  if (z === "RC" || z === "RC/M" || z === "M") return sewer ? 20000 : 40000;
  return 20000;
}

export function newShorehamFindings(i: ProjectInputs): Finding[] {
  const z = ATLAS[i.zone];
  if (!z || i.kind === "commercial") return [];
  // § 405 C: each affordable home's lot area may be reduced by up to half (three quarters with a nonprofit sponsor, § 405 E).
  const per = perHome(z, i.sewer), aff = Math.min(i.aff, i.units), need = per * (i.units - aff) + Math.ceil(per / 2) * aff;
  const q = z === "RA" || z === "RB" ? "For all newly created lots" : z === "OHC" || z === "NHC" || z === "SC" ? "Minimum developable land area required for each dwelling unit, 20,000 square feet." : i.sewer ? "With public sewer, 20,000 square feet of developable land is required" : "Without public sewer, 40,000 square feet of developable land is required.";
  return [{
    id: "ns-density", st: i.lot >= need ? "pass" : "fail", t: `Density: ${need.toLocaleString("en-US")} sq ft of developable land for ${i.units} home${i.units === 1 ? "" : "s"} (${per.toLocaleString("en-US")} a home${aff ? `, half for ${aff === 1 ? "the affordable one" : `each of the ${aff} affordable`}` : ""}), ${i.lot.toLocaleString("en-US")} entered`,
    p: `Developable land leaves out wetlands and other constrained land (§ 202). ${z === "RA" || z === "RB" ? "This is the figure for a newly created lot; lots of record from before March 4, 1989 need less. " : ""}${aff ? "An affordable home's share may be halved by special use permit (§ 405 C), or cut by three quarters for a project sponsored by the Block Island Housing Board or another nonprofit (§ 405 E, to 2028)." : ""}`.trim(),
    src: "nszo", pin: `${SECTION[z]} B`, q,
  }];
}

export const newShorehamOverlayFlags = (i: ProjectInputs): Partial<Flags> => ({ historic: (i.overlays ?? []).includes("H") });

export function newShorehamOverlay(_i: ProjectInputs, abbr: string): Finding[] | null {
  if (abbr !== "H") return null;
  return [{
    id: "ns-area-h", st: "flag", t: "Historic Overlay: a certificate of appropriateness from the Historic District Commission",
    p: "Before any construction, alteration, repair, removal or demolition of a structure in the historic district, the owner must have a certificate of appropriateness from the Historic District Commission, whether or not a building permit is needed. The district is every property inside the boundary marked \"historic district zone\" on the official zoning map, with buildings added one by one; § 7-13 lists the lots. The Town's GIS layer draws the boundary (the harbour area, with two small areas inland) without subdistricts, and was last edited in 2017, so a lot near its edge, or added since, should be checked against the list.",
    src: "nsc7", pin: "§ 7-4(a), § 7-6(a), § 7-13", q: "the owner must first apply for and receive a certificate of appropriateness from the commission",
    gap: "Whether the lot is on § 7-13's list, where the map's edge is close: the list is by plat and lot, and was last amended in 2013",
  }];
}

export const newShorehamCoaStep: Step = {
  id: "coa", title: "Certificate of appropriateness", cond: "historic", app: "Historic District Commission application, with plans, drawings and photographs",
  clock: { days: 45, text: "45 days from the completed application to decide, or up to 90 with a finding that more study is needed; no decision in time counts as approval" },
  what: "In the Historic Overlay, the Historic District Commission approves the design of new construction, alterations, repairs, moves and demolition before the work starts, and its certificate binds the building official. It passes only on exterior features, considering the building's significance, how it contributes to the district, and the design, arrangement, texture, materials and siting. It may call in experts at the owner's expense. It also advises the Zoning Board on setback variances in the district, and on the siting and massing of a second dwelling. Its decisions are in writing, and are appealed to the Zoning Board of Review.",
  auth: [
    { c: "hdc", role: "Decides the certificate after a hearing; advises the Zoning Board on setback variances in the district" },
    { c: "zbr", role: "Hears appeals of the Commission's decisions, on the Commission's record" },
  ],
  objections: ["design"],
  docs: [
    {
      title: "Which work needs a certificate", src: "nsc7", pin: "§ 7-6(a), (b); § 7-10", q: "A certificate of appropriateness is necessary whether or not state law requires that a permit",
      checklist: ["Find whether the lot is in the Historic Overlay: the Town's GIS draws it, and § 7-13 lists the lots by plat and lot", "Ordinary maintenance and repair that change no design, material or appearance need none (§ 7-10)"],
    },
    {
      title: "What to bring", src: "nsc7", pin: "§ 7-6(d)", q: "The commission shall require the owner to submit information which is",
      checklist: ["Plans, drawings and photographs, or other information the Commission asks for"],
    },
    {
      title: "A business sign, in a mixed-use building", src: "nshdcsign", pin: "Sign tabulation form", q: "HISTORIC DISTRICT COMMISSION SIGN TABULATION",
      checklist: ["List each sign, existing and proposed: its size in square feet, type, location, material, colours, font and the business name on it"],
    },
    {
      title: "What the Commission weighs: exterior features only", src: "nsc7", pin: "§ 7-6(e), (f)", q: "The commission shall pass only on exterior features of a structure and its appurtenances",
      checklist: ["The building's historic and architectural significance, and how it contributes to the district", "The design, arrangement, texture, materials and siting proposed", "Experts the Commission calls in are paid by the owner (§ 7-6(g))"],
    },
    {
      title: "45 days, or it counts as approved", src: "nsc7", pin: "§ 7-6(k)", q: "shall be deemed to constitute approval",
      checklist: ["With a finding that more study is needed, the Commission has up to 90 days", "The applicant and the Commission may agree to more time"],
    },
    {
      title: "Setback variances in the district", src: "nsc7", pin: "§ 7-9", q: "may recommend to the zoning board of review that such variance or exception to the standard yard",
      checklist: ["Older buildings in the district often do not meet today's yards; the Commission may support a variance to keep the street's look"],
    },
    {
      title: "Appeal to the Zoning Board of Review", src: "nsc7", pin: "§ 7-11", q: "shall not substitute its own judgment for that of the commission",
      checklist: ["The Board reverses only for prejudicial procedural error, clear error or a decision the record does not support", "A $75 fee covers advertising the appeal"],
    },
  ],
};

/** What the town lays over state law, registered in ../overlay.ts. Chunk 5, an island (ARD D70): no use table, a zone-by-zone reading; its ordinance copy carries a "which copy" mark. */
export const RULES: TownRules = {
  use: newShorehamUse, moreFindings: (i) => newShorehamFindings(i), overlayRules: newShorehamOverlay, unmappedOverlays: NEW_SHOREHAM_UNMAPPED,
  overlayFlags: newShorehamOverlayFlags, extraSteps: [{ step: newShorehamCoaStep, before: ["record", "building"] }], inclusionaryNone: { src: "nszo", note: "Affordable homes earn extra density by special use permit (§ 405), an incentive, not a requirement." },
};
