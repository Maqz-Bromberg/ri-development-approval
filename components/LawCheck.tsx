"use client";

import { TREES, TREE_ORDER } from "@/lib/data/trees";
import { analyze } from "@/lib/engine";
import { townInfo } from "@/lib/data/towns";
import type { TreeId } from "@/lib/types";
import { Cite } from "./Cite";
import { useProject } from "./ProjectProvider";
import { Gloss } from "./Term";
import { routeText } from "@/lib/engine";

const ORDER = { fail: 0, flag: 1, info: 2, pass: 3 } as const;
const LABEL = { fail: "Blocker", flag: "Open", info: "Note", pass: "Pass" } as const;

/** `head={false}` leaves the route and its override to a verdict shown just above. */
export function LawCheck({ head = true }: { head?: boolean }) {
  const { inputs, tree, auto, override, setOverride, steps } = useProject();
  const code = townInfo(inputs.town).code;
  const findings = analyze(inputs, tree).map((f, i) => ({ f, i })).sort((a, b) => ORDER[a.f.st] - ORDER[b.f.st] || a.i - b.i).map(({ f }) => f);
  const timed = steps.filter((s) => s.clock.days && !s.branch);
  const total = timed.reduce((a, s) => a + (s.clock.days ?? 0), 0);

  return (
    <div className="panel" aria-labelledby="check-h">
      {head && <div className="result-head">
        <span className="muted small">Approval route</span>
        <span className="route-badge">{routeText(tree).name}</span>
        <label className="override" htmlFor="f-tree">
          Override
          <select id="f-tree" value={override} onChange={(e) => setOverride(e.target.value as TreeId | "auto")}>
            <option value="auto">Auto ({routeText(auto).name})</option>
            {TREE_ORDER.map((k) => <option key={k} value={k}>{routeText(k).name}</option>)}
          </select>
        </label>
      </div>}
      <h3 id="check-h">Zoning and law check</h3>
      <p className="sub">Blockers and open questions first. Each finding quotes the rule it comes from.</p>
      <ul className="check-list">
        {findings.map((f) => (
          <li key={f.t}>
            <span className={`st ${f.st}`}>{LABEL[f.st]}</span>
            <div>
              <b>{f.t}{f.gap && <span className="gap-tag" title="Not read into this site, or not public">Gap</span>}</b>
              <p><Gloss text={f.p} /></p>
              {f.gap && (
                <p className="gap-fill">
                  What would answer it: {f.gap}.
                  {code && /ordinance|regulations/i.test(f.gap) && <> <a href={code.url} target="_blank" rel="noopener noreferrer">{inputs.town}&apos;s code on {code.host} ↗</a></>}
                </p>
              )}
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
