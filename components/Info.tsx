"use client";

import Link from "next/link";
import { FIELD_HELP } from "@/lib/data/fieldHelp";
import { FACT_SOURCES } from "@/lib/data/factSources";
import { GLOSSARY_BY_ID } from "@/lib/data/glossary";
import { HoverCard } from "./Popover";

/** An (i) beside a field's label: what the fact is, what it changes, and where to find it. Hover, focus or tap. */
export function Info({ id }: { id: string }) {
  const h = FIELD_HELP[id];
  if (!h) return null;
  const g = h.term ? GLOSSARY_BY_ID[h.term] : undefined;
  const doc = FACT_SOURCES.find((f) => f.id === id);
  return (
    <HoverCard
      className="info-btn"
      label={`About ${h.title.toLowerCase()}`}
      width={340}
      card={
        <>
          <b className="pop-title">{h.title}</b>
          <p>{h.what}</p>
          {g && <p className="info-gloss"><Link href={`/glossary#${g.id}`}>Glossary: {g.term}</Link></p>}
          <p><b>What it changes:</b> {h.why}</p>
          {(h.find || doc) && (
            <p className="muted">
              <b>Where to find it:</b> {h.find}
              {doc && <>{" "}<Link href={`/docs/site-facts#${id}`}>{doc.how === "yours" ? "What the site does and doesn't look up" : "How this site looks it up"} →</Link></>}
            </p>
          )}
        </>
      }
    >
      <InfoGlyph />
    </HoverCard>
  );
}

/**
 * The "i" of an (i), drawn rather than typeset, so it sits in the middle of its circle whatever the font: a cursive i, its dot
 * set clear of the stroke, which leads in from the left and tails off to the right.
 */
export function InfoGlyph() {
  return (
    <svg className="info-glyph" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      <circle cx="6.75" cy="1.85" r="1.1" fill="currentColor" />
      <path d="M4.1 5.9C4.9 5.1 6.3 4.7 6.2 5.6L5.35 8.85C5.1 9.85 5.9 10.25 7.5 8.9" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
