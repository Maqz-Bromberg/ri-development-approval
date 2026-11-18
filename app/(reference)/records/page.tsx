import type { Metadata } from "next";
import { PrecedentTable } from "@/components/PrecedentTable";
import { RecordsIndex } from "@/components/RecordsIndex";

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
            Each town publishes its agendas and minutes differently. Pick a town for its card: where its boards publish, sample agendas, minutes,
            recordings and press. Cumberland is the pilot. Read past items like yours before you file.
          </p>
        </div>
        <RecordsIndex />
      </section>

      <section className="sec" aria-labelledby="prec-h">
        <div className="sec-head">
          <div><p className="eyebrow">From the Cumberland agendas</p><h2 id="prec-h">Recent multifamily items</h2></div>
          <p>Ranked by similarity to the project you entered. Agendas show the stage reached. Outcomes are given only where a source states them.</p>
        </div>
        <PrecedentTable town="Cumberland" />
      </section>

      <section className="sec" aria-labelledby="prec-pvd-h">
        <div className="sec-head">
          <div><p className="eyebrow">From City Plan Commission records · trial</p><h2 id="prec-pvd-h">Providence: Fox Point and Wayland</h2></div>
          <p>Five projects from 2023 to 2026, read as a trial of extending the site to a second town. Four events rest on scanned minutes and are marked as read by eye.</p>
        </div>
        <PrecedentTable town="Providence" />
      </section>
    </>
  );
}
