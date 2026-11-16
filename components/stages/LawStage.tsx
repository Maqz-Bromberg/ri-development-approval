"use client";

import { AlternativeRoutes } from "../AlternativeRoutes";
import { AltBanner } from "../Compare";
import { LawCheck } from "../LawCheck";
import { useProject } from "../ProjectProvider";
import { useTrial } from "../Trial";
import { Verdict } from "../Verdict";
import { Band, Continue } from "./Band";

/** Zoning & law: the verdict, its facts, every finding with its quote, and the statutory clocks. */
export function LawStage() {
  const { origin } = useProject();
  const trial = useTrial();
  return (
    <div className="stage">
      <Band id="law" title="Can this be built here, and by which route?" />
      <AltBanner />
      {origin === "example" && (
        <p className="start-callout"><b>This is the example project, not yours.</b> The facts it rests on are in the rail on the left. Choose your site on the Site stage to check your own.</p>
      )}
      <section className="sec" aria-labelledby="h-verdict">
        <div className="sec-head"><p className="eyebrow">The verdict</p><h2 id="h-verdict">In short</h2></div>
        <Verdict check premise={false} />
      </section>
      {trial.alts === "check" && (
        <details className="alts-fold">
          <summary>Nearby alternatives, as routes</summary>
          <AlternativeRoutes />
        </details>
      )}
      <section className="sec" aria-labelledby="h-answer" id="answer">
        <div className="sec-head"><p className="eyebrow">The answer</p><h2 id="h-answer">What the rules say about this project</h2></div>
        <LawCheck head={false} />
      </section>
      <Continue id="law" />
    </div>
  );
}
