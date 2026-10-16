"use client";

import { useState } from "react";
import { CUMBERLAND_DISTRICTS } from "@/lib/data/atlas";
import { useProject } from "./ProjectProvider";
import type { ProjectInputs } from "@/lib/types";

const FACTS: { key: keyof ProjectInputs; label: string }[] = [
  { key: "water", label: "Public water" },
  { key: "sewer", label: "Public sewer" },
  { key: "wet", label: "Wetlands on or near the site" },
  { key: "dot", label: "Access onto a state road" },
  { key: "transit", label: "Near frequent transit (⅛ mi) or a mobility hub (¼ mi)" },
  { key: "rezone", label: "Seek a zone change instead of relief" },
  { key: "conservation", label: "Conservation development (open space for density)" },
];

export function IntakeForm() {
  const { inputs, setInput, resetInputs } = useProject();
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [drag, setDrag] = useState(false);

  const num = (key: "units" | "aff" | "lot" | "dist") => (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <form className="panel" onSubmit={(e) => e.preventDefault()} aria-labelledby="intake-h">
      <h3 id="intake-h">Project and site <span className="example-flag">Example values</span></h3>
      <p className="sub">Pre-filled with a sample 10-unit multifamily project in Cumberland. Your changes are saved in this browser.</p>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="f-muni">Municipality</label>
          <select id="f-muni" defaultValue="cumberland">
            <option value="cumberland">Cumberland</option>
            <option value="other" disabled>Other RI municipalities (coming soon)</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-parcel">Parcel (Assessor's Plat / Lot)</label>
          <input id="f-parcel" type="text" value={inputs.parcel} onChange={(e) => setInput("parcel", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="f-units">Dwelling units</label>
          <input id="f-units" type="number" min={1} max={500} value={inputs.units} onChange={num("units")} />
        </div>
        <div className="field">
          <label htmlFor="f-aff">Deed-restricted affordable units</label>
          <input id="f-aff" type="number" min={0} max={inputs.units} value={inputs.aff} onChange={num("aff")} />
        </div>
        <div className="field">
          <label htmlFor="f-zone">Zoning district (from GIS)</label>
          <select id="f-zone" value={inputs.zone} onChange={(e) => setInput("zone", e.target.value)}>
            {CUMBERLAND_DISTRICTS.map((d) => (
              <option key={d.abbrvname} value={d.abbrvname}>{d.abbrvname} {d.name}</option>
            ))}
            <option value="other">Other / not sure</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-lot">Lot area (sq ft)</label>
          <input id="f-lot" type="number" min={0} step={100} value={inputs.lot} onChange={num("lot")} />
        </div>
        <div className="field">
          <label htmlFor="f-dist">Land disturbed (acres)</label>
          <input id="f-dist" type="number" min={0} step={0.1} value={inputs.dist} onChange={num("dist")} />
        </div>
        <div className="field">
          <label htmlFor="f-start-intake">Start date</label>
          <input id="f-start-intake" type="date" value={inputs.startDate} onChange={(e) => e.target.value && setInput("startDate", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="f-type">Building work</label>
          <select id="f-type" value={inputs.type} onChange={(e) => setInput("type", e.target.value as ProjectInputs["type"])}>
            <option value="new">New construction</option>
            <option value="reuse">Adaptive reuse of an existing building</option>
          </select>
        </div>
        <fieldset className="field full">
          <legend>Site facts (from GIS layers and the plan set)</legend>
          <div className="facts">
            {FACTS.map((f) => (
              <label key={f.key} className="cb">
                <input type="checkbox" id={`f-${f.key}`} checked={inputs[f.key] as boolean} onChange={(e) => setInput(f.key, e.target.checked as never)} />
                {f.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="field full">
          <span className="legend-like">Building plans</span>
          <label
            className={`drop${drag ? " drag" : ""}`}
            htmlFor="f-files"
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
          >
            <strong>Drop the plan set here, or choose files</strong>
            <span>Site plan, floor plans, elevations, survey and drainage report. PDF, DWG, DXF or images.</span>
            <input id="f-files" type="file" multiple accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg" hidden onChange={(e) => addFiles(e.target.files)} />
          </label>
          {files.length > 0 && (
            <ul className="file-list">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`}><span>{f.name}</span><span>{Math.max(1, Math.round(f.size / 1024))} KB · queued for extraction</span></li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="actions">
        <button type="button" className="btn ghost" onClick={() => { resetInputs(); setFiles([]); }}>Reset to the example</button>
        <span className="muted small">The check and the route update as you type.</span>
      </div>
    </form>
  );
}
