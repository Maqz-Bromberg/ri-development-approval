import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Flowchart } from "@/components/Flowchart";
import { FLOWS, flowBySlug } from "@/lib/data/engine";
import { KIND_LABEL } from "@/lib/data/engine/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return FLOWS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const flow = flowBySlug((await params).slug);
  return { title: flow ? `${flow.title} (engine)` : "Engine", robots: { index: false } };
}

export default async function EnginePart({ params }: { params: Promise<{ slug: string }> }) {
  const flow = flowBySlug((await params).slug);
  if (!flow) notFound();
  const i = FLOWS.indexOf(flow);
  const prev = FLOWS[i - 1], next = FLOWS[i + 1];
  const files = [...new Set(flow.nodes.flatMap((nd) => nd.where ?? []).map((w) => w.split("#")[0]))].sort();
  const list = [...flow.nodes].sort((a, b) => a.y - b.y || a.x - b.x);
  return (
    <section className="sec" aria-labelledby="eng-h">
      <div className="sec-head">
        <div>
          <p className="eng-crumbs"><Link href="/engine">Engine</Link> · part {i + 1} of {FLOWS.length}</p>
          <h1 id="eng-h" className="h2">{flow.title}</h1>
        </div>
        <div className="eng-intro"><p>{flow.intro}</p></div>
        {flow.shows && (
          <p className="eng-shows"><span className="muted">Shown on:</span> {flow.shows.map((s) => <Link key={s.href} className="chip" href={s.href}>{s.label}</Link>)}</p>
        )}
      </div>
      <Flowchart flow={flow} />
      <div className="eng-cols">
        <div>
          <h2>Where it lives</h2>
          <ul>{files.map((f) => <li key={f}><code>{f}</code></li>)}</ul>
        </div>
        <div>
          <h2>Other parts</h2>
          <ul>{FLOWS.filter((f) => f !== flow && flow.nodes.some((nd) => nd.to?.href === `/engine/${f.slug}`)).map((f) => <li key={f.slug}><Link href={`/engine/${f.slug}`}>{f.title}</Link> <span className="muted">· {f.blurb}</span></li>)}</ul>
        </div>
      </div>
      <details className="eng-list">
        <summary>Every box as a list</summary>
        <ol>
          {list.map((nd) => (
            <li key={nd.id}>
              <b>{nd.label}</b> <span className="muted">({KIND_LABEL[nd.kind].name.toLowerCase()}{nd.town ? ", the town first" : ""})</span>
              <br />{nd.info}
              {nd.note && <><br /><span className="muted">{nd.note}</span></>}
              {nd.where && <><br />{nd.where.map((w, k) => <span key={w}>{k > 0 && " · "}<code>{w}</code></span>)}</>}
            </li>
          ))}
        </ol>
      </details>
      <nav className="eng-nav" aria-label="Parts of the engine">
        {prev ? <Link href={`/engine/${prev.slug}`}>← {prev.title}</Link> : <Link href="/engine">← The whole engine</Link>}
        {next ? <Link href={`/engine/${next.slug}`}>{next.title} →</Link> : <Link href="/engine">The whole engine →</Link>}
      </nav>
    </section>
  );
}
