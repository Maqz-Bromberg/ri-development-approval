"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LOCALITIES } from "@/lib/data/records";
import { SOURCES } from "@/lib/data/sources";
import { TOWNS } from "@/lib/data/towns";
import { bodiesOf, bodiesRead, meetsLine, minutesLine, ROLE_LABEL, type Body } from "@/lib/data/bodies";
import { agendaOf, kindOf, KIND_WORD, readInto } from "@/lib/data/agenda";
import { readAs, searchedLine, searchedOf } from "@/lib/data/searched";
import { sourcePlace, sourceType, SOURCE_TYPES } from "@/lib/sourceKind";
import type { Locality } from "@/lib/types";
import { Icon } from "./Icon";
import { useProject } from "./ProjectProvider";
import { LEVEL_COLOR } from "./TownIndex";
import { TownMap } from "./TownMap";

const OPEN_MEETINGS = "https://opengov.sos.ri.gov/OpenMeetingsPublic/OpenMeetingDashboard";

type Item = { key: string; kind: string; label: string; url: string; note: string };

/** Everything one locality's card lists, as one flat list, so a search can filter it. */
function itemsOf(l: Locality): Item[] {
  return [
    ...l.links.map((k) => ({ key: k.url, kind: "page", label: k.label, url: k.url, note: k.note })),
    ...(l.media ?? []).map((m) => ({ key: m.url, kind: m.kind, label: m.label, url: m.url, note: m.note })),
  ];
}

const has = (words: string[], text: string) => words.every((w) => text.toLowerCase().includes(w));

/**
 * What was searched for housing in a town's board records, and what was found (D63, chunk 6). "Read, and none found"
 * is a result, said with the boards and dates searched; it replaces the gap only for what was searched.
 */
