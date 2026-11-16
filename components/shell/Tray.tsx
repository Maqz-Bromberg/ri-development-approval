"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CONTACTS } from "@/lib/data/contacts";
import { KINDS, KIND_ORDER } from "@/lib/data/kinds";
import { OBJECTIONS } from "@/lib/data/objections";
import { condOK } from "@/lib/engine";
import { goTo } from "@/lib/goTo";
import type { Kind } from "@/lib/types";
import { Icon } from "../Icon";
import { KindChip } from "../KindChip";
import { PinButton } from "../PinButton";
import { useProject } from "../ProjectProvider";
import { usePinInfo } from "../usePinInfo";

/** What the tray holds on every stage: the pinned things, the hearing sheet, and the contacts on the route, by kind of body (ARD D42). */
export function useTrayCounts() {
  const { pins, hearing, steps, flags } = useProject();
  const ids = new Set<string>();
  steps.forEach((s) => s.auth.filter((a) => condOK(a.cond, flags)).forEach((a) => { if (CONTACTS[a.c]) ids.add(a.c); }));
  return { pins: pins.length, sheet: hearing.length, contacts: ids.size };
}

function Pinned() {
  const { pins, togglePin, setPinResolved } = useProject();
  const info = usePinInfo();
  const router = useRouter();
  const go = (href: string, target?: string) => {
    if (window.location.pathname.replace(/\/$/, "") === href) { if (target) goTo(target); return; }
    router.push(href);
    if (target) window.setTimeout(() => goTo(target), 350);
  };
  if (!pins.length) return <p className="small muted tray-empty">Nothing pinned yet. Use the <Icon name="pin" size={13} /> on a finding, a document, a contact, a date, a site fact or a hearing question to keep it here, on every stage.</p>;
  return (
    <ul className="pins">
      {pins.map((p) => {
        const i = info(p.id);
        return (
          <li key={p.id} className={`pin t-${p.type}${p.resolved ? " done" : ""}${i.live ? "" : " gone"}`}>
            <input type="checkbox" checked={!!p.resolved} onChange={(e) => setPinResolved(p.id, e.target.checked)} aria-label={`Mark dealt with: ${i.label}`} />
            <span className="pin-t">
              <b>{i.label}</b>
              <small>{i.detail}</small>
            </span>
            <span className="pin-acts">
              {i.live && <button type="button" className="link-btn small" onClick={() => go(i.href, i.target)}>Go to it</button>}
              <button type="button" className="x" aria-label={`Unpin ${i.label}`} onClick={() => togglePin(p.id)}><Icon name="x" size={13} /></button>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Sheet() {
  const { hearing, toggleHearing } = useProject();
  const qs = hearing.map((id) => OBJECTIONS.find((o) => o.id === id)).filter((o) => !!o);
  if (!qs.length) return <p className="small muted tray-empty">No questions on your sheet. Add them on <Link href="/hearing">Hearing</Link>.</p>;
  return (
    <>
      <ol className="sheet-list">
        {qs.map((o) => (
          <li key={o.id}>
            <Link href={`/hearing#${o.id}`}>&ldquo;{o.said}&rdquo;</Link>
            <button type="button" className="x" aria-label="Take off the sheet" onClick={() => toggleHearing(o.id)}><Icon name="x" size={13} /></button>
          </li>
        ))}
      </ol>
      <Link href="/hearing" className="link-btn small">Print the sheet on Hearing →</Link>
    </>
  );
}

function Contacts() {
  const { steps, flags } = useProject();
  const by: Record<Kind, { id: string; role: string }[]> = { elected: [], appointed: [], staff: [], state: [], utility: [] };
  const seen = new Set<string>();
  steps.forEach((s) => s.auth.filter((a) => condOK(a.cond, flags)).forEach((a) => {
    const c = CONTACTS[a.c];
    if (!c || seen.has(a.c)) return;
    seen.add(a.c);
    by[c.kind].push({ id: a.c, role: a.role });
  }));
  return (
    <div className="tray-contacts">
      {KIND_ORDER.filter((k) => by[k].length).map((k) => (
        <div key={k} className={`k-${k}`}>
          <h4><Icon name={KINDS[k].icon} size={14} /> {KINDS[k].label} <small>{KINDS[k].mode}</small></h4>
          <ul>
            {by[k].map(({ id, role }) => <li key={id}><KindChip id={id} role={role} /><PinButton id={`c:${id}`} what={CONTACTS[id].name} /></li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** The tray. Wide: a column. Laptop and narrow: an icon strip that opens over the page. */
export function Tray({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const n = useTrayCounts();
  return (
    <aside className={`tray${open ? " open" : ""}`} aria-label="Pinned items, hearing sheet and contacts">
      <div className="tray-strip">
        <button type="button" aria-expanded={open} aria-label={`${open ? "Close" : "Open"} the tray: ${n.pins} pinned, ${n.sheet} on the hearing sheet, ${n.contacts} contacts`} onClick={() => setOpen(!open)}>
          <Icon name="pin" size={18} /><b>{n.pins}</b>
          <Icon name="sheet" size={18} /><b>{n.sheet}</b>
          <Icon name="phone" size={18} /><b>{n.contacts}</b>
        </button>
      </div>
      <div className="tray-body">
        <button type="button" className="tray-close link-btn small" onClick={() => setOpen(false)}>Close <Icon name="x" size={12} /></button>
        <section aria-labelledby="tr-pin">
          <h3 id="tr-pin"><Icon name="pin" size={16} /> Pinned <span className="count">{n.pins}</span></h3>
          <Pinned />
        </section>
        <section aria-labelledby="tr-sheet">
          <h3 id="tr-sheet"><Icon name="sheet" size={16} /> Hearing sheet <span className="count">{n.sheet}</span></h3>
          <Sheet />
        </section>
        <section aria-labelledby="tr-con">
          <h3 id="tr-con"><Icon name="phone" size={16} /> Contacts on your route <span className="count">{n.contacts}</span></h3>
          <Contacts />
        </section>
      </div>
    </aside>
  );
}
