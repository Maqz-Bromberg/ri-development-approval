import type { Metadata } from "next";
import { GLOSSARY } from "@/lib/data/glossary";
import { OBJECTIONS } from "@/lib/data/objections";
import { SOURCES } from "@/lib/data/sources";
import { TOWNS } from "@/lib/data/towns";
import { TREES } from "@/lib/data/trees";
import { sourceKind } from "@/lib/sourceKind";

export const metadata: Metadata = { title: "Sources and citations" };

/** The town a source belongs to: the one it names, or "State and federal". */
function townOf(id: string): string {
  const s = SOURCES[id];
  if (s.town && s.town !== "State") return s.town;
  const hit = TOWNS.find((t) => s.label.includes(t.name));
  return hit ? hit.name : "State and federal";
}

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
  const groups = new Map<string, string[]>();
  Object.keys(SOURCES).forEach((id) => { const t = townOf(id); groups.set(t, [...(groups.get(t) ?? []), id]); });
  const order = Array.from(groups.keys()).sort((a, b) => (a === "State and federal" ? -1 : b === "State and federal" ? 1 : a.localeCompare(b)));
  return (
    <section className="sec" aria-labelledby="src-h">
      <div className="sec-head">
        <p className="eyebrow">Documentation</p>
        <h1 id="src-h" className="h2">Sources and citations</h1>
        <p>
          Every document this site quotes, {Object.keys(SOURCES).length} in all, by town and kind, with its link and what cites it. The list is generated from the data, so it is
          always the list in use. A requirement or finding shows its source, a pinpoint and, where one was read, the quotation. Where something has not been read, it is shown as a gap.
        </p>
      </div>
      {order.map((town) => (
        <section key={town} className="src-group" aria-labelledby={`src-${town.replace(/\W+/g, "-")}`}>
          <h2 id={`src-${town.replace(/\W+/g, "-")}`}>{town} <small>{groups.get(town)!.length}</small></h2>
          <ul className="src-list">
            {groups.get(town)!.sort((a, b) => sourceKind(a).localeCompare(sourceKind(b)) || a.localeCompare(b)).map((id) => (
              <li key={id} id={id}>
                <span className="chip">{sourceKind(id)}</span>
                <a href={SOURCES[id].url} target="_blank" rel="noopener noreferrer">{SOURCES[id].label} ↗</a>
                {cites[id] && <details><summary>Cited by {cites[id].length}</summary><ul>{cites[id].slice(0, 12).map((c) => <li key={c}>{c}</li>)}{cites[id].length > 12 && <li>and {cites[id].length - 12} more</li>}</ul></details>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  );
}
