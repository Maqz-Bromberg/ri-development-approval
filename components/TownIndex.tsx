"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LEVELS, TOWNS, type Level } from "@/lib/data/towns";
import { Icon } from "./Icon";
import { useProject } from "./ProjectProvider";
import { TownMap } from "./TownMap";
import { useSetTown } from "./TownPicker";

const COUNTIES = ["Bristol", "Kent", "Newport", "Providence", "Washington"] as const;

/** One colour per level, light to dark: the same scale the statewide map shades towns by. */
export const LEVEL_COLOR: Record<Level, string> = { 1: "#E3EAF3", 2: "#C3D5EC", 3: "#8FB2DD", 4: "#3E74B8" };

/**
 * The 39 towns: a map shaded by level, a search and a filter by level, and a card per town. A town's name opens it on Site;
 * its level is a coloured chip keyed above; its official ordinances are the book icon.
 */
export function TownIndex() {
  const { inputs } = useProject();
  const setTown = useSetTown();
  const [q, setQ] = useState("");
  const [levels, setLevels] = useState<Set<Level>>(new Set());
  const [picked, setPicked] = useState<string | null>(null);

  const levelOf = (name: string) => TOWNS.find((t) => t.name === name)?.level ?? 1;
  const count = (l: Level) => TOWNS.filter((t) => t.level === l).length;
  const parts = (l: Level) => TOWNS.filter((t) => t.part?.level === l).length;

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return TOWNS.filter((x) =>
      (!picked || x.name === picked) &&
      (!levels.size || levels.has(x.level) || (x.part && levels.has(x.part.level))) &&
      (!t || `${x.name} ${x.county} county ${LEVELS[x.level].name}${x.trial ? " trial" : ""}`.toLowerCase().includes(t)));
  }, [q, levels, picked]);
  const shownNames = useMemo(() => new Set(shown.map((t) => t.name)), [shown]);
  const flip = (l: Level) => setLevels((s) => { const n = new Set(s); if (n.has(l)) n.delete(l); else n.add(l); return n; });

  return (
    <div className="towns-ix">
      <div className="towns-top">
        <TownMap
          label="Rhode Island's 39 towns, shaded by how much has been read. Select one to show it alone."
          fill={(n) => LEVEL_COLOR[levelOf(n)]}
          shown={shownNames}
          picked={picked}
          onPick={(n) => setPicked(picked === n ? null : n)}
        />
        <div className="towns-filters">
          <label className="ix-search">
            <Icon name="search" size={16} />
            <span className="sr-only">Filter the towns</span>
            <input type="search" value={q} placeholder="Filter by town, county or level" onChange={(e) => { setQ(e.target.value); setPicked(null); }} />
          </label>
          <ul className="level-key" aria-label="Levels: select to filter">
            {([1, 2, 3, 4] as Level[]).map((l) => (
              <li key={l}>
                <button type="button" className={`lk-btn${levels.has(l) ? " on" : ""}`} aria-pressed={levels.has(l)} onClick={() => flip(l)}>
                  <span className="lk-sw" style={{ background: LEVEL_COLOR[l] }} aria-hidden="true" />
                  <span><b>Level {l}: {LEVELS[l].name}</b> <span className="muted">· {count(l)} town{count(l) === 1 ? "" : "s"}{parts(l) ? `, and part of ${parts(l)} more` : ""}</span><br /><small className="muted">{LEVELS[l].has}</small></span>
                </button>
              </li>
            ))}
          </ul>
          <p className="small muted">
            {shown.length === TOWNS.length ? "All 39 towns." : `${shown.length} of 39 towns.`}{" "}
            {(q || levels.size > 0 || picked) && <button type="button" className="link-btn" onClick={() => { setQ(""); setLevels(new Set()); setPicked(null); }}>Show all</button>}
            {" "}A town&apos;s name opens it on Site. <Icon name="book" size={13} /> is its official code of ordinances.
          </p>
        </div>
      </div>

      {COUNTIES.map((c) => {
        const here = shown.filter((t) => t.county === c);
        if (!here.length) return null;
        return (
          <section key={c} aria-label={`${c} County`} className="towns-county">
            <h2 className="h3">{c} County</h2>
            <ul className="town-cards">
              {here.map((t) => (
                <li key={t.name} className={`town-card${inputs.town === t.name ? " is-current" : ""}`} style={{ "--lv": LEVEL_COLOR[t.level] } as React.CSSProperties}>
                  <Link href="/site" className="tc-name" onClick={() => setTown(t.name)} title={inputs.town === t.name ? "Your project's town: open it on Site" : `Use ${t.name} for the project, on Site`}>{t.name}</Link>
                  {t.code && (
                    <a className="tc-code" href={t.code.url} target="_blank" rel="noopener noreferrer" title={`Official code of ordinances, on ${t.code.host}`} aria-label={`${t.name}: official code of ordinances, on ${t.code.host}`}>
                      <Icon name="book" size={16} />
                    </a>
                  )}
                  <span className="tc-tags">
                    <span className={`lv-chip l${t.level}`}>Level {t.level}</span>
                    {t.part && <span className="lv-chip-part">{t.part.name} <span className={`lv-chip l${t.part.level}`}>Level {t.part.level}</span></span>}
                    {t.trial && <span className="tc-tag">trial</span>}
                    {t.commercial && <span className="tc-tag">commercial: level {t.commercial.level}</span>}
                    {inputs.town === t.name && <span className="tc-tag tc-mine">your project</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {!shown.length && <p className="muted">No town matches. <button type="button" className="link-btn" onClick={() => { setQ(""); setLevels(new Set()); setPicked(null); }}>Show all 39</button></p>}
    </div>
  );
}
