"use client";

import Link from "next/link";
import { RIZA_LINKS, housingTypeLabel, treatmentFor } from "@/lib/data/atlas";
import { AtlasStatusBadge, TreatChip, districtMetrics, utilityLabel } from "./AtlasBits";
import { useAtlas } from "./useAtlas";
import { useProject } from "./ProjectProvider";

/** The project's zoning district as the Rhode Island Zoning Atlas describes it. */
export function AtlasPanel() {
  const { inputs } = useProject();
  const { districts, status, diffs, error } = useAtlas();
  const d = districts.find((x) => x.abbrvname === inputs.zone);
  const t = treatmentFor(d, inputs.units);

  return (
    <div className="panel atlas-panel">
      <div className="atlas-head">
        <div>
          <p className="eyebrow">Rhode Island Zoning Atlas</p>
          <h3>{d ? `${d.abbrvname} · ${d.name}` : "District not in the atlas"}</h3>
        </div>
        <AtlasStatusBadge status={status} diffs={diffs} error={error} />
      </div>
      {d ? (
        <>
          <p className="sub">
            {inputs.kind === "commercial"
              ? <>The Atlas records housing types only, so it says nothing about a {inputs.use === "industrial" ? "light industrial" : inputs.use} use here. The chips show what it says about housing.</>
              : <>{housingTypeLabel(inputs.units)} housing here is <b>{t.raw.toLowerCase()}</b>. Each chip shows how the district treats that housing type.</>}
          </p>
          <div className="treat-row">
            <TreatChip label="1-family" value={d.family1_treatment} />
            <TreatChip label="2-family" value={d.family2_treatment} />
            <TreatChip label="3-family" value={d.family3_treatment} />
            <TreatChip label="4+ family" value={d.family4_treatment} />
            <TreatChip label="ADU" value={d.accessory_treatment} />
            <TreatChip label="Affordable" value={d.affordable_treatment} />
          </div>
          <dl className="metrics">
            {districtMetrics(d, inputs.water, inputs.sewer).map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          <p className="small muted">
            Lot and density figures are for a site {utilityLabel(inputs.water, inputs.sewer)}, as entered. Hover a figure for the atlas's own text.
            The atlas reflects zoning as of September 2024. Verify against the current ordinance.
          </p>
        </>
      ) : (
        <p className="sub">Choose a district from the project form, or open the atlas map to find the parcel's district.</p>
      )}
      <div className="actions">
        <Link href="/atlas" className="btn ghost">Compare all {inputs.town} districts</Link>
        <a href={RIZA_LINKS.app} target="_blank" rel="noopener noreferrer" className="btn ghost">Open the atlas map ↗</a>
      </div>
    </div>
  );
}
