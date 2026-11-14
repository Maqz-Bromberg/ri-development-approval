import type { AtlasDistrict, Finding, ProjectInputs, StepPlan, TreeId } from "../../../types";

/*
 * Providence's findings for a site, and its own durations for the steps it changes.
 * Trial reading, 2026-11-13. Dimensional figures still come from the Zoning Atlas (September 2024),
 * because the Zoning Ordinance itself was not read. Where the ordinance is quoted, the quote comes
 * from a court decision that reproduces it, and the pinpoint says so.
 * Keep `src`, `pin` and `q` on one line for scripts/towns/verify_quotes.py.
 */

/** Districts where the ordinance exempts small lots from parking, per the court's reading of § 1410(B)(7). */
const SMALL_LOT_EXEMPT = new Set(["R-4", "C-1", "C-2"]);

export function providenceFindings(i: ProjectInputs, tree: TreeId, generic: Finding[], d: AtlasDistrict | undefined): Finding[] {
  const out: Finding[] = [];
  const commercial = i.commercial ?? 0;

  if (i.units >= 10) {
    out.push({
      st: "info",
      t: commercial > 2500
        ? `Major land development project: ${i.units} units with more than 2,500 sq ft of commercial space`
        : `Minor land development project: ${i.units} units with ${commercial > 0 ? "no more than 2,500 sq ft of" : "no"} commercial space`,
      p: "In Providence the commercial floor area, not the unit count, separates minor from major. A residential building of any size is a minor project.",
      src: "pregs", pin: "Art. 2, Minor land development project (B)(3)", q: "units and between 0 and 2,500 gross square feet of commercial space",
    });
  } else {
    out.push({
      st: "flag", t: `${i.units} units: not a land development project in Providence`,
      p: "Review by the City Plan Commission starts at 10 units, 10,000 sq ft of new floor area or 50 new parking spaces. Below that, development plan review under Article 19 of the Zoning Ordinance may still apply. That article was not read, so ask planning staff.",
      src: "pregs", pin: "Art. 2, Land development project (A)(3)", q: "Construction of new gross floor area that creates 10 or more dwelling or rooming",
    });
  }
  if (tree === "comp") {
    out.push({ st: "flag", t: "Comprehensive permit: Providence's own procedure was not read", p: "The steps shown for this route are state law only. Ask planning staff how the City Plan Commission handles a comprehensive permit application." });
  }

  generic.slice(1).forEach((g) => {
    if (g.t.startsWith("Parking:") && !i.transit) {
      const perUnit = parseFloat(d?.family4_minparking_2br ?? "1") || 1;
      if (SMALL_LOT_EXEMPT.has(i.zone) && i.lot > 0 && i.lot <= 10000) {
        out.push({
          st: "pass", t: `Parking: none required on a lot of 10,000 sq ft or less in ${i.zone}`,
          p: "128 Wayland Avenue, on 4,500 sq ft, provides no vehicle parking. Expect the question anyway: at 269 Wickenden Street neighbours challenged a lot split that brought the site down to 10,000 sq ft.",
          src: "pc241374", pin: "Part III.B, citing Zoning Ordinance § 1410(B)(7)", q: "exempting lots of 10,000 square feet or less from parking requirements in the R-4, C-1, and C-2 districts",
        });
      } else if (perUnit === 1) {
        out.push({
          st: "info", t: `Parking: ${i.units} spaces required (1 per unit)`,
          p: "The Commission can cut the requirement by up to half as a dimensional adjustment. It did so at 27 East River Street, after asking the applicant to look for ways to reach one space per unit.",
          src: "pc241374", pin: "Part III.B, citing Zoning Ordinance Table 14-1", q: "one parking space for each dwelling unit",
        });
      } else {
        out.push({ ...g, p: "From the Zoning Atlas. Check the current ordinance, and ask whether a parking adjustment is available." });
      }
      return;
    }
    if (g.t.startsWith("Height limit") && d?.family4_maxheightft) {
      const c2 = i.zone === "C-2";
      out.push({
        st: "info", t: `Height limit: ${d.family4_maxheightft} ft${c2 ? ", not to exceed 4 stories" : ""}`,
        p: "The Commission can grant more height as a dimensional adjustment. 128 Wayland Avenue and 150 Pitman Street each got a fifth story in C-2, and 27 East River Street got 90 ft where 75 ft is allowed. Word the request exactly: one approval was vacated in court over height in feet against height in stories.",
        ...(c2
          ? { src: "pc241374", pin: "Part III.A.1, citing Zoning Ordinance Table 5-1", q: "50’, not to exceed 4 stories" }
          : { src: "rizaLayer", pin: `${i.zone} · family4_maxheightft` }),
      });
      return;
    }
    if (g.t.startsWith("State permits triggered")) {
      out.push({
        st: "flag", t: g.t,
        p: "Providence asks for state and federal permits before the final plan is approved, not before the preliminary plan, and the Commission writes this into its conditions.",
        src: "pregs", pin: "§ 504.A.6", q: "Prior to approval of the final plan, an applicant must submit all permits required by",
      });
      return;
    }
    out.push(g);
  });

  if (i.zone === "W-2") {
    out.push({
      st: "flag", t: "Waterfront district: expect coastal review",
      p: "At 27 East River Street the Coastal Resources Management Council required public access to the water, a stormwater plan and soil testing. Its approval is filed with the final plan.",
      src: "psr27er2512", pin: "Environmental Impact", q: "The project falls under the purview of the CRMC as it is located within the coastal zone.",
    });
  }
  if (i.units >= 10) {
    out.push({
      st: "info", t: "No demolition or site work until the final plan is approved",
      p: "This covers demolition, foundation and building permits, so the carrying cost of the site runs through the whole review.",
      src: "pformminor", pin: "Demolition and site work prior to approval, citing Zoning Ordinance § 1904.B", q: "no demolition, foundation, or building permits will be issued, and no site work will be allowed",
    });
  }
  out.push({
    st: "flag", t: "Dimensional rules here come from the Zoning Atlas, not the ordinance",
    p: "The Atlas is as of September 2024 and Providence amended its ordinance in 2025 and 2026. The ordinance text was not read for this trial, so check setbacks, coverage, height and parking against the current ordinance before you fix the design.",
    src: "pzo", pin: "Official copy, July 22, 2026",
  });
  return out;
}

