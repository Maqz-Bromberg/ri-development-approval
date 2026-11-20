import type { Step } from "../../types";
import { COMP_APPEAL_DOC, compRoute } from "./compPermit";

/*
 * The comprehensive permit route in four small towns (ARD D65), from each town's own text, read 2026-11-19:
 *   Exeter       Zoning Ordinance § 1.4(4)(D) (`exzo`)
 *   Hopkinton    Zoning Ordinance Section 38, adopted December 4, 2023 (`hozo`)
 *   Richmond     Chapter 18.39, amended May 21, 2024 (`rizo39`)
 *   West Greenwich  Land Development and Subdivision Regulations § 450-22 (`wgsr`)
 * Exeter, Hopkinton and Richmond follow the state's process since 2023: a pre-application conference, a preliminary
 * plan decided within 90 days of certification, an administrative final plan, and appeals to the Superior Court.
 * West Greenwich's regulations do not: they keep a master plan stage for a major project, decided within 120 days, and
 * send the applicant's appeal to the State Housing Appeals Board, which § 45-53-5.1 replaced from January 1, 2024. Both
 * are kept and named (D13), and the town's practice follows its regulations: its 2025-26 cases had master plans.
 */

const PREAPP_WHY = "A short written description is enough: the number and type of homes, a density analysis, the adjustments you expect to need, a location map and a concept plan. If the town has not held it within 30 days, you may file the preliminary plan.";

const EXETER: Step[] = compRoute({
  preapp: {
    what: `Required in Exeter: you ask the Planning Board for a pre-application conference. ${PREAPP_WHY}`,
    doc: { title: "Pre-application conference with the Planning Board", src: "exzo", pin: "§ 1.4(4)(D)(3)(b)", q: "The applicant shall request a preapplication conference with the planning board.", checklist: ["Fill in the pre-application form", "Describe the homes, the density and the adjustments you expect", "Attach a location map and a concept plan"] },
  },
  elig: [{
    title: "Exeter: half the affordable homes at 80% of median income", src: "exzo", pin: "§ 1.4(4)(D)(3)",
    q: "at least 50 percent of the units of those units are restricted to households with an income at or below 80 percent of the area median income",
    checklist: ["At least a quarter of the homes affordable, as the state asks", "Of those, at least half for households at or below 80% of area median income"],
  }],
  prelim: {
    clock: { days: 115, text: "25 days to certify · 90 days to decide" },
    what: "The Planning Board, as local review board, decides the whole application after a public hearing, with a stenographer, within 90 days of certification, or it is approved by default. Exeter's ordinance sets the density it must allow: at least three homes an acre at 25% affordable without public sewer, if RIDEM will approve the septic systems and water is shown to be adequate.",
    docs: [
      { title: "Decision within 90 days, or approved", src: "exzo", pin: "§ 1.4(4)(D)(5)(a)", q: "The planning board shall approve or deny the application within 90 days of the day the preliminary plan submission was certified as complete", checklist: ["Note the certification date and day 90", "Give any extension only in writing"] },
      { title: "Mandatory density", src: "exzo", pin: "§ 1.4(4)(D)(4)(a)", q: "the minimum residential density is three dwelling units per acre", checklist: ["Show RIDEM will approve the septic systems", "Show town water, or wells adequate for the homes", "Higher shares of affordable homes raise the minimum density"] },
    ],
  },
  final: {
    clock: { days: 45, text: "Administrative" },
    what: "Administrative, unless the Board waived items at the preliminary stage, the plan does not meet the preliminary conditions, or you propose a major change, which needs a public hearing.",
    docs: [{ title: "Final plan by the administrative officer", src: "exzo", pin: "§ 1.4(4)(D)(6)(a)", q: "Final plan approval is administrative", checklist: ["Bring every state and federal permit, unless the officer allows them before the first building permit", "A draft monitoring agreement and the deed restriction"] }],
  },
  appeal: {
    what: "You, or anyone aggrieved, may appeal the Planning Board's decision to the Washington County Superior Court within 20 days of its recording. On a remand the Board hears the application again within 30 days.",
    docs: [{ title: "Exeter's appeal rule", src: "exzo", pin: "§ 1.4(4)(D)(7)", q: "may appeal to the Washington County Superior Court within 20 days of the date the board's written decision was recorded in the land evidence records", checklist: ["Calendar 20 days from the recording"] }, COMP_APPEAL_DOC],
  },
});

