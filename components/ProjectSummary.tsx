"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { townInfo } from "@/lib/data/towns";
import { TREE_ORDER } from "@/lib/data/trees";
import { KIND_LABEL, USE_LABEL, deciders, fmt, projectLabel, routeText, verdict } from "@/lib/engine";
import { ZONE_KIND, zoneKind } from "@/lib/map";
import { buildSchedule, fmtDate } from "@/lib/schedule";
import { AltBanner, Deciders } from "./Compare";
import { useProject } from "./ProjectProvider";
import { ORIGIN_LABEL } from "./Verdict";
import { useAtlas } from "./useAtlas";
import { ZoneIcon } from "./ZonePicker";

/*
 * The project, kept in view on the Check and Steps pages, so an answer is never read apart from the facts it rests on
 * (ARD principle 2). Its facts sit in four groups (site, building, services and constraints, route and who decides),
 * each fact linking to its field on Site selection, and the route opening to the five to swap between.
 * A panel on the left from 1200 px, in the left margin itself from 1900 px; narrower, a bar under the header with
 * the groups as columns. Decided after trial, 2026-11-14 (ARD D22).
 */

const STATE_LABEL = { fail: "Blocker", flag: "Open", pass: "Clear" } as const;
const months = (days: number) => Math.max(1, Math.round(days / 30.4));

function Fact({ field, children }: { field: string; children: React.ReactNode }) {
  return <Link href={`/site#${field}`} className="ps-fact" title="Change this on Site selection">{children}</Link>;
}

function useSummary() {
  const { inputs, tree, steps, flags } = useProject();
  const { districts } = useAtlas();
  const v = verdict(inputs, tree, steps);
  const plan = useMemo(() => buildSchedule(tree, steps, inputs.startDate, inputs.town), [tree, steps, inputs.startDate, inputs.town]);
  const approved = plan.find((p) => p.step.id === "record") ?? plan.find((p) => p.step.id === "final") ?? plan.find((p) => p.step.id === "zcheck");
  const state = v.fails.length ? "fail" : v.flags.length ? "flag" : "pass";
  const d = districts.find((x) => x.abbrvname === inputs.zone);
  return { v, state, approved, d, who: deciders(steps, flags) } as const;
}

