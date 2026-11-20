"use client";

import { useMemo, useState } from "react";
import { SOURCE_TYPES, type SourceType } from "@/lib/sourceKind";
import { Icon } from "./Icon";

export interface SourceRow { id: string; label: string; url: string; copy?: string; type: SourceType; place: string; cites: string[] }

/**
 * Every cited source, consolidated by type (statutes, ordinances, minutes and so on), with a search that filters as you type
 * and filters by type and by whose document it is. The rows are worked out on the server from the data, so the list needs no upkeep.
 */
export function SourceIndex({ rows }: { rows: SourceRow[] }) {
  const [q, setQ] = useState("");
  const [types, setTypes] = useState<Set<SourceType>>(new Set());
  const [place, setPlace] = useState("all");
  const places = useMemo(() => {
    const all = Array.from(new Set(rows.map((r) => r.place)));
    return ["Statewide", "Federal", ...all.filter((p) => p !== "Statewide" && p !== "Federal").sort()].filter((p) => all.includes(p));
  }, [rows]);

  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matchText = (r: SourceRow) => `${r.label} ${r.type} ${r.place} ${r.id} ${r.cites.join(" ")}`.toLowerCase();
  const base = rows.filter((r) => (place === "all" || r.place === place) && words.every((w) => matchText(r).includes(w)));
  const shown = base.filter((r) => !types.size || types.has(r.type));
  const countOf = (t: SourceType) => base.filter((r) => r.type === t).length;
  const flip = (t: SourceType) => setTypes((s) => { const n = new Set(s); if (n.has(t)) n.delete(t); else n.add(t); return n; });
  const clear = () => { setQ(""); setTypes(new Set()); setPlace("all"); };

  return (
    <div className="src-ix">
      <div className="ix-bar">
        <label className="ix-search">
          <Icon name="search" size={16} />
          <span className="sr-only">Search the sources</span>
          <input type="search" value={q} placeholder="Search titles, towns, sections, or what cites them" onChange={(e) => setQ(e.target.value)} />
        </label>
        <label className="ix-place">
          <span className="sr-only">Whose documents</span>
          <select value={place} onChange={(e) => setPlace(e.target.value)}>
            <option value="all">All jurisdictions</option>
            {places.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
      </div>
      <ul className="ix-types" aria-label="Filter by type">
        {SOURCE_TYPES.filter((t) => rows.some((r) => r.type === t)).map((t) => (
          <li key={t}>
            <button type="button" aria-pressed={types.has(t)} className={types.has(t) ? "on" : undefined} disabled={!countOf(t) && !types.has(t)} onClick={() => flip(t)}>
              {t} <small>{countOf(t)}</small>
            </button>
          </li>
        ))}
      </ul>
      <p className="small muted ix-count" aria-live="polite">
        {shown.length === rows.length ? `All ${rows.length} sources.` : `${shown.length} of ${rows.length} sources.`}{" "}
        {(q || types.size > 0 || place !== "all") && <button type="button" className="link-btn" onClick={clear}>Clear the filters</button>}
      </p>

      {SOURCE_TYPES.map((t) => {
        const here = shown.filter((r) => r.type === t);
        if (!here.length) return null;
        return (
          <section key={t} className="src-group" aria-labelledby={`st-${t.replace(/\W+/g, "-")}`}>
            <h2 id={`st-${t.replace(/\W+/g, "-")}`}>{t} <small>{here.length}</small></h2>
            <ul className="src-list">
              {here.sort((a, b) => (a.place === b.place ? a.label.localeCompare(b.label) : a.place === "Statewide" ? -1 : b.place === "Statewide" ? 1 : a.place.localeCompare(b.place))).map((r) => (
                <li key={r.id} id={r.id}>
                  <span className={`src-place${r.place === "Statewide" || r.place === "Federal" ? " st" : ""}`}>{r.place}</span>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">{r.label} ↗</a>
                  {r.copy && <small className="src-copy"><b>Which copy:</b> {r.copy}</small>}
                  {r.cites.length > 0 && <details><summary>Cited by {r.cites.length}</summary><ul>{r.cites.slice(0, 12).map((c) => <li key={c}>{c}</li>)}{r.cites.length > 12 && <li>and {r.cites.length - 12} more</li>}</ul></details>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {!shown.length && <p className="muted">Nothing matches. <button type="button" className="link-btn" onClick={clear}>Clear the filters</button></p>}
    </div>
  );
}
