"use client";

import { useState } from "react";
import { itemKey, slug } from "@/lib/engine";
import type { Doc } from "@/lib/types";
import { Cite } from "./Cite";
import { useProject } from "./ProjectProvider";

/** One document or form, with its source and a tickable checklist of considerations. */
export function DocChecklist({ stepId, doc, defaultOpen = false, compact = false }: { stepId: string; doc: Doc; defaultOpen?: boolean; compact?: boolean }) {
  const { tree, checked, toggle } = useProject();
  const [open, setOpen] = useState(defaultOpen);
  const keys = doc.checklist.map((_, i) => itemKey(tree, stepId, doc, i));
  const done = keys.filter((k) => checked[k]).length;
  const complete = done === keys.length && keys.length > 0;
  const conditional = doc.cond && doc.cond !== "always";
  const panelId = `cl-${stepId}-${slug(doc.title)}${compact ? "-c" : ""}`;

  return (
    <li className={`doc${complete ? " complete" : ""}${compact ? " compact" : ""}`}>
      <div className="doc-t">
        <b>{doc.title}</b>
        {!compact && (conditional || doc.when
          ? <span className="when-chip">{doc.when ?? "Required for this site"}</span>
          : <span className="when-chip req">Standard</span>)}
      </div>
      {doc.note && !compact && <p className="doc-n">{doc.note}</p>}
      {!compact && <Cite src={doc.src} pin={doc.pin} q={doc.q} />}
      <button type="button" className="cl-toggle" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
        <span className={`cl-count${complete ? " ok" : ""}`}>{done}/{keys.length}</span>
        {open ? "Hide considerations" : "Show considerations"}
      </button>
      {open && (
        <ul className="checklist" id={panelId}>
          {doc.checklist.map((item, i) => (
            <li key={keys[i]}>
              <label>
                <input type="checkbox" checked={!!checked[keys[i]]} onChange={() => toggle(keys[i])} />
                <span>{item}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
