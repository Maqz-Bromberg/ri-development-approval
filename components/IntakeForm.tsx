"use client";

import { useState } from "react";
import { EIGHTH_MILE_M } from "@/lib/lookup";
import { townRules } from "@/lib/data/towns/overlay";
import { AFF_TIERS, affMet, affTier } from "@/lib/data/affordability";
import { SOURCES } from "@/lib/data/sources";
import type { CommercialUse, CommercialWork, ProjectInputs, ProjectKind } from "@/lib/types";
import { KIND_LABEL, USE_LABEL, fmt } from "@/lib/engine";
import { DemoTag } from "./Demo";
import { FactMark } from "./FactCheck";
import { Icon } from "./Icon";
import { Info } from "./Info";
import { useLookedUp } from "./useLookedUp";
import { HoverCard } from "./Popover";
import { useProject } from "./ProjectProvider";

/*
 * The project and its site, on Site selection, in four groups: the building, the land, services and constraints,
 * and choices. Every fact stays the applicant's to enter. Where a public layer knows something about the site
 * (after an address lookup or a map click), the fact shows whether it matches, or what the layer suggests, with a
 * button to take it. Nothing is changed without that click.
 */

type Bool = "water" | "sewer" | "wet" | "dot" | "transit" | "rezone" | "conservation";

function Label({ htmlFor, help, children, mark }: { htmlFor: string; help: string; children: React.ReactNode; mark?: React.ReactNode }) {
  return (
    <div className="zp-label">
      <label htmlFor={htmlFor}>{children}</label>
      <Info id={help} />
      {mark}
    </div>
  );
}

/** A verification note under a fact: matches the map, differs from it, or what the map suggests. */
function Note({ kind, children, onUse, useLabel = "Use this" }: { kind: "ok" | "diff" | "hint" | "wait"; children: React.ReactNode; onUse?: () => void; useLabel?: string }) {
  return (
    <p className={`fv fv-${kind}`}>
      <span className="fv-mark" aria-hidden="true">{kind === "ok" ? "✓" : kind === "diff" ? "!" : kind === "wait" ? "…" : "→"}</span>
      <span>{children}{onUse && <>{" "}<button type="button" className="link-btn" onClick={onUse}>{useLabel}</button></>}</span>
    </p>
  );
}

type Field = "parcel" | "lot" | Bool;
const FIELD_NAME: Record<string, string> = { parcel: "Parcel", lot: "Lot area", water: "Public water", sewer: "Public sewer", wet: "Wetlands", dot: "State road", transit: "Transit" };

/**
 * What the map layers say about one fact, against what is entered. A fact that matches gets a check beside its label, whose card
 * says what was found and how (ARD D48); a difference or a suggestion stays a line under the fact, with its button.
 */
function Verify({ field }: { field: Field }) {
  const el = useVerdict(field);
  return el && el.props.kind !== "ok" ? el : null;
}

/** The check beside a fact's label, when the map layers agree with it. */
function VerifyMark({ field }: { field: Field }) {
  const el = useVerdict(field);
  if (!el || el.props.kind !== "ok") return null;
  return <FactMark id={field} label={FIELD_NAME[field]} said={el.props.children} />;
}

