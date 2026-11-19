import type { Precedent } from "../../../types";

/**
 * Hopkinton's comprehensive permit cases since 2023, read 2026-11-19 from the Planning Board's minutes on the state Open
 * Meetings site (ARD D64). They were found by the records search of chunk 6 (D63, lib/data/searched.ts). Map positions:
 * parcels found in RIDEM's tax parcel layer by plat and lot (centroid of the outlines); districts from the Zoning Atlas
 * at that point. Applicants are named only as businesses, and residents by role (principle 7).
 */
export const HOPKINTON_HISTORY: Omit<Precedent, "events" | "checked" | "town">[] = [
  {
    at: { lat: 41.540063, lon: -71.739974, exact: true }, parcels: ["HO 032-000-00001", "HO 032-000-00004", "HO 032-000-00006", "HO 032-000-00008", "HO 032-000-00010", "HO 032-000-00012", "HO 032-000-00014", "HO 032-000-00016", "HO 032-000-00017", "HO 032-000-00021", "HO 032-000-00023", "HO 032-000-00025", "HO 032-000-00027", "HO 032-000-00030", "HO 032-000-00032", "HO 032-000-00034", "HO 032-000-00036", "HO 032-000-00038", "HO 032-000-00040", "HO 032-000-00041", "HO 032-000-00042", "HO 032-000-00044", "HO 032-000-00046", "HO 032-000-00048", "HO 032-000-00050", "HO 032-000-00052", "HO 032-000-00054", "HO 032-000-00056", "HO 032-000-00058", "HO 032-000-00060", "HO 032-000-00062", "HO 032-000-00063", "HO 032-000-00065", "HO 032-000-00067", "HO 032-000-00068", "HO 032-000-00069", "HO 032-000-00070", "HO 032-000-00071"],
    name: "Brushy Brook", addr: "130 and 0 Dye Hill Road", lot: "Plat 32, 38 lots", zone: "RFR-80", units: 140, aff: 35, route: "comp",
    routeLabel: "Comprehensive permit (major subdivision)",
    status: "approved", statusLabel: "Final approved 5–0",
    notes: "140 homes on 38 lots, about 345 acres, a quarter of them affordable (35 here, from the quarter the minutes give). The preliminary hearing ran through eight meetings in 2023, with concerns about roads, sidewalks and building so many homes far from services; it was approved 3 to 2 in August 2023 with a growth management waiver of 46 homes a year, and two residents appealed. The approval was extended in September 2025 and the final plan approved 5 to 0 in December 2025.",
    src: ["hopb230104", "hopb230824", "hopb230920", "hopb250903", "hopb251203"],
  },
  {
    at: { lat: 41.462225, lon: -71.792302, exact: true }, parcels: ["HO 007-000-00011", "HO 007-000-00014"],
    name: "Clarks Falls", addr: "0 Clarks Falls Road", lot: "Plat 7 Lots 11 & 14", zone: "RFR-80", units: 80, aff: 20, route: "comp",
    routeLabel: "Comprehensive permit (major land development)",
    status: "pending", statusLabel: "Preliminary plan hearing continued",
    notes: "Townhouses on about 108 acres, 40 of them wetland, kept as one lot with a homeowners' association and the land outside the 20 developed acres under a conservation easement. The master plan approved 54 three-bedroom townhouses; the preliminary plan proposes 80 two-bedroom ones, 20 affordable, with the same bedrooms and septic design, against a base density of 34 and a total of 206 that the applicant said the law would allow. Heard from March to September 2026; in September the master plan approval was reinstated and extended to October 2027 and the hearing continued to October 7.",
    src: ["hopb240207", "hopb260324", "hopb260701", "hopb260902"],
  },
];
