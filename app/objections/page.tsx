import type { Metadata } from "next";
import { ObjectionGuide } from "@/components/ObjectionGuide";

export const metadata: Metadata = { title: "Common questions" };

export default function ObjectionsPage() {
  return (
    <>
      <section className="sec" aria-labelledby="obj-h">
        <div className="sec-head">
          <div>
            <p className="eyebrow">Preparing for the public hearing</p>
            <h1 id="obj-h" className="h2">Common questions at the hearing, and how to answer them</h1>
          </div>
          <p>
            Each question is matched to times it was actually raised in the town's own records, with what the applicant did and how
            the board voted. The best answers are specific fixes shown on a plan sheet.
          </p>
        </div>
        <ol className="howto">
          <li><b>Acknowledge it.</b> Repeat the concern in the neighbour's words, so they know they were heard.</li>
          <li><b>Answer with a fix.</b> Offer a planting, a fence, a fixture or a schedule, not an argument.</li>
          <li><b>Point to the sheet.</b> Name the plan sheet or report that shows it.</li>
          <li><b>Offer a condition.</b> Tell the board you'll accept the fix as a condition of approval.</li>
        </ol>
      </section>
      <ObjectionGuide />
    </>
  );
}
