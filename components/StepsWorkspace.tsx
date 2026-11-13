"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONTACTS, shortName } from "@/lib/data/contacts";
import { TREES } from "@/lib/data/trees";
import { hearingBody, verdict } from "@/lib/engine";
import { FlowChart } from "./FlowChart";
import { PrecedentTable } from "./PrecedentTable";
import { useProject } from "./ProjectProvider";
import { RouteFlow } from "./RouteFlow";
import { ShareTools } from "./ShareTools";
import { StepSheets } from "./StepSheets";
import { useTrial } from "./Trial";

/** The Work page: a sticky summary of the project, then the approval steps, ways to keep them, and precedent. */
export function StepsWorkspace() {
  const { inputs, tree, steps, clearChecks, checked } = useProject();
  const trial = useTrial();
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [confirmClear, setConfirmClear] = useState(false);
  const v = verdict(inputs, tree, steps);
  const anyTicked = Object.values(checked).some(Boolean);

  const openSheet = (id: string) => {
    setOpen((prev) => new Set(prev).add(id));
    requestAnimationFrame(() => document.getElementById(`d-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

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
    <>
      <div className="summary-bar">
        <div className="summary-bar-main">
          <b>{inputs.units} unit{inputs.units === 1 ? "" : "s"} · {inputs.zone === "other" ? "Cumberland" : `${inputs.zone}, Cumberland`}</b>
          <span>{TREES[tree].name}</span>
          {v.fails.length > 0 && <span className="st fail">{v.fails.length} blocker{v.fails.length > 1 ? "s" : ""}</span>}
          {v.flags.length > 0 && <span className="st flag">{v.flags.length} open</span>}
          {!v.fails.length && !v.flags.length && <span className="st pass">Clear</span>}
        </div>
        <Link href="/project" className="link-btn">Change the facts</Link>
      </div>

      <section className="sec" aria-labelledby="h-steps">
        <div className="sec-head">
          <p className="eyebrow">Approval steps</p>
          <h1 id="h-steps" className="h2">{steps.filter((s) => !s.branch).length} steps, and who holds each decision</h1>
          <p>
            Each row says what you file, who decides it and how long they have. Open a row for its documents, the things to consider
            before filing, and the questions to expect. Hearings are held by the {shortName(CONTACTS[hearingBody(steps)]?.name ?? "Planning Board")}.
          </p>
        </div>
        {trial.routeLayout === "consolidated" ? (
          <RouteFlow open={open} setOpen={setOpen} />
        ) : (
          <>
            <FlowChart onOpen={openSheet} />
            <div className="sec"><StepSheets open={open} setOpen={setOpen} /></div>
          </>
        )}
      </section>

      <section className="sec" aria-labelledby="h-keep">
        <div className="sec-head">
          <p className="eyebrow">Keep it</p>
          <h2 id="h-keep">Take this project with you</h2>
          <p>
            Ticks and notes live in this browser, which is easy to lose. A share link carries the whole project in the link itself,
            and a project file or a printed summary works without this site.
          </p>
        </div>
        <ShareTools />
        {anyTicked && trial.considerations === "tick" && (
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
          <h2 id="h-hist">Projects like yours in Cumberland</h2>
          <p>Multifamily projects from recent Planning Board agendas, closest match first. Outcomes are given only where a source states them.</p>
        </div>
        <PrecedentTable />
      </section>
    </>
  );
}
