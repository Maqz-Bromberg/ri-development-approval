import type { Step, TownRules, TreeId } from "../../../types";

/*
 * Providence's own steps, laid over the state-law route. Trial reading, 2026-11-13, not confirmed by the city.
 *
 * Read from: the Land Development and Subdivision Review Regulations amended through Dec 16, 2025 (`pregs`),
 * the City Plan Commission's Minor Land Development Project form (`pformminor`), Commission minutes and agendas,
 * and one Superior Court decision that reproduces parts of the Zoning Ordinance (`pc241374`).
 * The Zoning Ordinance itself was NOT read (see docs/providence-trial-review.html).
 *
 * Every `q` is checked word for word by scripts/towns/verify_quotes.py. Keep `src`, `pin` and `q` on one line:
 * the script pairs each quote with the source named before it on the same line.
 *
 * A step listed here replaces the same step of the state-law route for the same tree. Steps not listed
 * (building, occupancy, the comprehensive permit route) stay as the state-law version with no local documents.
 */

const zoning: Step = {
  id: "zoning", title: "Zoning and site check", app: "Site data package: plat and lot, zoning district and overlays, lot area, constraints",
  clock: { text: "Before filing" },
  what: "Confirm the district and any overlay on the City's zoning map, then work out which review the project gets. Providence draws the lines its own way: a project is a land development project at 10 dwelling units or 10,000 sq ft of new floor area, and the amount of commercial floor area decides whether it is minor or major. The unit count alone does not.",
  authLabel: "Rules set by",
  auth: [
    { c: "council", role: "Adopts the Zoning Ordinance, the zoning map and the Comprehensive Plan" },
    { c: "pb", role: "Adopts the Land Development and Subdivision Review Regulations" },
    { c: "ga", role: "Sets the enabling acts, and lets a city raise the minor thresholds" },
  ],
  docs: [
    {
      title: "Zoning district and overlays", src: "pregs", pin: "App. C, item 5", q: "Zoning district(s) and overlay district(s) of the parcel(s) being developed; if more than one district, zoning boundary lines must be shown on the plan",
      note: "The Zoning Ordinance and the official map are linked from the City's zoning page. The ordinance text was not read for this trial.",
      checklist: [
        "Find the parcel on the City's zoning map and save a dated copy",
        "Check for a historic district, the East Side overlay or the downtown district, each of which adds its own review",
        "Check whether the lot is split between two districts",
        "Look at recent City Plan Commission agendas for rezoning referrals near the site",
      ],
    },
    {
      title: "Is it a land development project?", src: "pregs", pin: "Art. 2, Land development project (A)(3)", q: "Construction of new gross floor area that creates 10 or more dwelling or rooming",
      note: "The other triggers are 10,000 sq ft of new floor area and 50 new parking spaces.",
      checklist: [
        "Count the dwelling units created by new floor area",
        "Add up new gross floor area against the 10,000 sq ft line",
        "Count new parking spaces against the line of 50",
        "Below all three, ask staff whether development plan review under Article 19 of the Zoning Ordinance applies. That article was not read here.",
      ],
    },
    {
      title: "Minor or major", src: "pregs", pin: "Art. 2, Minor land development project (B)(3)", q: "units and between 0 and 2,500 gross square feet of commercial space",
      note: "A residential building of any size with up to 2,500 sq ft of commercial space is minor. 27 East River Street, 355 units and no commercial space, was reviewed as a minor project.",
      checklist: [
        "Measure the commercial gross floor area on the ground floor plan",
        "Above 2,500 sq ft with 10 or more units, plan for the three-stage major review",
        "At or below it, plan for the two-stage minor review",
      ],
    },
    {
      title: "One review, not two", src: "pregs", pin: "§ 1002.A", q: "An applicant shall not be required to obtain both land development and development plan review for the same project.",
      checklist: [
        "Ask the administrative officer to confirm the category in writing before you draw the full plan set",
      ],
    },
    {
      title: "Adjustments the Commission can grant", src: "pc241374", pin: "footnote 1, quoting Zoning Ordinance § 1904(E)(1)", q: "The City Plan Commission has the authority to make adjustments to certain dimensional and design standards through land development project review",
      note: "Quoted from a court decision that reproduces the ordinance. Section 1904 was amended in 2025 and 2026 (Commission referrals 3594 and 3605), so confirm the current list of grounds and limits.",
      checklist: [
        "Decide whether you will ask for more height or less parking than the district allows",
        "Name the ground that makes the project eligible, such as structured parking or open space set aside for public use",
        "Expect the Commission, not staff, to decide once an adjustment is requested",
      ],
    },
    {
      title: "Parcel geometry from statewide GIS", note: "Statewide assessor parcel polygons. Lot areas in this layer can differ from the surveyed figure.", src: "rigis", pin: "Tax_Parcels map service",
      checklist: [
        "Match the Assessor's Plat and Lot to the deed",
        "Use the surveyed lot area. For 27 East River Street the state layer gives about 2.3 acres and the staff report about 88,000 sq ft.",
        "Check flood zones, and whether the site is in the coastal zone along the Seekonk or Providence River",
      ],
    },
    {
      title: "Parking cap near transit", cond: "transit", note: "Applies within ¼ mile of a regional mobility hub or ⅛ mile of a frequent transit stop.",
      src: "ridsp", pin: "S 3303 / H 8005 Sub A (2026)", q: "no more than one off-street parking space per dwelling unit in a multi-family structure or development can be required",
      checklist: [
        "Measure the distance to the nearest frequent transit stop or mobility hub",
        "Cite the 2026 law in your parking calculation",
      ],
    },
  ],
};

