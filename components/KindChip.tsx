"use client";

import { CONTACTS, shortName } from "@/lib/data/contacts";
import { KINDS } from "@/lib/data/kinds";
import { Icon } from "./Icon";
import { HoverCard } from "./Popover";

/** A deciding body as a coloured chip with its mode, and a hover card saying what that kind of body does (ARD D42). */
export function KindChip({ id, role, mark = false }: { id: string; role?: string; mark?: boolean }) {
  const c = CONTACTS[id];
  if (!c) return null;
  const k = KINDS[c.kind];
  return (
    <HoverCard
      className={`kchip k-${c.kind}`}
      width={340}
      minSpaceBelow={240}
      card={
        <div className={`k-${c.kind}`}>
          <span className="pop-kind"><Icon name={k.icon} size={15} />{k.label}, {k.mode.toLowerCase()}</span>
          <b className="pop-title">{c.name}</b>
          {role && <p><b>On this step:</b> {role}</p>}
          <p className="muted">{k.desc}</p>
          <p className="muted">{c.note}</p>
          <dl className="pop-lines">{c.lines.map(([a, b]) => <div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl>
          {c.verify && <p className="verify">Verify: {c.verify}</p>}
        </div>
      }
    >
      <Icon name={k.icon} size={14} />
      <span className={mark ? "sr-only" : undefined}>{shortName(c.name)}</span>
      <small>{k.mode}</small>
    </HoverCard>
  );
}
