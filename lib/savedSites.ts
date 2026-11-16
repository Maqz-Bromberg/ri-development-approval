import { projectLabel } from "./engine";
import { shortAddress } from "./lookup";
import type { Saved } from "./share";

/*
 * Sites saved in this browser (ARD D28) and the five most recent projects kept beside them. Local storage, not cookies:
 * a cookie holds about 4 KB and goes to a server with every request. The project file is still the way across devices (principle 5).
 */
const SITES_KEY = "ri-plan-approval:sites";
const RECENT_KEY = "ri-plan-approval:recent";
export const RECENT_MAX = 5;
const CHANGED = "ri-plan-approval:sites-changed";

export interface SavedSite {
  id: string;
  name: string;
  /** ISO time it was last saved */
  at: string;
  project: Saved;
}

function read(key: string): SavedSite[] {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as SavedSite[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, list: SavedSite[]): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
    window.dispatchEvent(new Event(CHANGED));
    return true;
  } catch {
    return false;
  }
}

export const readSites = () => read(SITES_KEY);
export const writeSites = (list: SavedSite[]) => write(SITES_KEY, list);
export const readRecent = () => read(RECENT_KEY);

/** Call `fn` when saved or recent sites change, in this tab or another. Returns the way to stop. */
export function onSitesChanged(fn: () => void): () => void {
  const other = (e: StorageEvent) => { if (e.key === SITES_KEY || e.key === RECENT_KEY) fn(); };
  window.addEventListener(CHANGED, fn);
  window.addEventListener("storage", other);
  return () => { window.removeEventListener(CHANGED, fn); window.removeEventListener("storage", other); };
}

/** A name for the site: its address, or its district and town, with the unit count. */
export function siteName(s: Saved): string {
  const i = s.inputs;
  const where = i.address ? shortAddress(i.address) : i.zone === "other" ? i.town : `${i.zone}, ${i.town}`;
  return `${where} · ${projectLabel(i)}`;
}

/** The same site, for updating rather than saving twice: the same point, or the same address and town. */
export function sameSite(a: Saved, b: Saved): boolean {
  if (a.inputs.lat != null && b.inputs.lat != null) return a.inputs.lat === b.inputs.lat && a.inputs.lon === b.inputs.lon;
  if (a.inputs.address && a.inputs.address === b.inputs.address && a.inputs.town === b.inputs.town) return true;
  return !a.inputs.address && !b.inputs.address && a.inputs.town === b.inputs.town && a.inputs.zone === b.inputs.zone && a.inputs.lot === b.inputs.lot && a.inputs.lat == null && b.inputs.lat == null;
}

/** Save the project under its address, replacing the earlier copy of the same site (ARD D42). Returns false if the browser refuses. */
export function saveSite(project: Saved): boolean {
  const list = readSites();
  const current = list.find((x) => sameSite(x.project, project));
  const entry: SavedSite = { id: current?.id ?? `${Date.now()}`, name: siteName(project), at: new Date().toISOString(), project };
  return writeSites(current ? list.map((x) => (x.id === current.id ? entry : x)) : [entry, ...list]);
}

/** Keep the project on screen among the recent ones, newest first. */
export function touchRecent(project: Saved): void {
  const list = readRecent();
  const rest = list.filter((x) => !sameSite(x.project, project));
  write(RECENT_KEY, [{ id: `${Date.now()}`, name: siteName(project), at: new Date().toISOString(), project }, ...rest].slice(0, RECENT_MAX));
}

/** What differs between the project on screen and its saved copy, in a few words each. */
export function unsavedChanges(now: Saved, was: Saved | undefined): string[] {
  if (!was) return ["Not saved yet"];
  const out: string[] = [];
  const a = now.inputs, b = was.inputs;
  if (a.lat !== b.lat || a.lon !== b.lon || a.parcel !== b.parcel || a.address !== b.address) out.push("The parcel");
  const facts = (Object.keys(a) as (keyof typeof a)[]).filter((k) => !["lat", "lon", "parcel", "address"].includes(k) && JSON.stringify(a[k]) !== JSON.stringify(b[k]));
  if (facts.length) out.push(`${facts.length} site fact${facts.length > 1 ? "s" : ""}`);
  if (now.override !== was.override) out.push("The route");
  const ticks = (m: Record<string, boolean>) => Object.keys(m).filter((k) => m[k]).sort().join("|");
  if (ticks(now.checked) !== ticks(was.checked)) out.push("Considerations ticked");
  const notes = (m: Record<string, string>) => JSON.stringify(Object.entries(m).filter(([, v]) => v.trim()).sort());
  if (notes(now.notes) !== notes(was.notes)) out.push("Notes");
  if (JSON.stringify(now.pins ?? []) !== JSON.stringify(was.pins ?? [])) out.push("Pins");
  if (JSON.stringify(now.hearing ?? []) !== JSON.stringify(was.hearing ?? [])) out.push("The hearing sheet");
  return out;
}