const HOPKINTON: Step[] = compRoute({
  preapp: {
    what: `Required in Hopkinton: you ask the Planning Board for a pre-application conference. ${PREAPP_WHY}`,
    doc: { title: "Pre-application conference with the Planning Board", src: "hozo", pin: "Section 38(E)(1)", q: "The applicant shall request a pre-application conference with the planning board.", checklist: ["Fill in the pre-application form", "Describe the homes, the density and the adjustments you expect", "Attach a location map and a concept plan"] },
  },
  prelim: {
    clock: { days: 115, text: "25 days to certify · 90 days to decide" },
    what: "The Planning Board, as local review board, decides the whole application after a public hearing within 90 days of certification, or it is approved by default. A preliminary approval lasts two years, and you may ask the Board in person for two one-year extensions; the rules in force at approval are vested until it expires.",
    docs: [
      { title: "Decision within 90 days, or approved", src: "hozo", pin: "Section 38(G)(1)", q: "The planning board must approve or deny the application within ninety (90) days of the day the preliminary plan submission was certified as complete", checklist: ["Note the certification date and day 90", "Give any extension only in writing"] },
      { title: "Two years, and two extensions", src: "hozo", pin: "Section 38(G)(6)", q: "The approved preliminary plan expires two (2) years after the date of approval.", checklist: ["Ask for an extension in writing before it expires", "Brushy Brook asked for and got one in September 2025"] },
    ],
  },
  final: {
    clock: { days: 45, text: "Administrative, unless the Board asks to see it" },
    what: "Usually administrative. Brushy Brook's final plan went back to the Board, which approved it 5 to 0 in December 2025 after several meetings.",
    docs: [{ title: "Final plan submission", src: "hozo", pin: "Section 38(J)(1)", q: "The applicant shall submit the following material for final plan approval", checklist: ["Every state and federal permit, unless the officer allows them before the first building permit", "A draft monitoring agreement and the deed restriction"] }],
  },
  appeal: {
    what: "You, or anyone aggrieved, may appeal to the Washington County Superior Court within 20 days of the decision's recording. Brushy Brook's preliminary approval drew two appeals from residents.",
    docs: [{ title: "Hopkinton's appeal rule", src: "hozo", pin: "Section 38(L)(1)", q: "may appeal to the Washington County Superior Court pursuant to R.I.G.L. § 45-53-5.1 within twenty (20) days", checklist: ["Calendar 20 days from the recording"] }, COMP_APPEAL_DOC],
  },
});

