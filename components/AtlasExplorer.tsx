"use client";

import { useState } from "react";
import { RIZA_LINKS } from "@/lib/data/atlas";
import { AtlasStatusBadge, TreatChip } from "./AtlasBits";
import { useAtlas } from "./useAtlas";
import { useProject } from "./ProjectProvider";

export function AtlasExplorer() {
  const { districts, status, diffs, error } = useAtlas();
  const { inputs, setInput } = useProject();
  const [embed, setEmbed] = useState<"none" | "map" | "story">("none");
  const allows4 = districts.filter((d) => d.family4_treatment === "Allowed/Conditional").map((d) => d.abbrvname);
  const hearing4 = districts.filter((d) => d.family4_treatment === "Public Hearing").map((d) => d.abbrvname);

  return (
    <>
      <section className="sec" aria-labelledby="dist-h">
        <div className="sec-head">
          <div>
            <p className="eyebrow">Cumberland in the atlas</p>
            <h2 id="dist-h">Housing allowed in each district</h2>
          </div>
          <AtlasStatusBadge status={status} diffs={diffs} error={error} />
        </div>
        <div className="atlas-summary">
          <div className="stat"><b>{districts.length}</b><span>zoning districts</span></div>
          <div className="stat"><b>{allows4.length}</b><span>allow 4+ family housing by right: {allows4.join(", ")}</span></div>
          <div className="stat"><b>{hearing4.length}</b><span>allow it only after a public hearing: {hearing4.join(", ")}</span></div>
        </div>
        <div className="tablewrap">
          <table className="atlas-table">
            <thead>
              <tr>
                <th>District</th><th>1-fam</th><th>2-fam</th><th>3-fam</th><th>4+ fam</th><th>ADU</th>
                <th>Min lot, 4+ (ac)</th><th>Units / acre</th><th className="num">Height</th><th className="num">Parking</th><th />
              </tr>
            </thead>
            <tbody>
              {districts.map((d) => {
                const current = d.abbrvname === inputs.zone;
                return (
                  <tr key={d.abbrvname} className={current ? "is-current" : undefined}>
                    <td><b>{d.abbrvname}</b><br /><span className="muted small">{d.name}</span></td>
                    <td><TreatChip value={d.family1_treatment} /></td>
                    <td><TreatChip value={d.family2_treatment} /></td>
                    <td><TreatChip value={d.family3_treatment} /></td>
                    <td><TreatChip value={d.family4_treatment} /></td>
                    <td><TreatChip value={d.accessory_treatment} /></td>
                    <td className="mono small">{d.family4_minlotacres ?? "—"}</td>
                    <td className="mono small">{d.family4_maxunitsperacre ?? "—"}</td>
                    <td className="num">{d.family4_maxheightft ? `${d.family4_maxheightft} ft` : "—"}</td>
                    <td className="num">{d.family4_minparking_2br ?? "—"}</td>
                    <td>
                      {current
                        ? <span className="sim">Your project</span>
                        : <button type="button" className="link-btn" onClick={() => setInput("zone", d.abbrvname)}>Use for my project</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="small muted">
          Treatments: <b>Allowed</b> means by right, possibly with conditions. <b>Hearing</b> means a public hearing, usually for a special use permit.
          <b> No</b> means prohibited. Lot and density figures depend on utilities: "w/s" is public water or sewer, "w+s" is both, and "if PRD" is the planned residential or conservation development figure.
        </p>
      </section>

      <section className="sec" aria-labelledby="map-h">
        <div className="sec-head">
          <div><p className="eyebrow">Interactive</p><h2 id="map-h">The atlas map and story</h2></div>
          <p>The map and story are hosted by ArcGIS and only load when you ask, so the page stays fast.</p>
        </div>
        <div className="embed-tabs" role="group" aria-label="Choose what to load">
          <button type="button" className="filter" aria-pressed={embed === "map"} onClick={() => setEmbed("map")}>Load the atlas map</button>
          <button type="button" className="filter" aria-pressed={embed === "story"} onClick={() => setEmbed("story")}>Load the story: what is the atlas?</button>
          {embed !== "none" && <button type="button" className="filter" onClick={() => setEmbed("none")}>Close</button>}
        </div>
        {embed !== "none" ? (
          <div className="embed">
            <iframe
              src={embed === "map" ? RIZA_LINKS.app : RIZA_LINKS.story}
              title={embed === "map" ? "Rhode Island Zoning Atlas map" : "What is the Zoning Atlas and How Can I Use It?"}
              loading="lazy"
              allow="geolocation; fullscreen"
            />
            <p className="embed-foot small">
              Not loading? <a href={embed === "map" ? RIZA_LINKS.app : RIZA_LINKS.story} target="_blank" rel="noopener noreferrer">Open it in a new tab ↗</a>
            </p>
          </div>
        ) : (
          <div className="embed-placeholder">
            <p><b>How to read the map</b>, from HousingWorks RI's guide:</p>
            <ul>
              <li><b>Housing type view.</b> Land is shaded by the housing allowed: 1-family, 2-family, 3-family, 4+ family and ADUs. The denser the type you pick, the less of the state stays highlighted.</li>
              <li><b>Treatment.</b> Shows whether each type is allowed by right or needs a public hearing. Hearing requirements can slow or block projects.</li>
              <li><b>Minimum lot size.</b> Filters out districts with large lot minimums. Under ½ acre removes much of the map.</li>
              <li><b>Overlays.</b> State and federal conservation land, tribal land, the Urban Services Boundary, and areas with public water or sewer.</li>
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
