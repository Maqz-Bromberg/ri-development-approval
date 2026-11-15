"use client";

import { shortAddress } from "@/lib/lookup";
import { projectLabel } from "@/lib/engine";
import { useEffect, useState } from "react";
import type { Saved } from "@/lib/share";
import { HoverCard } from "./Popover";
import { useProject } from "./ProjectProvider";

/*
 * Sites saved in this browser, any number of them: each is the whole project (facts, route, ticks, notes, hearing
 * picks) under a name, kept in local storage rather than a cookie, which would cap it at about 4 KB and send it to a
 * server with every page. Found again whenever the visitor comes back to Site selection. The project file is still the
 * way to move them to another device (ARD principle 5).
 */
const KEY = "ri-plan-approval:sites";

export interface SavedSite {
  id: string;
  name: string;
  /** ISO time it was last saved */
  at: string;
  project: Saved;
}

function read(): SavedSite[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedSite[]) : [];
  } catch {
    return [];
  }
}

function write(list: SavedSite[]): boolean {
  try { window.localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch { return false; }
}

/** A name for the site: its address, or its district and town, with the unit count. */
function siteName(s: Saved): string {
  const i = s.inputs;
  const where = i.address ? shortAddress(i.address) : i.zone === "other" ? i.town : `${i.zone}, ${i.town}`;
  return `${where} · ${projectLabel(i)}`;
}

/** The same site, for updating rather than saving twice: the same point, or the same address and town. */
function sameSite(a: Saved, b: Saved): boolean {
  if (a.inputs.lat != null && b.inputs.lat != null) return a.inputs.lat === b.inputs.lat && a.inputs.lon === b.inputs.lon;
  return !!a.inputs.address && a.inputs.address === b.inputs.address && a.inputs.town === b.inputs.town;
}

const ago = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function SavedSites() {
  const { saved, importState, origin, hydrated } = useProject();
  const [list, setList] = useState<SavedSite[]>([]);
  const [msg, setMsg] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  const [drop, setDrop] = useState<string | null>(null);
  useEffect(() => { if (hydrated) setList(read()); }, [hydrated]);

  const current = list.find((x) => sameSite(x.project, saved));
  const unchanged = current && JSON.stringify(current.project) === JSON.stringify(saved);

  const save = () => {
    const entry: SavedSite = { id: current?.id ?? `${Date.now()}`, name: siteName(saved), at: new Date().toISOString(), project: saved };
    const next = current ? list.map((x) => (x.id === current.id ? entry : x)) : [entry, ...list];
    if (write(next)) { setList(next); setMsg(current ? `Updated "${entry.name}".` : `Saved "${entry.name}".`); }
    else setMsg("This browser won't keep it (a private window, or storage is blocked). Download the project file instead.");
  };
  const load = (s: SavedSite) => { importState(s.project, "browser"); setConfirm(null); setMsg(`Loaded "${s.name}".`); };
  const remove = (id: string) => { const next = list.filter((x) => x.id !== id); write(next); setList(next); setDrop(null); };

  // Loading replaces the project on screen; ask first when that project is the visitor's own and not saved as it stands.
  const askLoad = (s: SavedSite) => (origin !== "example" && !unchanged ? setConfirm(s.id) : load(s));

  return (
    <div className="saved-sites" aria-label="Saved sites">
      <div className="ss-head">
        <button type="button" className="btn ghost ss-save" onClick={save} disabled={origin === "example" || !!unchanged}>
          {unchanged ? "Site saved ✓" : current ? "Update saved site" : "Save site"}
        </button>
        <HoverCard
          className="info-btn" label="About saving sites" width={320}
          card={<>
            <b className="pop-title">Saving a site</b>
            <p>Keeps this site and everything entered for it (the facts, the route, ticked considerations, notes and hearing picks) in this browser, under its address. Save as many as you like.</p>
            <p>Saved sites are listed here whenever you come back, to load again. They stay on this device only: to move one, or keep it safe, download the project file.</p>
          </>}
        >
          <span aria-hidden="true">i</span>
        </HoverCard>
        {origin === "example" && <span className="small muted">Enter your own site to save it.</span>}
        {list.length > 0 && <span className="small muted">{list.length} saved in this browser</span>}
      </div>
      {list.length > 0 && (
        <ul className="ss-list">
          {list.map((s) => (
            <li key={s.id} className={current?.id === s.id ? "is-current" : undefined}>
              <span className="ss-name"><b>{s.name}</b> <span className="small muted">saved {ago(s.at)}</span></span>
              {current?.id === s.id
                ? <span className="small ss-on">On screen</span>
                : <button type="button" className="link-btn" onClick={() => askLoad(s)}>Load</button>}
              {drop === s.id
                ? <><button type="button" className="link-btn ss-del" onClick={() => remove(s.id)}>Delete it</button><button type="button" className="link-btn" onClick={() => setDrop(null)}>Keep</button></>
                : <button type="button" className="link-btn ss-del" onClick={() => setDrop(s.id)} aria-label={`Delete ${s.name}`}>Delete</button>}
              {confirm === s.id && (
                <span className="ss-confirm small">
                  The project on screen isn&apos;t saved as it stands.{" "}
                  <button type="button" className="link-btn" onClick={() => { save(); load(s); }}>Save it, then load</button>{" · "}
                  <button type="button" className="link-btn" onClick={() => load(s)}>Load anyway</button>{" · "}
                  <button type="button" className="link-btn" onClick={() => setConfirm(null)}>Cancel</button>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="small muted" aria-live="polite">{msg}</p>
    </div>
  );
}
