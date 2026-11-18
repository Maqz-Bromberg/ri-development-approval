import type { Finding, Flags, ProjectInputs, Step } from "../../../types";

/*
 * Providence's review areas: parts of the city where another body takes over review (ARD D53, chunk 0, and D4).
 * The site lookup finds them from the City's zoning service and the state's I-195 parcel layer (lib/data/townLayers.ts),
 * and each can be ticked by hand. Read 2026-11-18 from the Zoning Ordinance of July 2026 (source `pzo`):
 *   HD    a local historic district: a certificate of appropriateness from the Historic District Commission (§ 1911)
 *   DD    the Downcity Overlay: formal development plan review by the Downtown Design Review Committee (§ 1907.C.1)
 *   ES    the East Side I-195 Overlay: the same Committee (§ 1908)
 *   I195  the I-195 Redevelopment District: its Commission sits as that Committee (§ 1716)
 *   I-3E, I-3H  the institutional overlays: an institutional master plan may come first (§ 1904.C.2.a, § 1910 not read)
 * Development the Committee or the I-195 Commission reviews is not a land development project (§ 1904.C.2.b), so the
 * route there is development plan review, whatever the number of units. D-1 review does not apply in a historic
 * district (§ 1907.C.3), so a site in both gets the Historic District Commission and the ordinary thresholds.
 * Not read: the Committee's and the Commission's own procedures and clocks, and the Transit-Oriented Development Overlay.
 */
export const PROVIDENCE_AREAS = [
  { abbr: "HD", name: "Historic Overlay District (a local historic district)" },
  { abbr: "DD", name: "Downcity Overlay District" },
  { abbr: "ES", name: "East Side I-195 Overlay District" },
  { abbr: "I195", name: "I-195 Redevelopment District" },
  { abbr: "I-3E", name: "Educational Institutional Overlay District" },
  { abbr: "I-3H", name: "Healthcare Institutional Overlay District" },
  { abbr: "TOD", name: "Transit-Oriented Development Overlay District" },
];

const has = (i: ProjectInputs, a: string) => (i.overlays ?? []).includes(a);

export function providenceOverlayFlags(i: ProjectInputs): Partial<Flags> {
  const historic = has(i, "HD");
  const committee = !historic && (has(i, "DD") || has(i, "ES") || has(i, "I195"));
  return { historic, ddrc: committee, i195: committee && has(i, "I195") };
}

/** True where the Downtown Design Review Committee or the I-195 Commission reviews, so the project is not land development. */
export const providenceDesignReview = (i: ProjectInputs) => !!providenceOverlayFlags(i).ddrc;

export function providenceOverlayRules(i: ProjectInputs, abbr: string): Finding[] | null {
  const committee = providenceDesignReview(i);
  switch (abbr) {
    case "HD": return [{
      id: "pvd-area-hd", st: "flag", t: "Historic district: a certificate of appropriateness from the Historic District Commission",
      p: "Any construction, alteration or demolition in a local historic district needs the Commission's certificate first, with or without a building permit. Staff may approve some applications, but only the Commission can deny one. Downtown design review does not apply in a historic district, so the ordinary review thresholds apply alongside it.",
      src: "pzo", pin: "§ 1911.A", q: "A certificate of appropriateness is required whether or not a building permit is required.",
      gap: "The Historic District Commission's standards and guidelines for the district, and its meeting and filing schedule",
    }];
    case "DD": return committee ? [{
      id: "pvd-area-dd", st: "info", t: "Downcity Overlay: the Downtown Design Review Committee reviews the plan, not the City Plan Commission",
      p: "New construction and major alterations in the Downcity Overlay go through formal development plan review by the Committee, which can also waive D-1 design regulations. Development it reviews is not a land development project, so the route is development plan review whatever the number of units.",
      src: "pzo", pin: "§ 1904.C.2.b", q: "Any development subject to review by the Downtown Design Review Committee or the I-195",
    }] : [];
    case "ES": return committee ? [{
      id: "pvd-area-es", st: "info", t: "East Side I-195 Overlay: the Downtown Design Review Committee reviews all development",
      p: "The overlay has its own block, frontage and design rules, and the Committee may waive them with written findings. As in the Downcity Overlay, this replaces land development review.",
      src: "pzo", pin: "§ 1908.C", q: "All development in the ES Overlay District requires review by the Downtown Design Review Committee.",
      gap: "The ES Overlay District's own regulations and incentives (§ 1908.F and the overlay's article)",
    }] : [];
    case "I195": return committee ? [{
      id: "pvd-area-i195", st: "info", t: "I-195 Redevelopment District: the I-195 Commission sits as the design review committee",
      p: "The I-195 Redevelopment District Commission is a state body. On its parcels it takes the Downtown Design Review Committee's place, and its staff take the application.",
      src: "pzo", pin: "§ 1716", q: "Redevelopment District, the I-195 Redevelopment District Commission shall serve as the Downtown Design",
      gap: "The Commission's development plan and its own review procedure, published by the I-195 Redevelopment District",
    }] : [];
    case "I-3E": case "I-3H": return [{
      id: `pvd-area-${abbr.toLowerCase()}`, st: "flag", t: `${abbr === "I-3E" ? "Educational" : "Healthcare"} institutional overlay: an institutional master plan may govern`,
      p: "Development by a college, university or hospital that is part of its institutional master plan is not a land development project, and in D-1 a project on such land needs the master plan approved first. A project by anyone else follows the base district.",
      src: "pzo", pin: "§ 1904.C.2.a", q: "Any development in an institutional district that is part of an institutional master plan.",
      gap: "Institutional master plan review (§ 1910) and the overlay's own rules",
    }];
    default: return null;
  }
}

