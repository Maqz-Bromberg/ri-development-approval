"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { OBJECTIONS } from "@/lib/data/objections";
import { condOK, visibleDocs } from "@/lib/engine";
import { buildSchedule, fmtDate } from "@/lib/schedule";
import { ContactCard } from "./ContactCard";
import { DocChecklist } from "./DocChecklist";
import { Icon } from "./Icon";
import { KindChip } from "./KindChip";
import { NoteButton } from "./NoteButton";
import { PinButton } from "./PinButton";
import { useProject } from "./ProjectProvider";
import { Gloss } from "./Term";

/** Progress as a ring and a count, "3/18" (ARD D42: a recorded exception to principle 3, until reviewed with subject experts). */
function Ring({ done, total }: { done: number; total: number }) {
  const r = 11, c = 2 * Math.PI * r;
  return (
    <span className="ring" title={`${done} of ${total} considerations dealt with`}>
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
        <circle cx="15" cy="15" r={r} className="bg" />
        <circle cx="15" cy="15" r={r} className="fg" strokeDasharray={`${total ? (done / total) * c : 0} ${c}`} transform="rotate(-90 15 15)" />
      </svg>
      <b>{done}/{total}</b>
    </span>
  );
}

/**
 * The approval route as one list. Each row's first line says what you file, who holds the decision (as coloured chips with their mode)
 * and how long they have. Everything else opens underneath: documents, the step's moments on the calendar, the questions to expect, notes.
 */
export function RouteFlow({ open, setOpen }: { open: Set<string>; setOpen: (fn: (prev: Set<string>) => Set<string>) => void }) {
  const { steps, flags, progress, tree, inputs, notes, pins } = useProject();
  const plan = useMemo(() => buildSchedule(tree, steps, inputs.startDate, inputs.town), [tree, steps, inputs.startDate, inputs.town]);
  const allOpen = steps.every((s) => open.has(s.id));
  const toggle = (id: string) => setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  // The rail, the tray and deep links ask for a step by its element id; open it first.
  useEffect(() => {
    const h = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (typeof id === "string" && id.startsWith("d-")) setOpen((prev) => new Set(prev).add(id.slice(2)));
    };
    window.addEventListener("goto", h);
    return () => window.removeEventListener("goto", h);
  }, [setOpen]);

  return (
    <div className="route">
      <div className="route-key">
        <span className="route-key-label">Who holds the decision</span>
        <button type="button" className="link-btn" onClick={() => setOpen(() => (allOpen ? new Set() : new Set(steps.map((s) => s.id))))}>
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>
      <ol className="rsteps">
        {steps.map((s) => {
          const isOpen = open.has(s.id);
          const docs = visibleDocs(s, flags);
          const hidden = s.docs.length - docs.length;
          const auth = s.auth.filter((a) => condOK(a.cond, flags));
          const p = progress(s);
          const when = plan.find((x) => x.step.id === s.id);
          const objs = (s.objections ?? []).map((id) => OBJECTIONS.find((o) => o.id === id)).filter((o) => !!o);
          const note = notes[`${tree}/${s.id}`] ?? "";
          const hearing = when?.ticks.some((t) => t.kind === "hearing");
          const pinned = pins.some((x) => x.id.startsWith(`d:${s.id}|`));
          return (
            <li key={s.id} id={`d-${s.id}`} className={`rstep${s.branch ? " branch" : ""}${isOpen ? " is-open" : ""}`}>
              <button type="button" className="rnum" aria-expanded={isOpen} aria-controls={`rb-${s.id}`} aria-label={`${isOpen ? "Collapse" : "Expand"} step ${s.n}: ${s.title}`} onClick={() => toggle(s.id)}>{s.n}</button>
              <div className="rcard">
                <div className="rhead">
                  <div className="rmain">
                    <h3>
                      <button type="button" className="rtitle" aria-expanded={isOpen} aria-controls={`rb-${s.id}`} onClick={() => toggle(s.id)}>
                        <span className="sr-only">Step {s.n}: </span>{s.title}
                      </button>
                      <span className="marks">
                        {note.trim() && <NoteButton stepId={s.id} compact />}
                        {hearing && <span className="mk" title="A hearing or meeting in this step"><Icon name="hear" size={14} /></span>}
                        {pinned && <span className="mk" title="Something in this step is pinned"><Icon name="pin" size={14} /></span>}
                      </span>
                    </h3>
                    <p className="rapp"><span className="rlabel">You file</span> {s.app}</p>
                  </div>
                  <div className="rwhen">
                    <span className="chip clk">{s.clock.text}</span>
                    {when && <span className="rdates">{fmtDate(when.start, { month: "short", year: "numeric" })} to {fmtDate(when.end, { month: "short", year: "numeric" })}</span>}
                  </div>
                  {p.total > 0 && <Ring done={p.done} total={p.total} />}
                </div>
                <div className="rwho">
                  <span className="rlabel">{s.authLabel ?? "Decided by"}</span>
                  {auth.map((a) => <KindChip key={a.c} id={a.c} role={a.role} />)}
                </div>
                <button type="button" className="rmore" aria-expanded={isOpen} aria-controls={`rb-${s.id}`} onClick={() => toggle(s.id)}>
                  <span className="rchev" aria-hidden="true">{isOpen ? "–" : "+"}</span>
                  {docs.length} document{docs.length === 1 ? "" : "s"} · {p.total} considerations
                  {objs.length > 0 && <span className="muted"> · {objs.length} likely questions</span>}
                </button>
                {isOpen && (
                  <div className="rbody" id={`rb-${s.id}`}>
                    <div>
                      <h4>What happens</h4>
                      <p className="what"><Gloss text={s.what} /></p>
                      <h4 className="h-notes">Documents and considerations <NoteButton stepId={s.id} /></h4>
                      <ul className="docs">
                        {docs.map((d) => <DocChecklist key={d.title} stepId={s.id} doc={d} />)}
                      </ul>
                      {hidden > 0 && <p className="hidden-note">{hidden} conditional item{hidden > 1 ? "s" : ""} hidden because they don't apply to the site facts entered.</p>}
                    </div>
                    <div>
                      {when && when.ticks.length > 0 && (
                        <div className="moments">
                          <h4>This step on the calendar</h4>
                          <ul>
                            {when.ticks.map((t) => (
                              <li key={t.id} className={`k-${t.kind}`}>
                                <Link href={`/calendar#m-${t.id}`}><span className="mono">{fmtDate(t.date, { month: "short", day: "numeric" })}</span> {t.label}</Link>
                                <PinButton id={`t:${t.id}`} what={t.label} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {objs.length > 0 && (
                        <div className="obj-box">
                          <h4>Questions to expect at its hearing</h4>
                          <ul>
                            {objs.map((o) => <li key={o.id}><Link href={`/hearing#${o.id}`}>&ldquo;{o.said}&rdquo;</Link></li>)}
                          </ul>
                        </div>
                      )}
                      <h4>Contacts</h4>
                      {auth.map((a) => <ContactCard key={a.c} id={a.c} role={a.role} />)}
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
