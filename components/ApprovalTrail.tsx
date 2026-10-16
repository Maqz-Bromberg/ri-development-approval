"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CONTACTS, KIND_LABEL, shortName } from "@/lib/data/contacts";
import { TREES } from "@/lib/data/trees";
import { OBJECTIONS } from "@/lib/data/objections";
import { visibleDocs } from "@/lib/engine";
import { buildSchedule, fmtDate } from "@/lib/schedule";
import { useProject } from "./ProjectProvider";
import { Vignette, Walker } from "./Vignettes";

const W = 1400;
const H = 470;
const X0 = 90;
const X1 = 1310;

/** The trail's centre line: a gentle wave across the scene. */
function trailY(x: number): number {
  return 252 + 34 * Math.sin((x / W) * Math.PI * 2.4 + 0.6) + 10 * Math.sin((x / W) * Math.PI * 7);
}

const SHORT: Record<string, string> = {
  zoning: "Zoning check", rezone: "Zone change", preapp: "Pre-application", master: "Master plan",
  state: "State permits", prelim: "Preliminary plan", final: "Final plan", record: "Record the plan",
  building: "Building permit", occupy: "Move in", elig: "Eligibility", zcheck: "Plot plan",
};

export function ApprovalTrail() {
  const { steps, tree, flags, progress, current, inputs } = useProject();
  const schedule = useMemo(() => buildSchedule(tree, steps, inputs.startDate), [tree, steps, inputs.startDate]);
  const trail = useMemo(() => steps.map((s, i) => ({ s, i })).filter(({ s }) => !s.branch), [steps]);
  const currentPos = Math.max(0, trail.findIndex(({ i }) => i === current));
  const [selected, setSelected] = useState<number | null>(null);
  const sel = selected ?? currentPos;
  const scroller = useRef<HTMLDivElement>(null);

  const d = useMemo(() => {
    const pts: string[] = [];
    for (let x = 0; x <= W; x += 10) pts.push(`${x === 0 ? "M" : "L"}${x},${trailY(x).toFixed(1)}`);
    return pts.join(" ");
  }, []);

  const xs = trail.map((_, k) => (trail.length === 1 ? (X0 + X1) / 2 : X0 + (k * (X1 - X0)) / (trail.length - 1)));
  const walkerX = xs[currentPos] ?? X0;

  // On narrow screens the scene scrolls sideways; bring the walker into view.
  useEffect(() => {
    const el = scroller.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    el.scrollLeft = Math.max(0, (walkerX / W) * el.scrollWidth - el.clientWidth / 2);
  }, [walkerX]);

  const picked = trail[sel];
  const step = picked?.s;
  const prog = step ? progress(step) : { done: 0, total: 0 };
  const objections = (step?.objections ?? []).map((id) => OBJECTIONS.find((o) => o.id === id)).filter(Boolean);

  return (
    <div className="trail">
      <div className="trail-scroll" ref={scroller}>
        <svg viewBox={`0 0 ${W} ${H}`} className="trail-svg" role="group" aria-label={`Approval trail: ${TREES[tree].name}, ${trail.length} steps`}>
          {/* scenery */}
          <rect x="0" y="0" width={W} height={H} fill="var(--sky)" />
          <circle cx="1270" cy="70" r="38" fill="var(--sun)" />
          <g fill="var(--surface)" opacity="0.95">
            <ellipse cx="230" cy="62" rx="54" ry="18" /><ellipse cx="262" cy="50" rx="34" ry="20" />
            <ellipse cx="760" cy="48" rx="46" ry="15" /><ellipse cx="790" cy="38" rx="28" ry="16" />
          </g>
          <ellipse cx="260" cy="470" rx="520" ry="250" fill="var(--hill-far)" />
          <ellipse cx="1080" cy="480" rx="560" ry="260" fill="var(--hill-far)" />
          <ellipse cx="700" cy="520" rx="900" ry="250" fill="var(--hill-near)" />
          {/* the path */}
          <path d={d} fill="none" stroke="var(--path-edge)" strokeWidth="44" strokeLinecap="round" />
          <path d={d} fill="none" stroke="var(--path)" strokeWidth="36" strokeLinecap="round" />
          <path d={d} fill="none" stroke="var(--surface)" strokeWidth="3" strokeDasharray="2 16" strokeLinecap="round" opacity="0.9" />

          {trail.map(({ s }, k) => {
            const x = xs[k];
            const y = trailY(x);
            const up = k % 2 === 0;
            const p = progress(s);
            const done = p.total > 0 && p.done === p.total;
            const isSel = k === sel;
            return (
              <g
                key={s.id}
                className={`milestone${isSel ? " is-selected" : ""}${done ? " is-done" : ""}`}
                role="button"
                tabIndex={0}
                aria-pressed={isSel}
                aria-label={`Step ${s.n}: ${s.title}. ${p.done} of ${p.total} checks done.`}
                onClick={() => setSelected(k)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(k); } }}
              >
                <g transform={`translate(${x - 60} ${up ? y - 156 : y + 52})`} className="vignette">
                  <Vignette id={s.id} />
                </g>
                <line x1={x} y1={up ? y - 46 : y + 52} x2={x} y2={up ? y - 22 : y + 22} stroke="var(--path-edge)" strokeWidth="2" strokeDasharray="3 4" />
                {done && (
                  <g transform={`translate(${x + 18} ${y - 4})`}>
                    <line x1="0" y1="0" x2="0" y2="-34" stroke="var(--ink)" strokeWidth="2" />
                    <polygon points="0,-34 18,-28 0,-22" fill="var(--stamp)" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
                  </g>
                )}
                <circle cx={x} cy={y} r={isSel ? 21 : 18} className="ms-dot" />
                <text x={x} y={y + 6} textAnchor="middle" className="ms-num">{s.n}</text>
                <text x={x} y={up ? y + 44 : y - 32} textAnchor="middle" className="ms-label">{SHORT[s.id] ?? s.title}</text>
              </g>
            );
          })}

          <g className="walker" style={{ transform: `translate(${walkerX - 44}px, ${trailY(walkerX - 44) + 8}px)` }} aria-hidden="true">
            <Walker />
          </g>
        </svg>
      </div>

      {step && (
        <div className="trail-card" aria-live="polite">
          <div className="trail-card-head">
            <span className="tc-num">{step.n}</span>
            <div>
              <p className="eyebrow">{sel === currentPos ? "You are here" : `Step ${step.n} of ${trail.length}`}</p>
              <h3>{step.title}</h3>
            </div>
            <span className="chip clk">{step.clock.text}</span>
            {(() => {
              const planned = schedule.find((p) => p.step.id === step.id);
              return planned ? (
                <Link href="/schedule" className="chip date-chip" title="See it on the schedule">
                  {fmtDate(planned.start, { month: "short", day: "numeric", year: "numeric" })} → {fmtDate(planned.end, { month: "short", day: "numeric", year: "numeric" })}
                </Link>
              ) : null;
            })()}
          </div>
          <p className="tc-what">{step.what}</p>
          <div className="tc-grid">
            <div>
              <h4>Who decides</h4>
              <ul className="who-list">
                {step.auth.filter((a) => !a.cond || a.cond.split("|").some((k) => flags[k as keyof typeof flags])).map((a) => {
                  const c = CONTACTS[a.c];
                  return <li key={a.c} className={`k-${c.kind}`}><span className="sw" /><b>{shortName(c.name)}</b><span className="muted"> · {KIND_LABEL[c.kind]}</span></li>;
                })}
              </ul>
            </div>
            <div>
              <h4>What you hand over</h4>
              <p className="tc-app">{step.app}</p>
              <p className="muted small">{visibleDocs(step, flags).length} documents, {prog.total} checklist items</p>
              <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={prog.total} aria-valuenow={prog.done} aria-label="Checklist progress">
                <span style={{ width: `${prog.total ? (prog.done / prog.total) * 100 : 0}%` }} />
              </div>
              <p className="muted small">{prog.done} of {prog.total} checked</p>
            </div>
          </div>
          <div className="tc-actions">
            <Link href={`/project#d-${step.id}`} className="btn">Open the checklist</Link>
            {objections.length > 0 && (
              <Link href={`/objections#${objections[0]!.id}`} className="btn ghost">
                {objections.length} objections to prepare for
              </Link>
            )}
            <span className="muted small">Select any stop on the trail to preview it.</span>
          </div>
        </div>
      )}
    </div>
  );
}
