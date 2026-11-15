import type { Metadata } from "next";
import Link from "next/link";
import { FACT_SOURCES, HOW_LABEL, type FactHow } from "@/lib/data/factSources";

export const metadata: Metadata = { title: "How site facts are found" };

/** The lookup as a picture: an address becomes a point, six public layers answer it, and you check what they say. */
function Diagram() {
  const layers: [string, string][] = [
    ["Zoning Atlas districts", "town, district"],
    ["Zoning Atlas water and sewer", "public water, public sewer"],
    ["RIDEM tax parcels", "parcel, lot area"],
    ["RIDOT road centrelines", "state road"],
    ["Wetlands inventory", "wetlands nearby"],
    ["RIPTA bus stops", "stops within 1/8 mile"],
  ];
  const y = (i: number) => 14 + i * 50;
  return (
    <div className="sf-diagram">
      <svg viewBox="0 0 980 316" role="img" aria-labelledby="sf-d-t sf-d-d">
        <title id="sf-d-t">How Site selection looks up a site</title>
        <desc id="sf-d-d">An address, or a click on the map, becomes a point. Six public layers are asked about the point or the parcel around it. Their answers fill in the facts on Site selection, and you check or change each one before reading the check.</desc>
        <defs>
          <marker id="sf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 10 5 0 10z" className="sf-arrowhead" />
          </marker>
        </defs>
        <g className="sf-node">
          <rect x="6" y="128" width="150" height="60" rx="10" />
          <text x="81" y="154" textAnchor="middle" className="sf-t">Address</text>
          <text x="81" y="173" textAnchor="middle" className="sf-s">or a click on the map</text>
        </g>
        <path d="M156 158 H206" className="sf-line" markerEnd="url(#sf-arrow)" />
        <g className="sf-node is-point">
          <rect x="210" y="128" width="140" height="60" rx="30" />
          <text x="280" y="154" textAnchor="middle" className="sf-t">A point</text>
          <text x="280" y="173" textAnchor="middle" className="sf-s">OpenStreetMap search</text>
        </g>
        {layers.map(([name, fact], i) => (
          <g key={name}>
            <path d={`M350 158 C 380 158, 380 ${y(i) + 21}, 410 ${y(i) + 21}`} className="sf-line" markerEnd="url(#sf-arrow)" />
            <g className="sf-node is-layer">
              <rect x="414" y={y(i)} width="250" height="42" rx="8" />
              <text x="428" y={y(i) + 18} className="sf-t">{name}</text>
              <text x="428" y={y(i) + 34} className="sf-s">{fact}</text>
            </g>
            <path d={`M664 ${y(i) + 21} C 694 ${y(i) + 21}, 694 158, 720 158`} className="sf-line" markerEnd="url(#sf-arrow)" />
          </g>
        ))}
        <g className="sf-node">
          <rect x="724" y="128" width="116" height="60" rx="10" />
          <text x="782" y="154" textAnchor="middle" className="sf-t">Filled in</text>
          <text x="782" y="173" textAnchor="middle" className="sf-s">on Site selection</text>
        </g>
        <path d="M840 158 H866" className="sf-line" markerEnd="url(#sf-arrow)" />
        <g className="sf-node is-you">
          <rect x="870" y="128" width="104" height="60" rx="10" />
          <text x="922" y="154" textAnchor="middle" className="sf-t">You check</text>
          <text x="922" y="173" textAnchor="middle" className="sf-s">✓ matches · ! differs</text>
        </g>
      </svg>
    </div>
  );
}

const ORDER: FactHow[] = ["applied", "suggested", "yours"];

export default function SiteFactsPage() {
  return (
    <section className="sec" aria-labelledby="sf-h">
      <div className="sec-head">
        <p className="eyebrow"><Link href="/docs">Documentation</Link></p>
        <h1 id="sf-h" className="h2">How site facts are found</h1>
        <p>
          Site selection fills in what public map layers know about a site, and leaves the rest to you. Everything filled in stays yours to change,
          and each fact says whether what you have matches the layer. Nothing is stored: each layer is asked from your browser, at the time.
        </p>
      </div>
      <Diagram />
      {ORDER.map((how) => {
        const list = FACT_SOURCES.filter((f) => f.how === how);
        if (!list.length) return null;
        return (
          <div key={how} className="sf-group">
            <h2 className="sf-group-h">{HOW_LABEL[how]}</h2>
            {how === "yours" ? (
              <ul className="sf-yours">
                {list.map((f) => <li key={f.id} id={f.id}><b>{f.title}.</b> {f.query} {f.check && <span className="muted">{f.check}</span>}</li>)}
              </ul>
            ) : (
              <div className="sf-cards">
                {list.map((f) => (
                  <article key={f.id} id={f.id} className="sf-card">
                    <h3>{f.title}</h3>
                    {f.layer && <p className="sf-layer"><a href={f.layer.url} target="_blank" rel="noopener noreferrer">{f.layer.label} ↗</a></p>}
                    <dl>
                      <div><dt>How it is asked</dt><dd>{f.query}</dd></div>
                      <div><dt>What it can miss</dt><dd>{f.misses}</dd></div>
                      <div><dt>How to check it</dt><dd>{f.check}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <p className="small muted">The layers and distances here are those in the site&apos;s lookup code. When a layer is added, it is added to this page.</p>
    </section>
  );
}
