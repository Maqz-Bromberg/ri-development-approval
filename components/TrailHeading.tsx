"use client";

import Link from "next/link";
import { TREES } from "@/lib/data/trees";
import { useProject } from "./ProjectProvider";

export function TrailHeading() {
  const { inputs, tree } = useProject();
  return (
    <div className="sec-head">
      <div>
        <p className="eyebrow">The road to approval</p>
        <h2 id="trail-h">
          {inputs.units} units in {inputs.zone === "other" ? inputs.town : `${inputs.zone}, ${inputs.town}`}: {TREES[tree].name.toLowerCase()}
        </h2>
      </div>
      <p>
        Select any stop to see who decides it and what you file. The builder stands at the first step with open items.{" "}
        <Link href="/project">Change the project</Link>
      </p>
    </div>
  );
}
