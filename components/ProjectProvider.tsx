"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_INPUTS, classify, deriveFlags, itemKey, stepsFor, visibleDocs, type NumberedStep } from "@/lib/engine";
import { isoDay } from "@/lib/schedule";
import { readShareHash, type Saved } from "@/lib/share";
import type { Flags, ProjectInputs, TreeId } from "@/lib/types";

const STORE_KEY = "ri-plan-approval:v1";

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
  /** The whole project, for share links, export files and the summary */
  saved: Saved;
  /** Replace the project with an imported or shared one */
  importState: (s: Saved) => void;
  /** Where the project on screen came from */
  origin: "example" | "browser" | "link" | "file";
  /** False until saved progress has been restored after mount */
  hydrated: boolean;
  progress: (step: NumberedStep) => { done: number; total: number };
  /** Index into steps of the first step with unchecked items (the walker's position) */
  current: number;
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
  const [origin, setOrigin] = useState<ProjectState["origin"]>("example");
  const [hydrated, setHydrated] = useState(false);

  // Restore saved progress after mount so server and client first render match.
  useEffect(() => {
    // A project in the link wins over the one saved in this browser.
    const shared = readShareHash(window.location.hash);
    const s = shared ?? load();
    if (s.inputs) setInputs({ ...DEFAULT_INPUTS, ...s.inputs });
    else setInputs((prev) => ({ ...prev, startDate: nextMonday() }));
    if (s.override) setOverride(s.override);
    if (s.checked) setChecked(s.checked);
    if (s.notes) setNotes(s.notes);
    setOrigin(shared ? "link" : s.inputs ? "browser" : "example");
    if (shared) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ inputs, override, checked, notes } satisfies Saved));
    } catch {
      /* storage unavailable: progress lasts for this visit only */
    }
  }, [inputs, override, checked, notes, hydrated]);

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
      resetInputs: () => { setInputs({ ...DEFAULT_INPUTS, startDate: nextMonday() }); setOverride("auto"); setOrigin("example"); },
      override, setOverride, auto, tree, flags, steps, checked,
      toggle: (key) => setChecked((prev) => ({ ...prev, [key]: !prev[key] })),
      clearChecks: () => setChecked({}),
      notes,
      setNote: (stepId, text) => setNotes((prev) => ({ ...prev, [`${tree}/${stepId}`]: text })),
      saved: { inputs, override, checked, notes },
      importState: (next) => { setInputs({ ...DEFAULT_INPUTS, ...next.inputs }); setOverride(next.override); setChecked(next.checked); setNotes(next.notes); setOrigin("file"); },
      origin, hydrated,
      progress, current,
    };
  }, [inputs, override, checked, notes, origin, hydrated, setInput]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProject(): ProjectState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useProject must be used inside ProjectProvider");
  return v;
}
