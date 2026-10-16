"use client";

import { CONTACTS, KIND_LABEL } from "@/lib/data/contacts";
import { condOK } from "@/lib/engine";
import { useProject } from "./ProjectProvider";

/** Applications run down the centre; the deciding authority feeds in from the right. */
export function FlowChart({ onOpen }: { onOpen: (id: string) => void }) {
  const { steps, flags, progress } = useProject();
  return (
    <div className="flow-wrap">
      <ul className="legend" aria-label="Authority types">
        {(["elected", "appointed", "staff", "state", "utility"] as const).map((k) => (
          <li key={k} className={`k-${k}`}><span className="sw" />{KIND_LABEL[k]}</li>
        ))}
      </ul>
      <div className="flow-cols" aria-hidden="true">
        <span>Step · clock</span><span>Application you file ↓</span><span>← Authority that decides</span>
      </div>
      <ol className="flow">
        {steps.map((s) => {
          const p = progress(s);
          return (
            <li key={s.id} className={`frow${s.branch ? " branch" : ""}`}>
              <div className="fmeta">
                <div className="fnum">{s.n}</div>
                <div className="fclock">{s.clock.text}</div>
              </div>
              <button type="button" className="fcard" onClick={() => onOpen(s.id)}>
                <span className="ft">{s.title}</span>
                <span className="fa">{s.app}</span>
                <span className="fd">
                  <span className="mini-bar"><span style={{ width: `${p.total ? (p.done / p.total) * 100 : 0}%` }} /></span>
                  {p.done}/{p.total} checks · open sheet ↓
                </span>
              </button>
              <div className="fconn" aria-hidden="true" />
              <div className="fauth">
                <span className="fauth-label">Decided by</span>
                {s.auth.filter((a) => condOK(a.cond, flags)).map((a) => {
                  const c = CONTACTS[a.c];
                  return (
                    <div key={a.c} className={`ac k-${c.kind}`}>
                      <span className="kind">{KIND_LABEL[c.kind]}</span>
                      <b>{c.name}</b>
                      <small>{a.role}</small>
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