const rezone: Step = {
  id: "rezone", title: "Zone change petition", cond: "rezone", branch: true,
  app: "Petition to the City Council to amend the zoning map, with the project it is meant for",
  clock: { text: "No statutory deadline. This is a legislative decision." },
  what: "The City Council decides a zone change after the City Plan Commission gives an advisory recommendation. Where a project needs both a zone change and plan approval, the regulations set the order: the Commission's recommendation and a conditional first-stage approval, then the Council, then back for the remaining stages.",
  auth: [
    { c: "council", role: "Decides the zone change" },
    { c: "pb", role: "Gives the Council an advisory recommendation, at a public meeting" },
  ],
  objections: ["character", "traffic", "parking", "renters", "values"],
  docs: [
    {
      title: "Order of approvals when a zone change is involved", src: "pregs", pin: "§ 1009.C", q: "the applicant shall first obtain an advisory recommendation on the zoning change from the City Plan",
      checklist: [
        "File the petition with the City Council so it is referred to the Commission",
        "Ask staff whether the first-stage plan can be heard at the same meeting as the referral",
        "Plan the return to the Commission after the Council votes",
      ],
    },
    {
      title: "Bring the building, not only the map change", src: "pmin240416", pin: "Item 5, Referral 3575 (176 Gano Street and 38 Amy Street)", q: "recommend that the City Council approve the zone change to R-4 based on their findings",
      note: "In April 2024 a petitioner asking for R-3 to R-4 on Gano Street presented the intended building with an architect, and the Commission's positive recommendation carried a condition written onto the map.",
      checklist: [
        "Show the building the new district is meant to allow",
        "Explain how it relates to the buildings around it",
        "Expect conditions on the recommendation, and decide in advance which you can accept",
      ],
    },
  ],
};

const preapp = (major: boolean): Step => ({
  id: "preapp", title: major ? "Pre-application meeting" : "Pre-application meeting (encouraged)", app: "Concept plan and questions for staff",
  clock: { text: major ? "On request. With no meeting set within 60 days, you may file." : "On request" },
  what: "Providence holds pre-application meetings at the applicant's request, and the application form strongly encourages one. Staff explain which review applies and what relief the plan would need. You can also ask the City Plan Commission for an informal concept review. The form tells applicants to inform the ward's City Councillor.",
  auth: [
    { c: "planning", role: "Holds the meeting and advises which category of approval applies" },
    { c: "pb", role: "Optional informal concept review" },
    { c: "council", role: "The ward councillor is told about the project", cond: "always" },
  ],
  docs: [
    {
      title: "Pre-application request", src: "pregs", pin: "§ 1001.A", q: "One or more pre-application meetings may be held for all land development, subdivision, and development plan review applications at the request of the applicant.",
      checklist: [
        "Send concept materials ahead of the meeting. They do not start any review clock.",
        "List the adjustments, waivers or variances you think the plan needs",
        "Ask which stages can be combined",
      ],
    },
    {
      title: "Book the meeting with Commission staff", src: "pformminor", pin: "Procedure, step 1", q: "A pre-application meeting is strongly encouraged prior to preliminary plan submission.",
      checklist: [
        "Contact the principal planner named on the form",
        "Check the filing deadline for the Commission meeting you are aiming at, about four weeks before it",
      ],
    },
    {
      title: "Tell the ward councillor and neighbourhood groups", src: "pformminor", pin: "Public Engagement", q: "The applicant shall contact the City Councilor in whose ward the project is located to inform them of the development.",
      note: "At 27 East River Street the Commission made documented community outreach a condition after a councillor and residents said none had taken place.",
      checklist: [
        "Write to the councillor before filing and keep the letter",
        "Meet the neighbourhood association and nearby conservancy or merchants' groups",
        "Keep a dated record of who you met and what changed as a result",
      ],
    },
    {
      title: "Informal concept review", src: "pregs", pin: "§ 1001.B", q: "the applicant may request the City Plan Commission or the Technical Review Committee for an informal concept plan review for a development",
      checklist: [
        "Decide whether early Commission comment on height, massing or parking is worth a meeting cycle",
      ],
    },
  ],
});

