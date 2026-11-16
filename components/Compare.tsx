"use client";

import Link from "next/link";

import { CONTACTS, KIND_LABEL, shortName } from "@/lib/data/contacts";
import { TREE_ORDER } from "@/lib/data/trees";
import { fmt, routeText } from "@/lib/engine";
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
