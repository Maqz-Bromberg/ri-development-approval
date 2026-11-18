"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TOWNS, townInfo } from "@/lib/data/towns";
import { fmt } from "@/lib/engine";
import { LOOKUP_SERVICES, geocode, lookUpPoint, outlinePath, repinParcel, unanswered, type Candidate, type LookupService, type SiteFacts, type SiteSuggestions } from "@/lib/lookup";
import { AppliedDoc } from "./FactCheck";
import { Info } from "./Info";
import { useProject } from "./ProjectProvider";
import { TownPicker, useSetTown } from "./TownPicker";
import { ZoningMap } from "./ZoningMap";

type State =
  | { step: "idle" }
  /** `services` is filled in as each map service answers; `at` tells one wait from the next */
  | { step: "working"; note: string; at: number; services?: Partial<Record<LookupService, boolean>> }
  /** The point is known, but neither the Zoning Atlas nor the parcel map answered */
  | { step: "unreached"; place: Candidate }
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

/** The address to keep for a found place: its first three parts, with a house number joined to its street ("250 Wickenden Street"). */
function siteAddress(label: string): string {
  if (label.startsWith("Map point")) return "";
  return label.split(",").slice(0, 3).join(",").replace(/^(\d+[A-Za-z]?(?:-\d+)?),\s*/, "$1 ");
}

/**
 * Where the project is. The town from a list or from the statewide map, then an address, or a click on the map,
 * which looks up the zoning district, the parcel, its area, public water and sewer, and suggests three facts the
 * applicant ticks by hand (state road, wetlands, transit). With `layout="site"` the map sits beside it.
 */
