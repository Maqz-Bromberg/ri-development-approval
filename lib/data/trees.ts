import type { Step, Tree, TreeId } from "../types";

/*
 * Approval trees, one per development type. In production these are served by the backend
 * per municipality; this file holds the Cumberland, RI pilot.
 * Every requirement carries a source id + pinpoint + verbatim quote where one was read.
 * Every document carries a checklist of practical considerations (guidance, not law).
 */

/* ---------- Steps shared across trees ---------- */

function stepZoning(): Step {
  return {
    id: "zoning", title: "Zoning and site check", app: "Site data package: plat and lot, zoning district, utilities, constraints",
    clock: { text: "Before filing" },
    what: "Confirm the parcel's zoning district, whether multi-household use is allowed, the density the lot supports, and which state permits the site will trigger. The GIS lookup and the law check on the project page cover this step.",
    auth: [
      { c: "council", role: "Adopts the zoning ordinance, the zoning map and the Comprehensive Plan" },
      { c: "ga", role: "Sets the enabling acts and the 9-unit minor threshold" },
    ],
    docs: [
      {
        title: "Zoning district and permitted use", src: "cz3", pin: "Art. 3, § 3-1(c)",
        q: "R-3: Multi-Household Dwelling District. This zoning district is intended for high density residential areas",
        checklist: [
          "Pull the zoning district from the official zoning map, not a third-party site, and save a dated screenshot",
          "Check whether the parcel is split between two districts",
          "Look for overlay districts such as flood hazard or historic, and for conservation development options",
          "Confirm the use table allows multi-household dwellings in this district",
          "Note any pending zoning amendments on recent Town Council or Planning Board agendas",
        ],
      },
      {
        title: "Lot area per dwelling unit", src: "cz3", pin: "Art. 3",
        q: "10,000 square feet minimum lot size for the first unit plus 5,000 square feet for each additional unit.",
        checklist: [
          "Use the surveyed lot area, not the assessor's figure",
          "Confirm both public water and public sewer are available at the lot line. The density changes if either is missing.",
          "Subtract any area the ordinance excludes from buildable area, such as wetlands or steep slopes",
          "Run the formula for your unit count and keep the margin on file",
          "Check frontage, setbacks, height and lot coverage, as well as density",
        ],
      },
      {
        title: "Inclusionary zoning status", note: "There is no mandatory affordable set-aside. Confirm against the current ordinance.", src: "cz15", pin: "§ 15-12", q: "(Reserved)",
        checklist: [
          "Confirm with Planning staff that § 15-12 is still reserved",
          "Decide early whether 25% affordable, which opens the comprehensive permit route, is worth modelling",
          "Check whether any density bonus applies to your project",
        ],
      },
      {
        title: "Parcel geometry from statewide GIS", note: "Statewide assessor parcel polygons. The backend joins this layer to the zoning, flood and wetlands layers.", src: "rigis", pin: "Tax_Parcels map service",
        checklist: [
          "Match the Assessor's Plat and Lot to the deed",
          "Overlay FEMA flood zones and record the zone",
          "Overlay RIDEM wetlands and note anything within 200 ft",
          "Note any public wells or reservoirs within 1,000 ft. The master plan location map must show them.",
          "Check whether the frontage road is a state road, which means RIDOT is involved",
        ],
      },
      {
        title: "Parking cap near transit", cond: "transit", note: "Applies within ¼ mile of a regional mobility hub or ⅛ mile of a frequent transit stop.",
        src: "ridsp", pin: "S 3303 / H 8005 Sub A (2026)", q: "no more than one off-street parking space per dwelling unit in a multi-family structure or development can be required",
        checklist: [
          "Measure the distance to the nearest frequent transit stop or mobility hub",
          "Cite the 2026 law in your parking calculation",
          "Decide whether to provide more than the minimum anyway, to head off parking objections",
        ],
      },
    ],
  };
}

function stepRezone(): Step {
  return {
    id: "rezone", title: "Zone change petition", cond: "rezone", branch: true,
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
        title: "Petition to amend the zoning map", note: "Ask Planning staff for the current form and fee.",
        checklist: [
          "Name every parcel by Assessor's Plat and Lot, with all owners signing",
          "State the current and proposed district",
          "Attach a radius map and abutter list",
          "Explain why the proposed district fits the Comprehensive Plan's future land use map",
          "Meet the ward councillor and abutters before the hearing",
        ],
      },
      {
        title: "Planning Board recommendation to the Town Council", note: "Example: on March 26, 2026 the Board heard a Town Council recommendation on Ordinance 2026-03.",
        src: "pb260326", pin: "Item 8", q: "Amending Zoning Ordinance of the Town of Cumberland, Rhode Island, as amended.",
        checklist: [
          "Find the Planning Board date the referral will be heard",
          "Prepare a short presentation on consistency with the Comprehensive Plan",
          "Bring housing-need figures from the Comprehensive Plan's housing element",
        ],
      },
      {
        title: "Who the governing body is", src: "cregs", pin: "§ 2-A, Governing body", q: "The Cumberland Town Council is the governing body in the Town of Cumberland.",
        checklist: [
          "Read recent Council minutes on similar zone changes to see how members voted and why",
          "Line up supporters to speak at the Council hearing",
        ],
      },
    ],
  };
}

