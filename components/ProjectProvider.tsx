"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_INPUTS, classify, normalizeInputs, deriveFlags, itemKey, stepsFor, visibleDocs, type NumberedStep } from "@/lib/engine";
import { districtsOf, fetchAtlasDistricts, registerDistricts } from "@/lib/data/atlas";
import { setActiveTown } from "@/lib/town";
import { isoDay } from "@/lib/schedule";
import { readShareHash, type Saved } from "@/lib/share";
import type { Flags, ProjectInputs, TreeId } from "@/lib/types";

const STORE_KEY = "ri-plan-approval:v1";
const ALT_KEY = "ri-plan-approval:alt";
/** Whether the project saved in this browser is still the untouched example, so a second visit doesn't call it the visitor's own. */
const ORIGIN_KEY = "ri-plan-approval:origin";

/** What was entered before an alternative was tried, so the visitor can always go back to it. */
export interface Entered {
  inputs: ProjectInputs;
  override: TreeId | "auto";
  /** The alternative being tried, in a few words */
  label: string;
}

/** The next Monday on or after today, so the example schedule never starts in the past. */
function nextMonday(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  d.setUTCDate(d.getUTCDate() + ((8 - d.getUTCDay()) % 7));
  return isoDay(d);
}

interface ProjectState {
  inputs: ProjectInputs;
  setInput: <K extends keyof ProjectInputs>(key: K, value: ProjectInputs[K]) => void;
  resetInputs: () => void;
  override: TreeId | "auto";
  setOverride: (t: TreeId | "auto") => void;
  auto: TreeId;
  tree: TreeId;
  flags: Flags;
  steps: NumberedStep[];
  checked: Record<string, boolean>;
  toggle: (key: string) => void;
  clearChecks: () => void;
  /** Free-text notes, keyed "tree/step" */
  notes: Record<string, string>;
  setNote: (stepId: string, text: string) => void;
  /** Questions picked for the hearing sheet, by objection id */
  hearing: string[];
  toggleHearing: (id: string) => void;
  /** The whole project, for share links, export files and the summary */
  saved: Saved;
  /** Replace the project with an imported, shared or saved one */
  importState: (s: Saved, from?: "file" | "browser") => void;
  /** Where the project on screen came from */
  origin: "example" | "browser" | "link" | "file";
  /** False until saved progress has been restored after mount */
  hydrated: boolean;
  progress: (step: NumberedStep) => { done: number; total: number };
  /** Index into steps of the first step with unchecked items (the walker's position) */
  current: number;
  /** Set while an alternative is being tried: the project as entered before it */
  entered: Entered | null;
  /** Try other facts in place of the entered ones, keeping the entered ones to return to */
  tryAlternative: (label: string, next: ProjectInputs) => void;
  /** Put back the project as entered */
  returnToEntered: () => void;
  /** Keep the alternative as the project, and forget the entered one */
  keepAlternative: () => void;
}

const Ctx = createContext<ProjectState | null>(null);

