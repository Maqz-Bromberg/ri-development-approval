import { SOURCES } from "./data/sources";
import { TOWNS } from "./data/towns";

/** Short label for a source id, used where space is tight. */
export function sourceKind(id: string): string {
  if (id.startsWith("vid")) return "Video";
  if (id.startsWith("min")) return "Minutes";
  if (id.startsWith("memo")) return "Memo";
  if (id.startsWith("pb")) return "Agenda";
  if (id === "call2017" || id === "vb2025") return "Press";
  if (id === "s2268") return "Testimony";
  if (id.startsWith("riza") || id === "nzaRI") return "Atlas";
  if (id.startsWith("s")) return "Statute";
  return "Source";
}

/*
 * What kind of document a source is, and whose, for the reference pages (Sources and citations, Records). Worked out from the label
 * and the id, never typed, so a new source is placed without upkeep. The order of SOURCE_TYPES is the order the pages show them in.
 */
export const SOURCE_TYPES = [
  "Statute", "Regulation", "Ordinance", "Agenda", "Minutes", "Recording", "Staff report or memo", "Court decision",
  "Form or schedule", "Office page", "Zoning Atlas", "Map layer", "Testimony and press", "Guide",
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export function sourceType(id: string): SourceType {
  const l = SOURCES[id]?.label ?? "";
  if (/U\.S\.C\.|R\.I\. Gen\. Laws/.test(l)) return "Statute";
  if (/Zoning Atlas/.test(l) || id.startsWith("riza") || id === "nzaRI") return /YouTube|StoryMap/.test(l) ? "Guide" : "Zoning Atlas";
  if (/\blayer\b|map service/i.test(l)) return "Map layer";
  if (/RICR|Regulations|Manual/.test(l)) return "Regulation";
  if (/Ordinance/.test(l)) return "Ordinance";
  if (/\bagenda\b/i.test(l)) return "Agenda";
  if (/\bminutes\b/i.test(l)) return "Minutes";
  if (/YouTube|\bvideo\b|recording/i.test(l)) return "Recording";
  if (/staff report|memo/i.test(l)) return "Staff report or memo";
  if (/Court/.test(l)) return "Court decision";
  if (/application|schedule|deadlines/i.test(l)) return "Form or schedule";
  if (/testimony|Valley Breeze|The Call|Journal/i.test(l) || id === "call2017" || id === "vb2025") return "Testimony and press";
  if (/Summary|Understanding|How Can I/i.test(l)) return "Guide";
  return "Office page";
}

/** Whose document it is: a town it names, or the state, or federal law. */
export function sourcePlace(id: string): string {
  const s = SOURCES[id];
  if (!s) return "Statewide";
  // The Zoning Atlas covers every town, even where a briefing names two of them.
  if (id.startsWith("riza") || id === "nzaRI") return "Statewide";
  if (/U\.S\.C\./.test(s.label)) return "Federal";
  if (s.town && s.town !== "State") return s.town;
  const hit = TOWNS.find((t) => s.label.includes(t.name));
  return hit ? hit.name : "Statewide";
}