const minorPrelim: Step = {
  id: "prelim", title: "Preliminary plan", app: "Minor Land Development Project application, fee, plan set and checklist items 1 to 24",
  clock: { days: 80, text: "15 days to certify · 65 days to decide (25 and 95 with a public hearing)" },
  what: "With no relief asked for, the administrative officer can decide the plan without a hearing. The City Plan Commission decides instead when you ask for a dimensional adjustment or a design waiver, and it holds a public hearing when the plan needs a variance or special use permit under unified development review, or creates a street. Most of the recent projects in Fox Point and Wayland went to the Commission, because they asked for more height or less parking.",
  auth: [
    { c: "pb", role: "Decides when an adjustment, waiver, variance or special use permit is requested" },
    { c: "planning", role: "Certifies completeness. Decides the plan when no relief is requested." },
    { c: "dpw", role: "City Engineer and Traffic Engineer review drainage and the traffic study" },
  ],
  objections: ["parking", "traffic", "character", "variances", "stormwater", "trees", "privacy", "construction", "lighting"],
  docs: [
    {
      title: "Application, owner's consent and copies", src: "pregs", pin: "App. C, item 2", q: "A notarized letter stating that the property owner(s) have granted their permission and consent for applicant to proceed with the application.",
      checklist: [
        "Complete the application, signed by every owner",
        "Add the notarized owner's letter if the applicant is not the owner",
        "Four paper copies of the survey and plan set, or ten if the Commission will review it",
      ],
    },
    {
      title: "Fees", src: "pregs", pin: "§ 905.A", q: "Minor Subdivision or Minor Land Development Project: $200",
      note: "Unified development review adds $400 at each stage. Notice and a stenographer are at your cost.",
      checklist: [
        "Pay the application fee with the submission",
        "Budget for the newspaper advertisement and mailed notice if a hearing is needed",
        "Budget for the stenographer if relief is requested",
      ],
    },
    {
      title: "Class I survey with a zoning table", src: "pregs", pin: "App. C, item 5", q: "Table listing dimensional requirements of the subject zone(s) in one column and indication of compliance with said regulations in a second column.",
      checklist: [
        "Lot size and width, building and impervious coverage, pervious coverage, and each setback",
        "Significant trees, curb cuts, parking spaces and existing structures",
        "Deed book and page for every lot, with the surveyor's stamp",
      ],
    },
    {
      title: "Zoning compliance letter", src: "pregs", pin: "App. C, item 8", q: "a cover letter plainly identifying any zoning deficiencies, non-compliance, or necessary relief",
      checklist: [
        "List every point where the plan departs from the ordinance, dimensional or not",
        "Say which you ask for as an adjustment, a waiver, an administrative modification or a variance",
      ],
    },
    {
      title: "Site plan", src: "pregs", pin: "App. C, item 11", q: "The location of transformer(s) and HVAC units",
      checklist: [
        "Structures, parking with aisle and stall dimensions, landscaped areas",
        "Transformers and mechanical units, which the Commission asks about",
        "Wetlands, watercourses or coastal features on or within 200 ft, and base flood elevation",
        "Loading space and bicycle storage, with how residents reach them",
      ],
    },
    {
      title: "Landscape plan with canopy coverage", src: "pregs", pin: "App. C, item 14", q: "A landscape plan showing the location of plantings, tree species, and canopy coverage calculations.",
      note: "Approvals here are routinely conditioned on the City Forester's sign-off, with the applicant responsible for street trees.",
      checklist: [
        "Required canopy coverage against the coverage provided",
        "Street tree species agreed with the City Forester",
        "Who maintains the street trees after planting",
      ],
    },
    {
      title: "Elevations with transparency and height", src: "pregs", pin: "App. C, item 17", q: "fenestration, transparency calculations, and building height",
      checklist: [
        "Height from average grade, with the average grade diagram",
        "Whether the lowest level is a cellar or a basement, since a basement counts as a story",
        "Transparency percentage for each street-facing facade",
        "Exterior materials. The Commission has attached conditions about synthetic wood-look panels on two Wayland projects.",
      ],
    },
    {
      title: "Renderings from the street", src: "pregs", pin: "App. C, item 19", q: "Development rendering(s) indicating overall massing and views from public",
      checklist: [
        "Views from each public street, with the neighbouring buildings shown",
        "How parking on the lower floors is screened from the street",
      ],
    },
    {
      title: "Lighting plan", src: "pregs", pin: "App. C, item 21", q: "Cut sheets of all light fixtures shall be included with the lighting plan.",
      checklist: [
        "Pole and fixture locations and heights",
        "Cut-off, dark-sky fixtures. The Commission required them at 27 East River Street.",
      ],
    },
    {
      title: "Drainage plan", src: "pregs", pin: "App. C, item 22", q: "A drainage plan showing provisions for controlling stormwater runoff.",
      checklist: [
        "Drainage calculations where the City's stormwater ordinance requires them",
        "Have the engineer ready to answer whether the system is feasible, not only conceptual",
      ],
    },
    {
      title: "Traffic study, if asked", src: "pregs", pin: "App. C, item 23", q: "Traffic study if required by the administrative officer, the Commission, or the City Traffic Engineer.",
      checklist: [
        "Ask at the pre-application meeting whether one will be required",
        "Level of service at nearby intersections, before and after",
        "Sight distance at each driveway",
        "A plan for deliveries and loading",
      ],
    },
    {
      title: "Request for an adjustment or design waiver", cond: "always", when: "If you ask for more height, less parking or a design waiver",
      src: "pregs", pin: "§ 401.A.2", q: "shall be reviewed by the City Plan Commission, and a request for review shall accompany the preliminary plan application",
      checklist: [
        "State each adjustment and the ground that makes the project eligible",
        "Show that the size of the adjustment relates to that ground",
        "Check the request is within what the ordinance lets the Commission grant. An approval at 128 Wayland Avenue was vacated in court over height in feet and in stories.",
      ],
    },
    {
      title: "Unified development review form, notice list and affidavit", cond: "relief", src: "pregs", pin: "App. C, item 28", q: "Affidavit of mailings with proof of newspaper notice shall be required prior to issuance of a certificate of completeness.",
      checklist: [
        "Complete the UDR form for each variance or special use permit",
        "List the owners, agencies and communities to be notified",
        "File the affidavit of mailing and the proof of the newspaper notice",
      ],
    },
    {
      title: "Public hearing notice, placed and paid for by you", cond: "relief", src: "pregs", pin: "§ 1004", q: "the applicant shall be responsible for placing advertisements and mailing notice",
      note: "Notice area: all property within 200 ft of the perimeter.",
      checklist: [
        "Newspaper legal advertisement at least 14 days before the hearing",
        "First-class mail to each owner in the notice area at least 10 days before",
        "Hire the stenographer the regulations require for unified development review",
      ],
    },
    {
      title: "Decision deadline", src: "pregs", pin: "§ 402.C", q: "within 65 days of certification of completeness",
      checklist: [
        "Note the certification date, then day 65, or day 95 if a public hearing is required",
        "Agree any extension in writing",
        "If the deadline passes with no decision, ask the administrative officer for a certificate of approval",
      ],
    },
  ],
};

