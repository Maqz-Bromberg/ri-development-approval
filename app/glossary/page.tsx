import type { Metadata } from "next";
import { GLOSSARY } from "@/lib/data/glossary";
import { SOURCES } from "@/lib/data/sources";

export const metadata: Metadata = { title: "Glossary" };

export default function GlossaryPage() {
  const terms = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
  return (
    <section className="sec" aria-labelledby="gl-h">
      <div className="sec-head">
        <p className="eyebrow">Plain language</p>
        <h1 id="gl-h" className="h2">Glossary</h1>
        <p>The terms the approval route leans on. Across the site they carry a dotted underline: hover, focus or tap one for its definition. These are summaries, and the statute or ordinance cited on each step governs.</p>
      </div>
      <dl className="glossary">
        {terms.map((g) => (
          <div key={g.id} id={g.id}>
            <dt>{g.term}</dt>
            <dd>
              {g.def}
              {g.src && SOURCES[g.src] && <> <a href={SOURCES[g.src].url} target="_blank" rel="noopener noreferrer" className="src-inline">{SOURCES[g.src].label.split(" (")[0]} ↗</a></>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
