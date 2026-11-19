import type { Tree, TreeId } from "../../types";

/*
 * The five routes under Rhode Island law: their stages, who decides each, the statutory clocks, and the documents state
 * law and statewide data require, each with its source, pinpoint and quote. A town supplies its own steps on top of
 * these (lib/data/towns/overlay.ts); a town with none gets these as they stand.
 *
 * Split out of Cumberland's trees on 2026-11-18 (ARD debt 1, D53 chunk 1): generated once from what the engine then
 * made of Cumberland's steps for any other town, and edited by hand from here on. "{town}" is replaced with the
 * project's town. A clock that says "a figure read from Cumberland's regulations" has no state figure read yet.
 */

const major: Tree = {
  id: "major",
  name: "Major land development",
  rule: "10 or more multifamily units; over 7,500 sq ft of new commercial floor area; mixed use over 6 units or 2,500 sq ft of commercial space",
  status: "Fully sourced",
  blurb: "Pre-application meeting, then master, preliminary and final plans. Each Planning Board stage has public notice.",
  steps: [
    {
      id: "zoning",
      title: "Zoning and site check",
      app: "Site data package: plat and lot, zoning district, utilities, constraints",
      clock: { text: "Before filing" },
      what: "Confirm the parcel's zoning district, whether multi-household use is allowed, the density the lot supports, and which state permits the site will trigger. Site selection's lookup and the law check on the Check page cover this step.",
      authLabel: "Rules set by",
      auth: [
        { c: "council", role: "Adopts the zoning ordinance, the zoning map and the Comprehensive Plan" },
        { c: "ga", role: "Sets the enabling acts and the 9-unit minor threshold" },
      ],
      docs: [
        {
          title: "Parcel geometry from statewide GIS",
          note: "Statewide assessor parcel polygons. The backend joins this layer to the zoning, flood and wetlands layers.",
          src: "rigis",
          pin: "Tax_Parcels map service",
          checklist: [
            "Match the Assessor's Plat and Lot to the deed",
            "Overlay FEMA flood zones and record the zone",
            "Overlay RIDEM wetlands and note anything within 200 ft",
            "Note any public wells or reservoirs within 1,000 ft. The master plan location map must show them.",
            "Check whether the frontage road is a state road, which means RIDOT is involved",
          ],
        },
        {
          title: "Parking cap near transit",
          cond: "transit",
          note: "Applies within ¼ mile of a regional mobility hub or ⅛ mile of a frequent transit stop.",
          src: "ridsp", pin: "S 3303 / H 8005 Sub A (2026)", q: "no more than one off-street parking space per dwelling unit in a multi-family structure or development can be required",
          checklist: [
            "Measure the distance to the nearest frequent transit stop or mobility hub",
            "Cite the 2026 law in your parking calculation",
            "Decide whether to provide more than the minimum anyway, to head off parking objections",
          ],
        },
      ],
    },
    {
      id: "rezone",
      title: "Zone change petition",
      cond: "rezone",
      branch: true,
      app: "Petition to amend the zoning map, with a Comprehensive Plan consistency narrative",
      clock: { text: "No statutory deadline. This is a legislative decision." },
      what: "If you choose to change the zoning instead of seeking relief, the Town Council decides after the Planning Board makes an advisory recommendation. This is the most political step on the route, and you have no right to approval.",
      auth: [
        { c: "council", role: "Decides the zone change after a public hearing" },
        { c: "pb", role: "Gives the Council an advisory recommendation" },
      ],
      objections: ["character", "schools", "values", "renters", "traffic"],
      docs: [
        {
          title: "Petition to amend the zoning map",
          note: "Ask Planning staff for the current form and fee.",
          checklist: [
            "Name every parcel by Assessor's Plat and Lot, with all owners signing",
            "State the current and proposed district",
            "Attach a radius map and abutter list",
            "Explain why the proposed district fits the Comprehensive Plan's future land use map",
            "Meet the ward councillor and abutters before the hearing",
          ],
        },
      ],
    },
    {
      id: "preapp",
      title: "Pre-application meeting",
      app: "Pre-application submission (Appendix C checklist)",
      clock: { days: 60, text: "15 days to certify · meeting within 45" },
      what: "Required for every major project. Staff, and state agencies where relevant, explain the steps and the rules that apply. You can also ask the Planning Board for an informal concept review. The advice is guidance, not approval.",
      auth: [{ c: "planning", role: "Certifies the submission and runs the meeting" }, { c: "pb", role: "Optional informal concept review" }],
      docs: [
        {
          title: "Concept site plan and building massing",
          note: "Enough to discuss layout, access, utilities and the relief you may need",
          checklist: [
            "Show the building footprint, parking, driveway and curb cut",
            "Show the setbacks to each abutter",
            "Sketch the massing next to neighbouring buildings",
            "Show where screening, drainage and snow storage could go",
            "Mark where headlights would sweep from the driveway",
          ],
        },
      ],
    },
    {
      id: "master",
      title: "Master plan",
      app: "Master plan application, fee, plan sets and abutter labels",
      clock: { days: 115, text: "25 days to certify · 90 days to decide" },
      what: "This stage sets the concept: layout, unit count, access, utilities and neighbourhood impact. Town departments and state agencies comment, the Technical Review Committee makes recommendations, and the Planning Board decides after a public hearing. If the board misses its deadline, the plan is approved by default. Approval vests your zoning rights for 2 years.",
      auth: [
        { c: "pb", role: "Decides, after a public hearing. Also decides zoning relief under unified development review." },
        { c: "trc", role: "Reviews before the hearing and recommends" },
        { c: "planning", role: "Certifies completeness and gathers comments from Public Works, Fire, Police, Rescue and the commissions" },
      ],
      objections: ["traffic", "headlights", "character", "stormwater", "privacy", "trees", "values"],
      docs: [
        {
          title: "Abutter list on mailing labels, with notice paid by you",
          note: "Notice area: 200 ft from the perimeter. Certified mail plus a newspaper notice.",
          src: "s3939", pin: "§ 45-23-39(c)(4)(ii)", q: "Notice for the public hearing is required and must be given at least fourteen (14) days prior to the date of the meeting",
          checklist: [
            "Pull every owner within 200 ft from the assessor's records",
            "Check whether the notice area crosses into a neighbouring town, which then needs notice too",
            "Print self-adhesive labels, 2 sets",
            "Budget for certified mail and newspaper costs",
            "Send a friendly letter to abutters before the formal notice arrives",
          ],
        },
        {
          title: "Unified development review request",
          cond: "relief",
          note: "Lists every variance or special use permit. The Planning Board decides relief before the plan.",
          src: "s3950", pin: "§ 45-23-50.1", q: "Public notice shall indicate that dimensional variance(s), use variance(s), and/or special-use permit(s)",
          checklist: [
            "List each ordinance section, what it requires and what you propose",
            "Write the hardship or special-use standards argument for each item",
            "Make sure the notice wording names every form of relief",
            "Show that each item of relief is the least needed",
          ],
        },
        {
          title: "Decision deadline",
          src: "s3939", pin: "§ 45-23-39(c)(5)", q: "The planning board shall, within ninety (90) days of certification of completeness",
          checklist: [
            "Note the certification date and day 90",
            "Agree any extension in writing only",
            "If day 90 passes without a decision, ask the Administrative Officer for a certificate of approval",
          ],
        },
        {
          title: "Vesting",
          src: "s3939", pin: "§ 45-23-39(c)(7)(i)", q: "The approved master plan is vested for a period of two (2) years, with the right to extend for two (2), one-year extensions",
          checklist: [
            "Note the 2-year vesting expiry",
            "Plan the dates for the preliminary plan submission",
            "Ask for any extension in writing before it expires",
          ],
        },
      ],
    },
    {
      id: "state",
      title: "State permits and utility sign-offs",
      app: "State permit applications and requests for town water and sewer letters",
      clock: { text: "Runs in parallel, on each agency's timeline" },
      what: "State law sets this stage. {town}'s own requirements for it have not been read yet, so confirm them with the planning office.",
      auth: [
        { c: "water", role: "Water service confirmation", cond: "pubwater" },
        { c: "dpw", role: "Sewer service confirmation", cond: "pubsewer" },
        { c: "ridem", role: "Freshwater wetlands, stormwater and septic approvals", cond: "wet|acre|septic" },
        { c: "crmc", role: "Coastal wetlands permit (Assent), where CRMC regulates the site's wetlands", cond: "coastal" },
        { c: "ridot", role: "Physical Alteration Permit for the curb cut", cond: "dot" },
      ],
      docs: [
        {
          title: "RIDEM approval of the septic system (OWTS)",
          cond: "septic",
          src: "owts", pin: "250-RICR-150-10-6, § 6.9(C)", q: "No person shall install, construct, alter or repair or cause to be installed, constructed, altered or repaired any OWTS without first obtaining the Director",
          note: "Without public sewer, the onsite wastewater treatment system needs RIDEM's written approval of its plans before construction, and a certificate of conformance before use.",
          checklist: [
            "Have a licensed soil evaluator test the soils and the seasonal high groundwater",
            "Have a licensed designer size the system: 115 gallons a day per bedroom for homes",
            "Check the setbacks from wells, wetlands and drinking water supplies",
            "Ask whether the site is in a critical resource area, where nitrogen-reducing technology is required",
            "Submit the application to RIDEM and wait for written approval before building",
          ],
        },
        {
          title: "RIPDES construction stormwater permit",
          cond: "acre",
          note: "Required when 1 acre or more is disturbed. File with RIDEM.",
          checklist: [
            "Confirm the disturbed area is 1 acre or more",
            "Prepare the stormwater pollution prevention plan",
            "Plan for inspection and maintenance during construction",
          ],
        },
      ],
    },
    {
      id: "prelim",
      title: "Preliminary plan",
      app: "Engineered preliminary plan set and supporting reports",
      clock: { days: 115, text: "25 days to certify · 90 days to decide" },
      what: "This is the full engineering review. Town departments give their final comments, the Technical Review Committee reviews the plans, abutters get notice, and the Planning Board decides after a public hearing. It also approves the improvement guarantee. If the board misses its deadline, the plan is approved by default.",
      auth: [
        { c: "pb", role: "Decides after a public hearing, and approves the guarantees" },
        { c: "trc", role: "Reviews before the first board meeting" },
        { c: "dpw", role: "Town Engineer and Public Works give final comments" },
        { c: "planning", role: "Collects comments from the Town Solicitor, Water and Sewer, and the police traffic officer" },
      ],
      objections: ["headlights", "lighting", "stormwater", "parking", "trash", "snow", "construction", "emergency"],
      docs: [
        {
          title: "Changes to relief granted at master plan",
          cond: "relief",
          note: "Include them with the preliminary application",
          checklist: ["List any relief that changed since master plan", "Explain why each change is needed"],
        },
        {
          title: "Abutter notice",
          src: "s3939", pin: "§ 45-23-39(d)(4)", q: "Prior to the first planning board meeting on the preliminary plan, public notice shall be sent to abutters only",
          checklist: [
            "Mail notice at least 14 days before the first meeting",
            "Keep the mailing receipts",
            "Bring the answers to objections raised at the master plan hearing",
          ],
        },
      ],
    },
    {
      id: "final",
      title: "Final plan",
      app: "Final plan set, legal documents, bond and tax certification",
      clock: { days: 60, text: "15 days to certify (25 if changed) · 45 days to decide" },
      what: "Mostly administrative. If the Administrative Officer certifies the plan complete and the board did not ask to see it again, the plan is approved. Missing the 45-day deadline also counts as approval.",
      auth: [
        { c: "planning", role: "Administrative Officer decides, or refers the plan to the Planning Board" },
        { c: "clerk", role: "Tax certification and the record" },
      ],
      docs: [
        {
          title: "Municipal lien certificate",
          src: "s3939", pin: "§ 45-23-39(e)(1)(iii)", q: "Certification by the tax collector that all property taxes are current.",
          checklist: ["Order it from the Tax Collector", "Make sure it is dated close to the submission date"],
        },
        {
          title: "Decision deadline",
          src: "s3939", pin: "§ 45-23-39(e)(3)", q: "A decision shall be issued within forty-five (45) days after the certification of completeness",
          checklist: ["Note the certification date and day 45", "Ask for a certificate of approval if day 45 passes without a decision"],
        },
      ],
    },
    {
      id: "record",
      title: "Sign and record the approved plan",
      app: "Recordable final plan, plus any deeds and condominium documents",
      clock: { text: "Within 2 years of final approval" },
      what: "The approved plan is signed and recorded in the Land Evidence Records. Recording the decision and posting it at the Town Clerk's office starts the 20-day appeal window. Once recorded, any street shown is accepted for dedication, but the town takes on maintenance only when the Town Council accepts the finished work.",
      auth: [
        { c: "clerk", role: "Records the plan and posts the decision" },
        { c: "planning", role: "Signs the plan and notifies the E-911 authority of new addresses" },
      ],
      docs: [
        {
          title: "Recordable final plan",
          src: "s3939", pin: "§ 45-23-39(e)(5)", q: "The final approval of a major subdivision or land development project expires two (2) years from the date of approval",
          checklist: [
            "Prepare a recordable plan in the size and medium the Town Clerk accepts",
            "Get every required signature block signed",
            "Note all conditions of approval on the plan",
            "Pay the recording fees",
            "Put the recording deadline in your calendar, with a reminder before it",
          ],
        },
        {
          title: "Condominium declaration and plats",
          cond: "always",
          when: "If units are sold",
          note: "Under the RI Condominium Act. Not part of the planning approval.",
          checklist: [
            "Prepare the declaration, plats and plans to record together",
            "Make sure unit boundaries match the approved plans",
            "Write the affordability deed restrictions into the declaration if any units are affordable",
          ],
        },
      ],
    },
    {
      id: "appeal",
      title: "Appeal, if denied or challenged",
      branch: true,
      app: "Complaint to the Superior Court, filed within 20 days",
      clock: { days: 20, text: "20 days from recording and posting" },
      what: "You or an aggrieved neighbour can appeal a Planning Board or Administrative Officer decision. For you, 20 days is the deadline. For neighbours, it is a risk window, and lenders often wait for it to close.",
      auth: [
        { c: "court", role: "Hears the appeal on the record, without a jury" },
        { c: "zbr", role: "Board of Appeals for certain administrative actions" },
      ],
      docs: [
        {
          title: "Complaint stating the reasons for appeal",
          src: "s3971", pin: "§ 45-23-71(a)", q: "within twenty (20) days after the decision has been recorded and posted in the office of the city or town clerk",
          checklist: [
            "Note the date the decision was recorded and posted, which starts the clock",
            "Get the transcript or minutes and every exhibit in the record",
            "Brief a land-use attorney right away. The window is short.",
            "Build your arguments on the record, because the court reviews it without new testimony",
          ],
        },
      ],
    },
    {
      id: "building",
      title: "Building permit and fire plan review",
      app: "Building permit application with construction documents",
      clock: { text: "Typically 4–10 weeks (estimate)" },
      what: "This step sits outside the planning process. The permit drawings must match the recorded plan and every condition attached to it.",
      auth: [
        { c: "building", role: "Issues the building permit under the RI State Building Code" },
        { c: "sfm", role: "Fire protection plan review (or the local fire marshal)" },
        { c: "dpw", role: "Sewer connection" },
        { c: "water", role: "Water service" },
      ],
      docs: [
        {
          title: "Building permit application with stamped construction documents",
          note: "Prepared by a RI-registered architect or engineer, and matching the recorded plan and its conditions.",
          checklist: [
            "Make sure the drawings match the recorded plan: footprint, height, units and parking",
            "List the conditions of approval on the cover sheet",
            "Include the energy code compliance documents",
            "Show the structural, mechanical, electrical and plumbing sheets, with each discipline's stamp",
            "Have the contractor's registration number ready",
          ],
        },
        {
          title: "Sprinkler and fire alarm plans for fire plan review",
          src: "sfm",
          pin: "Plan Review Unit",
          note: "Call to schedule a submission. Incomplete submissions are returned with a checklist.",
          checklist: [
            "Set the sprinkler design basis for multifamily residential occupancy",
            "Show the fire alarm and notification layout",
            "Show fire department access, hydrant locations and the turning template",
            "Size the water supply for the sprinkler demand",
            "Call to schedule the plan review appointment",
          ],
        },
        {
          title: "Utility connection applications",
          note: "Sewer through Public Works, water through the Water Department, electric through Rhode Island Energy.",
          checklist: [
            "Apply for the sewer connection and pay the fees",
            "Apply for water service, with meter sizing",
            "Apply for electric service with the load letter, early, because utility lead times can be long",
            "Coordinate the trench and road-opening permits",
          ],
        },
      ],
    },
    {
      id: "occupy",
      title: "Build, inspect and occupy",
      app: "Inspection requests and as-built drawings",
      clock: { text: "Construction period" },
      what: "Each unit needs a certificate of occupancy before anyone can live in it. Bonds for public improvements are released once the Town Council accepts the work.",
      auth: [
        { c: "building", role: "Inspects during construction, then issues the certificate of occupancy" },
        { c: "council", role: "Accepts dedicated streets and public improvements, which releases the bond" },
      ],
      docs: [
        {
          title: "Inspection requests and as-built drawings",
          note: "Utilities and drainage as built",
          checklist: [
            "Book inspections at each stage: footing, framing, insulation and final",
            "Have the surveyor record the as-built utility and drainage locations",
            "Get the fire marshal's final sign-off before you ask for the certificate of occupancy",
            "Finish the landscaping and screening the approval required, since inspectors check conditions",
          ],
        },
      ],
    },
  ],
};

