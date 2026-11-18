"use client";

import { useMemo } from "react";
import Link from "next/link";
import { fmt } from "@/lib/engine";
import { addDays, fmtDate, parseISO } from "@/lib/schedule";
import { scenarios, type Scenario } from "@/lib/whatif";
import type { IconName } from "@/lib/iconSprite";
import { changedFacts } from "./Compare";
import { Diff, type Dir } from "./DiffCell";
import { Icon } from "./Icon";
import { useProject } from "./ProjectProvider";

type Col = { key: string; label: string; icon: IconName; group: "change" | "result" };

const COLS: Col[] = [
  { key: "units", label: "Units", icon: "bldg", group: "change" },
  { key: "aff", label: "Affordable", icon: "key", group: "change" },
  { key: "other", label: "Other facts", icon: "outline", group: "change" },
  { key: "route", label: "Route", icon: "route", group: "result" },
  { key: "steps", label: "Stages", icon: "milestone", group: "result" },
  { key: "hear", label: "Hearings", icon: "hear", group: "result" },
  { key: "relief", label: "Relief needed", icon: "warn", group: "result" },
  { key: "date", label: "Approval recorded", icon: "stamp", group: "result" },
];
/**
 * The nearby alternatives, as a diff against the entry (ARD D42, D24, D50). The entry is the first row, in full. Each alternative below
 * shows only what differs: the entry's value struck out, the alternative's beside it, green where the review gets shorter or
 * lighter, red where it gets longer or heavier, blue for the facts you would change. What stays the same is faded. The columns
 * are in two groups under icons: what you would change, and what follows. "Try it" keeps the entry, with the banner back to it (D21).
 */
export function AlternativeRoutes() {
  const { inputs, entered, tryAlternative, returnToEntered } = useProject();
  const base = entered?.inputs ?? inputs;
  const rows = useMemo(() => scenarios(base), [base]);
  const me = rows[0];
  const trying = entered ? rows.slice(1).find((s) => JSON.stringify(s.inputs) === JSON.stringify(inputs))?.id : undefined;
  const recorded = (s: Scenario) => fmtDate(addDays(parseISO(base.startDate), s.approvalDays), { month: "short", year: "numeric" });
  const relief = (s: Scenario) => (s.fails ? `${s.fails} blocker${s.fails > 1 ? "s" : ""}` : s.flags ? `${s.flags} open` : "none");
  const weight = (s: Scenario) => s.fails * 100 + s.flags;
  const commercial = me.inputs.kind === "commercial";
  const units = (s: Scenario) => (s.inputs.kind === "commercial" ? `${fmt(s.inputs.gfa)} sq ft` : String(s.inputs.units));
  const aff = (s: Scenario) => (s.inputs.kind === "commercial" ? "n/a" : String(s.inputs.aff));
  /** The changed facts other than units and the affordable count, in words */
  const others = (s: Scenario) => changedFacts(me.inputs, s.inputs).filter((c) => !/ units$| affordable$|floor area/.test(c));
  const lower = (a: number, b: number): Dir => (a === b ? "same" : a < b ? "better" : "worse");

  const cells = (s: Scenario) => {
    if (s.current) {
      return [units(s), aff(s), "as entered", s.route, s.approvalSteps, s.hearings, relief(s), recorded(s)].map((v, i) => <td key={COLS[i].key}>{v}</td>);
    }
    const o = others(s);
    return [
      <Diff key="units" was={units(me)} now={units(s)} dir={units(s) === units(me) ? "same" : "input"} />,
      <Diff key="aff" was={aff(me)} now={aff(s)} dir={aff(s) === aff(me) ? "same" : "input"} />,
      o.length ? <td key="other" className="df df-input df-words"><ins>{o.join("; ")}</ins></td> : <td key="other" className="df-same">none</td>,
      <Diff key="route" was={me.route} now={s.route} dir={s.route === me.route ? "same" : "other"} />,
      <Diff key="steps" was={me.approvalSteps} now={s.approvalSteps} dir={lower(s.approvalSteps, me.approvalSteps)} />,
      <Diff key="hear" was={me.hearings} now={s.hearings} dir={lower(s.hearings, me.hearings)} />,
      <Diff key="relief" was={relief(me)} now={relief(s)} dir={lower(weight(s), weight(me))} />,
      <Diff key="date" was={recorded(me)} now={recorded(s)} dir={recorded(s) === recorded(me) ? "same" : lower(s.approvalDays, me.approvalDays)} />,
    ];
  };

  return (
    <div className="alt-routes alt-diff">
      {rows.length === 1 && <p className="muted small">No nearby alternative changes the route or the review for these facts.</p>}
      <ul className="df-key" aria-label="How to read the table">
        <li><span className="df-sw df-del">10</span> your entry, struck out</li>
        <li><span className="df-sw df-input">12</span> a fact you would change</li>
        <li><span className="df-sw df-better">5</span> shorter or lighter review</li>
        <li><span className="df-sw df-worse">7</span> longer or heavier</li>
        <li><span className="df-sw df-other">route</span> a different route</li>
        <li><span className="df-sw df-same-sw">2</span> the same as your entry</li>
      </ul>
      <div className="tablewrap">
        <table>
          <thead>
            <tr className="df-groups">
              <td />
              <th scope="colgroup" colSpan={3} className="g-change">What you would change</th>
              <th scope="colgroup" colSpan={5} className="g-result">What follows</th>
              <td />
            </tr>
            <tr className="df-heads">
              <th scope="col">Alternative</th>
              {COLS.map((c) => (
                <th key={c.key} scope="col" className={`g-${c.group}`}>
                  <span className="df-ic"><Icon name={c.icon} size={17} /></span>
                  {c.key === "units" && commercial ? "Floor area" : c.label}
                </th>
              ))}
              <th scope="col"><span className="sr-only">Try it</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const now = trying === s.id;
              return (
                <tr key={s.id} className={`${s.current ? "is-entry" : ""}${now ? " is-trying" : ""}`}>
                  <th scope="row">
                    <span className="df-gutter" aria-hidden="true">{s.current ? "=" : "±"}</span>
                    {s.current ? `Your entry${entered ? " (kept)" : ""}` : s.label}
                    {!s.current && <small>{s.why}</small>}
                  </th>
                  {cells(s)}
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
