"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CoverageNote } from "./Coverage";
import { CONTACTS, shortName } from "@/lib/data/contacts";
import { hearingBody } from "@/lib/engine";
import { PrecedentTable } from "./PrecedentTable";
import { useProject } from "./ProjectProvider";
import { RouteFlow } from "./RouteFlow";
import { ShareTools } from "./ShareTools";
import { ProjectFrame } from "./ProjectSummary";
import { townInfo } from "@/lib/data/towns";
import { historyFor } from "@/lib/data/history";

/** The Steps page: the project kept in view (ProjectSummary), then the approval steps, ways to keep them, and precedent. */
export function StepsWorkspace() {
  const { inputs, steps, clearChecks, checked } = useProject();
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [confirmClear, setConfirmClear] = useState(false);
  const anyTicked = Object.values(checked).some(Boolean);

  // Deep links such as /steps#d-master open that step.
  useEffect(() => {
    const m = window.location.hash.match(/^#d-([a-z]+)$/);
    if (m) {
      const id = m[1];
      setOpen((prev) => new Set(prev).add(id));
      setTimeout(() => document.getElementById(`d-${id}`)?.scrollIntoView({ block: "start" }), 50);
    }
  }, []);

  return (
    <ProjectFrame page="steps">
      <CoverageNote />

      <section className="sec" aria-labelledby="h-steps">
        <div className="sec-head">
          <p className="eyebrow">Approval steps</p>
          <h1 id="h-steps" className="h2">{steps.filter((s) => !s.branch).length} steps, and who holds each decision</h1>
          <p>
            Each row says what you file, who decides it and how long they have. Open a row for its documents, the things to consider
            before filing, and the questions to expect. Hearings are held by the {shortName(CONTACTS[hearingBody(steps)]?.name ?? "Planning Board")}.
          </p>
        </div>
        <RouteFlow open={open} setOpen={setOpen} />
      </section>

      <section className="sec" aria-labelledby="h-keep">
        <div className="sec-head">
          <p className="eyebrow">Keep it</p>
          <h2 id="h-keep">Take this project with you</h2>
          <p>
            Ticks and notes are saved in this browser, which is easy to lose. A share link carries the whole project in the link itself, the calendar file lists what you have ticked,
            and a project file or a printed summary works without this site.
          </p>
        </div>
        <ShareTools />
        {anyTicked && (
          <div className="clear-row">
            {confirmClear ? (
              <>
                <span className="small">Clear every tick for every route?</span>
                <button type="button" className="btn danger" onClick={() => { clearChecks(); setConfirmClear(false); }}>Clear ticks</button>
                <button type="button" className="btn ghost" onClick={() => setConfirmClear(false)}>Keep them</button>
              </>
            ) : (
              <button type="button" className="link-btn" onClick={() => setConfirmClear(true)}>Clear all ticks</button>
            )}
          </div>
        )}
      </section>

      <section className="sec" aria-labelledby="h-hist">
        <div className="sec-head">
          <p className="eyebrow">Precedent</p>
          <h2 id="h-hist">Projects like yours in {inputs.town}</h2>
          <p>Multifamily projects from recent {shortName(CONTACTS.pb?.name ?? "Planning Board")} records, closest match first. Outcomes are given only where a source states them.</p>
        </div>
        {historyFor(inputs.town).length > 0
          ? <>
              {townInfo(inputs.town).part && <p className="muted small">Read for {townInfo(inputs.town).part!.name} only. {townInfo(inputs.town).part!.note}</p>}
              <PrecedentTable />
            </>
          : <p className="muted">No projects from {inputs.town} have been read yet. Cumberland's are on the <Link href="/records">Records page</Link>, and show how one town applied the same state law.</p>}
      </section>
    </ProjectFrame>
  );
}
