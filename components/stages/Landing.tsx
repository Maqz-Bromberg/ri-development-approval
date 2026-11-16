"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { KINDS, KIND_ORDER } from "@/lib/data/kinds";
import { fromFile } from "@/lib/share";
import { onSitesChanged, readRecent, readSites, type SavedSite } from "@/lib/savedSites";
import { STAGES } from "@/lib/stages";
import { Icon } from "../Icon";
import { useProject } from "../ProjectProvider";
import { useTrial } from "../Trial";
import { useSetTown } from "../TownPicker";
import { ZoningMap } from "../ZoningMap";

/*
 * The landing: it leads to choosing a site. Three designs are on trial (ARD D42, trial c) and each keeps the same parts: find a site,
 * open a project file, recent and saved sites, the example, and the coverage line. The disclaimer is the shell's strip and footer.
 */

function useStart() {
  const router = useRouter();
  const { importState, openExample } = useProject();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  return {
    msg,
    find: (q: string) => router.push(q.trim().length >= 4 ? `/site?address=${encodeURIComponent(q.trim())}` : "/site"),
    example: () => { openExample(); router.push("/site"); },
    pick: () => file.current?.click(),
    load: (s: SavedSite) => { importState(s.project, "browser"); router.push("/site"); },
    input: (
      <input ref={file} type="file" accept=".json,application/json" hidden onChange={async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const next = fromFile(await f.text());
        if (next) { importState(next); router.push("/site"); } else setMsg("That file isn't a project file from this site.");
        e.target.value = "";
      }} />
    ),
  };
}

function FindBox({ onFind }: { onFind: (q: string) => void }) {
  const [q, setQ] = useState("");
  return (
    <form className="lookup-form" onSubmit={(e) => { e.preventDefault(); onFind(q); }}>
      <label htmlFor="start-address" className="sr-only">Street address</label>
      <input id="start-address" type="text" value={q} placeholder="45 Broad Street, Cumberland" autoComplete="street-address" onChange={(e) => setQ(e.target.value)} />
      <button type="submit" className="btn"><Icon name="search" size={16} /> Look up</button>
    </form>
  );
}

function Sites({ onLoad }: { onLoad: (s: SavedSite) => void }) {
  const { hydrated } = useProject();
  const [saved, setSaved] = useState<SavedSite[]>([]);
  const [recent, setRecent] = useState<SavedSite[]>([]);
  useEffect(() => {
    if (!hydrated) return;
    const r = () => { setSaved(readSites()); setRecent(readRecent()); };
    r();
    return onSitesChanged(r);
  }, [hydrated]);
  const ago = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const List = ({ items, title }: { items: SavedSite[]; title: string }) => items.length ? (
    <div>
      <h3>{title}</h3>
      <ul className="site-list">{items.map((s) => <li key={s.id}><button type="button" onClick={() => onLoad(s)}><b>{s.name}</b><small>{ago(s.at)}</small></button></li>)}</ul>
    </div>
  ) : null;
  return (
    <div className="landing-sites" aria-label="Recent and saved sites">
      <List items={saved} title="Saved sites" />
      <List items={recent} title="Recent projects" />
      {!saved.length && !recent.length && <p className="small muted">Sites you save, and the last five you work on, are listed here.</p>}
      <p className="small muted">This browser only. A project file moves one to another device.</p>
    </div>
  );
}

function Actions({ s }: { s: ReturnType<typeof useStart> }) {
  return (
    <p className="landing-acts">
      <button type="button" className="btn ghost" onClick={s.pick}><Icon name="folder" size={16} /> Open a project file</button>
      <button type="button" className="btn ghost" onClick={s.example}>Open the example</button>
      <span className="small muted">A site specification document will be readable here later.</span>
      {s.msg && <span className="small" role="status">{s.msg}</span>}
      {s.input}
    </p>
  );
}

function Coverage() {
  return <p className="small muted landing-cov">All 39 towns run on state law and the Zoning Atlas. Cumberland is read in full, and Providence is a trial reading the city has not confirmed. <Link href="/towns">What has been read, town by town</Link></p>;
}

function Meet() {
  return (
    <section className="landing-meet" aria-labelledby="meet-h">
      <h2 id="meet-h">Who you&apos;ll meet</h2>
      <ul>{KIND_ORDER.map((k) => <li key={k} className={`k-${k}`}><Icon name={KINDS[k].icon} size={20} /><b>{KINDS[k].label}</b> <small>{KINDS[k].mode}</small><p>{KINDS[k].desc}</p></li>)}</ul>
    </section>
  );
}

function Five() {
  return (
    <section className="landing-stages" aria-labelledby="five-h">
      <h2 id="five-h">Five stages</h2>
      <ol>{STAGES.map((st) => <li key={st.id} className={st.wash}><span className="ic"><Icon name={st.icon} size={20} /></span><span><b>{st.label}</b><small>{st.lead}</small></span></li>)}</ol>
    </section>
  );
}

function MapFirst({ s }: { s: ReturnType<typeof useStart> }) {
  const setTown = useSetTown();
  const router = useRouter();
  return (
    <div className="landing-map">
      <div className="lm-map">
        <ZoningMap placement="site" startStatewide onTown={(name) => { setTown(name); router.push("/site"); }} onPick={() => router.push("/site")} />
        <div className="lm-over panel"><h1>Where is your site?</h1><FindBox onFind={s.find} /></div>
      </div>
      <div className="lm-side"><Sites onLoad={s.load} /><Actions s={s} /></div>
    </div>
  );
}

export function Landing() {
  const trial = useTrial();
  const s = useStart();
  return (
    <div className={`landing-v landing-${trial.landing ?? "find"}`}>
      {trial.landing === "map" ? <MapFirst s={s} />
        : trial.landing === "three" ? (
          <>
            <header className="lv-head"><h1>Where is your site?</h1><p className="lede">Three ways in. Each ends at the same place: the facts for one site, and what they decide.</p></header>
            <div className="three">
              <section className="panel"><h2><Icon name="search" size={20} /> Look up an address</h2><p>Finds the district, the parcel, its area and utilities.</p><FindBox onFind={s.find} /></section>
              <section className="panel"><h2><Icon name="site" size={20} /> Pick on the map</h2><p>Choose the town on the statewide map, then click the parcel.</p><Link href="/site" className="btn">Open the map</Link></section>
              <section className="panel"><h2><Icon name="folder" size={20} /> Open a project file</h2><p>Carry on from a file saved earlier. Nothing is uploaded.</p><button type="button" className="btn" onClick={s.pick}>Choose a file</button>{s.input}{s.msg && <p className="small" role="status">{s.msg}</p>}</section>
            </div>
            <Sites onLoad={s.load} />
            <p className="landing-acts"><button type="button" className="btn ghost" onClick={s.example}>Open the example</button></p>
          </>
        ) : (
          <>
            <section className="lv-hero">
              <div>
                <p className="eyebrow">Rhode Island · building plan approval</p>
                <h1>From a set of plans to the keys in the door, one step at a time</h1>
                <p className="lede">Enter your site and see every approval it needs, who decides each one, and the forms to file. Every requirement links to the law that sets it.</p>
                <FindBox onFind={s.find} />
                <Actions s={s} />
              </div>
              <Sites onLoad={s.load} />
            </section>
            <Meet />
            <Five />
          </>
        )}
      <Coverage />
    </div>
  );
}
