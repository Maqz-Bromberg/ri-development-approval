import PROVIDENCE from "./towns/providence/agenda.json";
import { historyFor } from "./history";
import type { Precedent } from "../types";

/*
 * Every case on a board's agendas since a date (scripts/towns/list_agenda_items.py, ARD D53 chunk 0, step 1), so a
 * project not yet read into the precedent is a named gap rather than missing (principle 10). Applicants are not kept.
 */
export interface AgendaCase {
  case: string; address: string; lot: string | null; area: string | null; units: number | null;
  meetings: { date: string; heading: string; what: string; meeting: number }[];
}
export interface AgendaFile { town: string; body: number; since: string; read: string; source: string; meetings: number; scanned: string[]; noAgenda: string[]; projects: AgendaCase[] }

const FILES: Record<string, AgendaFile> = { Providence: PROVIDENCE as AgendaFile };
export const agendaOf = (town: string): AgendaFile | undefined => (FILES[town]?.projects.length ? FILES[town] : undefined);

const digits = (s: string) => (s.match(/\d+/g) ?? []).join(" ");
const street = (s: string) => s.toLowerCase().replace(/[–-]\d+/, "").replace(/\b(street|st|avenue|ave|road|rd|place|pl)\b\.?/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

/** The recorded project this case became, matched by plat and lot or by street address. */
export function readInto(town: string, c: AgendaCase): Precedent | undefined {
  return historyFor(town).find((h) => (c.lot && h.lot && digits(h.lot).startsWith(digits(c.lot))) || street(h.addr).startsWith(street(c.address)) || street(c.address).startsWith(street(h.addr)));
}

export type CaseKind = "homes" | "commercial" | "subdivision" | "plan" | "other";
/** What a case is, from its headings and description: homes where it gives a number of homes, and so on. */
export function kindOf(c: AgendaCase): CaseKind {
  const text = c.meetings.map((m) => `${m.heading} ${m.what}`).join(" ").toLowerCase();
  if (c.units) return "homes";
  if (/subdivi/.test(text) && !/land development/.test(text)) return "subdivision";
  if (/master plan|institutional|comprehensive plan|zone change|rezon|amendment/.test(text) && !/land development/.test(text)) return "plan";
  if (/land development|development plan|square feet|sf\b|commercial|retail|office|hotel|industrial|laboratory/.test(text)) return "commercial";
  return "other";
}
export const KIND_WORD: Record<CaseKind, string> = { homes: "homes", commercial: "other development", subdivision: "subdivision", plan: "plan or rezoning", other: "other" };
