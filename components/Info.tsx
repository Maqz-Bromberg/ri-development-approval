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
      <span aria-hidden="true">i</span>
    </HoverCard>
  );
}
