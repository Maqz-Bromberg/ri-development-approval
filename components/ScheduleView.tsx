"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { calendarFor } from "@/lib/calendar";
import { CUMBERLAND_CALENDAR } from "@/lib/data/calendars/cumberland";
import { SOURCES } from "@/lib/data/sources";
import { TREES } from "@/lib/data/trees";
import { itemKey, visibleDocs } from "@/lib/engine";
import { describeSpan, spansFor } from "@/lib/timelines";
import { addDays, buildSchedule, daysBetween, fmtDate, isoDay, tickDocs, type PlannedStep, type PlannedTick } from "@/lib/schedule";
import type { Doc, TreeId } from "@/lib/types";
import { SeasonAccents } from "./Season";
import { seasonOf, type Season } from "@/lib/timelines";
import { DocChecklist } from "./DocChecklist";
import { DemoTag } from "./Demo";
import { CONTACTS } from "@/lib/data/contacts";
import { condOK } from "@/lib/engine";
import { KindChip } from "./KindChip";
import { PinButton } from "./PinButton";
import { HoverCard } from "./Popover";
import { Icon } from "./Icon";
import { useProject } from "./ProjectProvider";
import { routeText } from "@/lib/engine";

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
            {t.published ? " (published meeting date)" : t.est ? " (est., projected from the usual pattern)" : p.plan.statutory ? " (statutory clock)" : " (estimate)"}
          </span>
        </div>
        <PinButton id={`t:${t.id}`} what={t.label} />
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
      <div className="tp-who">
        <span className="rlabel">Who you deal with</span>
        {p.step.auth.filter((a) => condOK(a.cond, flags) && CONTACTS[a.c]).map((a) => <KindChip key={a.c} id={a.c} role={a.role} />)}
      </div>
      {docs.length > 0 ? (
        <ul className="docs">{docs.map((d) => <DocChecklist key={d.title} stepId={p.step.id} doc={d} defaultOpen compact />)}</ul>
      ) : (
        <p className="muted small">
          Nothing to file at this moment. {all.length > 0 && <>This step has {all.length} documents. </>}
          <Link href={`/route#d-${p.step.id}`}>Open the step</Link>
        </p>
      )}
      {docs.length > 0 && <p className="small"><Link href={`/route#d-${p.step.id}`}>Open the full step, with sources and contacts →</Link></p>}
    </div>
  );
}

/** A step's title on the chart. Where recorded projects show how long the step really took, they are in a card on hover or tap. */
function StepTitle({ p, tree }: { p: PlannedStep; tree: TreeId }) {
  const spans = spansFor(tree, p.step.id);
  if (!spans.length) return <b>{p.step.title}</b>;
  return (
    <HoverCard
      className="tl-title-card"
      label={`${p.step.title}: how long it has taken`}
      width={320}
      card={
        <>
          <b className="pop-title">{p.step.title}</b>
          {p.plan.statutory && <p>Statutory: {p.plan.est} days.</p>}
          {spans.map((sp) => <p key={sp.project}>{describeSpan(sp)}</p>)}
        </>
      }
    >
      <b>{p.step.title}</b><span className="tl-more" aria-hidden="true">{spans.length}</span>
    </HoverCard>
  );
}

