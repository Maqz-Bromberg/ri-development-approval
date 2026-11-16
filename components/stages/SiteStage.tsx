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
import { SavedSites } from "../SavedSites";
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
      <Band id="site" title={origin === "example" ? "Start with the site" : "The site and the project"} lead="Where it is, the zoning district, what you plan to build, and what the land has. Each fact has an (i) for what it means and what it changes." />
      <AltBanner />
      <CoverageNote compact />

      <section className="site-step panel" id="sg-where" aria-labelledby="h-where">
        <p className="col-label" id="h-where"><span aria-hidden="true">1</span> Where</p>
        <AddressLookup layout="site" />
      </section>

      <section className="site-step panel" id="sg-zone" aria-labelledby="h-zone">
        <p className="col-label" id="h-zone"><span aria-hidden="true">2</span> District</p>
        <div className="site-zone">
          <ZonePicker onMap={toMap} />
          <AtlasPanel />
        </div>
      </section>

      <section className="site-step panel" id="sg-facts" aria-labelledby="h-facts">
        <p className="col-label" id="h-facts"><span aria-hidden="true">3</span> The project and the land</p>
        <IntakeForm />
      </section>

      <section className="site-step panel" id="sg-saved" aria-labelledby="h-saved">
        <p className="col-label" id="h-saved"><span aria-hidden="true">4</span> Your sites</p>
        <SavedSites />
      </section>

      {trial.alts !== "check" && (
        <section className="site-step panel" id="compare" aria-labelledby="h-compare">
          <p className="col-label" id="h-compare"><span aria-hidden="true">5</span> Nearby alternatives, as routes</p>
          <p className="sub">A unit either side of a threshold can add or remove a whole review stage. Each row is one alternative beside your entry. Trying one keeps your entry, with a button back to it.</p>
          <AlternativeRoutes />
        </section>
      )}

      <section className="site-step panel" aria-labelledby="h-routes">
        <h3 className="site-sub" id="routes">The five routes</h3>
        <p className="sub" id="h-routes">
          Under state law every housing project goes through one of five reviews. The route decides which boards hold the decisions, how many
          public hearings there are, what you file, and how long the town may take. Your facts pick one, outlined in green. Choosing another by hand
          shows its steps and check, for when staff say the town will treat the project differently, or to see what a change would mean.
        </p>
        <RoutePicker />
      </section>

      <section className="sec" aria-label="Stand-ins on this stage"><DemoList /></section>
      <Continue id="site" />
    </div>
  );
}
