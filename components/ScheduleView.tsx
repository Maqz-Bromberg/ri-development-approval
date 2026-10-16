"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { TREES } from "@/lib/data/trees";
import { itemKey, visibleDocs } from "@/lib/engine";
import { addDays, buildSchedule, daysBetween, fmtDate, isoDay, tickDocs, toICS, type PlannedStep, type PlannedTick } from "@/lib/schedule";
import type { Doc } from "@/lib/types";
import { DocChecklist } from "./DocChecklist";
import { useProject } from "./ProjectProvider";

const KIND_LABEL = { file: "You file", deadline: "Deadline", hearing: "Meeting or hearing", milestone: "Milestone" } as const;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function useTickState() {
  const { tree, checked, flags } = useProject();
  return (p: PlannedStep, t: PlannedTick) => {
    const docs = tickDocs(t, visibleDocs(p.step, flags));
    let done = 0, total = 0;
    docs.forEach((d) => d.checklist.forEach((_, i) => { total++; if (checked[itemKey(tree, p.step.id, d, i)]) done++; }));
    return { docs, done, total, complete: total > 0 && done === total };
  };
}

function TickPanel({ p, t, docs, onClose, onPick }: { p: PlannedStep; t: PlannedTick; docs: Doc[]; onClose: () => void; onPick?: (id: string) => void }) {
  const { flags } = useProject();
  const all = visibleDocs(p.step, flags);
  return (
    <div className="tick-panel" role="region" aria-label={`${t.label}, ${fmtDate(t.date)}`}>
      <div className="tp-head">
        <span className={`tk-badge k-${t.kind}`}>{KIND_LABEL[t.kind]}</span>
        <div>
          <b>{t.label}</b>
          <span className="muted small">
            {fmtDate(t.date, { weekday: "short", month: "short", day: "numeric", year: "numeric" })} · Step {p.step.n}: {p.step.title} · day {t.d} of {p.plan.est}
            {p.plan.statutory ? " (statutory clock)" : " (estimate)"}
          </span>
        </div>
        <button type="button" className="btn ghost small-btn" onClick={onClose}>Close</button>
      </div>
      {onPick && p.ticks.length > 1 && (
        <div className="tp-moments" role="group" aria-label="Other moments in this step">
          {p.ticks.map((o) => (
            <button key={o.id} type="button" className={`tp-moment k-${o.kind}`} aria-pressed={o.id === t.id} onClick={() => onPick(o.id)}>
              <span className="mono">{fmtDate(o.date, { month: "short", day: "numeric" })}</span> {o.label}
            </button>
          ))}
        </div>
      )}
      {t.note && <p className="tp-note">{t.note}</p>}
      {docs.length > 0 ? (
        <ul className="docs">{docs.map((d) => <DocChecklist key={d.title} stepId={p.step.id} doc={d} defaultOpen compact />)}</ul>
      ) : (
        <p className="muted small">
          Nothing to file at this moment. {all.length > 0 && <>This step has {all.length} documents. </>}
          <Link href={`/project#d-${p.step.id}`}>Open the step sheet</Link>
        </p>
      )}
      {docs.length > 0 && <p className="small"><Link href={`/project#d-${p.step.id}`}>Open the full step sheet, with sources and contacts →</Link></p>}
    </div>
  );
}

