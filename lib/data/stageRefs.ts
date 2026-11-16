import { RIZA_LINKS } from "./atlas";
import type { StageId } from "../stages";

/**
 * The reference chips on each stage's band: real links to a source by its id, a glossary entry, a records page or the Atlas.
 * Nothing here is a placeholder. The Reference menu shows the current stage's chips first (ARD D42).
 */
export interface StageRef {
  label: string;
  /** A source id in sources.ts, an app path, or an outside address */
  src?: string;
  href?: string;
}

export const STAGE_REFS: Record<StageId, StageRef[]> = {
  site: [
    { label: "Rhode Island Zoning Atlas", href: RIZA_LINKS.app },
    { label: "How site facts are found", href: "/docs/site-facts" },
    { label: "Towns and coverage", href: "/towns" },
    { label: "Glossary: unit counts and thresholds", href: "/glossary#minor" },
  ],
  law: [
    { label: "§ 45-23-32 definitions", src: "s3932" },
    { label: "§ 45-23-39 major review", src: "s3939" },
    { label: "§ 45-53-4 comprehensive permits", src: "s5304" },
    { label: "All sources and citations", href: "/docs/sources" },
  ],
  route: [
    { label: "§ 45-23-38 minor review", src: "s3938" },
    { label: "§ 45-23-50.1 unified review", src: "s3950" },
    { label: "After approval", href: "/after-approval" },
    { label: "Records of past projects", href: "/records" },
    { label: "Glossary", href: "/glossary" },
  ],
  cal: [
    { label: "§ 45-23-71 appeals", src: "s3971" },
    { label: "How the engine builds a schedule", href: "/engine/schedule" },
    { label: "Meeting records", href: "/records" },
  ],
  hear: [
    { label: "Meeting records", href: "/records" },
    { label: "How records are checked", href: "/verification" },
    { label: "Glossary", href: "/glossary" },
  ],
};
