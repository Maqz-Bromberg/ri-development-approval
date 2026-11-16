"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_TRIAL, PAGE_NAMES, VARIANTS, type TrialKey, type TrialState } from "@/lib/trials";

/*
 * The trial panel. The variants live in lib/trials.ts. The panel renders only under `next dev`, and only on a page
 * a variant names; the published site always uses the first option of each. Read a choice with useTrial().
 */
export type { TrialState };

const STORE = "ri-plan-approval:trial";
const DEV = process.env.NODE_ENV === "development";

const Ctx = createContext<TrialState>(DEFAULT_TRIAL);

export function useTrial(): TrialState {
  return useContext(Ctx);
}

export function TrialProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TrialState>(DEFAULT_TRIAL);
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => {
    if (!DEV) return;
    try {
      const raw = window.localStorage.getItem(STORE);
      if (raw) setState({ ...DEFAULT_TRIAL, ...(JSON.parse(raw) as TrialState) });
    } catch { /* keep the defaults */ }
  }, []);

  // Saved when a choice is made, not by an effect on the state: an effect would also run on mount (twice in
  // development) and write the defaults over the stored choice before it was read back.
  const choose = (fn: (s: TrialState) => TrialState) => setState((s) => {
    const next = fn(s);
    try { window.localStorage.setItem(STORE, JSON.stringify(next)); } catch { /* not saved */ }
    return next;
  });

  // The type trial sets an attribute on the page, which the stylesheet reads.
  useEffect(() => {
    if (DEV) document.documentElement.dataset.type = state.type ?? "bitter";
  }, [state.type]);

  const here = (Object.keys(VARIANTS) as TrialKey[]).filter((k) => (VARIANTS[k].pages as readonly string[]).includes(path));
  const changed = here.filter((k) => state[k] !== DEFAULT_TRIAL[k]).length;

  return (
    <Ctx.Provider value={state}>
      {children}
      {DEV && here.length > 0 && (
        <aside className={`trial${open ? " is-open" : ""}`} aria-label="Design trial panel (development only)">
          <button type="button" className="trial-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
            Trial · {PAGE_NAMES[path] ?? path}{changed ? ` · ${changed} changed` : ""}
          </button>
          {open && (
            <div className="trial-body">
              <p className="trial-note">Development only. The published site uses the first option of each. Every active trial is listed on <Link href="/dev#trials">Dev notes</Link>.</p>
              {here.map((k) => (
                <fieldset key={k}>
                  <legend>{VARIANTS[k].label}</legend>
                  {Object.entries(VARIANTS[k].options).map(([value, label]) => (
                    <label key={value}>
                      <input type="radio" name={`trial-${k}`} checked={state[k] === value} onChange={() => choose((s) => ({ ...s, [k]: value }))} />
                      {label}
                    </label>
                  ))}
                </fieldset>
              ))}
              <button type="button" className="link-btn" onClick={() => choose((s) => ({ ...s, ...Object.fromEntries(here.map((k) => [k, DEFAULT_TRIAL[k]])) }))}>Reset this page to the published choice</button>
            </div>
          )}
        </aside>
      )}
    </Ctx.Provider>
  );
}
