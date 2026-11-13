"use client";

import { HISTORY } from "@/lib/data/history";
import { SOURCES } from "@/lib/data/sources";
import { fmtEventDate } from "@/lib/timelines";
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
          <col style={{ width: "31%" }} />
          <col style={{ width: "8%" }} />
        </colgroup>
        <thead>
          <tr><th>Project</th><th>Location</th><th>Zone</th><th className="num">Units</th><th>Route and outcome</th><th>Record</th><th>Relief or notes</th><th>Source</th></tr>
        </thead>
        <tbody>
          {rows.map(({ h }, i) => (
            <tr key={h.name}>
              <td><b>{h.name}</b>{rank && i < 2 && <><br /><span className="sim">closest match</span></>}</td>
              <td>{h.addr}{h.lot && <><br /><span className="muted mono small">{h.lot}</span></>}</td>
              <td>{h.zone || "—"}</td>
              <td className="num">{h.units}{h.aff > 0 && <><br /><span className="muted small">{h.aff} aff.</span></>}</td>
              <td><span className="small">{h.routeLabel}</span><br /><span className={`status s-${h.status}`}>{h.statusLabel}</span></td>
              <td>
                <ul className="tl">
                  {h.events.map((e) => (
                    <li key={e.date + e.what} className={`ev-${e.kind}`}>
                      <span className="mono small">{fmtEventDate(e.date)}</span> {e.what}
                      {e.kind === "reported" && <span className="muted small"> (press report)</span>}
                    </li>
                  ))}
                </ul>
                {h.parties && <p className="muted small ev-parties">{h.parties.map((p) => `${p.role}: ${p.name}`).join(" · ")}</p>}
                <p className="muted small">Checked {fmtEventDate(h.checked)}. Construction start and completion are not in planning records.</p>
              </td>
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
