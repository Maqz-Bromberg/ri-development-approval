import { CONTACTS, AUTHORITY_KIND_LABEL } from "@/lib/data/contacts";
import { SOURCES } from "@/lib/data/sources";

export function ContactCard({ id, role }: { id: string; role?: string }) {
  const c = CONTACTS[id];
  if (!c) return null;
  return (
    <div className={`contact k-${c.kind}`}>
      <span className="kind">{AUTHORITY_KIND_LABEL[c.kind]}</span>
      <b>{c.name}</b>
      <span className="role">{role ? `On this step: ${role}` : c.note}</span>
      <dl>
        {c.lines.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {c.verify && <span className="verify">Verify: {c.verify}</span>}
      {(c.src.length > 0 || c.links?.length) && (
        <span className="contact-src">
          {c.links?.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>)}
          {c.src.map((s) => (
            <a key={s} href={SOURCES[s].url} target="_blank" rel="noopener noreferrer">
              {SOURCES[s].label.split(" (")[0]} ↗
            </a>
          ))}
        </span>
      )}
    </div>
  );
}