/*
 * Durations and key moments where Providence differs from the shared schedule: no committee meeting,
 * the City Plan Commission's own names, and one filing deadline about four weeks before each meeting.
 * Clocks are from the regulations (Arts. 4 and 5). Keys are "tree:step".
 */
const preapp = (wait: string): StepPlan => ({
  est: 21,
  ticks: [
    { d: 0, label: "Ask Commission staff for a pre-application meeting, and write to the ward councillor", kind: "file", docs: "all" },
    { d: 21, label: `Meeting held (estimate). ${wait}`, kind: "milestone" },
  ],
});
const rezone: StepPlan = {
  est: 150,
  ticks: [
    { d: 0, label: "File the zone change petition with the City Council", kind: "file", docs: "all" },
    { d: 45, label: "City Plan Commission advisory recommendation", kind: "hearing", cal: "pb", docs: ["Bring the building, not only the map change"] },
    { d: 150, label: "City Council vote (estimate)", kind: "milestone", note: "Legislative decision. No statutory deadline. The Council's committee steps were not read." },
  ],
};

export const PROVIDENCE_SCHEDULE: Record<string, StepPlan> = {
  "minor:preapp": preapp("Not required."),
  "major:preapp": preapp("With no meeting set within 60 days of asking, you may file."),
  "minor:rezone": rezone,
  "major:rezone": rezone,
  "minor:prelim": {
    est: 80, statutory: true,
    ticks: [
      { d: 0, label: "File the complete preliminary plan", kind: "file", docs: "all" },
      { d: 15, label: "Completeness certified (25 days when a hearing is needed)", kind: "deadline" },
      { d: 30, label: "Newspaper and mailed notice, if a public hearing is needed", kind: "file", cal: "notice", docs: ["Public hearing notice, placed and paid for by you", "Unified development review form, notice list and affidavit"] },
      { d: 44, label: "City Plan Commission meeting, when the Commission decides", kind: "hearing", cal: "pb", note: "Staff decide instead when no adjustment, waiver or relief is requested.", docs: ["Request for an adjustment or design waiver", "Traffic study, if asked", "Renderings from the street"] },
      { d: 80, label: "Decision deadline (95 days after certification with a hearing)", kind: "deadline", docs: ["Decision deadline"] },
    ],
  },
  "major:master": {
    est: 115, statutory: true,
    ticks: [
      { d: 0, label: "File the complete master plan application", kind: "file", docs: "all" },
      { d: 25, label: "Completeness certified (latest)", kind: "deadline" },
      { d: 40, label: "Newspaper and mailed hearing notice (14 days before)", kind: "file", cal: "notice", docs: ["Public hearing"] },
      { d: 54, label: "City Plan Commission public hearing", kind: "hearing", cal: "pb", note: "Bring answers to the common questions for this step." },
      { d: 115, label: "Decision deadline. Silence counts as approval.", kind: "deadline", docs: ["Decision deadline", "Vesting"] },
    ],
  },
  "major:state": {
    est: 180, with: "master",
    ticks: [
      { d: 0, label: "Start state permits, the stormwater plan and the traffic study", kind: "file", docs: "all" },
      { d: 180, label: "State permits in hand (estimate). Due before final approval.", kind: "milestone", docs: ["Permits due before final approval"] },
    ],
  },
  "major:prelim": {
    est: 115, statutory: true,
    ticks: [
      { d: 0, label: "File the complete preliminary plan", kind: "file", docs: "all" },
      { d: 25, label: "Completeness certified (latest)", kind: "deadline" },
      { d: 40, label: "Mail abutter notice (14 days before)", kind: "file", cal: "notice", docs: ["Abutter notice"] },
      { d: 54, label: "City Plan Commission meeting", kind: "hearing", cal: "pb", docs: ["Answers to what the Commission asked at the hearing"] },
      { d: 115, label: "Decision deadline", kind: "deadline", docs: ["Decision deadline"] },
    ],
  },
};
