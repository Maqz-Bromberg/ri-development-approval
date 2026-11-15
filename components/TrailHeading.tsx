"use client";

import Link from "next/link";
import { TREES } from "@/lib/data/trees";
import { useProject } from "./ProjectProvider";
import { projectLabel, routeText } from "@/lib/engine";

export function TrailHeading() {
  const { inputs, tree, origin } = useProject();
  return (
    <div className="sec-head">
      <div>
        <p className="eyebrow">The road to approval{origin === "example" ? ", for the example project" : ""}</p>
        <h2 id="trail-h">
          {inputs.kind === "commercial" ? projectLabel(inputs) : `${inputs.units} units`} in {inputs.zone === "other" ? inputs.town : `${inputs.zone}, ${inputs.town}`}: {routeText(tree).name.toLowerCase()}
        </h2>
      </div>
      <p>
        Select any stop to see who decides it and what you file. The builder stands at the first step with open items.{" "}
        <Link href="/site">{origin === "example" ? "Enter your own site" : "Change the project"}</Link>
      </p>
    </div>
  );
}
