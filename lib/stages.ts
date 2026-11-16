import type { IconName } from "./iconSprite";

/**
 * The five stages of an approval, in order. The header, the landing, the rail and the "Continue to" buttons all read
 * this list (ARD D42). Subtitles are worked out from the project by `useStageSubtitles` (components/useStages.ts).
 */
export type StageId = "site" | "law" | "route" | "cal" | "hear";

export interface Stage {
  id: StageId;
  href: string;
  label: string;
  icon: IconName;
  /** The class that sets the stage's wash and ink colours (shell.css) */
  wash: string;
  /** The band's short lead */
  lead: string;
}

export const STAGES: Stage[] = [
  { id: "site", href: "/site", label: "Site", icon: "site", wash: "w-site", lead: "Where it is, the zoning district, what you plan to build, and what the land has." },
  { id: "law", href: "/law", label: "Zoning & law", icon: "law", wash: "w-law", lead: "What the rules say about this project, each finding with the rule it comes from." },
  { id: "route", href: "/route", label: "Route & people", icon: "route", wash: "w-route", lead: "Every step, who holds each decision, what to file, and who to deal with." },
  { id: "cal", href: "/calendar", label: "Calendar", icon: "cal", wash: "w-cal", lead: "Every filing, deadline and hearing, dated from your start date." },
  { id: "hear", href: "/hearing", label: "Hearing", icon: "hear", wash: "w-hear", lead: "The questions neighbours and board members ask, and what has worked." },
];

export const stageOf = (path: string): Stage | undefined => {
  const p = path.replace(/\/$/, "") || "/";
  return STAGES.find((s) => p === s.href || p.startsWith(`${s.href}/`));
};

export const stageById = (id: StageId): Stage => STAGES.find((s) => s.id === id)!;

/** The stage after this one, for "Continue to" buttons. */
export const nextStage = (id: StageId): Stage | undefined => STAGES[STAGES.findIndex((s) => s.id === id) + 1];

/** Old addresses and where they go, with the part after # kept. */
export const MOVED: Record<string, string> = { "/project": "/law", "/steps": "/route", "/schedule": "/calendar", "/objections": "/hearing" };
