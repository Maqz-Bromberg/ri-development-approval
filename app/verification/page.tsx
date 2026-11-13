import type { Metadata } from "next";
import { VerificationFlow } from "@/components/VerificationFlow";

export const metadata: Metadata = { title: "How records are checked" };

export default function VerificationPage() {
  return (
    <section className="sec" aria-labelledby="ver-h">
      <div className="sec-head">
        <div>
          <p className="eyebrow">What you can trust, and why</p>
          <h1 id="ver-h" className="h2">How a record gets onto a timeline</h1>
        </div>
        <p>
          Each marker on a project timeline passes through the stages below. Two stages are automatic checks, and three need a person or an
          AI assistant reading. The risk is highest where a reader interprets a document, and the checks cannot fully cover that.
        </p>
      </div>
      <VerificationFlow />
      <div className="callout-note">
        <b>Draft notes for new regions.</b> This is a first sketch, to be revised once the design is settled.
        <ul>
          <li>Each town publishes through a different platform, so stage 2 needs one fetcher per platform. Cumberland and Exeter share one.</li>
          <li>A new town starts at level 1 (zoning and state-law steps). Local steps and precedent need stages 1 to 6 for that town, then a read-through by its planning staff.</li>
          <li>Calendars and cancellations are a separate check: the schedule page links each date to its source, and a weekly check against the state's Open Meetings notices is the planned way to catch changes.</li>
          <li>Still to define: a per-stage risk score that can be summed, and a standing sample audit of old records.</li>
        </ul>
      </div>
    </section>
  );
}
