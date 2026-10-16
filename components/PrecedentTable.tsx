"use client";

import { HISTORY } from "@/lib/data/history";
import { SOURCES } from "@/lib/data/sources";
import { sourceKind } from "@/lib/sourceKind";
import { useProject } from "./ProjectProvider";

export function PrecedentTable({ rank = true }: { rank?: boolean }) {
  const { inputs, tree } = useProject();
  const rows = HISTORY.map((h) => ({
    h,
    score: Math.abs(h.units - inputs.units) + (h.route === tree ? 0 : 6) + (h.zone === inputs.zone ? 0 : 2),
  }));
  if (rank) rows.sort((a, b) => a.score - b.score);

  return (
    <div className="tablewrap">
      <table className="prec-table">
        <colgroup>
          <col style={{ width: "13%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "34%" }} />
          <col style={{ width: "5%" }} />
        </colgroup>
        <thead>
          <tr><th>Project</th><th>Location</th><th>Zone</th><th className="num">Units</th><th>Route and outcome</th><th>Record</th><th>Relief or notes</th><th>Src</th></tr>
        </thead>
        <tbody>
          {rows.map(({ h }, i) => (
            <tr key={h.name}>
              <td><b>{h.name}</b>{rank && i < 2 && <><br /><span className="sim">closest match</span></>}</td>
              <td>{h.addr}{h.lot && <><br /><span className="muted mono small">{h.lot}</span></>}</td>
              <td>{h.zone || "—"}</td>
              <td className="num">{h.units}{h.aff > 0 && <><br /><span className="muted small">{h.aff} aff.</span></>}</td>
              <td><span className="small">{h.routeLabel}</span><br /><span className={`status s-${h.status}`}>{h.statusLabel}</span></td>
              <td><ul className="tl">{h.record.map((r) => <li key={r}>{r}</li>)}</ul></td>
              <td className="notes">{h.notes}</td>
              <td className="src-cell">
                {h.src.map((s) => SOURCES[s] && (
                  <a key={s} href={SOURCES[s].url} target="_blank" rel="noopener noreferrer" title={SOURCES[s].label}>{sourceKind(s)}</a>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
