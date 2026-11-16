"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TREE_ORDER } from "@/lib/data/trees";
import { routeText } from "@/lib/engine";
import { useProject } from "./ProjectProvider";

/** The route, which opens to the five: the one the facts pick is outlined in green, and choosing another overrides it. */
export function RouteMenu() {
  const { tree, auto, override, setOverride } = useProject();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", key); };
  }, [open]);
  return (
    <div className="rm" ref={box}>
      <button type="button" className="ps-fact rm-btn" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen(!open)} title="Swap the route">
        {routeText(tree).name} <span className="rm-caret" aria-hidden="true">▾</span>
      </button>
      {override !== "auto" && <span className="rm-hand">chosen by hand</span>}
      {open && (
        <ul className="rm-list" role="menu" aria-label="Approval routes">
          {TREE_ORDER.map((k) => {
            const t = routeText(k);
            return (
              <li key={k} role="none">
                <button
                  type="button" role="menuitemradio" aria-checked={k === tree}
                  className={`rm-item${k === auto ? " is-auto" : ""}${k === tree ? " is-on" : ""}`}
                  onClick={() => { setOverride(k === auto ? "auto" : k); setOpen(false); }}
                >
                  <b>{t.name}{k === tree && <span className="rm-tick" aria-hidden="true"> ✓</span>}</b>
                  <span>{t.rule}</span>
                  {k === auto && <span className="rm-auto">Set by your facts</span>}
                </button>
              </li>
            );
          })}
          <li role="none" className="rm-foot"><Link href="/site#routes" onClick={() => setOpen(false)}>What the five routes are for</Link></li>
        </ul>
      )}
    </div>
  );
}

