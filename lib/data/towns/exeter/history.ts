import type { Precedent } from "../../../types";

/**
 * Exeter's comprehensive permit cases since 2023, read 2026-11-19 from the Planning Board's minutes on the state Open
 * Meetings site (ARD D64). They were found by the records search of chunk 6 (D63, lib/data/searched.ts). Map positions:
 * parcels found in RIDEM's tax parcel layer by plat and lot (centroid of the outlines); districts from the Zoning Atlas
 * at that point. Applicants are named only as businesses, and residents by role (principle 7).
 */
export const EXETER_HISTORY: Omit<Precedent, "events" | "checked" | "town">[] = [
  {
    at: { lat: 41.575552, lon: -71.580786, exact: true }, parcels: ["EX 36-2-2"],
    name: "Solicity Project", addr: "0 Ten Rod Road", lot: "Plat 36, Block 2, Lot 2", zone: "RU-4", units: 155, aff: 0, route: "comp",
    routeLabel: "Comprehensive permit (major subdivision, then major land development)",
    status: "pending", statusLabel: "Pre-application (three conferences)",
    notes: "A comprehensive permit on about 109 acres of RU-4, first 120 homes, single-family and duplexes, with at least a quarter low- and moderate-income, and 155 to 164 by the third pre-application conference in January 2026. No application has been filed past pre-application. The owner has also appealed to the Zoning Board over zoning certificates for the property and over the zoning map; the Board denied the appeals in 2023 and 2025. The share of affordable homes in the current scheme is not stated; the count above is left at zero for that reason.",
    src: ["exzb230413", "expb231128", "expb251028", "expb260127", "exzb250612"],
  },
  {
    at: { lat: 41.582923, lon: -71.592625, exact: true }, parcels: ["EX 22-3-3"],
    name: "Ten Rod Road Neighborhood", addr: "Between 875 and 919 Ten Rod Road", lot: "Plat 22, Block 3, Lot 3", zone: "RU-4", units: 300, aff: 90, route: "comp",
    routeLabel: "Comprehensive permit (major land development)",
    status: "pending", statusLabel: "Pre-application",
    notes: "About 300 homes on about 118 acres, at least 30% (about 90) low- and moderate-income: affordable age-restricted apartments, condominiums and single-family lots, by Crossroad Capital Fund VIII, LLC. The site has a history of other plans: a partly built golf course (1999), a master plan for 100 homes (2008) and a utility-scale solar plan (2021).",
    src: ["expb260608"],
  },
  {
    at: { lat: 41.546904, lon: -71.617078, exact: true }, parcels: ["EX 58-1-1", "EX 58-1-2", "EX 58-1-3"],
    name: "Gardner Ridge", addr: "415 Gardner Road", lot: "Plat 58, Block 1, Lots 1, 2 & 3", zone: "RU-3", units: 20, aff: 5, route: "comp",
    routeLabel: "Comprehensive permit (major land development)",
    status: "approved", statusLabel: "Preliminary approved 5–0",
    notes: "Twenty one-bedroom condominiums in ten duplexes on the 3.7-acre site of the former Shady Acres Nursing Home, five affordable. An adaptive reuse of the old buildings was weighed first. Adjustments let two-family buildings into RU-3 and cut the front yard from 100 to 19 ft and the rear from 50 to 11.5 ft; one requested waiver was denied, and an impact-fee waiver for six of the market-rate homes passed 4 to 1. Approved with fifty conditions, among them $10,000 toward Gardner Road; the septic change was still before RIDEM.",
    src: ["expb260127", "expb260414", "expb260623"],
  },
];
