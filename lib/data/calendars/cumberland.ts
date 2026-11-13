import type { BoardCalendar } from "../../types";

/**
 * Cumberland Planning Board and Technical Review Committee, from the Town's
 * "2026 Regular Meeting Schedule and Deadlines" (source id `csched`). Read 2026-11-13.
 * One deadline feeds both the TRC meeting and the Planning Board meeting that follows it.
 * The Town notes that meeting the deadline does not ensure agenda placement: the
 * Administrative Officer must certify the application complete first.
 */
export const CUMBERLAND_CALENDAR: BoardCalendar = {
  town: "Cumberland",
  year: 2026,
  src: "csched",
  read: "2026-11-13",
  times: { pb: "6:30 p.m.", trc: "3:00 p.m." },
  rows: [
    { cutoff: "2025-11-26", trc: "2025-12-09", pb: "2026-01-29" },
    { cutoff: "2025-12-29", trc: "2026-01-13", pb: "2026-02-26" },
    { cutoff: "2026-01-22", trc: "2026-02-10", pb: "2026-03-26" },
    { cutoff: "2026-02-26", trc: "2026-03-10", pb: "2026-04-30" },
    { cutoff: "2026-03-26", trc: "2026-04-14", pb: "2026-05-28" },
    { cutoff: "2026-04-23", trc: "2026-05-12", pb: "2026-06-25" },
    { cutoff: "2026-05-28", trc: "2026-06-09", pb: "2026-07-30" },
    { cutoff: "2026-06-25", trc: "2026-07-14", pb: "2026-08-27" },
    { cutoff: "2026-07-23", trc: "2026-08-11", pb: "2026-09-24" },
    { cutoff: "2026-08-27", trc: "2026-09-08", pb: "2026-10-29" },
    { cutoff: "2026-10-01", trc: "2026-10-13", pb: "2026-12-03" },
  ],
  /** Pattern read from the 2026 table: Planning Board on the last Thursday (first Thursday in December), deadline 63 days earlier in most rows. */
  pattern: { cutoffDaysBefore: 63, note: "last Thursday of the month; first Thursday in December" },
};