function useVerdict(field: Field): React.ReactElement<{ kind: "ok" | "diff" | "hint" | "wait"; children: React.ReactNode }> | null {
  const { inputs, setInput } = useProject();
  const look = useLookedUp();
  if (look.status === "none") return null;
  if (look.status === "loading") return <Note kind="wait">Checking against the map…</Note>;
  if (look.status === "error") return null;
  const { facts: f, suggest: s } = look.data;
  const set = (k: Bool, v: boolean) => () => setInput(k, v);

  switch (field) {
    case "parcel": {
      const ids = f.platLot ? [f.platLot] : f.parcelOptions.map((o) => o.platLot);
      if (!ids.length) return null;
      return ids.includes(inputs.parcel)
        ? <Note kind="ok">Matches the state parcel map.</Note>
        : <Note kind="diff" onUse={() => setInput("parcel", ids[0])}>The parcel map has {ids.join(" or ")} at the site.</Note>;
    }
    case "lot": {
      const areas = (f.acres ? [f.acres] : f.parcelOptions.map((o) => o.acres)).map((a) => Math.round((a * 43560) / 100) * 100);
      if (!areas.length) return null;
      return areas.some((a) => Math.abs(a - inputs.lot) <= 100)
        ? <Note kind="ok">Matches the assessor&apos;s area. A survey is more exact.</Note>
        : <Note kind="diff" onUse={() => setInput("lot", areas[0])}>The assessor has {areas.map(fmt).join(" or ")} sq ft. Keep yours if it is from a survey.</Note>;
    }
    case "water":
    case "sewer": {
      const v = f[field];
      const name = field === "water" ? "the Atlas's water districts" : "the Atlas's sewered areas";
      if (v === null) return null;
      return v === inputs[field]
        ? <Note kind="ok">Matches {name}.</Note>
        : <Note kind="diff" onUse={set(field, v)}>{v ? "The site is inside" : "The site is outside"} {name}.</Note>;
    }
    case "wet": {
      if (s.wetlands === null) return null;
      if (s.wetlands.length) {
        return inputs.wet
          ? <Note kind="ok">The wetlands inventory maps {s.wetlands.join(", ").toLowerCase()} within about 100 ft.</Note>
          : <Note kind="diff" onUse={set("wet", true)} useLabel="Mark it">The wetlands inventory maps {s.wetlands.join(", ").toLowerCase()} within about 100 ft of the {s.parcel ? "parcel" : "point"}.</Note>;
      }
      return inputs.wet
        ? <Note kind="hint">None mapped within about 100 ft. Keep the tick if you know of one: the inventory misses small wetlands.</Note>
        : <Note kind="ok">None mapped within about 100 ft. The inventory misses small wetlands, and RIDEM&apos;s edge is the one that counts.</Note>;
    }
    case "dot": {
      if (s.stateRoads === null) return null;
      const names = s.stateRoads.map((r) => `${r.name}${r.route ? ` (Route ${r.route})` : ""}`).join(", ");
      if (s.stateRoads.length) {
        return inputs.dot
          ? <Note kind="ok">{names} is a state road at the site.</Note>
          : <Note kind="diff" onUse={set("dot", true)} useLabel="Mark it">{names} is a state road at the site. If the driveway opens onto it, RIDOT&apos;s permit applies.</Note>;
      }
      return inputs.dot
        ? <Note kind="hint">No state road within {s.parcel ? "15 m of the parcel" : "30 m of the point"} on RIDOT&apos;s map.</Note>
        : <Note kind="ok">No state road at the site on RIDOT&apos;s map.</Note>;
    }
    case "transit": {
      if (s.stops === null) return null;
      const routes = [...new Set(s.stops.flatMap((x) => x.routes))];
      const what = `${s.stops.length} RIPTA stop${s.stops.length === 1 ? "" : "s"} within 1/8 mile (${EIGHTH_MILE_M} m)${routes.length ? `, route${routes.length === 1 ? "" : "s"} ${routes.join(", ")}` : ""}`;
      if (s.stops.length) {
        return inputs.transit
          ? <Note kind="ok">{what}. Whether the service is frequent enough is not checked.</Note>
          : <Note kind="hint" onUse={set("transit", true)} useLabel="Mark it">{what}. Tick it if the service is frequent; that is not checked.</Note>;
      }
      return inputs.transit
        ? <Note kind="hint">No RIPTA stop within 1/8 mile. A mobility hub within 1/4 mile also counts, and is not checked.</Note>
        : <Note kind="ok">No RIPTA stop within 1/8 mile.</Note>;
    }
    default:
      return null;
  }
}

