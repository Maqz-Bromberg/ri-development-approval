"use client";

import Link from "next/link";

import { CONTACTS, KIND_LABEL, shortName } from "@/lib/data/contacts";
import { fmt, routeText } from "@/lib/engine";
import { addDays, fmtDate, parseISO } from "@/lib/schedule";
import { routeScenarios, type Scenario } from "@/lib/whatif";
import type { ProjectInputs } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { TREE_ORDER } from "@/lib/data/trees";
import type { TreeId } from "@/lib/types";
import { STEP_RANK, StepIcon } from "./StepIcon";
import { useTrial } from "./Trial";
import { KindIcon } from "./Authority";
import { Diff, ListDiff, type Dir } from "./DiffCell";
import { Icon } from "./Icon";
import { HoverCard } from "./Popover";
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

/**
 * The five routes, compared three ways on trial (`routes`, ARD D51): a diff table, the five cards, or one row that opens the route in focus
 * and shows how its neighbours differ from it. In each, choosing a route other than the one the facts pick is choosing it by hand.
 */
export function RoutePicker() {
  const { auto, setOverride, override } = useProject();
  const trial = useTrial();
  return (
    <>
      {trial.routes === "cards" ? <RouteCards /> : trial.routes === "focus" ? <RouteFocus /> : <RouteDiffTable />}
      {override !== "auto" && (
        <p className="small route-hand">
          Chosen by hand: {routeText(override).name}. <button type="button" className="link-btn" onClick={() => setOverride("auto")}>Go back to the route your facts pick ({routeText(auto).name})</button>
        </p>
      )}
    </>
  );
}

type PathStep = { id: string; title: string; who?: string };

/**
 * A route's steps before the building permit as a strip of step marks (ARD D52). Against another route (`against`), a step this route adds
 * is marked +, and a step it drops is shown faded and struck where it would have been.
 */
