"use client";

import { shortAddress } from "@/lib/lookup";
import Link from "next/link";
import { useMemo } from "react";
import { CONTACTS, shortName } from "@/lib/data/contacts";
import { TREES, TREE_ORDER } from "@/lib/data/state/trees";
import { fmt, hearingBody, projectLabel, verdict } from "@/lib/engine";
import { buildSchedule, fmtDate } from "@/lib/schedule";
import type { ProjectInputs, TreeId } from "@/lib/types";
import { useProject } from "./ProjectProvider";
import { Term } from "./Term";
import { routeText } from "@/lib/engine";

const months = (days: number) => Math.max(1, Math.round(days / 30.4));

const ORIGIN = { example: "Example project", browser: "Your project", link: "Project from a shared link", file: "Imported project" } as const;

/** The facts the answer rests on, each tied to the form field that sets it. */
export function projectBasis(i: ProjectInputs): { field: string; t: string }[] {
  const out: { field: string; t: string }[] = [];
  out.push({ field: i.kind === "commercial" ? "f-gfa" : "f-units", t: projectLabel(i) });
  if (i.aff && i.kind !== "commercial") out.push({ field: "f-aff", t: `${i.aff} affordable` });
  out.push({ field: "f-zone", t: i.zone === "other" ? `${i.town}, district not chosen` : `${i.zone}, ${i.town}` });
  out.push({ field: "f-lot", t: `${fmt(i.lot)} sq ft lot` });
  out.push({
    field: "f-water",
    t: i.water && i.sewer ? "public water and sewer" : i.water ? "public water, no sewer" : i.sewer ? "public sewer, no water" : "no public water or sewer",
  });
  out.push({ field: "f-dist", t: `${i.dist} acres disturbed` });
  if (i.wet) out.push({ field: "f-wet", t: "wetlands" });
  if (i.dot) out.push({ field: "f-dot", t: "state road access" });
  if (!i.wet && !i.dot) out.push({ field: "f-wet", t: "no wetlands or state road marked" });
  if (i.transit) out.push({ field: "f-transit", t: "near transit" });
  if (i.conservation) out.push({ field: "f-conservation", t: "conservation development" });
  if (i.rezone) out.push({ field: "f-rezone", t: "zone change sought" });
  return out;
}

/** Scroll to a form field and focus it. */
export function focusField(field: string) {
  const el = document.getElementById(field);
  if (!el) return;
  el.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  el.focus({ preventScroll: true });
}

/**
 * The facts line. With `check`, each fact is a button that goes to its field; `onPick` replaces that,
 * for a layout where the field may be folded away.
 */
export function ProjectFacts({ check = false, onPick, className = "verdict-basis" }: { check?: boolean; onPick?: (field: string) => void; className?: string }) {
  const { inputs } = useProject();
  const go = onPick ?? focusField;
  return (
    <p className={className}>
      {inputs.address && <span className="basis-addr">{shortAddress(inputs.address)}: </span>}
      {projectBasis(inputs).map((b, i) => (
        <span key={`${b.field}-${b.t}`}>
          {i > 0 && <span className="basis-sep" aria-hidden="true"> · </span>}
          {check ? (
            <button type="button" className="basis-item" onClick={() => go(b.field)} title="Go to this fact in the form">{b.t}</button>
          ) : b.t}
        </span>
      ))}
    </p>
  );
}

/** The answer in one line. It has no subject: the facts it rests on are shown before it. */
export function verdictHeadline(v: { fails: unknown[]; flags: unknown[] }): string {
  return v.fails.length
    ? "Needs relief or a different route"
    : v.flags.length
      ? "Can proceed, with questions to settle first"
      : "Fits the rules on these facts";
}

export const ORIGIN_LABEL = ORIGIN;

/**
 * The answer, read after the facts it rests on: where the project came from, the facts, then the
 * route, how long the town may take, what blocks it and what is still open.
 * `check` is the Check page's form: facts link back to their fields, the route can be overridden,
 * and blockers are left to the findings that follow.
 * `premise={false}` leaves out the origin and facts lines, for a layout that shows them directly above.
 */
