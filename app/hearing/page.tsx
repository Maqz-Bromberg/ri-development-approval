import type { Metadata } from "next";
import { HearingHeading, ObjectionGuide } from "@/components/ObjectionGuide";

export const metadata: Metadata = { title: "Hearing prep" };

export default function HearingPage() {
  return (
    <>
      <section className="sec no-print" aria-labelledby="obj-h">
        <div className="sec-head">
          <p className="eyebrow">Preparing for the public hearing</p>
          <HearingHeading />
          <p>
            The questions neighbours and board members ask, each matched to times it was raised in the town's own records, with what
            the applicant did and how the board voted. The best answers are specific fixes shown on a plan sheet.
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
