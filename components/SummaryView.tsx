"use client";

import { useMemo } from "react";
import { CONTACTS, KIND_LABEL, shortName } from "@/lib/data/contacts";
import { TREES } from "@/lib/data/trees";
import { analyze, condOK, fmt, itemKey, visibleDocs } from "@/lib/engine";
import { buildSchedule, fmtDate } from "@/lib/schedule";
import { useProject } from "./ProjectProvider";
import { ShareTools } from "./ShareTools";
import { Verdict } from "./Verdict";
import { routeText } from "@/lib/engine";

const LABEL = { fail: "Blocker", flag: "Open", info: "Note", pass: "Pass" } as const;

/** The whole project on one printable page: facts, verdict, findings, then each step with its notes. */
export function SummaryView() {
  const { inputs, tree, steps, flags, checked, notes, hydrated } = useProject();
  const plan = useMemo(() => buildSchedule(tree, steps, inputs.startDate, inputs.town), [tree, steps, inputs.startDate, inputs.town]);
  const findings = analyze(inputs, tree).filter((f) => f.st !== "pass");

  return (
    <div className="summary">
      <ShareTools printHere />
      <Verdict />
      <section className="sum-block">
        <h2>Site facts</h2>
        <dl className="metrics">
          <div><dt>Address</dt><dd>{inputs.address || "not entered"}</dd></div>
          <div><dt>Parcel</dt><dd>{inputs.parcel}</dd></div>
          <div><dt>Zoning district</dt><dd>{inputs.zone}</dd></div>
          <div><dt>Units</dt><dd>{inputs.units}{inputs.aff ? `, ${inputs.aff} affordable` : ""}</dd></div>
          <div><dt>Lot area</dt><dd>{fmt(inputs.lot)} sq ft</dd></div>
          <div><dt>Land disturbed</dt><dd>{inputs.dist} acres</dd></div>
          <div><dt>Utilities</dt><dd>{[inputs.water && "public water", inputs.sewer && "public sewer"].filter(Boolean).join(", ") || "neither"}</dd></div>
          <div><dt>Site flags</dt><dd>{[inputs.wet && "wetlands", inputs.dot && "state road", inputs.transit && "near transit", inputs.conservation && "conservation development", inputs.rezone && "zone change"].filter(Boolean).join(", ") || "none"}</dd></div>
          <div><dt>Start date</dt><dd>{hydrated ? fmtDate(plan[0]?.start ?? new Date()) : "…"}</dd></div>
        </dl>
      </section>
      {findings.length > 0 && (
        <section className="sum-block">
          <h2>Findings to act on</h2>
          <ul className="check-list">
            {findings.map((f) => <li key={f.t}><span className={`st ${f.st}`}>{LABEL[f.st]}</span><div><b>{f.t}</b><p>{f.p}</p></div></li>)}
          </ul>
        </section>
      )}
      <section className="sum-block">
        <h2>{routeText(tree).name}: steps</h2>
        <ol className="sum-steps">
          {steps.map((s) => {
            const when = plan.find((p) => p.step.id === s.id);
            const note = notes[`${tree}/${s.id}`]?.trim();
            const docs = visibleDocs(s, flags);
            const done = docs.flatMap((d) => d.checklist.map((item, i) => ({ item, on: !!checked[itemKey(tree, s.id, d, i)] }))).filter((x) => x.on);
            const total = docs.reduce((a, d) => a + d.checklist.length, 0);
            return (
              <li key={s.id}>
                <h3>{s.n}. {s.title}</h3>
                <p className="sum-meta">
                  {s.clock.text}{when ? ` · ${fmtDate(when.start)} to ${fmtDate(when.end)}` : ""}
                </p>
                <p><b>You file:</b> {s.app}</p>
                <p><b>{s.authLabel ?? "Decided by"}:</b> {s.auth.filter((a) => condOK(a.cond, flags)).map((a) => `${shortName(CONTACTS[a.c].name)} (${KIND_LABEL[CONTACTS[a.c].kind].toLowerCase()})`).join("; ")}</p>
                <p><b>Documents:</b> {docs.map((d) => d.title).join("; ")}</p>
                {done.length > 0 && (
                  <>
                    <p><b>Dealt with ({done.length} of {total}):</b></p>
                    <ul>{done.map((x) => <li key={x.item}>{x.item}</li>)}</ul>
                  </>
                )}
                {note && <p className="sum-note"><b>Notes:</b> {note}</p>}
              </li>
            );
          })}
        </ol>
      </section>
      <p className="disclaimer">
        Printed from RI Building Plan Approval. Rules as published, October 2026. Not legal advice. Dates use statutory maximums and estimates, not the board's calendar.
      </p>
    </div>
  );
}
