"use client";

import { useEffect } from "react";
import { AddressLookup } from "../AddressLookup";
import { AltBanner, RoutePicker } from "../Compare";
import { AlternativeRoutes } from "../AlternativeRoutes";
import { AtlasPanel } from "../AtlasPanel";
import { CoverageNote } from "../Coverage";
import { DemoList } from "../Demo";
import { IntakeForm } from "../IntakeForm";
import { useProject } from "../ProjectProvider";
import { useTrial } from "../Trial";
import { focusField } from "../Verdict";
import { ZonePicker } from "../ZonePicker";
import { Band, Continue } from "./Band";

/**
 * The Site stage: where it is (town, address or a click on the map), the zoning district, the project and the land. The route the facts
 * pick and the nearby alternatives follow, and the alternatives can instead sit in the check (trial). The Zoning & law stage reads its answer from here.
 */
export function SiteStage() {
  const { origin, hydrated } = useProject();
  const trial = useTrial();

  // Facts on the other stages link here as /site#f-units and so on.
  useEffect(() => {
    if (!hydrated) return;
    const m = window.location.hash.match(/^#(f-[a-z-]+)$/);
    if (m) setTimeout(() => focusField(m[1]), 250);
  }, [hydrated]);

  const toMap = () => document.querySelector(".site-where-map")?.scrollIntoView({ block: "center", behavior: "smooth" });

  return (
    <div className="stage site-page">
      <Band id="site" title={origin === "example" ? "Start with the site" : "The site and the project"} lead="Where it is, what you plan to build, the zoning district, and what the land has. Each fact has an (i) for what it means and what it changes." />
      <AltBanner />

      <section className="site-step panel" id="sg-where" aria-labelledby="h-where">
        <p className="col-label" id="h-where"><span aria-hidden="true">1</span> Where</p>
        <AddressLookup layout="site" />
      </section>

      <section className="site-step panel" id="sg-facts" aria-labelledby="h-facts">
        <p className="col-label" id="h-facts"><span aria-hidden="true">2</span> The project and the land</p>
        <IntakeForm />
      </section>

      {/* The district comes after the project: what each district allows depends on the units and the kind of project. */}
      <section className="site-step panel" id="sg-zone" aria-labelledby="h-zone">
        <p className="col-label" id="h-zone"><span aria-hidden="true">3</span> District</p>
        <div className="site-zone">
          <ZonePicker onMap={toMap} />
          <AtlasPanel />
        </div>
      </section>

      {/* The inputs end here. What follows reads them back: the route, the alternatives, saving. */}
      <div className="review-rule" role="separator" aria-label="The inputs end here. What follows is for review.">
        <span>That is everything the check needs. Below is for review.</span>
      </div>
      <CoverageNote compact />

      <section className="site-step review" id="routes" aria-labelledby="h-routes">
        <h2 className="site-sub" id="h-routes">Your route, and the alternatives</h2>
        <p className="sub">
          Under state law every housing project goes through one of five reviews. The route decides which boards hold the decisions, how many
          public hearings there are, what you file, and how long the town may take. Your facts pick one.{" "}
          {trial.routes === "cards"
            ? "Each card says who the route is for and what it involves."
            : trial.routes === "focus"
              ? "The routes run lightest to heaviest. Click one to open it; its neighbours then show the main ways they differ from it."
              : "The table puts the route you are on first, and shows what each other route would change for this project: steps added or dropped, hearings, the clock, who decides."}{" "}
          Choosing another by hand shows its steps and check, for when staff say the town will treat the project differently.
        </p>
        <RoutePicker />
        {trial.alts !== "check" && (
          <div id="compare" className="alts-inline">
            <h3 className="site-sub2">Nearby alternatives</h3>
            <p className="sub">A unit either side of a threshold can add or remove a whole review stage. Each row is one alternative beside your entry. Trying one keeps your entry, with a button back to it.</p>
            <AlternativeRoutes />
          </div>
        )}
      </section>

      <section className="sec" aria-label="Stand-ins on this stage"><DemoList /></section>
      <Continue id="site" />
    </div>
  );
}
