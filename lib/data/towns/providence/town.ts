import type { BoardCalendar, Contact, Locality } from "../../../types";

/*
 * Providence offices and boards, the City Plan Commission's calendar, and where its records are published.
 * Trial reading, 2026-11-13, from the City's pages and the documents named in each `src`. Not confirmed by the city.
 * Staff named here are the contacts the City's own pages and forms give for applications.
 */
export const PROVIDENCE_CONTACTS: Record<string, Contact> = {
  planning: {
    name: "Department of Planning and Development (Administrative Officer)", kind: "staff",
    lines: [
      ["Address", "444 Westminster Street, Suite 3A, Providence, RI 02903"],
      ["Phone", "401-680-8400"],
      ["Applications", "Choyon Manjrekar, Principal Planner, 401-680-8525, cmanjrekar@providenceri.gov"],
      ["Hours", "Weekdays 8:30 to 4:30 (to 4:00 in July and August)"],
    ],
    note: "Certifies applications complete, decides minor projects that need no relief, and approves final plans. The administrative officer is appointed by the City Plan Commission and reports to it.",
    src: ["pcpc", "pformminor", "pregs"],
  },
  pb: {
    name: "Providence City Plan Commission", kind: "appointed",
    lines: [
      ["Meets", "Third Tuesday of the month, 4:45 p.m., with exceptions listed on its schedule"],
      ["Where", "Joseph Doorley Municipal Building, 444 Westminster Street, 1st floor meeting room, and by Zoom"],
      ["Members", "Seven. Five appointed by the Mayor and confirmed by the City Council, plus the Mayor and the Council President or their designees."],
      ["Agendas", "providenceri.gov/cpc, a week ahead, with staff reports and plans. Minutes on the state Open Meetings site."],
    ],
    note: "Decides land development projects and subdivisions, and the variances and special use permits tied to them under unified development review. Gives the City Council advisory opinions on zone changes.",
    src: ["pcpc", "pabout", "pcpcsched"],
  },
  trc: {
    name: "Downtown Design Review Committee (the Technical Review Committee)", kind: "appointed",
    lines: [
      ["Covers", "The D-1 downtown district only"],
      ["Meets", "Second Monday of the month, 4:45 p.m., 444 Westminster Street"],
      ["Contact", "Christopher Ise, Principal Planner, 401-680-8521"],
    ],
    note: "Providence's regulations name this committee as the Technical Review Committee. Outside downtown there is no committee step before the Commission.",
    src: ["pregs", "pddrc"],
  },
  council: {
    name: "Providence City Council", kind: "elected",
    lines: [["Address", "City Hall, 25 Dorrance Street, Providence, RI 02903"], ["Web", "council.providenceri.gov"]],
    note: "The governing body. Decides zone changes after the Commission's recommendation, accepts public dedications and releases guarantees. The application form tells applicants to inform the councillor for the ward.",
    verify: "Members, wards and committee procedure were not read.",
    src: ["pregs", "pformminor"],
  },
  zbr: {
    name: "Zoning Board of Review (Board of Appeal)", kind: "appointed",
    lines: [["Contact", "Through Inspection and Standards, Boards of Review, 401-680-5375"]],
    note: "Sits as the Board of Appeal for the administrative officer's administrative decisions and completeness determinations. Variances tied to a land development project go to the City Plan Commission instead.",
    verify: "The board's own page could not be reached. Its members and meeting pattern were not read.",
    src: ["pregs", "pis"],
  },
  clerk: {
    name: "City Clerk and Recorder of Deeds", kind: "staff",
    lines: [["Recorder of Deeds", "City Hall, 5th floor, 25 Dorrance Street, Providence, RI 02903"]],
    note: "Approval letters and stamped plans are recorded at the Recorder of Deeds. Decisions are posted in the City Clerk's office, which starts the 20-day appeal clock.",
    src: ["pformminor", "pregs"],
  },
  building: {
    name: "Department of Inspection and Standards", kind: "staff",
    lines: [["Address", "780 Allens Avenue, Providence, RI (moved in December 2025)"], ["Phone", "401-680-5375"]],
    note: "Building and demolition permits and certificates of occupancy. No demolition, foundation or building permit is issued for a land development project before the final plan is approved.",
    verify: "The director, hours and the permit portal were not on the page read.",
    src: ["pis", "pformminor"],
  },
  dpw: {
    name: "Department of Public Works (City Engineer, Traffic Engineer)", kind: "utility",
    lines: [["Details", "Not yet read. Ask Commission staff who reviews drainage and traffic for your site."]],
    note: "Approves the stormwater management plan. The Commission conditions approvals on the City Engineer's and the Traffic Engineer's sign-off before the final plan.",
    verify: "Contact details were not read.",
    src: ["pregs", "pmin251216"],
  },
  water: {
    name: "Water and sewer providers", kind: "utility",
    lines: [["Details", "Not yet read for Providence. The regulations name the Narragansett Bay Commission among the bodies that may have to approve the stormwater plan."]],
    note: "Water and sewer service for the building.",
    verify: "Providers and contacts were not read.",
    src: ["pregs"],
  },
  crmc: {
    name: "RI Coastal Resources Management Council", kind: "state",
    lines: [["Web", "crmc.ri.gov"]],
    note: "Reviews development in the coastal zone, which includes riverfront sites on the Seekonk. At 27 East River Street it asked for public access to the water, a stormwater plan and soil testing.",
    verify: "Contact details were not read.",
    src: ["psr27er2512"],
  },
};

/**
 * City Plan Commission, from its "2026 Meeting Schedule and Filing Deadline" (source `pcpcsched`). Read 2026-11-13.
 * One filing deadline per meeting, four or five weeks before it. There is no committee meeting in between.
 * Meetings actually held in 2026 differed from this schedule (Jan 26, Mar 3, Mar 31 and Jul 28, and a special
 * meeting on May 7), so every date needs the agenda as confirmation.
 */
