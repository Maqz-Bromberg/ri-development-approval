"use client";

import Link from "next/link";
import { LEVELS, townInfo } from "@/lib/data/towns";
import { useProject } from "./ProjectProvider";

/** What has been read for the town on screen. Shown wherever the site speaks as if it knew the town. */
export function CoverageNote({ compact = false }: { compact?: boolean }) {
  const { inputs } = useProject();
  const t = townInfo(inputs.town);
  const lv = LEVELS[t.level];
  return (
    <aside className={`coverage level-${t.level}`} aria-label={`Coverage for ${t.name}`}>
      <p>
        <b>{t.name}: level {t.level} of 4, {lv.name.toLowerCase()}.</b>{" "}
        {!compact && <>{lv.has} </>}
        {lv.lacks && <span className="muted">{lv.lacks} </span>}
        <Link href="/towns">All 39 towns</Link>
      </p>
    </aside>
  );
}

export function LevelChip({ level }: { level: 1 | 2 | 3 | 4 }) {
  return <span className={`level-chip level-${level}`} title={LEVELS[level].name}>Level {level}</span>;
}
