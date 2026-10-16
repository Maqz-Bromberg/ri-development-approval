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

export function districtMetrics(d: AtlasDistrict): [string, string][] {
  return [
    ["Min lot, 4+ family (acres)", d.family4_minlotacres ?? "—"],
    ["Max units per acre", d.family4_maxunitsperacre ?? "—"],
    ["Max height (ft)", d.family4_maxheightft ?? "—"],
    ["Parking per unit", d.family4_minparking_2br ?? "—"],
    ["Public water required", d.family4_water_required ?? "—"],
    ["Min lot, 1-family (acres)", d.family1_minlotacres ?? "—"],
  ];
}