const minorFinal: Step = {
  id: "final", title: "Final plan", app: "Final plan with the changes required at preliminary, state permits and legal documents",
  clock: { days: 25, text: "25 days from certification" },
  what: "The administrative officer reviews and approves the final plan and reports it to the Commission. The Commission usually delegates final approval to staff as a condition of the preliminary approval. Providence takes state permits and the City Engineer's approval at this stage, not before preliminary.",
  auth: [
    { c: "planning", role: "Administrative officer decides, or refers a major change to the Commission" },
    { c: "dpw", role: "Approves the stormwater management plan" },
    { c: "crmc", role: "Coastal approval, for sites on the Seekonk or Providence River", cond: "wet" },
  ],
  docs: [
    {
      title: "Photometric plan", src: "pregs", pin: "App. C, final plan item 1", q: "A photometric plan showing light levels measured in footcandles.",
      checklist: ["Light levels at each property line", "Fixtures matching the cut sheets filed at preliminary"],
    },
    {
      title: "Stormwater approval from Public Works", src: "pregs", pin: "App. C, final plan item 2", q: "Approval of the stormwater management plan from the Department of",
      note: "The item also names the Narragansett Bay Commission, the Coastal Resources Management Council and RIDEM, where they have a say.",
      checklist: ["City Engineer's written approval", "Any Narragansett Bay Commission approval for the sewer connection", "RIDEM or coastal approval where the site needs one"],
    },
    {
      title: "State permits, filed now", src: "pmin251216", pin: "Item 2, condition 1 (27 E River Street)", q: "The applicant shall submit all applicable state permits at the final plan stage.",
      note: "If a state permit changes the site plan, the same condition sends the applicant back to the Commission.",
      checklist: ["List each state permit and its status", "Compare the permitted plan with the approved preliminary plan before filing"],
    },
    {
      title: "RIDOT Physical Alteration Permit", cond: "dot", src: "pregs", pin: "App. C, final plan item 3", q: "A Physical Alteration Permit issued by the Rhode Island Department of",
      checklist: ["A letter that the permit will issue is enough for the final plan", "The permit itself is needed before the building permit"],
    },
    {
      title: "Changes required at the preliminary stage", src: "pregs", pin: "App. C, final plan item 4", q: "Any changes required by the administrative officer or the Commission at",
      checklist: ["Go through each condition of the preliminary approval and show where the plan meets it"],
    },
    {
      title: "Draft legal documents", src: "pregs", pin: "App. C, final plan item 5", q: "Draft copies of all legal documents describing the property, proposed",
      checklist: ["Easements and rights-of-way", "Any lot merger the approval required"],
    },
    {
      title: "Decision deadline", src: "pregs", pin: "§ 402.F", q: "within 25 days of the certificate of completeness",
      checklist: ["Note the certification date and day 25"],
    },
    {
      title: "No site work before final approval", src: "pformminor", pin: "Demolition and site work prior to approval, citing Zoning Ordinance § 1904.B", q: "no demolition, foundation, or building permits will be issued, and no site work will be allowed for any development requiring approval of a land development project until the City Plan Commission has approved the final plan",
      checklist: ["Hold demolition and foundation permit applications until the final plan is approved"],
    },
  ],
};

