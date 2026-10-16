import { SOURCES } from "@/lib/data/sources";

/** A requirement's source: the verbatim quote (if read) and a pinpoint link to the document. */
export function Cite({ src, pin, q }: { src?: string; pin?: string; q?: string }) {
  if (!src || !SOURCES[src]) return null;
  const s = SOURCES[src];
  return (
    <span className="cite">
      {q && <q>{q}</q>}{" "}
      <a href={s.url} target="_blank" rel="noopener noreferrer" title={s.label}>
        {pin || s.label} ↗
      </a>
    </span>
  );
}
