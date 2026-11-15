/*
 * Shares of deed-restricted affordable units that cross a line in law, for the shading beside the affordable units
 * on Site selection. Darker for a higher share. Only the 25% line changes the approval route here; the tax-credit
 * lines are federal financing tests, which also depend on the households' incomes, which the form does not ask for.
 */
export interface AffTier {
  /** Share of all units, 0 to 1 */
  share: number;
  /** Fewest units for the line to apply at all */
  minUnits?: number;
  short: string;
  what: string;
  src: string;
  /** True when the line changes the approval route on this site */
  route?: boolean;
}

export const AFF_TIERS: AffTier[] = [
  {
    share: 0.2, short: "20%: tax credit 20/50",
    what: "Federal low-income housing tax credit: at least 20% of units for households at or below 50% of area median income. Financing, not approval.",
    src: "irc42",
  },
  {
    share: 0.25, minUnits: 3, short: "25%: comprehensive permit", route: true,
    what: "Rhode Island's comprehensive permit: at least 25% of 3 or more units for low- or moderate-income households. One application, and the board can adjust use and density.",
    src: "s5304",
  },
  {
    share: 0.4, short: "40%: tax credit 40/60",
    what: "Federal low-income housing tax credit: at least 40% of units for households at or below 60% of area median income. Financing, not approval.",
    src: "irc42",
  },
];

/** The highest line the share meets, as an index into AFF_TIERS, or -1. */
export function affTier(units: number, aff: number): number {
  if (!units || !aff) return -1;
  const share = aff / units;
  let best = -1;
  AFF_TIERS.forEach((t, i) => { if (share >= t.share - 1e-9 && units >= (t.minUnits ?? 1)) best = i; });
  return best;
}

/** Which lines the share meets, one flag per tier. Not always contiguous: 2 units at 50% meet the tax-credit lines but not the 25% line, which needs 3 units. */
export function affMet(units: number, aff: number): boolean[] {
  return AFF_TIERS.map((t) => units > 0 && aff > 0 && aff / units >= t.share - 1e-9 && units >= (t.minUnits ?? 1));
}
