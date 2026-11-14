"use client";

import Link from "next/link";
import { LEVELS, levelAt, townInfo } from "@/lib/data/towns";
import { useProject } from "./ProjectProvider";

/** What has been read for the town on screen. Shown wherever the site speaks as if it knew the town. */
export function CoverageNote({ compact = false }: { compact?: boolean }) {
  const { inputs } = useProject();
  const t = townInfo(inputs.town);
  const lv = LEVELS[t.level];
  const here = levelAt(inputs.town, inputs.lat, inputs.lon);
  return (
    <aside className={`coverage level-${here.level}`} aria-label={`Coverage for ${t.name}`}>
      <p>
        <b>{t.name}: level {t.level} of 4, {lv.name.toLowerCase()}{t.trial ? " (trial, not confirmed by the city)" : ""}.</b>{" "}
        {!compact && <>{lv.has} </>}
        {t.gaps ? <span className="muted">{t.gaps} </span> : lv.lacks && <span className="muted">{lv.lacks} </span>}
        {t.part && (
          <>
            <b>{t.part.name}: level {t.part.level}.</b>{" "}
            {here.inPart === true && <>Your site is inside this part, so hearings and example projects from it are shown. </>}
            {here.inPart === false && <>Your site is outside this part. Its hearings and example projects are still shown, as the nearest record of how the same board decides. </>}
            {here.inPart === null && <>Look the address up to see whether your site is inside it. </>}
            {!compact && <span className="muted">{t.part.note} </span>}
          </>
        )}
        <Link href="/towns">All 39 towns</Link>
      </p>
    </aside>
  );
}

export function LevelChip({ level }: { level: 1 | 2 | 3 | 4 }) {
  return <span className={`level-chip level-${level}`} title={LEVELS[level].name}>Level {level}</span>;
}
