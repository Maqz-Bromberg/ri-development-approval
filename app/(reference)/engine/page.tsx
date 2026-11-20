import type { Metadata } from "next";
import Link from "next/link";
import { Flowchart } from "@/components/Flowchart";
import { FLOWS, OVERVIEW } from "@/lib/data/flowcharts";

export const metadata: Metadata = { title: "How the engine works" };

export default function EnginePage() {
  return (
    <section className="sec" aria-labelledby="eng-h">
      <div className="sec-head">
        <div>
          <p className="eyebrow">Engine · for the people building this</p>
          <h1 id="eng-h" className="h2">{OVERVIEW.title}</h1>
        </div>
        <div className="eng-intro"><p>{OVERVIEW.intro}</p><p className="muted small">This section is not in the navigation. It is written in <code>lib/data/flowcharts/</code>, one file for each flowchart, and <code>scripts/check_engine_flows.py</code> checks that every piece of code a box names is still there.</p></div>
      </div>
      <Flowchart flow={OVERVIEW} />
      <h2 className="h3">The parts, in the order of work</h2>
      <ul className="eng-parts">
        {FLOWS.map((f) => (
          <li key={f.slug}>
            <Link href={`/engine/${f.slug}`}>{f.title}</Link>
            <p>{f.blurb}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
