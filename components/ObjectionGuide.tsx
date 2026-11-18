"use client";

import Link from "next/link";
import { minutesLine, primaryBody } from "@/lib/data/bodies";
import { useEffect, useMemo, useState } from "react";
import { OBJECTIONS, WEIGHT_LABEL } from "@/lib/data/objections";
import { CONTACTS, shortName } from "@/lib/data/contacts";
import { district } from "@/lib/data/atlas";
import { hearingBody } from "@/lib/engine";
import { LOCALITIES } from "@/lib/data/records";
import { SOURCES, isRecording } from "@/lib/data/sources";
import { fmtDate, parseISO } from "@/lib/schedule";
import { sourceKind as srcKind } from "@/lib/sourceKind";
import type { Heard, MediaItem, Objection, ProjectInputs } from "@/lib/types";
import { DemoTag } from "./Demo";
import { useProject } from "./ProjectProvider";
import { PinButton } from "./PinButton";
import { Gloss } from "./Term";

const TOPICS = Array.from(new Set(OBJECTIONS.map((o) => o.topic)));
const TOPIC_NOTE: Record<Objection["topic"], string> = {
  "Traffic and parking": "Trips, streets, spaces",
  "Next door": "Noise, light, screening",
  "Water and environment": "Runoff, wells, trees",
  "Size and character": "Density, design, fit",
  "Services": "Schools, fire, utilities",
  "Who will live there": "Tenants, affordability",
};

/** A mark per topic, in the same line style as the zoning marks. */
function TopicIcon({ topic }: { topic: Objection["topic"] | "all" }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg className="topic-icon" width="24" height="24" viewBox="0 0 20 20" aria-hidden="true">
      {topic === "all" && <g {...p}><rect x="3" y="3" width="5.5" height="5.5" /><rect x="11.5" y="3" width="5.5" height="5.5" /><rect x="3" y="11.5" width="5.5" height="5.5" /><rect x="11.5" y="11.5" width="5.5" height="5.5" /></g>}
      {topic === "Traffic and parking" && <g {...p}><path d="M3 13V10l1.7-4h10.6L17 10v3z" /><path d="M3 10h14" /><path d="M5 13v2.5M15 13v2.5" /><circle cx="6.2" cy="11.7" r=".4" /><circle cx="13.8" cy="11.7" r=".4" /></g>}
      {topic === "Next door" && <g {...p}><path d="M1.5 17V9.5L6 6l4.5 3.5V17z" /><path d="M10.5 17v-6l4-3 4 3v6z" /><path d="M4.5 17v-3.5h3V17" /></g>}
      {topic === "Water and environment" && <g {...p}><path d="M10 2.5S4.5 8.5 4.5 12a5.5 5.5 0 0 0 11 0C15.5 8.5 10 2.5 10 2.5z" /><path d="M7.5 12.5a2.7 2.7 0 0 0 2.5 2.5" /></g>}
      {topic === "Size and character" && <g {...p}><path d="M4 17V4h8v13" /><path d="M12 8h4v9" /><path d="M2.5 17h15" /><path d="M6.5 7h3M6.5 10h3M6.5 13h3" /></g>}
      {topic === "Services" && <g {...p}><rect x="3" y="3" width="14" height="14" rx="2" /><path d="M10 6.5v7M6.5 10h7" /></g>}
      {topic === "Who will live there" && <g {...p}><circle cx="7" cy="6.5" r="2.5" /><path d="M2.5 16.5c0-3 2-4.7 4.5-4.7s4.5 1.7 4.5 4.7" /><circle cx="14" cy="7.5" r="2" /><path d="M13.5 11.8c2.2.1 4 1.500 4 4.200" /></g>}
    </svg>
  );
}

const MEDIA_LABEL: Record<MediaItem["kind"], string> = { video: "Video", minutes: "Minutes", memo: "Staff memo", news: "Press", livestream: "Live stream", testimony: "Testimony" };

function heardDate(h: Heard): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(h.date) ? fmtDate(parseISO(h.date)) : h.date;
}