function stepRecord(years: string, src: string, pin: string, q: string): Step {
  return {
    id: "record", title: "Sign and record the approved plan", app: "Recordable final plan, plus any deeds and condominium documents",
    clock: { text: `Within ${years} of final approval` },
    what: "The approved plan is signed and recorded in the Land Evidence Records. Recording the decision and posting it at the Town Clerk's office starts the 20-day appeal window. Once recorded, any street shown is accepted for dedication, but the town takes on maintenance only when the Town Council accepts the finished work.",
    auth: [
      { c: "clerk", role: "Records the plan and posts the decision" },
      { c: "planning", role: "Signs the plan and notifies the E-911 authority of new addresses" },
    ],
    docs: [
      {
        title: "Recordable final plan", src, pin, q,
        checklist: [
          "Prepare a recordable plan in the size and medium the Town Clerk accepts",
          "Get every required signature block signed",
          "Note all conditions of approval on the plan",
          "Pay the recording fees",
          "Put the recording deadline in your calendar, with a reminder before it",
        ],
      },
      {
        title: "Condominium declaration and plats", cond: "always", when: "If units are sold", note: "Under the RI Condominium Act. Not part of the planning approval.",
        checklist: [
          "Prepare the declaration, plats and plans to record together",
          "Make sure unit boundaries match the approved plans",
          "Write the affordability deed restrictions into the declaration if any units are affordable",
        ],
      },
    ],
  };
}

function stepAppeal(): Step {
  return {
    id: "appeal", title: "Appeal, if denied or challenged", branch: true, app: "Complaint to the Superior Court, filed within 20 days",
    clock: { days: 20, text: "20 days from recording and posting" },
    what: "You or an aggrieved neighbour can appeal a Planning Board or Administrative Officer decision. For you, 20 days is the deadline. For neighbours, it is a risk window, and lenders often wait for it to close.",
    auth: [
      { c: "court", role: "Hears the appeal on the record, without a jury" },
      { c: "zbr", role: "Board of Appeals for certain administrative actions" },
    ],
    docs: [
      {
        title: "Complaint stating the reasons for appeal", src: "s3971", pin: "§ 45-23-71(a)", q: "within twenty (20) days after the decision has been recorded and posted in the office of the city or town clerk",
        checklist: [
          "Note the date the decision was recorded and posted, which starts the clock",
          "Get the transcript or minutes and every exhibit in the record",
          "Brief a land-use attorney right away. The window is short.",
          "Build your arguments on the record, because the court reviews it without new testimony",
        ],
      },
      {
        title: "Local appeal routing", src: "cregs", pin: "§ 3-M(1)", q: "Decisions by the Administrative Officer approving or denying projects shall not be subject to this section and shall proceed directly to superior court",
        checklist: [
          "Check whether the decision was made by the Administrative Officer or the Planning Board",
          "Confirm whether any local Board of Appeals step comes first",
        ],
      },
    ],
  };
}

function stepBuilding(fire: boolean): Step {
  const auth = [{ c: "building", role: "Issues the building permit under the RI State Building Code" }];
  if (fire) auth.push({ c: "sfm", role: "Fire protection plan review (or the local fire marshal)" });
  auth.push({ c: "dpw", role: "Sewer connection" }, { c: "water", role: "Water service" });
  const docs: Step["docs"] = [
    {
      title: "Building permit application with stamped construction documents", note: "Prepared by a RI-registered architect or engineer, and matching the recorded plan and its conditions.",
      checklist: [
        "Make sure the drawings match the recorded plan: footprint, height, units and parking",
        "List the conditions of approval on the cover sheet",
        "Include the energy code compliance documents",
        "Show the structural, mechanical, electrical and plumbing sheets, with each discipline's stamp",
        "Have the contractor's registration number ready",
      ],
    },
    {
      title: "Utility connection applications", note: "Sewer through Public Works, water through the Water Department, electric through Rhode Island Energy.",
      checklist: [
        "Apply for the sewer connection and pay the fees",
        "Apply for water service, with meter sizing",
        "Apply for electric service with the load letter, early, because utility lead times can be long",
        "Coordinate the trench and road-opening permits",
      ],
    },
    {
      title: "RIDOT Physical Alteration Permit", cond: "dot", src: "cregs", pin: "§ 5-GH(2)(a)(3)", q: "such actual permit shall be required prior to the issuance of a building permit",
      checklist: [
        "Have the issued permit in hand, not only the letter",
        "Post the bond and insurance certificates",
        "Lock in the traffic control plan for the curb cut work",
      ],
    },
  ];
  if (fire) {
    docs.splice(1, 0, {
      title: "Sprinkler and fire alarm plans for fire plan review", src: "sfm", pin: "Plan Review Unit",
      note: "Call to schedule a submission. Incomplete submissions are returned with a checklist.",
      checklist: [
        "Set the sprinkler design basis for multifamily residential occupancy",
        "Show the fire alarm and notification layout",
        "Show fire department access, hydrant locations and the turning template",
        "Size the water supply for the sprinkler demand",
        "Call to schedule the plan review appointment",
      ],
    });
  }
  return {
    id: "building", title: fire ? "Building permit and fire plan review" : "Building permit",
    app: "Building permit application with construction documents",
    clock: { text: "Typically 4–10 weeks (estimate)" },
    what: "This step sits outside the planning process. The permit drawings must match the recorded plan and every condition attached to it.",
    auth, docs,
  };
}

