"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LEVELS, MARKS, MARK_ORDER, TOWNS, levelInPart, markState, marksLine, type Level, type Mark, type MarkState } from "@/lib/data/towns";
import { MarkChips } from "./Coverage";
import { Icon } from "./Icon";
import { useProject } from "./ProjectProvider";
import { TownMap } from "./TownMap";
import { useSetTown } from "./TownPicker";

const COUNTIES = ["Bristol", "Kent", "Newport", "Providence", "Washington"] as const;

/** One colour per level, light to dark: the same scale the statewide map shades towns by. */
export const LEVEL_COLOR: Record<Level, string> = { 1: "#E3EAF3", 2: "#C3D5EC", 3: "#8FB2DD", 4: "#3E74B8" };
/** A level reached on marks read only in part has a shade of its own, halfway to the level below (Maqz, 2026-11-19; ARD D68). */
export const LEVEL_PART_COLOR: Record<Level, string> = { 1: "#E3EAF3", 2: "#D4E0EF", 3: "#AAC4E5", 4: "#6A93C9" };
export const levelColor = (t: { level: Level; marks: Parameters<typeof levelInPart>[0]["marks"] }) => (levelInPart(t) ? LEVEL_PART_COLOR : LEVEL_COLOR)[t.level];
/** One mark at a time, on the same scale: not read, partly read, read. */
export const MARK_COLOR: Record<MarkState, string> = { none: "#E3EAF3", partly: "#8FB2DD", read: "#3E74B8" };

/**
 * The 39 towns: a map shaded by level or by one of the four marks (ARD D53), a search and a filter by level, and a card
 * per town with its marks. A town's name opens it on Site; its official ordinances are the book icon.
 */
