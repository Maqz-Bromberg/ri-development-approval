import type { Finding, TreeId } from "../../types";

/*
 * How each busy city runs its review routes, read from its board's minutes (ARD D69), since the cities' own land
 * development regulations could not be fetched: eCode360 began refusing scripts on 2026-11-19, Municode always has,
 * and Woonsocket's copy on ClerksHQ dates from 2017, before the state's 2023 rewrite of the review law. What the
 * minutes show is who decides, which stages are combined, and what is left to staff; the steps themselves stay state
 * law. Each finding quotes the minutes it rests on. Keep `src` before `q` on the same line. Since 2026-11-20 Central
 * Falls's 2025 regulations are read too (in its own folder), and Woonsocket's of 2021 are in hand but predate 2023.
 */

type Route = Omit<Finding, "st" | "id"> & { id: string };

const ROUTES: Record<string, Route> = {
  Pawtucket: {
    id: "pa-route", t: "How Pawtucket runs its review: the City Planning Commission, with the Technical Review Committee",
    p: "The City Planning Commission decides land development projects after the Technical Review Committee recommends conditions; some development plan reviews in Conant Thread went to a Joint Planning Commission. A project of more than ten homes in Conant Thread goes before the Commission for development plan review even with no variance. The Commission has let staff give the final plan approval. The city's own regulations were not read; these are from the minutes of 2024 to 2026.",
    src: "papc250121", pin: "Jan 21, 2025, 225 Conant Street", q: "E-(1) as the project is proposing over ten (10) units",
  },
  Cranston: {
    id: "cr-route", t: "How Cranston runs its review: the City Plan Commission, which also advises the Zoning Board",
    p: "The City Plan Commission decides land development projects and sends the Zoning Board of Review a recommendation on each variance and special use permit filed there. Large projects keep their approvals alive by extensions of a year or two at a time, which the Commission grants routinely (Champlin Heights three times, Legion Bowl twice). The city's own regulations were not read; these are from the minutes of 2024 to 2026.",
    src: "crpc240606", pin: "Jun 6, 2024", q: "to forward a negative recommendation on the Application to the Zoning Board",
  },
  "East Providence": {
    id: "ep-route", t: "How East Providence runs its review: the Planning Board, with the final plan usually by staff",
    p: "The Planning Board decides land development projects, voting each condition separately; the final plan is normally approved by staff, unless the Board kept it at the preliminary stage. In the Waterfront District the Waterfront Commission reviews, and the Planning Board only advises it. The city's own regulations were not read; these are from the minutes of 2024 and 2025.",
    src: "eppb250113", pin: "Jan 13, 2025, Taunton Avenue", q: "While Final Plan approval is normally done at the staff level",
  },
  Woonsocket: {
    id: "wo-route", t: "How Woonsocket runs its review: the Planning Board, with zoning relief under unified development review",
    p: "The Planning Board decides land development projects and the zoning relief they need in the same hearing, under unified development review, and has combined the master and preliminary plans for a project in one approval. Every member's vote on each motion is recorded. The city's own regulations in hand, adopted on May 4, 2021 (newer than the 2017 copy on ClerksHQ), still predate the state's 2023 rewrite, so their stages and clocks are not used; these are from the minutes of 2024 to 2026.",
    src: "wopb251209", pin: "Dec 9, 2025, 60 Mendon Road", q: "Motion to approve the Combined Master & Preliminary Plan",
  },
  Warwick: {
    id: "wa-route", t: "How Warwick runs its review: the Planning Board, and the City Council for the PDR overlay",
    p: "The Planning Board decides land development projects. Because more than two homes on a lot need the Planned District Residential overlay, most multi-family projects are a zone change too: the Board approves the master plan and sends the City Council a recommendation, and the Council decides the zone change before the preliminary plan. The Board has left the final plan to the administrator. The city's own regulations were not read; these are from the minutes of 2024 to 2026.",
    src: "wapb240710", pin: "Jul 10, 2024, 1515 Centerville Road", q: "The project requires a zone change and therefore Council approval.",
  },
  Newport: {
    id: "ne-route", t: "How Newport runs its review: the Planning Board grants the special use permit and variances itself",
    p: "Under unified development review the Planning Board decides the special use permits and variances a project needs, each contingent on the final development plan. In a historic district the Historic District Commission's certificate comes first. The city's own regulations were not read; these are from the minutes of 2025 and 2026.",
    src: "nepb250908", pin: "Sep 8, 2025, 525 Broadway", q: "contingent upon the approval of the final development plan",
  },
  "Central Falls": {
    id: "cf-route", t: "How Central Falls runs its review: the Planning Board, voting each variance separately",
    p: "The Planning Board decides land development projects and their dimensional variances under unified development review, voting each variance as a motion of its own before the plan. The board has filed nothing on the state site since May 2025. These are from the minutes of 2024; the city's regulations of April 2025 are read on the minor and major routes.",
    src: "cfpb240111", pin: "Jan 11, 2024, 4 and 6 School Street", q: "Approve or deny the Applicant’s request Dimensional Variances for maximum height.",
  },
};

/** The city's route as its minutes show it, on every route but a building permit alone. */
const CITY_READ = "State law; the city's practice read from its minutes, 2026-11-19";
/** How well a city's routes are sourced: state law, with its practice read from its board's minutes (ARD D69). */
export const CITY_STATUS = { minor: CITY_READ, major: CITY_READ, dpr: CITY_READ };

export const cityRoute = (town: string, tree: TreeId): Finding[] => {
  const r = ROUTES[town];
  return r && tree !== "byright" ? [{ ...r, st: "info" }] : [];
};
