import type { Locality } from "../types";

/*
 * Where council and board records live. Each locality publishes differently, so these are
 * sample entry points. Cumberland is the pilot; the others show the common platforms.
 */
export const LOCALITIES: Locality[] = [
  {
    id: "cumberland", name: "Cumberland", pilot: true,
    intro: "Cumberland publishes Town Council and Planning Board records on ClerkBase (clerkshq.com). Each meeting has its own page, organized by board and year.",
    links: [
      { label: "Planning Board agenda: June 25, 2026", url: "https://clerkshq.com/Content/Cumberland-RI/Planning/2026/jun25_26pbag.htm", note: "A sample Planning Board agenda, with the Waterman Pond 18-unit master plan hearing" },
      { label: "Planning Board agenda: Sept 25, 2025", url: "https://clerkshq.com/Content/Cumberland-RI/Planning/2025/sep25_25pbag.htm", note: "Haley's Commons, Blackstone Residences and Steeple & Stone on one agenda" },
      { label: "Town Council docket: March 18, 2026", url: "https://clerkshq.com/Content/Cumberland-RI/council/2026/mar18_26dk.htm", note: "A sample Town Council agenda (docket)" },
      { label: "Town Council record: January 3, 2024", url: "https://clerkshq.com/Content/Cumberland-RI/council/2024/jan03_24tc.htm", note: "A sample Town Council meeting record, with attendance and votes" },
      { label: "Technical Review Committee", url: "https://www.cumberlandri.gov/386/Technical-Review-Committee", note: "Committee page with recent agendas" },
      { label: "2026 TRC and Planning Board schedule", url: "https://www.cumberlandri.gov/DocumentCenter/View/2407/2026-TRC-PB-Meeting-Schedule_V2", note: "Submission deadlines and meeting dates" },
      { label: "Land Development and Subdivision Regulations", url: "https://www.ecode360.com/CU3602/laws/LF1960426.pdf", note: "The checklists in Appendix C" },
    ],
    tips: [
      "Page names follow a pattern: month, day and two-digit year, then a code. jun25_26pbag is the Planning Board agenda for June 25, 2026. In the council folder, dk pages are dockets (agendas) and tc pages are meeting records.",
      "To find a project's whole history, search for its plat and lot number (\"AP 54 Lots 7\") or the applicant's name. Items are often continued from one meeting to the next.",
      "Agendas show the stage reached (pre-application, master, preliminary). The vote and its conditions appear in the minutes and in the recorded decision at the Town Clerk.",
      "Proposed zoning amendments appear first as \"Town Council Recommendation\" items on Planning Board agendas.",
      "Each agenda links to the meeting's YouTube video. Minutes are posted as PDF attachments to the following meeting's agenda, so the July 31 minutes sit on the August 28 agenda.",
    ],
    indexed: true,
    media: [
      { kind: "video", label: "Planning Board, Sept 25, 2025", url: "https://www.youtube.com/watch?v=c7NCk5qx6nw", date: "2025-09-25", note: "Haley's Commons approval vote, Blackstone Residences master plan hearing, Steeple & Stone pre-application" },
      { kind: "video", label: "Planning Board, July 31, 2025", url: "https://www.youtube.com/watch?v=K5DHtHeKSLk", date: "2025-07-31", note: "Haley's Commons hearing (continued), 475 Mendon Road pre-application" },
      { kind: "video", label: "Planning Board, Dec 4, 2025", url: "https://www.youtube.com/watch?v=6XPE5Bs8SSo", date: "2025-12-04", note: "Steeple & Stone revised preliminary plan hearing" },
      { kind: "video", label: "Town Council, Sept 2, 2026", url: "https://www.youtube.com/watch?v=NE7v--G8xf8", date: "2026-09-02", note: "A sample Town Council meeting video. Agendas link to each item's timestamp." },
      { kind: "minutes", label: "Planning Board minutes, Sept 25, 2025", url: "https://clerkshq.com/Content/Attachments/Cumberland-RI/251204pb_2a.pdf", date: "2025-09-25", note: "Board discussion and votes on Haley's Commons, Blackstone Residences and Steeple & Stone" },
      { kind: "minutes", label: "Planning Board minutes, July 31, 2025", url: "https://clerkshq.com/Content/Attachments/Cumberland-RI/250828pb_2.pdf", date: "2025-07-31", note: "475 Mendon Road, Haley's Commons, and the Berkeley Mill administrative approval" },
      { kind: "minutes", label: "Planning Board minutes, May 28, 2026", url: "https://clerkshq.com/Content/Attachments/Cumberland-RI/260625pb_2.pdf", date: "2026-05-28", note: "Abutter testimony on runoff, access and privacy, and the Waterman Pond continuance" },
      { kind: "minutes", label: "Planning Board minutes, Oct 30, 2025", url: "https://clerkshq.com/Content/Attachments/Cumberland-RI/251204pb_2b.pdf", date: "2025-10-30", note: "Hunting Hill sidewalk change (7–1), a combined master/preliminary approval, and comprehensive permit lot rules" },
      { kind: "memo", label: "Staff memo: The Homes at Waterman Pond", url: "https://clerkshq.com/Content/Attachments/Cumberland-RI/260625pb_4.pdf", date: "2026-05-21", note: "Summarizes TRC and public concerns (traffic, wetlands, runoff) and recommends conditions" },
      { kind: "livestream", label: "ClerkBase live stream and archive", url: "https://clerkshq.com/Cumberland-ri", note: "Live meetings and the agenda archive" },
      { kind: "news", label: "Valley Breeze: another condo project proposed on Bear Hill Road", url: "https://valleybreeze.com/news/another-condo-project-proposed-on-bear-hill-road/article_ddcef53f-ef33-4e61-b323-f7d648263dc0.html", date: "2025", note: "Local press on Waterman Pond ahead of its October 2025 TRC review" },
      { kind: "news", label: "The Call: Bear Hill Road condo project gets planning OK", url: "https://www.pressreader.com/usa/call-and-times/20170429/281930247877237", date: "2017-04-29", note: "Abutters raised traffic and buffers on a 12-unit project" },
    ],
  },
  {
    id: "state", name: "Statewide",
    intro: "Rhode Island's Open Meetings Act requires public bodies to file meeting notices and agendas with the Secretary of State, generally at least 48 hours ahead. The state portal is the one place to search across towns.",
    links: [
      { label: "RI Department of State: Open Meetings", url: "https://www.sos.ri.gov/publicinfo/openmeetings/", note: "Search notices, agendas and minutes by body, keyword or date, and set email alerts. Questions: Public Information, 401-222-3983." },
      { label: "RI Division of Statewide Planning: 2026 legislative summary", url: "https://planning.ri.gov/sites/g/files/xkgbur826/files/2026-07/2026%20Legislative%20Summary%20RIDSP.pdf", note: "What changed in state land-use law this year" },
    ],
    tips: [
      "Municipal minutes are not always on the state portal. Check the town's own site as well.",
    ],
    media: [
      { kind: "video", label: "Rhode Island Zoning Atlas: Transportation Lunch and Learn", url: "https://youtu.be/N_CrOwZ3pBM", date: "2024-04", note: "HousingWorks RI walkthrough of the Zoning Atlas" },
      { kind: "testimony", label: "Neighbors Welcome! Rhode Island testimony on S 2268", url: "https://www.rilegislature.gov/senators/SenateComDocs/2026%20Housing%20and%20Municipal%20Government/S2268%20Neighbors%20Welcome!%20Rhode%20Island.pdf", date: "2026", note: "Written committee testimony. The General Assembly posts testimony PDFs by committee and bill." },
    ],
  },
  {
    id: "warwick", name: "Warwick",
    intro: "Warwick uses a CivicPlus Agenda Center for boards and commissions. Older Planning Board items are in its Document Center.",
    links: [
      { label: "Warwick Agenda Center", url: "https://ri-warwick.civicplus.com/AgendaCenter", note: "Agendas and minutes for all boards" },
      { label: "Warwick Planning Board", url: "https://www.warwickri.gov/385/Planning-Board", note: "Board page with meeting information" },
    ],
    media: [
      { kind: "video", label: "Special Zoning Atlas Briefing: Warwick/Cranston", url: "https://youtu.be/Spw3OJdRq2Y", note: "HousingWorks RI briefing on zoning in Warwick and Cranston" },
    ],
  },
  {
    id: "providence", name: "Providence",
    intro: "The City Plan Commission posts agendas and materials a week ahead of each meeting, and also files them on the state Open Meetings portal.",
    links: [
      { label: "City Plan Commission meeting schedule (2023)", url: "https://www.providenceri.gov/wp-content/uploads/2022/12/CPC-meeting-schedule-2023.pdf", note: "Shows how the schedule and filing deadlines are published. Check the city site for the current year." },
    ],
  },
  {
    id: "exeter", name: "Exeter",
    intro: "Exeter also uses ClerkBase, with the same page naming as Cumberland.",
    links: [
      { label: "Exeter Planning Board: Nov 14, 2023", url: "https://clerkshq.com/Content/Exeter-ri/planning/2023/nov14_23pb.htm", note: "Includes amendments to bring local rules in line with the 2023 state housing laws" },
    ],
  },
  {
    id: "middletown", name: "Middletown",
    intro: "Middletown posts application packets, including state permit letters, in its Document Center.",
    links: [
      { label: "Example: RIDOT permit acceptance letter in a planning file", url: "https://middletownri.gov/DocumentCenter/View/16499/RIDOT-PAP-acceptance-letter", note: "Shows what a RIDOT Physical Alteration Permit letter looks like" },
    ],
  },
];