function Timeline({ plan, selected, setSelected }: { plan: PlannedStep[]; selected: string | null; setSelected: (id: string | null) => void }) {
  const tickState = useTickState();
  const { progress } = useProject();
  const min = plan[0].start;
  const max = plan.reduce((a, p) => (p.end > a ? p.end : a), min);
  const span = Math.max(1, daysBetween(min, max));
  const pct = (d: Date) => `${(daysBetween(min, d) / span) * 100}%`;

  const months: Date[] = [];
  let m = new Date(Date.UTC(min.getUTCFullYear(), min.getUTCMonth() + 1, 1));
  while (m <= max) { months.push(m); m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1)); }

  return (
    <div className="tl-scroll">
      <div className="tl-grid">
        <div className="tl-axis-label" />
        <div className="tl-axis">
          {months.map((mm) => (
            <span key={mm.toISOString()} className={`tl-month${mm.getUTCMonth() === 0 ? " year" : ""}`} style={{ left: pct(mm) }}>
              {mm.getUTCMonth() === 0 ? mm.getUTCFullYear() : fmtDate(mm, { month: "short" })}
            </span>
          ))}
        </div>
        {plan.map((p) => {
          const pr = progress(p.step);
          const sel = p.ticks.find((t) => t.id === selected);
          return (
            <Fragment key={p.step.id}>
              <div className={`tl-label${p.step.branch ? " branch" : ""}`}>
                <span className="tl-n">{p.step.n}</span>
                <span className="tl-t">
                  <b>{p.step.title}</b>
                  <span className="muted small">{fmtDate(p.start, { month: "short", day: "numeric" })} – {fmtDate(p.end, { month: "short", day: "numeric", year: "numeric" })} · {pr.done}/{pr.total}</span>
                </span>
              </div>
              <div className="tl-track">
                {months.map((mm) => <span key={mm.toISOString()} className="tl-gridline" style={{ left: pct(mm) }} />)}
                <span className={`tl-bar${p.step.branch ? " branch" : ""}${p.plan.statutory ? " statutory" : ""}`} style={{ left: pct(p.start), width: `calc(${pct(p.end)} - ${pct(p.start)})` }} />
                {p.ticks.map((t) => {
                  const st = tickState(p, t);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`tick k-${t.kind}${st.complete ? " done" : ""}${selected === t.id ? " is-open" : ""}`}
                      style={{ left: pct(t.date) }}
                      aria-expanded={selected === t.id}
                      aria-label={`${t.label}, ${fmtDate(t.date)}${st.total ? `, ${st.done} of ${st.total} checks done` : ""}`}
                      title={`${fmtDate(t.date)}: ${t.label}`}
                      onClick={() => setSelected(selected === t.id ? null : t.id)}
                    />
                  );
                })}
              </div>
              {sel && (
                <div className="tl-drop">
                  <TickPanel p={p} t={sel} docs={tickState(p, sel).docs} onClose={() => setSelected(null)} onPick={setSelected} />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function Calendar({ plan }: { plan: PlannedStep[] }) {
  const tickState = useTickState();
  const [day, setDay] = useState<string | null>(null);
  const byDay = useMemo(() => {
    const map = new Map<string, { p: PlannedStep; t: PlannedTick }[]>();
    plan.forEach((p) => p.ticks.forEach((t) => {
      const k = isoDay(t.date);
      map.set(k, [...(map.get(k) ?? []), { p, t }]);
    }));
    return map;
  }, [plan]);
  const min = plan[0].start;
  const max = plan.reduce((a, p) => (p.end > a ? p.end : a), min);
  const months: Date[] = [];
  let m = new Date(Date.UTC(min.getUTCFullYear(), min.getUTCMonth(), 1));
  while (m <= max) { months.push(m); m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1)); }

  return (
    <div className="cal-grid">
      {months.map((mm) => {
        const first = mm.getUTCDay();
        const daysIn = new Date(Date.UTC(mm.getUTCFullYear(), mm.getUTCMonth() + 1, 0)).getUTCDate();
        const monthKey = isoDay(mm).slice(0, 7);
        const events = Array.from(byDay.entries()).filter(([k]) => k.startsWith(monthKey));
        const openHere = day && day.startsWith(monthKey) ? byDay.get(day) ?? [] : [];
        return (
          <section key={monthKey} className={`cal-month${events.length ? "" : " quiet"}${openHere.length ? " has-open" : ""}`} aria-label={fmtDate(mm, { month: "long", year: "numeric" })}>
            <h3>{fmtDate(mm, { month: "long", year: "numeric" })} <span className="muted small">{events.reduce((a, [, v]) => a + v.length, 0) || ""}</span></h3>
            <div className="cal-days" role="grid">
              {WEEKDAYS.map((w) => <span key={w} className="cal-wd">{w[0]}</span>)}
              {Array.from({ length: first }).map((_, i) => <span key={`b${i}`} />)}
              {Array.from({ length: daysIn }).map((_, i) => {
                const date = addDays(mm, i);
                const k = isoDay(date);
                const ev = byDay.get(k) ?? [];
                if (!ev.length) return <span key={k} className="cal-day">{i + 1}</span>;
                const allDone = ev.every(({ p, t }) => { const s = tickState(p, t); return s.total === 0 || s.complete; });
                return (
                  <button
                    key={k}
                    type="button"
                    className={`cal-day has-ev${day === k ? " is-open" : ""}${allDone ? " done" : ""}`}
                    aria-expanded={day === k}
                    aria-label={`${fmtDate(date)}: ${ev.map(({ t }) => t.label).join("; ")}`}
                    onClick={() => setDay(day === k ? null : k)}
                  >
                    {i + 1}
                    <span className="dots">{ev.slice(0, 3).map(({ t }) => <span key={t.id} className={`dot k-${t.kind}`} />)}</span>
                  </button>
                );
              })}
            </div>
            {openHere.length > 0 && (
              <div className="cal-drop">
                {openHere.map(({ p, t }) => (
                  <TickPanel key={t.id} p={p} t={t} docs={tickState(p, t).docs} onClose={() => setDay(null)} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

export function ScheduleView() {
  const { tree, steps, inputs, setInput } = useProject();
  const [view, setView] = useState<"timeline" | "calendar">("timeline");
  const [selected, setSelected] = useState<string | null>(null);
  const plan = useMemo(() => buildSchedule(tree, steps, inputs.startDate), [tree, steps, inputs.startDate]);
  if (!plan.length) return null;

  const find = (id: string) => plan.find((p) => p.step.id === id);
  const approvalEnd = (find("record") ?? find("final") ?? find("zcheck"))?.end;
  const permit = find("building")?.end;
  const moveIn = find("occupy")?.end;
  const totalDays = daysBetween(plan[0].start, plan.reduce((a, p) => (p.end > a ? p.end : a), plan[0].start));

  const download = () => {
    const blob = new Blob([toICS(plan, `${inputs.units} units, ${inputs.zone}, Cumberland`)], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "approval-schedule.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <>
      <div className="sched-controls panel">
        <div className="field">
          <label htmlFor="f-start">Start date</label>
          <input id="f-start" type="date" value={inputs.startDate} onChange={(e) => e.target.value && setInput("startDate", e.target.value)} />
        </div>
        <div className="sched-stats">
          <div className="stat"><b>{approvalEnd ? fmtDate(approvalEnd, { month: "short", year: "numeric" }) : "—"}</b><span>approvals recorded</span></div>
          <div className="stat"><b>{permit ? fmtDate(permit, { month: "short", year: "numeric" }) : "—"}</b><span>building permit</span></div>
          <div className="stat"><b>{moveIn ? fmtDate(moveIn, { month: "short", year: "numeric" }) : "—"}</b><span>move-in</span></div>
          <div className="stat"><b>{Math.round(totalDays / 30.4)} months</b><span>start to finish</span></div>
        </div>
        <div className="sched-actions">
          <div className="seg" role="group" aria-label="View">
            <button type="button" aria-pressed={view === "timeline"} onClick={() => setView("timeline")}>Timeline</button>
            <button type="button" aria-pressed={view === "calendar"} onClick={() => setView("calendar")}>Calendar</button>
          </div>
          <button type="button" className="btn ghost" onClick={download}>Download .ics</button>
        </div>
      </div>
      <ul className="legend tick-legend" aria-label="Tick types">
        {(Object.keys(KIND_LABEL) as (keyof typeof KIND_LABEL)[]).map((k) => (
          <li key={k}><span className={`tick-key k-${k}`} />{KIND_LABEL[k]}</li>
        ))}
        <li><span className="tl-bar-key statutory" />Statutory review clock</li>
        <li><span className="tl-bar-key" />Estimate</li>
      </ul>
      <p className="muted small route-note">
        Route: <b>{TREES[tree].name}</b>. Statutory clocks run to their maximums, and the other durations are estimates.
        A tick fills in green when every checklist item it covers is ticked.
      </p>
      {view === "timeline"
        ? <Timeline plan={plan} selected={selected} setSelected={setSelected} />
        : <Calendar plan={plan} />}
    </>
  );
}
