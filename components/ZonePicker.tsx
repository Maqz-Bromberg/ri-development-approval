"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { housingTypeLabel } from "@/lib/data/atlas";
import { townRules } from "@/lib/data/towns/overlay";
import { USE_LABEL, useTreatment as treatmentOf } from "@/lib/engine";
import { ZONE_KIND, ZONE_KIND_ORDER, districtShapes, inRings, zoneKind, type ZoneKind } from "@/lib/map";
import type { AtlasDistrict } from "@/lib/types";
import { TreatChip, districtMetrics } from "./AtlasBits";
import { FactMark } from "./FactCheck";
import { Info } from "./Info";
import { useProject } from "./ProjectProvider";
import { useAtlas } from "./useAtlas";
import { useLookedUp } from "./useLookedUp";

/*
 * The zoning district, chosen by typing (a filtered list) or by browsing the town's districts by kind, each kind
 * with a line on what it means and each district opening to what it allows. Once chosen, the picker folds into
 * one box with the kind's mark and colour, the same colour the map gives that kind.
 */

/** A mark per kind of district: a house, a shopfront with a home above, a works. */
export function ZoneIcon({ kind, size = 20 }: { kind: ZoneKind; size?: number }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg className="zone-icon" width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      {kind === "res" && <g {...p}><path d="M3 9.5 10 3.5l7 6" /><path d="M5 8.5V17h10V8.5" /><path d="M8.5 17v-4.5h3V17" /></g>}
      {kind === "mixed" && <g {...p}><path d="M3.5 17V5.5h13V17" /><path d="M3.5 11h13" /><path d="M6.5 8h2M11.5 8h2" /><path d="M6 17v-3.5h3V17" /><path d="M11.5 14h2.5" /></g>}
      {kind === "nonres" && <g {...p}><path d="M2.5 17V9l4.5 3V9l4.5 3V6.5h3V17z" /><path d="M14.5 6.5V3" /><path d="M5.5 14.5h1.5M9.5 14.5h1.5" /></g>}
    </svg>
  );
}

const FIT: Record<string, { label: string; cls: string }> = {
  allowed: { label: "Allowed", cls: "t-allowed" },
  hearing: { label: "Needs a hearing", cls: "t-hearing" },
  prohibited: { label: "Prohibited", cls: "t-prohibited" },
  overlay: { label: "Overlay: check", cls: "t-overlay" },
  unknown: { label: "Not read", cls: "t-none" },
};


