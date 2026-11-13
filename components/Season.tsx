import type { Season } from "@/lib/timelines";

const f = { fill: "currentColor", stroke: "none" };
const l = { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export type Accent = { name: string; ground: boolean };

/** Four whimsical accents per season, in the order lanes use them. Grounded ones stand on the bottom of the wash, floating ones drift higher. */
export const ACCENTS: Record<Season, Accent[]> = {
  spring: [{ name: "blossom", ground: true }, { name: "bird", ground: false }, { name: "tulip", ground: true }, { name: "butterfly", ground: false }],
  summer: [{ name: "tree", ground: true }, { name: "sun", ground: false }, { name: "sailboat", ground: true }, { name: "kite", ground: false }],
  fall: [{ name: "leaf", ground: false }, { name: "pumpkin", ground: true }, { name: "acorn", ground: false }, { name: "mushroom", ground: true }],
  winter: [{ name: "snowman", ground: true }, { name: "snowflake", ground: false }, { name: "pine", ground: true }, { name: "star", ground: false }],
};

/** One whimsical accent, in currentColor. */
export function SeasonAccent({ season, name, size = 34 }: { season: Season; name?: string; size?: number }) {
  const v = name ?? ACCENTS[season][0].name;
  return (
    <svg className={`season-mark s-${season}`} width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      {v === "blossom" && (
        <g>
          <path {...l} d="M16 31V14c0-2 1-3.5 0-5" />
          <path {...l} d="M16 24c-3.5 0-5.5-1.5-6-4 3 0 5 1 6 4zM16 20c3-.5 5-2 5.5-5-3 .5-5 2-5.5 5z" />
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} {...l} cx="16" cy="4.3" r="3" transform={`rotate(${a} 16 8.5)`} />)}
          <circle {...f} cx="16" cy="8.5" r="1.3" />
        </g>
      )}
      {v === "bird" && <g {...l}><path d="M3 15c4-6 9-6 13 0 4-6 9-6 13 0" /><path d="M20 24c2-2 4-2 6 0M8 27c1.500-1.500 3-1.500 4.500 0" opacity=".7" /></g>}
      {v === "tulip" && <g {...l}><path d="M16 30V17M16 26c-4 0-6-2-6.500-5 3.500 0 5.500 2 6.500 5z" /><path d="M10 7c0 6 2.500 10 6 10s6-4 6-10l-3.200 2.200L16 5l-2.800 4.200z" /></g>}
      {v === "butterfly" && <g {...l}><path d="M16 15C13 6 5 7 6 13c.7 3.500 6 4 10 2zM16 15c3-9 11-8 10-2-.7 3.500-6 4-10 2z" /><path d="M16 15c-4 1-7 5-5.500 8 1.500 1.500 5.500-1 5.500-8zM16 15c4 1 7 5 5.500 8-1.500 1.500-5.500-1-5.500-8z" /><path d="M16 10v13M15 8.500l-2-3M17 8.500l2-3" /></g>}
      {v === "tree" && (
        <g {...l}>
          <path d="M16 31V19M16 24l-4-4M16 22l4-4" />
          <path d="M9 19c-3.500 0-5-2.500-4.500-5 .3-2 2-3 3.500-3 0-3 2.500-5 5-5 1.600-2 5-2 6.500 0 2.500-1 5.500.5 6 3.500 2.500.2 4 2.200 3.500 4.500-.4 2-2 3.500-4 3.500z" />
        </g>
      )}
      {v === "sun" && <g {...l}><circle cx="16" cy="16" r="5" /><path d="M16 4v4M16 24v4M4 16h4M24 16h4M7.500 7.500l2.800 2.800M21.700 21.700l2.800 2.800M24.500 7.500l-2.800 2.800M10.300 21.700l-2.800 2.800" /></g>}
      {v === "sailboat" && <g {...l}><path d="M5 24h22l-4 5H9zM16 24V4" /><path d="M17.500 6c5 4 8 10 8.500 17h-8.500zM14.500 10c-3 3-5.500 7-6 12h6z" /></g>}
      {v === "kite" && <g {...l}><path d="M16 3l7 8-7 11-7-11zM16 3v19M9 11h14" /><path d="M16 22c-3 3 3 4 0 8" strokeDasharray="1 2" /></g>}
      {v === "leaf" && (
        <g transform="rotate(24 16 16)">
          <path {...f} d="M16 3l1.600 4 2.400-1.200-.6 3.600L24 8.500l-1.600 3.200 2.400 1.200-3.600 1.600.4 2-4-.8v5h-1.200v-5l-4 .8.4-2-3.600-1.600 2.400-1.200L8 8.500l4.600.9-.6-3.600 2.400 1.200z" />
          <path {...l} strokeDasharray="1 2.500" d="M8 2c-3 4-3 8 1 11" opacity=".8" />
        </g>
      )}
      {v === "pumpkin" && <g {...l}><path d="M16 9C7 9 3 14 3 19s4 9 13 9 13-4 13-9-4-10-13-10z" /><path d="M16 9c-4 3-4 16 0 19M16 9c4 3 4 16 0 19" /><path d="M16 9c0-3 1-4 3-5.500" /></g>}
      {v === "acorn" && <g {...l}><path d="M6 12c0-4 4-7 10-7s10 3 10 7z" /><path d="M8 13c.3 6 3.500 11 8 13 4.500-2 7.700-7 8-13zM16 5V2.500" /></g>}
      {v === "mushroom" && <g {...l}><path d="M4 18c0-7 5-12 12-12s12 5 12 12z" /><path d="M12 18v8c0 2 1 3 4 3s4-1 4-3v-8" /><circle cx="11" cy="13" r="1.500" /><circle cx="19" cy="11" r="1.200" /><circle cx="22" cy="15" r="1" /></g>}
      {v === "snowman" && (
        <g {...l}>
          <circle cx="16" cy="26" r="5" /><circle cx="16" cy="17.500" r="3.700" /><circle cx="16" cy="10.500" r="2.800" />
          <path d="M13.300 8.300h5.400M14.300 8.300V5.500h3.400v2.800M12.300 17l-4.500-2.500M19.700 17l4.500-2.500" />
          <circle {...f} cx="15" cy="10" r=".5" /><circle {...f} cx="17" cy="10" r=".5" /><circle {...f} cx="16" cy="17" r=".5" /><circle {...f} cx="16" cy="19.500" r=".5" />
        </g>
      )}
      {v === "snowflake" && <g {...l}><path d="M16 3v26M4.700 9.500l22.600 13M27.300 9.500L4.700 22.500" /><path d="M13 5.500L16 8.500l3-3M13 26.500l3-3 3 3" /></g>}
      {v === "pine" && <g {...l}><path d="M16 3l7 9h-4l6 8H7l6-8H9zM16 20v9" /></g>}
      {v === "star" && <path {...l} d="M16 4l3.500 7.500 8 1-6 5.500 1.600 8L16 22l-7.100 4 1.600-8-6-5.500 8-1z" />}
    </svg>
  );
}

