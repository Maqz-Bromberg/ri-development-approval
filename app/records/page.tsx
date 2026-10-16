import type { Metadata } from "next";
import { PrecedentTable } from "@/components/PrecedentTable";
import { LOCALITIES } from "@/lib/data/records";

export const metadata: Metadata = { title: "Meeting records" };

export default function RecordsPage() {
  return (
    <>
      <section className="sec" aria-labelledby="rec-h">
        <div className="sec-head">
          <div>
            <p className="eyebrow">Town Council and Planning Board records</p>
            <h1 id="rec-h" className="h2">Where to find the reports</h1>
          </div>
          <p>
            Each town publishes its agendas and minutes differently. These are sample entry points. Cumberland is the pilot, and the
            other towns show the common platforms. Read past items like yours before you file.
          </p>
        </div>
        <div className="localities">
          {LOCALITIES.map((l) => (
            <article key={l.id} className={`locality${l.pilot ? " pilot" : ""}`} id={l.id}>
              <div className="loc-head">
                <h2>{l.name}</h2>
                {l.pilot && <span className="pill live">Pilot</span>}
              </div>
              <p>{l.intro}</p>
              <ul className="rec-links">
                {l.links.map((k) => (
                  <li key={k.url}>
                    <a href={k.url} target="_blank" rel="noopener noreferrer">{k.label} ↗</a>
                    <span>{k.note}</span>
                  </li>
                ))}
              </ul>
              {l.media && l.media.length > 0 && (
                <div className="media-inline">
                  <h3>Hearing recordings, minutes and press</h3>
                  <ul className="media-list">
                    {l.media.map((m) => (
                      <li key={m.url}>
                        <span className={`media-kind m-${m.kind}`}>{m.kind}</span>
                        <span><a href={m.url} target="_blank" rel="noopener noreferrer">{m.label} ↗</a> <span className="muted small">{m.note}</span></span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {l.tips && (
                <div className="tips">
                  <h3>Reading tips</h3>
                  <ul>{l.tips.map((t) => <li key={t}>{t}</li>)}</ul>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="sec" aria-labelledby="prec-h">
        <div className="sec-head">
          <div><p className="eyebrow">From the Cumberland agendas</p><h2 id="prec-h">Recent multifamily items</h2></div>
          <p>Ranked by similarity to the project you entered. Agendas show the stage reached. Outcomes are given only where a source states them.</p>
        </div>
        <PrecedentTable />
      </section>
    </>
  );
}
