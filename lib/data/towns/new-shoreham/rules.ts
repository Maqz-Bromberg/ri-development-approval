import type { Finding, ProjectInputs } from "../../../types";
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
 *     the Zoning Atlas, as a tick on the form.
 * The Atlas's RCM is the ordinance's RC/M zone, and MU its Mixed Use (M) zone. Not read: the Planned Development zone's
 * affordable housing districts (§ 319), Flexible Design Residential Development (§ 402), the Coastal (C) and Waterfront
 * overlays, and the Historic District Zoning Ordinance itself.
 */

type Zone = "RA" | "RB" | "RC" | "RC/M" | "M" | "OHC" | "NHC" | "SC";
const ATLAS: Record<string, Zone> = { RA: "RA", RB: "RB", RC: "RC", RCM: "RC/M", MU: "M", OHC: "OHC", NHC: "NHC", SC: "SC" };
const SECTION: Record<Zone, string> = { RA: "§ 306", RB: "§ 307", RC: "§ 308", "RC/M": "§ 309", M: "§ 310", OHC: "§ 311", NHC: "§ 312", SC: "§ 313" };
const MULTI: Zone[] = ["OHC", "NHC", "SC"];
const SECONDARY: Zone[] = ["RA", "RB", "RC", "RC/M", "M", "NHC", "SC"];

export const NEW_SHOREHAM_UNMAPPED = [
  { abbr: "H", name: "Historic Overlay (Historic District Commission, § 317)", where: "The Town's Historic District Map; not found as map data." },
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

export const newShorehamOverlayFlags = (i: ProjectInputs) => ({ historic: (i.overlays ?? []).includes("H") });

export function newShorehamOverlay(_i: ProjectInputs, abbr: string): Finding[] | null {
  if (abbr !== "H") return null;
  return [{
    id: "ns-area-h", st: "flag", t: "Historic Overlay: the Historic District Commission's approval",
    p: "Construction, alteration, moving and demolition in the Historic Overlay are regulated under the Town's Historic District Zoning Ordinance, administered by the Historic District Commission. That ordinance was not read, so its procedure and clock are not on the route.",
    src: "nszo", pin: "§ 317 B", q: "This Zoning Ordinance incorporates by reference the Town of New Shoreham Historic District Zoning Ordinance",
  }];
}
