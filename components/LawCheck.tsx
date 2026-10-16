"use client";

import { TREES, TREE_ORDER } from "@/lib/data/trees";
import { analyze } from "@/lib/engine";
import type { TreeId } from "@/lib/types";
import { Cite } from "./Cite";
import { useProject } from "./ProjectProvider";

export function LawCheck() {
  const { inputs, tree, auto, override, setOverride, steps } = useProject();
  const findings = analyze(inputs, tree);
  const timed = steps.filter((s) => s.clock.days && !s.branch);
  const total = timed.reduce((a, s) => a + (s.clock.days ?? 0), 0);

  return (
    <div className="panel" aria-labelledby="check-h">
      <div className="result-head">
        <span className="muted small">Approval route</span>
        <span className="route-badge">{TREES[tree].name}</span>
        <label className="override" htmlFor="f-tree">
          Override
          <select id="f-tree" value={override} onChange={(e) => setOverride(e.target.value as TreeId | "auto")}>
            <option value="auto">Auto ({TREES[auto].name})</option>
            {TREE_ORDER.map((k) => <option key={k} value={k}>{TREES[k].name}</option>)}
          </select>
        </label>
      </div>
      <h3 id="check-h">Zoning and law check</h3>
      <p className="sub">Each finding quotes the rule it comes from. Flags mark extra approvals or open questions.</p>
      <ul className="check-list">
        {findings.map((f) => (
          <li key={f.t}>
            <span className={`st ${f.st}`}>{f.st}</span>
            <div>
              <b>{f.t}</b>
              <p>{f.p}</p>
              <Cite src={f.src} pin={f.pin} q={f.q} />
            </div>
          </li>
        ))}
      </ul>
      <div className="clock">
        <h4 className="eyebrow muted-eyebrow">Town review clocks, statutory maximums</h4>
        <div className="clock-bar" role="img" aria-label={`Statutory review clocks total ${total} days`}>
          {timed.length ? timed.map((s) => (
            <span key={s.id} className="clock-seg" style={{ flex: s.clock.days }} title={`Step ${s.n}: ${s.title} · ${s.clock.days} days`}>
              {s.n} · {s.clock.days}d
            </span>
          )) : <span className="clock-seg empty" style={{ flex: 1 }}>No statutory review clocks</span>}
        </div>
        <div className="clock-meta">
          <span><b className="mono">{total} days</b> of town review if every clock runs to its maximum (about {Math.round(total / 30.4)} months)</span>
          <span>Excludes your preparation time and state agency permits</span>
        </div>
      </div>
    </div>
  );
}