function SearchedRecords({ town }: { town: string }) {
  const s = searchedOf(town);
  if (!s) return null;
  return (
    <section className="rdx-searched" aria-label={`${town}: records searched for housing`}>
      <p>
        {s.found.length ? <span className="pill">Read</span> : <span className="pill live">Read, and none found</span>}{" "}
        Searched for housing on {s.read}: the agendas of the {searchedLine(s)}, on the state Open Meetings site, with the minutes where an agenda mentioned homes.{" "}
        {s.found.length ? `${s.found.length} housing item${s.found.length === 1 ? "" : "s"} found, listed below; ${s.found.filter((f) => readAs(town, f)).length || "none"} read into recorded projects.` : "No proposal with homes was found."}
      </p>
      {s.note && <p className="small muted">{s.note}</p>}
      {s.found.length > 0 && (
        <ul className="rdx-items">
          {s.found.map((f) => (
            <li key={`${f.date}-${f.meeting}`}>
              <span className="media-kind m-page">{f.date}</span>
              <span>{f.what}{f.homes ? ` (${f.homes} homes)` : ""} <span className="muted small">{f.board} · <a href={`https://opengov.sos.ri.gov/OpenMeetingsPublic/ViewMeetingDetailByID?MeetingID=${f.meeting}`} target="_blank" rel="noopener noreferrer">meeting ↗</a></span> {readAs(town, f) ? <span className="small">✓ read</span> : <span className="gap-tag">Gap</span>}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="small muted">The search reads only what the boards filed on the state site, and only from 2023; a scan has no words to search, and the site lists a board&apos;s latest hundred meetings.</p>
    </section>
  );
}

/**
 * Every case on the planning body's agendas since a date (D53, chunk 0): which became recorded projects here, and which
 * are listed only, so the rest of the reading is a named gap. Closed by default: it is long.
 */
function AgendaCases({ town }: { town: string }) {
  const a = agendaOf(town);
  if (!a) return null;
  const rows = a.projects.map((c) => ({ c, read: readInto(town, c), kind: kindOf(c) }));
  const homes = rows.filter((r) => r.kind === "homes");
  const readN = rows.filter((r) => r.read).length;
  const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  return (
    <details className="rdx-cases">
      <summary>
        <b>Every case on its agendas since {fmt(a.since)}: {rows.length}</b>{" "}
        <span className="muted small">{readN} read into the projects here · {homes.filter((r) => !r.read).length} with homes not yet read <span className="gap-tag">Gap</span> · listed {a.read} from {a.meetings} agendas{a.scanned.length ? `, ${a.scanned.length} of them scans not read` : ""}</span>
      </summary>
      <p className="small muted">From the agendas on the state Open Meetings site. A case listed but not read has only what its agenda says; its staff report and minutes would make it a recorded project. Applicants are left out.</p>
      <div className="table-wrap">
        <table className="rdx-case-table">
          <thead><tr><th>Case</th><th>Address</th><th>Kind</th><th>Homes</th><th>On the agenda</th><th>Read</th></tr></thead>
          <tbody>
            {rows.map(({ c, read, kind }) => (
              <tr key={c.case} className={read ? "is-read" : ""}>
                <td>{c.case}</td>
                <td>{c.address}{c.area ? <span className="muted small"> · {c.area}</span> : null}</td>
                <td className="small">{KIND_WORD[kind]}<span className="muted"> · {c.meetings[c.meetings.length - 1].heading.toLowerCase()}</span></td>
                <td>{c.units ?? ""}</td>
                <td className="small">{c.meetings.length === 1 ? fmt(c.meetings[0].date) : `${fmt(c.meetings[0].date)} to ${fmt(c.meetings[c.meetings.length - 1].date)} (${c.meetings.length})`}</td>
                <td className="small">{read ? `✓ ${read.name}` : kind === "homes" ? <span className="gap-tag">Gap</span> : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/** A town's boards as the state Open Meetings site lists them (ARD D53, chunk 2): when each meets and how its minutes are filed. */
function Boards({ town, bodies }: { town: string; bodies: Body[] }) {
  if (!bodies.length) return <p className="small"><span className="gap-tag">Gap</span> No land-use board of {town} was found on the state Open Meetings site. Its meetings may be posted under another name, or only on the town&apos;s own site.</p>;
  return (
    <div className="rdx-boards">
      <h3 className="rdx-sub">Boards, from the state Open Meetings site <span className="muted small">read {bodiesRead(town)}</span></h3>
      <ul>
        {bodies.map((b) => (
          <li key={b.id}>
            <span className={`media-kind m-board k-${b.kind}`}>{ROLE_LABEL[b.role].toLowerCase()}</span>
            <span>
              <a href={b.url} target="_blank" rel="noopener noreferrer">{b.name} ↗</a>{" "}
              <span className="muted small">{b.kind === "elected" ? "Elected. " : b.kind === "state" ? "A state body. " : "Appointed. "}{meetsLine(b)} Minutes: {minutesLine(b)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The records, as a card file: a tab per municipality (all 39; a town not yet read has a card that says so and where to look),
 * one card open at a time, a search that narrows the tabs and the card, and a map to pick a town. Statewide and federal
 * documents are their own card below, because they apply to every town.
 */
export function RecordsIndex() {
  const { inputs } = useProject();
  const [q, setQ] = useState("");
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const byTown = useMemo(() => new Map(LOCALITIES.filter((l) => l.id !== "state").map((l) => [l.name, l])), []);
  const state = LOCALITIES.find((l) => l.id === "state");
  const [open, setOpen] = useState<string>("Cumberland");
  // The project's town opens first, when its records have been read.
  useEffect(() => { if (byTown.has(inputs.town)) setOpen(inputs.town); }, [inputs.town, byTown]);

  // A town's hits: its name matches (all its items count), or some of its items match.
  const hits = useMemo(() => new Map(TOWNS.map((t) => {
    const l = byTown.get(t.name);
    const items = l ? itemsOf(l) : [];
    if (!words.length) return [t.name, items] as const;
    if (has(words, `${t.name} ${t.county} county`)) return [t.name, items] as const;
    return [t.name, items.filter((i) => has(words, `${i.label} ${i.note} ${i.kind} ${l?.intro ?? ""}`))] as const;
  })), [words.join(" "), byTown]); // eslint-disable-line react-hooks/exhaustive-deps
  const tabs = TOWNS.filter((t) => !words.length || (hits.get(t.name)?.length ?? 0) > 0 || has(words, `${t.name} ${t.county} county`));
  const current = tabs.some((t) => t.name === open) ? open : tabs.find((t) => byTown.has(t.name))?.name ?? tabs[0]?.name;
  const l = current ? byTown.get(current) : undefined;
  const town = TOWNS.find((t) => t.name === current);
  const items = current ? hits.get(current) ?? [] : [];

  // Statewide and federal: the state's own record pages, and the state and federal law the site reads.
  const stateItems = state ? itemsOf(state).filter((i) => !words.length || has(words, `${i.label} ${i.note} ${i.kind} statewide`)) : [];
  const law = Object.keys(SOURCES)
    .filter((id) => ["Statewide", "Federal"].includes(sourcePlace(id)) && ["Statute", "Regulation", "Office page", "Guide", "Map layer"].includes(sourceType(id)))
    .filter((id) => !words.length || has(words, `${SOURCES[id].label} ${sourceType(id)} ${sourcePlace(id)}`));

  return (
    <div className="rec-ix">
      <div className="rec-top">
        <div className="rec-find">
          <label className="ix-search">
            <Icon name="search" size={16} />
            <span className="sr-only">Search the records</span>
            <input type="search" value={q} placeholder="Search a town, a board, a project, or a kind (minutes, video)" onChange={(e) => setQ(e.target.value)} />
          </label>
          <p className="small muted">
            {words.length ? `${tabs.length} of 39 towns match.` : `${byTown.size} of 39 towns have records read so far.`} A town with no records read yet still has a card, saying where its meetings are published.
          </p>
          <div className="rolodex-tabs" role="tablist" aria-label="Municipalities">
            {tabs.map((t) => {
              const n = hits.get(t.name)?.length ?? 0;
              return (
                <button key={t.name} type="button" role="tab" aria-selected={t.name === current} className={`rdx-tab${byTown.has(t.name) ? " read" : ""}${t.name === current ? " on" : ""}`} style={{ "--lv": LEVEL_COLOR[t.level] } as React.CSSProperties} onClick={() => setOpen(t.name)}>
                  {t.name}{byTown.has(t.name) && <small>{n}</small>}
                </button>
              );
            })}
          </div>
        </div>
        <TownMap
          label="Pick a town to open its records"
          fill={(n) => (byTown.has(n) ? "#3E74B8" : "#E3EAF3")}
          shown={new Set(tabs.map((t) => t.name))}
          picked={current}
          onPick={setOpen}
          note={<span><span className="lk-sw inline" style={{ background: "#3E74B8" }} /> records read <span className="lk-sw inline" style={{ background: "#E3EAF3" }} /> not yet</span>}
        />
      </div>

      {current && (
        <article className={`rdx-card${l?.pilot ? " pilot" : ""}`} role="tabpanel" aria-label={`${current} records`} id={l?.id ?? current.toLowerCase().replace(/\W+/g, "-")}>
          <header className="rdx-head">
            <h2>{current}</h2>
            {l?.pilot && <span className="pill live">Pilot</span>}
            {town && <span className={`lv-chip l${town.level}`}>Level {town.level}</span>}
            {town?.code && <a className="tc-code" href={town.code.url} target="_blank" rel="noopener noreferrer" title={`Official code of ordinances, on ${town.code.host}`} aria-label={`${current}: code of ordinances`}><Icon name="book" size={16} /></a>}
          </header>
          {l ? (
            <>
              <p className="rdx-intro">{l.intro}</p>
              {items.length ? (
                <ul className="rdx-items">
                  {items.map((i) => (
                    <li key={i.key}>
                      <span className={`media-kind m-${i.kind}`}>{i.kind === "page" ? "page" : i.kind}</span>
                      <span><a href={i.url} target="_blank" rel="noopener noreferrer">{i.label} ↗</a> <span className="muted small">{i.note}</span></span>
                    </li>
                  ))}
                </ul>
              ) : <p className="muted small">Nothing on this card matches the search.</p>}
              {l.tips && !words.length && (
                <details className="rdx-tips"><summary>Reading tips for {current}</summary><ul>{l.tips.map((t) => <li key={t}>{t}</li>)}</ul></details>
              )}
              {!words.length && <SearchedRecords town={current} />}
              {!words.length && <AgendaCases town={current} />}
              {!words.length && <Boards town={current} bodies={bodiesOf(current)} />}
            </>
          ) : (
            <div className="rdx-gap">
              {searchedOf(current) ? <SearchedRecords town={current} /> : <p><span className="gap-tag">Gap</span> No minutes or recordings from {current} have been read into concerns or example projects yet. Where its boards meet and file minutes is below; its own record pages and recordings have not been read.</p>}
              <p className="small">{town?.code ? <>Its zoning is in its <a href={town.code.url} target="_blank" rel="noopener noreferrer">code of ordinances ↗</a>. </> : null}Every public body files its notices and agendas on the state&apos;s <a href={OPEN_MEETINGS} target="_blank" rel="noopener noreferrer">Open Meetings portal ↗</a>.</p>
              <Boards town={current} bodies={bodiesOf(current)} />
            </div>
          )}
        </article>
      )}

      {(stateItems.length > 0 || law.length > 0) && (
        <section className="rdx-card rdx-state" aria-labelledby="rec-state-h">
          <header className="rdx-head"><h2 id="rec-state-h">Statewide and federal</h2><span className="muted small">for every town</span></header>
          {state && !words.length && <p className="rdx-intro">{state.intro}</p>}
          {stateItems.length > 0 && (
            <ul className="rdx-items">
              {stateItems.map((i) => (
                <li key={i.key}>
                  <span className={`media-kind m-${i.kind}`}>{i.kind === "page" ? "page" : i.kind}</span>
                  <span><a href={i.url} target="_blank" rel="noopener noreferrer">{i.label} ↗</a> <span className="muted small">{i.note}</span></span>
                </li>
              ))}
            </ul>
          )}
          {law.length > 0 && (
            <>
              <h3 className="rdx-sub">The state and federal law this site reads</h3>
              {SOURCE_TYPES.filter((t) => law.some((id) => sourceType(id) === t)).map((t) => (
                <div key={t} className="rdx-law">
                  <h4>{t}</h4>
                  <ul>{law.filter((id) => sourceType(id) === t).map((id) => <li key={id}><a href={SOURCES[id].url} target="_blank" rel="noopener noreferrer">{SOURCES[id].label} ↗</a>{sourcePlace(id) === "Federal" && <span className="src-place st">Federal</span>}</li>)}</ul>
                </div>
              ))}
              <p className="small"><Link href="/docs/sources">Every source the site cites, by type →</Link></p>
            </>
          )}
        </section>
      )}
    </div>
  );
}
