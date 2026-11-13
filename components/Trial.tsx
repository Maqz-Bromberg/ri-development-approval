"use client";

import { createContext, useContext, useEffect, useState } from "react";

/*
 * Design variants to compare while developing. The panel only renders under `next dev`;
 * the published site always uses DEFAULTS. Add a variant here, read it with useTrial(),
 * and delete the losing branch once a choice is made.
 */
const VARIANTS = {
  routeLayout: {
    label: "Approval steps layout",
    options: { consolidated: "Consolidated rows", classic: "Flowchart + step sheets" },
  },
  considerations: {
    label: "Considerations",
    options: { tick: "Tickable", read: "Read-only list" },
  },
  headings: {
    label: "Working-page headings",
    options: { sans: "Nunito Sans", fredoka: "Fredoka" },
  },
  checkLayout: {
    label: "Check page",
    options: { side: "Answer beside the facts", top: "Verdict above the form (old)", findings: "Findings only (old)" },
  },
} as const;

type Key = keyof typeof VARIANTS;
export type TrialState = { [K in Key]: keyof (typeof VARIANTS)[K]["options"] };

const DEFAULTS: TrialState = { routeLayout: "consolidated", considerations: "tick", headings: "sans", checkLayout: "side" };
const STORE = "ri-plan-approval:trial";
const DEV = process.env.NODE_ENV === "development";

const Ctx = createContext<TrialState>(DEFAULTS);

export function useTrial(): TrialState {
  return useContext(Ctx);
}

export function TrialProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TrialState>(DEFAULTS);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!DEV) return;
    try {
      const raw = window.localStorage.getItem(STORE);
      if (raw) setState({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<TrialState>) });
    } catch { /* keep the defaults */ }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.head = state.headings;
    if (!DEV) return;
    try { window.localStorage.setItem(STORE, JSON.stringify(state)); } catch { /* not saved */ }
  }, [state]);

  const changed = (Object.keys(DEFAULTS) as Key[]).filter((k) => state[k] !== DEFAULTS[k]).length;

  return (
    <Ctx.Provider value={state}>
      {children}
      {DEV && (
        <aside className={`trial${open ? " is-open" : ""}`} aria-label="Design trial panel (development only)">
          <button type="button" className="trial-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
            Trial{changed ? ` · ${changed} changed` : ""}
          </button>
          {open && (
            <div className="trial-body">
              <p className="trial-note">Development only. The published site uses the first option of each.</p>
              {(Object.keys(VARIANTS) as Key[]).map((k) => (
                <fieldset key={k}>
                  <legend>{VARIANTS[k].label}</legend>
                  {Object.entries(VARIANTS[k].options).map(([value, label]) => (
                    <label key={value}>
                      <input type="radio" name={`trial-${k}`} checked={state[k] === value} onChange={() => setState((s) => ({ ...s, [k]: value }))} />
                      {label}
                    </label>
                  ))}
                </fieldset>
              ))}
              <button type="button" className="link-btn" onClick={() => setState(DEFAULTS)}>Reset to published defaults</button>
            </div>
          )}
        </aside>
      )}
    </Ctx.Provider>
  );
}
