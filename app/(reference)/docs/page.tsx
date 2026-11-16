import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Documentation" };

/*
 * The site's open documentation: how it finds and checks what it shows. A page is added here as each part is
 * written up; the list is meant to grow.
 */
const PAGES = [
  { href: "/docs/site-facts", title: "How site facts are found", what: "Which public map layer answers each fact on Site selection, how it is asked, what it misses, and how to check it yourself." },
  { href: "/verification", title: "How records are checked", what: "How a dated event from minutes, a recording or a court decision gets onto a project timeline, and the checks at each stage." },
  { href: "/glossary", title: "Glossary", what: "Plain definitions of the terms the approval steps use, each with the law that sets it." },
  { href: "/towns", title: "Towns and coverage", what: "How much of each of the 39 municipalities has been read, by level, with dates." },
];

export default function DocsPage() {
  return (
    <section className="sec" aria-labelledby="docs-h">
      <div className="sec-head">
        <p className="eyebrow">Documentation</p>
        <h1 id="docs-h" className="h2">How this site knows what it shows</h1>
        <p>Open notes on where each fact, rule and record comes from. More pages are added as each part is written up.</p>
      </div>
      <ul className="docs-list">
        {PAGES.map((p) => (
          <li key={p.href}><Link href={p.href}><b>{p.title}</b></Link><p>{p.what}</p></li>
        ))}
      </ul>
    </section>
  );
}