/** The route, which opens to the five: the one the facts pick is outlined in green, and choosing another overrides it. */
function RouteMenu() {
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

function Groups({ layout }: { layout: "bar" | "side" }) {
  const { inputs, tree } = useProject();
  const { v, approved, d, who } = useSummary();
  const k = d ? zoneKind(d.type) : null;
  const s = inputs.units === 1 ? "" : "s";
  const constraints = [inputs.wet && "wetlands", inputs.dot && "state road access", inputs.transit && "near transit"].filter(Boolean) as string[];
  const util = inputs.water && inputs.sewer ? "Public water and sewer" : inputs.water ? "Public water, no sewer" : inputs.sewer ? "Public sewer, no water" : "No public water or sewer";

  return (
    <div className={`ps-groups ps-l-${layout}`}>
      <section className="ps-group" aria-label="Site">
        <h4>Site</h4>
        <p>
          <Fact field="f-zone">
            {k ? <span className="ps-zone" style={{ "--zk": ZONE_KIND[k].color } as React.CSSProperties}><ZoneIcon kind={k} size={15} />{inputs.zone}</span> : <span className="ps-zone none">No district</span>}
          </Fact>{" "}
          <Fact field="f-muni">{inputs.town}</Fact>
        </p>
        {d && <p className="ps-sub">{d.name}</p>}
        <p className="ps-sub">
          <Fact field="f-lot">{fmt(inputs.lot)} sq ft lot</Fact>
          {inputs.parcel && !/example|__/.test(inputs.parcel) && <> · <Fact field="f-parcel">{inputs.parcel}</Fact></>}
        </p>
      </section>
      <section className="ps-group" aria-label="Building">
        <h4>{KIND_LABEL[inputs.kind]}</h4>
        {inputs.kind === "commercial" ? (
          <>
            <p><Fact field="f-gfa">{projectLabel(inputs)}</Fact></p>
            <p className="ps-sub"><Fact field="f-use">{USE_LABEL[inputs.use]}</Fact></p>
          </>
        ) : (
          <>
            <p><Fact field="f-units">{inputs.type === "reuse" ? `${inputs.units} unit${s}, reused building` : `${inputs.units} new unit${s}`}</Fact></p>
            <p className="ps-sub">
              <Fact field="f-aff">{inputs.aff ? `${inputs.aff} affordable` : "none deed-restricted"}</Fact>
              {inputs.kind === "mixed" && <> · <Fact field="f-commercial">{fmt(inputs.commercial)} sq ft {USE_LABEL[inputs.use].split(" (")[0].toLowerCase()}</Fact></>}
            </p>
          </>
        )}
        {(inputs.conservation || inputs.rezone) && (
          <p className="ps-sub">
            {inputs.conservation && <Fact field="f-conservation">conservation development</Fact>}
            {inputs.conservation && inputs.rezone && " · "}
            {inputs.rezone && <Fact field="f-rezone">zone change sought</Fact>}
          </p>
        )}
      </section>
      <section className="ps-group" aria-label="Services and constraints">
        <h4>Services and constraints</h4>
        <p><Fact field="f-water">{util}</Fact></p>
        <p className="ps-sub">
          <Fact field="f-wet">{constraints.length ? constraints.join(", ") : "no wetlands, state road or transit marked"}</Fact>
          {" · "}<Fact field="f-dist">{inputs.dist} ac disturbed</Fact>
        </p>
        {v.statePermits.length > 0 && <p className="ps-sub">State permits: {v.statePermits.join(", ")}</p>}
      </section>
      <section className="ps-group" aria-label="Route and who decides">
        <h4>Route, and who decides</h4>
        <RouteMenu />
        <p className="ps-sub">
          {v.reviewDays ? `Town review up to ${months(v.reviewDays)} months` : "No statutory review clocks"}
          {approved ? ` · recorded about ${fmtDate(approved.end, { month: "short", year: "numeric" })}` : ""}
        </p>
        <Deciders ids={who} compact />
      </section>
    </div>
  );
}

function Head({ page }: { page: "check" | "steps" }) {
  const { inputs, origin } = useProject();
  const { v, state } = useSummary();
  const t = townInfo(inputs.town);
  return (
    <div className="ps-head">
      <p className="ps-title">
        {origin === "example" ? <span className="example-flag">{ORIGIN_LABEL.example}</span> : <b>{ORIGIN_LABEL[origin]}</b>}
        <span className="ps-addr">
          {inputs.address ? inputs.address : origin === "example" ? `sample facts in ${inputs.town}, not yours` : `${inputs.town}, no address`}
        </span>
        {t.trial && <span className="ps-trial small">{inputs.town}: trial reading</span>}
      </p>
      <div className="ps-acts">
        <Link href="/project#answer" className={`st ${state} ps-status`} title="Go to the findings">
          {STATE_LABEL[state]}{v.fails.length + v.flags.length ? ` · ${v.fails.length + v.flags.length}` : ""}
        </Link>
        <Link href="/site" className="btn ps-edit">{origin === "example" ? "Enter your site" : "Edit on Site selection"}</Link>
        {page === "check" ? <Link href="/steps" className="link-btn small">Steps →</Link> : <Link href="/project" className="link-btn small">Check →</Link>}
      </div>
    </div>
  );
}

/** The bar: the head on one line, the groups as columns beneath. On a phone the groups fold behind "Details". */
function Bar({ page, hideWide }: { page: "check" | "steps"; hideWide: boolean }) {
  const { state } = useSummary();
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  // Sticky rows below the bar (the Steps page's key) sit under it, whatever its height.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty("--summary-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => { ro.disconnect(); document.documentElement.style.removeProperty("--summary-h"); };
  }, []);
  return (
    <div ref={ref} className={`ps-bar v-${state}${hideWide ? " hide-wide" : ""}${more ? " is-more" : ""}`} role="region" aria-label="The project and its status">
      <Head page={page} />
      <button type="button" className="link-btn ps-more" aria-expanded={more} onClick={() => setMore(!more)}>{more ? "Fewer details" : "Details"}</button>
      <Groups layout="bar" />
    </div>
  );
}

/** The project summary and the page beside (wide screens) or below it. */
export function ProjectFrame({ page, children }: { page: "check" | "steps"; children: React.ReactNode }) {
  const { state } = useSummary();
  return (
    <>
      <Bar page={page} hideWide />
      <div className="with-side">
        <aside className={`ps-side v-${state}`} aria-label="The project and its status">
          <Head page={page} />
          <Groups layout="side" />
        </aside>
        <div className="ws-main">
          <AltBanner />
          {children}
        </div>
      </div>
    </>
  );
}