export interface SeasonBand { key: string; season: Season; left: string; width: string }

/** Where each lane's accent sits across a season run, and how high a floating one drifts. */
const FRAC = [0.5, 0.25, 0.75, 0.4];
const FLOAT_TOP = ["12%", "22%", "6%", "28%"];

/**
 * An accent per run of a season, in the wash below the month labels. Each lane uses the next accent of the season, set at a different
 * point across the run, and floating accents sit at different heights, so the marks are spread vertically as well as along the calendar.
 * Meant to be hardly noticed; only the first few lanes carry one.
 */
export function SeasonAccents({ bands, lane = 0 }: { bands: SeasonBand[]; lane?: number }) {
  const runs: SeasonBand[][] = [];
  bands.forEach((b) => {
    const last = runs[runs.length - 1];
    if (last && last[0].season === b.season) last.push(b); else runs.push([b]);
  });
  const k = lane % 4;
  return (
    <span className="sscat" aria-hidden="true">
      {runs.map((run) => {
        const mid = run[Math.floor((run.length - 1) / 2)];
        const a = ACCENTS[mid.season][k];
        const frac = run.length % 2 ? FRAC[k] : FRAC[k] + 0.5;
        return (
          <span key={run[0].key} className={`sscat-at s-${mid.season}${a.ground ? " is-ground" : ""}`} style={{ left: `calc(${mid.left} + ${mid.width} * ${frac})`, ...(a.ground ? {} : { top: FLOAT_TOP[k] }) }}>
            <SeasonAccent season={mid.season} name={a.name} />
          </span>
        );
      })}
    </span>
  );
}