function load(): Partial<Saved> {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Partial<Saved>) : {};
  } catch {
    return {};
  }
}

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [inputs, setInputs] = useState<ProjectInputs>(DEFAULT_INPUTS);
  const [override, setOverride] = useState<TreeId | "auto">("auto");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [hearing, setHearing] = useState<string[]>([]);
  const [origin, setOrigin] = useState<ProjectState["origin"]>("example");
  const [hydrated, setHydrated] = useState(false);
  const [entered, setEntered] = useState<Entered | null>(null);
  // The engine reads the town of the project on screen. Set before anything below renders.
  setActiveTown(inputs.town);
  // Zoning districts of other towns come from the live Atlas layer; recompute once they arrive.
  const [districtsIn, setDistrictsIn] = useState(0);
  useEffect(() => {
    if (districtsOf(inputs.town)) return;
    let alive = true;
    fetchAtlasDistricts(inputs.town)
      .then((list) => { registerDistricts(inputs.town, list); if (alive) setDistrictsIn((n) => n + 1); })
      .catch(() => { registerDistricts(inputs.town, []); });
    return () => { alive = false; };
  }, [inputs.town]);

  // Restore saved progress after mount so server and client first render match.
  useEffect(() => {
    // A project in the link wins over the one saved in this browser.
    const shared = readShareHash(window.location.hash);
    const s = shared ?? load();
    if (s.inputs) setInputs(normalizeInputs(s.inputs));
    else setInputs((prev) => ({ ...prev, startDate: nextMonday() }));
    if (s.override) setOverride(s.override);
    if (s.checked) setChecked(s.checked);
    if (s.notes) setNotes(s.notes);
    if (s.hearing) setHearing(s.hearing);
    let savedOrigin: string | null = null;
    try { savedOrigin = window.localStorage.getItem(ORIGIN_KEY); } catch { /* none */ }
    setOrigin(shared ? "link" : s.inputs && savedOrigin !== "example" ? "browser" : "example");
    if (!shared) {
      try { const alt = window.localStorage.getItem(ALT_KEY); if (alt) setEntered(JSON.parse(alt) as Entered); } catch { /* none */ }
    }
    if (shared) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ inputs, override, checked, notes, hearing } satisfies Saved));
      window.localStorage.setItem(ORIGIN_KEY, origin === "example" ? "example" : "own");
    } catch {
      /* storage unavailable: progress lasts for this visit only */
    }
  }, [inputs, override, checked, notes, hearing, hydrated, origin]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (entered) window.localStorage.setItem(ALT_KEY, JSON.stringify(entered)); else window.localStorage.removeItem(ALT_KEY);
    } catch { /* storage unavailable */ }
  }, [entered, hydrated]);

  const setInput = useCallback(<K extends keyof ProjectInputs>(key: K, value: ProjectInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
    setOrigin((o) => (o === "example" ? "browser" : o));
  }, []);

  const value = useMemo<ProjectState>(() => {
    const auto = classify(inputs);
    const tree = override === "auto" ? auto : override;
    const flags = deriveFlags(inputs, tree);
    const steps = stepsFor(tree, flags);
    const progress = (step: NumberedStep) => {
      const docs = visibleDocs(step, flags);
      let done = 0, total = 0;
      docs.forEach((d) => d.checklist.forEach((_, i) => { total++; if (checked[itemKey(tree, step.id, d, i)]) done++; }));
      return { done, total };
    };
    const main = steps.map((s, i) => ({ s, i })).filter(({ s }) => !s.branch);
    const firstOpen = main.find(({ s }) => { const p = progress(s); return p.total === 0 || p.done < p.total; });
    const current = firstOpen ? firstOpen.i : main.length ? main[main.length - 1].i : 0;
    return {
      inputs, setInput,
      resetInputs: () => { setInputs({ ...DEFAULT_INPUTS, startDate: nextMonday() }); setOverride("auto"); setOrigin("example"); setEntered(null); },
      override, setOverride, auto, tree, flags, steps, checked,
      toggle: (key) => setChecked((prev) => ({ ...prev, [key]: !prev[key] })),
      clearChecks: () => setChecked({}),
      notes,
      setNote: (stepId, text) => setNotes((prev) => ({ ...prev, [`${tree}/${stepId}`]: text })),
      hearing,
      toggleHearing: (id) => setHearing((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      saved: { inputs, override, checked, notes, hearing },
      importState: (next, from = "file") => { setInputs(normalizeInputs(next.inputs)); setOverride(next.override); setChecked(next.checked); setNotes(next.notes); setHearing(next.hearing ?? []); setOrigin(from); setEntered(null); },
      origin, hydrated,
      progress, current,
      entered,
      tryAlternative: (label, next) => {
        // Trying a second alternative keeps the first entry to return to, not the first alternative.
        setEntered((e) => e ? { ...e, label } : { inputs, override, label });
        setInputs(next);
        setOverride("auto");
        setOrigin((o) => (o === "example" ? "browser" : o));
      },
      returnToEntered: () => {
        if (!entered) return;
        setInputs(entered.inputs);
        setOverride(entered.override);
        setEntered(null);
      },
      keepAlternative: () => setEntered(null),
    };
  }, [inputs, override, checked, notes, hearing, origin, hydrated, setInput, districtsIn, entered]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProject(): ProjectState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useProject must be used inside ProjectProvider");
  return v;
}
