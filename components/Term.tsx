"use client";

import Link from "next/link";
import { GLOSSARY_BY_ID, glossParts } from "@/lib/data/glossary";
import { SOURCES } from "@/lib/data/sources";
import { HoverCard } from "./Popover";

/** A glossary term: dotted underline, definition on hover or focus, pinned on click or tap. */
export function Term({ id, children }: { id: string; children?: React.ReactNode }) {
  const g = GLOSSARY_BY_ID[id];
  if (!g) return <>{children}</>;
  const src = g.src ? SOURCES[g.src] : undefined;
  return (
    <HoverCard
      className="term"
      card={
        <>
          <b className="pop-title">{g.term}</b>
          <p>{g.def}</p>
          <p className="pop-foot">
            {src && <a href={src.url} target="_blank" rel="noopener noreferrer">{src.label.split(" (")[0]} ↗</a>}
            <Link href={`/glossary#${g.id}`}>All terms</Link>
          </p>
        </>
      }
    >
      {children ?? g.term}
    </HoverCard>
  );
}

/** Running text with its glossary terms marked, each at its first use in that text. */
export function Gloss({ text }: { text: string }) {
  return (
    <>
      {glossParts(text).map((p, i) => (typeof p === "string" ? p : <Term key={i} id={p.id}>{p.text}</Term>))}
    </>
  );
}
