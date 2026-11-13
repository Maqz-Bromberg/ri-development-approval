import type { Metadata } from "next";
import Link from "next/link";
import { DEV_PROJECTS } from "@/lib/data/devProjects";
import { OPEN_QUESTIONS, type QStatus } from "@/lib/data/openQuestions";

export const metadata: Metadata = { title: "Dev notes", robots: { index: false } };

const AREAS = ["Board calendars", "Real timelines", "Verification", "Statewide", "Site-wide"] as const;
const LABEL: Record<QStatus, string> = { open: "Open", review: "Larger review", decided: "Decided so far" };

export default function DevPage() {
  return (
    <section className="sec" aria-labelledby="dev-h">
      <div className="sec-head">
        <div>
          <p className="eyebrow">For the people building this</p>
          <h1 id="dev-h" className="h2">Dev notes</h1>
        </div>
        <p>Working pages and the questions still open. This page is not in the navigation. The list lives in <code>lib/data/openQuestions.ts</code>.</p>
      </div>
      <ul className="dev-links">
        <li><Link href="/verification"><b>Verification</b></Link> · how a record gets onto a timeline, with the risk at each stage</li>
        <li><Link href="/after-approval"><b>From build</b></Link> · post-approval milestones (empty so far)</li>
        <li><Link href="/towns"><b>Towns</b></Link> · coverage level for each of the 39 towns</li>
      </ul>
      <h2 className="h2" id="projects">Verification and maintenance projects</h2>
      <p className="muted">Where each stands, and an idea for it. Effort: S an afternoon, M a few days, L needs a decision or the larger review first.</p>
      {(["Verification", "Maintenance"] as const).map((g) => (
        <section key={g} aria-label={g}>
          <h3 className="h3">{g}</h3>
          <ul className="dev-proj">
            {DEV_PROJECTS.filter((p) => p.group === g).map((p) => (
              <li key={p.title}>
                <b>{p.title}</b> <span className={`q-status p-${p.status}`}>{p.status}</span> <span className="q-status">effort {p.effort}</span>
                <p><span className="muted">Now:</span> {p.now}</p>
                <p><span className="muted">Idea:</span> {p.idea}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <h2 className="h2">Open questions</h2>
      {AREAS.map((a) => (
        <section key={a} aria-label={a}>
          <h2 className="h3">{a}</h2>
          <ul className="dev-q">
            {OPEN_QUESTIONS.filter((q) => q.area === a).map((q) => (
              <li key={q.q} className={`q-${q.status}`}>
                <span className={`q-status q-${q.status}`}>{LABEL[q.status]}</span> {q.q}
                {q.note && <p className="muted small">{q.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  );
}