export function AddressLookup({ map = false, layout = "stack" }: { map?: boolean; layout?: "stack" | "site" } = {}) {
  const { inputs, setInput, origin } = useProject();
  const setTownRaw = useSetTown();
  // A town set by the lookup itself, so the watch below can tell it from one the visitor picked.
  const ownMove = useRef<string | null>(null);
  const setTown = (name: string) => { if (name !== townNow.current) ownMove.current = name; setTownRaw(name); };
  const [q, setQ] = useState(inputs.address);
  const [state, setState] = useState<State>({ step: "idle" });
  const [applied, setApplied] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const townNow = useRef(inputs.town);
  townNow.current = inputs.town;
  /*
   * A town picked by the visitor, from the list or the map, wins over the lookup: a lookup still running is stopped,
   * and a result from another town is put away, so it cannot move the municipality back when it lands.
   */
  useEffect(() => {
    if (ownMove.current === inputs.town) { ownMove.current = null; return; }
    ownMove.current = null;
    setState((st) => {
      if (st.step === "working" || st.step === "pick" || st.step === "unreached") { abort.current?.abort(); return { step: "idle" }; }
      if (st.step === "found" && st.facts.town !== inputs.town) { setQ(""); return { step: "idle" }; }
      return st;
    });
  }, [inputs.town]);
  const mapRef = useRef<HTMLDivElement>(null);

  const locate = async (place: Candidate) => {
    abort.current?.abort();
    const ac = new AbortController();
    abort.current = ac;
    setApplied(false);
    const at = Date.now();
    setState({ step: "working", note: "Reading the map layers for this point", at, services: {} });
    const onService = (key: LookupService, ok: boolean) =>
      setState((st) => (st.step === "working" && st.at === at ? { ...st, services: { ...st.services, [key]: ok } } : st));
    try {
      const { facts, suggest } = await lookUpPoint(place.lat, place.lon, ac.signal, onService);
      if (ac.signal.aborted) return;
      if (unanswered(facts)) { setState({ step: "unreached", place }); return; }
      // The address and the municipality must not disagree: a place found in another town moves the municipality there at once.
      if (facts.town && facts.town !== townNow.current && TOWNS.some((t) => t.name === facts.town)) setTown(facts.town);
      setState({ step: "found", place, facts, suggest });
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
    setState({ step: "working", note: "Finding the address on OpenStreetMap", at: Date.now() });
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
    setInput("address", siteAddress(place.label));
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

  // People wait about five seconds. After that the wait says what it is still waiting on, and offers a way out.
  const [slowAt, setSlowAt] = useState(0);
  const waitAt = state.step === "working" ? state.at : 0;
  useEffect(() => {
    if (!waitAt) return;
    const t = setTimeout(() => setSlowAt(waitAt), 5000);
    return () => clearTimeout(t);
  }, [waitAt]);
  const slow = waitAt !== 0 && slowAt === waitAt;
  const stop = () => { abort.current?.abort(); setState({ step: "idle" }); };
  const usePointOnly = (place: Candidate) => {
    setInput("address", siteAddress(place.label));
    setInput("lat", place.lat);
    setInput("lon", place.lon);
    setState({ step: "idle" });
  };

  const body = (
    <div aria-live="polite">
      {state.step === "working" && (
        <div className="lk-wait">
          <p className="lookup-note lk-wait-note"><span className="lk-dots" aria-hidden="true"><i /><i /><i /></span>{state.note}</p>
          {state.services && (
            <ul className="lk-services" aria-label="Map services">
              {LOOKUP_SERVICES.map((sv) => {
                const v = state.services?.[sv.key];
                return <li key={sv.key} className={v === undefined ? "is-wait" : v ? "is-ok" : "is-fail"}><span className="lk-sv-mark" aria-hidden="true" />{sv.label}<span className="sr-only">{v === undefined ? ": waiting" : v ? ": answered" : ": didn't answer"}</span></li>;
              })}
            </ul>
          )}
          {slow && (
            <p className="lookup-note is-warn lk-slow" role="status">
              {(() => {
                const waiting = state.services ? LOOKUP_SERVICES.filter((sv) => state.services?.[sv.key] === undefined).map((sv) => sv.label) : ["the address search"];
                return <>Still waiting on {waiting.join(", ")} after 5 seconds. The state&apos;s map services are often slow; each gets 20 seconds before it counts as not answering.</>;
              })()}{" "}
              <button type="button" className="link-btn" onClick={stop}>Stop, and enter the facts by hand</button>
            </p>
          )}
        </div>
      )}
      {state.step === "unreached" && (
        <div className="lk-unreached" role="alert">
          <p className="lookup-note is-error"><b>None of the map services answered.</b> The Zoning Atlas and the state parcel map both failed or took longer than 20 seconds, so nothing is known about this point yet.</p>
          <p className="small muted">This usually means the services are down for maintenance, or the network you are on blocks them (some office and public networks do). The rest of the site works without them: the facts below are yours to enter.</p>
          <div className="actions">
            <button type="button" className="btn" onClick={() => locate(state.place)}>Try again</button>
            <button type="button" className="btn ghost" onClick={() => usePointOnly(state.place)}>Enter the facts by hand</button>
          </div>
        </div>
      )}
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
          <div className={`lookup-result${f.outline ? "" : " no-shape"}`}>
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
                {f.townZone && (
                  <div><dt>On {f.townZone.label}</dt><dd>{f.townZone.zone}{f.zone && f.townZone.zone.replace("RP", "R-P") !== f.zone.replace("RP", "R-P") ? ` (the 2024 Atlas says ${f.zone})` : " (the same)"}</dd></div>
                )}
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
              {f.townZone && f.zone && f.townZone.zone.replace("RP", "R-P") !== f.zone.replace("RP", "R-P") && (
                <p className="lookup-note is-warn">
                  {f.town}&apos;s own zoning map puts the site in {f.townZone.zone}, where the 2024 Zoning Atlas has {f.zone}. The town&apos;s map is the newer of the two; choose {f.townZone.zone} below if it is in the list, and confirm with the planning office.
                </p>
              )}
              {f.failed.length > 0 && <p className="lookup-note is-warn">Couldn&apos;t read: {f.failed.join(", ")}. Enter those by hand.</p>}
              {covered && f.town && !townInfo(f.town).marks.steps && (
                <p className="lookup-note is-warn">
                  {f.town}: local checklists and forms have not been read, so the steps are state law.{townInfo(f.town).marks.offices ? " Its boards and their meetings are from the state Open Meetings site." : " Its boards and contacts have not been read either."}
                </p>
              )}
              {covered && f.town && townInfo(f.town).trial && (
                <p className="lookup-note is-warn">
                  {f.town}: local steps come from a trial reading that the city has not confirmed.{townInfo(f.town).parts?.length && !townInfo(f.town).marks.hearings ? ` Hearings and example projects were read for ${townInfo(f.town).parts!.map((p) => p.name).join(" and ")} only.` : ""}
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
    // The results take the full width, straight under the address and the municipality, above the map (ARD D46, decided 2026-11-18).
    const busy = state.step !== "idle" && !(state.step === "found" && applied);
    return (
      <div className={`site-where${busy ? " is-busy" : ""} lk-below`}>
        <div className="field site-where-address">
          <div className="zp-label">
            <label htmlFor="f-address">Street address</label>
            <Info id="address" />
          </div>
          {form}
          <p className="small muted lk-or">
            Or click the parcel on the map{inputs.address ? "" : ", which looks up that point"}. The address goes to OpenStreetMap&apos;s search, and the point to the Zoning Atlas, RIDEM&apos;s parcel map, RIDOT&apos;s roads, the wetlands inventory and RIPTA&apos;s stops. Nothing is stored.
          </p>
          {(inputs.address || inputs.lat != null) && !busy && (
            <p className="lookup-note lk-site">
              Site: <b>{inputs.address || `map point ${inputs.lat?.toFixed(5)}, ${inputs.lon?.toFixed(5)}`}</b>{applied ? " · facts applied" : ""}
              <AppliedDoc appliedNow={applied} />
            </p>
          )}
        </div>
        <TownPicker />
        {busy && (
          <div className="site-where-form lk-results">
            {body}
            {state.step !== "working" && <button type="button" className="link-btn small lk-dismiss" onClick={stop}>Close the results</button>}
          </div>
        )}
        <div ref={mapRef} className="site-where-map">
          <ZoningMap placement="site" preview={preview} onPick={pickPoint} onTown={setTownRaw} startStatewide={origin === "example" && inputs.lat == null} />
        </div>
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
