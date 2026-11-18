"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CONTACTS } from "@/lib/data/contacts";
import { KINDS } from "@/lib/data/kinds";
import { townInfo, LEVELS } from "@/lib/data/towns";
import { condOK, fmt, projectLabel, routeText } from "@/lib/engine";
import { sortedFindings } from "@/lib/findings";
import { goTo } from "@/lib/goTo";
import { stageOf } from "@/lib/stages";
import { Icon } from "../Icon";
import { useProject } from "../ProjectProvider";
import { useCalendarFile } from "../useCalendarFile";
import { useStageFacts } from "../useStages";

const STATE = { fail: "Blocker", flag: "Open", pass: "Clear" } as const;

/** Go to a fact's field on Site, from any stage. On Site it scrolls in place. */
function useGoToField() {
  const path = usePathname();
  const router = useRouter();
  return (field: string) => {
    if (path.replace(/\/$/, "") === "/site") { goTo(field, { focus: true }); return; }
    router.push("/site");
    window.setTimeout(() => goTo(field, { focus: true }), 400);
  };
}

/** The site card: the address and its facts, each linking to its field, with the verdict in one line (replaces the project panel, D22). */
function SiteCard() {
  const { inputs, tree, origin } = useProject();
  const { v, standing, approved, place } = useStageFacts();
  const field = useGoToField();
  const t = townInfo(inputs.town);
  const lv = LEVELS[t.level];
  const F = ({ f, children }: { f: string; children: React.ReactNode }) => <button type="button" onClick={() => field(f)} title="Change this on Site">{children}</button>;
  return (
    <div className={`sitecard v-${standing}`}>
      {origin === "example" && <p className="ex-line"><span className="example-flag">Example project</span></p>}
      <p className="addr"><Icon name="site" size={18} /><span>{inputs.address ? place : `${inputs.town}, no address`}</span></p>
      <dl>
        <dt>Town</dt><dd><F f="f-muni">{inputs.town}</F></dd>
        {inputs.parcel && !/example|__/.test(inputs.parcel) && <><dt>Plat and lot</dt><dd><F f="f-parcel">{inputs.parcel}</F></dd></>}
        <dt>District</dt><dd><F f="f-zone">{inputs.zone === "other" ? "not chosen" : inputs.zone}</F></dd>
        <dt>Lot</dt><dd><F f="f-lot">{fmt(inputs.lot)} sq ft</F></dd>
        <dt>Project</dt><dd><F f={inputs.kind === "commercial" ? "f-gfa" : "f-units"}>{projectLabel(inputs)}</F></dd>
        <dt>Route</dt><dd>{routeText(tree).name}</dd>
        {approved && <><dt>Recorded</dt><dd>about {approved.end.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}</dd></>}
      </dl>
      <p className="verd"><span className={`dot ${standing}`} aria-hidden="true" /><b>{STATE[standing]}</b> <span>{v.fails.length + v.flags.length ? `${v.fails.length + v.flags.length} to settle` : "no blockers or open questions"}</span></p>
      <p className="cov small"><Link href="/towns">{t.name}: level {t.level} of 4, {lv.name.toLowerCase()}{t.trial ? " (trial)" : ""}</Link></p>
    </div>
  );
}

function Outline() {
  const path = usePathname();
  const stage = stageOf(path);
  const { inputs, tree, steps, flags, progress, hearing, setInput } = useProject();
  const downloadCalendar = useCalendarFile();
  if (!stage) return null;

  if (stage.id === "site") {
    const items = [["sg-where", "1", "Where"], ["sg-facts", "2", "Project and land"], ["sg-zone", "3", "District"], ["routes", "", "Route and alternatives"]];
    return <><h3>On this stage</h3><ul className="olist plain">{items.map(([id, n, l]) => <li key={id} className={n ? undefined : "after-rule"}><button type="button" onClick={() => goTo(id)}><span className="n">{n}</span><span>{l}</span></button></li>)}</ul></>;
  }
  if (stage.id === "law") {
    const list = sortedFindings(inputs, tree).filter((f) => f.st !== "pass");
    return (
      <>
        <h3>Findings</h3>
        <ul className="olist">
          {list.map((f) => <li key={f.id}><button type="button" onClick={() => goTo(`fd-${f.id}`)}><span className={`dot ${f.st === "fail" ? "fail" : f.st === "flag" ? "open" : "pass"}`} /><span>{f.t}</span></button></li>)}
        </ul>
        <button type="button" className="link-btn small" onClick={() => goTo("clocks")}>Statutory clocks</button>
      </>
    );
  }
  if (stage.id === "route") {
    return (
      <>
        <h3>Steps</h3>
        <ul className="olist">
          {steps.map((s) => {
            const p = progress(s);
            const kinds = Array.from(new Set(s.auth.filter((a) => condOK(a.cond, flags)).map((a) => CONTACTS[a.c]?.kind).filter(Boolean)));
            return (
              <li key={s.id} className={s.branch ? "branch" : undefined}>
                <button type="button" onClick={() => goTo(`d-${s.id}`)}>
                  <span className="n">{s.n}</span><span>{s.title}</span>
                  <span className="mini" title={`${p.done} of ${p.total} dealt with`}><i style={{ width: p.total ? `${(p.done / p.total) * 100}%` : 0 }} /></span>
                  <span className="kd">{kinds.map((k) => <i key={k} className={`k-${k}`} title={KINDS[k!].label} />)}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <h3>Kinds of body</h3>
        <ul className="legend">{(Object.keys(KINDS) as (keyof typeof KINDS)[]).map((k) => <li key={k} className={`k-${k}`}><Icon name={KINDS[k].icon} size={15} /> {KINDS[k].label} <small>{KINDS[k].mode}</small></li>)}</ul>
      </>
    );
  }
  if (stage.id === "cal") {
    return (
      <>
        <h3>Start date</h3>
        <input type="date" className="rail-date" value={inputs.startDate} aria-label="Start date" onChange={(e) => e.target.value && setInput("startDate", e.target.value)} />
        <h3>Take it with you</h3>
        <p className="rail-acts">
          <button type="button" className="btn ghost" onClick={downloadCalendar}><Icon name="dl" size={15} /> Calendar file (.ics)</button>
          <button type="button" className="btn ghost" onClick={() => window.print()}><Icon name="print" size={15} /> Print</button>
        </p>
      </>
    );
  }
  return (
    <>
      <h3>On this stage</h3>
      <ul className="olist plain">
        {[["hear-band", "The hearing"], ["hear-sheet", `Your sheet (${hearing.length})`], ["hear-list", "Questions"]].map(([id, l]) => <li key={id}><button type="button" onClick={() => goTo(id)}><span className="n" /><span>{l}</span></button></li>)}
      </ul>
    </>
  );
}

/** The rail: the site card, then an outline of the stage on view. */
export function Rail({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <aside className={`rail${open ? " open" : ""}`} aria-label="The site and an outline of this stage" onClick={(e) => { if ((e.target as HTMLElement).closest("button, a")) setOpen(false); }}>
      <SiteCard />
      <Outline />
    </aside>
  );
}
