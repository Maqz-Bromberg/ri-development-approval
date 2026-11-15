import { ALTERNATIVES } from "./alternatives";
import { FINDINGS } from "./findings";
import { FLAGS } from "./flags";
import { OVERVIEW } from "./overview";
import { PROJECT_FACTS } from "./projectFacts";
import { RECORDS } from "./records";
import { ROUTE } from "./route";
import { SCHEDULE } from "./schedule";
import { SITE_LOOKUP } from "./siteLookup";
import { SOURCES_FLOW } from "./sources";
import { STEPS } from "./steps";
import { TOWN_OVERLAY } from "./townOverlay";
import { USE_DENSITY } from "./useDensity";
import { VERDICT } from "./verdict";
import type { Flow } from "./types";

export { OVERVIEW };

/** The parts of the engine, in the order of work. The order is the order of the previous and next links. */
export const FLOWS: Flow[] = [
  SITE_LOOKUP, PROJECT_FACTS, TOWN_OVERLAY, ROUTE, USE_DENSITY, FLAGS, STEPS, FINDINGS, VERDICT, SCHEDULE, ALTERNATIVES, SOURCES_FLOW, RECORDS,
];

export const flowBySlug = (slug: string): Flow | undefined => FLOWS.find((f) => f.slug === slug);
