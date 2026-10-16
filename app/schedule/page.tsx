import type { Metadata } from "next";
import { ScheduleView } from "@/components/ScheduleView";

export const metadata: Metadata = { title: "Schedule" };

export default function SchedulePage() {
  return (
    <section className="sec" aria-labelledby="sched-h">
      <div className="sec-head">
        <div>
          <p className="eyebrow">From start to completion</p>
          <h1 id="sched-h" className="h2">Your approval schedule</h1>
        </div>
        <p>
          Every step laid out from your start date. Select a tick on the timeline, or a marked day on the calendar, to open the
          documents and checklist items due at that moment.
        </p>
      </div>
      <ScheduleView />
    </section>
  );
}
