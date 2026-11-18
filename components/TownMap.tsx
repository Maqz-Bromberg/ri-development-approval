"use client";

import { useEffect, useMemo, useState } from "react";
import { townShapes, type TownShape } from "@/lib/map";

/**
 * The 39 towns as a small static map (no tiles), from the Zoning Atlas's town outlines. Used on the reference pages to find
 * a town and to filter by one: each town is shaded by `fill`, a click calls `onPick`, and towns not in `shown` are faded.
 * The outlines are fetched live; if the Atlas does not answer, the page's list still works and the map says so.
 */
export function TownMap({ fill, shown, picked, onPick, label, note }: {
  fill: (name: string) => string;
  /** Towns that pass the page's filter; the rest are faded */
  shown?: Set<string>;
  picked?: string | null;
  onPick?: (name: string) => void;
  label: string;
  /** A line under the map, such as the key */
  note?: React.ReactNode;
}) {
  const [shapes, setShapes] = useState<TownShape[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  useEffect(() => { townShapes().then(setShapes).catch(() => setFailed(true)); }, []);

  // A plain equirectangular projection, with longitude scaled by the cosine of Rhode Island's latitude so the state keeps its shape.
  const drawn = useMemo(() => {
    if (!shapes?.length) return null;
    const pts = shapes.flatMap((s) => s.rings.flat());
    const lats = pts.map((p) => p[0]), lons = pts.map((p) => p[1]);
    const [s, n, w, e] = [Math.min(...lats), Math.max(...lats), Math.min(...lons), Math.max(...lons)];
    const k = Math.cos((((s + n) / 2) * Math.PI) / 180);
    const W = 300, H = Math.round((W * (n - s)) / ((e - w) * k));
    const x = (lon: number) => ((lon - w) / (e - w)) * W;
    const y = (lat: number) => ((n - lat) / (n - s)) * H;
    return {
      W, H,
      towns: shapes.map((t) => ({
        name: t.name,
        d: t.rings.map((r) => `M${r.map((p) => `${x(p[1]).toFixed(1)},${y(p[0]).toFixed(1)}`).join("L")}Z`).join(""),
      })),
    };
  }, [shapes]);

  return (
    <figure className="town-map">
      {drawn ? (
        <svg viewBox={`0 0 ${drawn.W} ${drawn.H}`} role="group" aria-label={label}>
          {drawn.towns.map((t) => {
            const faded = shown && !shown.has(t.name);
            return (
              <path
                key={t.name}
                d={t.d}
                fillRule="evenodd"
                className={`${faded ? "faded" : ""}${picked === t.name ? " picked" : ""}${hover === t.name ? " hover" : ""}`}
                style={{ fill: fill(t.name) }}
                tabIndex={onPick ? 0 : undefined}
                role={onPick ? "button" : undefined}
                aria-label={t.name}
                onMouseEnter={() => setHover(t.name)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(t.name)}
                onBlur={() => setHover(null)}
                onClick={() => onPick?.(t.name)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick?.(t.name); } }}
              ><title>{t.name}</title></path>
            );
          })}
        </svg>
      ) : (
        <div className="town-map-wait">{failed ? "The Zoning Atlas didn't answer, so the town outlines are missing. The list works without them." : "Reading the town outlines…"}</div>
      )}
      <figcaption>
        <span className="town-map-hover" aria-live="polite">{hover ?? picked ?? "Hover or tap a town"}</span>
        {note}
      </figcaption>
    </figure>
  );
}