const RICHMOND: Step[] = compRoute({
  preapp: {
    what: `Required in Richmond: a pre-application conference with the Planning Board, the Technical Review Committee or the administrative officer; the Planning Board is strongly encouraged. ${PREAPP_WHY}`,
    doc: { title: "Pre-application conference", src: "rizo39", pin: "§ 18.39.060", q: "The applicant shall be required to complete a pre-application conference with the local review board", checklist: ["Fill in the pre-application form", "Describe the homes, the density and the adjustments you expect", "Attach a location map and a concept plan"] },
  },
  prelim: {
    clock: { days: 115, text: "25 days to certify · 90 days to decide" },
    what: "The Planning Board, as local review board, decides after a public hearing, with a stenographer, within 90 days of certification, or it is approved by default. Its decision must name each incentive and adjustment granted. A preliminary approval lasts two years, with two one-year extensions asked for in person.",
    docs: [
      { title: "Decision within 90 days, or approved", src: "rizo39", pin: "§ 18.39.080 A", q: "The planning board must approve or deny the application within 90 days of the day the preliminary plan submission was certified as complete", checklist: ["Note the certification date and day 90", "Give any extension only in writing"] },
      { title: "Two years, and two extensions", src: "rizo39", pin: "§ 18.39.080 F", q: "The approved preliminary plan expires 2 years after the date of approval.", checklist: ["Ask for each extension in writing, and attend"] },
    ],
  },
  final: {
    clock: { days: 70, text: "25 days to certify · 45 days to approve" },
    what: "The administrative officer approves the final plan within 45 days of certifying it complete, unless it has to go back to the Planning Board: waived items, unmet conditions, missing material or a major change.",
    docs: [{ title: "Final plan by the administrative officer", src: "rizo39", pin: "§ 18.39.110 C", q: "The administrative officer shall approve the final plan within 45 days of the date it was certified as complete", checklist: ["Every state and federal permit, unless the officer allows them before the first building permit", "A monitoring agreement, the deed restriction, and guarantees for the public improvements"] }],
  },
  appeal: {
    what: "You, or anyone aggrieved, may appeal to the Washington County Superior Court within 20 days of the decision's recording.",
    docs: [{ title: "Richmond's appeal rule", src: "rizo39", pin: "§ 18.39.120 A", q: "may appeal to the Washington County Superior Court within twenty (20) days of the date the board’s written decision was recorded", checklist: ["Calendar 20 days from the recording"] }, COMP_APPEAL_DOC],
  },
});

/** West Greenwich's master plan, for a major project (more than nine homes). The state's process since 2023 has none. */
const WG_MASTER: Step = {
  id: "master", title: "Master plan (a major project)", cond: "major",
  app: "Master plan checklist, the eligibility letter, the list of adjustments, a timetable, a pro forma and the deed restriction",
  clock: { days: 150, text: "30 days to certify · 120 days to decide" },
  what: "West Greenwich's regulations send a major comprehensive permit through a master plan first, decided by the Planning Board within 120 days of certification after a public hearing, or approved by default. The state's process since 2023 has a pre-application conference, a preliminary plan and a final plan, and no master plan; the town's practice follows its regulations (Raccoon Hill and Bella View both had master plans in 2025 and 2026). Bella View's master plan was denied for want of evidence of water, so bring it at this stage.",
  auth: [{ c: "pb", role: "Local review board. Decides the master plan and any adjustments." }],
  objections: ["utilities", "traffic", "stormwater"],
  docs: [
    { title: "Master plan for a major project", src: "wgsr", pin: "§ 450-22 B(3)(d)", q: "An application involving a major land development or major subdivision shall include those items on the checklist for a master plan submission.", checklist: ["Use the master plan checklist of the subdivision regulations", "Show proof of application for every state and federal permit"] },
    { title: "Decision within 120 days, or approved", src: "wgsr", pin: "§ 450-22 C(3)(c)", q: "the local review board shall render a decision within 120 days of issuance of the certification of completeness", checklist: ["Note the certification date and day 120"] },
    { title: "Water, if there is no public water", src: "s5304", pin: "§ 45-53-4", q: "provide competent evidence as to the availability of water to service the development", checklist: ["Locate every proposed well and septic system on the plan", "Bring a hydrogeologist's evidence of water, with neighbours' wells in view"] },
    { title: "Not in the state's process", note: "The statute lists a pre-application conference, preliminary plan review and final plan review. Ask the administrative officer which the town will apply.", checklist: ["Ask in writing whether a master plan is required"] },
  ],
};