function stepOccupy(improvements: boolean): Step {
  const auth = [{ c: "building", role: "Inspects during construction, then issues the certificate of occupancy" }];
  if (improvements) auth.push({ c: "council", role: "Accepts dedicated streets and public improvements, which releases the bond" });
  const docs: Step["docs"] = [
    {
      title: "Inspection requests and as-built drawings", note: "Utilities and drainage as built",
      checklist: [
        "Book inspections at each stage: footing, framing, insulation and final",
        "Have the surveyor record the as-built utility and drainage locations",
        "Get the fire marshal's final sign-off before you ask for the certificate of occupancy",
        "Finish the landscaping and screening the approval required, since inspectors check conditions",
      ],
    },
  ];
  if (improvements) {
    docs.push({
      title: "Request for release of the improvement guarantee", src: "cregs", pin: "§ 5-GH(3)(f)",
      q: "until the Town Council accepts the completed public improvements as constructed in compliance with the Final Plans",
      checklist: [
        "Have the Town Engineer inspect the public improvements",
        "Provide as-built plans of the dedicated improvements",
        "Ask for the item on the Town Council agenda for acceptance",
        "Post a maintenance guarantee if one is required",
      ],
    });
  }
  return {
    id: "occupy", title: "Build, inspect and occupy", app: "Inspection requests and as-built drawings",
    clock: { text: "Construction period" },
    what: "Each unit needs a certificate of occupancy before anyone can live in it." + (improvements ? " Bonds for public improvements are released once the Town Council accepts the work." : ""),
    auth, docs,
  };
}

/* ---------- Trees ---------- */

