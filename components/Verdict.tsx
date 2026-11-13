"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CONTACTS, shortName } from "@/lib/data/contacts";
import { TREES } from "@/lib/data/trees";
import { hearingBody, verdict } from "@/lib/engine";
import { buildSchedule, fmtDate } from "@/lib/schedule";
import { useProject } from "./ProjectProvider";
import { Term } from "./Term";

const months = (days: number) => Math.max(1, Math.round(days / 30.4));

/** The answer first: the route, how long the town may take, what blocks it and what is still open. */
export function Verdict({ compact = false }: { compact?: boolean }) {
  const { inputs, tree, steps } = useProject();
  const v = verdict(inputs, tree, steps);
  const plan = useMemo(() => buildSchedule(tree, steps, inputs.startDate), [tree, steps, inputs.startDate]);
  const approved = plan.find((p) => p.step.id === "record") ?? plan.find((p) => p.step.id === "final") ?? plan.find((p) => p.step.id === "zcheck");
  const state = v.fails.length ? "fail" : v.flags.length ? "flag" : "pass";
  const headline = v.fails.length
    ? "This project needs relief or a different route"
    : v.flags.length
      ? "This project can proceed, with questions to settle first"
      : "This project fits the rules as entered";
  const where = inputs.zone === "other" ? "Cumberland" : `${inputs.zone}, Cumberland`;

  return (
    <div className={`verdict v-${state}${compact ? " compact" : ""}`}>
      <p className="verdict-kicker">{inputs.units} unit{inputs.units === 1 ? "" : "s"} in {where}{inputs.address ? ` · ${inputs.address.split(",")[0]}` : ""}</p>
      <p className="verdict-head">{headline}</p>
      <dl className="verdict-facts">
        <div>
          <dt>Route</dt>
          <dd>{["major", "minor", "comp", "dpr"].includes(tree) ? <Term id={tree}>{TREES[tree].name}</Term> : TREES[tree].name}</dd>
        </div>
        <div>
          <dt>Town review</dt>
          <dd>{v.reviewDays ? <>up to {months(v.reviewDays)} months <span className="muted">({v.reviewDays} days of statutory clocks)</span></> : "no statutory review clocks"}</dd>
        </div>
        <div>
          <dt>Approval recorded</dt>
          <dd>{approved ? <>about {fmtDate(approved.end, { month: "short", year: "numeric" })} <span className="muted">from a {fmtDate(plan[0].start, { month: "short", day: "numeric" })} start</span></> : "not scheduled"}</dd>
        </div>
        <div>
          <dt>Hearings before</dt>
          <dd>{shortName(CONTACTS[hearingBody(steps)]?.name ?? "Planning Board")}</dd>
        </div>
        <div>
          <dt>State permits</dt>
          <dd>{v.statePermits.length ? v.statePermits.join(", ") : "none triggered by the facts entered"}</dd>
        </div>
      </dl>
      <ul className="verdict-issues">
        {v.fails.map((f) => <li key={f.t}><span className="st fail">Blocker</span><span>{f.t}</span></li>)}
        {v.flags.map((f) => <li key={f.t}><span className="st flag">Open</span><span>{f.t}</span></li>)}
        {!v.fails.length && !v.flags.length && <li><span className="st pass">Clear</span><span>No blockers or open questions from the facts entered.</span></li>}
      </ul>
      {compact && (
        <div className="verdict-actions">
          <Link href="/project" className="btn">Check your own project</Link>
          <Link href="/steps" className="btn ghost">See the steps</Link>
        </div>
      )}
    </div>
  );
}
