"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { stageOf } from "@/lib/stages";
import { useProject } from "../ProjectProvider";
import { useTrial } from "../Trial";
import { Strip, FullDisclaimer } from "./Disclaimer";
import { GateCard } from "./GateCard";
import { Header } from "./Header";
import { Rail } from "./Rail";
import { Tray } from "./Tray";

/**
 * The app shell for the five stages and the landing: a fixed header, a rail on the left, the stage in the middle (the only part
 * that scrolls) and a tray on the right, with a slim disclaimer strip under them (ARD D42). The widths are CSS media queries, so the
 * server and the browser draw the same first screen; only the rail and tray opened over the page are state here.
 */
export function StageShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const stage = stageOf(path);
  const landing = (path.replace(/\/$/, "") || "/") === "/";
  const { chosen, hydrated } = useProject();
  const trial = useTrial();
  const [rail, setRail] = useState(false);
  const [tray, setTray] = useState(false);
  const main = useRef<HTMLElement>(null);
  const scrolls = useRef(new Map<string, number>());

  // The browser keeps no scroll position for an inner column, so this keeps one per stage for the visit, and puts the focus
  // in the column so the arrow keys and Page Down scroll it.
  useLayoutEffect(() => {
    const el = main.current;
    if (!el) return;
    el.scrollTop = scrolls.current.get(path) ?? 0;
    setRail(false);
    setTray(false);
    el.focus({ preventScroll: true });
  }, [path]);

  // A link with a # (a deep link, or a share link read before the page drew) scrolls to its target inside the column.
  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id || id.startsWith("p=")) return;
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 120);
    return () => window.clearTimeout(t);
  }, [path]);

  const gated = !landing && stage && stage.id !== "site" && trial.gate === "gated" && hydrated && !chosen;

  return (
    <div className={`shell app ${stage?.wash ?? ""}${landing ? " pre" : ""}${rail ? " rail-open" : ""}${tray ? " tray-open" : ""}`}>
      <Header onOutline={landing ? undefined : () => setRail(!rail)} />
      <div className="body">
        <Rail open={rail} setOpen={setRail} />
        <main className="main" id="main" tabIndex={-1} ref={main} onScroll={(e) => scrolls.current.set(path, e.currentTarget.scrollTop)}>
          <div className="stage-in">{gated ? <GateCard /> : children}</div>
          <FullDisclaimer />
        </main>
        <Tray open={tray} setOpen={setTray} />
      </div>
      <Strip />
      {(rail || tray) && <button type="button" className="scrim" aria-label="Close" onClick={() => { setRail(false); setTray(false); }} />}
    </div>
  );
}