const master: Step = {
  id: "master", title: "Master plan", app: "Major Land Development Project application, fee, survey, concept plans and notice materials",
  clock: { days: 115, text: "25 days to certify · 90 days to decide" },
  what: "The City Plan Commission decides the master plan after a public hearing. Variances and special use permits are requested here under unified development review. The administrative officer may combine the master and preliminary stages when the items for both are filed, and the Commission then holds one hearing.",
  auth: [
    { c: "pb", role: "Decides after a public hearing, and decides any zoning relief first" },
    { c: "planning", role: "Certifies completeness and asks city, state and neighbouring officials for comment" },
  ],
  objections: ["character", "parking", "traffic", "variances", "privacy", "stormwater", "values"],
  docs: [
    {
      title: "Fees", src: "pregs", pin: "§ 905.A", q: "($200 due at master plan, $200 due at preliminary plan)",
      checklist: ["Pay $200 with the master plan", "Add $400 at each stage if unified development review is requested"],
    },
    {
      title: "Concept plan set", src: "pregs", pin: "App. E, master plan item 15", q: "A conceptual landscape plan showing the locations and types of plantings.",
      note: "Also required: a Class I survey with zoning table, a site plan, the average grade and height diagram, elevations and renderings.",
      checklist: [
        "Ten paper copies of the survey and plan set",
        "Elevations with transparency calculations and height",
        "Renderings from each public street",
        "A cover letter naming every zoning deficiency and the relief requested",
      ],
    },
    {
      title: "Public hearing", src: "pregs", pin: "§ 502.C", q: "A public hearing will be held prior to the City Plan Commission decision on the",
      note: "You place the newspaper advertisement and mail the notice, to all property within 200 ft, at your cost.",
      checklist: [
        "Newspaper legal advertisement at least 14 days before",
        "First-class mail to owners in the notice area at least 10 days before",
        "Affidavit of mailing and proof of the advertisement, needed before the application is certified complete",
      ],
    },
    {
      title: "Relief requested at master plan", cond: "relief", src: "pregs", pin: "§ 701.C", q: "shall be submitted as part of the application materials for the master plan stage of review or, if combined,",
      checklist: ["Complete the UDR form", "Hire the stenographer", "Be ready for the Commission to vote on the relief before the plan"],
    },
    {
      title: "Combining stages", src: "pregs", pin: "§ 501.B", q: "The administrative officer may combine review stages and modify requirements, but only",
      checklist: ["Ask at the pre-application meeting whether master and preliminary can be heard together", "File the items for both stages, or request waivers for those you cannot"],
    },
    {
      title: "Decision deadline", src: "pregs", pin: "§ 502.D", q: "within 90 days of certification of",
      checklist: ["Note the certification date and day 90", "Extend only by written waiver"],
    },
    {
      title: "Vesting", src: "pregs", pin: "§ 502.F", q: "The approved master plan is vested for a period of two years",
      checklist: ["Note the two-year date", "Request any extension in writing and attend the meeting where it is heard"],
    },
  ],
};

