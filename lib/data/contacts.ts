import { getActiveTown } from "../town";
import type { Contact } from "../types";
import { PROVIDENCE_CONTACTS } from "./towns/providence/town";

/** Authorities and offices on the route. "verify" marks details from older or secondary sources. */
const CUMBERLAND_CONTACTS: Record<string, Contact> = {
  planning: {
    name: "Planning & Community Development (Administrative Officer)", kind: "staff",
    lines: [["Address", "45 Broad Street, 2nd Floor, Cumberland, RI 02864"], ["Phone", "401-728-2400"], ["Director", "Amelia Morton (introduced May 2026)"], ["Principal planner", "ext. 142"]],
    note: "The Director and the Town Planner serve as Administrative Officer.",
    verify: "Staff extensions come from the town directory, which still lists the previous director.",
    src: ["cdir", "pb260625", "cregs"],
  },
  pb: {
    name: "Cumberland Planning Board", kind: "appointed",
    lines: [["Meets", "Thursdays, 6:30 p.m., usually the last Thursday of the month"], ["Where", "Town Council Chambers, 45 Broad Street, 2nd Floor"], ["Agendas", "clerkshq.com · Cumberland-RI · Planning"]],
    note: "Decides master and preliminary plans, and zoning relief under unified development review.",
    src: ["csched", "pb260625"],
  },
  trc: {
    name: "Technical Review Committee", kind: "appointed",
    lines: [["Members", "At least 3, appointed by the Planning Board, chaired by the Administrative Officer"], ["Contact", "Through Planning, 401-728-2400"]],
    note: "Makes recommendations to the Planning Board before hearings.",
    src: ["ctrc", "cregs"],
  },
  council: {
    name: "Cumberland Town Council", kind: "elected",
    lines: [["Members", "7"], ["Contact", "Through the Town Clerk, 45 Broad Street, 401-728-2400"], ["Records", "clerkshq.com · Cumberland-RI · council"]],
    note: "The governing body. It adopts zoning and the Comprehensive Plan, decides zone changes and accepts dedicated public improvements.",
    src: ["cregs", "pb260326"],
  },
  zbr: {
    name: "Zoning Board of Review", kind: "appointed",
    lines: [["Members", "5 plus 2 alternates, appointed by the Town Council for 5-year terms"], ["Contact", "Through Planning, 401-728-2400"]],
    note: "Hears variances outside unified development review, and sits as the Board of Appeals for certain administrative decisions.",
    src: ["cregs"],
  },
  clerk: {
    name: "Town Clerk: Land Evidence Records", kind: "staff",
    lines: [["Address", "45 Broad Street, Cumberland, RI 02864"], ["Phone", "401-728-2400"]],
    note: "Records signed plans and decisions. Posting a decision here starts the 20-day appeal clock.",
    src: ["s3971"],
  },
  building: {
    name: "Building Official / Inspections", kind: "staff",
    lines: [["Address", "45 Broad Street, Cumberland, RI 02864"], ["Phone", "401-728-2400 (ask for Building)"]],
    note: "Building permits, inspections and certificates of occupancy under the RI State Building Code.",
    verify: "No direct line was found. Use the main number.",
    src: [],
  },
  water: {
    name: "Cumberland Water Department", kind: "utility",
    lines: [["Contact", "Through the town, 401-728-2400"]],
    note: "Gives the written confirmation that water service is acceptable. Required with the preliminary plan.",
    verify: "No direct contact was found.",
    src: ["cregs"],
  },
  dpw: {
    name: "Department of Public Works (sewer, Town Engineer)", kind: "utility",
    lines: [["Contact", "Through the town, 401-728-2400"]],
    note: "Gives the written confirmation that sewer service is acceptable, plus engineering comments.",
    verify: "No direct contact was found.",
    src: ["cregs"],
  },
  ridem: {
    name: "RIDEM Office of Water Resources", kind: "state",
    lines: [["Address", "235 Promenade Street, Providence, RI 02908"], ["Web", "dem.ri.gov"]],
    note: "Freshwater wetlands permits, wetland edge verification and RIPDES construction stormwater permits.",
    verify: "Confirm the program contact on dem.ri.gov.",
    src: [],
  },
  crmc: {
    name: "RI Coastal Resources Management Council", kind: "state",
    lines: [["Address", "Oliver H. Stedman Government Center, 4808 Tower Hill Road, Wakefield, RI"], ["Web", "crmc.ri.gov"]],
    note: "An appointed state council. Regulates development in the coastal zone, and wetlands where RIDEM's jurisdiction map gives CRMC: its permit is an Assent.",
    verify: "The address was not read from CRMC's own page; confirm it and the program contact on crmc.ri.gov.",
    src: ["ridemWetJur"],
  },
  ridot: {
    name: "RIDOT Physical Alteration Permits", kind: "state",
    lines: [["Address", "Division of Highway & Bridge Maintenance, 360 Lincoln Avenue, Warwick, RI 02886"], ["Phone", "(401) 734-4842"]],
    note: "Curb cuts and any work on a state road.",
    verify: "The phone number comes from 2023–24 permit letters.",
    src: ["papa"],
  },
  sfm: {
    name: "Office of the State Fire Marshal: Plan Review Unit", kind: "state",
    lines: [["Address", "560 Jefferson Boulevard, Warwick, RI 02886"], ["Phone", "401-889-5555 (call to schedule a submission)"]],
    note: "Fire protection plan review under the RI Fire Safety Code.",
    src: ["sfm"],
  },
  rihousing: {
    name: "RIHousing", kind: "utility",
    lines: [["Address", "44 Washington Street, Providence, RI 02903"], ["Web", "rihousing.com"]],
    note: "Issues the letter of eligibility a comprehensive permit requires.",
    verify: "Confirm the program contact on rihousing.com.",
    src: ["s5304"],
  },
  court: {
    name: "RI Superior Court, Providence County", kind: "state",
    lines: [["Address", "Licht Judicial Complex, 250 Benefit Street, Providence, RI 02903"]],
    note: "Hears appeals of Planning Board and Administrative Officer decisions.",
    src: ["s3971"],
  },
  ga: {
    name: "RI General Assembly", kind: "elected",
    lines: [["Address", "State House, 82 Smith Street, Providence, RI 02903"], ["Web", "rilegislature.gov"]],
    note: "Writes the enabling acts that set every stage and deadline on this route.",
    src: ["ridsp"],
  },
};

