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
export const VARIANTS: Record<string, Variant> = {
  type: {
    label: "Type",
    note: "Headings and text on every page (ARD D42, trial k).",
    pages: ["/", "/site", "/law", "/route", "/calendar", "/hearing", "/towns", "/records", "/docs"],
    options: { bitter: "Bitter headings, Atkinson Hyperlegible text", nunito: "Nunito Sans for both (the site until now)" },
  },
  gate: {
    label: "Choosing a site first",
    note: "Whether the other four stages wait for a chosen site (ARD D42, trial c).",
    pages: ["/", "/site", "/law", "/route", "/calendar", "/hearing"],
    options: { open: "Open: every stage can be opened, showing the example with its tag", gated: "Gated: the other stages wait for a chosen site" },
  },
  landing: {
    label: "Landing",
    note: "What leads on the first page. Every option keeps the same parts (ARD D42, trial c).",
    pages: ["/"],
    options: { find: "Find your site: the find box first, then who you'll meet and the five stages", map: "Map first: the statewide town map with the search box over it", three: "Three ways in: three equal cards, recent and saved sites below" },
  },
  routes: {
    label: "Routes on Site",
    note: "How the five routes are compared under \"Your route, and the alternatives\" (ARD D51, Maqz 2026-11-18).",
    pages: ["/site"],
    options: {
      diff: "A table: your route in full, and what each other route adds, drops or changes",
      cards: "The five routes as cards, each with its rule, what it involves and how well it is sourced",
      focus: "One row: the route in focus open, its neighbours showing their main differences from it, the rest folded to a title",
    },
  },
  stepIcons: {
    label: "Step icons",
    note: "The mark beside each step where the routes are compared on Site (ARD D52, Maqz 2026-11-18).",
    pages: ["/site"],
    options: {
      line: "Line icons, one per kind of step, drawn after the old pathway's pictures",
      vignette: "The old pathway's pictures, small",
      who: "Who decides the step, by the mark and colour used for that kind of body elsewhere",
      none: "No marks: the step names only",
    },
  },
  alts: {
    label: "Alternatives",
    note: "Where the list of nearby alternatives, as routes, sits (ARD D42, trial g).",
    pages: ["/site", "/law"],
    options: { site: "On Site, as the list of routes at the end of the page", check: "In the check, folded under the verdict on Zoning & law" },
  },
};

export type TrialKey = string;
export type TrialState = Record<string, string>;

/** Page names for the links on /dev and in the panel. */
export const PAGE_NAMES: Record<string, string> = {
  "/": "Landing",
  "/site": "Site",
  "/law": "Zoning & law",
  "/route": "Route & people",
  "/calendar": "Calendar",
  "/hearing": "Hearing",
  "/towns": "Towns",
  "/records": "Records",
  "/docs": "Documentation",
};

export const DEFAULT_TRIAL: TrialState = Object.fromEntries(Object.entries(VARIANTS).map(([k, v]) => [k, Object.keys(v.options)[0]]));
