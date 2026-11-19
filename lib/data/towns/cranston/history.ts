import type { Precedent } from "../../../types";

/**
 * Cranston's larger housing projects since 2024, followed to a decision through the City Plan Commission's minutes on
 * the state Open Meetings site, read 2026-11-19 (ARD D68), from the records search of chunk 7 (D67). Map positions:
 * parcels in RIDEM's tax parcel layer by plat and lot (centroid); districts from the minutes. Applicants are named only
 * as businesses (principle 7).
 */
export const CRANSTON_HISTORY: Omit<Precedent, "events" | "checked" | "town">[] = [
  {
    at: { lat: 41.76244, lon: -71.474158, exact: true }, parcels: ["CR 17-670-0"],
    name: "Residences at Oaklawn Ave", addr: "Oaklawn Avenue", lot: "AP 17/3 Lot 670", zone: "B-2 (with conditions)", units: 12, aff: 0, route: "major",
    routeLabel: "Major land development project",
    status: "approved", statusLabel: "Preliminary approved 8–0",
    notes: "A two-story building of 12 homes on a lot rezoned to B-2 with conditions (the Zoning Atlas still shows A-8), approved at the preliminary plan after its master plan, with approvals from RIDOT, RIDEM and the state in hand.",
    src: ["crpc240305"],
  },
  {
    at: { lat: 41.793494, lon: -71.459255, exact: true }, parcels: ["CR 8-195-0", "CR 8-1617-0", "CR 8-2711-0"],
    name: "Cranston Print Works", addr: "1381 Cranston Street", lot: "AP 8 Lots 195, 1617 & 2711", zone: "M-1 (with conditions)", units: 100, aff: 0, route: "major",
    routeLabel: "Major land development project",
    status: "approved", statusLabel: "Preliminary approved 7–0",
    notes: "The historic print works mill renovated by Brady Sullivan Properties into self-storage below and apartments above: 129 homes at the master plan in April 2023, which was conditioned on a zone change allowing up to 150; 100 once Building C was found unsafe and taken down. The preliminary approval carried conditions on outside approvals, the sewer, stop signs and street trees; a condition requiring outdoor bicycle racks was debated, the applicant objecting to it as too detailed.",
    src: ["crpc250304", "crpc250401"],
  },
  {
    at: { lat: 41.777452, lon: -71.484277, exact: true }, parcels: ["CR 20-2128-0", "CR 12-3108-0"],
    name: "Champlin Heights", addr: "Champlin Heights (no street address in the minutes read)", lot: "AP 20/4 Lot 2128 and AP 12/6 Lot 3108", zone: "B-2", units: 152, aff: 0, route: "major",
    routeLabel: "Major land development project with a street extension (phase two)",
    status: "approved", statusLabel: "Preliminary approved; extended to June 2027",
    notes: "The second phase of Champlin Heights, 152 multi-family homes, by Champlin Heights II, LLC (the Carpionato Group). Its preliminary approval has been extended a year at a time, in 2024, 2025 and 2026, for coordination with state agencies, among them a new RIDEM permit. When its preliminary plan approval was approved is not in the minutes read.",
    src: ["crpc240606", "crpc250603", "crpc260602"],
  },
  {
    at: { lat: 41.777764, lon: -71.427006, exact: true }, parcels: ["CR 3-289-0", "CR 3-291-0", "CR 3-1695-0", "CR 3-1696-0"],
    name: "Legion Bowl", addr: "661 Park Avenue", lot: "AP 3 Lots 289, 291, 1695 & 1696", zone: "C-3 (with conditions)", units: 69, aff: 0, route: "major",
    routeLabel: "Major land development project",
    status: "approved", statusLabel: "Master plan approved; extended to July 2028",
    notes: "A mixed-use redevelopment with 69 homes over ground-floor shops on Park Avenue, also called the 661 Park project. Its master plan approval has been kept alive by extensions, two years in 2024 and two more in 2026, while it works toward a preliminary plan.",
    src: ["crpc240507", "crpc260602"],
  },
];
