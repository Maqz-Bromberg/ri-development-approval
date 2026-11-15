"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AddressLookup } from "./AddressLookup";
import { AtlasPanel } from "./AtlasPanel";
import { AltBanner, Alternatives, RoutePicker } from "./Compare";
import { IntakeForm } from "./IntakeForm";
import { SavedSites } from "./SavedSites";
import { useProject } from "./ProjectProvider";
import { focusField } from "./Verdict";
import { ZonePicker } from "./ZonePicker";

/**
 * Site selection: the first thing an applicant does. Where (town, address or a click on the map), the zoning
 * district, the project and its site facts, then the route the facts pick and the nearby alternatives, which can be
 * compared without changing anything and tried with the entry kept. The Check page reads the answer from here.
 */
export function SiteWorkspace() {
  const { origin, hydrated } = useProject();

  // Facts on the Check and Steps pages link here as /site#f-units and so on.
  useEffect(() => {
    if (!hydrated) return;
    const m = window.location.hash.match(/^#(f-[a-z-]+)$/);
    if (m) setTimeout(() => focusField(m[1]), 250);
  }, [hydrated]);

  const toMap = () => document.querySelector(".site-where-map")?.scrollIntoView({ block: "center", behavior: "smooth" });

  return (
    <div className="site-page">
      <section className="sec check-intro" aria-labelledby="h-site">
        <div className="sec-head">
          <p className="eyebrow">Site selection</p>
          <h1 id="h-site" className="h2">{origin === "example" ? "Start with the site" : "The site and the project"}</h1>
          <p>
            Where it is, the zoning district, what you plan to build, and what the land has. Each fact has an (i) for what it means and what it changes.
            The route and the nearby alternatives follow, to compare before you read the check.
          </p>
        </div>
      </section>

      <AltBanner />
      <SavedSites />

      <section className="site-step panel" aria-labelledby="h-where">
        <p className="col-label" id="h-where"><span aria-hidden="true">1</span> Where</p>
        <AddressLookup layout="site" />
      </section>

      <section className="site-step panel" aria-labelledby="h-zone">
        <p className="col-label" id="h-zone"><span aria-hidden="true">2</span> Zoning district</p>
        <div className="site-zone">
          <ZonePicker onMap={toMap} />
          <AtlasPanel />
        </div>
      </section>

      <section className="site-step panel" aria-labelledby="h-facts">
        <p className="col-label" id="h-facts"><span aria-hidden="true">3</span> The project and the land</p>
        <IntakeForm />
      </section>

      <section className="site-step panel" id="compare" aria-labelledby="h-compare">
        <p className="col-label" id="h-compare"><span aria-hidden="true">4</span> The route, and nearby alternatives</p>
        <p className="sub">
          A unit either side of a threshold can add or remove a whole review stage. Compare an alternative beside your entry; trying one keeps your entry, with a button back to it.
        </p>
        <Alternatives />
        <h3 className="site-sub" id="routes">The five routes</h3>
        <p className="sub">
          Under state law every housing project goes through one of five reviews. The route decides which boards hold the decisions, how many
          public hearings there are, what you file, and how long the town may take. Your facts pick one, outlined in green. Choosing another by hand
          shows its steps and check, for when staff say the town will treat the project differently, or to see what a change would mean. You can
          also swap it from the project summary on the Check and Steps pages.
        </p>
        <RoutePicker />
      </section>

      <div className="next-row">
        <Link href="/project" className="btn">See the check →</Link>
        <Link href="/steps" className="btn ghost">Go to the approval steps</Link>
      </div>
    </div>
  );
}