const minor: Tree = {
  id: "minor",
  name: "Minor land development",
  rule: "3 to 9 multifamily units; up to 7,500 sq ft of new commercial floor area; mixed use up to 6 units and 2,500 sq ft of commercial space; a change of use without extensive construction",
  status: "Fully sourced",
  blurb: "Two stages, preliminary and final. Usually decided by the Administrative Officer. The Planning Board decides only if relief or a new street is involved.",
  steps: [
    {
      id: "zoning",
      title: "Zoning and site check",
      app: "Site data package: plat and lot, zoning district, utilities, constraints",
      clock: { text: "Before filing" },
      what: "Confirm the parcel's zoning district, whether multi-household use is allowed, the density the lot supports, and which state permits the site will trigger. Site selection's lookup and the law check on the Check page cover this step.",
      authLabel: "Rules set by",
      auth: [
        { c: "council", role: "Adopts the zoning ordinance, the zoning map and the Comprehensive Plan" },
        { c: "ga", role: "Sets the enabling acts and the 9-unit minor threshold" },
      ],
      docs: [
        {
          title: "Parcel geometry from statewide GIS",
          note: "Statewide assessor parcel polygons. The backend joins this layer to the zoning, flood and wetlands layers.",
          src: "rigis",
          pin: "Tax_Parcels map service",
          checklist: [
            "Match the Assessor's Plat and Lot to the deed",
            "Overlay FEMA flood zones and record the zone",
            "Overlay RIDEM wetlands and note anything within 200 ft",
            "Note any public wells or reservoirs within 1,000 ft. The master plan location map must show them.",
            "Check whether the frontage road is a state road, which means RIDOT is involved",
          ],
        },
        {
          title: "Parking cap near transit",
          cond: "transit",
          note: "Applies within ¼ mile of a regional mobility hub or ⅛ mile of a frequent transit stop.",
          src: "ridsp", pin: "S 3303 / H 8005 Sub A (2026)", q: "no more than one off-street parking space per dwelling unit in a multi-family structure or development can be required",
          checklist: [
            "Measure the distance to the nearest frequent transit stop or mobility hub",
            "Cite the 2026 law in your parking calculation",
            "Decide whether to provide more than the minimum anyway, to head off parking objections",
          ],
        },
      ],
    },
    {
      id: "rezone",
      title: "Zone change petition",
      cond: "rezone",
      branch: true,
      app: "Petition to amend the zoning map, with a Comprehensive Plan consistency narrative",
      clock: { text: "No statutory deadline. This is a legislative decision." },
      what: "If you choose to change the zoning instead of seeking relief, the Town Council decides after the Planning Board makes an advisory recommendation. This is the most political step on the route, and you have no right to approval.",
      auth: [
        { c: "council", role: "Decides the zone change after a public hearing" },
        { c: "pb", role: "Gives the Council an advisory recommendation" },
      ],
      objections: ["character", "schools", "values", "renters", "traffic"],
      docs: [
        {
          title: "Petition to amend the zoning map",
          note: "Ask Planning staff for the current form and fee.",
          checklist: [
            "Name every parcel by Assessor's Plat and Lot, with all owners signing",
            "State the current and proposed district",
            "Attach a radius map and abutter list",
            "Explain why the proposed district fits the Comprehensive Plan's future land use map",
            "Meet the ward councillor and abutters before the hearing",
          ],
        },
      ],
    },
    {
      id: "preapp",
      title: "Pre-application meeting (optional)",
      app: "Pre-application checklist materials",
      clock: { text: "On request" },
      what: "Not required for minor projects, but available on request. It is useful if you expect to need relief.",
      auth: [{ c: "planning", role: "Runs the meeting" }],
      docs: [],
    },
    {
      id: "prelim",
      title: "Preliminary plan",
      app: "Preliminary plan application and checklist",
      clock: { days: 80, text: "15 days to certify · 65 to decide (25 + 95 with relief)" },
      what: "The Administrative Officer decides, and may ask the Technical Review Committee for a recommendation first. If you need a variance or special use permit, or a new street, the Planning Board decides after a public hearing, on a longer clock. If the deadline is missed, the plan is approved by default.",
      auth: [
        { c: "planning", role: "Decides most applications" },
        { c: "trc", role: "May review and recommend" },
        { c: "pb", role: "Decides only with relief or a new street", cond: "relief" },
      ],
      objections: ["headlights", "parking", "stormwater", "privacy"],
      docs: [
        {
          title: "Who decides",
          src: "s3938", pin: "§ 45-23-38(a)(2)", q: "The administrative officer shall review and grant, grant with conditions, or deny all other applications",
          checklist: ["Confirm whether the project needs relief or a new street, either of which sends it to the Planning Board"],
        },
        {
          title: "Decision deadline",
          src: "s3938", pin: "§ 45-23-38(d)", q: "within sixty-five (65) days of certification of completeness",
          checklist: ["Note the certification date and day 65", "Agree any extension in writing"],
        },
        {
          title: "Unified development review request",
          cond: "relief",
          src: "s3938", pin: "§ 45-23-38(d)", q: "within ninety-five (95) days of certification of completeness",
          checklist: [
            "List each item of relief, with the ordinance section",
            "Notify property owners within the notice area for the public hearing",
            "Prepare the hardship or special-use standards argument",
          ],
        },
      ],
    },
    {
      id: "final",
      title: "Final plan",
      app: "Final plan, legal documents and tax certification",
      clock: { days: 25, text: "25 days to decide" },
      what: "The Administrative Officer approves, or refers the plan to the Planning Board if it has changed in a major way.",
      auth: [{ c: "planning", role: "Decides" }],
      docs: [
        {
          title: "Tax certification and bond",
          note: "The same items as the major final plan checklist",
          checklist: ["Municipal lien certificate", "Improvement guarantee, if any", "Deeds and easements"],
        },
      ],
    },
    {
      id: "record",
      title: "Sign and record the approved plan",
      app: "Recordable final plan, plus any deeds and condominium documents",
      clock: { text: "Within 1 year of final approval" },
      what: "The approved plan is signed and recorded in the Land Evidence Records. Recording the decision and posting it at the Town Clerk's office starts the 20-day appeal window. Once recorded, any street shown is accepted for dedication, but the town takes on maintenance only when the Town Council accepts the finished work.",
      auth: [
        { c: "clerk", role: "Records the plan and posts the decision" },
        { c: "planning", role: "Signs the plan and notifies the E-911 authority of new addresses" },
      ],
      docs: [
        {
          title: "Recordable final plan",
          src: "s3938", pin: "§ 45-23-38(j)", q: "Approvals of a minor land development or subdivision plan expire one year from the date of approval",
          checklist: [
            "Prepare a recordable plan in the size and medium the Town Clerk accepts",
            "Get every required signature block signed",
            "Note all conditions of approval on the plan",
            "Pay the recording fees",
            "Put the recording deadline in your calendar, with a reminder before it",
          ],
        },
        {
          title: "Condominium declaration and plats",
          cond: "always",
          when: "If units are sold",
          note: "Under the RI Condominium Act. Not part of the planning approval.",
          checklist: [
            "Prepare the declaration, plats and plans to record together",
            "Make sure unit boundaries match the approved plans",
            "Write the affordability deed restrictions into the declaration if any units are affordable",
          ],
        },
      ],
    },
    {
      id: "appeal",
      title: "Appeal, if denied or challenged",
      branch: true,
      app: "Complaint to the Superior Court, filed within 20 days",
      clock: { days: 20, text: "20 days from recording and posting" },
      what: "You or an aggrieved neighbour can appeal a Planning Board or Administrative Officer decision. For you, 20 days is the deadline. For neighbours, it is a risk window, and lenders often wait for it to close.",
      auth: [
        { c: "court", role: "Hears the appeal on the record, without a jury" },
        { c: "zbr", role: "Board of Appeals for certain administrative actions" },
      ],
      docs: [
        {
          title: "Complaint stating the reasons for appeal",
          src: "s3971", pin: "§ 45-23-71(a)", q: "within twenty (20) days after the decision has been recorded and posted in the office of the city or town clerk",
          checklist: [
            "Note the date the decision was recorded and posted, which starts the clock",
            "Get the transcript or minutes and every exhibit in the record",
            "Brief a land-use attorney right away. The window is short.",
            "Build your arguments on the record, because the court reviews it without new testimony",
          ],
        },
      ],
    },
    {
      id: "building",
      title: "Building permit and fire plan review",
      app: "Building permit application with construction documents",
      clock: { text: "Typically 4–10 weeks (estimate)" },
      what: "This step sits outside the planning process. The permit drawings must match the recorded plan and every condition attached to it.",
      auth: [
        { c: "building", role: "Issues the building permit under the RI State Building Code" },
        { c: "sfm", role: "Fire protection plan review (or the local fire marshal)" },
        { c: "dpw", role: "Sewer connection" },
        { c: "water", role: "Water service" },
      ],
      docs: [
        {
          title: "Building permit application with stamped construction documents",
          note: "Prepared by a RI-registered architect or engineer, and matching the recorded plan and its conditions.",
          checklist: [
            "Make sure the drawings match the recorded plan: footprint, height, units and parking",
            "List the conditions of approval on the cover sheet",
            "Include the energy code compliance documents",
            "Show the structural, mechanical, electrical and plumbing sheets, with each discipline's stamp",
            "Have the contractor's registration number ready",
          ],
        },
        {
          title: "Sprinkler and fire alarm plans for fire plan review",
          src: "sfm",
          pin: "Plan Review Unit",
          note: "Call to schedule a submission. Incomplete submissions are returned with a checklist.",
          checklist: [
            "Set the sprinkler design basis for multifamily residential occupancy",
            "Show the fire alarm and notification layout",
            "Show fire department access, hydrant locations and the turning template",
            "Size the water supply for the sprinkler demand",
            "Call to schedule the plan review appointment",
          ],
        },
        {
          title: "Utility connection applications",
          note: "Sewer through Public Works, water through the Water Department, electric through Rhode Island Energy.",
          checklist: [
            "Apply for the sewer connection and pay the fees",
            "Apply for water service, with meter sizing",
            "Apply for electric service with the load letter, early, because utility lead times can be long",
            "Coordinate the trench and road-opening permits",
          ],
        },
      ],
    },
    {
      id: "occupy",
      title: "Build, inspect and occupy",
      app: "Inspection requests and as-built drawings",
      clock: { text: "Construction period" },
      what: "Each unit needs a certificate of occupancy before anyone can live in it.",
      auth: [{ c: "building", role: "Inspects during construction, then issues the certificate of occupancy" }],
      docs: [
        {
          title: "Inspection requests and as-built drawings",
          note: "Utilities and drainage as built",
          checklist: [
            "Book inspections at each stage: footing, framing, insulation and final",
            "Have the surveyor record the as-built utility and drainage locations",
            "Get the fire marshal's final sign-off before you ask for the certificate of occupancy",
            "Finish the landscaping and screening the approval required, since inspectors check conditions",
          ],
        },
      ],
    },
  ],
};

