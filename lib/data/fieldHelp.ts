/*
 * What each project and site fact means, for the (i) beside its label on Site selection.
 * `what` says what it is in plain words, `why` what it changes in the check, `find` where to get it.
 * `term` links the glossary entry. Keep `why` true to lib/engine.ts: it is what the check actually does with the fact.
 */
export interface FieldHelp {
  title: string;
  what: string;
  why: string;
  find?: string;
  term?: string;
}

export const FIELD_HELP: Record<string, FieldHelp> = {
  town: {
    title: "Municipality",
    what: "The city or town the land is in. Rhode Island has 39, and each writes its own zoning and review rules on top of state law.",
    why: "It picks the zoning districts, the boards that decide, and how much of the town's own rules this site has read.",
    find: "The town on the tax bill, or pick it on the map.",
  },
  address: {
    title: "Street address",
    what: "Where the site is. It is used only to find the point on the map.",
    why: "From the point, the site fills in the zoning district, the parcel, its area, water and sewer, state road access, nearby wetlands and transit.",
    find: "The address goes to OpenStreetMap's search. Nothing is stored.",
  },
  parcel: {
    title: "Parcel (plat and lot)",
    what: "The tax assessor's map reference for the land, like \"AP 54 Lot 7\".",
    why: "Town records index projects by it, and the map outlines your parcel with it. It does not change the answer.",
    find: "On the tax bill or the town's online assessor's database.",
    term: "platlot",
  },
  units: {
    title: "Dwelling units",
    what: "How many homes the project makes: houses, apartments or condominiums, counted one each.",
    why: "Under state law, 3 to 9 units is a minor land development and 10 or more is major, which adds a master plan stage and longer clocks. Some towns draw the lines elsewhere.",
    term: "minor",
  },
  aff: {
    title: "Deed-restricted affordable units",
    what: "Units kept affordable to low- or moderate-income households by a recorded restriction, usually for 30 years or more.",
    why: "If at least a quarter of 3 or more units are affordable, the project can use a comprehensive permit: one application, and the board can adjust use and density.",
    term: "comp",
  },
  type: {
    title: "Building work",
    what: "Whether you build new or convert a building that already stands, such as a mill, school or church.",
    why: "Under state law, reusing a building for fewer than 9 units can go through development plan review instead of land development review.",
    term: "dpr",
  },
  commercial: {
    title: "Commercial floor area",
    what: "Gross square feet of shops, offices or other non-housing space in a building that also has homes.",
    why: "State law makes mixed use minor review only up to 6 units and 2,500 sq ft of commercial space; beyond that the town may review it as major. Providence sorts projects of 10 or more units by it.",
    term: "gfa",
  },
  kind: {
    title: "What you plan to build",
    what: "Homes only; homes with commercial space, such as shops below apartments; or a commercial or institutional building with no homes.",
    why: "Each kind has its own review lines in state law, its own facts, and its own coverage on this site. Housing has been read furthest; commercial use tables have been read for Providence only.",
  },
  use: {
    title: "Use",
    what: "What the non-housing space is for, from a short list: retail, office, restaurant, light industrial, or institutional (a school, healthcare, a cultural facility or a place of worship).",
    why: "Whether the use is allowed in the district comes from the town's own table of uses. The Zoning Atlas records housing only, so where a town's table hasn't been read, the check says so.",
  },
  work: {
    title: "Building work",
    what: "Building new floor area, adding to a building, or changing the use of a building that stands.",
    why: "State law sets a line for each: 7,500 sq ft of new floor area; an expansion up to half the existing floor area or 10,000 sq ft; and a change of use without extensive construction is minor review.",
  },
  gfa: {
    title: "Gross floor area",
    what: "The total floor area inside the outside walls, on every floor, in square feet.",
    why: "It sets the review: for new construction, minor up to 7,500 sq ft under state law, and towns can raise the line (Providence: 10,000 and 20,000 sq ft).",
    find: "From the architect's area plan.",
    term: "gfa",
  },
  existingGfa: {
    title: "Existing floor area",
    what: "The gross floor area of the building before the addition.",
    why: "An addition of up to half of it, or up to 10,000 sq ft, is minor review under state law.",
    find: "The assessor's record or the existing plans.",
  },
  extensive: {
    title: "Extensive construction or exterior work",
    what: "Major building work beyond fitting out the inside: new floors, additions, demolition or a new facade.",
    why: "A change of use without extensive construction is minor review, and a town may send it to development plan review instead. With extensive work it is reviewed like new construction.",
  },
  zone: {
    title: "Zoning district",
    what: "The area of the zoning map the parcel sits in. Each district has its own list of allowed uses, lot sizes, density, height and parking.",
    why: "It decides whether your housing type is allowed, needs a hearing or is prohibited, and how many units the lot supports.",
    find: "Look up the address, click the parcel on the map, or check the town's zoning map.",
    term: "atlas",
  },
  lot: {
    title: "Lot area",
    what: "The land area of the parcel in square feet. An acre is 43,560 sq ft.",
    why: "With the district's density rule, it sets how many units the lot supports without relief.",
    find: "The assessor's figure is filled in from the lookup. A survey is more exact.",
    term: "density",
  },
  dist: {
    title: "Land disturbed",
    what: "The area you will clear, grade or build on, in acres, including driveways, parking and staging.",
    why: "One acre or more needs RIDEM's construction stormwater permit (RIPDES) before approval.",
    find: "From the grading plan. Only your engineer knows it, so no map suggests it.",
    term: "ripdes",
  },
  startDate: {
    title: "Start date",
    what: "The day you expect to begin, usually the pre-application meeting.",
    why: "The schedule dates every filing, deadline and hearing from it. It does not change the route.",
  },
  water: {
    title: "Public water",
    what: "Whether a public water system serves the lot, rather than a private well.",
    why: "The district's lot-size and density figures depend on it, and some districts require it for multi-family housing.",
    find: "Filled in from the Zoning Atlas's water districts after a lookup. Confirm with the water supplier.",
  },
  sewer: {
    title: "Public sewer",
    what: "Whether the lot can connect to a public sewer, rather than a septic system.",
    why: "Density figures depend on it. Without sewer, expect a much larger lot for the same units, and a septic system that RIDEM must approve before construction.",
    find: "Filled in from the Zoning Atlas's sewered areas after a lookup. Confirm with the sewer authority.",
  },
  wet: {
    title: "Wetlands on or near the site",
    what: "Marshes, swamps, ponds, streams and their buffer areas on or close to the land.",
    why: "Work in or near them needs a RIDEM freshwater wetlands permit (or CRMC's on the coast), which must be in hand before approval.",
    find: "Ticked after a lookup when the National Wetlands Inventory maps one within about 100 ft. It misses small wetlands; RIDEM verifies the edge on site.",
    term: "wetlands",
  },
  dot: {
    title: "Access onto a state road",
    what: "A driveway or curb cut onto a road the state maintains, often a numbered route.",
    why: "It needs RIDOT's Physical Alteration Permit.",
    find: "Ticked after a lookup when RIDOT's road map has a state road at the parcel. Untick it if the driveway won't open onto it.",
    term: "pap",
  },
  transit: {
    title: "Near frequent transit",
    what: "Within 1/8 mile of a frequent bus or train stop, or 1/4 mile of a mobility hub.",
    why: "2026 state law caps required parking at one space per unit there.",
    find: "Ticked after a lookup when a RIPTA stop is within 1/8 mile. Whether the service is frequent enough is not checked, so untick it if it isn't.",
  },
  rezone: {
    title: "Seek a zone change instead of relief",
    what: "Ask the council to change the zoning map or text for the parcel, instead of asking for a variance or special use permit.",
    why: "It adds a legislative step decided by the elected Town or City Council, after a public hearing.",
    term: "rezone",
  },
  conservation: {
    title: "Conservation development",
    what: "Cluster the buildings on part of the land and protect the rest as open space.",
    why: "Where the district allows it, the density is higher. The Zoning Atlas lists these figures as \"PRD\".",
    term: "prd",
  },
};
