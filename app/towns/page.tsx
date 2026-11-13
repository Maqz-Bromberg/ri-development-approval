import type { Metadata } from "next";
import { TownIndex } from "@/components/TownIndex";

export const metadata: Metadata = { title: "Towns" };

export default function TownsPage() {
  return (
    <section className="sec" aria-labelledby="towns-h">
      <div className="sec-head">
        <div>
          <p className="eyebrow">All of Rhode Island</p>
          <h1 id="towns-h" className="h2">What has been read for each town</h1>
        </div>
        <p>
          State law fixes the stages, clocks and appeals for every town, and the Zoning Atlas covers zoning statewide. What differs is
          each town's own regulations, offices and meetings. This page says, town by town, how much of that has been read.
        </p>
      </div>
      <TownIndex />
    </section>
  );
}
