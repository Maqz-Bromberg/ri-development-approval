"use client";

import { useId, useMemo, useState } from "react";
import { LEVELS, TOWNS } from "@/lib/data/towns";
import { FactMark } from "./FactCheck";
import { Info } from "./Info";
import { useProject } from "./ProjectProvider";
import { useLookedUp } from "./useLookedUp";

/** Change the project's town, clearing what belonged to the old one. Shared by the list and the map. */
export function useSetTown() {
  const { inputs, setInput } = useProject();
  return (name: string) => {
    if (name === inputs.town) return;
    setInput("town", name);
    setInput("zone", "other");
    setInput("overlays", []);
    setInput("lat", undefined);
    setInput("lon", undefined);
    setInput("address", "");
    setInput("parcel", "");
  };
}

/** The municipality: type to filter the 39, each with how much of it this site has read. The map beside does the same by click. */
export function TownPicker() {
  const { inputs, origin } = useProject();
  const setTown = useSetTown();
  const look = useLookedUp();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return TOWNS;
    // Towns whose name starts with the text first, then names containing it, then towns in a county that matches.
    const rank = (x: (typeof TOWNS)[number]) => {
      const n = x.name.toLowerCase();
      return n.startsWith(t) ? 0 : n.includes(t) ? 1 : `${x.county} county`.toLowerCase().includes(t) ? 2 : 3;
    };
    return TOWNS.filter((x) => rank(x) < 3).sort((a, b) => rank(a) - rank(b));
  }, [q]);
  const pick = (name: string) => { setTown(name); setQ(""); setOpen(false); };
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, matches.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (matches[active]) pick(matches[active].name); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="field tp">
      <div className="zp-label">
        <label htmlFor="f-muni">Municipality</label>
        <Info id="town" />
        {look.status === "ready" && look.data.facts.town === inputs.town && <FactMark id="town" label="Municipality" said={`The zoning district at the site is ${inputs.town}'s, on the Zoning Atlas.`} />}
      </div>
      <div className="zp-search">
        <input
          id="f-muni" type="text" role="combobox" autoComplete="off"
          aria-expanded={open} aria-controls={listId} aria-autocomplete="list"
          aria-activedescendant={open && matches[active] ? `${listId}-${active}` : undefined}
          placeholder={origin === "example" ? "Search the 39 cities and towns" : `${inputs.town}: type to change`}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKey}
        />
        {open && (
          <ul className="zp-list" id={listId} role="listbox" aria-label="Rhode Island municipalities">
            {matches.length ? matches.map((t, i) => (
              <li
                key={t.name} id={`${listId}-${i}`} role="option" aria-selected={i === active}
                className={`${i === active ? "is-active" : ""}${t.name === inputs.town ? " is-current" : ""}`}
                onMouseDown={(e) => { e.preventDefault(); pick(t.name); }}
                onMouseEnter={() => setActive(i)}
              >
                <span className={`tp-level l${t.level}`} aria-hidden="true">{t.level}</span>
                <span className="zp-opt"><b>{t.name}</b> <span className="muted small">{t.county} County</span></span>
                <span className="small muted">{LEVELS[t.level].name}{t.trial ? " · trial" : ""}{t.part ? ` · ${t.part.name} level ${t.part.level}` : ""}</span>
              </li>
            )) : <li className="zp-none" role="option" aria-selected={false}>No Rhode Island municipality matches.</li>}
          </ul>
        )}
      </div>
      <p className="tp-now small">
        {origin === "example"
          ? <>The example is in <b>{inputs.town}</b>. Search, or click a town on the map.</>
          : <>Now: <b>{inputs.town}</b>, read to level {TOWNS.find((t) => t.name === inputs.town)?.level ?? 1} ({LEVELS[TOWNS.find((t) => t.name === inputs.town)?.level ?? 1].name.toLowerCase()}).</>}
      </p>
    </div>
  );
}
