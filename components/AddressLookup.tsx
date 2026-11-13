"use client";

import { useRef, useState } from "react";
import { TOWNS } from "@/lib/data/towns";
import { fmt } from "@/lib/engine";
import { geocode, outlinePath, siteFacts, type Candidate, type SiteFacts } from "@/lib/lookup";
import { useProject } from "./ProjectProvider";

type State =
  | { step: "idle" }
  | { step: "working"; note: string }
  | { step: "pick"; candidates: Candidate[] }
  | { step: "found"; place: Candidate; facts: SiteFacts }
  | { step: "error"; message: string };

/** Type an address, get the zoning district, parcel, lot area and utilities from public map layers. */
export function AddressLookup() {
  const { inputs, setInput } = useProject();
  const [q, setQ] = useState(inputs.address);
  const [state, setState] = useState<State>({ step: "idle" });
  const [applied, setApplied] = useState(false);
  const abort = useRef<AbortController | null>(null);

  const locate = async (place: Candidate) => {
    abort.current?.abort();
    const ac = new AbortController();
    abort.current = ac;
    setApplied(false);
    setState({ step: "working", note: "Reading the zoning atlas and the state parcel map…" });
    try {
      const facts = await siteFacts(place.lon, place.lat, ac.signal);
      if (!ac.signal.aborted) setState({ step: "found", place, facts });
    } catch {
      if (!ac.signal.aborted) setState({ step: "error", message: "The map services didn't answer. Enter the facts by hand, or try again." });
    }
  };

  const search = async () => {
    const text = q.trim();
    if (text.length < 4) return;
    abort.current?.abort();
    const ac = new AbortController();
    abort.current = ac;
    setState({ step: "working", note: "Finding the address…" });
    try {
      const found = await geocode(text, ac.signal);
      if (ac.signal.aborted) return;
      if (!found.length) setState({ step: "error", message: "No match in Rhode Island. Try the street number, street name and town, such as \"45 Broad Street, Cumberland\"." });
      else if (found.length === 1) await locate(found[0]);
      else setState({ step: "pick", candidates: found });
    } catch {
      if (!ac.signal.aborted) setState({ step: "error", message: "The address search didn't answer. Enter the facts by hand, or try again." });
    }
  };

  const use = (place: Candidate, f: SiteFacts) => {
    setInput("address", place.label.split(",").slice(0, 3).join(","));
    if (f.platLot) setInput("parcel", f.platLot);
    if (f.acres) setInput("lot", Math.round((f.acres * 43560) / 100) * 100);
    if (f.water !== null) setInput("water", f.water);
    if (f.sewer !== null) setInput("sewer", f.sewer);
    if (f.town && TOWNS.some((t) => t.name === f.town)) setInput("town", f.town);
    // The district list of a town arrives from the Atlas after the town is set, so take the looked-up abbreviation as it is.
    setInput("zone", f.zone ?? "other");
    setApplied(true);
  };

  const choose = (patch: Partial<SiteFacts>) => {
    setApplied(false);
    setState((st) => (st.step === "found" ? { ...st, facts: { ...st.facts, ...patch } } : st));
  };

  const yn = (v: boolean | null) => (v === null ? "not found" : v ? "Yes" : "No");

  return (
    <div className="panel lookup">
      <h3>Start from an address</h3>
      <p className="sub">
        Looks up the zoning district, the parcel, its area and whether public water and sewer reach it. The address goes to OpenStreetMap's
        search, and the point to the Rhode Island Zoning Atlas and RIDEM's parcel map. Nothing is stored.
      </p>
      <form className="lookup-form" onSubmit={(e) => { e.preventDefault(); search(); }}>
        <label htmlFor="f-address" className="sr-only">Street address</label>
        <input id="f-address" type="text" value={q} placeholder="45 Broad Street, Cumberland" autoComplete="street-address" onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="btn" disabled={state.step === "working"}>Look up</button>
      </form>
      <div aria-live="polite">
        {state.step === "working" && <p className="lookup-note">{state.note}</p>}
        {state.step === "error" && <p className="lookup-note is-error">{state.message}</p>}
        {state.step === "pick" && (
          <>
            <p className="lookup-note">More than one match. Pick the right one:</p>
            <ul className="lookup-picks">
              {state.candidates.map((c) => (
                <li key={`${c.lat},${c.lon}`}><button type="button" className="link-btn" onClick={() => locate(c)}>{c.label}</button></li>
              ))}
            </ul>
          </>
        )}
        {state.step === "found" && (() => {
          const { place, facts: f } = state;
          const covered = f.town !== null && TOWNS.some((t) => t.name === f.town);
          return (
            <div className="lookup-result">
              {f.outline && (
                <svg className="parcel-shape" viewBox="0 0 120 120" role="img" aria-label="Parcel outline, north up">
                  <path d={outlinePath(f.outline)} fillRule="evenodd" />
                </svg>
              )}
              <div className="lookup-facts">
                <p className="lookup-place"><b>{place.label}</b></p>
                {!place.precise && <p className="lookup-note is-warn">Matched to the street, not the building. Check that the parcel below is the right one.</p>}
                <dl className="metrics">
                  <div><dt>Town</dt><dd>{f.town ?? "not found"}</dd></div>
                  <div><dt>Zoning district</dt><dd>{f.zone ? `${f.zone} · ${f.zoneName}` : f.zoneOptions.length > 1 ? "choose below" : "not found"}</dd></div>
                  <div><dt>Parcel</dt><dd>{f.platLot ?? (f.parcelOptions.length > 1 ? "choose below" : "not found")}</dd></div>
                  <div><dt>Lot area</dt><dd>{f.acres ? `${fmt(f.acres * 43560)} sq ft (${f.acres.toFixed(2)} ac)` : "not found"}</dd></div>
                  <div><dt>Public water</dt><dd>{yn(f.water)}</dd></div>
                  <div><dt>Public sewer</dt><dd>{yn(f.sewer)}</dd></div>
                </dl>
                {f.nearby && <p className="lookup-note is-warn">The address point sits in the road, so these come from a 30 m search around it. Check them against the town's map.</p>}
                {f.zoneOptions.length > 1 && (
                  <fieldset className="lookup-choose">
                    <legend>On a district boundary. Which district is the lot in?</legend>
                    {f.zoneOptions.map((z) => (
                      <label key={z.zone}><input type="radio" name="lk-zone" checked={f.zone === z.zone} onChange={() => choose({ zone: z.zone, zoneName: z.name })} /> {z.zone} · {z.name}</label>
                    ))}
                  </fieldset>
                )}
                {f.parcelOptions.length > 1 && (
                  <fieldset className="lookup-choose">
                    <legend>More than one parcel nearby. Which is yours?</legend>
                    {f.parcelOptions.map((o) => (
                      <label key={o.platLot}><input type="radio" name="lk-parcel" checked={f.platLot === o.platLot} onChange={() => choose({ platLot: o.platLot, acres: o.acres, outline: o.outline })} /> {o.platLot} · {o.acres.toFixed(2)} acres</label>
                    ))}
                  </fieldset>
                )}
                {f.failed.length > 0 && <p className="lookup-note is-warn">Couldn't read: {f.failed.join(", ")}. Enter those by hand.</p>}
                {covered && f.town !== "Cumberland" && (
                  <p className="lookup-note is-warn">
                    {f.town}: only zoning and state-law steps have been read. Local checklists, contacts and meeting dates are not shown for this town.
                  </p>
                )}
                <div className="actions">
                  <button type="button" className="btn" onClick={() => use(place, f)}>{applied ? "Facts applied ✓" : "Use these facts"}</button>
                  <span className="muted small">
                    Not looked up: wetlands, state-road access, transit distance and the land you'll disturb. The assessor's area is not a survey.
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