/** A certificate of appropriateness, added to every route in a historic district (cond "historic"). */
export const coaStep: Step = {
  id: "coa", title: "Certificate of appropriateness", cond: "historic", app: "Certificate of appropriateness application, with plans and elevations",
  clock: { text: "Not read: the Commission's schedule and its standards" },
  what: "In a local historic district, the Historic District Commission approves the design of new construction, alterations and demolition before any work starts. Staff can approve some applications under the Commission's standards; any refusal goes to the Commission at a public hearing. Its decision is appealed to the Zoning Board of Review.",
  auth: [
    { c: "hdc", role: "Decides the certificate, at a public hearing or through staff for what its standards allow" },
    { c: "zbr", role: "Hears appeals of the Commission's decisions" },
  ],
  objections: ["design"],
  docs: [
    {
      title: "Which work needs a certificate", src: "pzo", pin: "§ 1911.D", q: "All construction, alteration, repair, removal, or demolition of any existing structure or its appurtenances",
      checklist: ["Find the district on the City's zoning map (Historic Overlay District)", "Ask staff whether the work can be approved without a hearing", "Read the Commission's standards and guidelines for the district"],
    },
    {
      title: "Staff may approve, not deny", src: "pzo", pin: "§ 1911.C.1", q: "The staff may not deny a certificate of appropriateness, but shall refer such action to the Historic District",
      checklist: ["If staff will not approve, expect a hearing before the Commission"],
    },
    {
      title: "Appeal to the Zoning Board of Review", src: "pzo", pin: "§ 1703.C", q: "To make final decisions on appeals from the Historic District Commission",
      checklist: ["Note the date of the Commission's decision"],
    },
  ],
};

/** Formal development plan review by the Downtown Design Review Committee, or by the I-195 Commission on its parcels (cond "ddrc"). */
export const designReviewStep: Step = {
  id: "ddrc", title: "Formal development plan review (downtown design review)", cond: "ddrc", app: "Development plan review application, with the plan set the Committee asks for",
  clock: { text: "Not read: the Committee's procedure is in the development review regulations" },
  what: "In the Downcity Overlay and the East Side I-195 Overlay, the Downtown Design Review Committee approves the design of new construction and major alterations, and can waive design regulations. On the I-195 Redevelopment District's parcels the I-195 Commission sits in its place. This review replaces land development review by the City Plan Commission.",
  auth: [
    { c: "trc", role: "Decides the plan and any waivers of the design regulations", cond: "!i195" },
    { c: "i195", role: "Sits as the Downtown Design Review Committee for its parcels, and decides waivers there", cond: "i195" },
    { c: "planning", role: "Takes the application, unless the site is an I-195 parcel" },
  ],
  objections: ["design", "parking"],
  docs: [
    {
      title: "Not a land development project", src: "pzo", pin: "§ 1904.C.2.b", q: "Any development subject to review by the Downtown Design Review Committee or the I-195",
      checklist: ["Confirm with staff which body reviews the site", "Expect no master, preliminary and final stages before the City Plan Commission"],
    },
    {
      title: "What the Committee reviews", src: "pzo", pin: "§ 1907.C.1", q: "New construction of buildings or appurtenances in the DD Overlay District.",
      checklist: ["Major alterations and additions, demolition and moving a building are reviewed too", "Outside the Downcity Overlay but in D-1, staff review instead (§ 1907.C.2)"],
    },
    {
      title: "Waivers of the design regulations", src: "pzo", pin: "§ 1907.C.1.e", q: "The Downtown Design Review Committee may waive design regulations as authorized by Article 6",
      checklist: ["List each regulation you ask to waive, with the reason"],
    },
    {
      title: "On an I-195 parcel", cond: "i195", src: "pzo", pin: "§ 1716", q: "Redevelopment District, the I-195 Redevelopment District Commission shall serve as the Downtown Design",
      checklist: ["File with the I-195 Redevelopment District Commission's staff", "Read the Commission's development plan for the parcel"],
    },
  ],
};
