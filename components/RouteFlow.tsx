"use client";

import Link from "next/link";
import { useMemo } from "react";
import { OBJECTIONS } from "@/lib/data/objections";
import { condOK, visibleDocs } from "@/lib/engine";
import { buildSchedule, fmtDate } from "@/lib/schedule";
import { AuthBadge, KindKey } from "./Authority";
import { ContactCard } from "./ContactCard";
import { DocChecklist } from "./DocChecklist";
import { useProject } from "./ProjectProvider";
import { Gloss } from "./Term";

/**
 * The approval route as one list. Each row's first line says what you file, who holds the decision
 * and how long they have. Everything else (documents, considerations, likely questions, notes,
 * contact details) opens underneath.
 */
export function RouteFlow({ open, setOpen }: { open: Set<string>; setOpen: (fn: (prev: Set<string>) => Set<string>) => void }) {
  const { steps, flags, progress, tree, inputs, notes, setNote } = useProject();
  const plan = useMemo(() => buildSchedule(tree, steps, inputs.startDate), [tree, steps, inputs.startDate]);
  const allOpen = steps.every((s) => open.has(s.id));
  const toggle = (id: string) => setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <div className="route">
      <div className="route-key">
        <span className="route-key-label">Who holds the decision</span>
        <KindKey />
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
                    </h3>
                    <p className="rapp"><span className="rlabel">You file</span> {s.app}</p>
                  </div>
                  <div className="rwhen">
                    <span className="chip clk">{s.clock.text}</span>
                    {when && <span className="rdates">{fmtDate(when.start, { month: "short", year: "numeric" })} to {fmtDate(when.end, { month: "short", year: "numeric" })}</span>}
                  </div>
                </div>
                <div className="rwho">
                  <span className="rlabel">{s.authLabel ?? "Decided by"}</span>
                  {auth.map((a) => <AuthBadge key={a.c} id={a.c} role={a.role} />)}
                </div>
                <button type="button" className="rmore" aria-expanded={isOpen} aria-controls={`rb-${s.id}`} onClick={() => toggle(s.id)}>
                  <span className="rchev" aria-hidden="true">{isOpen ? "–" : "+"}</span>
                  {docs.length} document{docs.length === 1 ? "" : "s"} · {p.total} considerations
                  {p.done > 0 && <span className="rdone">{p.done} dealt with</span>}
                  {note.trim() && <span className="rdone">note</span>}
                  {objs.length > 0 && <span className="muted"> · {objs.length} likely questions</span>}
                </button>
                {isOpen && (
                  <div className="rbody" id={`rb-${s.id}`}>
                    <div>
                      <h4>What happens</h4>
                      <p className="what"><Gloss text={s.what} /></p>
                      <h4>Documents and considerations</h4>
                      <ul className="docs">
                        {docs.map((d) => <DocChecklist key={d.title} stepId={s.id} doc={d} />)}
                      </ul>
                      {hidden > 0 && <p className="hidden-note">{hidden} conditional item{hidden > 1 ? "s" : ""} hidden because they don't apply to the site facts entered.</p>}
                    </div>
                    <div>
                      {objs.length > 0 && (
                        <div className="obj-box">
                          <h4>Questions to expect at this step</h4>
                          <ul>
                            {objs.map((o) => <li key={o.id}><Link href={`/hearing#${o.id}`}>"{o.said}"</Link></li>)}
                          </ul>
                        </div>
                      )}
                      <label className="step-note">
                        <span>Your notes on this step</span>
                        <textarea
                          rows={3}
                          value={note}
                          placeholder="Who you spoke to, what they asked for, what's still open"
                          onChange={(e) => setNote(s.id, e.target.value)}
                        />
                        <span className="muted small">Travels with the share link, the project file and the printed summary.</span>
                      </label>
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
