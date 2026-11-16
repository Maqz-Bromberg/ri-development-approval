"use client";

import { useMemo } from "react";
import Link from "next/link";
import { fmt } from "@/lib/engine";
import { addDays, fmtDate, parseISO } from "@/lib/schedule";
import { scenarios, type Scenario } from "@/lib/whatif";
import { changedFacts } from "./Compare";
import { useProject } from "./ProjectProvider";

/**
 * The nearby alternatives, as a list of routes (ARD D42, D24). Each row is one alternative beside the entry: its units, the affordable
 * share, the route it lands on, its stages, hearings, the relief it needs and the date the approval is recorded. A row whose route differs
 * from the entry's carries a "Route changes" mark, and every cell that differs is shaded. "Try it" keeps the entry, with the banner back to it (D21).
 */
export function AlternativeRoutes() {
  const { inputs, entered, tryAlternative, returnToEntered } = useProject();
  const base = entered?.inputs ?? inputs;
  const rows = useMemo(() => scenarios(base), [base]);
  const me = rows[0];
  const trying = entered ? rows.slice(1).find((s) => JSON.stringify(s.inputs) === JSON.stringify(inputs))?.id : undefined;
  const recorded = (s: Scenario) => fmtDate(addDays(parseISO(base.startDate), s.approvalDays), { month: "short", year: "numeric" });
  const relief = (s: Scenario) => (s.fails ? `${s.fails} blocker${s.fails > 1 ? "s" : ""}` : s.flags ? `${s.flags} open` : "none");
  const cell = (s: Scenario, v: string | number, mine: string | number) => <td className={s.current || v === mine ? undefined : "differs"}>{v}</td>;

  return (
    <div className="alt-routes">
      {rows.length === 1 && <p className="muted small">No nearby alternative changes the route or the review for these facts.</p>}
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Alternative</th><th scope="col">Units</th><th scope="col">Affordable</th><th scope="col">Route</th>
              <th scope="col">Stages</th><th scope="col">Hearings</th><th scope="col">Relief needed</th><th scope="col">Approval recorded</th><th scope="col"><span className="sr-only">Try it</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const changes = !s.current && s.route !== me.route;
              const now = trying === s.id;
              return (
                <tr key={s.id} className={`${s.current ? "is-entry" : ""}${now ? " is-trying" : ""}`}>
                  <th scope="row">
                    {s.current ? `Your entry${entered ? " (kept)" : ""}` : s.label}
                    {!s.current && <small>{s.why} {changedFacts(me.inputs, s.inputs).join(", ")}.</small>}
                  </th>
                  {cell(s, s.inputs.kind === "commercial" ? `${fmt(s.inputs.gfa)} sq ft` : s.inputs.units, me.inputs.kind === "commercial" ? `${fmt(me.inputs.gfa)} sq ft` : me.inputs.units)}
                  {cell(s, s.inputs.kind === "commercial" ? "n/a" : s.inputs.aff, me.inputs.kind === "commercial" ? "n/a" : me.inputs.aff)}
                  <td className={changes ? "differs" : undefined}>{s.route}{changes && <span className="route-changes">Route changes</span>}</td>
                  {cell(s, s.approvalSteps, me.approvalSteps)}
                  {cell(s, s.hearings, me.hearings)}
                  {cell(s, relief(s), relief(me))}
                  {cell(s, recorded(s), recorded(me))}
                  <td>
                    {s.current ? null : now
                      ? <button type="button" className="btn ghost" onClick={returnToEntered}>← Back to your entry</button>
                      : <button type="button" className="btn ghost" onClick={() => tryAlternative(s.label, s.inputs)}>Try it</button>}
                    {now && <Link href="/law" className="link-btn small">See the check</Link>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="small muted">Each alternative is classified from its own facts. Trying one keeps what you entered, with a way back. Town review counts statutory clocks at their maximums; dates are estimated from your start date for steps with no clock.</p>
    </div>
  );
}
