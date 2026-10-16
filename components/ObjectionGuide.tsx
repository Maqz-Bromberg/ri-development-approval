"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { OBJECTIONS, WEIGHT_LABEL } from "@/lib/data/objections";
import { LOCALITIES } from "@/lib/data/records";
import { SOURCES } from "@/lib/data/sources";
import { fmtDate, parseISO } from "@/lib/schedule";
import { sourceKind as srcKind } from "@/lib/sourceKind";
import type { Heard, MediaItem, Objection } from "@/lib/types";

const TOPICS = Array.from(new Set(OBJECTIONS.map((o) => o.topic)));
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
            {h.src.map((s) => SOURCES[s] && (
              <a key={s} href={SOURCES[s].url} target="_blank" rel="noopener noreferrer" title={SOURCES[s].label}>{srcKind(s)} ↗</a>
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ObjectionGuide() {
  const [loc, setLoc] = useState("cumberland");
  const [topic, setTopic] = useState<Objection["topic"] | "all">("all");
  const [target, setTarget] = useState("");
  const locality = LOCALITIES.find((l) => l.id === loc)!;

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) {
      setTarget(id);
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 50);
    }
  }, []);

  const localHeard = (o: Objection) => o.heard.filter((h) => h.locality === loc || (loc === "cumberland" && h.locality === "statewide"));
  const ranked = useMemo(
    () => [...OBJECTIONS].sort((a, b) => localHeard(b).length - localHeard(a).length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loc],
  );
  const shown = ranked.filter((o) => topic === "all" || o.topic === topic || o.id === target);
  const totalHeard = OBJECTIONS.reduce((a, o) => a + localHeard(o).length, 0);
  const hearings = new Set(OBJECTIONS.flatMap((o) => localHeard(o).map((h) => `${h.date}|${h.project}`))).size;

  return (
    <>
      <section className="sec" aria-labelledby="loc-h">
        <div className="loc-bar">
          <label htmlFor="f-loc" className="loc-label" id="loc-h">Whose hearings?</label>
          <select id="f-loc" value={loc} onChange={(e) => setLoc(e.target.value)}>
            {LOCALITIES.map((l) => <option key={l.id} value={l.id}>{l.name}{l.indexed ? "" : " (not yet indexed)"}</option>)}
          </select>
          <span className="muted small">
            {locality.indexed
              ? `${totalHeard} documented concerns from ${hearings} hearings and memos, read from this town's minutes, staff memos and meeting videos`
              : "This locality's recordings haven't been read yet. The notes below are general, and its sources are listed for the backend to transcribe and tag."}
          </span>
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
      </section>

      <section className="sec" aria-label="Common questions">
        <div className="filters" role="group" aria-label="Filter by topic">
          <button type="button" className="filter" aria-pressed={topic === "all"} onClick={() => setTopic("all")}>All ({OBJECTIONS.length})</button>
          {TOPICS.map((t) => (
            <button key={t} type="button" className="filter" aria-pressed={topic === t} onClick={() => setTopic(t)}>
              {t} ({OBJECTIONS.filter((o) => o.topic === t).length})
            </button>
          ))}
        </div>
        <div className="obj-grid">
          {shown.map((o) => {
            const heard = localHeard(o);
            return (
              <article key={o.id} id={o.id} className={`obj${o.id === target ? " is-target" : ""}`}>
                <div className="obj-head">
                  <span className="obj-topic">{o.topic}</span>
                  <span className={`weight w-${o.weight}`}>{WEIGHT_LABEL[o.weight]}</span>
                </div>
                <blockquote className="said">"{o.said}"</blockquote>
                {heard.length > 0 ? (
                  <div className="heard-box">
                    <span className="heard-title">Heard in {locality.name} · {heard.length}</span>
                    <HeardList items={heard} />
                  </div>
                ) : locality.indexed ? (
                  <p className="muted small">Not found in {locality.name}'s records read so far.</p>
                ) : null}
                <dl className="obj-body">
                  <dt>What the board can weigh</dt>
                  <dd>{o.boardView}</dd>
                  <dt>What to do</dt>
                  <dd>{o.response}</dd>
                </dl>
                <div className="note">
                  <span className="note-label">Example note for the hearing</span>
                  <p>{o.say}</p>
                </div>
                <div className="bring">
                  <span className="muted small">Bring:</span>
                  {o.bring.map((b) => (
                    <Link key={`${b.step}-${b.doc}`} href={`/project#d-${b.step}`} className="chip">{b.doc}</Link>
                  ))}
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