/** Offices that belong to the town. State agencies, RIHousing, the court and the General Assembly are the same everywhere. */
const SHARED = new Set(["ridem", "crmc", "ridot", "sfm", "rihousing", "court", "ga"]);
const cache = new Map<string, Contact>();

/** Outside Cumberland, a local office keeps its role but carries no Cumberland address, person or hours. */
function forTown(id: string, c: Contact, town: string): Contact {
  if (town === "Cumberland" || SHARED.has(id)) return c;
  const key = `${town}/${id}`;
  let out = cache.get(key);
  if (!out) {
    out = {
      ...c,
      name: c.name.replace(/Cumberland/g, town),
      lines: [["Details", `Not yet read for ${town}. Find the office on the town's website. The Open Meetings portal lists each board's meetings.`]],
      note: c.note.replace(/Cumberland/g, town),
      verify: undefined,
      src: ["sosom"],
    };
    cache.set(key, out);
  }
  return out;
}

/** Towns whose own offices have been read. An id found here wins; anything else falls back to the role-only version. */
const TOWN_CONTACTS: Record<string, Record<string, Contact>> = { Providence: PROVIDENCE_CONTACTS };

/** The contacts of the town of the project on screen. Reads the active town each time, so it follows the project. */
export const CONTACTS: Record<string, Contact> = new Proxy(CUMBERLAND_CONTACTS, {
  get: (t, id: string) => {
    const town = getActiveTown();
    return TOWN_CONTACTS[town]?.[id] ?? (t[id] ? forTown(id, t[id], town) : undefined);
  },
});

export const KIND_LABEL: Record<string, string> = {
  elected: "Elected",
  appointed: "Appointed board",
  staff: "Town staff",
  state: "State / court",
  utility: "Utility / finance",
};

export function shortName(name: string): string {
  return name.split(" (")[0].split(":")[0];
}
