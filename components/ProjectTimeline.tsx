"use client";

import Link from "next/link";
import { useMemo } from "react";
import { precedentId } from "@/lib/data/history";
import { SOURCES } from "@/lib/data/sources";
import { TREES } from "@/lib/data/state/trees";
import { APPROVAL, approvalOf, EVIDENCE, evidenceOf, eventRange, eventTime, fmtEventDate, isMonthOnly, seasonOf, spanDays, spansOfProject, unitColor, unitScale, type Span } from "@/lib/timelines";
import type { Precedent, TimelineEvent } from "@/lib/types";
import { HoverCard } from "./Popover";
import { SeasonAccents } from "./Season";
import { routeText } from "@/lib/engine";

const DAY = 86400000;
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** A decision's card carries how long its stage took, as a footnote, so the lanes are not broken by a row of figures. */
function EventCard({ h, e, span }: { h: Precedent; e: TimelineEvent; span?: Span }) {
  const ev = evidenceOf(e);
  return (
    <div className="pt-card">
      <span className="pt-card-date mono">{fmtEventDate(e.date)}{isMonthOnly(e.date) && <i> · day not known</i>}</span>
      <b>{e.what}</b>
      <p className="muted small">{h.name} · {routeText(h.route, h.town).name}</p>
      <p className={`pt-ev-badge e-${ev}`}><b>{EVIDENCE[ev].label}.</b> {EVIDENCE[ev].how}</p>
      {e.unverified && <p className="small">{e.unverified}</p>}
      {e.quote && <blockquote className="small">“{e.quote}”</blockquote>}
      <p className="small">{e.src.map((s) => SOURCES[s] && <a key={s} href={SOURCES[s].url} target="_blank" rel="noopener noreferrer">{SOURCES[s].label}</a>).reduce<React.ReactNode[]>((a, x, i) => (i ? [...a, " · ", x] : [x]), [])}</p>
      {span && (
        <div className="pt-foot small">
          <b>{span.approx ? "≈ " : ""}{spanDays(span)} for the {span.stage} stage</b>, from {fmtEventDate(span.from)} to {fmtEventDate(span.to)}.{" "}
          Computed from the dates, not typed.{span.continuances ? ` ${span.continuances} continuance${span.continuances > 1 ? "s" : ""} in between.` : ""}{" "}
          {span.approx ? <><b>Approximate</b> because {span.why.join(" and ")}.</> : "Both dates are exact."}
        </div>
      )}
    </div>
  );
}

/** A mark for how far a project has been approved: yellow to green ticks as it gets further, a red cross if denied. */
function ApprovalMark({ h }: { h: Precedent }) {
  const { degree, event } = approvalOf(h);
  return (
    <HoverCard
      className={`pt-appr a-${degree}`}
      label={`${h.name}: ${APPROVAL[degree].label}. ${h.statusLabel}`}
      width={300}
      card={
        <div className="pt-card">
          <b>{APPROVAL[degree].label}</b>
          <p>{h.statusLabel}</p>
          {event && <p className="small">Latest decision on a review stage, {fmtEventDate(event.date)}: {event.what}</p>}
          <p className="muted small">{routeText(h.route, h.town).name} · {h.units} units{h.aff ? `, ${h.aff} affordable` : ""}</p>
        </div>
      }
    >
      <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
        {degree === "denied"
          ? <><circle cx="10" cy="10" r="8.5" /><path d="M6.6 6.6l6.8 6.8M13.4 6.6l-6.8 6.8" /></>
          : degree === "none"
            ? <><circle cx="10" cy="10" r="8.5" /><path d="M6.5 10h7" /></>
            : <><circle cx="10" cy="10" r="8.5" /><path d="M5.8 10.4l2.8 2.8 5.6-6" /></>}
      </svg>
    </HoverCard>
  );
}

/**
 * The records as swim lanes on one calendar. Unit counts are coloured on a gradient scaled to these projects, a month-only
 * date is drawn as a band across the month, and a date not yet checked against a document is a hollow marker.
 */
