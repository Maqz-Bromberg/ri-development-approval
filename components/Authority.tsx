"use client";

import { CONTACTS, KIND_LABEL, shortName } from "@/lib/data/contacts";
import type { Kind } from "@/lib/types";
import { HoverCard } from "./Popover";

/** One mark per kind of authority, so who holds each decision reads at a glance. */
export function KindIcon({ kind, size = 18 }: { kind: Kind; size?: number }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg className="kind-icon" width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      {kind === "elected" && (
        // ballot going into a box
        <g {...p}><path d="M3 10h14v7H3z" /><path d="M7 10V3h6v7" /><path d="M8.5 6l1.2 1.2L12 5" /></g>
      )}
      {kind === "appointed" && (
        // a board sitting at a table
        <g {...p}><circle cx="5" cy="6" r="1.8" /><circle cx="10" cy="5" r="1.8" /><circle cx="15" cy="6" r="1.8" /><path d="M2 12h16" /><path d="M4 12v5M16 12v5" /></g>
      )}
      {kind === "staff" && (
        // a clipboard
        <g {...p}><rect x="4" y="4" width="12" height="13" rx="1.5" /><path d="M8 4V2.8h4V4" /><path d="M7 9h6M7 12.5h4" /></g>
      )}
      {kind === "state" && (
        // a dome
        <g {...p}><path d="M4 12a6 6 0 0 1 12 0" /><path d="M10 6V3" /><path d="M2.5 12h15" /><path d="M4.5 12v5M8 12v5M12 12v5M15.5 12v5" /><path d="M2.5 17h15" /></g>
      )}
      {kind === "utility" && (
        // a drop
        <g {...p}><path d="M10 2.5c3 3.6 4.8 6.2 4.8 8.7a4.8 4.8 0 0 1-9.6 0c0-2.5 1.8-5.1 4.8-8.7z" /><path d="M8 12a2.2 2.2 0 0 0 2 2.2" /></g>
      )}
    </svg>
  );
}

/** An authority on a step: icon and short name, with its role and contact details on hover, focus or tap. */
export function AuthBadge({ id, role }: { id: string; role: string }) {
  const c = CONTACTS[id];
  if (!c) return null;
  return (
    <HoverCard
      className={`auth-badge k-${c.kind}`}
      width={340}
      minSpaceBelow={240}
      card={
        <div className={`k-${c.kind}`}>
          <span className="pop-kind"><KindIcon kind={c.kind} size={15} />{KIND_LABEL[c.kind]}</span>
          <b className="pop-title">{c.name}</b>
          <p><b>On this step:</b> {role}</p>
          <p className="muted">{c.note}</p>
          <dl className="pop-lines">
            {c.lines.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          {c.verify && <p className="verify">Verify: {c.verify}</p>}
          {c.links?.map((l) => <p key={l.url} className="small"><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a></p>)}
        </div>
      }
    >
      <KindIcon kind={c.kind} />
      <span>{shortName(c.name)}</span>
    </HoverCard>
  );
}

/** The key to the authority icons. */
export function KindKey() {
  return (
    <ul className="kind-key" aria-label="Kinds of authority">
      {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
        <li key={k} className={`k-${k}`}><KindIcon kind={k} size={16} />{KIND_LABEL[k]}</li>
      ))}
    </ul>
  );
}
