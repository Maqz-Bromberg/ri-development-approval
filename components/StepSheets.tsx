"use client";

import Link from "next/link";
import { CONTACTS, shortName } from "@/lib/data/contacts";
import { OBJECTIONS } from "@/lib/data/objections";
import { condOK, visibleDocs } from "@/lib/engine";
import { DocChecklist } from "./DocChecklist";
import { ContactCard } from "./ContactCard";
import { useProject } from "./ProjectProvider";

export function StepSheets({ open, setOpen }: { open: Set<string>; setOpen: (fn: (prev: Set<string>) => Set<string>) => void }) {
  const { steps, flags, progress } = useProject();
  const allOpen = steps.every((s) => open.has(s.id));

  return (
    <>
      <div className="sheet-tools">
        <button type="button" className="btn ghost" onClick={() => setOpen(() => (allOpen ? new Set() : new Set(steps.map((s) => s.id))))}>
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>
      <div className="steps">
        {steps.map((s) => {
          const docs = visibleDocs(s, flags);
          const hidden = s.docs.length - docs.length;
          const auth = s.auth.filter((a) => condOK(a.cond, flags));
          const p = progress(s);
          const objs = (s.objections ?? []).map((id) => OBJECTIONS.find((o) => o.id === id)).filter((o) => !!o);
          return (
            <details
              key={s.id}
              id={`d-${s.id}`}
              className={`sheet${s.branch ? " branch" : ""}`}
              open={open.has(s.id)}
              onToggle={(e) => {
                const isOpen = (e.currentTarget as HTMLDetailsElement).open;
                setOpen((prev) => {
                  if (isOpen === prev.has(s.id)) return prev;
                  const next = new Set(prev);
                  if (isOpen) next.add(s.id); else next.delete(s.id);
                  return next;
                });
              }}
            >
              <summary>
                <span className="s-num">{s.n}</span>
                <span className="s-title">
                  <b>{s.title}</b>
                  <span className="chips">
                    <span className="chip clk">{s.clock.text}</span>
                    {auth.map((a) => <span key={a.c} className={`chip k k-${CONTACTS[a.c].kind}`}>{shortName(CONTACTS[a.c].name)}</span>)}
                  </span>
                </span>
                <span className="s-prog">
                  <span className="mini-bar"><span style={{ width: `${p.total ? (p.done / p.total) * 100 : 0}%` }} /></span>
                  <span className="mono small">{p.done}/{p.total}</span>
                </span>
              </summary>
              <div className="s-body">
                <div>
                  <h4>What happens</h4>
                  <p className="what">{s.what}</p>
                  <h4>Documents and forms</h4>
                  <ul className="docs">
                    {docs.map((d) => <DocChecklist key={d.title} stepId={s.id} doc={d} />)}
                  </ul>
                  {hidden > 0 && <p className="hidden-note">{hidden} conditional item{hidden > 1 ? "s" : ""} hidden because they don't apply to the site facts entered.</p>}
                </div>
                <div>
                  <div className="clock-box">Clock: <b>{s.clock.text}</b></div>
                  {objs.length > 0 && (
                    <div className="obj-box">
                      <h4>Objections to prepare for</h4>
                      <ul>
                        {objs.map((o) => <li key={o.id}><Link href={`/objections#${o.id}`}>"{o.said}"</Link></li>)}
                      </ul>
                    </div>
                  )}
                  <h4>Authorities and contacts</h4>
                  {auth.map((a) => <ContactCard key={a.c} id={a.c} role={a.role} />)}
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </>
  );
}
