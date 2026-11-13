"use client";

import { useMemo } from "react";
import { scenarios, type Scenario } from "@/lib/whatif";
import { useProject } from "./ProjectProvider";

const months = (days: number) => Math.round(days / 30.4);

function Delta({ now, base, unit }: { now: number; base: number; unit: string }) {
  const d = now - base;
  if (!d) return <span className="delta same">same</span>;
  return <span className={`delta ${d < 0 ? "less" : "more"}`}>{d > 0 ? "+" : "−"}{Math.abs(d)} {unit}{Math.abs(d) === 1 ? "" : "s"}</span>;
}

/** The project beside the alternatives the thresholds make worth a look. */
export function WhatIf() {
  const { inputs, setInput, override, setOverride } = useProject();
  const rows = useMemo(() => scenarios(inputs), [inputs]);
  const base = rows[0];
  if (rows.length < 2) return null;

  const apply = (s: Scenario) => {
    (Object.keys(s.inputs) as (keyof typeof s.inputs)[]).forEach((k) => {
      if (s.inputs[k] !== inputs[k]) setInput(k, s.inputs[k] as never);
    });
    if (override !== "auto") setOverride("auto");
  };

  return (
    <div className="tablewrap whatif">
      <table>
        <thead>
          <tr><th>If you…</th><th>Route</th><th className="num">Steps to approval</th><th className="num">Town review</th><th className="num">Approval recorded</th><th>Blockers and open questions</th><th /></tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id} className={s.current ? "is-current" : undefined}>
              <td><b>{s.label}</b><br /><span className="muted small">{s.why}</span></td>
              <td>{s.route}</td>
              <td className="num">{s.approvalSteps}{!s.current && <><br /><Delta now={s.approvalSteps} base={base.approvalSteps} unit="step" /></>}</td>
              <td className="num">{s.reviewDays ? `${s.reviewDays} days` : "—"}{!s.current && s.reviewDays !== base.reviewDays && <><br /><Delta now={s.reviewDays} base={base.reviewDays} unit="day" /></>}</td>
              <td className="num">month {months(s.approvalDays)}{!s.current && <><br /><Delta now={months(s.approvalDays)} base={months(base.approvalDays)} unit="month" /></>}</td>
              <td>
                {s.fails > 0 && <span className="st fail">{s.fails} blocker{s.fails > 1 ? "s" : ""}</span>}{" "}
                {s.flags > 0 && <span className="st flag">{s.flags} open</span>}
                {!s.fails && !s.flags && <span className="st pass">Clear</span>}
              </td>
              <td>{s.current ? <span className="sim">Entered</span> : <button type="button" className="link-btn" onClick={() => apply(s)}>Try this</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="table-foot small muted">
        Each row is classified from its own facts, so a route override is ignored here. Town review counts statutory clocks at their maximums.
        "Approval recorded" is months from the start date, with estimates for the steps that have no clock.
      </p>
    </div>
  );
}
