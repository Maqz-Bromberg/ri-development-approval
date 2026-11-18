"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONTACTS, shortName } from "@/lib/data/contacts";
import { historyFor } from "@/lib/data/history";
import { townInfo } from "@/lib/data/towns";
import { hearingBody } from "@/lib/engine";
import { CoverageNote } from "../Coverage";
import { PrecedentTable } from "../PrecedentTable";
import { useProject } from "../ProjectProvider";
import { RouteFlow } from "../RouteFlow";
import { RouteMenu } from "../RouteMenu";
import { Verdict } from "../Verdict";
import { Band, Continue } from "./Band";

/** Route & people: the verdict in short with the route menu, the steps with who decides each, and projects like yours at the end. */
export function RouteStage() {
  const { inputs, steps, clearChecks, checked } = useProject();
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [confirmClear, setConfirmClear] = useState(false);
  const anyTicked = Object.values(checked).some(Boolean);

  // Deep links such as /route#d-master open that step.
  useEffect(() => {
    const m = window.location.hash.match(/^#d-([a-z]+)$/);
    if (m) {
      setOpen((prev) => new Set(prev).add(m[1]));
      setTimeout(() => document.getElementById(`d-${m[1]}`)?.scrollIntoView({ block: "start" }), 80);
    }
  }, []);

  return (
    <div className="stage">
      <Band id="route" title={`${steps.filter((s) => !s.branch).length} steps, and who holds each decision`}>
        <p className="band-more">
          Each row says what you file, who decides it and how long they have. Hearings are held by the {shortName(CONTACTS[hearingBody(steps)]?.name ?? "Planning Board")}.
        </p>
      </Band>
      <CoverageNote compact />
      <section className="sec route-verdict" aria-label="The verdict, in short">
        <div className="rv-route"><span className="muted small">Route</span> <RouteMenu /></div>
        <Verdict compact premise={false} />
      </section>

      <section className="sec" aria-labelledby="h-steps">
        <div className="sec-head"><h2 id="h-steps">The steps</h2></div>
        <RouteFlow open={open} setOpen={setOpen} />
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
              {!townInfo(inputs.town).marks.hearings && townInfo(inputs.town).parts?.map((p) => <p key={p.name} className="muted small">Read for {p.name} only. {p.reason} {p.note}</p>)}
              <PrecedentTable />
            </>
          : <p className="muted">No projects from {inputs.town} have been read yet. Cumberland's are on the <Link href="/records">Records page</Link>, and show how one town applied the same state law.</p>}
      </section>
      <Continue id="route" />
    </div>
  );
}
