"use client";

import Link from "next/link";
import { DemoList } from "./Demo";
import { LawCheck } from "./LawCheck";
import { ProjectFrame } from "./ProjectSummary";
import { useProject } from "./ProjectProvider";
import { Verdict } from "./Verdict";

/**
 * The Check page: the answer for the project entered on Site selection. The project stays in view (ProjectSummary)
 * while the findings are read, then the verdict summarises them. An example project says so first, and points to
 * Site selection, where the applicant starts.
 */
export function ProjectWorkspace() {
  const { origin } = useProject();

  return (
    <ProjectFrame page="check">
      <section className="sec check-intro" aria-labelledby="h-intake">
        <div className="sec-head">
          <p className="eyebrow">Check</p>
          <h1 id="h-intake" className="h2">Can this be built here, and by which route?</h1>
          <p>The findings for the project above, each with the rule it comes from. Change a fact by clicking it, which takes you to Site selection.</p>
        </div>
        {origin === "example" && (
          <div className="start-callout">
            <p><b>This is the example project, not yours.</b> Start with your site: the town, an address or a click on the map, the zoning district, and what you plan to build.</p>
            <Link href="/site" className="btn">Start with your site →</Link>
          </div>
        )}
      </section>

      <section className="sec" aria-labelledby="h-answer" id="answer">
        <div className="sec-head">
          <p className="eyebrow">The answer</p>
          <h2 id="h-answer">What the rules say about this project</h2>
        </div>
        <LawCheck head={false} />
      </section>

      <section className="sec" aria-labelledby="h-verdict">
        <div className="sec-head">
          <p className="eyebrow">The verdict</p>
          <h2 id="h-verdict">In short</h2>
        </div>
        <Verdict check premise={false} />
        <div className="next-row">
          <Link href="/steps" className="btn">Go to the approval steps →</Link>
          <Link href="/site#compare" className="btn ghost">Compare nearby alternatives</Link>
          <Link href="/schedule" className="btn ghost">See it on the calendar</Link>
        </div>
      </section>

      <section className="sec" aria-label="Demo parts">
        <DemoList />
      </section>
    </ProjectFrame>
  );
}