const major: Tree = {
  id: "major", name: "Major land development", rule: "10 or more multifamily units", status: "Fully sourced",
  blurb: "Pre-application meeting, then master, preliminary and final plans. Each Planning Board stage has public notice.",
  steps: [
    stepZoning(),
    stepRezone(),
    {
      id: "preapp", title: "Pre-application meeting", app: "Pre-application submission (Appendix C checklist)",
      clock: { days: 60, text: "15 days to certify · meeting within 45" },
      what: "Required for every major project. Staff, and state agencies where relevant, explain the steps and the rules that apply. You can also ask the Planning Board for an informal concept review. The advice is guidance, not approval.",
      auth: [
        { c: "planning", role: "Certifies the submission and runs the meeting" },
        { c: "pb", role: "Optional informal concept review" },
      ],
      docs: [
        {
          title: "Pre-application submission", src: "cregs", pin: "§ 5-DE", q: "One or more pre-application meetings shall be held for all Major Land Development or Subdivision applications.",
          checklist: [
            "Fill in the pre-application items on the Appendix C checklist",
            "Write a short project narrative: units, bedroom mix, parking and utilities",
            "List the questions you want answered, such as relief, stages and state permits",
            "Decide whether to ask for an informal concept review by the Planning Board",
          ],
        },
        {
          title: "Completeness review", src: "cregs", pin: "§ 5-DE", q: "The Administrative Officer shall have 15 days to certify that a Pre-application Submission is complete or incomplete.",
          checklist: [
            "Note the filing date and the 15-day certification date",
            "Note day 60: if no meeting has been scheduled by then, you may file the master plan anyway",
          ],
        },
        {
          title: "Concept site plan and building massing", note: "Enough to discuss layout, access, utilities and the relief you may need",
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
      id: "master", title: "Master plan", app: "Master plan application, fee, plan sets and abutter labels",
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
          title: "Application cover sheet, fee and plan sets", src: "cregs", pin: "App. C(C)", q: "Sufficient number of plan copies (generally, 20)",
          checklist: [
            "Get the owner's signature, or a notarized authorization if the applicant is not the owner",
            "Ask Planning for the current fee schedule and pay the fee",
            "Bring about 20 plan sets, or ask whether digital copies are accepted",
            "Put the project name, submission type and stage on every sheet",
            "Get the stamp and registration number of a RI engineer or land surveyor",
            "Use a scale of 1\" = 80' or larger, with a graphic scale and north arrow",
          ],
        },
        {
          title: "Location map", src: "cregs", pin: "App. C(C)", q: "A location map showing the physical relationship of the proposed project to the area within a radius of 1/2 mile.",
          checklist: [
            "Use a USGS or similar base map",
            "Show brooks, streams, ponds and wetlands within 1,000 ft",
            "Show public drinking water reservoirs and public wells within 1,000 ft",
          ],
        },
        {
          title: "Neighbourhood impact analysis", src: "cregs", pin: "App. C(C)", q: "Analysis of potential neighborhood/district impacts",
          checklist: [
            "Estimate traffic: daily and peak-hour trips for the unit count",
            "Describe the effect on views, light and privacy for each abutter",
            "Cover noise, lighting and headlight sweep at the property lines",
            "Compare the building's scale with nearby buildings, using photos",
            "Estimate the effect on schools and town services if you expect it to come up",
          ],
        },
        {
          title: "RIDEM wetland edge verification", src: "cregs", pin: "App. C(C)", q: "Verification of wetland edge by the RI DEM (if no wetlands on property, state on plan)",
          checklist: [
            "Have a wetland biologist flag the edge",
            "Get the RIDEM verification, or state on the plan that there are no wetlands",
            "Show the regulated buffer areas on the plan",
          ],
        },
        {
          title: "Buildable area and constraints plan", src: "cregs", pin: "App. C(C)", q: "Analysis of buildable lot area.",
          checklist: [
            "Map each constraint with its area in square feet",
            "Show the estimated limit of disturbance",
            "Show the approximate topography and existing structures",
          ],
        },
        {
          title: "Abutter list on mailing labels, with notice paid by you", note: "Notice area: 200 ft from the perimeter. Certified mail plus a newspaper notice.",
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
          title: "Unified development review request", cond: "relief", note: "Lists every variance or special use permit. The Planning Board decides relief before the plan.",
          src: "s3950", pin: "§ 45-23-50.1", q: "Public notice shall indicate that dimensional variance(s), use variance(s), and/or special-use permit(s)",
          checklist: [
            "List each ordinance section, what it requires and what you propose",
            "Write the hardship or special-use standards argument for each item",
            "Make sure the notice wording names every form of relief",
            "Show that each item of relief is the least needed",
          ],
        },
        {
          title: "Decision deadline", src: "s3939", pin: "§ 45-23-39(c)(5)", q: "The planning board shall, within ninety (90) days of certification of completeness",
          checklist: [
            "Note the certification date and day 90",
            "Agree any extension in writing only",
            "If day 90 passes without a decision, ask the Administrative Officer for a certificate of approval",
          ],
        },
        {
          title: "Vesting", src: "s3939", pin: "§ 45-23-39(c)(7)(i)", q: "The approved master plan is vested for a period of two (2) years, with the right to extend for two (2), one-year extensions",
          checklist: [
            "Note the 2-year vesting expiry",
            "Plan the dates for the preliminary plan submission",
            "Ask for any extension in writing before it expires",
          ],
        },
      ],
    },
    {
      id: "state", title: "State permits and utility sign-offs", app: "State permit applications and requests for town water and sewer letters",
      clock: { text: "Runs in parallel, on each agency's timeline" },
      what: "Cumberland's regulations require every state and federal permit before preliminary approval. State law, as amended in 2026, sets the timing of permits at the final review stages. Confirm with staff which applies. Until permits are in, the decision clock is extended.",
      auth: [
        { c: "water", role: "Water service confirmation" },
        { c: "dpw", role: "Sewer service confirmation" },
        { c: "ridem", role: "Wetlands and stormwater permits", cond: "wet|acre" },
        { c: "ridot", role: "Physical Alteration Permit for the curb cut", cond: "dot" },
      ],
      docs: [
        {
          title: "Local rule on state permits", src: "cregs", pin: "§ 5-GH(2)(a)(3)", q: "Prior to the approval of the preliminary plan, an applicant must submit all permits required by state or federal agencies",
          checklist: [
            "List every state or federal permit the site triggers",
            "Ask staff whether the local timing (before preliminary) or the 2026 state timing (final) applies",
            "Track each permit's application date and expected decision",
          ],
        },
        {
          title: "Water service confirmation", src: "cregs", pin: "App. C(A)", q: "written confirmation from the Cumberland Water Department that the proposed water service is acceptable",
          checklist: [
            "Send the domestic and fire flow demand",
            "Get a hydrant flow test if needed for sprinkler design",
            "Ask for a written letter, because a verbal OK doesn't count",
          ],
        },
        {
          title: "Sewer service confirmation", src: "cregs", pin: "App. C(A)", q: "written confirmation from the Cumberland Public Works Department that the sewer service is acceptable",
          checklist: [
            "Send the design flow for the unit count",
            "Find the connection point and its invert elevations",
            "Ask for a written letter from Public Works",
          ],
        },
        {
          title: "RIDEM freshwater wetlands determination or permit", cond: "wet", src: "cregs", pin: "App. C(A)",
          q: "a written determination from RI DEM is necessary documenting either that the Wetlands Act does not apply",
          checklist: [
            "Delineate the wetland and confirm the edge",
            "Ask RIDEM whether the project falls outside its jurisdiction, or apply for the permit",
            "Submit RIDEM-stamped plans and conditions to the town",
          ],
        },
        {
          title: "RIPDES construction stormwater permit", cond: "acre", note: "Required when 1 acre or more is disturbed. File with RIDEM.",
          checklist: [
            "Confirm the disturbed area is 1 acre or more",
            "Prepare the stormwater pollution prevention plan",
            "Plan for inspection and maintenance during construction",
          ],
        },
        {
          title: "RIDOT Physical Alteration Permit, or a letter that it will issue", cond: "dot", src: "cregs", pin: "§ 5-GH(2)(a)(3)",
          q: "a letter evidencing the issuance of such permit upon the submission of a bond and insurance is sufficient",
          checklist: [
            "Show the curb cut plan with its sight distances",
            "Show the drainage tie-ins to the state system",
            "Get the RIDOT acceptance letter for the preliminary plan",
            "Prepare the bond and insurance for the actual permit",
          ],
        },
      ],
    },
    {
      id: "prelim", title: "Preliminary plan", app: "Engineered preliminary plan set and supporting reports",
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
          title: "Engineered plans at 1\" = 40'", src: "cregs", pin: "App. C(A)", q: "Plan scale shall be no smaller than 1 inch equals 40 feet",
          checklist: [
            "Grading, with 2-ft contours where the grade changes",
            "Existing and proposed water, sewer and drainage, with structure sizing",
            "Curb lines, driveway openings and internal circulation",
            "Private wells within 200 ft and public wells within 800 ft",
            "Computation of impervious lot coverage",
            "Permanent monuments",
          ],
        },
        {
          title: "Soil erosion and sediment control plan", src: "cregs", pin: "App. C(A)", q: "A soil erosion and sedimentation control plan and landscaping plan showing all significant clearing of land and revegetation.",
          checklist: [
            "Construction entrance and silt fence or sock locations",
            "A protection plan for stockpiles",
            "Phasing of the clearing",
            "Revegetation and stabilization dates",
          ],
        },
        {
          title: "Landscape plan", src: "cregs", pin: "App. C(A)", q: "A landscape plan prepared by a RI registered Landscape Architect",
          checklist: [
            "Existing tree cover, and individual trees of 16 in. diameter or more within 50 ft of the right-of-way",
            "Evergreen screening where the driveway or parking faces abutters' windows",
            "Plant heights at planting and at maturity",
            "Fence type and height along shared property lines",
            "Who maintains the plantings, and how replacements are guaranteed",
          ],
        },
        {
          title: "Parking computations", src: "cregs", pin: "App. C(A)",
          q: "Numbers and dimensions of existing and proposed parking and handicapped parking spaces, including parking computations and supporting data.",
          checklist: [
            "Required spaces against provided spaces, by ordinance section",
            "Accessible spaces and the accessible route",
            "Visitor parking",
            "Snow storage that doesn't use up parking spaces",
            "The 2026 one-space cap, if near transit",
          ],
        },
        {
          title: "Police traffic officer advisory report", src: "cregs", pin: "App. C(A)",
          q: "An advisory report from the Cumberland Police Traffic Officer as to the need for and the location of traffic controls.",
          checklist: [
            "Ask for the report early through Planning",
            "Give the officer the trip estimate and the sight-distance plan",
            "Fold the officer's recommendations into the plans",
          ],
        },
        {
          title: "Street lighting plan", src: "cregs", pin: "App. C(A)", q: "A street lighting plan",
          checklist: [
            "Fixture locations, mounting heights and style",
            "A photometric grid in foot-candles, drawn to scale",
            "Full cut-off fixtures, with zero light spill at the abutters' lines",
            "Timers or dusk-to-dawn controls",
          ],
        },
        {
          title: "Improvement guarantee and construction schedule", src: "cregs", pin: "§ 5-GH(2)(e)",
          q: "Proposed arrangements for completion of the required public improvements, including construction schedule and/or financial guarantees shall be reviewed and approved by the Planning Board",
          checklist: [
            "Engineer's cost estimate for the public improvements",
            "Bond form: surety bond, cash or letter of credit",
            "Construction phasing schedule",
            "Ask the Town Solicitor to review the bond form",
          ],
        },
        {
          title: "Changes to relief granted at master plan", cond: "relief", note: "Include them with the preliminary application",
          checklist: [
            "List any relief that changed since master plan",
            "Explain why each change is needed",
          ],
        },
        {
          title: "Abutter notice", src: "s3939", pin: "§ 45-23-39(d)(4)", q: "Prior to the first planning board meeting on the preliminary plan, public notice shall be sent to abutters only",
          checklist: [
            "Mail notice at least 14 days before the first meeting",
            "Keep the mailing receipts",
            "Bring the answers to objections raised at the master plan hearing",
          ],
        },
      ],
    },
    {
      id: "final", title: "Final plan", app: "Final plan set, legal documents, bond and tax certification",
      clock: { days: 60, text: "15 days to certify (25 if changed) · 45 days to decide" },
      what: "Mostly administrative. If the Administrative Officer certifies the plan complete and the board did not ask to see it again, the plan is approved. Missing the 45-day deadline also counts as approval.",
      auth: [
        { c: "planning", role: "Administrative Officer decides, or refers the plan to the Planning Board" },
        { c: "clerk", role: "Tax certification and the record" },
      ],
      docs: [
        {
          title: "Plan sets showing every required change", src: "cregs", pin: "App. C(B)", q: "Sufficient number of plan copies (generally, 15)",
          checklist: [
            "Every change the board directed at earlier stages",
            "Conditions of approval, waivers and variances noted on the plan",
            "The approved construction phasing plan",
          ],
        },
        {
          title: "Municipal lien certificate", src: "s3939", pin: "§ 45-23-39(e)(1)(iii)", q: "Certification by the tax collector that all property taxes are current.",
          checklist: [
            "Order it from the Tax Collector",
            "Make sure it is dated close to the submission date",
          ],
        },
        {
          title: "Deeds and legal documents", src: "cregs", pin: "App. C(B)",
          q: "Quitclaim deed conveying all street ROWs and other legal documents such as deed restrictions, protective covenants, easements",
          checklist: [
            "Quitclaim deeds for anything to be dedicated",
            "Drainage and utility easements",
            "Deed restrictions and covenants",
            "Town Solicitor review",
          ],
        },
        {
          title: "Engineer's 100-year storm certification", src: "cregs", pin: "App. C(B)",
          q: "Written certification by a registered professional engineer that all drainage structures and facilities will accommodate a 100-year frequency rainfall event",
          checklist: [
            "The certification signed and stamped",
            "Drainage calculations that match the final plan",
          ],
        },
        {
          title: "Title attorney's wetlands certification", src: "cregs", pin: "App. C(B)",
          q: "Certification by a Title Attorney or comparable legal professional that no Notice of Violation of the Wetlands Act is on file",
          checklist: [
            "Order a title search of the Land Evidence Records",
            "Get the signed certification",
          ],
        },
        {
          title: "CAD files, georeferenced to NAD83 RI State Plane", src: "cregs", pin: "App. C(B)", note: "DXF format preferred",
          checklist: [
            "DXF export with coordinates in feet",
            "Metadata: software, version and the surveyor's details",
          ],
        },
        {
          title: "Decision deadline", src: "s3939", pin: "§ 45-23-39(e)(3)", q: "A decision shall be issued within forty-five (45) days after the certification of completeness",
          checklist: [
            "Note the certification date and day 45",
            "Ask for a certificate of approval if day 45 passes without a decision",
          ],
        },
      ],
    },
    stepRecord("2 years", "s3939", "§ 45-23-39(e)(5)", "The final approval of a major subdivision or land development project expires two (2) years from the date of approval"),
    stepAppeal(),
    stepBuilding(true),
    stepOccupy(true),
  ],
};

