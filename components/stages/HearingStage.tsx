"use client";

import { useMemo, useState } from "react";
import { CONTACTS, shortName } from "@/lib/data/contacts";
import { hearingBody } from "@/lib/engine";
import { fmtDate } from "@/lib/schedule";
import { ObjectionGuide } from "../ObjectionGuide";
import { useProject } from "../ProjectProvider";
import { useStageFacts } from "../useStages";
import { Band } from "./Band";

/** Hearing: a band with the date, place, notice date and board (a switch for routes with two hearings), then the questions in two columns. */
export function HearingStage() {
  const { steps, hearing } = useProject();
  const { plan } = useStageFacts();
  const body = hearingBody(steps);
  const board = CONTACTS[body];
  const stages = useMemo(() => plan.filter((p) => p.ticks.some((t) => t.kind === "hearing" && t.cal === "pb")), [plan]);
  const [which, setWhich] = useState(0);
  const cur = stages[Math.min(which, stages.length - 1)];
  const hear = cur?.ticks.find((t) => t.kind === "hearing" && t.cal === "pb");
  const notice = cur?.ticks.find((t) => t.cal === "notice");
  const where = board?.lines.find(([k]) => /where/i.test(k))?.[1];

  return (
    <div className="stage">
      <Band id="hear" title={`${shortName(board?.name ?? "Planning Board")} hearing prep`} lead="The questions neighbours and board members ask, each matched to times it was raised in the town's own records, with what the applicant did and how the board voted." >
        {stages.length > 1 && (
          <div className="seg" role="group" aria-label="Which hearing">
            {stages.map((p, i) => <button key={p.step.id} type="button" aria-pressed={i === which} onClick={() => setWhich(i)}>{p.step.title}</button>)}
          </div>
        )}
      </Band>
      <section className="hear-facts" aria-label="The hearing">
        <dl>
          <div><dt>Date</dt><dd>{hear ? <>{fmtDate(hear.date, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}{hear.est && <span className="muted small"> est.</span>}</> : "not scheduled"}</dd></div>
          <div><dt>Place</dt><dd>{where ?? "see the board's agenda"}</dd></div>
          <div><dt>Notice by</dt><dd>{notice ? fmtDate(notice.date, { month: "short", day: "numeric", year: "numeric" }) : "14 days before"}</dd></div>
          <div><dt>Board</dt><dd>{shortName(board?.name ?? "Planning Board")}</dd></div>
        </dl>
        <p className="small muted">Confirm the date, place and notice with the board&apos;s agenda. {hearing.length} question{hearing.length === 1 ? "" : "s"} on your sheet.</p>
      </section>
      <ol className="howto">
        <li><b>Acknowledge it.</b> Repeat the concern in the neighbour&apos;s words, so they know they were heard.</li>
        <li><b>Answer with a fix.</b> Offer a planting, a fence, a fixture or a schedule, not an argument.</li>
        <li><b>Point to the sheet.</b> Name the plan sheet or report that shows it.</li>
        <li><b>Offer a condition.</b> Tell the board you&apos;ll accept the fix as a condition of approval.</li>
      </ol>
      <div id="hear-sheet" />
      <div id="hear-list"><ObjectionGuide /></div>
    </div>
  );
}