function HeardList({ items }: { items: Heard[] }) {
  return (
    <ul className="heard">
      {items.map((h, i) => (
        <li key={i}>
          <div className="heard-meta">
            <span className="mono small">{heardDate(h)}</span> · <span>{h.body}</span> · <b>{h.project}</b>
          </div>
          <p><span className="who">{h.who}:</span> {h.said}</p>
          {h.answer && <p className="answer"><span className="who">Response:</span> {h.answer}</p>}
          {h.outcome && <span className="outcome">{h.outcome}</span>}
          <span className="heard-src">
            {h.src.map((s, n) => SOURCES[s] && (
              <a key={s} href={n === 0 && h.t && isRecording(s) ? `${SOURCES[s].url}&t=${h.t}s` : SOURCES[s].url} target="_blank" rel="noopener noreferrer" title={SOURCES[s].label}>{srcKind(s)} ↗</a>
            ))}
            {isRecording(h.src[0] ?? "") && <span className="heard-machine" title="From the automatic captions of the recording. Captions mishear names, numbers and addresses, so listen at the linked time before relying on it.">Machine transcript</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The same answer with the figures from the project entered, where the question turns on a number. */
function yourNumbers(id: string, i: ProjectInputs): string | null {
  // The figures are per dwelling unit; a commercial project has none.
  if (i.kind === "commercial") return null;
  if (id === "traffic") {
    const day = Math.round(i.units * 6.5);
    const peak = Math.max(1, Math.round(i.units * 0.5));
    return `${i.units} units adds about ${day} vehicle trips a day and about ${peak} in the busiest hour, roughly one every ${Math.round(60 / peak)} minutes (ITE low-rise multifamily rates).`;
  }
  if (id === "parking" && i.units >= 3) {
    // Cumberland's ordinance has required one space per unit since April 2026 (§ 14-3); elsewhere the Atlas figure.
    const per = i.transit || i.town === "Cumberland" ? 1 : parseFloat(district(i.zone)?.family4_minparking_2br ?? "2") || 2;
    return `${i.units} units at ${per} per unit means ${i.units * per} required spaces${i.transit ? " (the 2026 transit cap)" : ""}. Say how many you provide beyond that.`;
  }
  if (id === "character" && i.lot > 0) {
    return `${i.units} units on ${(i.lot / 43560).toFixed(2)} acres is ${(i.units / (i.lot / 43560)).toFixed(1)} units per acre. Compare it with the density of the nearest existing multifamily housing.`;
  }
  return null;
}

export function ObjectionGuide() {
  const { inputs, steps, hearing, toggleHearing } = useProject();
  // The questions picked for the sheet are part of the project: saved in the browser, the link and the project file.
  const picked = new Set(hearing);
  const [loc, setLoc] = useState("cumberland");
  const [topic, setTopic] = useState<Objection["topic"] | "all">("all");
  const [target, setTarget] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const locality = LOCALITIES.find((l) => l.id === loc)!;
  // Follow the project's town when its hearings have been read, until the visitor picks another.
  useEffect(() => {
    const own = LOCALITIES.find((l) => l.name === inputs.town && l.indexed);
    setLoc(own ? own.id : "cumberland");
  }, [inputs.town]);
  const body = shortName(CONTACTS[hearingBody(steps)]?.name ?? "Planning Board");

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) {
      setTarget(id);
      setOpen(new Set([id]));
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 50);
    }
  }, []);

  // The tray and the rail ask for a question by its id; open it.
  useEffect(() => {
    const h = (e: Event) => { const id = String((e as CustomEvent<string>).detail); if (OBJECTIONS.some((o) => o.id === id)) { setTarget(id); setOpen((p) => new Set(p).add(id)); } };
    window.addEventListener("goto", h);
    return () => window.removeEventListener("goto", h);
  }, []);

  const flip = (set: (fn: (prev: Set<string>) => Set<string>) => void, id: string) => set((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const printSheet = () => {
    const root = document.documentElement;
    root.classList.add("print-sheet");
    const done = () => { root.classList.remove("print-sheet"); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    window.print();
  };

  const localHeard = (o: Objection) => o.heard.filter((h) => h.locality === loc || (loc === "cumberland" && h.locality === "statewide"));
  const ranked = useMemo(
    () => [...OBJECTIONS].sort((a, b) => localHeard(b).length - localHeard(a).length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loc],
  );
  const q = query.trim().toLowerCase();
  const matches = (o: Objection) => !q || [o.topic, o.said, o.say, o.response, o.boardView, ...o.heard.map((h) => h.said)].some((t) => t.toLowerCase().includes(q));
  const shown = ranked.filter((o) => (topic === "all" || o.topic === topic || o.id === target) && matches(o));
  const totalHeard = OBJECTIONS.reduce((a, o) => a + localHeard(o).length, 0);
  const hearings = new Set(OBJECTIONS.flatMap((o) => localHeard(o).map((h) => `${h.date}|${h.project}`))).size;

  return (
    <>
      <section className="sec no-print" aria-labelledby="loc-h">
        <div className="loc-bar">
          <label htmlFor="f-loc" className="loc-label" id="loc-h">Whose hearings?</label>
          <select id="f-loc" value={loc} onChange={(e) => setLoc(e.target.value)}>
            {LOCALITIES.map((l) => <option key={l.id} value={l.id}>{l.name}{l.indexed ? "" : " (records not yet read)"}</option>)}
          </select>
          <span className="muted small">
            {locality.indexed
              ? `${totalHeard} documented concerns from ${hearings} hearings and memos, read from ${locality.id === "providence" ? "City Plan Commission minutes, staff reports, one court decision and the machine captions of one meeting recording, for Fox Point and Wayland only (a trial)" : "this town's minutes, staff memos and meeting videos"}`
              : <><DemoTag>Not yet read</DemoTag> This town's recordings haven't been read. The notes below are general, and its sources are listed.</>}
          </span>
        </div>
        {!LOCALITIES.some((l) => l.name === inputs.town && l.indexed) && locality.name !== inputs.town && (() => {
          const b = primaryBody(inputs.town, "planning");
          return (
            <p className="lookup-note">
              <span className="gap-tag">Gap</span> No hearings from {inputs.town} have been read. These are {locality.name}&apos;s, read as one board&apos;s handling of the same questions under the same state law.
              {b ? <> {inputs.town}&apos;s {b.name} meets {b.pattern ? b.pattern.text : "on no fixed day"}; its minutes: {minutesLine(b).replace(/^./, (c) => c.toLowerCase())} <a href={b.url} target="_blank" rel="noopener noreferrer">Its meetings ↗</a></> : null}
            </p>
          );
        })()}
        {inputs.kind === "commercial" && (
          <p className="lookup-note is-warn">
            <span className="gap-tag">Gap</span> These concerns were read from hearings on housing. Hearings on commercial and institutional projects have not been read, and they turn on other things: traffic and deliveries, hours, noise, lighting and signs. The recordings and minutes below cover them too.
          </p>
        )}
        <div className="sheet-bar no-print">
          <input type="search" className="sheet-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions, answers and what was heard" aria-label="Search questions" />
          <div className="sheet-actions">
            <span className="small muted">{picked.size ? `${picked.size} on your sheet` : "Add questions to build a one-page sheet"}</span>
            <button type="button" className="btn" disabled={!picked.size} onClick={printSheet}>Print/Save my hearing prep sheet</button>
          </div>
        </div>
      </section>

      <section className="sec" aria-label="Questions to expect">
        <div className="topic-tiles no-print" role="group" aria-label="Filter by topic">
          {(["all", ...TOPICS] as const).map((t) => {
            const n = t === "all" ? OBJECTIONS.length : OBJECTIONS.filter((o) => o.topic === t).length;
            return (
              <button key={t} type="button" className="topic-tile" aria-pressed={topic === t} onClick={() => setTopic(t)}>
                <TopicIcon topic={t} />
                <span className="topic-name">{t === "all" ? "All topics" : t}</span>
                <span className="topic-sub">{t === "all" ? "Every question" : TOPIC_NOTE[t]} · {n}</span>
              </button>
            );
          })}
        </div>
        {locality.media && locality.media.length > 0 && (
          <details className="media-box" open={!locality.indexed}>
            <summary>
              <b>Where {locality.name === "Statewide" ? "statewide" : `${locality.name}'s`} hearings are recorded</b>
              <span className="muted small"> · {locality.media.length} sources: video, minutes, memos, press</span>
            </summary>
            <ul className="media-list">
              {locality.media.map((m) => (
                <li key={m.url}>
                  <span className={`media-kind m-${m.kind}`}>{MEDIA_LABEL[m.kind]}</span>
                  <span>
                    <a href={m.url} target="_blank" rel="noopener noreferrer">{m.label} ↗</a>
                    <span className="muted small"> {m.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}
        <p className="print-only sheet-title">
          <b>{body} hearing sheet</b> · {inputs.units} units, {inputs.zone === "other" ? inputs.town : `${inputs.zone}, ${inputs.town}`}{inputs.address ? ` · ${inputs.address}` : ""}
        </p>
        <div className="obj-list">
          {shown.length === 0 && <p className="muted no-print">No questions match. Clear the search or pick another topic.</p>}
          {shown.map((o) => {
            const heard = localHeard(o);
            const isOpen = open.has(o.id);
            const isPicked = picked.has(o.id);
            const mine = yourNumbers(o.id, inputs);
            return (
              <article key={o.id} id={o.id} className={`obj${o.id === target ? " is-target" : ""}${isOpen ? "" : " is-collapsed"}${isPicked ? " is-picked" : ""}`}>
                <div className="obj-head">
                  <span className="obj-topic">{o.topic}</span>
                  <span className={`weight w-${o.weight}`}>{WEIGHT_LABEL[o.weight]}</span>
                  {heard.length > 0 && <span className="heard-count">Heard {heard.length}× in {locality.name}</span>}
                </div>
                <blockquote className="said">"{o.said}"</blockquote>
                <div className="note">
                  <span className="note-label">Example note for the hearing</span>
                  <p>{o.say}</p>
                </div>
                {mine && <p className="mine"><b>With your numbers:</b> {mine}</p>}
                <div className="obj-more">
                  {heard.length > 0 ? (
                    <div className="heard-box">
                      <span className="heard-title">Heard in {locality.name}</span>
                      <HeardList items={heard} />
                    </div>
                  ) : locality.indexed ? (
                    <p className="muted small">Not found in {locality.name}'s records read so far.</p>
                  ) : null}
                  <dl className="obj-body">
                    <dt>What the board can weigh</dt>
                    <dd><Gloss text={o.boardView} /></dd>
                    <dt>What to do</dt>
                    <dd><Gloss text={o.response} /></dd>
                  </dl>
                  <div className="bring">
                    <span className="muted small">Bring:</span>
                    {o.bring.map((b) => (
                      <Link key={`${b.step}-${b.doc}`} href={`/route#d-${b.step}`} className="chip">{b.doc}</Link>
                    ))}
                  </div>
                </div>
                <div className="obj-actions no-print">
                  <button type="button" className="link-btn" aria-expanded={isOpen} onClick={() => flip(setOpen, o.id)}>
                    {isOpen ? "Show less" : `What the board weighs, what to do${heard.length ? ", and when it came up" : ""}`}
                  </button>
                  <PinButton id={`o:${o.id}`} what="this question" />
                  <label className="pick">
                    <input type="checkbox" checked={isPicked} onChange={() => toggleHearing(o.id)} />
                    On my sheet
                  </label>
                </div>
              </article>
            );
          })}
        </div>
        <p className="disclaimer">
          "Heard" entries summarize public records (minutes, staff memos, meeting video and press). Residents are described by role and
          street, not by name. Example notes are drafting aids, not quotes. Replace the sheet numbers, distances and plants with your own.
          Trip rates are approximate, from the ITE Trip Generation Manual for low-rise multifamily housing. Confirm them with your traffic engineer.
        </p>
      </section>
    </>
  );
}

/** The page heading, named for the body that will hold this project's hearings. */
export function HearingHeading() {
  const { steps } = useProject();
  const body = shortName(CONTACTS[hearingBody(steps)]?.name ?? "Planning Board");
  return <h1 id="obj-h" className="h2">{body} hearing prep</h1>;
}