const minor: Tree = {
  id: "minor", name: "Minor land development", rule: "3 to 9 multifamily units", status: "Fully sourced",
  blurb: "Two stages, preliminary and final. Usually decided by the Administrative Officer. The Planning Board decides only if relief or a new street is involved.",
  steps: [
    stepZoning(),
    stepRezone(),
    {
      id: "preapp", title: "Pre-application meeting (optional)", app: "Pre-application checklist materials",
      clock: { text: "On request" },
      what: "Not required for minor projects, but available on request. It is useful if you expect to need relief.",
      auth: [{ c: "planning", role: "Runs the meeting" }],
      docs: [
        {
          title: "Pre-application request", src: "cregs", pin: "§ 5-DE", q: "Pre-application meetings may be held for Administrative, Minor, and Development Plan Review applications, upon request",
          checklist: [
            "A concept plan with the unit count and parking",
            "Your questions about relief and whether a street is involved",
          ],
        },
      ],
    },
    {
      id: "prelim", title: "Preliminary plan", app: "Preliminary plan application and checklist",
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
          title: "Who decides", src: "s3938", pin: "§ 45-23-38(a)(2)", q: "The administrative officer shall review and grant, grant with conditions, or deny all other applications",
          checklist: ["Confirm whether the project needs relief or a new street, either of which sends it to the Planning Board"],
        },
        {
          title: "Two-stage review", src: "cregs", pin: "§ 5-FG(a)", q: "Minor Land Development and Subdivision Plan review and Development Plan Review shall consist of two stages, Preliminary and Final",
          checklist: ["Ask whether the stages can be combined if you meet both sets of requirements"],
        },
        {
          title: "Decision deadline", src: "s3938", pin: "§ 45-23-38(d)", q: "within sixty-five (65) days of certification of completeness",
          checklist: ["Note the certification date and day 65", "Agree any extension in writing"],
        },
        {
          title: "Unified development review request", cond: "relief", src: "s3938", pin: "§ 45-23-38(d)", q: "within ninety-five (95) days of certification of completeness",
          checklist: [
            "List each item of relief, with the ordinance section",
            "Notify property owners within the notice area for the public hearing",
            "Prepare the hardship or special-use standards argument",
          ],
        },
        {
          title: "Water and sewer confirmations, state permits", note: "The same Appendix C items as a major project", src: "cregs", pin: "App. C(A)",
          checklist: [
            "Written water confirmation",
            "Written sewer confirmation",
            "Any state permits the site triggers",
          ],
        },
      ],
    },
    {
      id: "final", title: "Final plan", app: "Final plan, legal documents and tax certification",
      clock: { days: 25, text: "25 days to decide" },
      what: "The Administrative Officer approves, or refers the plan to the Planning Board if it has changed in a major way.",
      auth: [{ c: "planning", role: "Decides" }],
      docs: [
        {
          title: "Final decision", src: "cregs", pin: "§ 5-FG(j)",
          q: "The Administrative Officer shall approve, deny, approve with conditions, or refer the application to the planning board based upon a finding that there is a major change within 25 days",
          checklist: ["Check that the final plan matches the preliminary approval", "Note any changes and explain them"],
        },
        {
          title: "Tax certification and bond", note: "The same items as the major final plan checklist",
          checklist: ["Municipal lien certificate", "Improvement guarantee, if any", "Deeds and easements"],
        },
      ],
    },
    stepRecord("1 year", "s3938", "§ 45-23-38(j)", "Approvals of a minor land development or subdivision plan expire one year from the date of approval"),
    stepAppeal(),
    stepBuilding(true),
    stepOccupy(false),
  ],
};

