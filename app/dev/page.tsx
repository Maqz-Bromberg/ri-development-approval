import type { Metadata } from "next";
import Link from "next/link";
import { DEV_PROJECTS } from "@/lib/data/devProjects";
import { OPEN_QUESTIONS, type QStatus } from "@/lib/data/openQuestions";
import { PAGE_NAMES, VARIANTS, type TrialKey } from "@/lib/trials";
import { SOURCE_NOTES, VIEW_NOTES, type CheckState } from "@/lib/data/sourceNotes";

export const metadata: Metadata = { title: "Dev notes", robots: { index: false } };

const AREAS = ["Providence trial", "Board calendars", "Real timelines", "Verification", "Statewide", "Site-wide"] as const;
const CHECK: Record<CheckState, { label: string; cls: string }> = { built: { label: "script checks it", cls: "p-built" }, partial: { label: "partly checked", cls: "p-partial" }, none: { label: "by hand", cls: "p-idea" } };
const LABEL: Record<QStatus, string> = { open: "Open", review: "Larger review", decided: "Decided so far" };

export default function DevPage() {
  return (
    <section className="sec" aria-labelledby="dev-h">
      <div className="sec-head">
        <div>
          <p className="eyebrow">For the people building this</p>
          <h1 id="dev-h" className="h2">Dev notes</h1>
        </div>
        <p>Working pages and the questions still open. This page is not in the navigation. The list lives in <code>lib/data/openQuestions.ts</code>. How the site is put together, and each decision behind it, is in <code>docs/ARD.md</code>.</p>
      </div>
      <ul className="dev-links">
        <li><Link href="/engine"><b>Engine</b></Link> · how the engine works, as flowcharts, one page for each part</li>
        <li><Link href="/verification"><b>Verification</b></Link> · how a record gets onto a timeline, with the risk at each stage</li>
        <li><Link href="/after-approval"><b>From build</b></Link> · post-approval milestones (empty so far)</li>
        <li><Link href="/towns"><b>Towns</b></Link> · coverage level for each of the 39 towns</li>
      </ul>
      <details className="dev-trials" id="trials">
        <summary><h2 className="h2">Design trials in progress ({(Object.keys(VARIANTS) as TrialKey[]).length})</h2></summary>
        <p className="muted">
          Switchable under <code>npm run dev</code> from the Trial button at the bottom right, which appears only on the pages named here. The published site uses the first option of each. Declared in <code>lib/trials.ts</code>; when a choice is made, delete the variant and the losing branches.
        </p>
        {Object.keys(VARIANTS).length === 0 && <p><b>None at the moment.</b> Every trial so far has been decided.</p>}
        <ul className="dev-proj">
          {(Object.keys(VARIANTS) as TrialKey[]).map((k) => (
            <li key={k}>
              <b>{VARIANTS[k].label}</b>
              <span className="muted"> · on </span>
              {VARIANTS[k].pages.map((pg, i) => <span key={pg}>{i > 0 && ", "}<Link href={pg}>{PAGE_NAMES[pg] ?? pg}</Link></span>)}
              <p className="muted">{VARIANTS[k].note}</p>
              <ol className="dev-opts">
                {Object.values(VARIANTS[k].options).map((o, i) => <li key={o}>{o}{i === 0 && <span className="q-status p-built"> published</span>}</li>)}
              </ol>
            </li>
          ))}
        </ul>
        <p className="muted small">Decided 2026-11-14 and removed: consolidated rows for the approval steps, tickable considerations (saved, in the share link, the project file and the calendar file), Nunito Sans headings, and the Check page: the project open above with a bar that takes over once it scrolls away, the form beside the map and district, and the status as one word that links to the findings.</p>
      </details>

      <h2 className="h2" id="new-town">Taking on a new town: sources, views and how each is kept true</h2>
      <p className="muted">
        From the Providence trial (Nov 13, 2026), which read one part of a second town to level 4. The questions it raised are in <code>docs/providence-trial-review.html</code>.
        Run the checks with <code>scripts/towns/</code> against the local source folder, <code>.sources/</code>, filed by town and kind. This list lives in <code>lib/data/sourceNotes.ts</code>.
      </p>
      <ol className="dev-rules">
        <li><b>Nothing is stored without the document it came from.</b> A quote is copied, with its source on the same line, and a script matches it. A summary with no matching text says so.</li>
        <li><b>A source that cannot be fetched by script is a maintenance debt, written down.</b> The fetch script lists them. Each one needs a named person and a date.</li>
        <li><b>Change is found by comparing, and reported as an issue.</b> Schedules against the state meeting list, parcel ids against the layer, links against the page that points to them. Never an automatic edit.</li>
        <li><b>A view claims only what its data backs.</b> Level, trial mark and read date travel with the town to every page, and a build check should hold them to the data.</li>
        <li><b>Where a town's own documents disagree, show both.</b> It happened in three of five projects.</li>
        <li><b>A town leaves trial when its planning office has confirmed the sheet</b>, with a name and a date. Not before.</li>
      </ol>
      <h3 className="h3">Sources</h3>
      <div className="tablewrap">
        <table className="dev-table">
          <thead><tr><th>Source</th><th>Fetched by script?</th><th>Feeds</th><th>How it goes wrong</th><th>How it is checked</th></tr></thead>
          <tbody>
            {SOURCE_NOTES.map((n) => (
              <tr key={n.source}>
                <th scope="row">{n.source}<br /><span className="muted small">{n.where}</span></th>
                <td>{n.fetch}</td><td>{n.feeds}</td><td>{n.breaks}</td>
                <td><span className={`q-status ${CHECK[n.check].cls}`}>{CHECK[n.check].label}</span> {n.verify}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="h3">Views</h3>
      <div className="tablewrap">
        <table className="dev-table">
          <thead><tr><th>View</th><th>Reads from</th><th>Wrong when</th><th>What stands guard</th></tr></thead>
          <tbody>
            {VIEW_NOTES.map((n) => (
              <tr key={n.view}>
                <th scope="row">{n.view}</th>
                <td><code>{n.from}</code></td><td>{n.wrongWhen}</td>
                <td><span className={`q-status ${CHECK[n.check].cls}`}>{CHECK[n.check].label}</span> {n.guard}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