export const PROVIDENCE_CALENDAR: BoardCalendar = {
  town: "Providence",
  year: 2026,
  src: "pcpcsched",
  read: "2026-11-13",
  times: { pb: "4:45 p.m." },
  rows: [
    { cutoff: "2025-12-23", pb: "2026-01-20" },
    { cutoff: "2026-01-27", pb: "2026-02-24" },
    { cutoff: "2026-02-24", pb: "2026-03-24" },
    { cutoff: "2026-03-31", pb: "2026-04-28" },
    { cutoff: "2026-04-21", pb: "2026-05-19" },
    { cutoff: "2026-05-19", pb: "2026-06-16" },
    { cutoff: "2026-06-16", pb: "2026-07-14" },
    { cutoff: "2026-07-21", pb: "2026-08-18" },
    { cutoff: "2026-08-18", pb: "2026-09-15" },
    { cutoff: "2026-09-22", pb: "2026-10-20" },
    { cutoff: "2026-10-20", pb: "2026-11-17" },
    { cutoff: "2026-11-17", pb: "2026-12-15" },
  ],
  pattern: { cutoffDaysBefore: 28, note: "third Tuesday of the month", rule: { weekday: 2, nth: 3 } },
};

/** Replaces the sample Providence entry on the Records page. */
export const PROVIDENCE_LOCALITY: Locality = {
  id: "providence", name: "Providence", indexed: true,
  intro: "The City Plan Commission posts each meeting's agenda, staff reports and plans on its own page a week ahead, and keeps year-by-year archives. Minutes are not on the City's page: they are filed on the state Open Meetings site, usually a month later. This site has read the records for Fox Point and Wayland only.",
  links: [
    { label: "City Plan Commission: current meeting, forms and regulations", url: "https://www.providenceri.gov/planning/cpc/", note: "Agenda, staff reports and plan sets for the next meeting, the application forms, and staff contacts" },
    { label: "City Plan Commission meeting materials archive", url: "https://www.providenceri.gov/planning/cpc-meeting-materials-archive/", note: "One page per year, with each item's staff report" },
    { label: "Open Meetings: Providence City Plan Commission", url: "https://opengov.sos.ri.gov/OpenMeetingsPublic/OpenMeetingDashboard?subtopmenuId=201&EntityID=2767", note: "Every agenda and the approved minutes, by meeting date" },
    { label: "Administrative project reviews", url: "https://www.providenceri.gov/planning/department-of-planning-and-development-administrative-project-reviews/", note: "Projects staff decide without a hearing, such as 135 Gano Street (54 units)" },
    { label: "Superior Court decision on 269 Wickenden Street (Sept 23, 2024)", url: "https://www.courts.ri.gov/Decisions/Superior-PC-2024-1374.pdf", note: "The neighbours' appeal of the master plan approval, denied. Sets out the grounds they raised and quotes the ordinance." },
    { label: "2026 meeting schedule and filing deadlines", url: "https://www.providenceri.gov/wp-content/uploads/2025/12/CPC-meeting-schedule-2026.pdf", note: "Complete applications are due about four weeks before each meeting" },
  ],
  tips: [
    "Minutes for an item with zoning relief are short on purpose. They say a transcript is part of the record, and the transcript is available on request, not online.",
    "Most of the minutes filed since 2024 are scanned pages with no searchable text.",
    "Case numbers carry the type: MI or MIL minor, MA major, UDR unified development review. The same project can change suffix between meetings.",
    "Staff reports give the lot size, district, relief requested and the recommendation, and are the best single document per hearing.",
  ],
  media: [
    { kind: "video", label: "City Plan Commission meeting recordings", url: "https://www.youtube.com/@pvdcpc", note: "Every meeting since December 2023 is recorded, and all but one carry automatic captions. The January 2025 hearing on 269 Wickenden Street was read from its captions." },
    { kind: "minutes", label: "Minutes, Dec 16, 2025", url: "https://opengov.sos.ri.gov/Common/DownloadMeetingFiles?FilePath=%5CMinutes%5C4752%5C2026%5C546678.pdf", date: "2025-12-16", note: "27 East River Street, 355 units: drainage, traffic, parks and the vote" },
    { kind: "minutes", label: "Minutes, Oct 15, 2024", url: "https://opengov.sos.ri.gov/Common/DownloadMeetingFiles?FilePath=%5CMinutes%5C4752%5C2024%5C510439.pdf", date: "2024-10-15", note: "27 East River Street: public comment on outreach, parking and height, and a 3 to 1 vote" },
    { kind: "minutes", label: "Minutes, Sept 16, 2025 (scanned)", url: "https://opengov.sos.ri.gov/Common/DownloadMeetingFiles?FilePath=%5CMinutes%5C4752%5C2025%5C541570.pdf", date: "2025-09-16", note: "128 Wayland Avenue reheard after a court vacated its approval, and 150 Pitman Street cut from 16 units to 8" },
    { kind: "minutes", label: "Minutes, Feb 18, 2025 (scanned)", url: "https://opengov.sos.ri.gov/Common/DownloadMeetingFiles?FilePath=%5CMinutes%5C4752%5C2025%5C521276.pdf", date: "2025-02-18", note: "269 Wickenden Street preliminary plan approved 4 to 1" },
    { kind: "memo", label: "Staff report: 27 E River Street preliminary plan", url: "https://www.providenceri.gov/wp-content/uploads/2025/12/24-041MI-27-E-River-Ave-preliminary-plan-staff-report.pdf", date: "2025-12-16", note: "Height and parking adjustments, traffic study, coastal review" },
  ],
};
