import type { Season } from "@/lib/timelines";

const f = { fill: "currentColor", stroke: "none" };
const l = { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** One whimsical accent per season, in currentColor: a blossom rising on its stem, a tree outline, a falling leaf, a snowman. */
export function SeasonAccent({ season, size = 34 }: { season: Season; size?: number }) {
  return (
    <svg className={`season-mark s-${season}`} width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      {season === "spring" && (
        <g>
          <path {...l} d="M16 31V14c0-2 1-3.500 0-5" />
          <path {...l} d="M16 24c-3.500 0-5.500-1.500-6-4 3 0 5 1 6 4zM16 20c3-.5 5-2 5.500-5-3 .5-5 2-5.500 5z" />
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} {...l} cx="16" cy="4.300" r="3" transform={`rotate(${a} 16 8.500)`} />)}
          <circle {...f} cx="16" cy="8.500" r="1.300" />
        </g>
      )}
      {season === "summer" && (
        <g {...l}>
          <path d="M16 31V19M16 24l-4-4M16 22l4-4" />
          <path d="M9 19c-3.500 0-5-2.500-4.500-5 .3-2 2-3 3.500-3 0-3 2.500-5 5-5 1.600-2 5-2 6.500 0 2.500-1 5.500.5 6 3.500 2.500.2 4 2.200 3.500 4.500-.4 2-2 3.500-4 3.500z" />
        </g>
      )}
      {season === "fall" && (
        <g transform="rotate(24 16 16)">
          <path {...f} d="M16 3l1.600 4 2.400-1.200-.6 3.600L24 8.500l-1.600 3.200 2.400 1.200-3.600 1.600.4 2-4-.8v5h-1.200v-5l-4 .8.4-2-3.600-1.600 2.400-1.200L8 8.500l4.600.9-.6-3.600 2.400 1.200z" />
          <path {...l} strokeDasharray="1 2.500" d="M8 2c-3 4-3 8 1 11" opacity=".8" />
        </g>
      )}
      {season === "winter" && (
        <g {...l}>
          <circle cx="16" cy="26" r="5" /><circle cx="16" cy="17.500" r="3.700" /><circle cx="16" cy="10.500" r="2.800" />
          <path d="M13.300 8.300h5.400M14.300 8.300V5.500h3.400v2.800" />
          <path d="M12.300 17l-4.500-2.500M19.700 17l4.500-2.500" />
          <circle {...f} cx="15" cy="10" r=".5" /><circle {...f} cx="17" cy="10" r=".5" /><circle {...f} cx="16" cy="17" r=".5" /><circle {...f} cx="16" cy="19.500" r=".5" />
        </g>
      )}
    </svg>
  );
}

export interface SeasonBand { key: string; season: Season; left: string; width: string }

/**
 * One accent per run of a season, set in the middle of that run in the wash below the month labels. Meant to be hardly noticed.
 * Rendered in a single lane, so the timeline shows each accent once.
 */
export function SeasonAccents({ bands }: { bands: SeasonBand[] }) {
  const runs: SeasonBand[][] = [];
  bands.forEach((b) => {
    const last = runs[runs.length - 1];
    if (last && last[0].season === b.season) last.push(b); else runs.push([b]);
  });
  return (
    <span className="sscat" aria-hidden="true">
      {runs.map((run) => {
        const mid = run[Math.floor((run.length - 1) / 2)];
        const frac = run.length % 2 ? 0.5 : 1;
        return (
          <span key={run[0].key} className={`sscat-at s-${mid.season}`} style={{ left: `calc(${mid.left} + ${mid.width} * ${frac})` }}>
            <SeasonAccent season={mid.season} />
          </span>
        );
      })}
    </span>
  );
}