const comp: Tree = {
  id: "comp",
  name: "Comprehensive permit",
  rule: "At least 25% of units affordable",
  status: "Fully sourced",
  blurb: "One application to the Planning Board replaces the separate local approvals. Comes with minimum density bonuses.",
  steps: [
    {
      id: "zoning",
      title: "Zoning and site check",
      app: "Site data package: plat and lot, zoning district, utilities, constraints",
      clock: { text: "Before filing" },
      what: "Confirm the parcel's zoning district, whether multi-household use is allowed, the density the lot supports, and which state permits the site will trigger. Site selection's lookup and the law check on the Check page cover this step.",
      authLabel: "Rules set by",
      auth: [
        { c: "council", role: "Adopts the zoning ordinance, the zoning map and the Comprehensive Plan" },
        { c: "ga", role: "Sets the enabling acts and the 9-unit minor threshold" },
      ],
      docs: [
        {
          title: "Parcel geometry from statewide GIS",
          note: "Statewide assessor parcel polygons. The backend joins this layer to the zoning, flood and wetlands layers.",
          src: "rigis",
          pin: "Tax_Parcels map service",
          checklist: [
            "Match the Assessor's Plat and Lot to the deed",
            "Overlay FEMA flood zones and record the zone",
            "Overlay RIDEM wetlands and note anything within 200 ft",
            "Note any public wells or reservoirs within 1,000 ft. The master plan location map must show them.",
            "Check whether the frontage road is a state road, which means RIDOT is involved",
          ],
        },
        {
          title: "Parking cap near transit",
          cond: "transit",
          note: "Applies within ¼ mile of a regional mobility hub or ⅛ mile of a frequent transit stop.",
          src: "ridsp", pin: "S 3303 / H 8005 Sub A (2026)", q: "no more than one off-street parking space per dwelling unit in a multi-family structure or development can be required",
          checklist: [
            "Measure the distance to the nearest frequent transit stop or mobility hub",
            "Cite the 2026 law in your parking calculation",
            "Decide whether to provide more than the minimum anyway, to head off parking objections",
          ],
        },
      ],
    },
    {
      id: "elig",
      title: "Eligibility and RIHousing letter",
      app: "Request for a letter of eligibility (or a subsidy award letter)",
      clock: { text: "RIHousing timeline" },
      what: "At least a quarter of the units must be low- or moderate-income housing. RIHousing confirms eligibility with a letter, which you file with the preliminary plan.",
      auth: [{ c: "rihousing", role: "Issues the letter of eligibility" }],
      docs: [
        {
          title: "Eligibility threshold",
          src: "s5304", pin: "§ 45-53-4", q: "This procedure is only available for proposals in which at least twenty-five percent (25%) of the housing",
          checklist: [
            "Affordable units are at least 25% of the total, rounded up",
            "Decide the income targets and whether units are for sale or for rent",
            "Make affordable units look the same as market units and spread them through the project",
          ],
        },
        {
          title: "Letter of eligibility",
          src: "s5304", pin: "§ 45-53-4", q: "A letter of eligibility issued by the Rhode Island housing and mortgage finance corporation",
          checklist: ["Prepare the project pro forma", "Name the monitoring agent", "Leave time for RIHousing's review"],
        },
        {
          title: "Density bonus (public sewer and water)",
          src: "s5304", pin: "§ 45-53-4", q: "shall be at least five (5) units per acre",
          checklist: ["Calculate the bonus density for your lot and affordability percentage", "Compare it with base R-3 density"],
        },
      ],
    },
    {
      id: "preapp",
      title: "Pre-application conference",
      app: "Pre-application submission",
      clock: { days: 30, text: "Town has 30 days to hold it" },
      what: "State law sets this stage. {town}'s own requirements for it have not been read yet, so confirm them with the planning office.",
      auth: [{ c: "planning", role: "Schedules the conference" }, { c: "pb", role: "Public meeting. No vote." }],
      docs: [],
    },
    {
      id: "prelim",
      title: "Preliminary plan (single application)",
      app: "Preliminary plan, RIHousing letter, list of requested adjustments, timetable",
      clock: { days: 115, text: "25 days to certify · 90 days to decide" },
      what: "The Planning Board acts as the local review board for every local approval at once, including density and dimensional adjustments, after a public hearing. If it misses the deadline, the plan is approved by default.",
      auth: [{ c: "pb", role: "Local review board. Grants the permit and any adjustments." }, { c: "trc", role: "Recommends" }],
      objections: ["renters", "parking", "traffic", "headlights", "stormwater"],
      docs: [
        {
          title: "RIHousing letter of eligibility",
          src: "s5304", pin: "§ 45-53-4", q: "A letter of eligibility issued by the Rhode Island housing and mortgage finance corporation",
          checklist: ["Attach the letter, or a subsidy award letter for HUD-funded projects"],
        },
        {
          title: "Ordinance provisions to adjust",
          note: "Haley's Commons sought adjustments for use, density, setbacks, lot coverage, height and parking setback.",
          src: "s5304", pin: "§ 45-53-4", q: "setting forth the specific sections and provisions of applicable local ordinances and regulations",
          checklist: [
            "A signed letter listing each section and the adjustment sought",
            "The reason each adjustment is needed to make the project viable",
            "Fallbacks if the board trims an adjustment",
          ],
        },
        {
          title: "Construction timetable",
          src: "s5304",
          pin: "§ 45-53-4",
          checklist: ["Start within 12 months of recording", "Complete within 60 months, or propose phasing"],
        },
        {
          title: "Decision deadline",
          src: "s5304", pin: "§ 45-53-4", q: "The local review board shall render a decision on the preliminary plan application within ninety (90) days",
          checklist: ["Note the certification date and day 90"],
        },
      ],
    },
    {
      id: "final",
      title: "Final plan",
      app: "Final plan, state permits, monitoring agreement, deed restriction",
      clock: { days: 45, text: "45 days to decide" },
      what: "Administrative unless the board asked to see it again. The affordability documents are added at this stage.",
      auth: [{ c: "planning", role: "Decides" }],
      docs: [
        {
          title: "Deed restriction or land lease",
          src: "s5304", pin: "§ 45-53-4", q: "A sample land lease or deed restriction with affordability liens",
          checklist: ["Draft the restriction with the income limits", "Ask the Town Solicitor to review it"],
        },
        {
          title: "Affordability term",
          src: "s5304", pin: "§ 45-53-4", q: "but for a period of not less than thirty (30) years",
          checklist: ["A term of at least 30 years, and check whether the town's ordinance sets a longer one"],
        },
        {
          title: "Draft monitoring agreement",
          note: "Names an approved monitoring entity",
          checklist: ["Name the monitoring agent", "Set the annual reporting obligations"],
        },
        {
          title: "All state and federal permits",
          note: "Required before final approval or a building permit",
          checklist: ["Copies of every issued permit", "The RIDOT permit or acceptance letter, if on a state road"],
        },
      ],
    },
    {
      id: "record",
      title: "Record, then start and finish on time",
      app: "Recorded decision and final plan",
      clock: { text: "Start within 12 months · finish within 60" },
      what: "Written decisions are recorded within 20 days. The permit expires if construction doesn't start and finish on time, unless the board and you agree on a longer or phased schedule.",
      auth: [{ c: "clerk", role: "Records the decision" }],
      docs: [
        {
          title: "Construction deadlines",
          src: "s5304", pin: "§ 45-53-4", q: "A comprehensive permit shall expire unless construction is started within twelve (12) months",
          checklist: ["Calendar the 12-month start date", "Calendar the 60-month completion date", "Ask for any phasing in writing"],
        },
      ],
    },
    {
      id: "appeal",
      title: "Appeal, if denied or challenged",
      branch: true,
      app: "Complaint to the Superior Court, filed within 20 days",
      clock: { days: 20, text: "20 days from recording and posting" },
      what: "You or an aggrieved neighbour can appeal the local review board's decision to the Superior Court (§ 45-53-5.1, since January 1, 2024). For you, 20 days is the deadline. For neighbours, it is a risk window, and lenders often wait for it to close.",
      auth: [
        { c: "court", role: "Hears the appeal on the record, without a jury" },
        { c: "zbr", role: "Board of Appeals for certain administrative actions" },
      ],
      docs: [
        {
          title: "Complaint stating the reasons for appeal",
          src: "s5351", pin: "§ 45-53-5.1(a)", q: "The appeal shall be taken within twenty (20) days after the date of the recording and posting of the decision by the local review board",
          checklist: [
            "Note the date the decision was recorded and posted, which starts the clock",
            "Get the transcript or minutes and every exhibit in the record",
            "Brief a land-use attorney right away. The window is short.",
            "Build your arguments on the record, because the court reviews it without new testimony",
          ],
        },
      ],
    },
    {
      id: "building",
      title: "Building permit and fire plan review",
      app: "Building permit application with construction documents",
      clock: { text: "Typically 4–10 weeks (estimate)" },
      what: "This step sits outside the planning process. The permit drawings must match the recorded plan and every condition attached to it.",
      auth: [
        { c: "building", role: "Issues the building permit under the RI State Building Code" },
        { c: "sfm", role: "Fire protection plan review (or the local fire marshal)" },
        { c: "dpw", role: "Sewer connection" },
        { c: "water", role: "Water service" },
      ],
      docs: [
        {
          title: "Building permit application with stamped construction documents",
          note: "Prepared by a RI-registered architect or engineer, and matching the recorded plan and its conditions.",
          checklist: [
            "Make sure the drawings match the recorded plan: footprint, height, units and parking",
            "List the conditions of approval on the cover sheet",
            "Include the energy code compliance documents",
            "Show the structural, mechanical, electrical and plumbing sheets, with each discipline's stamp",
            "Have the contractor's registration number ready",
          ],
        },
        {
          title: "Sprinkler and fire alarm plans for fire plan review",
          src: "sfm",
          pin: "Plan Review Unit",
          note: "Call to schedule a submission. Incomplete submissions are returned with a checklist.",
          checklist: [
            "Set the sprinkler design basis for multifamily residential occupancy",
            "Show the fire alarm and notification layout",
            "Show fire department access, hydrant locations and the turning template",
            "Size the water supply for the sprinkler demand",
            "Call to schedule the plan review appointment",
          ],
        },
        {
          title: "Utility connection applications",
          note: "Sewer through Public Works, water through the Water Department, electric through Rhode Island Energy.",
          checklist: [
            "Apply for the sewer connection and pay the fees",
            "Apply for water service, with meter sizing",
            "Apply for electric service with the load letter, early, because utility lead times can be long",
            "Coordinate the trench and road-opening permits",
          ],
        },
      ],
    },
    {
      id: "occupy",
      title: "Build, inspect and occupy",
      app: "Inspection requests and as-built drawings",
      clock: { text: "Construction period" },
      what: "Each unit needs a certificate of occupancy before anyone can live in it. Bonds for public improvements are released once the Town Council accepts the work.",
      auth: [
        { c: "building", role: "Inspects during construction, then issues the certificate of occupancy" },
        { c: "council", role: "Accepts dedicated streets and public improvements, which releases the bond" },
      ],
      docs: [
        {
          title: "Inspection requests and as-built drawings",
          note: "Utilities and drainage as built",
          checklist: [
            "Book inspections at each stage: footing, framing, insulation and final",
            "Have the surveyor record the as-built utility and drainage locations",
            "Get the fire marshal's final sign-off before you ask for the certificate of occupancy",
            "Finish the landscaping and screening the approval required, since inspectors check conditions",
          ],
        },
      ],
    },
  ],
};

