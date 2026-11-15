"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TOWNS, townInfo } from "@/lib/data/towns";
import { fmt } from "@/lib/engine";
import { geocode, lookUpPoint, outlinePath, repinParcel, type Candidate, type SiteFacts, type SiteSuggestions } from "@/lib/lookup";
import { Info } from "./Info";
import { useProject } from "./ProjectProvider";
import { TownPicker, useSetTown } from "./TownPicker";
import { ZoningMap } from "./ZoningMap";

type State =
  | { step: "idle" }
  | { step: "working"; note: string }
  | { step: "pick"; candidates: Candidate[] }
  | { step: "found"; place: Candidate; facts: SiteFacts; suggest: SiteSuggestions }
  | { step: "error"; message: string };

/** One line on what a suggestion layer found, for the lookup result. */
export function suggestLines(s: SiteSuggestions): { key: string; label: string; text: string }[] {
  return [
    {
      key: "dot", label: "State road",
      text: s.stateRoads === null ? "couldn't read" : s.stateRoads.length ? s.stateRoads.map((r) => `${r.name}${r.route ? ` (Route ${r.route})` : ""}`).join(", ") : "none at the site",
    },
    {
      key: "wet", label: "Mapped wetlands",
      text: s.wetlands === null ? "couldn't read" : s.wetlands.length ? `${s.wetlands.join(", ")}, within about 100 ft` : "none mapped within about 100 ft",
    },
    {
      key: "transit", label: "Bus stops, 1/8 mile",
      text: s.stops === null ? "couldn't read" : s.stops.length ? `${s.stops.length} (route${new Set(s.stops.flatMap((x) => x.routes)).size === 1 ? "" : "s"} ${[...new Set(s.stops.flatMap((x) => x.routes))].join(", ") || "not listed"})` : "none",
    },
  ];
}

/**
 * Where the project is. The town from a list or from the statewide map, then an address, or a click on the map,
 * which looks up the zoning district, the parcel, its area, public water and sewer, and suggests three facts the
 * applicant ticks by hand (state road, wetlands, transit). With `layout="site"` the map sits beside it.
 */
