"use client";

import Link from "next/link";
import { TREES, TREE_ORDER } from "@/lib/data/trees";
import { AddressLookup } from "./AddressLookup";
import { AtlasPanel } from "./AtlasPanel";
import { DemoList } from "./Demo";
import { IntakeForm } from "./IntakeForm";
import { LawCheck } from "./LawCheck";
import { useProject } from "./ProjectProvider";
import { useTrial } from "./Trial";
import { Verdict } from "./Verdict";
import { WhatIf } from "./WhatIf";

/** The Check page: describe the site, read the verdict, compare the alternatives. The steps live on /steps. */
export function ProjectWorkspace() {
  const { tree, auto, setOverride } = useProject();
  const trial = useTrial();

  return (
    <>
      <section className="sec" aria-labelledby="h-intake">
        <div className="sec-head">
          <p className="eyebrow">Check</p>
          <h1 id="h-intake" className="h2">Can this be built here, and by which route?</h1>
          <p>Start from an address or enter the site facts. The verdict and the findings update as you type.</p>
        </div>
        {trial.verdict === "verdict" && <Verdict />}
        <div className="intake">
          <div className="intake-col">
            <AddressLookup />
            <IntakeForm />
          </div>
          <LawCheck />
        </div>
        <div className="next-row">
          <Link href="/steps" className="btn">Go to the approval steps →</Link>
          <Link href="/schedule" className="btn ghost">See it on the calendar</Link>
        </div>
      </section>

      <section className="sec" aria-labelledby="h-whatif">
        <div className="sec-head">
          <p className="eyebrow">What if</p>
          <h2 id="h-whatif">Nearby alternatives</h2>
          <p>A unit either side of a threshold can add or remove a whole review stage. These are the alternatives the rules make worth comparing for this site.</p>
        </div>
        <WhatIf />
      </section>

      <section className="sec" aria-labelledby="h-district">
        <div className="sec-head">
          <p className="eyebrow">Your district</p>
          <h2 id="h-district">What the zoning allows here</h2>
        </div>
        <AtlasPanel />
      </section>

      <section className="sec" aria-labelledby="h-trees">
        <div className="sec-head">
          <p className="eyebrow">Development types</p>
          <h2 id="h-trees">The five routes</h2>
          <p>The site facts pick one automatically. Choose another to see its steps.</p>
        </div>
        <div className="trees">
          {TREE_ORDER.map((k) => {
            const t = TREES[k];
            return (
              <button key={k} type="button" className="tree-card" aria-pressed={k === tree} onClick={() => setOverride(k === auto ? "auto" : k)}>
                <b>{t.name}</b>
                <span>{t.rule}</span>
                <span>{t.blurb}</span>
                <span className="small tree-status">{t.status}{k === auto ? " · matches your project" : ""}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="sec" aria-label="Demo parts">
        <DemoList />
      </section>
    </>
  );
}