function Pathway({ steps, against }: { steps: PathStep[]; against?: PathStep[] }) {
  const mine = new Map(steps.map((x) => [x.id, x]));
  const theirs = new Map((against ?? steps).map((x) => [x.id, x]));
  const ids = [...new Set([...steps.map((x) => x.id), ...(against ?? []).map((x) => x.id)])].sort((a, b) => STEP_RANK.indexOf(a) - STEP_RANK.indexOf(b));
  return (
    <ol className="pathway" aria-label="Steps before the building permit">
      {ids.map((id) => {
        const x = mine.get(id) ?? theirs.get(id)!;
        const st = !against ? "same" : !mine.has(id) ? "del" : !theirs.has(id) ? "add" : "same";
        return (
          <li key={id} className={`pw-${st}`} title={`${st === "add" ? "Adds: " : st === "del" ? "Drops: " : ""}${x.title}`}>
            <StepIcon id={id} who={x.who} size={17} />
            <span className="sr-only">{st === "add" ? "Adds " : st === "del" ? "Drops " : ""}{x.title}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** The five routes as cards: each with its rule, what it involves and how well it is sourced. The facts pick one; another can be chosen by hand. */
function RouteCards() {
  const { tree, auto, setOverride, inputs } = useProject();
  const measured = useMemo(() => new Map(routeScenarios(inputs, tree).map((r) => [r.tree, r])), [inputs, tree]);
  return (
    <div className="trees">
      {TREE_ORDER.map((k) => {
        const t = routeText(k);
        return (
          <button key={k} type="button" className={`tree-card${k === auto ? " is-auto" : ""}`} aria-pressed={k === tree} onClick={() => setOverride(k === auto ? "auto" : k)}>
            <b>{t.name}</b>
            <Pathway steps={measured.get(k)!.steps} />
            <span>{t.rule}</span>
            <span>{t.blurb}</span>
            <span className="small tree-status">{t.status}</span>
            {k === auto && <span className="small tree-auto">Set by your facts</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Lightest review to heaviest, so a route's neighbours are the ones nearest to it in what they ask. */
const FOCUS_ORDER: TreeId[] = ["byright", "dpr", "minor", "major", "comp"];

/** The main ways route `a` differs from route `f`: steps added and dropped, hearings, the statutory clock, deciders added and dropped. */
function mainDifferences(a: Scenario, f: Scenario): { key: string; cls: string; text: string }[] {
  const out: { key: string; cls: string; text: string }[] = [];
  const fs = new Set(f.steps.map((x) => x.id)), as = new Set(a.steps.map((x) => x.id));
  a.steps.filter((x) => !fs.has(x.id)).forEach((x) => out.push({ key: `+${x.id}`, cls: "dl-add", text: `+ ${x.title}` }));
  f.steps.filter((x) => !as.has(x.id)).forEach((x) => out.push({ key: `-${x.id}`, cls: "dl-del", text: `− ${x.title}` }));
  if (a.hearings !== f.hearings) out.push({ key: "h", cls: a.hearings < f.hearings ? "df-better" : "df-worse", text: `${a.hearings} hearing${a.hearings === 1 ? "" : "s"} vs ${f.hearings}` });
  if (a.reviewDays !== f.reviewDays) out.push({ key: "c", cls: a.reviewDays < f.reviewDays ? "df-better" : "df-worse", text: a.reviewDays ? `Clock: ${a.reviewDays} days vs ${f.reviewDays ? f.reviewDays : "none"}` : `No clock vs ${f.reviewDays} days` });
  const fd = new Set(f.deciders), ad = new Set(a.deciders);
  a.deciders.filter((id) => !fd.has(id) && CONTACTS[id]).forEach((id) => out.push({ key: `+d${id}`, cls: "dl-add", text: `+ ${shortName(CONTACTS[id].name)} decides` }));
  f.deciders.filter((id) => !ad.has(id) && CONTACTS[id]).forEach((id) => out.push({ key: `-d${id}`, cls: "dl-del", text: `− ${shortName(CONTACTS[id].name)}` }));
  return out;
}

/**
 * The five routes in one row, lightest to heaviest. The route in focus (the one last clicked, else the one the project is on) is open:
 * its rule, what it involves, how well it is sourced, and a button to use it. Its two neighbours show the main ways they differ from
 * it, highlighted as in the diff table. The routes further off fold to their title. A click on a card opens it; it does not choose it.
 * (On hover until 2026-11-18: even with hover intent, the row moving under the pointer was more trouble than a click.)
 */
function RouteFocus() {
  const { tree, auto, setOverride, inputs } = useProject();
  const [picked, setPicked] = useState<TreeId | null>(null);
  const measured = useMemo(() => new Map(routeScenarios(inputs, tree).map((r) => [r.tree, r])), [inputs, tree]);
  // Choosing a route brings the focus back to the route the project is on.
  useEffect(() => { setPicked(null); }, [tree]);
  const focus = picked ?? tree;
  const fi = FOCUS_ORDER.indexOf(focus);
  return (
    <div className="route-focus">
      {FOCUS_ORDER.map((k, i) => {
        const t = routeText(k);
        const d = Math.abs(i - fi);
        const cls = d === 0 ? "is-focus" : d === 1 ? "is-near" : "is-far";
        const diffs = d === 1 ? mainDifferences(measured.get(k)!, measured.get(focus)!) : [];
        const open = () => { if (d) setPicked(k); };
        return (
          <div
            key={k}
            className={`rf-card ${cls}${k === tree ? " is-on" : ""}${k === auto ? " is-auto" : ""}`}
            {...(d ? {
              role: "button", tabIndex: 0, "aria-label": `${t.name}: open it`, onClick: open,
              onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } },
            } : { "aria-current": k === tree ? ("true" as const) : undefined })}
          >
            <b className="rf-name">{t.name}</b>
            {k === auto && <span className="rd-tag">Set by your facts</span>}
            {k === tree && k !== auto && <span className="rd-tag hand">Chosen by hand</span>}
            {d < 2 && <Pathway steps={measured.get(k)!.steps} against={d === 1 ? measured.get(focus)!.steps : undefined} />}
            {d === 0 && (
              <>
                <span className="rf-rule">{t.rule}</span>
                <span className="rf-blurb">{t.blurb}</span>
                <span className="small tree-status">{t.status}</span>
                {k === tree
                  ? <span className="small muted">The route the project is on.</span>
                  : <button type="button" className="btn ghost rf-use" onClick={() => setOverride(k === auto ? "auto" : k)}>{k === auto ? "Back to this route" : "Use this route"}</button>}
              </>
            )}
            {d === 1 && (
              <span className="rf-diffs">
                <span className="rf-vs">Against {routeText(focus).name}:</span>
                {diffs.length ? diffs.slice(0, 5).map((x) => <span key={x.key} className={`rf-diff ${x.cls}`}>{x.text}</span>) : <span className="rf-diff df-same-sw">no difference for these facts</span>}
                {diffs.length > 5 && <span className="rf-more">and {diffs.length - 5} more</span>}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * The five routes as a diff against the one the project is on (ARD D51). The route you are on is the first row, in full; each other
 * row says what changes if the town treated the project that way: the steps added (+), dropped (−) or done under another name (~),
 * the hearings, the statutory clock, who decides, and when the approval is recorded, each struck out and replaced where it differs.
 * Every route is measured with your facts, so a route your facts do not pick is shown as it would run, not as one you qualify for.
 */
function RouteDiffTable() {
  const { tree, auto, setOverride, inputs } = useProject();
  const rows = useMemo(() => {
    const all = routeScenarios(inputs, tree);
    return [...all.filter((r) => r.current), ...all.filter((r) => !r.current)];
  }, [inputs, tree]);
  const me = rows[0];
  const recorded = (r: Scenario) => fmtDate(addDays(parseISO(inputs.startDate), r.approvalDays), { month: "short", year: "numeric" });
  const clock = (r: Scenario) => (r.reviewDays ? `${r.reviewDays} days` : "no clock");
  const lower = (a: number, b: number): Dir => (a === b ? "same" : a < b ? "better" : "worse");
  const people = (r: Scenario) => r.deciders.filter((id) => CONTACTS[id]).map((id) => ({ id, label: shortName(CONTACTS[id].name) }));
  const steps = (r: Scenario) => r.steps.map((x) => ({ id: x.id, label: x.title, who: x.who }));

  return (
    <>
      <ul className="df-key" aria-label="How to read the table">
        <li><span className="df-sw dl-add-sw">+ step</span> added on that route</li>
        <li><span className="df-sw dl-del-sw">− step</span> dropped</li>
        <li><span className="df-sw dl-mod-sw">~ step</span> done under another name</li>
        <li><span className="df-sw df-better">5</span> shorter or lighter</li>
        <li><span className="df-sw df-worse">7</span> longer or heavier</li>
        <li><span className="df-sw df-same-sw">2</span> the same as yours</li>
      </ul>
      <div className="tablewrap">
        <table className="route-diff alt-diff">
          <thead>
            <tr className="df-heads">
              <th scope="col">Route</th>
              <th scope="col" className="g-result"><span className="df-ic"><Icon name="milestone" size={17} /></span>Steps before the building permit</th>
              <th scope="col" className="g-result"><span className="df-ic"><Icon name="hear" size={17} /></span>Hearings</th>
              <th scope="col" className="g-result"><span className="df-ic"><Icon name="deadline" size={17} /></span>Statutory clock</th>
              <th scope="col" className="g-result"><span className="df-ic"><Icon name="appointed" size={17} /></span>Who decides</th>
              <th scope="col" className="g-result"><span className="df-ic"><Icon name="stamp" size={17} /></span>Approval recorded</th>
              <th scope="col"><span className="sr-only">Choose</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const t = routeText(r.tree, inputs.town);
              return (
                <tr key={r.tree} className={`${r.current ? "is-entry" : ""}${r.tree === auto ? " is-auto" : ""}`}>
                  <th scope="row">
                    <span className="df-gutter" aria-hidden="true">{r.current ? "=" : "±"}</span>
                    <HoverCard className="rd-name" label={`${t.name}: what the route is`} width={340} card={<><b className="pop-title">{t.name}</b><p>{t.rule}</p><p>{t.blurb}</p><p className="muted small">{t.status}</p></>}>
                      {t.name}
                    </HoverCard>
                    <small>{t.rule}</small>
                    {r.tree === auto && <span className="rd-tag">Set by your facts</span>}
                    {r.current && r.tree !== auto && <span className="rd-tag hand">Chosen by hand</span>}
                  </th>
                  {r.current
                    ? <td className="df-list"><ol className="with-ic">{r.steps.map((x) => <li key={x.id}><StepIcon id={x.id} who={x.who} size={15} />{x.title}</li>)}</ol></td>
                    : <ListDiff was={steps(me)} now={steps(r)} icon={(x) => <StepIcon id={x.id} who={x.who} size={14} />} />}
                  {r.current ? <td>{r.hearings}</td> : <Diff was={me.hearings} now={r.hearings} dir={lower(r.hearings, me.hearings)} />}
                  {r.current ? <td>{clock(r)}</td> : <Diff was={clock(me)} now={clock(r)} dir={r.reviewDays === me.reviewDays ? "same" : lower(r.reviewDays, me.reviewDays)} />}
                  {r.current
                    ? <td className="df-list"><ul>{people(r).map((x) => <li key={x.id}>{x.label}</li>)}</ul></td>
                    : <ListDiff was={people(me)} now={people(r)} />}
                  {r.current ? <td>{recorded(r)}</td> : <Diff was={recorded(me)} now={recorded(r)} dir={recorded(r) === recorded(me) ? "same" : lower(r.approvalDays, me.approvalDays)} />}
                  <td>
                    {r.current
                      ? <span className="small muted">On this route</span>
                      : <button type="button" className="btn ghost" onClick={() => setOverride(r.tree === auto ? "auto" : r.tree)}>{r.tree === auto ? "Back to it" : "Use it"}</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
