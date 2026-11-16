import { DEFAULT_INPUTS, normalizeInputs } from "./engine";
import type { Pin, ProjectInputs, TreeId } from "./types";

/** Everything a project carries: the facts entered, the route override, ticked considerations and notes. */
export interface Saved {
  inputs: ProjectInputs;
  override: TreeId | "auto";
  checked: Record<string, boolean>;
  /** Free-text notes, keyed "tree/step" */
  notes: Record<string, string>;
  /** Questions picked for the hearing sheet, by objection id */
  hearing?: string[];
  /** Things pinned in the tray (ARD D42) */
  pins?: Pin[];
}

interface Packed {
  v: 1;
  i: Partial<ProjectInputs>;
  o: TreeId | "auto";
  c: string[];
  n: Record<string, string>;
  /** Hearing sheet picks. Optional, so links made before it was added still open. */
  h?: string[];
  /** Pins, as [id, type, resolved, at]. Optional, so older links still open. */
  k?: [string, Pin["type"], 0 | 1, string][];
}

function pack(s: Saved): Packed {
  // Only the inputs that differ from the example, so links stay short.
  const i: Record<string, unknown> = {};
  (Object.keys(s.inputs) as (keyof ProjectInputs)[]).forEach((k) => { if (s.inputs[k] !== DEFAULT_INPUTS[k]) i[k] = s.inputs[k]; });
  const n: Record<string, string> = {};
  Object.entries(s.notes).forEach(([k, v]) => { if (v.trim()) n[k] = v; });
  return { v: 1, i: i as Partial<ProjectInputs>, o: s.override, c: Object.keys(s.checked).filter((k) => s.checked[k]), n, ...(s.hearing?.length ? { h: s.hearing } : {}), ...(s.pins?.length ? { k: s.pins.map((p) => [p.id, p.type, p.resolved ? 1 : 0, p.at] as [string, Pin["type"], 0 | 1, string]) } : {}) };
}

function unpack(p: Packed): Saved {
  return {
    inputs: normalizeInputs(p.i),
    override: p.o ?? "auto",
    checked: Object.fromEntries((p.c ?? []).map((k) => [k, true])),
    notes: p.n ?? {},
    hearing: p.h ?? [],
    pins: (p.k ?? []).map(([id, type, r, at]) => ({ id, type, ...(r ? { resolved: true } : {}), at })),
  };
}

function toBase64Url(text: string): string {
  let bin = "";
  new TextEncoder().encode(text).forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** The project as a URL fragment value. Nothing is sent to a server: the state lives in the link itself. */
export function encodeState(s: Saved): string {
  return toBase64Url(JSON.stringify(pack(s)));
}

export function decodeState(token: string): Saved | null {
  try {
    const p = JSON.parse(fromBase64Url(token)) as Packed;
    return p && p.v === 1 ? unpack(p) : null;
  } catch {
    return null;
  }
}

/** A project file for download, readable by a person as well as by the import button. */
export function toFile(s: Saved): string {
  return JSON.stringify({ app: "ri-plan-approval", ...pack(s), saved: new Date().toISOString() }, null, 2);
}

export function fromFile(text: string): Saved | null {
  try {
    const p = JSON.parse(text) as Packed & { app?: string };
    return p && p.app === "ri-plan-approval" && p.v === 1 ? unpack(p) : null;
  } catch {
    return null;
  }
}

export const SHARE_PARAM = "p";

/** Read a shared project from a "#p=..." fragment. */
export function readShareHash(hash: string): Saved | null {
  const m = new RegExp(`[#&]${SHARE_PARAM}=([A-Za-z0-9_-]+)`).exec(hash);
  return m ? decodeState(m[1]) : null;
}
