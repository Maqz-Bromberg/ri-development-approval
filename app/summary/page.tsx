import type { Metadata } from "next";
import { SummaryView } from "@/components/SummaryView";

export const metadata: Metadata = { title: "Project summary" };

export default function SummaryPage() {
  return (
    <section className="sec" aria-labelledby="sum-h">
      <div className="sec-head no-print">
        <p className="eyebrow">Keep it</p>
        <h1 id="sum-h" className="h2">Project summary</h1>
        <p>One page to print, save as a PDF or send. It includes your notes and the considerations you've dealt with.</p>
      </div>
      <SummaryView />
    </section>
  );
}