export function AddressLookup({ map = false, layout = "stack" }: { map?: boolean; layout?: "stack" | "site" } = {}) {
  const { inputs, setInput, origin } = useProject();
  const setTown = useSetTown();
  const [q, setQ] = useState(inputs.address);
  const [state, setState] = useState<State>({ step: "idle" });
  const [applied, setApplied] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const locate = async (place: Candidate) => {
    abort.current?.abort();
    const ac = new AbortController();
    abort.current = ac;
    setApplied(false);
    setState({ step: "working", note: "Reading the zoning atlas, the state parcel map, roads, wetlands and bus stops…" });
    try {
      const { facts, suggest } = await lookUpPoint(place.lat, place.lon, ac.signal);
      if (!ac.signal.aborted) setState({ step: "found", place, facts, suggest });
    } catch {
      if (!ac.signal.aborted) setState({ step: "error", message: "The map services didn't answer. Enter the facts by hand, or try again." });
    }
  };

  const search = async (typed?: string) => {
    const text = (typed ?? q).trim();
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

  // The overview's "Where is your site?" arrives as /site?address=…: look it up at once.
  useEffect(() => {
    if (layout !== "site") return;
    const a = new URLSearchParams(window.location.search).get("address");
    if (!a) return;
    setQ(a);
    search(a);
    window.history.replaceState(null, "", window.location.pathname + window.location.hash);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const use = (place: Candidate, f: SiteFacts, sg: SiteSuggestions) => {
    if (f.town && TOWNS.some((t) => t.name === f.town)) setTown(f.town);
    setInput("address", place.label.startsWith("Map point") ? "" : place.label.split(",").slice(0, 3).join(","));
    setInput("lat", place.lat);
    setInput("lon", place.lon);
    if (f.platLot) setInput("parcel", f.platLot);
    if (f.acres) setInput("lot", Math.round((f.acres * 43560) / 100) * 100);
    if (f.water !== null) setInput("water", f.water);
    if (f.sewer !== null) setInput("sewer", f.sewer);
    // What the layers found about services and constraints is applied too, and stays the applicant's to untick (ARD D19).
    if (sg.stateRoads !== null) setInput("dot", sg.stateRoads.length > 0);
    if (sg.wetlands !== null) setInput("wet", sg.wetlands.length > 0);
    if (sg.stops !== null) setInput("transit", sg.stops.length > 0);
    // The district list of a town arrives from the Atlas after the town is set, so take the looked-up abbreviation as it is.
    setInput("zone", f.zone ?? "other");
    setInput("overlays", f.overlays.map((o) => o.zone));
    setInput("reservation", f.reservation ?? undefined);
    setInput("wetAgency", f.wetAgency ?? undefined);
    setApplied(true);
  };

  const choose = (patch: Partial<SiteFacts>) => {
    setApplied(false);
    setState((st) => {
      if (st.step !== "found") return st;
      const facts = { ...st.facts, ...patch };
      // Another parcel: redo the parcel-based suggestions for it.
      if (patch.outline !== undefined) repinParcel(st.place.lat, st.place.lon, facts).then(({ suggest }) => setState((s2) => (s2.step === "found" && s2.place === st.place ? { ...s2, suggest } : s2)));
      return { ...st, facts };
    });
  };

  // With the map in this step: a found place shows on it before its facts are used, and a click looks up that point.
  const preview = useMemo(
    () => (state.step === "found" && !applied ? { at: [state.place.lat, state.place.lon] as [number, number], label: state.place.label } : null),
    [state, applied],
  );
  const pickPoint = (lat: number, lon: number) => {
    setQ("");
    locate({ label: `Map point ${lat.toFixed(5)}, ${lon.toFixed(5)}`, lat, lon, precise: true });
  };

  const yn = (v: boolean | null) => (v === null ? "not found" : v ? "Yes" : "No");

  const body = (
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
        const { place, facts: f, suggest } = state;
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
              <p className="lk-k">Applied when you use these facts</p>
              <dl className="metrics">
                <div><dt>Town</dt><dd>{f.town ?? "not found"}</dd></div>
                <div><dt>Zoning district</dt><dd>{f.zone ? `${f.zone} · ${f.zoneName}` : f.zoneOptions.length > 1 ? "choose below" : "not found"}</dd></div>
                {f.overlays.length > 0 && <div><dt>Overlay</dt><dd>{f.overlays.map((o) => `${o.zone} · ${o.name}`).join("; ")}</dd></div>}
                {f.wetAgency && <div><dt>Wetlands regulated by</dt><dd>{f.wetAgency === "CRMC" ? "CRMC (coastal)" : "RIDEM"}</dd></div>}
                <div><dt>Parcel</dt><dd>{f.platLot ?? (f.parcelOptions.length > 1 ? "choose below" : "not found")}</dd></div>
                <div><dt>Lot area</dt><dd>{f.acres ? `${fmt(f.acres * 43560)} sq ft (${f.acres.toFixed(2)} ac)` : "not found"}</dd></div>
                <div><dt>Public water</dt><dd>{yn(f.water)}</dd></div>
                <div><dt>Public sewer</dt><dd>{yn(f.sewer)}</dd></div>
              </dl>
              <p className="lk-k">Services and constraints, applied too <a href="/docs/site-facts#dot" className="lk-how">how these are found</a></p>
              <dl className="metrics lk-suggest">
                {suggestLines(suggest).map((l) => <div key={l.key}><dt>{l.label}</dt><dd>{l.text}</dd></div>)}
              </dl>
              {f.reservation && <p className="lookup-note is-error">This point is on {f.reservation}, which the Zoning Atlas maps as tribal land. The town&apos;s zoning may not govern it, and this site has not read what does.</p>}
              {f.nearby && <p className="lookup-note is-warn">The address point sits in the road, so these come from a 30 m search around it. Check them against the town&apos;s map.</p>}
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
              {f.failed.length > 0 && <p className="lookup-note is-warn">Couldn&apos;t read: {f.failed.join(", ")}. Enter those by hand.</p>}
              {covered && f.town && townInfo(f.town).level < 3 && (
                <p className="lookup-note is-warn">
                  {f.town}: only zoning and state-law steps have been read. Local checklists, contacts and meeting dates are not shown for this town.
                </p>
              )}
              {covered && f.town && townInfo(f.town).trial && (
                <p className="lookup-note is-warn">
                  {f.town}: local steps come from a trial reading that the city has not confirmed.{townInfo(f.town).part ? ` Hearings and example projects were read for ${townInfo(f.town).part!.name} only.` : ""}
                </p>
              )}
              <div className="actions">
                <button type="button" className="btn" onClick={() => use(place, f, suggest)}>{applied ? "Facts applied ✓" : "Use these facts"}</button>
                <span className="muted small">Each stays yours to change below. The assessor&apos;s area is not a survey, and map layers are not a site visit.</span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );

  const form = (
    <form className="lookup-form" onSubmit={(e) => { e.preventDefault(); search(); }}>
      <label htmlFor="f-address" className="sr-only">Street address</label>
      <input id="f-address" type="text" value={q} placeholder="45 Broad Street, Cumberland" autoComplete="street-address" onChange={(e) => setQ(e.target.value)} />
      <button type="submit" className="btn" disabled={state.step === "working"}>Look up</button>
    </form>
  );

  if (layout === "site") {
    return (
      <div className="site-where">
        <div className="field site-where-address">
          <div className="zp-label">
            <label htmlFor="f-address">Street address</label>
            <Info id="address" />
          </div>
          {form}
          <p className="small muted lk-or">
            Or click the parcel on the map{inputs.address ? "" : ", which looks up that point"}. The address goes to OpenStreetMap&apos;s search, and the point to the Zoning Atlas, RIDEM&apos;s parcel map, RIDOT&apos;s roads, the wetlands inventory and RIPTA&apos;s stops. Nothing is stored.
          </p>
          {inputs.address && state.step === "idle" && <p className="lookup-note">Site: <b>{inputs.address}</b></p>}
        </div>
        <TownPicker />
        <div ref={mapRef} className="site-where-map">
          <ZoningMap placement="site" preview={preview} onPick={pickPoint} onTown={setTown} startStatewide={origin === "example" && inputs.lat == null} />
        </div>
        <div className="site-where-form">{body}</div>
      </div>
    );
  }

  return (
    <div className="panel lookup">
      <h3>Start from an address</h3>
      <p className="sub">
        Looks up the zoning district, the parcel, its area and whether public water and sewer reach it. The address goes to OpenStreetMap&apos;s
        search, and the point to the Rhode Island Zoning Atlas and RIDEM&apos;s parcel map. Nothing is stored.
      </p>
      {form}
      {map && <ZoningMap placement="address" preview={preview} onPick={pickPoint} />}
      {body}
    </div>
  );
}
