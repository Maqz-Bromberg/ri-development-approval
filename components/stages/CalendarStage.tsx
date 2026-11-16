"use client";

import { ScheduleView } from "../ScheduleView";
import { Band, Continue } from "./Band";

/** Calendar: one Gantt chart with a panel under the chosen moment, and the month calendar as a second view. The start date, key and files are in the rail. */
export function CalendarStage() {
  return (
    <div className="stage">
      <Band id="cal" title="Your approval schedule" lead="Every step laid out from your start date. Select a tick on the Gantt chart, or a marked day on the month view, to open the documents and checklist items due at that moment, and who you deal with." />
      <ScheduleView />
      <Continue id="cal" />
    </div>
  );
}
