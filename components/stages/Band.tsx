import Link from "next/link";
import { SOURCES } from "@/lib/data/sources";
import { STAGE_REFS } from "@/lib/data/stageRefs";
import { stageById, nextStage, type StageId } from "@/lib/stages";
import { Icon } from "../Icon";

/** The band at the head of a stage: a wash colour, an icon, a short lead, and the reference chips that link its sources (ARD D42). */
export function Band({ id, title, lead, children }: { id: StageId; title: string; lead?: string; children?: React.ReactNode }) {
  const s = stageById(id);
  return (
    <header className={`band ${s.wash}`} id={`${id}-band`}>
      <Icon name={s.icon} size={150} className="wm" />
      <p className="ttl"><span className="ic"><Icon name={s.icon} size={22} /></span><span className="eyebrow">{s.label}</span></p>
      <h1 className="band-h">{title}</h1>
      <p className="lead">{lead ?? s.lead}</p>
      {children}
      <ul className="refchips" aria-label="References for this stage">
        {STAGE_REFS[id].map((r) => {
          const href = r.src ? SOURCES[r.src]?.url : r.href;
          if (!href) return null;
          return <li key={r.label}>{/^https?:/.test(href) ? <a href={href} target="_blank" rel="noopener noreferrer">{r.label} ↗</a> : <Link href={href}>{r.label}</Link>}</li>;
        })}
      </ul>
    </header>
  );
}

/** "Continue to" the next stage. */
export function Continue({ id }: { id: StageId }) {
  const n = nextStage(id);
  if (!n) return null;
  return (
    <div className="next-row">
      <Link href={n.href} className="btn">Continue to {n.label} →</Link>
    </div>
  );
}