const majorState: Step = {
  id: "state", title: "State permits and city sign-offs", app: "State permit applications, stormwater plan to Public Works, traffic study to the Traffic Engineer",
  clock: { text: "Runs alongside review. Due with the final plan." },
  what: "Providence's regulations ask for state and federal permits before the final plan is approved, not before the preliminary plan. The preliminary decision clock is extended if evidence of state permits is missing, and applicants here have asked the Commission to waive state approvals at the preliminary stage.",
  auth: [
    { c: "dpw", role: "Stormwater plan, drainage and traffic study" },
    { c: "ridem", role: "Wetlands, stormwater and site remediation", cond: "wet|acre" },
    { c: "crmc", role: "Coastal zone review, for sites on the river", cond: "wet" },
    { c: "ridot", role: "Physical Alteration Permit", cond: "dot" },
  ],
  docs: [
    {
      title: "Permits due before final approval", src: "pregs", pin: "§ 504.A.6", q: "Prior to approval of the final plan, an applicant must submit all permits required by",
      checklist: ["List every state or federal permit the site triggers", "Start the coastal and remediation reviews early: they can change the site plan"],
    },
    {
      title: "Stormwater approval", src: "pregs", pin: "App. E, preliminary plan item 8", q: "Approval of the stormwater management plan from the Department of",
      checklist: ["File the stormwater plan with Public Works", "Ask whether the Narragansett Bay Commission must also approve"],
    },
    {
      title: "RIDOT Physical Alteration Permit", cond: "dot", src: "pregs", pin: "§ 504.A.6", q: "a letter evidencing the",
      checklist: ["A letter that the permit will issue is enough for final approval", "The permit itself is needed before the building permit"],
    },
  ],
};

const majorPrelim: Step = {
  id: "prelim", title: "Preliminary plan", app: "Engineered plan set, perimeter survey, city sign-offs and abutter notice",
  clock: { days: 115, text: "25 days to certify · 90 days to decide" },
  what: "The engineering review. Staff collect final written comments from Public Works, the City Engineer, the City Solicitor and other departments, abutters get notice, and the City Plan Commission decides. Relief granted at master plan can be changed, or new relief requested, which brings a new public hearing.",
  auth: [
    { c: "pb", role: "Decides, and approves any improvement guarantee" },
    { c: "planning", role: "Certifies completeness and collects department comments" },
    { c: "dpw", role: "City Engineer's final comments" },
  ],
  objections: ["parking", "traffic", "trees", "stormwater", "lighting", "construction", "privacy"],
  docs: [
    {
      title: "Engineering plans and perimeter survey", src: "pregs", pin: "§ 503.A.2", q: "engineering plans depicting the existing site",
      checklist: ["Grading at two-foot contours", "Utility plan", "Soil erosion and sediment control plan", "Detailed landscape plan with canopy calculations"],
    },
    {
      title: "Answers to what the Commission asked at the hearing",
      note: "At 269 Wickenden Street the Commission continued the preliminary plan for a month to get detail on the loading zone, bicycle storage reached by stairs, plantings in the rear yard and street trees.",
      checklist: ["Loading space location, agreed with Public Works", "Bicycle storage that can be reached without stairs", "Rear yard buffer planting", "Street trees, and who maintains them"],
    },
    {
      title: "Abutter notice", src: "pregs", pin: "§ 503.C", q: "the applicant shall send public notice to abutters only at least 14 days before the hearing",
      checklist: ["Mail at least 14 days before the first meeting", "Keep the receipts"],
    },
    {
      title: "Public improvement guarantees", src: "pregs", pin: "§ 503.D", q: "shall be reviewed and approved by the City Plan Commission at the preliminary plan stage",
      checklist: ["Construction schedule for any public improvements", "Form and amount of the guarantee"],
    },
    {
      title: "Decision deadline", src: "pregs", pin: "§ 503.E", q: "timeframe for decision is automatically extended if evidence of state permits has not been",
      checklist: ["Note the certification date and day 90", "Ask for a waiver of state approvals at this stage if they will follow at final"],
    },
  ],
};

