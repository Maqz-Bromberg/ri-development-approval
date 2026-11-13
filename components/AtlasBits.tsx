import { readByUtility } from "@/lib/data/atlas";
import type { AtlasDistrict } from "@/lib/types";
import type { AtlasStatus } from "./useAtlas";

const TREAT_CLASS: Record<string, string> = {
  "Allowed/Conditional": "t-allowed",
  "Public Hearing": "t-hearing",
  Prohibited: "t-prohibited",
  Overlay: "t-overlay",
};
const TREAT_SHORT: Record<string, string> = {
  "Allowed/Conditional": "Allowed",
  "Public Hearing": "Hearing",
  Prohibited: "No",
  Overlay: "Overlay",
};

export function TreatChip({ value, label }: { value: string | null; label?: string }) {
  const v = value ?? "Not mentioned";
  return (
    <span className={`treat ${TREAT_CLASS[v] ?? "t-none"}`} title={label ? `${label}: ${v}` : v}>
      {label && <span className="treat-k">{label}</span>}
      {TREAT_SHORT[v] ?? "—"}
    </span>
  );
}

export function AtlasStatusBadge({ status, diffs, error }: { status: AtlasStatus; diffs: { abbrvname: string }[]; error?: string }) {
  if (status === "loading") return <span className="atlas-status">Checking the live atlas…</span>;
  if (status === "live") {
    return (
      <span className={`atlas-status live${diffs.length ? " warn" : ""}`}>
        {diffs.length ? `Live atlas differs from snapshot for ${diffs.map((d) => d.abbrvname).join(", ")}` : "Live from the Zoning Atlas · matches snapshot"}
      </span>
    );
  }
  return <span className="atlas-status" title={error}>Offline snapshot (Sept 2024 data)</span>;
}

/** One figure from an atlas lot or density string, for the site's utilities. The raw string goes in a tooltip. */
export function AtlasFigure({ raw, water, sewer, unit = "" }: { raw: string | null; water: boolean; sewer: boolean; unit?: string }) {
  if (!raw) return <>—</>;
  const v = readByUtility(raw, water, sewer);
  if (v.base === null && v.prd === null) return <span title={raw}>not listed for these utilities</span>;
  return (
    <span title={`Atlas text: ${raw}`}>
      {v.base ?? "—"}{unit}
      {v.prd !== null && <span className="muted small"> · {v.prd}{unit} as conservation development</span>}
    </span>
  );
}

export function utilityLabel(water: boolean, sewer: boolean): string {
  return water && sewer ? "with public water and sewer" : water ? "with public water only" : sewer ? "with public sewer only" : "without public water or sewer";
}

export function districtMetrics(d: AtlasDistrict, water = true, sewer = true): [string, React.ReactNode][] {
  return [
    ["Min lot, 4+ family (acres)", <AtlasFigure key="a" raw={d.family4_minlotacres} water={water} sewer={sewer} />],
    ["Max units per acre", <AtlasFigure key="b" raw={d.family4_maxunitsperacre} water={water} sewer={sewer} />],
    ["Max height (ft)", d.family4_maxheightft ?? "—"],
    ["Parking per unit", d.family4_minparking_2br ?? "—"],
    ["Public water required", d.family4_water_required ?? "—"],
    ["Min lot, 1-family (acres)", <AtlasFigure key="c" raw={d.family1_minlotacres} water={water} sewer={sewer} />],
  ];
}