const WEST_GREENWICH: Step[] = compRoute({
  preapp: {
    what: `Required in West Greenwich for a major project, before the Planning Board or the Technical Review Committee; encouraged for any other. ${PREAPP_WHY}`,
    doc: { title: "Pre-application conference", src: "wgsr", pin: "§ 450-22 B(5)(a)", q: "Where the comprehensive permit application includes a major land development project or a major subdivision, an applicant shall schedule with the administrative officer a pre-application conference", checklist: ["Describe the homes, the subsidy and the present and proposed use", "Attach a location map and a concept plan"] },
  },
  master: WG_MASTER,
  prelim: {
    clock: { days: 120, text: "25 days to certify · 95 days to decide" },
    cond: "!major",
    what: "For a minor project (nine homes or fewer), the Planning Board reviews the preliminary plan after a public hearing, with a stenographer, and decides within 95 days of certification, or it is approved by default. The affordable homes must be built and occupied before or with the market-rate ones.",
    docs: [
      { title: "Decision within 95 days, or approved", src: "wgsr", pin: "§ 450-22 C(3)(b)", q: "the local review board shall render a decision within 95 days of issuance of the certificate of completeness", checklist: ["Note the certification date and day 95"] },
      { title: "Affordable homes first, or alongside", src: "wgsr", pin: "§ 450-22 F", q: "Low- and moderate-income housing units shall be built and occupied prior to or simultaneous with the construction and occupancy of market-rate units", checklist: ["Phase the affordable homes no later than the market-rate ones"] },
    ],
  },
  prelimAlt: {
    id: "prelim-major", title: "Preliminary plan (a major project)", cond: "major",
    app: "Preliminary plan checklist of the subdivision regulations, with proof of application for state and federal permits",
    clock: { days: 135, text: "45 days to certify · 90 days to decide (state law for a major project)" },
    what: "After the master plan, a major project's preliminary plan follows the subdivision regulations, which are not read here; state law gives a major preliminary plan 90 days from certification. The Planning Board may still attach conditions. The VUE's preliminary plan was approved 4 to 0, with final approval left to staff.",
    auth: [{ c: "pb", role: "Local review board. Decides the preliminary plan." }],
    objections: ["traffic", "stormwater"],
    docs: [
      { title: "Certified within 45 days", src: "wgsr", pin: "§ 450-22 B(4)(c)", q: "the application for master plan shall be certified complete or incomplete by the administrative officer within 30 days and for a preliminary plan within 45 days", checklist: ["Expect 45 days for certification, not 25"] },
      { title: "Affordable homes first, or alongside", src: "wgsr", pin: "§ 450-22 F", q: "Low- and moderate-income housing units shall be built and occupied prior to or simultaneous with the construction and occupancy of market-rate units", checklist: ["Phase the affordable homes no later than the market-rate ones"] },
    ],
  },
  final: {
    clock: { days: 45, text: "Under the subdivision regulations" },
    what: "Under the subdivision regulations, which are not read here; every state and federal permit is due before the final plan is approved. The Board has let staff approve final plans (The VUE, January 2026).",
    docs: [{ title: "State and federal permits before final approval", src: "wgsr", pin: "§ 450-22 B(3)(d)", q: "All required state and federal permits must be obtained prior to the final plan approval.", checklist: ["Copies of every permit", "A draft monitoring agreement and the deed restriction"] }],
  },
  appeal: {
    what: "Since January 1, 2024, you or anyone aggrieved may appeal to the Superior Court within 20 days of the decision's recording (§ 45-53-5.1). West Greenwich's regulations still send the applicant's appeal to the State Housing Appeals Board, which that section replaced; ask the town which it applies, and file in court to be safe.",
    docs: [COMP_APPEAL_DOC, { title: "The town's regulations: an older route", src: "wgsr", pin: "§ 450-22 E", q: "may be appealed by the applicant to the State Housing Appeals Board", checklist: ["Do not rely on the Housing Appeals Board alone"] }],
  },
});

/** The comprehensive permit steps, by town. */
/** How well the comprehensive permit route is sourced in the towns above (ARD D65). */
export const COMP_STATUS = { comp: "From the town's own procedure, read 2026-11-19" };

export const COMP_STEPS: Record<string, Step[]> = { Exeter: EXETER, Hopkinton: HOPKINTON, Richmond: RICHMOND, "West Greenwich": WEST_GREENWICH };