const comp: Tree = {
  id: "comp", name: "Comprehensive permit", rule: "At least 25% of units affordable", status: "Fully sourced",
  blurb: "One application to the Planning Board replaces the separate local approvals. Comes with minimum density bonuses. Cumberland runs larger projects through a master plan stage too.",
  steps: [
    stepZoning(),
    {
      id: "elig", title: "Eligibility and RIHousing letter", app: "Request for a letter of eligibility (or a subsidy award letter)",
      clock: { text: "RIHousing timeline" },
      what: "At least a quarter of the units must be low- or moderate-income housing. RIHousing confirms eligibility with a letter, which you file with the preliminary plan.",
      auth: [{ c: "rihousing", role: "Issues the letter of eligibility" }],
      docs: [
        {
          title: "Eligibility threshold", src: "s5304", pin: "§ 45-53-4", q: "This procedure is only available for proposals in which at least twenty-five percent (25%) of the housing",
          checklist: [
            "Affordable units are at least 25% of the total, rounded up",
            "Decide the income targets and whether units are for sale or for rent",
            "Make affordable units look the same as market units and spread them through the project",
          ],
        },
        {
          title: "Cumberland set-aside", src: "cz15", pin: "§ 15-5(b)", q: "propose to set aside at least 25% of the total number of housing units",
          checklist: ["Confirm the local wording matches your unit count"],
        },
        {
          title: "Letter of eligibility", src: "s5304", pin: "§ 45-53-4", q: "A letter of eligibility issued by the Rhode Island housing and mortgage finance corporation",
          checklist: [
            "Prepare the project pro forma",
            "Name the monitoring agent",
            "Leave time for RIHousing's review",
          ],
        },
        {
          title: "Density bonus (public sewer and water)", src: "s5304", pin: "§ 45-53-4", q: "shall be at least five (5) units per acre",
          checklist: ["Calculate the bonus density for your lot and affordability percentage", "Compare it with base R-3 density"],
        },
      ],
    },
    {
      id: "preapp", title: "Pre-application conference", app: "Pre-application submission",
      clock: { days: 30, text: "Town has 30 days to hold it" },
      what: "If the town doesn't hold the conference within 30 days, you can go straight to preliminary plan. In Cumberland, pre-application items appear on Planning Board agendas. Examples are Haley's Commons (2024) and Steeple & Stone (2025).",
      auth: [
        { c: "planning", role: "Schedules the conference" },
        { c: "pb", role: "Public meeting. No vote." },
      ],
      docs: [
        {
          title: "Pre-application materials", note: "Appendix C checklist", src: "pb250925", pin: "Items 7, 8", q: "Major Land Development/Comprehensive Permit: Pre-Application",
          checklist: [
            "Concept plan with the affordable units marked",
            "Draft list of the ordinance adjustments you will ask for",
            "Note the 30-day clock from the request",
          ],
        },
      ],
    },
    {
      id: "master", title: "Master plan (Cumberland practice for major projects)", app: "Master plan application",
      clock: { days: 115, text: "25 days to certify · 90 days to decide" },
      what: "State law lists preliminary and final stages for comprehensive permits. Cumberland has heard major comprehensive permits at the master plan stage, for example Blackstone Residences in September 2025. Confirm the stages at pre-application.",
      auth: [
        { c: "pb", role: "Decides after a public hearing" },
        { c: "trc", role: "Recommends" },
      ],
      objections: ["renters", "character", "traffic", "schools", "values"],
      docs: [
        {
          title: "Master plan checklist", note: "The same items as major land development", src: "pb250925", pin: "Item 6", q: "Major Land Development/Comprehensive Permit: Master Plan",
          checklist: [
            "Every item on the major master plan checklist",
            "The affordability plan summarized on the cover sheet",
          ],
        },
      ],
    },
    {
      id: "prelim", title: "Preliminary plan (single application)", app: "Preliminary plan, RIHousing letter, list of requested adjustments, timetable",
      clock: { days: 115, text: "25 days to certify · 90 days to decide" },
      what: "The Planning Board acts as the local review board for every local approval at once, including density and dimensional adjustments, after a public hearing. If it misses the deadline, the plan is approved by default.",
      auth: [
        { c: "pb", role: "Local review board. Grants the permit and any adjustments." },
        { c: "trc", role: "Recommends" },
      ],
      objections: ["renters", "parking", "traffic", "headlights", "stormwater"],
      docs: [
        {
          title: "RIHousing letter of eligibility", src: "s5304", pin: "§ 45-53-4", q: "A letter of eligibility issued by the Rhode Island housing and mortgage finance corporation",
          checklist: ["Attach the letter, or a subsidy award letter for HUD-funded projects"],
        },
        {
          title: "Ordinance provisions to adjust", note: "Haley's Commons sought adjustments for use, density, setbacks, lot coverage, height and parking setback.",
          src: "s5304", pin: "§ 45-53-4", q: "setting forth the specific sections and provisions of applicable local ordinances and regulations",
          checklist: [
            "A signed letter listing each section and the adjustment sought",
            "The reason each adjustment is needed to make the project viable",
            "Fallbacks if the board trims an adjustment",
          ],
        },
        {
          title: "Construction timetable", src: "s5304", pin: "§ 45-53-4",
          checklist: ["Start within 12 months of recording", "Complete within 60 months, or propose phasing"],
        },
        {
          title: "Decision deadline", src: "s5304", pin: "§ 45-53-4", q: "The local review board shall render a decision on the preliminary plan application within ninety (90) days",
          checklist: ["Note the certification date and day 90"],
        },
      ],
    },
    {
      id: "final", title: "Final plan", app: "Final plan, state permits, monitoring agreement, deed restriction",
      clock: { days: 45, text: "45 days to decide" },
      what: "Administrative unless the board asked to see it again. The affordability documents are added at this stage.",
      auth: [{ c: "planning", role: "Decides" }],
      docs: [
        {
          title: "Deed restriction or land lease", src: "s5304", pin: "§ 45-53-4", q: "A sample land lease or deed restriction with affordability liens",
          checklist: ["Draft the restriction with the income limits", "Ask the Town Solicitor to review it"],
        },
        {
          title: "Affordability term", src: "s5304", pin: "§ 45-53-4", q: "but for a period of not less than thirty (30) years",
          checklist: ["A term of at least 30 years, and check Cumberland's longer default (§ 15-5(a))"],
        },
        {
          title: "Draft monitoring agreement", note: "Names an approved monitoring entity",
          checklist: ["Name the monitoring agent", "Set the annual reporting obligations"],
        },
        {
          title: "All state and federal permits", note: "Required before final approval or a building permit",
          checklist: ["Copies of every issued permit", "The RIDOT permit or acceptance letter, if on a state road"],
        },
      ],
    },
    {
      id: "record", title: "Record, then start and finish on time", app: "Recorded decision and final plan",
      clock: { text: "Start within 12 months · finish within 60" },
      what: "Written decisions are recorded within 20 days. The permit expires if construction doesn't start and finish on time, unless the board and you agree on a longer or phased schedule.",
      auth: [{ c: "clerk", role: "Records the decision" }],
      docs: [
        {
          title: "Construction deadlines", src: "s5304", pin: "§ 45-53-4", q: "A comprehensive permit shall expire unless construction is started within twelve (12) months",
          checklist: ["Calendar the 12-month start date", "Calendar the 60-month completion date", "Ask for any phasing in writing"],
        },
      ],
    },
    stepAppeal(),
    stepBuilding(true),
    stepOccupy(true),
  ],
};

