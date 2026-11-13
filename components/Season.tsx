import type { Season } from "@/lib/timelines";

export const SEASON_VARIANTS: Record<Season, string[]> = {
  fall: ["maple", "oak", "acorn"],
  summer: ["sun", "sunflower", "butterfly"],
  spring: ["sprig", "blossom", "raindrop"],
  winter: ["snowflake", "pine", "crystal"],
};

/** One faint seasonal mark. Drawn in currentColor so the season sets its colour. */
export function SeasonMark({ season, variant, size = 18 }: { season: Season; variant?: string; size?: number }) {
  const v = variant ?? SEASON_VARIANTS[season][0];
  const f = { fill: "currentColor", stroke: "none" };
  const l = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg className={`season-mark s-${season}`} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {v === "maple" && <path {...f} d="M12 1l2 5 3-1.5-.8 4.5L21 8l-2 4 3 1.5-4.5 2 .5 2.5-5-1v6h-2v-6l-5 1 .5-2.5L2 13.5 5 12 3 8l4.8 1L7 4.5 10 6z" />}
      {v === "oak" && <g><path {...f} d="M12 3c2 1 3 2.5 2.6 4 1.4.4 2.2 1.4 2 2.8 1.3.7 1.8 2 1.2 3.2-.6 1.3-2 1.8-3.2 1.5-.4 1.2-1.4 1.8-2.6 1.7-1.2.1-2.2-.5-2.6-1.7-1.2.3-2.6-.2-3.2-1.5-.6-1.2-.1-2.5 1.2-3.2-.2-1.4.6-2.4 2-2.8C8.8 5.5 10 4 12 3z" /><path {...l} d="M12 12v9" /></g>}
      {v === "acorn" && <g {...f}><path d="M5.5 10c0-3.2 3-5.5 6.5-5.5s6.5 2.3 6.5 5.5z" /><path d="M7 11.5c.2 4.6 2.4 8 5 9 2.6-1 4.8-4.4 5-9z" /><path d="M11 2.5h2v2.5h-2z" /></g>}
      {v === "sun" && <g {...l}><circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" /></g>}
      {v === "sunflower" && <g {...f}>{[0, 45, 90, 135].map((a) => <ellipse key={a} cx="12" cy="12" rx="2.2" ry="9.5" transform={`rotate(${a} 12 12)`} />)}<circle cx="12" cy="12" r="3.4" fill="var(--bg, #fff)" opacity=".55" /></g>}
      {v === "butterfly" && <g><path {...f} d="M12 12C8 4 2 6 4 11c.8 2.6 5 3 8 1zM12 12c4-8 10-6 8-1-.8 2.6-5 3-8 1zM12 12c-3 .6-6 4.4-4.4 7 1.2 1.2 4.4-1 4.4-7zM12 12c3 .6 6 4.4 4.4 7-1.2 1.2-4.4-1-4.4-7z" /><path {...l} d="M12 8v10M11 6l-1.5-2M13 6l1.5-2" /></g>}
      {v === "sprig" && <g><path {...f} d="M4 20C4 11 10 5 20 4c-1 9-6 16-16 16z" /><path {...l} stroke="var(--bg, #fff)" opacity=".7" d="M4 20L14 10" /></g>}
      {v === "blossom" && <g {...f}>{[0, 72, 144, 216, 288].map((a) => <circle key={a} cx="12" cy="6.2" r="3.9" transform={`rotate(${a} 12 12)`} />)}<circle cx="12" cy="12" r="2.2" fill="var(--bg, #fff)" opacity=".6" /></g>}
      {v === "raindrop" && <path {...f} d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" />}
      {v === "snowflake" && <g {...l}><path d="M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17" /><path d="M9.5 3.8L12 6.3l2.5-2.5M9.5 20.2L12 17.7l2.5 2.5" /></g>}
      {v === "pine" && <path {...f} d="M12 2l5 7h-3l4 6h-4.5l3.5 5H7l3.5-5H6l4-6H7zM11 20h2v2.5h-2z" />}
      {v === "crystal" && <path {...f} d="M12 2l2.2 6.3 6.5.2-5.2 4 1.9 6.3L12 15l-5.4 3.8 1.9-6.3-5.2-4 6.5-.2z" />}
    </svg>
  );
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967295;
}

export interface SeasonBand { key: string; season: Season; left: string; width: string }

/**
 * Faint marks scattered inside the seasonal wash of one track, below the month labels. Position, kind, size and tilt come from a hash of the
 * band and the lane, so the pattern is stable and differs from lane to lane. Not every month gets one, so it stays sparse.
 */
export function SeasonScatter({ bands, lane, size }: { bands: SeasonBand[]; lane: string; size: number }) {
  return (
    <span className="sscat" aria-hidden="true">
      {bands.flatMap((b) => {
        const r = (n: number) => hash(`${lane}|${b.key}|${n}`);
        if (r(0) > 0.55) return [];
        const kinds = SEASON_VARIANTS[b.season];
        const s = size * (0.8 + r(1) * 0.5);
        return [(
          <span key={b.key} className="sscat-at" style={{ left: `calc(${b.left} + ${b.width} * ${(0.2 + r(2) * 0.6).toFixed(2)})`, top: `${(32 + r(3) * 46).toFixed(0)}%`, ["--r" as string]: `${Math.round(r(4) * 80 - 40)}deg` }}>
            <SeasonMark season={b.season} variant={kinds[Math.floor(r(5) * kinds.length)]} size={Math.round(s)} />
          </span>
        )];
      })}
    </span>
  );
}