const majorFinal: Step = {
  id: "final", title: "Final plan", app: "Final plan, state permits, tax certification and legal documents",
  clock: { days: 60, text: "15 days to certify (25 if changed) · 45 days to decide" },
  what: "The administrative officer decides the final plan, or refers it to the Commission. The Commission usually delegates final approval to staff when it approves the preliminary plan.",
  auth: [
    { c: "planning", role: "Administrative officer decides, or refers the plan to the Commission" },
    { c: "clerk", role: "The record" },
  ],
  docs: [
    {
      title: "State and federal permits", src: "pregs", pin: "§ 504.A.6", q: "Prior to approval of the final plan, an applicant must submit all permits required by",
      checklist: ["Every permit in hand, or the RIDOT letter", "Check the permitted plan against the preliminary approval"],
    },
    {
      title: "Tax certification", src: "pregs", pin: "§ 504.A.3", q: "Certification by the tax collector that all property taxes are current.",
      checklist: ["Order the municipal lien certificate from the Tax Collector"],
    },
    {
      title: "Legal documents", src: "pregs", pin: "§ 504.A.5", q: "copies of all legal",
      checklist: ["Easements and rights-of-way", "Encroachment permits for anything over the public right of way"],
    },
    {
      title: "Decision deadline", src: "pregs", pin: "§ 504.C", q: "issued within 45 days after the certification of completeness",
      checklist: ["Note the certification date and day 45"],
    },
    {
      title: "No site work before final approval", src: "pformminor", pin: "Demolition and site work prior to approval, citing Zoning Ordinance § 1904.B", q: "no demolition, foundation, or building permits will be issued, and no site work will be allowed for any development requiring approval of a land development project until the City Plan Commission has approved the final plan",
      checklist: ["Hold demolition and foundation permit applications until the final plan is approved"],
    },
  ],
};

const record = (major: boolean): Step => ({
  id: "record", title: "Record the approval", app: "Approval letter and stamped plans for the Recorder of Deeds",
  clock: { text: major ? "Within 2 years of final approval" : "Within 1 year of approval" },
  what: "Staff return stamped copies of the plan and the approval letter, and you record them at the Recorder of Deeds in City Hall. Recording the decision and posting it in the City Clerk's office starts the 20-day appeal window. Approvals lapse if nothing is recorded in time, and extensions are requested from the Commission at a public meeting.",
  auth: [
    { c: "clerk", role: "Records the plan and letter, and posts the decision" },
    { c: "planning", role: "Signs the plan and keeps the permanent record" },
    { c: "pb", role: "Decides requests to extend an approval" },
  ],
  docs: [
    {
      title: "Recording at City Hall", src: "pformminor", pin: "Procedure, step 6", q: "The applicant shall record said documents at the Recorder of Deeds office on the fifth floor of Providence City Hall",
      note: "The form gives the recording fees and asks for one recorded copy back.",
      checklist: ["Record the approval letter and the stamped plans", "Pay the recording fees, by check if possible", "Return one copy of each recorded document to the planning department"],
    },
    major
      ? {
        title: "Expiry", src: "pregs", pin: "§ 504.E", q: "expires two years from the date of approval",
        checklist: ["Put the two-year date in your calendar", "A one-year extension needs a written request and an appearance before the Commission"],
      }
      : {
        title: "Expiry and extensions", src: "pregs", pin: "§ 402.H", q: "expire one year from the date of approval",
        note: "Extensions are common on the Commission's agenda. 386 Ives Street and 27 East River Street each asked for a further year.",
        checklist: ["Put the one-year date in your calendar", "Request an extension in writing before it lapses, and attend the meeting"],
      },
  ],
});

