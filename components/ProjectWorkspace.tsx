"use client";

import Link from "next/link";
import { TREE_ORDER } from "@/lib/data/trees";
import { routeText } from "@/lib/engine";
import { AddressLookup } from "./AddressLookup";
import { AtlasPanel } from "./AtlasPanel";
import { CheckBar, ProjectCard } from "./CheckLayouts";
import { DemoList } from "./Demo";
import { IntakeForm } from "./IntakeForm";
import { LawCheck } from "./LawCheck";
import { useProject } from "./ProjectProvider";
import { useTrial } from "./Trial";
import { Verdict } from "./Verdict";
import { WhatIf } from "./WhatIf";
import { ZoningMap } from "./ZoningMap";

const INTRO: Record<string, string> = {
  side: "Describe the project first, from an address if you have one. The answer follows from those facts and updates as you change them.",
  pinned: "Describe the project first, from an address if you have one. The answer stays in view beside the form and updates as you change the facts.",
  stacked: "The project's facts sit directly above the answer. Unfold the project to look up an address or change a fact; the answer updates as you do.",
  bar: "The bar under the header keeps the project's facts and its answer together while you scroll. Change any fact below.",
  old: "Start from an address or enter the site facts. The verdict and the findings update as you type.",
};

/**
 * The Check page: describe the project, then read the answer it leads to, then compare the alternatives.
 * The project comes before the answer in reading order, and the answer restates the facts it rests on.
 * Layouts and the map's placement are on trial (Trial.tsx); every layout keeps the facts with the answer.
 * The steps live on /steps.
 */
export function ProjectWorkspace() {
  const { tree, auto, setOverride } = useProject();
  const { checkLayout: layout, mapPlace } = useTrial();
  const twoCol = layout === "side" || layout === "pinned";
  const lookup = <AddressLookup map={mapPlace === "address"} />;
  const answerLabel = <p className="col-label"><span aria-hidden="true">2</span> The answer</p>;

  return (
    <div className={`check-page layout-${layout}`}>
      {layout === "bar" && <CheckBar />}
      <section className="sec" aria-labelledby="h-intake">
        <div className="sec-head">
          <p className="eyebrow">Check</p>
          <h1 id="h-intake" className="h2">Can this be built here, and by which route?</h1>
          <p>{INTRO[layout] ?? INTRO.old}</p>
          {(twoCol || layout === "bar") && <a href="#answer" className="to-answer">Skip to the answer ↓</a>}
        </div>

        {layout === "top" && <Verdict />}

        {layout === "stacked" ? (
          <>
            <ProjectCard>
              {lookup}
              <IntakeForm />
            </ProjectCard>
            <div className="answer-col answer-stacked" id="answer">
              {answerLabel}
              <Verdict check premise={false} />
              <LawCheck head={false} />
            </div>
          </>
        ) : (
          <div className={`intake${twoCol ? " check-split" : ""}${layout === "pinned" ? " pinned" : ""}`}>
            <div className="intake-col">
              {twoCol && <p className="col-label"><span aria-hidden="true">1</span> The project</p>}
              {lookup}
              <IntakeForm />
            </div>
            {twoCol ? (
              <div className="answer-col" id="answer">
                {answerLabel}
                <Verdict check />
                <LawCheck head={false} />
              </div>
            ) : (
              <div className="answer-col" id="answer"><LawCheck /></div>
            )}
          </div>
        )}
        <div className="next-row">
          <Link href="/steps" className="btn">Go to the approval steps →</Link>
          <Link href="/schedule" className="btn ghost">See it on the calendar</Link>
        </div>
      </section>

      <section className="sec" aria-labelledby="h-district">
        <div className="sec-head">
          <p className="eyebrow">Your district</p>
          <h2 id="h-district">What the zoning allows here</h2>
          {mapPlace === "address" && <p>The map of the district and the parcels around the site is in the address step above.</p>}
        </div>
        {mapPlace === "beside" ? (
          <div className="district-split">
            <ZoningMap placement="beside" />
            <AtlasPanel />
          </div>
        ) : mapPlace === "wide" ? (
          <div className="district-wide">
            <ZoningMap placement="wide" />
            <AtlasPanel />
          </div>
        ) : (
          <AtlasPanel />
        )}
      </section>

      <section className="sec" aria-labelledby="h-whatif">
        <div className="sec-head">
          <p className="eyebrow">What if</p>
          <h2 id="h-whatif">Nearby alternatives</h2>
          <p>A unit either side of a threshold can add or remove a whole review stage. These are the alternatives the rules make worth comparing for this site.</p>
        </div>
        <WhatIf />
      </section>

      <section className="sec" aria-labelledby="h-trees">
        <div className="sec-head">
          <p className="eyebrow">Development types</p>
          <h2 id="h-trees">The five routes</h2>
          <p>The site facts pick one automatically. Choose another to see its steps.</p>
        </div>
        <div className="trees">
          {TREE_ORDER.map((k) => {
            const t = routeText(k);
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
    </div>
  );
}
