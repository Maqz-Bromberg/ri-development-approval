"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CONTACTS, KIND_LABEL, shortName } from "@/lib/data/contacts";
import { TREE_ORDER } from "@/lib/data/trees";
import { fmt, routeText } from "@/lib/engine";
import { scenarios, type Scenario } from "@/lib/whatif";
import type { ProjectInputs } from "@/lib/types";
import { KindIcon } from "./Authority";
import { useProject } from "./ProjectProvider";

/*
 * Nearby alternatives and the routes, offered while the project is being entered. Comparing never changes the
 * project; trying an alternative does, and keeps what was entered so the way back is one click (the banner).
 */

const months = (days: number) => Math.round(days / 30.4);

/** The people and boards who hold the decisions, one mark each, coloured by kind. */
export function Deciders({ ids, compact = false }: { ids: string[]; compact?: boolean }) {
  return (
    <ul className={`deciders${compact ? " compact" : ""}`} aria-label="Who holds the decisions">
      {ids.map((id) => {
        const c = CONTACTS[id];
        if (!c) return null;
        return (
          <li key={id} className={`k-${c.kind}`} title={`${c.name}: ${KIND_LABEL[c.kind]}`}>
            <KindIcon kind={c.kind} size={compact ? 15 : 16} />
            <span>{shortName(c.name)}</span>
            {!compact && <span className="muted small"> · {KIND_LABEL[c.kind].toLowerCase()}</span>}
          </li>
        );
      })}
    </ul>
  );
}

/** What differs between two sets of facts, in a few words each. */
export function changedFacts(a: ProjectInputs, b: ProjectInputs): string[] {
  const out: string[] = [];
  if (a.units !== b.units) out.push(`${a.units} → ${b.units} units`);
  if (a.aff !== b.aff) out.push(`${a.aff} → ${b.aff} affordable`);
  if (a.type !== b.type) out.push(b.type === "reuse" ? "reuse instead of new" : "new instead of reuse");
  if (a.conservation !== b.conservation) out.push(b.conservation ? "as conservation development" : "not conservation development");
  if (a.zone !== b.zone) out.push(`district ${a.zone} → ${b.zone}`);
  if (a.lot !== b.lot) out.push(`lot ${fmt(a.lot)} → ${fmt(b.lot)} sq ft`);
  if (a.rezone !== b.rezone) out.push(b.rezone ? "with a zone change" : "without a zone change");
  if (a.gfa !== b.gfa) out.push(`floor area ${fmt(a.gfa)} → ${fmt(b.gfa)} sq ft`);
  if (a.commercial !== b.commercial) out.push(`commercial space ${fmt(a.commercial)} → ${fmt(b.commercial)} sq ft`);
  return out;
}

/** Shown while an alternative is being tried: what it changes, and the way back to what was entered. */
export function AltBanner() {
  const { entered, inputs, returnToEntered, keepAlternative } = useProject();
  if (!entered) return null;
  const diff = changedFacts(entered.inputs, inputs);
  return (
    <div className="alt-banner" role="status">
      <p>
        <b>Trying an alternative: {entered.label}.</b>{" "}
        <span className="muted">{diff.length ? `${diff.join(", ")}. ` : ""}What you entered is kept.</span>
      </p>
      <div className="alt-actions">
        <button type="button" className="btn" onClick={returnToEntered}>← Return to what you entered</button>
        <button type="button" className="btn ghost" onClick={keepAlternative}>Keep this instead</button>
      </div>
    </div>
  );
}

function Delta({ now, base, unit, lowerIsBetter = true }: { now: number; base: number; unit: string; lowerIsBetter?: boolean }) {
  const d = now - base;
  if (!d) return <span className="delta same">same</span>;
  const good = lowerIsBetter ? d < 0 : d > 0;
  return <span className={`delta ${good ? "less" : "more"}`}>{d > 0 ? "+" : "−"}{Math.abs(d)} {unit}{Math.abs(d) === 1 ? "" : "s"}</span>;
}

function Status({ s }: { s: Scenario }) {
  return (
    <span className="cmp-status">
      {s.fails > 0 && <span className="st fail">{s.fails} blocker{s.fails > 1 ? "s" : ""}</span>}
      {s.flags > 0 && <span className="st flag">{s.flags} open</span>}
      {!s.fails && !s.flags && <span className="st pass">Clear</span>}
    </span>
  );
}