const dpr: Tree = {
  id: "dpr",
  name: "Development plan review",
  rule: "Adaptive reuse or a permitted use without a land development review",
  status: "Partly sourced",
  blurb: "Site plan review against objective standards. Administrative review for a change of use. Formal review by the Planning Board for adaptive reuse or disturbance over 10,000 sq ft.",
  steps: [
    {
      id: "zoning",
      title: "Zoning and site check",
      app: "Site data package: plat and lot, zoning district, utilities, constraints",
      clock: { text: "Before filing" },
      what: "Confirm the parcel's zoning district, whether multi-household use is allowed, the density the lot supports, and which state permits the site will trigger. Site selection's lookup and the law check on the Check page cover this step.",
      authLabel: "Rules set by",
      auth: [
        { c: "council", role: "Adopts the zoning ordinance, the zoning map and the Comprehensive Plan" },
        { c: "ga", role: "Sets the enabling acts and the 9-unit minor threshold" },
      ],
      docs: [
        {
          title: "Parcel geometry from statewide GIS",
          note: "Statewide assessor parcel polygons. The backend joins this layer to the zoning, flood and wetlands layers.",
          src: "rigis",
          pin: "Tax_Parcels map service",
          checklist: [
            "Match the Assessor's Plat and Lot to the deed",
            "Overlay FEMA flood zones and record the zone",
            "Overlay RIDEM wetlands and note anything within 200 ft",
            "Note any public wells or reservoirs within 1,000 ft. The master plan location map must show them.",
            "Check whether the frontage road is a state road, which means RIDOT is involved",
          ],
        },
        {
          title: "Parking cap near transit",
          cond: "transit",
          note: "Applies within ¼ mile of a regional mobility hub or ⅛ mile of a frequent transit stop.",
          src: "ridsp", pin: "S 3303 / H 8005 Sub A (2026)", q: "no more than one off-street parking space per dwelling unit in a multi-family structure or development can be required",
          checklist: [
            "Measure the distance to the nearest frequent transit stop or mobility hub",
            "Cite the 2026 law in your parking calculation",
            "Decide whether to provide more than the minimum anyway, to head off parking objections",
          ],
        },
      ],
    },
    {
      id: "prelim",
      title: "Formal review: preliminary stage",
      app: "Development plan review application",
      clock: { days: 80, text: "15 days to certify · 65 to decide (a figure read from Cumberland's regulations; confirm this town's)" },
      what: "The Planning Board reviews against objective standards. A plain change of use with no extensive construction goes to the Administrative Officer instead, in a single stage.",
      auth: [
        { c: "pb", role: "Permitting authority for formal review" },
        { c: "planning", role: "Permitting authority for administrative review" },
      ],
      objections: ["parking", "lighting", "trash"],
      docs: [
        {
          title: "State law basis",
          src: "s2449",
          pin: "§ 45-24-49",
          note: "Applies to uses permitted by right, reviewed against specific and objective guidelines",
          checklist: ["Find the objective standards in the ordinance and show compliance with each one"],
        },
      ],
    },
    {
      id: "final",
      title: "Formal review: final stage",
      app: "Final development plan",
      clock: { days: 25, text: "25 days (a figure read from Cumberland's regulations; confirm this town's)" },
      what: "Approval expires unless you get every building permit within a year.",
      auth: [{ c: "planning", role: "Administrative Officer" }],
      docs: [],
    },
    {
      id: "appeal",
      title: "Appeal, if denied or challenged",
      branch: true,
      app: "Complaint to the Superior Court, filed within 20 days",
      clock: { days: 20, text: "20 days from recording and posting" },
      what: "You or an aggrieved neighbour can appeal a Planning Board or Administrative Officer decision. For you, 20 days is the deadline. For neighbours, it is a risk window, and lenders often wait for it to close.",
      auth: [
        { c: "court", role: "Hears the appeal on the record, without a jury" },
        { c: "zbr", role: "Board of Appeals for certain administrative actions" },
      ],
      docs: [
        {
          title: "Complaint stating the reasons for appeal",
          src: "s3971", pin: "§ 45-23-71(a)", q: "within twenty (20) days after the decision has been recorded and posted in the office of the city or town clerk",
          checklist: [
            "Note the date the decision was recorded and posted, which starts the clock",
            "Get the transcript or minutes and every exhibit in the record",
            "Brief a land-use attorney right away. The window is short.",
            "Build your arguments on the record, because the court reviews it without new testimony",
          ],
        },
      ],
    },
    {
      id: "building",
      title: "Building permit and fire plan review",
      app: "Building permit application with construction documents",
      clock: { text: "Typically 4–10 weeks (estimate)" },
      what: "This step sits outside the planning process. The permit drawings must match the recorded plan and every condition attached to it.",
      auth: [
        { c: "building", role: "Issues the building permit under the RI State Building Code" },
        { c: "sfm", role: "Fire protection plan review (or the local fire marshal)" },
        { c: "dpw", role: "Sewer connection" },
        { c: "water", role: "Water service" },
      ],
      docs: [
        {
          title: "Building permit application with stamped construction documents",
          note: "Prepared by a RI-registered architect or engineer, and matching the recorded plan and its conditions.",
          checklist: [
            "Make sure the drawings match the recorded plan: footprint, height, units and parking",
            "List the conditions of approval on the cover sheet",
            "Include the energy code compliance documents",
            "Show the structural, mechanical, electrical and plumbing sheets, with each discipline's stamp",
            "Have the contractor's registration number ready",
          ],
        },
        {
          title: "Sprinkler and fire alarm plans for fire plan review",
          src: "sfm",
          pin: "Plan Review Unit",
          note: "Call to schedule a submission. Incomplete submissions are returned with a checklist.",
          checklist: [
            "Set the sprinkler design basis for multifamily residential occupancy",
            "Show the fire alarm and notification layout",
            "Show fire department access, hydrant locations and the turning template",
            "Size the water supply for the sprinkler demand",
            "Call to schedule the plan review appointment",
          ],
        },
        {
          title: "Utility connection applications",
          note: "Sewer through Public Works, water through the Water Department, electric through Rhode Island Energy.",
          checklist: [
            "Apply for the sewer connection and pay the fees",
            "Apply for water service, with meter sizing",
            "Apply for electric service with the load letter, early, because utility lead times can be long",
            "Coordinate the trench and road-opening permits",
          ],
        },
      ],
    },
    {
      id: "occupy",
      title: "Build, inspect and occupy",
      app: "Inspection requests and as-built drawings",
      clock: { text: "Construction period" },
      what: "Each unit needs a certificate of occupancy before anyone can live in it.",
      auth: [{ c: "building", role: "Inspects during construction, then issues the certificate of occupancy" }],
      docs: [
        {
          title: "Inspection requests and as-built drawings",
          note: "Utilities and drainage as built",
          checklist: [
            "Book inspections at each stage: footing, framing, insulation and final",
            "Have the surveyor record the as-built utility and drainage locations",
            "Get the fire marshal's final sign-off before you ask for the certificate of occupancy",
            "Finish the landscaping and screening the approval required, since inspectors check conditions",
          ],
        },
      ],
    },
  ],
};