export function Verdict({ compact = false, check = false, premise = true }: { compact?: boolean; check?: boolean; premise?: boolean }) {
  const { inputs, tree, auto, override, setOverride, steps, origin } = useProject();
  const v = verdict(inputs, tree, steps);
  const plan = useMemo(() => buildSchedule(tree, steps, inputs.startDate, inputs.town), [tree, steps, inputs.startDate, inputs.town]);
  const approved = plan.find((p) => p.step.id === "record") ?? plan.find((p) => p.step.id === "final") ?? plan.find((p) => p.step.id === "zcheck");
  const state = v.fails.length ? "fail" : v.flags.length ? "flag" : "pass";
  const headline = verdictHeadline(v);
  // The glossary defines the routes by the state thresholds, so a town that redraws them gets its own name without the gloss.
  const route = routeText(tree);
  const routeName = ["major", "minor", "comp", "dpr"].includes(tree) && !route.local ? <Term id={tree}>{route.name}</Term> : route.name;

  return (
    <div className={`verdict v-${state}${compact ? " compact" : ""}${check ? " check" : ""}`} aria-label={`${ORIGIN[origin]}: ${headline}`}>
      {premise && (
        <>
          <p className="verdict-kicker">
            {origin === "example" ? <span className="example-flag">{ORIGIN.example}</span> : <span>{ORIGIN[origin]}</span>}
            {check && origin === "example" && <span className="muted"> Sample facts, not yours. Look up an address or change any fact to check your own.</span>}
          </p>
          <ProjectFacts check={check} />
        </>
      )}
      <p className="verdict-head">{headline}</p>
      <dl className="verdict-facts">
        <div>
          <dt>Route</dt>
          <dd>
            {routeName}
            {check && (
              <label className="override verdict-override" htmlFor="f-tree">
                {override === "auto" ? "Set by the facts." : "Chosen by hand."}
                <select id="f-tree" value={override} onChange={(e) => setOverride(e.target.value as TreeId | "auto")} aria-label="Approval route">
                  <option value="auto">Auto ({routeText(auto).name})</option>
                  {TREE_ORDER.map((k) => <option key={k} value={k}>{routeText(k).name}</option>)}
                </select>
              </label>
            )}
          </dd>
        </div>
        <div>
          <dt>Town review</dt>
          <dd>{v.reviewDays ? <>up to {months(v.reviewDays)} months <span className="muted">({v.reviewDays} days of statutory clocks)</span></> : "no statutory review clocks"}</dd>
        </div>
        <div>
          <dt>Approval recorded</dt>
          <dd>{approved ? <>about {fmtDate(approved.end, { month: "short", year: "numeric" })} <span className="muted">from a {fmtDate(plan[0].start, { month: "short", day: "numeric" })} start</span></> : "not scheduled"}</dd>
        </div>
        <div>
          <dt>Hearings before</dt>
          <dd>{shortName(CONTACTS[hearingBody(steps)]?.name ?? "Planning Board")}</dd>
        </div>
        <div>
          <dt>State permits</dt>
          <dd>{v.statePermits.length ? v.statePermits.join(", ") : "none triggered by these facts"}</dd>
        </div>
      </dl>
      {check ? (
        <p className="verdict-next small muted">
          {v.fails.length + v.flags.length
            ? `${v.fails.length ? `${v.fails.length} blocker${v.fails.length > 1 ? "s" : ""}` : ""}${v.fails.length && v.flags.length ? " and " : ""}${v.flags.length ? `${v.flags.length} open question${v.flags.length > 1 ? "s" : ""}` : ""} below, each with the rule it comes from.`
            : "No blockers or open questions on these facts. The findings below show the rules checked."}
        </p>
      ) : (
        <ul className="verdict-issues">
          {v.fails.map((f) => <li key={f.t}><span className="st fail">Blocker</span><span>{f.t}</span></li>)}
          {v.flags.map((f) => <li key={f.t}><span className="st flag">Open</span><span>{f.t}</span></li>)}
          {!v.fails.length && !v.flags.length && <li><span className="st pass">Clear</span><span>No blockers or open questions on these facts.</span></li>}
        </ul>
      )}
      {compact && (
        <div className="verdict-actions">
          <Link href="/law" className="btn">See the check</Link>
          <Link href="/site" className="btn ghost">Edit the project</Link>
        </div>
      )}
    </div>
  );
}
