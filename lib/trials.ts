/*
 * Design variants on trial. Plain data, so the trial panel (components/Trial.tsx) and the dev page can both read it.
 *
 * Each variant names the pages it changes. The panel shows a variant only on those pages, and /dev lists every
 * variant with a link to each page, so a trial is never somewhere you have to remember. The first option of each
 * is what the published site uses. When a choice is made, delete the variant here and the losing branches in the code.
 *
 * Decided 2026-11-14 and removed: consolidated rows for the approval steps, tickable considerations,
 * Nunito Sans headings, the Check page as a project bar, and (second round) the project open above with the
 * bar appearing once it scrolls away, the form beside the map and district, and the status as a word alone.
 * Decided later the same day: the project summary as a panel on the left on wide screens, over the bar; the
 * affordable share's key in a card on hover or click of the share, over a key stacked beside it.
 * Decided 2026-11-14 (map key): shapes for the zoning and parcel keys, and a layout that follows the width (see ARD D40).
 */
export interface Variant {
  label: string;
  note: string;
  pages: readonly string[];
  /** The first option is what the published site uses. */
  options: Record<string, string>;
}

/** Empty now: every trial so far has been decided. Add one here, read it with useTrial(), and delete it when chosen. */
export const VARIANTS: Record<string, Variant> = {};

export type TrialKey = string;
export type TrialState = Record<string, string>;

/** Page names for the links on /dev and in the panel. */
export const PAGE_NAMES: Record<string, string> = {
  "/site": "Site selection",
  "/project": "Check",
  "/steps": "Steps",
  "/schedule": "Schedule",
};

export const DEFAULT_TRIAL: TrialState = Object.fromEntries(Object.entries(VARIANTS).map(([k, v]) => [k, Object.keys(v.options)[0]]));