const appeal: Step = {
  id: "appeal", title: "Appeal, if denied or challenged", branch: true, app: "Complaint to the Superior Court, or an appeal to the Board of Appeal on an administrative matter",
  clock: { days: 20, text: "20 days from recording and posting" },
  what: "A decision of the City Plan Commission, or of the administrative officer approving or denying a project, is appealed to the Superior Court. The Zoning Board of Review sits as the Board of Appeal only for the officer's administrative decisions and completeness determinations. Two projects in this part of the city were taken to court by neighbours, so the window matters to lenders here.",
  auth: [
    { c: "court", role: "Hears appeals of Commission and administrative officer decisions" },
    { c: "zbr", role: "Board of Appeal for administrative matters and completeness" },
  ],
  docs: [
    {
      title: "Which decisions go straight to court", src: "pregs", pin: "§ 1011.A.1", q: "shall not be subject to this article and shall proceed directly to Superior Court",
      checklist: ["Identify who made the decision and under which article", "Brief a land-use attorney as soon as a decision is recorded"],
    },
    {
      title: "The 20-day window", src: "pregs", pin: "§ 1011.A.2", q: "The appeal must be taken within 20 days after the decision has been recorded in the",
      checklist: ["Note the date the decision was recorded and the date it was posted", "Tell your lender when the window closes"],
    },
    {
      title: "A master plan upheld: 269 Wickenden Street", src: "pc241374", pin: "Conclusion", q: "The appeal is DENIED, and the Zoning Board",
      note: "Neighbours appealed the November 2023 master plan approval to the Board of Appeal, which upheld it in February 2024, and then to the Superior Court, which denied the appeal in September 2024. The appeal was filed under the law in force before 2024, when a board of appeal step came first.",
      checklist: ["Expect the grounds raised there: height and stories, consistency with the Comprehensive Plan, and parking", "Keep the record complete, since the court reviews it without new testimony"],
    },
    {
      title: "An approval vacated: 128 Wayland Avenue", src: "pag250916", pin: "Item 5", q: "Preliminary plan approval granted in August 2024 was vacated by a court decision, requiring the",
      note: "The Commission heard the plan again in September 2025 and approved it with new findings, after the ordinance was amended.",
      checklist: ["Check each adjustment against the exact wording of the ordinance", "Ask that the Commission's findings be stated for each adjustment in the written decision"],
    },
  ],
};

/** Providence's steps by route. A route not listed keeps the state-law steps. */
export const PROVIDENCE_STEPS: Partial<Record<TreeId, Step[]>> = {
  minor: [zoning, rezone, preapp(false), minorPrelim, minorFinal, record(false), appeal],
  major: [zoning, rezone, preapp(true), master, majorState, majorPrelim, majorFinal, record(true), appeal],
};

export const PROVIDENCE_RULES: TownRules = {
  /*
   * Art. 2 of the regulations: a land development project starts at 10 units (or 10,000 sq ft, or 50 parking
   * spaces, which this site does not ask for). Up to 2,500 sq ft of commercial space it is minor, above that major.
   * The 25%-affordable comprehensive permit route is state law and is kept, though Providence's handling of it was not read.
   */
  classify: (i) => {
    if (i.units >= 3 && i.aff / i.units >= 0.25) return "comp";
    if (i.units >= 10) return (i.commercial ?? 0) > 2500 ? "major" : "minor";
    return "byright";
  },
  permitsBefore: "final",
  asksCommercial: true,
  routeText: {
    minor: { name: "Minor land development project", rule: "10 or more units, with up to 2,500 sq ft of commercial space", blurb: "Two stages, preliminary and final. Staff can decide a plan that needs no relief. The City Plan Commission decides when more height, less parking, a waiver or a variance is requested." },
    major: { name: "Major land development project", rule: "10 or more units, with more than 2,500 sq ft of commercial space", blurb: "Master, preliminary and final plans before the City Plan Commission, with a public hearing at master plan. Stages are often combined." },
    byright: { rule: "Fewer than 10 units and under 10,000 sq ft of new floor area", blurb: "Not a land development project in Providence. A building permit, and possibly development plan review under Article 19 of the Zoning Ordinance, which was not read for this trial." },
  },
};