const dpr: Tree = {
  id: "dpr", name: "Development plan review", rule: "Adaptive reuse or a permitted use without a land development review", status: "Partly sourced",
  blurb: "Site plan review against objective standards. Administrative review for a change of use. Formal review by the Planning Board for adaptive reuse or disturbance over 10,000 sq ft.",
  steps: [
    stepZoning(),
    {
      id: "prelim", title: "Formal review: preliminary stage", app: "Development plan review application",
      clock: { days: 80, text: "15 days to certify · 65 to decide (Cumberland minor timelines)" },
      what: "The Planning Board reviews against objective standards. A plain change of use with no extensive construction goes to the Administrative Officer instead, in a single stage.",
      auth: [
        { c: "pb", role: "Permitting authority for formal review" },
        { c: "planning", role: "Permitting authority for administrative review" },
      ],
      objections: ["parking", "lighting", "trash"],
      docs: [
        {
          title: "Which review applies", src: "cregs", pin: "§ 5-HI(3)(b)",
          q: "Formal development plan review consists of the preliminary stage and final stage of review. The authorized permitting authority is the Planning Board.",
          checklist: ["Decide whether the project is administrative or formal", "Confirm the use is permitted by right"],
        },
        {
          title: "Adaptive reuse trigger", src: "cregs", pin: "§ 5-HI(3)(b)(1)", q: "An adaptive reuse project where no extensive exterior construction of improvements is sought.",
          checklist: ["Describe the exterior changes", "Show the existing and proposed floor plans"],
        },
        {
          title: "Disturbance trigger", src: "cregs", pin: "§ 5-HI(3)(b)(2)", q: "Any development that proposes to clear, grade, or disturb greater than 10,000 square feet of land.",
          checklist: ["Calculate the disturbed area"],
        },
        {
          title: "State law basis", src: "s2449", pin: "§ 45-24-49", note: "Applies to uses permitted by right, reviewed against specific and objective guidelines",
          checklist: ["Find the objective standards in the ordinance and show compliance with each one"],
        },
      ],
    },
    {
      id: "final", title: "Formal review: final stage", app: "Final development plan",
      clock: { days: 25, text: "25 days (Cumberland minor timelines)" },
      what: "Approval expires unless you get every building permit within a year.",
      auth: [{ c: "planning", role: "Administrative Officer" }],
      docs: [
        {
          title: "Expiration", src: "cregs", pin: "§ 5-FG(k)", q: "shall expire one year from the date of approval unless within such period the applicant obtains all necessary building permits",
          checklist: ["Calendar the 1-year building permit deadline"],
        },
      ],
    },
    stepAppeal(),
    stepBuilding(true),
    stepOccupy(false),
  ],
};

