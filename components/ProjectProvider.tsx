"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_INPUTS, classify, deriveFlags, itemKey, stepsFor, visibleDocs, type NumberedStep } from "@/lib/engine";
import type { Flags, ProjectInputs, TreeId } from "@/lib/types";

const STORE_KEY = "ri-plan-approval:v1";

interface Saved {
  inputs: ProjectInputs;
  override: TreeId | "auto";
  checked: Record<string, boolean>;
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
  const [hydrated, setHydrated] = useState(false);

  // Restore saved progress after mount so server and client first render match.
  useEffect(() => {
    const s = load();
    if (s.inputs) setInputs({ ...DEFAULT_INPUTS, ...s.inputs });
    if (s.override) setOverride(s.override);
    if (s.checked) setChecked(s.checked);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ inputs, override, checked } satisfies Saved));
    } catch {
      /* storage unavailable: progress lasts for this visit only */
    }
  }, [inputs, override, checked, hydrated]);

  const setInput = useCallback(<K extends keyof ProjectInputs>(key: K, value: ProjectInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
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
      resetInputs: () => { setInputs(DEFAULT_INPUTS); setOverride("auto"); },
      override, setOverride, auto, tree, flags, steps, checked,
      toggle: (key) => setChecked((prev) => ({ ...prev, [key]: !prev[key] })),
      clearChecks: () => setChecked({}),
      progress, current,
    };
  }, [inputs, override, checked, setInput]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProject(): ProjectState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useProject must be used inside ProjectProvider");
  return v;
}
