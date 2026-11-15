"use client";

import Link from "next/link";
import { LEVELS, TOWNS, type Level } from "@/lib/data/towns";
import { LevelChip } from "./Coverage";
import { useProject } from "./ProjectProvider";

const COUNTIES = ["Bristol", "Kent", "Newport", "Providence", "Washington"] as const;

export function TownIndex() {
  const { inputs, setInput } = useProject();
  const count = (l: Level) => TOWNS.filter((t) => t.level === l).length;
  const parts = (l: Level) => TOWNS.filter((t) => t.part?.level === l).length;
  return (
    <>
      <ul className="level-key">
        {([1, 2, 3, 4] as Level[]).map((l) => (
          <li key={l}><LevelChip level={l} /> <b>{LEVELS[l].name}</b> · {count(l)} town{count(l) === 1 ? "" : "s"}{parts(l) ? `, and part of ${parts(l)} more` : ""}<br /><span className="muted small">{LEVELS[l].has}</span></li>
        ))}
      </ul>
      {COUNTIES.map((c) => (
        <section key={c} aria-label={`${c} County`}>
          <h2 className="h3">{c} County</h2>
          <ul className="town-list">
            {TOWNS.filter((t) => t.county === c).map((t) => (
              <li key={t.name} className={inputs.town === t.name ? "is-current" : undefined}>
                <b>{t.name}</b> <LevelChip level={t.level} />
                {t.part && <span className="muted small"> · {t.part.name} <LevelChip level={t.part.level} /></span>}
                {t.trial && <span className="muted small"> · trial</span>}
                {t.commercial && <span className="muted small"> · commercial <LevelChip level={t.commercial.level} /></span>}
                {t.code && <span className="small"> · <a href={t.code.url} target="_blank" rel="noopener noreferrer" title={`Official code of ordinances, on ${t.code.host}`}>ordinances ↗</a></span>}
                {inputs.town === t.name
                  ? <span className="muted small"> · your project</span>
                  : <Link href="/site" className="link-btn small" onClick={() => { setInput("town", t.name); setInput("zone", "other"); setInput("lat", undefined); setInput("lon", undefined); setInput("address", ""); }}>Use this town</Link>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
