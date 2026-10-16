import type { Metadata } from "next";
import { AtlasExplorer } from "@/components/AtlasExplorer";
import { RIZA_LINKS } from "@/lib/data/atlas";

export const metadata: Metadata = { title: "Zoning atlas" };

const RESOURCES = [
  { label: "Understanding the Rhode Island Zoning Atlas (StoryMap collection)", url: RIZA_LINKS.collection, note: "HousingWorks RI's four-part guide covering the history of zoning in Rhode Island, how land use affects affordability, legal terms, and how to use the map" },
  { label: "What is the Zoning Atlas and How Can I Use It?", url: RIZA_LINKS.story, note: "Item 4 of the collection: a walkthrough of the map's housing-type, treatment, lot-size and overlay controls" },
  { label: "Rhode Island Zoning Atlas map", url: RIZA_LINKS.app, note: "The interactive map covering all 39 cities and towns" },
  { label: "National Zoning Atlas: Rhode Island", url: RIZA_LINKS.nza, note: "The national method the atlas follows, with Zoning Snapshots" },
  { label: "Special Zoning Atlas Briefing: Warwick/Cranston (video)", url: "https://youtu.be/Spw3OJdRq2Y", note: "Recorded briefing" },
  { label: "Zoning Atlas: Transportation Lunch and Learn, April 2024 (video)", url: "https://youtu.be/N_CrOwZ3pBM", note: "Recorded briefing" },
];

export default function AtlasPage() {
  return (
    <>
      <section className="sec" aria-labelledby="atlas-h">
        <div className="sec-head">
          <div>
            <p className="eyebrow">Rhode Island Zoning Atlas · HousingWorks RI</p>
            <h1 id="atlas-h" className="h2">What your zoning district allows</h1>
          </div>
          <p>
            HousingWorks RI spent almost two years reading the zoning of all 39 Rhode Island cities and towns, using the National
            Zoning Atlas method. This site reads Cumberland's districts from the atlas's public data layer and uses them in the zoning check.
          </p>
        </div>
        <div className="callout-note">
          <b>Before you rely on it.</b> HousingWorks RI notes that the atlas isn't real-time (zoning as of September 2024), that zoning doesn't
          guarantee a site is buildable, and that the data should be verified. This site flags where the atlas and recent Cumberland decisions disagree.
        </div>
      </section>
      <AtlasExplorer />
      <section className="sec" aria-labelledby="res-h">
        <div className="sec-head"><div><p className="eyebrow">From the collection</p><h2 id="res-h">Atlas resources</h2></div></div>
        <ul className="rec-links resource-grid">
          {RESOURCES.map((r) => (
            <li key={r.url}><a href={r.url} target="_blank" rel="noopener noreferrer">{r.label} ↗</a><span>{r.note}</span></li>
          ))}
        </ul>
      </section>
    </>
  );
}
