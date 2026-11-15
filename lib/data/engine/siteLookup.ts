import { e, n, type Flow } from "./types";

export const SITE_LOOKUP: Flow = {
  slug: "site-lookup",
  title: "Site lookup",
  blurb: "How an address becomes the town, district, utilities and parcel.",
  intro:
    "The lookup runs in the visitor's browser against public map services. It finds a point, asks several layers what is at that point in parallel, and turns the answers into site facts. " +
    "It never guesses: on a district boundary it lists the candidates, and a layer that fails is named as failed and its fact is left as it was. " +
    "The applicant can correct every fact it fills.",
  shows: [{ href: "/site", label: "Site selection" }, { href: "/docs/site-facts", label: "How site facts are found" }],
  nodes: [
    n("addr", "data", "Address typed, or a click on the map", 2.2, 0, "Free text from the Site selection page, or a click on the zoning map. A map click skips the geocoding and goes straight to the point. \"Rhode Island\" is added to the address if it is not there.", { where: ["components/AddressLookup.tsx"] }),
    n("geo", "step", "Geocode with OpenStreetMap", 2.2, 1, "Nominatim turns the address into up to five candidate points, bounded to a box around Rhode Island. A match counts as precise only if it is a building or address point and not just a street.", { where: ["lib/lookup.ts#geocode"], note: "The service is OpenStreetMap's, not the state's, so a new building may not be on it yet." }),
    n("pick", "step", "Visitor picks a match", 2.2, 2, "Several candidates are listed with their labels, and the visitor chooses. A road-only match is marked, since an address point often lands in the street, which belongs to no parcel.", { where: ["components/AddressLookup.tsx"] }),
    n("point", "data", "One point (lon, lat)", 2.2, 3, "Everything below is asked of this single point, in parallel with Promise.allSettled, so a failed layer does not stop the others.", { where: ["lib/lookup.ts#siteFacts"] }),

    n("zone", "step", "Zoning district layer", 0, 4, "The Zoning Atlas district layer returns every district at the point, with the town (its Jurisdiction field) and the Atlas's use treatment for four-family housing.", { where: ["lib/lookup.ts#siteFacts"], note: "If nothing is at the point, it asks again within 30 metres and marks the result as nearby, so the visitor sees that the facts come from beside the point." }),
    n("util", "step", "Sewer and water layers", 1.1, 4, "Two Atlas layers, the sewered areas and the water districts. The point being inside one (a count above zero) sets public sewer or public water to true; outside both sets it to false.", { where: ["lib/lookup.ts#siteFacts"], note: "Inside a service area is not the same as a connection being available. The site says so in its notes." }),
    n("parcel", "step", "Tax parcel layer", 2.2, 4, "RIDEM's statewide tax parcels return the plat and lot, the acreage and the outline at the point, with the same 30 metre second try.", { where: ["lib/lookup.ts#siteFacts"] }),
    n("native", "step", "Native Lands layer", 3.3, 4, "The Atlas's layer of tribal and federally managed land. A hit means the town's zoning may not govern the site.", { where: ["lib/lookup.ts#siteFacts"] }),
    n("wetag", "step", "Wetland jurisdiction layer", 4.4, 4, "RIDEM's map of which agency regulates wetlands at the point: RIDEM inland, CRMC on the coast.", { where: ["lib/lookup.ts#siteFacts"] }),

    n("split", "step", "Split overlays from base districts", 0, 5, "The Atlas keeps overlay districts in the same layer, marked \"Overlay\". A point inside an overlay therefore finds the overlay and its base district; that is not a district boundary. Overlays are listed separately.", { where: ["lib/lookup.ts#siteFacts"], note: "ARD D36. Before this, every overlay was read as a boundary and the district was left blank." }),
    n("one", "decision", "Exactly one base district?", 0, 6, "One base district: the zone and its name are set. More than one, as on a boundary: all are listed as options and the visitor chooses. The engine never picks one.", { where: ["lib/lookup.ts#siteFacts"] }),
    n("parcq", "decision", "Exactly one parcel?", 2.2, 5.2, "One parcel: plat and lot, acres and outline are set. Several, as when the point is near a lot line: each is offered as an option.", { where: ["lib/lookup.ts#siteFacts"] }),
    n("res", "gap", "Tribal land: the town's rules may not apply", 3.3, 5.2, "The reservation name is carried into the project. The law check then stops and returns one finding saying whose rules govern is not read here, instead of running the town's zoning as if it applied.", { where: ["lib/engine.ts#analyze"], note: "ARD D38, debt 18: the route, steps and schedule still show the ordinary route." }),
    n("ag", "data", "RIDEM or CRMC", 4.4, 5.2, "Recorded as the wetlands agency. The law check says the wetlands permit is CRMC's (an Assent) on the coast, and the state-permits list names the right agency.", { where: ["lib/engine.ts#wetPermit"], note: "Debt 19: the State permits step still names RIDEM as the decider even where CRMC is." }),

    n("facts", "data", "Site facts", 2.2, 7.2, "Town, district and its options, overlays, water, sewer, plat and lot, acres, outline, reservation and wetlands agency, plus the list of lookups that failed.", { where: ["lib/lookup.ts#SiteFacts"] }),
    n("failed", "gap", "Lookups that failed, by name", 4.4, 7.2, "A service that is down or has changed its fields does not set its fact wrong: the fact is left as it was, and the name of the layer is listed so the page can say it could not be read.", { note: "Debt 14: nothing reports a layer that has moved. The visitor sees it only on that lookup." }),
    n("applied", "output", "Applied to the project, correctable", 2.2, 8.5, "The facts are applied to the project by default, and each stays the applicant's to change. Wetlands, state-road frontage and transit are suggested from map layers, never set silently, and frequency of transit service is not checked at all.", { to: { href: "/engine/project-facts", label: "How the project holds its facts" }, note: "ARD D19." }),
  ],
  edges: [
    e("addr", "geo", "address"), e("geo", "pick"), e("pick", "point"),
    e("point", "zone"), e("point", "util"), e("point", "parcel"), e("point", "native"), e("point", "wetag"),
    e("zone", "split"), e("split", "one"),
    e("parcel", "parcq"), e("native", "res"), e("wetag", "ag"),
    e("one", "facts"), e("util", "facts"), e("parcq", "facts"), e("res", "facts"), e("ag", "facts"),
    e("facts", "applied"),
    e("facts", "failed", "if any", { dashed: true }),
  ],
};