/** `onOpen` shows a project's full record (the table row); the name in each lane calls it. */
export function ProjectTimeline({ rows, onOpen }: { rows: Precedent[]; onOpen?: (name: string) => void }) {
  const g = useMemo(() => {
    const all = rows.flatMap((h) => h.events.map((e) => eventTime(e.date)));
    const latest = Math.max(...all);
    // A project whose events are all years older than the rest is pinned at the left edge, not allowed to flatten the scale.
    const floor = latest - 4 * 365 * DAY;
    const recent = all.filter((t) => t >= floor);
    const first = new Date(Math.min(...recent));
    const last = new Date(latest);
    const start = Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1);
    const end = Date.UTC(last.getUTCFullYear(), last.getUTCMonth() + 1, 1);
    const months: { t: number; m: number; y: number }[] = [];
    for (let t = start; t < end;) { const d = new Date(t); months.push({ t, m: d.getUTCMonth(), y: d.getUTCFullYear() }); t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1); }
    return { start, end, months, floor };
  }, [rows]);
  const scale = useMemo(() => unitScale(rows.map((h) => h.units)), [rows]);
  const span = g.end - g.start;
  const pct = (t: number) => `${Math.max(0, Math.min(100, ((t - g.start) / span) * 100))}%`;
  const lo = Math.min(...rows.map((h) => h.units)), hi = Math.max(...rows.map((h) => h.units));

  return (
    <div className="pt">
      <div className="pt-key" aria-label="Key">
        <span className="pt-grad">
          <span>{lo} unit{lo === 1 ? "" : "s"}</span>
          <i className="pt-grad-bar" aria-hidden="true" style={{ background: `linear-gradient(90deg, ${unitColor(0).bg}, ${unitColor(1).bg})` }} />
          <span>{hi} units</span>
        </span>
        <span className="muted small">Unit colour is scaled to the projects shown, not to a fixed size.</span>
        <ul className="pt-marks">
          <li><i className="pt-dot k-heard" /> Heard</li>
          <li><i className="pt-dot k-continued" /> Continued</li>
          <li><i className="pt-dot k-decided" /> Decided</li>
          <li><i className="pt-dot k-certified" /> Certified complete</li>
          <li><i className="pt-dot k-reported" /> Press report</li>
          <li><i className="pt-dot k-heard is-unchecked" /> Date not yet checked</li>
          <li><i className="pt-fuzz-key" /> Month known, day not</li>
        </ul>
        <ul className="pt-marks pt-appr-key" aria-label="Approval column">
          {(["master", "prelim", "final", "denied"] as const).map((d) => (
            <li key={d}><span className={`pt-appr a-${d} is-key`}><svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><circle cx="10" cy="10" r="8.5" />{d === "denied" ? <path d="M6.6 6.6l6.8 6.8M13.4 6.6l-6.8 6.8" /> : <path d="M5.8 10.4l2.8 2.8 5.6-6" />}</svg></span> {APPROVAL[d].label}</li>
          ))}
        </ul>
      </div>
      <div className="pt-scroll">
        <div className="pt-grid">
          <div />
          <div className="pt-appr-h" title="How far each project has been approved. Hover a mark for the record.">Approved</div>
          <div className="pt-axis">
            {g.months.map((m, i) => (
              <span key={m.t} className={`pt-m s-${seasonOf(m.m)}`} style={{ left: pct(m.t), width: `calc(${pct(i + 1 < g.months.length ? g.months[i + 1].t : g.end)} - ${pct(m.t)})` }}>
                {(m.m === 0 || i === 0) ? <b>{m.y}</b> : null}
                <span className="pt-mn">{MON[m.m][0]}</span>
              </span>
            ))}
          </div>
          {rows.map((h, idx) => {
            const c = unitColor(scale(h.units));
            const spans = spansOfProject(h);
            const earlier = h.events.filter((e) => eventTime(e.date) < g.floor);
            return (
              <div className="pt-lane" key={h.name}>
                <div className="pt-name">
                  <span className="pt-units" style={{ background: c.bg, color: c.fg }} title={`${h.units} units${h.aff ? `, ${h.aff} affordable` : ""}`}>{h.units}</span>
                  <span>{onOpen ? <button type="button" className="link-btn pt-open" onClick={() => onOpen(h.name)} title="Open its full record in the table"><b>{h.name}</b></button> : <b>{h.name}</b>}</span>
                </div>
                <div className="pt-appr-cell"><ApprovalMark h={h} /></div>
                <div className="pt-track">
                  {g.months.map((m, i) => (
                    <span key={m.t} className={`pt-band s-${seasonOf(m.m)}`} style={{ left: pct(m.t), width: `calc(${pct(i + 1 < g.months.length ? g.months[i + 1].t : g.end)} - ${pct(m.t)})` }} />
                  ))}
                  <SeasonAccents lane={idx} seed={h.name} share={(0.3 * Math.min(rows.length, 4)) / rows.length} bands={g.months.map((m, i) => ({ key: String(m.t), season: seasonOf(m.m), left: pct(m.t), width: `calc(${pct(i + 1 < g.months.length ? g.months[i + 1].t : g.end)} - ${pct(m.t)})` }))} />
                  <span className="pt-line" style={{ left: pct(Math.min(...h.events.map((e) => eventTime(e.date)))), width: `calc(${pct(Math.max(...h.events.map((e) => eventTime(e.date))))} - ${pct(Math.min(...h.events.map((e) => eventTime(e.date))))})` }} />
                  {h.events.map((e) => {
                    const old = eventTime(e.date) < g.floor;
                    const span = e.kind === "decided" ? spans.find((x) => x.stage === e.stage && x.to === e.date) : undefined;
                    const [a, b] = eventRange(e.date);
                    return (
                      <span key={e.date + e.what} className="pt-at" style={{ left: old ? "0%" : pct(eventTime(e.date)) }}>
                        {isMonthOnly(e.date) && !old && <span className="pt-fuzz" style={{ left: `calc(${pct(a)} - ${pct(eventTime(e.date))})`, width: `calc(${pct(b + DAY)} - ${pct(a)})` }} aria-hidden="true" />}
                        <HoverCard
                          className={`pt-pt k-${e.kind}${e.unverified ? " is-unchecked" : ""}`}
                          label={`${fmtEventDate(e.date)}: ${e.what}${span ? `, ${spanDays(span)} for the stage` : ""}`}
                          width={340}
                          card={<EventCard h={h} e={e} span={span} />}
                        >
                          <span className="pt-dotmark" />
                        </HoverCard>
                      </span>
                    );
                  })}
                  {earlier.length > 0 && <span className="pt-early small">◂ {earlier.map((e) => fmtEventDate(e.date)).join(", ")}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="muted small">
        Hover or tap a marker for the source, what backs it and how far it can be trusted. A decision&apos;s marker also says how long its stage took. <Link href="/verification">How the records are checked</Link>
        {" · "}<Link href="/site?map=route">Open in the zoning map</Link>
        {" · "}<Link href="/after-approval">From build: after approval</Link>
      </p>
    </div>
  );
}