/** The lines in law an affordable share can meet, as a key; the ones met are filled. Darker green for a higher line. */
/** The lines in law an affordable share can meet; the ones met are filled. Darker green for a higher line. */
function AffKey({ full = false }: { full?: boolean }) {
  const { inputs } = useProject();
  const met = affMet(inputs.units, inputs.aff);
  return (
    <ul className={`aff-key${full ? " is-full" : ""}`} aria-label="Affordable shares that cross a line in law">
      {AFF_TIERS.map((t, i) => (
        <li key={t.short} className={`t${i}${met[i] ? " is-met" : ""}`} title={full ? undefined : t.what}>
          <span className="aff-sw" aria-hidden="true" />
          <span>
            <a href={SOURCES[t.src]?.url} target="_blank" rel="noopener noreferrer">{t.short}</a>
            {met[i] && <span className="sr-only"> (met)</span>}
            {t.route && <span className="aff-route"> changes the route</span>}
            {full && <span className="aff-what">{t.what}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The affordable share beside its input, shaded by the lines in law it meets, the height of the input. Its key is a card
 * on hover or click of the share (decided after trial, 2026-11-14, ARD D25).
 */
function AffShare({ input }: { input: React.ReactNode }) {
  const { inputs } = useProject();
  const pct = inputs.units ? Math.round((inputs.aff / inputs.units) * 100) : 0;
  return (
    <div className="aff-row">
      {input}
      <HoverCard
        className={`aff-share aff-share-btn t${affTier(inputs.units, inputs.aff)}`}
        label={`${pct}% affordable: the lines in law it meets`}
        width={340}
        card={<><b className="pop-title">Affordable share: {pct}%</b><AffKey full /></>}
      >
        <span id="aff-share">({pct}%)</span>
      </HoverCard>
    </div>
  );
}

const BOOLS: { key: Bool; label: string }[] = [
  { key: "water", label: "Public water" },
  { key: "sewer", label: "Public sewer" },
  { key: "wet", label: "Wetlands on or near the site" },
  { key: "dot", label: "Access onto a state road" },
  { key: "transit", label: "Near frequent transit (1/8 mi) or a mobility hub (1/4 mi)" },
];
const CHOICES: { key: Bool; label: string }[] = [
  { key: "rezone", label: "Seek a zone change instead of relief" },
  { key: "conservation", label: "Conservation development (open space for density)" },
];

function Tick({ k, label, verify = true }: { k: Bool; label: string; verify?: boolean }) {
  const { inputs, setInput } = useProject();
  return (
    <div className="ftick">
      <div className="ftick-row">
        <label className="cb">
          <input type="checkbox" id={`f-${k}`} checked={inputs[k]} onChange={(e) => setInput(k, e.target.checked)} />
          {label}
        </label>
        <Info id={k} />
        {verify && <VerifyMark field={k} />}
      </div>
      {verify && <Verify field={k} />}
    </div>
  );
}

export function IntakeForm() {
  const { inputs, setInput, resetInputs, origin } = useProject();
  const look = useLookedUp();
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [drag, setDrag] = useState(false);

  const num = (key: "units" | "aff" | "lot" | "dist" | "commercial" | "gfa" | "existingGfa") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    let n = Number.isFinite(v) ? v : 0;
    if (key === "units") n = Math.max(1, Math.round(n));
    if (key === "aff") n = Math.max(0, Math.min(inputs.units, Math.round(n)));
    setInput(key, n);
  };
  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list).map((f) => ({ name: f.name, size: f.size }))]);
  };

  return (
    <form className="intake-groups" onSubmit={(e) => e.preventDefault()} aria-label="Project and site facts">
      {origin === "example" && <p className="lookup-note is-warn">These are the example&apos;s values, a 10-unit housing project in {inputs.town}. Change any of them to make it yours.</p>}
      {look.status === "none" && <p className="small muted">Look up an address or click the map above, and each fact a public map knows is checked against it here.</p>}
      {look.status === "ready" && <p className="small muted fv-legend"><span className="fact-mark is-key" aria-hidden="true"><Icon name="check" size={13} /></span> beside a fact: the public map layers found the same. Hover it for how.</p>}
      {look.status === "error" && <p className="lookup-note is-warn">The map layers didn&apos;t answer, so the facts below aren&apos;t checked against them. They are yours to enter.</p>}

      <fieldset className="fgroup">
        <legend>What you plan to build</legend>
        <div className="kind-pick" role="radiogroup" aria-label="Kind of project">
          {(Object.keys(KIND_LABEL) as ProjectKind[]).map((k) => (
            <label key={k} className={`kind-opt${inputs.kind === k ? " is-on" : ""}`}>
              <input type="radio" name="f-kind" id={k === "homes" ? "f-kind" : undefined} checked={inputs.kind === k} onChange={() => setInput("kind", k)} />
              <span>{KIND_LABEL[k]}</span>
            </label>
          ))}
          <Info id="kind" />
        </div>
        <div className="form-grid">
          {inputs.kind !== "commercial" && <>
            <div className="field">
              <Label htmlFor="f-units" help="units">Dwelling units</Label>
              <input id="f-units" type="number" min={1} max={500} value={inputs.units} onChange={num("units")} />
            </div>
            <div className="field">
              <Label htmlFor="f-aff" help="aff">Deed-restricted affordable units</Label>
              <AffShare input={<input id="f-aff" type="number" min={0} max={inputs.units} value={inputs.aff} onChange={num("aff")} aria-describedby="aff-share" />} />
            </div>
            <div className="field">
              <Label htmlFor="f-type" help="type">Building work</Label>
              <select id="f-type" value={inputs.type} onChange={(e) => setInput("type", e.target.value as ProjectInputs["type"])}>
                <option value="new">New construction</option>
                <option value="reuse">Adaptive reuse of an existing building</option>
              </select>
            </div>
          </>}
          {inputs.kind !== "homes" && (
            <div className="field">
              <Label htmlFor="f-use" help="use">{inputs.kind === "mixed" ? "Use of the commercial space" : "Use"}</Label>
              <select id="f-use" value={inputs.use} onChange={(e) => setInput("use", e.target.value as CommercialUse)}>
                {(Object.keys(USE_LABEL) as CommercialUse[]).map((u) => <option key={u} value={u}>{USE_LABEL[u]}</option>)}
              </select>
            </div>
          )}
          {inputs.kind === "mixed" && (
            <div className="field">
              <Label htmlFor="f-commercial" help="commercial">Commercial floor area (sq ft)</Label>
              <input id="f-commercial" type="number" min={0} step={100} value={inputs.commercial} onChange={num("commercial")} />
              <span className="muted small">State law: minor review up to 6 units and 2,500 sq ft.{townRules(inputs.town).asksCommercial ? ` ${inputs.town} sorts 10 or more units by it: over 2,500 sq ft is major.` : ""}</span>
            </div>
          )}
          {inputs.kind === "commercial" && <>
            <div className="field">
              <Label htmlFor="f-work" help="work">Building work</Label>
              <select id="f-work" value={inputs.work} onChange={(e) => setInput("work", e.target.value as CommercialWork)}>
                <option value="new">New construction</option>
                <option value="expand">Expanding a building</option>
                <option value="change">Change of use of a building</option>
              </select>
            </div>
            <div className="field">
              <Label htmlFor="f-gfa" help="gfa">{inputs.work === "expand" ? "Floor area added (sq ft)" : inputs.work === "change" ? "Floor area of the building (sq ft)" : "New gross floor area (sq ft)"}</Label>
              <input id="f-gfa" type="number" min={0} step={100} value={inputs.gfa} onChange={num("gfa")} />
            </div>
            {inputs.work === "expand" && (
              <div className="field">
                <Label htmlFor="f-existingGfa" help="existingGfa">Existing floor area (sq ft)</Label>
                <input id="f-existingGfa" type="number" min={0} step={100} value={inputs.existingGfa} onChange={num("existingGfa")} />
              </div>
            )}
            {inputs.work === "change" && (
              <div className="field">
                <div className="ftick-row">
                  <label className="cb"><input type="checkbox" id="f-extensive" checked={inputs.extensive} onChange={(e) => setInput("extensive", e.target.checked)} /> Extensive construction or exterior work</label>
                  <Info id="extensive" />
                </div>
              </div>
            )}
          </>}
          <div className="field">
            <Label htmlFor="f-start-intake" help="startDate">Start date</Label>
            <input id="f-start-intake" type="date" value={inputs.startDate} onChange={(e) => e.target.value && setInput("startDate", e.target.value)} />
          </div>
        </div>
      </fieldset>

      <fieldset className="fgroup">
        <legend>The land</legend>
        <div className="form-grid">
          <div className="field">
            <Label htmlFor="f-parcel" help="parcel" mark={<VerifyMark field="parcel" />}>Parcel (plat and lot)</Label>
            <input id="f-parcel" type="text" value={inputs.parcel} onChange={(e) => setInput("parcel", e.target.value)} />
            <Verify field="parcel" />
          </div>
          <div className="field">
            <Label htmlFor="f-lot" help="lot" mark={<VerifyMark field="lot" />}>Lot area (sq ft)</Label>
            <input id="f-lot" type="number" min={0} step={100} value={inputs.lot} onChange={num("lot")} />
            <Verify field="lot" />
          </div>
          <div className="field">
            <Label htmlFor="f-dist" help="dist">Land disturbed (acres)</Label>
            <input id="f-dist" type="number" min={0} step={0.1} value={inputs.dist} onChange={num("dist")} />
            <span className="muted small">{inputs.lot ? `The whole lot is ${(inputs.lot / 43560).toFixed(2)} acres. ` : ""}No map knows this; it comes from the grading plan.</span>
          </div>
        </div>
      </fieldset>

      <fieldset className="fgroup">
        <legend>Services and constraints</legend>
        <div className="ticks">
          {BOOLS.map((b) => <Tick key={b.key} k={b.key} label={b.label} />)}
        </div>
      </fieldset>

      <fieldset className="fgroup">
        <legend>Choices</legend>
        <div className="ticks">
          {CHOICES.filter((b) => b.key !== "conservation" || inputs.kind !== "commercial").map((b) => <Tick key={b.key} k={b.key} label={b.label} verify={false} />)}
        </div>
      </fieldset>

      <div className="field full">
        <span className="legend-like">Building plans <DemoTag>Demo: files are listed, not read</DemoTag></span>
        <label
          className={`drop${drag ? " drag" : ""}`}
          htmlFor="f-files"
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
        >
          <strong>Drop the plan set here, or choose files</strong>
          <span>Nothing is read from the files yet and nothing is uploaded. Enter the facts above by hand.</span>
          <input id="f-files" type="file" multiple accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg" hidden onChange={(e) => addFiles(e.target.files)} />
        </label>
        {files.length > 0 && (
          <ul className="file-list">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`}><span>{f.name}</span><span>{Math.max(1, Math.round(f.size / 1024))} KB · listed only</span></li>
            ))}
          </ul>
        )}
      </div>
      <div className="actions">
        <button type="button" className="btn ghost" onClick={() => { resetInputs(); setFiles([]); }}>Reset to the example</button>
        <span className="muted small">Changes are saved in this browser. The check updates as you type.</span>
      </div>
    </form>
  );
}
