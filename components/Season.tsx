import type { Season } from "@/lib/timelines";

/** Faint seasonal marks for timelines: a maple leaf for fall, a sun for summer, a sprig for spring, a snowflake for winter. */
export function SeasonMark({ season, size = 18 }: { season: Season; size?: number }) {
  const p = { fill: "currentColor", stroke: "none" };
  const l = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const };
  return (
    <svg className={`season-mark s-${season}`} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {season === "fall" && <path {...p} d="M12 1l2 5 3-1.5-.8 4.5L21 8l-2 4 3 1.5-4.5 2 .5 2.5-5-1v6h-2v-6l-5 1 .5-2.5L2 13.5 5 12 3 8l4.8 1L7 4.5 10 6z" />}
      {season === "summer" && <g {...l}><circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" /></g>}
      {season === "spring" && <g><path {...p} d="M4 20C4 11 10 5 20 4c-1 9-6 16-16 16z" /><path {...l} stroke="var(--bg, #fff)" opacity=".7" d="M4 20L14 10" /></g>}
      {season === "winter" && <g {...l}><path d="M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17" /><path d="M9.5 3.8L12 6.3l2.5-2.5M9.5 20.2L12 17.7l2.5 2.5" /></g>}
    </svg>
  );
}