export function TownIndex() {
  const { inputs } = useProject();
  const setTown = useSetTown();
  const [q, setQ] = useState("");
  const [levels, setLevels] = useState<Set<Level>>(new Set());
  const [picked, setPicked] = useState<string | null>(null);
  const [shade, setShade] = useState<"level" | Mark>("level");

  const town = (name: string) => TOWNS.find((t) => t.name === name);
  const fillOf = (name: string) => shade === "level" ? (town(name) ? levelColor(town(name)!) : LEVEL_COLOR[1]) : MARK_COLOR[markState(town(name)?.marks[shade])];
  const count = (l: Level) => TOWNS.filter((t) => t.level === l && !levelInPart(t)).length;
  const inPart = (l: Level) => TOWNS.filter((t) => t.level === l && levelInPart(t)).length;
  const parts = (l: Level) => TOWNS.filter((t) => t.parts?.some((p) => p.level === l)).length;
  const markCount = (m: Mark, s: MarkState) => TOWNS.filter((t) => markState(t.marks[m]) === s).length;

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return TOWNS.filter((x) =>
      (!picked || x.name === picked) &&
      (!levels.size || levels.has(x.level) || x.parts?.some((p) => levels.has(p.level))) &&
      (!t || `${x.name} ${x.county} county ${LEVELS[x.level].name} ${marksLine(x.marks)}${x.trial ? " trial" : ""}`.toLowerCase().includes(t)));
  }, [q, levels, picked]);
  const shownNames = useMemo(() => new Set(shown.map((t) => t.name)), [shown]);
  const flip = (l: Level) => setLevels((s) => { const n = new Set(s); if (n.has(l)) n.delete(l); else n.add(l); return n; });

  return (
    <div className="towns-ix">
      <div className="towns-top">
        <TownMap
          label={`Rhode Island's 39 towns, shaded by ${shade === "level" ? "level" : MARKS[shade].name.toLowerCase()}. Select one to show it alone.`}
          fill={fillOf}
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
          <fieldset className="shade-by">
            <legend className="small">Shade the map by</legend>
            {(["level", ...MARK_ORDER] as const).map((k) => (
              <label key={k} className={shade === k ? "on" : ""}><input type="radio" name="shade" checked={shade === k} onChange={() => setShade(k)} /> {k === "level" ? "Level" : MARKS[k].short}</label>
            ))}
          </fieldset>
          {shade !== "level" && (
            <ul className="level-key mark-key" aria-label={`${MARKS[shade].name}: how many towns`}>
              {(["read", "partly", "none"] as MarkState[]).map((s) => (
                <li key={s}><span className="lk-btn static"><span className="lk-sw" style={{ background: MARK_COLOR[s] }} aria-hidden="true" /><span><b>{s === "read" ? "Read" : s === "partly" ? "Partly read" : "Not read"}</b> <span className="muted">· {markCount(shade, s)} town{markCount(shade, s) === 1 ? "" : "s"}</span></span></span></li>
              ))}
              <li className="small muted">{MARKS[shade].has}</li>
            </ul>
          )}
          <ul className="level-key" aria-label="Levels: select to filter" hidden={shade !== "level"}>
            {([1, 2, 3, 4] as Level[]).flatMap((l) => [
              <li key={l}>
                <button type="button" className={`lk-btn${levels.has(l) ? " on" : ""}`} aria-pressed={levels.has(l)} onClick={() => flip(l)}>
                  <span className="lk-sw" style={{ background: LEVEL_COLOR[l] }} aria-hidden="true" />
                  <span><b>Level {l}: {LEVELS[l].name}</b> <span className="muted">· {count(l)} town{count(l) === 1 ? "" : "s"}{parts(l) ? `, and part of ${parts(l)} more` : ""}</span><br /><small className="muted">{LEVELS[l].has}</small></span>
                </button>
              </li>,
              ...(l > 1 && inPart(l) ? [
                <li key={`${l}p`} className="lk-part">
                  <span className="lk-btn static">
                    <span className="lk-sw" style={{ background: LEVEL_PART_COLOR[l] }} aria-hidden="true" />
                    <span><b>Level {l}, in part</b> <span className="muted">· {inPart(l)} town{inPart(l) === 1 ? "" : "s"}</span><br /><small className="muted">Level {l} reached with a mark read only in part</small></span>
                  </span>
                </li>,
              ] : []),
            ])}
            <li className="small muted">A paler shade is a level reached with a mark read only in part, such as boards from the state site only, steps for one route only, or hearings for some cases only. Shade by a mark to see which.</li>
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
                <li key={t.name} className={`town-card${inputs.town === t.name ? " is-current" : ""}`} style={{ "--lv": fillOf(t.name) } as React.CSSProperties}>
                  <Link href="/site" className="tc-name" onClick={() => setTown(t.name)} title={inputs.town === t.name ? "Your project's town: open it on Site" : `Use ${t.name} for the project, on Site`}>{t.name}</Link>
                  {t.code && (
                    <a className="tc-code" href={t.code.url} target="_blank" rel="noopener noreferrer" title={`Official code of ordinances, on ${t.code.host}`} aria-label={`${t.name}: official code of ordinances, on ${t.code.host}`}>
                      <Icon name="book" size={16} />
                    </a>
                  )}
                  <span className="tc-tags">
                    <span className={`lv-chip l${t.level}${levelInPart(t) ? " part" : ""}`} title={levelInPart(t) ? "Reached with a mark read only in part" : undefined}>Level {t.level}{levelInPart(t) ? ", in part" : ""}</span>
                    {t.parts?.map((p) => <span key={p.name} className="lv-chip-part">{p.name} <span className={`lv-chip l${p.level}`}>Level {p.level}</span></span>)}
                    {t.trial && <span className="tc-tag">trial</span>}
                    {t.commercial && <span className="tc-tag">commercial: level {t.commercial.level}</span>}
                    {inputs.town === t.name && <span className="tc-tag tc-mine">your project</span>}
                  </span>
                  <MarkChips marks={t.marks} small />
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
