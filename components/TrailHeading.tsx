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
          {inputs.units} units in {inputs.zone === "other" ? "Cumberland" : `${inputs.zone}, Cumberland`}: {TREES[tree].name.toLowerCase()}
        </h2>
      </div>
      <p>
        The builder stands at the first step with unchecked items. Tick off the checklists and the flags go up along the way.{" "}
        <Link href="/project">Change the project</Link>
      </p>
    </div>
  );
}