const byright: Tree = {
  id: "byright", name: "Building permit only", rule: "1 or 2 units on an existing conforming lot", status: "Outline. Sources still to be added.",
  blurb: "No land development review. The zoning check is followed by a building permit, utility connections and a certificate of occupancy.",
  steps: [
    stepZoning(),
    {
      id: "zcheck", title: "Zoning compliance", app: "Plot plan showing setbacks, coverage and parking",
      clock: { text: "Part of the permit review" },
      what: "The zoning official checks the use and dimensions. A dimensional variance means going to the Zoning Board of Review. In March 2026, two single-unit projects did so after a Planning Board recommendation.",
      auth: [
        { c: "building", role: "Zoning and building review" },
        { c: "zbr", role: "Only if a variance is needed", cond: "relief" },
      ],
      docs: [
        {
          title: "Plot plan", note: "Drawn to scale from a survey",
          checklist: ["Setbacks to every lot line", "Lot coverage", "Driveway and parking", "Accessory structures"],
        },
        {
          title: "Planning Board recommendation to the Zoning Board", cond: "relief", src: "pb260326", pin: "Items 3, 4",
          q: "requests a side yard setback variance to build an Accessory Dwelling Unit",
          checklist: ["Fill in the variance application", "Write the hardship narrative", "Prepare the abutter notice"],
        },
      ],
    },
    stepBuilding(false),
    stepOccupy(false),
  ],
};

export const TREES: Record<TreeId, Tree> = { major, minor, comp, dpr, byright };
export const TREE_ORDER: TreeId[] = ["major", "minor", "comp", "dpr", "byright"];