const byright: Tree = {
  id: "byright",
  name: "Building permit only",
  rule: "1 or 2 units on an existing conforming lot",
  status: "Outline. Sources still to be added.",
  blurb: "No land development review. The zoning check is followed by a building permit, utility connections and a certificate of occupancy.",
  steps: [
    {
      id: "zoning",
      title: "Zoning and site check",
      app: "Site data package: plat and lot, zoning district, utilities, constraints",
      clock: { text: "Before filing" },
      what: "Confirm the parcel's zoning district, whether multi-household use is allowed, the density the lot supports, and which state permits the site will trigger. Site selection's lookup and the law check on the Check page cover this step.",
      authLabel: "Rules set by",
      auth: [
        { c: "council", role: "Adopts the zoning ordinance, the zoning map and the Comprehensive Plan" },
        { c: "ga", role: "Sets the enabling acts and the 9-unit minor threshold" },
      ],
      docs: [
        {
          title: "Parcel geometry from statewide GIS",
          note: "Statewide assessor parcel polygons. The backend joins this layer to the zoning, flood and wetlands layers.",
          src: "rigis",
          pin: "Tax_Parcels map service",
          checklist: [
            "Match the Assessor's Plat and Lot to the deed",
            "Overlay FEMA flood zones and record the zone",
            "Overlay RIDEM wetlands and note anything within 200 ft",
            "Note any public wells or reservoirs within 1,000 ft. The master plan location map must show them.",
            "Check whether the frontage road is a state road, which means RIDOT is involved",
          ],
        },
        {
          title: "Parking cap near transit",
          cond: "transit",
          note: "Applies within ¼ mile of a regional mobility hub or ⅛ mile of a frequent transit stop.",
          src: "ridsp", pin: "S 3303 / H 8005 Sub A (2026)", q: "no more than one off-street parking space per dwelling unit in a multi-family structure or development can be required",
          checklist: [
            "Measure the distance to the nearest frequent transit stop or mobility hub",
            "Cite the 2026 law in your parking calculation",
            "Decide whether to provide more than the minimum anyway, to head off parking objections",
          ],
        },
      ],
    },
    {
      id: "zcheck",
      title: "Zoning compliance",
      app: "Plot plan showing setbacks, coverage and parking",
      clock: { text: "Part of the permit review" },
      what: "The zoning official checks the use and dimensions. A dimensional variance means going to the Zoning Board of Review. In March 2026, two single-unit projects did so after a Planning Board recommendation.",
      auth: [{ c: "building", role: "Zoning and building review" }, { c: "zbr", role: "Only if a variance is needed", cond: "relief" }],
      docs: [
        {
          title: "Plot plan",
          note: "Drawn to scale from a survey",
          checklist: ["Setbacks to every lot line", "Lot coverage", "Driveway and parking", "Accessory structures"],
        },
      ],
    },
    {
      id: "building",
      title: "Building permit",
      app: "Building permit application with construction documents",
      clock: { text: "Typically 4–10 weeks (estimate)" },
      what: "This step sits outside the planning process. The permit drawings must match the recorded plan and every condition attached to it.",
      auth: [
        { c: "building", role: "Issues the building permit under the RI State Building Code" },
        { c: "dpw", role: "Sewer connection" },
        { c: "water", role: "Water service" },
      ],
      docs: [
        {
          title: "Building permit application with stamped construction documents",
          note: "Prepared by a RI-registered architect or engineer, and matching the recorded plan and its conditions.",
          checklist: [
            "Make sure the drawings match the recorded plan: footprint, height, units and parking",
            "List the conditions of approval on the cover sheet",
            "Include the energy code compliance documents",
            "Show the structural, mechanical, electrical and plumbing sheets, with each discipline's stamp",
            "Have the contractor's registration number ready",
          ],
        },
        {
          title: "Utility connection applications",
          note: "Sewer through Public Works, water through the Water Department, electric through Rhode Island Energy.",
          checklist: [
            "Apply for the sewer connection and pay the fees",
            "Apply for water service, with meter sizing",
            "Apply for electric service with the load letter, early, because utility lead times can be long",
            "Coordinate the trench and road-opening permits",
          ],
        },
      ],
    },
    {
      id: "occupy",
      title: "Build, inspect and occupy",
      app: "Inspection requests and as-built drawings",
      clock: { text: "Construction period" },
      what: "Each unit needs a certificate of occupancy before anyone can live in it.",
      auth: [{ c: "building", role: "Inspects during construction, then issues the certificate of occupancy" }],
      docs: [
        {
          title: "Inspection requests and as-built drawings",
          note: "Utilities and drainage as built",
          checklist: [
            "Book inspections at each stage: footing, framing, insulation and final",
            "Have the surveyor record the as-built utility and drainage locations",
            "Get the fire marshal's final sign-off before you ask for the certificate of occupancy",
            "Finish the landscaping and screening the approval required, since inspectors check conditions",
          ],
        },
      ],
    },
  ],
};

export const TREES: Record<TreeId, Tree> = { major, minor, comp, dpr, byright };
export const TREE_ORDER: TreeId[] = ["major", "minor", "comp", "dpr", "byright"];