/** The entry and one alternative side by side. */
function CompareTable({ base, alt }: { base: Scenario; alt: Scenario }) {
  const rows: [string, React.ReactNode, React.ReactNode][] = [
    ["What changes", <span key="b" className="muted">As entered</span>, changedFacts(base.inputs, alt.inputs).join(", ") || "nothing"],
    ["Route", base.route, <>{alt.route}{alt.route !== base.route && <span className="delta more"> changes</span>}</>],
    ["Steps to approval", base.approvalSteps, <>{alt.approvalSteps} <Delta now={alt.approvalSteps} base={base.approvalSteps} unit="step" /></>],
    ["Public hearings", base.hearings, <>{alt.hearings} <Delta now={alt.hearings} base={base.hearings} unit="hearing" /></>],
    ["Town review", base.reviewDays ? `${base.reviewDays} days` : "no clocks", <>{alt.reviewDays ? `${alt.reviewDays} days` : "no clocks"} <Delta now={alt.reviewDays} base={base.reviewDays} unit="day" /></>],
    ["Approval recorded", `month ${months(base.approvalDays)}`, <>month {months(alt.approvalDays)} <Delta now={months(alt.approvalDays)} base={months(base.approvalDays)} unit="month" /></>],
    ["Blockers and open questions", <Status key="b" s={base} />, <Status key="a" s={alt} />],
    ["Who decides", <Deciders key="b" ids={base.deciders} compact />, <Deciders key="a" ids={alt.deciders} compact />],
  ];
  return (
    <div className="tablewrap cmp-table">
      <table>
        <thead><tr><th scope="col"><span className="sr-only">Measure</span></th><th scope="col">Your entry</th><th scope="col">{alt.label}</th></tr></thead>
        <tbody>
          {rows.map(([k, a, b]) => <tr key={k}><th scope="row">{k}</th><td>{a}</td><td>{b}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The alternatives the thresholds make worth a look, each measured against what was entered.
 * "Compare…" opens the two side by side without changing anything; "Try it" changes the project and keeps the entry.
 */
export function Alternatives() {
  const { inputs, entered, tryAlternative, returnToEntered } = useProject();
  const base = entered?.inputs ?? inputs;
  const rows = useMemo(() => scenarios(base), [base]);
  const [open, setOpen] = useState<string | null>(null);
  const me = rows[0];
  const alts = rows.slice(1);
  const trying = entered ? alts.find((s) => JSON.stringify(s.inputs) === JSON.stringify(inputs))?.id : undefined;

  return (
    <div className="alts">
      <div className="alt-card is-entry">
        <div className="alt-main">
          <p className="alt-k">Your entry{entered ? " (kept while you try an alternative)" : ""}</p>
          <b>{me.route}</b>
          <p className="small muted">{me.approvalSteps} steps to approval · {me.hearings ? `${me.hearings} public hearing${me.hearings > 1 ? "s" : ""}` : "no public hearing"} · approval recorded about month {months(me.approvalDays)}</p>
          <Deciders ids={me.deciders} compact />
        </div>
        <Status s={me} />
      </div>
      {alts.length === 0 && <p className="muted small">No nearby alternative changes the route or the review for these facts.</p>}
      {alts.map((s) => {
        const isOpen = open === s.id;
        const now = trying === s.id;
        return (
          <div key={s.id} className={`alt-card${isOpen ? " is-open" : ""}${now ? " is-trying" : ""}`}>
            <div className="alt-row">
              <div className="alt-main">
                <p className="alt-k">{now ? "Trying now" : "Alternative"}</p>
                <b>{s.label}</b>
                <p className="small muted">{s.why}</p>
                <p className="alt-deltas small">
                  <span>{s.route}</span>
                  <span>{s.approvalSteps} steps <Delta now={s.approvalSteps} base={me.approvalSteps} unit="step" /></span>
                  <span>month {months(s.approvalDays)} <Delta now={months(s.approvalDays)} base={months(me.approvalDays)} unit="month" /></span>
                </p>
              </div>
              <div className="alt-side">
                <Status s={s} />
                <button type="button" className="btn ghost alt-cmp" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : s.id)}>
                  {isOpen ? "Close" : "Compare…"}
                </button>
              </div>
            </div>
            {isOpen && (
              <div className="alt-body">
                <CompareTable base={me} alt={s} />
                <div className="actions">
                  {now
                    ? <button type="button" className="btn" onClick={returnToEntered}>← Return to what you entered</button>
                    : <button type="button" className="btn" onClick={() => tryAlternative(s.label, s.inputs)}>Try it on the check</button>}
                  {now
                    ? <Link href="/project" className="link-btn">See the check for it</Link>
                    : <span className="muted small">Comparing changes nothing. Trying it keeps what you entered, to return to.</span>}
                </div>
              </div>
            )}
          </div>
        );
      })}
      <p className="small muted">
        Each alternative is classified from its own facts. Town review counts statutory clocks at their maximums. &ldquo;Approval recorded&rdquo; is months from the start date, with estimates for steps that have no clock.
      </p>
    </div>
  );
}

/** The five routes. The facts pick one; choosing another by hand shows its steps. */
export function RoutePicker() {
  const { tree, auto, setOverride, override } = useProject();
  return (
    <>
      <div className="trees">
        {TREE_ORDER.map((k) => {
          const t = routeText(k);
          return (
            <button key={k} type="button" className={`tree-card${k === auto ? " is-auto" : ""}`} aria-pressed={k === tree} onClick={() => setOverride(k === auto ? "auto" : k)}>
              <b>{t.name}</b>
              <span>{t.rule}</span>
              <span>{t.blurb}</span>
              <span className="small tree-status">{t.status}</span>
              {k === auto && <span className="small tree-auto">Set by your facts</span>}
            </button>
          );
        })}
      </div>
      {override !== "auto" && (
        <p className="small route-hand">
          Chosen by hand: {routeText(override).name}. <button type="button" className="link-btn" onClick={() => setOverride("auto")}>Go back to the route your facts pick ({routeText(auto).name})</button>
        </p>
      )}
    </>
  );
}
