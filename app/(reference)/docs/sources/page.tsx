import type { Metadata } from "next";
import { GLOSSARY } from "@/lib/data/glossary";
import { OBJECTIONS } from "@/lib/data/objections";
import { SOURCES } from "@/lib/data/sources";
import { TREES } from "@/lib/data/trees";
import { SourceIndex, type SourceRow } from "@/components/SourceIndex";
import { sourcePlace, sourceType } from "@/lib/sourceKind";

export const metadata: Metadata = { title: "Sources and citations" };

/** What cites each source, as far as the data says so. A finding cites its source where it is worked out, so the engine pages cover those. */
function citedBy(): Record<string, string[]> {
  const out: Record<string, Set<string>> = {};
  const add = (id: string | undefined, what: string) => { if (id && SOURCES[id]) (out[id] ??= new Set()).add(what); };
  Object.values(TREES).forEach((t) => t.steps.forEach((s) => s.docs.forEach((d) => add(d.src, `${t.name}, ${s.title}: ${d.title}`))));
  GLOSSARY.forEach((g) => add(g.src, `Glossary: ${g.term}`));
  OBJECTIONS.forEach((o) => o.heard.forEach((h) => h.src.forEach((id) => add(id, `Hearing question: "${o.said.slice(0, 60)}${o.said.length > 60 ? "…" : ""}"`))));
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, Array.from(v)]));
}

export default function SourcesPage() {
  const cites = citedBy();
  const rows: SourceRow[] = Object.entries(SOURCES).map(([id, x]) => ({ id, label: x.label, url: x.url, type: sourceType(id), place: sourcePlace(id), cites: cites[id] ?? [] }));
  return (
    <section className="sec" aria-labelledby="src-h">
      <div className="sec-head">
        <p className="eyebrow">Documentation</p>
        <h1 id="src-h" className="h2">Sources and citations</h1>
        <p>
          Every document this site quotes, {rows.length} in all, by type, with whose it is, its link and what cites it. The list is generated from the data, so it is
          always the list in use. A requirement or finding shows its source, a pinpoint and, where one was read, the quotation. Where something has not been read, it is shown as a gap.
        </p>
      </div>
      <SourceIndex rows={rows} />
    </section>
  );
}
