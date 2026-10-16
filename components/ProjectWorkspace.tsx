"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TREES, TREE_ORDER } from "@/lib/data/trees";
import { AtlasPanel } from "./AtlasPanel";
import { FlowChart } from "./FlowChart";
import { IntakeForm } from "./IntakeForm";
import { LawCheck } from "./LawCheck";
import { PrecedentTable } from "./PrecedentTable";
import { useProject } from "./ProjectProvider";
import { StepSheets } from "./StepSheets";

export function ProjectWorkspace() {
  const { tree, auto, setOverride, clearChecks } = useProject();
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [confirmClear, setConfirmClear] = useState(false);

  const openSheet = (id: string) => {
    setOpen((prev) => new Set(prev).add(id));
    requestAnimationFrame(() => document.getElementById(`d-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  // Deep links such as /project#d-master open that sheet.
  useEffect(() => {
    const m = window.location.hash.match(/^#d-([a-z]+)$/);
    if (m) {
      const id = m[1];
      setOpen((prev) => new Set(prev).add(id));
      setTimeout(() => document.getElementById(`d-${id}`)?.scrollIntoView({ block: "start" }), 50);
    }
  }, []);

  return (
    <>
      <section className="sec" aria-labelledby="h-intake">
        <div className="sec-head">
          <div><p className="eyebrow">1 · Project input</p><h1 id="h-intake" className="h2">Describe the project</h1></div>
          <p>Upload the plan set and confirm the site facts. Plan extraction and live GIS lookups will run on the backend. For now, enter the extracted values by hand.</p>
        </div>
        <div className="intake">
          <IntakeForm />
          <LawCheck />
        </div>
        <AtlasPanel />
      </section>

      <section className="sec" aria-labelledby="h-flow">
        <div className="sec-head">
          <div><p className="eyebrow">2 · Approval flow</p><h2 id="h-flow">Approval route for this project</h2></div>
          <p>Each step's application moves down the centre line. The authority that decides it feeds in from the right. Select a step to open its sheet, or <Link href="/schedule">see it on the calendar</Link>.</p>
        </div>
        <FlowChart onOpen={openSheet} />
      </section>

      <section className="sec" aria-labelledby="h-steps">
        <div className="sec-head">
          <div><p className="eyebrow">3 · Step sheets</p><h2 id="h-steps">Documents, checklists, contacts and sources</h2></div>
          <p>Open a document's considerations to work through it. Ticks are saved in this browser and move the builder along the trail on the overview page.</p>
        </div>
        <StepSheets open={open} setOpen={setOpen} />
        <div className="clear-row">
          {confirmClear ? (
            <>
              <span className="small">Clear every tick for every route?</span>
              <button type="button" className="btn danger" onClick={() => { clearChecks(); setConfirmClear(false); }}>Clear ticks</button>
              <button type="button" className="btn ghost" onClick={() => setConfirmClear(false)}>Keep them</button>
            </>
          ) : (
            <button type="button" className="btn ghost" onClick={() => setConfirmClear(true)}>Clear all ticks</button>
          )}
        </div>
      </section>

      <section className="sec" aria-labelledby="h-hist">
        <div className="sec-head">
          <div><p className="eyebrow">4 · Precedent</p><h2 id="h-hist">Related approvals in Cumberland</h2></div>
          <p>Multifamily projects from recent Planning Board agendas, ranked by similarity to yours. Agendas show the stage reached. Outcomes are given only where a source states them.</p>
        </div>
        <PrecedentTable />
      </section>

      <section className="sec" aria-labelledby="h-trees">
        <div className="sec-head">
          <div><p className="eyebrow">5 · Development types</p><h2 id="h-trees">Approval trees by development type</h2></div>
          <p>Each development type has its own tree. The project facts pick one automatically, or you can choose one here.</p>
        </div>
        <div className="trees">
          {TREE_ORDER.map((k) => {
            const t = TREES[k];
            return (
              <button key={k} type="button" className="tree-card" aria-pressed={k === tree} onClick={() => setOverride(k === auto ? "auto" : k)}>
                <b>{t.name}</b>
                <span>{t.rule}</span>
                <span>{t.blurb}</span>
                <span className="mono small">{t.status}{k === auto ? " · matches your project" : ""}</span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
