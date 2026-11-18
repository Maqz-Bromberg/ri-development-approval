"use client";

import Link from "next/link";
import { LEVELS, MARKS, MARK_ORDER, coverageFor, levelAt, markState, townInfo, type Level, type Marks, type MarkState } from "@/lib/data/towns";
import { useProject } from "./ProjectProvider";

const GLYPH: Record<MarkState, string> = { read: "●", partly: "◐", none: "○" };
const WORD: Record<MarkState, string> = { read: "read", partly: "partly read", none: "not read" };

/** The four marks as chips: a glyph and a word for each state, never colour alone. The note is the chip's title. */
export function MarkChips({ marks, small = false }: { marks: Marks; small?: boolean }) {
  return (
    <ul className={`marks${small ? " small" : ""}`} aria-label="What has been read">
      {MARK_ORDER.map((k) => {
        const m = marks[k], s = markState(m);
        const tip = `${MARKS[k].name}: ${WORD[s]}${m ? `, ${m.read}` : ""}. ${m?.note ?? (s === "none" ? MARKS[k].lacks : MARKS[k].has)}`;
        return (
          <li key={k} className={`mk mk-${s}`} title={tip}>
            <span aria-hidden="true">{GLYPH[s]}</span> {MARKS[k].short}<span className="sr-only">: {WORD[s]}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Each mark's note, or what its absence means, as a short list under the chips. */
function MarkNotes({ marks }: { marks: Marks }) {
  return (
    <ul className="mk-notes small">
      {MARK_ORDER.map((k) => {
        const m = marks[k], s = markState(m);
        return <li key={k}><b>{MARKS[k].short}, {WORD[s]}{m ? ` (${m.read})` : ""}.</b> <span className="muted">{m?.note ?? (s === "none" ? MARKS[k].lacks : MARKS[k].has)}</span></li>;
      })}
    </ul>
  );
}

/**
 * On tribal land the town's route may not apply at all (ARD D38, debt 18). Said before anything that shows the route,
 * the steps or the schedule, which stay the state's ordinary route for reference.
 */
export function TribalLandNote() {
  const { inputs } = useProject();
  if (!inputs.reservation) return null;
  return (
    <aside className="coverage tribal" aria-label="Tribal land">
      <p><span className="gap-tag">Gap</span> <b>The site is on {inputs.reservation}.</b> Whose rules govern building on tribal land, and who decides, has not been read. The route, steps and schedule here are {inputs.town}&apos;s ordinary route under state law, shown for reference only: they may not apply. Ask the Narragansett Indian Tribe and the Bureau of Indian Affairs&apos; Eastern Regional Office.</p>
    </aside>
  );
}

/** What has been read for the town on screen. Shown wherever the site speaks as if it knew the town. */
export function CoverageNote({ compact = false }: { compact?: boolean }) {
  const { inputs } = useProject();
  const t = townInfo(inputs.town);
  const here = levelAt(inputs.town, inputs.lat, inputs.lon);
  const trial = t.trial ? " (trial, not confirmed by the town)" : "";
  // A commercial project has its own coverage (ARD D31); hearings and precedent were read for housing only.
  if (inputs.kind === "commercial") {
    const c = coverageFor(inputs.town, "commercial");
    return (
      <aside className={`coverage level-${c.level}`} aria-label={`Coverage for ${t.name}, commercial projects`}>
        <p><b>{t.name}, commercial and institutional projects: level {c.level} of 4, {LEVELS[c.level].name.toLowerCase()}{trial}.</b></p>
        <MarkChips marks={c.marks} />
        {!compact && <MarkNotes marks={c.marks} />}
        <p>{c.gaps && <span className="muted">{c.gaps} </span>}<Link href="/towns">All 39 towns</Link></p>
      </aside>
    );
  }
  const mixed = inputs.kind === "mixed" ? coverageFor(inputs.town, "commercial") : null;
  return (
    <aside className={`coverage level-${here.level}`} aria-label={`Coverage for ${t.name}`}>
      <p>
        <b>{t.name}: level {t.level} of 4, {LEVELS[t.level].name.toLowerCase()}{trial}.</b>{" "}
        {!compact && <>{LEVELS[t.level].has} </>}
      </p>
      <MarkChips marks={t.marks} />
      {!compact && <MarkNotes marks={t.marks} />}
      <p>
        {t.gaps && <span className="muted">{t.gaps} </span>}
        {t.parts?.map((p) => (
          <span key={p.name}>
            <b>{p.name}: level {p.level}.</b>{" "}
            {here.part === p && <>Your site is inside this part, so hearings and example projects from it are shown. </>}
            {here.inPart === false && <>Your site is outside this part. Its hearings and example projects are still shown, as the nearest record of how the same board decides. </>}
            {here.inPart === null && <>Look the address up to see whether your site is inside it. </>}
            {!compact && <span className="muted">{p.reason} {p.note} </span>}
          </span>
        ))}
        {mixed && <><b>Its commercial space: level {mixed.level}.</b> <span className="muted">{mixed.gaps} </span></>}
        <Link href="/towns">All 39 towns</Link>
      </p>
    </aside>
  );
}

export function LevelChip({ level }: { level: Level }) {
  return <span className={`level-chip level-${level}`} title={LEVELS[level].name}>Level {level}</span>;
}