function Timeline({ plan: all, tree, selected, setSelected }: { plan: PlannedStep[]; tree: TreeId; selected: string | null; setSelected: (id: string | null) => void }) {
  const tickState = useTickState();
  const { progress } = useProject();
  // The appeal only happens if a decision is denied or challenged, so it sits below the main sequence.
  const plan = [...all.filter((p) => p.step.id !== "appeal"), ...all.filter((p) => p.step.id === "appeal")];
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const min = plan[0].start;
  const max = plan.reduce((a, p) => (p.end > a ? p.end : a), min);
  const span = Math.max(1, daysBetween(min, max));
  const pct = (d: Date) => `${(daysBetween(min, d) / span) * 100}%`;

  const months: Date[] = [];
  let m = new Date(Date.UTC(min.getUTCFullYear(), min.getUTCMonth() + 1, 1));
  while (m <= max) { months.push(m); m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1)); }

  // Seasonal washes, month by month from the first day of the first month.
  const bands: { t: Date; end: Date; season: Season }[] = [];
  for (let b = new Date(Date.UTC(min.getUTCFullYear(), min.getUTCMonth(), 1)); b <= max; b = new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth() + 1, 1))) {
    bands.push({ t: b, end: new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth() + 1, 1)), season: seasonOf(b.getUTCMonth()) });
  }
  const bandStyle = (b: { t: Date; end: Date }) => ({ left: pct(b.t < min ? min : b.t), width: `calc(${pct(b.end > max ? max : b.end)} - ${pct(b.t < min ? min : b.t)})` });
  const bandEls = () => bands.map((b) => (
    <span key={b.t.toISOString()} className={`tl-sband s-${b.season}`} style={bandStyle(b)} aria-hidden="true" />
  ));
  const scatter = (lane: number) => (
    <SeasonAccents lane={lane} bands={bands.map((b) => ({ key: b.t.toISOString(), season: b.season, left: bandStyle(b).left, width: bandStyle(b).width }))} />
  );

  return (
    <div className="tl-scroll" id="gantt">
      <div className="tl-grid">
        <div className="tl-axis-label" />
        <div className="tl-axis">
          {bandEls()}
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
              {p.step.id === "appeal" && <div className="tl-divider">Only if a decision is denied or challenged</div>}
              <div className={`tl-label${p.step.branch ? " branch" : ""}`}>
                <span className="tl-n">{p.step.n}</span>
                <span className="tl-t">
                  <StepTitle p={p} tree={tree} />
                  <span className="muted small">{fmtDate(p.start, { month: "short", day: "numeric" })} – {fmtDate(p.end, { month: "short", day: "numeric", year: "numeric" })}{pr.done > 0 ? ` · ${pr.done} of ${pr.total} dealt with` : ""}</span>
                </span>
              </div>
              <div className="tl-track">
                {bandEls()}
                {plan.indexOf(p) < 4 && scatter(plan.indexOf(p))}
                {months.map((mm) => <span key={mm.toISOString()} className="tl-gridline" style={{ left: pct(mm) }} />)}
                {today >= min && today <= max && <span className="tl-today" style={{ left: pct(today) }} title={`Today, ${fmtDate(today)}`} />}
                <span className={`tl-bar${p.step.branch ? " branch" : ""}${p.plan.statutory ? " statutory" : ""}`} style={{ left: pct(p.start), width: `calc(${pct(p.end)} - ${pct(p.start)})` }} />
                {p.ticks.map((t) => {
                  const st = tickState(p, t);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      id={`m-${t.id}`}
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
    <div className="cal-rows" role="grid" aria-label="Months, one row each, 31 days across">
      <div className="cal-row cal-head" role="row" aria-hidden="true">
        <span className="cal-mh" />
        {Array.from({ length: 31 }).map((_, i) => <span key={i} className="cal-dn">{i + 1}</span>)}
      </div>
      {months.map((mm) => {
        const daysIn = new Date(Date.UTC(mm.getUTCFullYear(), mm.getUTCMonth() + 1, 0)).getUTCDate();
        const monthKey = isoDay(mm).slice(0, 7);
        const count = Array.from(byDay.entries()).filter(([k]) => k.startsWith(monthKey)).reduce((a, [, v]) => a + v.length, 0);
        const openHere = day && day.startsWith(monthKey) ? byDay.get(day) ?? [] : [];
        return (
          <Fragment key={monthKey}>
            <div className={`cal-row${count ? "" : " quiet"}${openHere.length ? " has-open" : ""}`} role="row" aria-label={fmtDate(mm, { month: "long", year: "numeric" })}>
              <span className="cal-mh" role="rowheader">
                <b>{fmtDate(mm, { month: "short" })}</b> <span>{mm.getUTCFullYear()}</span>
                {count > 0 && <small>{count} {count === 1 ? "moment" : "moments"}</small>}
              </span>
              {Array.from({ length: 31 }).map((_, i) => {
                if (i >= daysIn) return <span key={i} className="cal-day none" aria-hidden="true" />;
                const date = addDays(mm, i);
                const k = isoDay(date);
                const wd = date.getUTCDay();
                const we = wd === 0 || wd === 6 ? " we" : "";
                const ev = byDay.get(k) ?? [];
                if (!ev.length) return <span key={k} className={`cal-day${we}`} role="gridcell" title={fmtDate(date, { weekday: "short", month: "short", day: "numeric" })}><i>{WEEKDAYS[wd][0]}</i></span>;
                const allDone = ev.every(({ p, t }) => { const st = tickState(p, t); return st.total === 0 || st.complete; });
                return (
                  <button
                    key={k}
                    type="button"
                    role="gridcell"
                    className={`cal-day has-ev${we}${day === k ? " is-open" : ""}${allDone ? " done" : ""}`}
                    aria-expanded={day === k}
                    aria-label={`${fmtDate(date)}: ${ev.map(({ t }) => t.label).join("; ")}`}
                    title={`${fmtDate(date, { weekday: "short", month: "short", day: "numeric" })}: ${ev.map(({ t }) => t.label).join("; ")}`}
                    onClick={() => setDay(day === k ? null : k)}
                  >
                    <i>{WEEKDAYS[wd][0]}</i>
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
          </Fragment>
        );
      })}
    </div>
  );
}

export function ScheduleView() {
  const { tree, steps, inputs } = useProject();
  const [view, setView] = useState<"timeline" | "calendar">("timeline");
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState<"approvals" | "all">("approvals");
  const cal = calendarFor(inputs.town);
  // A link to /calendar#m-<moment> (from a step or the tray) opens that moment.
  useEffect(() => {
    const open = (id: string) => { if (id.startsWith("m-")) { setView("timeline"); setSelected(id.slice(2)); } };
    open(window.location.hash.slice(1));
    const h = (e: Event) => open(String((e as CustomEvent<string>).detail));
    window.addEventListener("goto", h);
    return () => window.removeEventListener("goto", h);
  }, []);
  const plan = useMemo(() => buildSchedule(tree, steps, inputs.startDate, inputs.town), [tree, steps, inputs.startDate, inputs.town]);
  if (!plan.length) return null;

  const anyEst = plan.some((p) => p.ticks.some((t) => t.est));
  const find = (id: string) => plan.find((p) => p.step.id === id);
  const approvalEnd = (find("record") ?? find("final") ?? find("zcheck"))?.end;
  const permit = find("building")?.end;
  const moveIn = find("occupy")?.end;
  const totalDays = daysBetween(plan[0].start, plan.reduce((a, p) => (p.end > a ? p.end : a), plan[0].start));

  // Construction is long enough to squeeze the approvals into a corner, so the default view stops at the recorded approval.
  const later = approvalEnd ? plan.filter((p) => !p.step.branch && p.start >= approvalEnd) : [];
  const early = plan.filter((p) => !later.includes(p));
  const key = (
    <ul className="tick-legend" aria-label="Key to the chart">
      {(Object.keys(KIND_LABEL) as (keyof typeof KIND_LABEL)[]).map((k) => (
        <li key={k}><span className={`tick-key k-${k}`} />{KIND_LABEL[k]}</li>
      ))}
      {view === "timeline" && <><li><span className="tl-bar-key statutory" />Statutory review clock</li><li><span className="tl-bar-key" />Estimate</li><li><span className="today-key" />Today</li></>}
      <li><DemoTag>Demo: durations other than board meetings are estimates</DemoTag></li>
    </ul>
  );

  return (
    <>
      <div className="sched-controls">
        <ol className="sched-flow" aria-label="From your start date to move-in">
          <li className="sf-start"><span className="sf-ic"><Icon name="flag" size={18} /></span><span className="sf-t">Start</span><b>{fmtDate(plan[0].start, { month: "short", day: "numeric", year: "numeric" })}</b></li>
          <li><span className="sf-ic"><Icon name="stamp" size={18} /></span><span className="sf-t">approvals recorded</span><b>{approvalEnd ? fmtDate(approvalEnd, { month: "short", year: "numeric" }) : "—"}</b></li>
          <li><span className="sf-ic"><Icon name="permit" size={18} /></span><span className="sf-t">building permit</span><b>{permit ? fmtDate(permit, { month: "short", year: "numeric" }) : "—"}</b></li>
          <li><span className="sf-ic"><Icon name="key" size={18} /></span><span className="sf-t">move-in</span><b>{moveIn ? fmtDate(moveIn, { month: "short", year: "numeric" }) : "—"}</b></li>
        </ol>
        <p className="sf-total"><span aria-hidden="true" className="sf-brace" /><span><b>{Math.round(totalDays / 30.4)} months</b> start to finish</span></p>
      </div>
      <p className="muted small route-note">
        Route: <b>{routeText(tree).name}</b>. Statutory clocks run to their maximums, and the other durations are estimates.{" "}
        {cal ? (
          <>
            {cal.town === "Cumberland" ? "Planning Board and Technical Review Committee" : "City Plan Commission"} dates come from {cal.town}'s published {cal.year} schedule
            (<a href={SOURCES[cal.src].url} target="_blank" rel="noreferrer">meeting schedule and deadlines</a>, read {cal.read}).
            Dates after it are projected from the board's usual pattern ({cal.pattern.note}) and marked <b>est.</b>{" "}
            {cal.town === "Providence" && " In 2026 several meetings were held on other days than the schedule gave, so confirm each date against the agenda."}
          </>
        ) : (
          <>Hearing dates for {inputs.town} are estimates: its board's meeting calendar has not been read yet.</>
        )}{" "}
        Confirm every date with the Planning Department before relying on it.
        {anyEst && " Some hearings in this plan fall beyond the published calendar."}
      </p>
      <div className="zoom-row">
        <div className="seg" role="group" aria-label="View">
          <button type="button" aria-pressed={view === "timeline"} onClick={() => setView("timeline")}>Gantt</button>
          <button type="button" aria-pressed={view === "calendar"} onClick={() => setView("calendar")}>Month</button>
        </div>
        {view === "timeline" && (
          <>
              <div className="seg small-seg" role="group" aria-label="Timeline range">
                <button type="button" aria-pressed={zoom === "approvals"} onClick={() => setZoom("approvals")}>Approvals</button>
                <button type="button" aria-pressed={zoom === "all"} onClick={() => setZoom("all")}>Through move-in</button>
              </div>
              {zoom === "approvals" && later.length > 0 && (
                <span className="muted small">After approval: {later.map((p) => p.step.title.toLowerCase()).join(", then ")}. <button type="button" className="link-btn" onClick={() => setZoom("all")}>Show them</button></span>
              )}
          </>
        )}
      </div>
      <div className="chart-box">
        {key}
        {view === "timeline"
          ? <Timeline tree={tree} plan={zoom === "approvals" && early.length ? early : plan} selected={selected} setSelected={setSelected} />
          : <Calendar plan={plan} />}
      </div>
    </>
  );
}