function DistrictDetail({ d, onChoose, chosen, retired }: { d: AtlasDistrict; onChoose: () => void; chosen: boolean; retired?: string }) {
  const { inputs } = useProject();
  return (
    <div className="zp-detail">
      {retired && <p className="lookup-note is-warn">{retired}</p>}
      <div className="treat-row">
        <TreatChip label="1-family" value={d.family1_treatment} />
        <TreatChip label="2-family" value={d.family2_treatment} />
        <TreatChip label="3-family" value={d.family3_treatment} />
        <TreatChip label="4+ family" value={d.family4_treatment} />
        <TreatChip label="ADU" value={d.accessory_treatment} />
      </div>
      <dl className="metrics">
        {districtMetrics(d, inputs.water, inputs.sewer).slice(0, 4).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
      <button type="button" className="btn" onClick={onChoose} disabled={chosen}>{chosen ? "Chosen ✓" : `Choose ${d.abbrvname}`}</button>
    </div>
  );
}

/** Overlay districts in the town, ticked when the site lies in one. The lookup ticks them from the map. */
function OverlayTicks({ overlays }: { overlays: AtlasDistrict[] }) {
  const { inputs, setInput } = useProject();
  const on = inputs.overlays ?? [];
  const flip = (z: string) => setInput("overlays", on.includes(z) ? on.filter((x) => x !== z) : [...on, z]);
  const unmapped = townRules(inputs.town).unmappedOverlays ?? [];
  return (
    <fieldset className="zp-overlays">
      <legend className="small">Overlays in {inputs.town}, on top of the districts. Tick any the site lies in.</legend>
      {overlays.map((d) => (
        <label key={d.abbrvname} className="cb small"><input type="checkbox" checked={on.includes(d.abbrvname)} onChange={() => flip(d.abbrvname)} /> {d.abbrvname} · {d.name}</label>
      ))}
      {unmapped.map((d) => (
        <label key={d.abbr} className="cb small"><input type="checkbox" checked={on.includes(d.abbr)} onChange={() => flip(d.abbr)} /> {d.abbr} · {d.name} <span className="muted">(not on the Atlas map, so the lookup can&apos;t find it: check the town&apos;s zoning map)</span></label>
      ))}
    </fieldset>
  );
}

export function ZonePicker({ onMap }: { onMap?: () => void }) {
  const { inputs, setInput, origin } = useProject();
  const { districts: all, status } = useAtlas();
  // The Atlas keeps overlay districts in the same list as base districts. An overlay is never the site's district:
  // it lies on top of one, so it is offered apart, as something the site may also be in.
  const districts = useMemo(() => all.filter((d) => d.family4_treatment !== "Overlay"), [all]);
  const overlays = useMemo(() => all.filter((d) => d.family4_treatment === "Overlay"), [all]);
  // How a district treats the project's housing type: the town's own use table where it was read, else the Atlas.
  const fit = (zone: string) => FIT[treatmentOf({ ...inputs, zone })];
  const retired = townRules(inputs.town).retired;
  const retiredNote = (z: string) => (retired?.zones.includes(z) ? retired.note : undefined);
  const [editing, setEditing] = useState(false);
  const open = editing || inputs.zone === "other" || !districts.some((d) => d.abbrvname === inputs.zone);
  const [q, setQ] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const input = useRef<HTMLInputElement>(null);

  const byKind = useMemo(() => {
    const m: Record<ZoneKind, AtlasDistrict[]> = { res: [], mixed: [], nonres: [] };
    districts.forEach((d) => m[zoneKind(d.type)].push(d));
    return m;
  }, [districts]);
  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return districts;
    return districts.filter((d) => `${d.abbrvname} ${d.name} ${ZONE_KIND[zoneKind(d.type)].label}`.toLowerCase().includes(t));
  }, [q, districts]);

  const choose = (zone: string) => {
    setInput("zone", zone);
    setEditing(false);
    setQ("");
    setListOpen(false);
  };
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); if (q.trim()) setListOpen(true); setActive((a) => Math.min(a + 1, matches.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (listOpen && matches[active]) choose(matches[active].abbrvname); }
    else if (e.key === "Escape") { setListOpen(false); }
  };

  // With the site placed but no district chosen (a town picked after a point, or a lookup on a boundary that was closed),
  // the district is selected from the Atlas outline the point falls in, where exactly one base district holds it.
  const tried = useRef("");
  const [fromOutline, setFromOutline] = useState<string | null>(null);
  const look = useLookedUp();
  useEffect(() => {
    if (inputs.zone !== "other" || inputs.lat == null || inputs.lon == null) return;
    const key = `${inputs.town}|${inputs.lat}|${inputs.lon}`;
    if (tried.current === key) return;
    tried.current = key;
    const at: [number, number] = [inputs.lat, inputs.lon];
    districtShapes(inputs.town).then((shapes) => {
      const hits = Array.from(new Set(shapes.filter((d) => !d.overlay && inRings(at, d.rings)).map((d) => d.abbr)));
      if (hits.length === 1) { setInput("zone", hits[0]); setFromOutline(hits[0]); }
    }).catch(() => { /* the picker stays open, to choose by hand */ });
  }, [inputs.zone, inputs.lat, inputs.lon, inputs.town, setInput]);

  const chosen = districts.find((d) => d.abbrvname === inputs.zone);
  const head = (
    <div className="zp-label">
      <span className="legend-like" id="zp-h">Zoning district</span>
      <Info id="zone" />
      {(() => {
        const f = look.status === "ready" ? look.data.facts : null;
        const said = f?.zone && f.zone === inputs.zone
          ? `The Zoning Atlas puts the site in ${f.zone}${f.zoneName ? `, ${f.zoneName}` : ""}.`
          : fromOutline && fromOutline === inputs.zone ? `The site's point lies inside ${inputs.zone}'s outline on the Zoning Atlas, so it was chosen for you.` : null;
        return said ? <FactMark id="zone" label="Zoning district" said={said} /> : null;
      })()}
    </div>
  );

  if (!open && chosen) {
    const k = zoneKind(chosen.type);
    const f = fit(chosen.abbrvname);
    const note = retiredNote(chosen.abbrvname);
    return (
      <div className="field zp">
        {head}
        <div className="zp-chosen" style={{ "--zk": ZONE_KIND[k].color } as React.CSSProperties} id="f-zone" tabIndex={-1}>
          <span className="zp-mark"><ZoneIcon kind={k} size={26} /></span>
          <div className="zp-chosen-text">
            <b>{chosen.abbrvname} · {chosen.name}</b>
            {origin === "example" && <span className="example-flag">Example</span>}
            <span className="small muted">{ZONE_KIND[k].label}</span>
            <span className="small">{inputs.kind === "commercial" ? `${USE_LABEL[inputs.use].split(" (")[0]} use` : `${housingTypeLabel(inputs.units)} housing`}: <span className={`treat ${f.cls}`}>{f.label}</span></span>
            {note && <span className="small lookup-note is-warn">{note}</span>}
            {(inputs.overlays ?? []).length > 0 && <span className="small">Also in the {inputs.overlays.join(", ")} overlay: its rules are not read.</span>}
          </div>
          <button type="button" className="btn ghost zp-change" onClick={() => { setEditing(true); setTimeout(() => input.current?.focus(), 0); }}>Change</button>
        </div>
      </div>
    );
  }

  return (
    <div className="field zp is-open" role="group" aria-labelledby="zp-h">
      {head}
      {status === "loading" && !districts.length ? (
        <p className="sub">Reading {inputs.town}&apos;s districts from the Zoning Atlas…</p>
      ) : !districts.length ? (
        <p className="sub">The Zoning Atlas didn&apos;t answer, so {inputs.town}&apos;s districts can&apos;t be listed. Look up the address, or try again later.</p>
      ) : (
        <>
          <div className="zp-search">
            <input
              ref={input} id="f-zone" type="text" role="combobox" autoComplete="off"
              aria-expanded={listOpen} aria-controls={listId} aria-autocomplete="list"
              aria-activedescendant={listOpen && matches[active] ? `${listId}-${matches[active].abbrvname}` : undefined}
              placeholder={`Type a code or a word, such as "R-3" or "commercial"`}
              value={q}
              onChange={(e) => { setQ(e.target.value); setListOpen(e.target.value.trim().length > 0); setActive(0); }}
              onFocus={() => setListOpen(q.trim().length > 0)}
              onBlur={() => setTimeout(() => setListOpen(false), 150)}
              onKeyDown={onKey}
            />
            {listOpen && (
              <ul className="zp-list" id={listId} role="listbox" aria-label={`${inputs.town} districts`}>
                {matches.length ? matches.map((d, i) => {
                  const k = zoneKind(d.type);
                  const f = fit(d.abbrvname);
                  return (
                    <li
                      key={d.abbrvname} id={`${listId}-${d.abbrvname}`} role="option" aria-selected={i === active}
                      className={i === active ? "is-active" : undefined}
                      onMouseDown={(e) => { e.preventDefault(); choose(d.abbrvname); }}
                      onMouseEnter={() => setActive(i)}
                    >
                      <span className="zp-dot" style={{ background: ZONE_KIND[k].color }} aria-hidden="true" />
                      <span className="zp-opt"><b>{d.abbrvname}</b> {d.name}{retiredNote(d.abbrvname) ? <span className="muted"> · not in the 2026 ordinance</span> : null}</span>
                      <span className={`treat ${f.cls}`}>{f.label}</span>
                    </li>
                  );
                }) : <li className="zp-none" role="option" aria-selected={false}>No district matches. Browse by kind below.</li>}
              </ul>
            )}
          </div>

          <p className="zp-or small muted">Or browse {inputs.town}&apos;s {districts.length} districts by kind. The tag on each says how it treats {inputs.kind === "commercial" ? `${USE_LABEL[inputs.use].split(" (")[0].toLowerCase()} use${townRules(inputs.town).useCommercial ? "" : ", which has not been read for this town"}` : `${housingTypeLabel(inputs.units)} housing`}.</p>
          <div className="zp-kinds">
            {ZONE_KIND_ORDER.map((k) => byKind[k].length > 0 && (
              <details key={k} className="zp-kind" style={{ "--zk": ZONE_KIND[k].color } as React.CSSProperties} open={byKind[k].some((d) => d.abbrvname === inputs.zone)}>
                <summary>
                  <span className="zp-mark"><ZoneIcon kind={k} /></span>
                  <span className="zp-kind-text"><b>{ZONE_KIND[k].label} <span className="muted">({byKind[k].length})</span></b><span className="small muted">{ZONE_KIND[k].sub}</span></span>
                </summary>
                <ul className="zp-districts">
                  {byKind[k].map((d) => {
                    const f = fit(d.abbrvname);
                    return (
                      <li key={d.abbrvname}>
                        <details>
                          <summary>
                            <span className="zp-opt"><b>{d.abbrvname}</b> {d.name}</span>
                            <span className={`treat ${f.cls}`}>{f.label}</span>
                          </summary>
                          <DistrictDetail d={d} chosen={d.abbrvname === inputs.zone} onChoose={() => choose(d.abbrvname)} retired={retiredNote(d.abbrvname)} />
                        </details>
                      </li>
                    );
                  })}
                </ul>
              </details>
            ))}
          </div>
        </>
      )}
      {(overlays.length > 0 || (townRules(inputs.town).unmappedOverlays ?? []).length > 0) && <OverlayTicks overlays={overlays} />}
      <div className="zp-foot">
        {onMap && <button type="button" className="link-btn" onClick={onMap}>Not sure? Click the parcel on the map</button>}
        {inputs.zone !== "other" && <button type="button" className="link-btn" onClick={() => choose("other")}>Leave it as not sure</button>}
        {editing && chosen && <button type="button" className="link-btn" onClick={() => setEditing(false)}>Keep {chosen.abbrvname}</button>}
      </div>
    </div>
  );
}
