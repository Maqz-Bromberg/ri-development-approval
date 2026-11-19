"use client";

import { shortAddress } from "@/lib/lookup";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { housingTypeLabel, treatmentFor } from "@/lib/data/atlas";
import { historyFor, precedentId } from "@/lib/data/history";
import { TREES } from "@/lib/data/state/trees";
import { fmt } from "@/lib/engine";
import {
  RADIUS, ROUTE_COLOR, STRUCTURE, STRUCTURE_ORDER, ZONE_KIND, ZONE_KIND_ORDER, districtShapes, esc, inRings, metresBetween, parcelsNear, ringCenter, townShapes, zoneKind,
  type DistrictShape, type LatLon, type Parcel, type StructureClass, type TownShape, type ZoneKind,
} from "@/lib/map";
import { LEVELS, TOWNS, levelInPart, marksLine, townInfo } from "@/lib/data/towns";
import type { PrecedentStatus, TreeId } from "@/lib/types";
import { useAtlas } from "./useAtlas";
import { useProject } from "./ProjectProvider";
import type { Pin } from "./ZoningMapView";
import { routeText } from "@/lib/engine";

const ZoningMapView = dynamic(() => import("./ZoningMapView"), {
  ssr: false,
  loading: () => <div className="zm-canvas zm-wait">Loading the map…</div>,
});

type Mode = "structure" | "route";
const PLATLOT = /^[A-Z]{2} \d{3}-\d{4}-\d{3}$/;
const SHAPE: Record<PrecedentStatus, Pin["shape"]> = { approved: "dot", pending: "ring", unknown: "ring", administrative: "square", denied: "cross" };
const SHAPE_LABEL = { dot: "Approved", ring: "Pending or not stated", square: "Approved by staff", cross: "Denied" } as const;

/** Four corners of the circle the parcels are drawn in, to fit the view to. */
function circleBox([lat, lon]: LatLon, m: number): LatLon[] {
  const dLat = m / 111320, dLon = m / (111320 * Math.cos((lat * Math.PI) / 180));
  return [[lat - dLat, lon - dLon], [lat + dLat, lon + dLon]];
}

const NO_DISTRICTS: DistrictShape[] = [];

/** True once `key` has stood unchanged for `ms`: a wait that has gone on long enough to say so. Null is not waiting. */
function useSlow(key: string | null, ms = 5000): boolean {
  const [slowKey, setSlowKey] = useState<string | null>(null);
  useEffect(() => {
    if (!key) return;
    const t = setTimeout(() => setSlowKey(key), ms);
    return () => clearTimeout(t);
  }, [key, ms]);
  return key !== null && slowKey === key;
}
const distLabel = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);

export type MapPlacement = "wide" | "beside" | "address" | "site";

/** Shade of a town in the statewide view: darker for more of it read. */
const LEVEL_FILL: Record<number, number> = { 1: 0.08, 2: 0.2, 3: 0.34, 4: 0.55 };
/** A level reached on marks read only in part: halfway to the level below (ARD D68). */
const LEVEL_PART_FILL: Record<number, number> = { 1: 0.08, 2: 0.14, 3: 0.27, 4: 0.44 };

/**
 * Where the project sits: its district among the town's, the parcels around it by structure type, and recent
 * projects by route. In the address step (`placement="address"`) it also previews a found place before its
 * facts are applied, and a click on the map looks up that point (`onPick`).
 */
export function ZoningMap({ placement = "beside", preview = null, onPick, onTown, startStatewide = false }: {
  placement?: MapPlacement;
  /** A place the address lookup found but hasn't applied yet */
  preview?: { at: LatLon; label: string } | null;
  onPick?: (lat: number, lon: number) => void;
  /** With this, the map can show all 39 towns, and a click on one picks it */
  onTown?: (name: string) => void;
  /** Open on the statewide view */
  startStatewide?: boolean;
}) {
  const { inputs } = useProject();
  const [statewide, setStatewide] = useState(startStatewide && !!onTown);
  // A town picked anywhere (the list or the map) brings the map down to that town.
  const firstTown = useRef(inputs.town);
  useEffect(() => { if (inputs.town !== firstTown.current) { firstTown.current = inputs.town; setStatewide(false); } }, [inputs.town]);
  // A place found by the lookup is shown in its town, not on the statewide view.
  useEffect(() => { if (preview) setStatewide(false); }, [preview]);
  // The statewide start follows the project: on for the example, off once a site is placed or a saved project loads.
  useEffect(() => { setStatewide(startStatewide && !!onTown); }, [startStatewide]); // eslint-disable-line react-hooks/exhaustive-deps
  const { districts: atlas } = useAtlas();
  const [mode, setMode] = useState<Mode>("structure");
  // "Open in the zoning map" links from the records arrive with ?map=route.
  useEffect(() => { if (new URLSearchParams(window.location.search).get("map") === "route") setMode("route"); }, []);
  // The key filters the zoning: hover fades the other kinds, a click keeps only that kind, a second click resets.
  const [kindOnly, setKindOnly] = useState<ZoneKind | null>(null);
  const [kindHover, setKindHover] = useState<ZoneKind | null>(null);
  const [structOnly, setStructOnly] = useState<StructureClass | null>(null);
  const [structHover, setStructHover] = useState<StructureClass | null>(null);
  const [hideZoning, setHideZoning] = useState(false);
  const [satellite, setSatellite] = useState(false);
  const [keyOpen, setKeyOpen] = useState(true);
  const zoomApi = useRef<{ zoomIn: () => void; zoomOut: () => void } | null>(null);
  const [hideParcels, setHideParcels] = useState(false);
  const zoningOff = hideZoning || kindOnly !== null;
  const [picked, setPicked] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const expandBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  // Expanded, the map is a modal: Escape closes it, the page behind doesn't scroll, focus goes in and comes back.
  useEffect(() => {
    if (!expanded) return;
    const back = expandBtn.current;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setExpanded(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); back?.focus(); };
  }, [expanded]);

  // Nothing is fetched, and Leaflet isn't loaded, until the map is near the screen.
  const box = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = box.current;
    if (!node || seen) return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) setSeen(true); }, { rootMargin: "300px" });
    io.observe(node);
    return () => io.disconnect();
  }, [seen]);

  const town = inputs.town;
  const [shapes, setShapes] = useState<{ town: string; list: DistrictShape[]; error?: boolean } | null>(null);
  // "Try again" after a failure bumps this, which asks the services again.
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!seen) return;
    let alive = true;
    setShapes((sh) => (sh?.town === town && !sh.error ? sh : null));
    districtShapes(town)
      .then((list) => { if (alive) setShapes({ town, list }); })
      .catch(() => { if (alive) setShapes({ town, list: [], error: true }); });
    return () => { alive = false; };
  }, [seen, town, retry]);
  const districts = statewide ? NO_DISTRICTS : shapes?.town === town ? shapes.list : NO_DISTRICTS;
  const [towns, setTowns] = useState<TownShape[] | null>(null);
  const [townsError, setTownsError] = useState(false);
  useEffect(() => {
    if (!seen || !statewide || towns) return;
    let alive = true;
    setTownsError(false);
    townShapes().then((t) => { if (alive) setTowns(t); }).catch(() => { if (alive) setTownsError(true); });
    return () => { alive = false; };
  }, [seen, statewide, towns, retry]);
  const townTip = (name: string) => {
    const t = townInfo(name), shape = towns?.find((x) => x.name === name);
    return `<b>${esc(name)}</b><br>Level ${t.level}: ${esc(LEVELS[t.level].name)}${t.trial ? " (trial)" : ""}`
      + `<br>${esc(marksLine(t.marks))}`
      + (t.parts ?? []).map((p) => `<br>${esc(p.name)}: level ${p.level}`).join("")
      + (shape?.districts ? `<br>${shape.districts} zoning districts` : "")
      + (shape?.by4 ? `<br>4+ family by right on ${esc(shape.by4)} of the land (Atlas)` : "")
      + (name === town ? "<br><i>The project's town</i>" : "<br><i>Click to choose</i>");
  };

  // Points are memoised: a new array each render would redraw every parcel on every keystroke in the form.
  const site = useMemo<LatLon | null>(() => (inputs.lat != null && inputs.lon != null ? [inputs.lat, inputs.lon] : null), [inputs.lat, inputs.lon]);
  const siteKey = site ? `${site[0].toFixed(6)},${site[1].toFixed(6)}` : "";
  // The map centres on a found-but-unapplied place when there is one, otherwise on the project's site.
  const previewAt = preview?.at ?? null;
  const focus = useMemo<LatLon | null>(() => previewAt ?? site, [previewAt, site]);
  const focusKey = focus ? `${focus[0].toFixed(6)},${focus[1].toFixed(6)}` : "";
  const [near, setNear] = useState<{ key: string; parcels: Parcel[] | null; truncated?: boolean; error?: boolean } | null>(null);
  useEffect(() => {
    if (!seen || !focusKey || statewide) return;
    const [lat, lon] = focusKey.split(",").map(Number);
    const ac = new AbortController();
    setNear({ key: focusKey, parcels: null });
    parcelsNear(lat, lon, ac.signal)
      .then((r) => setNear({ key: focusKey, parcels: r.parcels, truncated: r.truncated }))
      .catch(() => { if (!ac.signal.aborted) setNear({ key: focusKey, parcels: [], error: true }); });
    return () => ac.abort();
  }, [seen, focusKey, statewide, retry]);
  const parcels = !statewide && near?.key === focusKey && focusKey ? near.parcels : null;
  const loadingParcels = !statewide && !!focusKey && seen && (!near || near.key !== focusKey || near.parcels === null);
  const loadingDistricts = !statewide && seen && (!shapes || shapes.town !== town);
  const loadingTowns = statewide && seen && !towns && !townsError;
  const slowDistricts = useSlow(loadingDistricts ? `d|${town}|${retry}` : null);
  const slowParcels = useSlow(loadingParcels ? `p|${focusKey}|${retry}` : null);
  const slowTowns = useSlow(loadingTowns ? `t|${retry}` : null);

  /** The parcel outlined: the found place's, or the site's (by plat/lot when the form has one, else by the point) */
  const siteParcel = useMemo(() => {
    if (!parcels || !focus) return null;
    if (!preview && PLATLOT.test(inputs.parcel) && parcels.some((p) => p.id === inputs.parcel)) return inputs.parcel;
    return parcels.find((p) => inRings(focus, p.rings))?.id ?? null;
  }, [parcels, focusKey, inputs.parcel]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => {
    const c = Object.fromEntries(STRUCTURE_ORDER.map((k) => [k, 0])) as Record<StructureClass, number>;
    (parcels ?? []).forEach((p) => { if (p.id !== siteParcel) c[p.cls]++; });
    return c;
  }, [parcels, siteParcel]);

  // Pins are the recorded projects of the project's own town.
  const projects = useMemo(
    () => historyFor(town).filter((h) => h.at).map((h) => ({
      h, at: [h.at!.lat, h.at!.lon] as LatLon, dist: site ? metresBetween(site, [h.at!.lat, h.at!.lon]) : null,
    })).sort((a, b) => (a.dist ?? 0) - (b.dist ?? 0)),
    [town, siteKey], // eslint-disable-line react-hooks/exhaustive-deps
  );
  // With a site, the route view takes the same surrounding as the structure view: projects within RADIUS only.
  const shown = useMemo(() => (site ? projects.filter((p) => p.dist !== null && p.dist <= RADIUS) : projects), [projects, site]);
  const elsewhere = projects.length - shown.length;
  const routes = [...new Set(shown.map((p) => p.h.route))] as TreeId[];

  const pins: Pin[] = useMemo(() => (mode === "route" && !statewide ? shown.map(({ h, at, dist }) => ({
    key: h.name, at, color: ROUTE_COLOR[h.route] ?? "#a3a9a2", shape: SHAPE[h.status],
    tip: `<b>${esc(h.name)}</b><br>${h.units} unit${h.units === 1 ? "" : "s"}${h.aff ? `, ${h.aff} affordable` : ""} · ${esc(routeText(h.route, h.town).name)}<br>${esc(h.statusLabel)}`
      + (dist !== null ? `<br>${distLabel(dist)} from your site` : "")
      + (h.at!.exact ? "" : "<br><i>Placed at the street address; parcel not confirmed</i>"),
  })) : []), [mode, shown, statewide]);

  const districtTip = (abbr: string) => {
    const d = atlas.find((x) => x.abbrvname === abbr);
    const shape = districts.find((x) => x.abbr === abbr);
    const t = treatmentFor(d, inputs.units);
    return `<b>${esc(abbr)}</b> ${esc(shape?.name ?? d?.name ?? "")}<br><span class="zm-sub">${esc(ZONE_KIND[zoneKind(shape?.type ?? d?.type)].label)}</span>`
      + `<br>${housingTypeLabel(inputs.units)} housing: ${t.raw ? esc(t.raw.toLowerCase()) : "not in the atlas"}`
      + (abbr === inputs.zone ? "<br><i>The project's district</i>" : "");
  };
  const parcelTip = (p: Parcel) => {
    const at = ringCenter(p.rings);
    const d = districts.find((x) => inRings(at, x.rings));
    const cls = STRUCTURE[p.cls].label;
    const lines = [
      `<b>${esc(p.desc)}</b>${p.desc.toLowerCase() === cls.toLowerCase() || p.desc === "No structure recorded" ? "" : ` <span class="zm-sub">(${esc(cls)})</span>`}`,
      `${esc(p.id)}${p.acres !== null ? ` · ${p.acres.toFixed(2)} acres` : ""}`,
      p.pctImp !== null && p.impSqft ? `${Math.round(p.pctImp * 100)}% impervious (${fmt(p.impSqft)} sq ft)` : "",
      d ? `District ${esc(d.abbr)}` : "",
      p.id === siteParcel ? (preview ? "<i>The place found</i>" : "<i>Your site</i>") : "",
    ];
    return lines.filter(Boolean).join("<br>");
  };
  const previewTip = preview ? `<b>Found: not applied yet</b><br>${esc(preview.label.split(",").slice(0, 2).join(","))}` : "";
  const siteTip = `<b>Your site</b>${inputs.address ? `<br>${esc(shortAddress(inputs.address))}` : ""}${siteParcel ? `<br>${esc(siteParcel)}` : ""}`;

  // Refit when the site, the town or the mode changes; not when parcels finish loading.
  const fit = useMemo(() => {
    const own = districts.filter((d) => d.abbr === inputs.zone).flatMap((d) => d.rings.flat());
    const all = districts.flatMap((d) => d.rings.flat());
    let points: LatLon[];
    if (statewide) return { key: `state|${towns?.length ?? 0}`, points: (towns ?? []).flatMap((t) => t.rings.flat()) };
    if (mode === "route" && !focus && shown.length) points = shown.map((p) => p.at);
    else if (focus) points = circleBox(focus, RADIUS);
    else points = own.length ? own : all;
    return { key: `${mode}|${focusKey}|${town}|${inputs.zone}|${districts.length > 0}`, points };
  }, [mode, focusKey, town, inputs.zone, districts, shown, statewide, towns]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (key: string) => {
    setPicked(key);
    document.getElementById(`zm-p-${precedentId(key)}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  // The map's own buttons, drawn here so they can sit in the corner of the map or at the top of the key laid over it.
  const mapButtons = (
    <>
      <span className="zm-zoom" role="group" aria-label="Zoom">
        <button type="button" aria-label="Zoom in" onClick={() => zoomApi.current?.zoomIn()}>+</button>
        <button type="button" aria-label="Zoom out" onClick={() => zoomApi.current?.zoomOut()}>&minus;</button>
      </span>
      <span className="seg zm-base zm-icons" role="group" aria-label="Base map">
        <button type="button" aria-pressed={!satellite} aria-label="Map" title="Map" onClick={() => setSatellite(false)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
            <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" /><path d="M9 4v13.5M15 6.5V20" />
          </svg>
        </button>
        <button type="button" aria-pressed={satellite} aria-label="Satellite" title="Satellite" onClick={() => setSatellite(true)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
            <rect x="9" y="9" width="6" height="6" rx="1" transform="rotate(45 12 12)" /><path d="M5.5 5.5 8.5 8.5M15.5 15.5l3 3M14.5 3.5l6 6M3.5 14.5l6 6" />
          </svg>
        </button>
      </span>
    </>
  );
  const zoneKey = (
    <div className="zm-keycol">
      <p className="zm-keyhead zm-kh-zone">
        <button type="button" className={zoningOff ? "is-off" : undefined} aria-pressed={!hideZoning} onClick={() => { if (hideZoning) setHideZoning(false); else { setKindOnly(null); setHideZoning(true); } }}>
          <span aria-hidden="true" className="zm-kh-icon" />Zoning district
        </button>
      </p>
      <ul className="zm-legend zm-kinds" aria-label="Zoning districts by kind">
        {ZONE_KIND_ORDER.map((k) => (
          <li key={k}>
            <button
              type="button" className={`zm-kind${kindOnly === k ? " is-on" : ""}`} aria-pressed={kindOnly === k}
              onClick={() => { setHideZoning(false); setKindOnly(kindOnly === k ? null : k); }}
              onMouseEnter={() => setKindHover(k)} onMouseLeave={() => setKindHover(null)}
              onFocus={() => setKindHover(k)} onBlur={() => setKindHover(null)}
            >
              <span className="zm-swatch" style={{ background: ZONE_KIND[k].color }} aria-hidden="true" />{ZONE_KIND[k].label}
            </button>
          </li>
        ))}
        {inputs.zone !== "other" && <li><span className="zm-swatch site" aria-hidden="true" />{inputs.zone}, the project&apos;s district</li>}
      </ul>
    </div>
  );
  const parcelHead = (
      <p className="zm-keyhead zm-kh-parcel"><button type="button" className={hideParcels ? "is-off" : undefined} aria-pressed={!hideParcels} onClick={() => setHideParcels(!hideParcels)}><span aria-hidden="true" className="zm-kh-icon" />{mode === "structure" ? `Parcels within ${RADIUS}m` : `Projects within ${RADIUS}m`}</button></p>
  );
  const parcelLegend = mode === "structure" ? (
    <>
          <ul className="zm-legend zm-parcelkey" aria-label={site ? `Parcels within ${RADIUS} m by structure type` : "Structure types"}>
            {STRUCTURE_ORDER.map((k) => (
              <li key={k} title={STRUCTURE[k].note}>
                <button
                  type="button" className={`zm-kind${structOnly === k ? " is-on" : ""}`} aria-pressed={structOnly === k}
                  onClick={() => setStructOnly(structOnly === k ? null : k)}
                  onMouseEnter={() => setStructHover(k)} onMouseLeave={() => setStructHover(null)}
                  onFocus={() => setStructHover(k)} onBlur={() => setStructHover(null)}
                >
                  <span className={`zm-swatch${STRUCTURE[k].color ? "" : " empty"}`} style={STRUCTURE[k].color ? { background: STRUCTURE[k].color } : undefined} aria-hidden="true" />
                  {STRUCTURE[k].label}{parcels ? <b className="mono">{counts[k]}</b> : null}
                </button>
              </li>
            ))}
            {site && <li><span className="zm-swatch site" aria-hidden="true" />Your site</li>}
            {preview && <li><span className="zm-swatch found" aria-hidden="true" />Place found, not applied</li>}
          </ul>
    </>
  ) : (
    <>
          <ul className="zm-legend zm-parcelkey" aria-label="Approval routes">
            {routes.map((r) => (
              <li key={r}><span className="zm-swatch" style={{ background: ROUTE_COLOR[r] }} aria-hidden="true" />{TREES[r].name}</li>
            ))}
            {(["dot", "ring", "square", "cross"] as const).map((s) => (
              <li key={s}><span className={`zm-shape ${s}`} aria-hidden="true" />{SHAPE_LABEL[s]}</li>
            ))}
          </ul>
    </>
  );
  const keyExtras = mode === "structure" ? (
    <>
          <p className="small muted zm-note">
            Types are the state's E-911 structure points on each tax parcel, not zoning uses or unit counts. "Multi-family" covers a two-family house and an apartment block alike.
            {near?.truncated && " The area is dense, and only the first 6,000 parcels are drawn."}
          </p>
    </>
  ) : (
    <>
          {shown.length ? (
            <ol className="zm-projects">
              {shown.map(({ h, dist }) => (
                <li key={h.name} id={`zm-p-${precedentId(h.name)}`} className={picked === h.name ? "is-picked" : undefined}>
                  <span className={`zm-shape ${SHAPE[h.status]}`} style={{ "--c": ROUTE_COLOR[h.route] } as React.CSSProperties} aria-hidden="true" />
                  <span>
                    <Link href={`/records#p-${precedentId(h.name)}`}><b>{h.name}</b></Link>{" "}
                    <span className="muted">{h.units} units{h.aff ? `, ${h.aff} affordable` : ""} · {routeText(h.route, h.town).name} · {h.statusLabel}</span>
                  </span>
                  <span className="mono small">{dist !== null ? distLabel(dist) : h.zone || ""}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="small muted zm-note">{projects.length ? `No recorded projects lie within ${RADIUS} m of the site.` : `No projects have been read into the records for ${town} yet. Cumberland's are in the precedent table.`}</p>
          )}
          {projects.length > 0 && <p className="small muted zm-note">{town} multifamily projects from board records. Select a pin to find it in the list.{site ? ` Only projects within ${RADIUS} m of your site are shown, with distances from it.${elsewhere ? ` ${elsewhere} more in town are further away; see the precedent table.` : ""}` : ""}</p>}
    </>
  );

  return (
    <>
    {expanded && <div className="zm-backdrop" onClick={() => setExpanded(false)} aria-hidden="true" />}
    <div
      className={`${placement === "address" || placement === "site" ? "zm-inset" : "panel"} zm zm-${placement}${expanded ? " is-expanded" : ""}${onPick ? " can-pick" : ""}${statewide ? " zm-statewide" : ""} zm-keyed`}
      ref={box}
      {...(expanded ? { role: "dialog", "aria-modal": true, "aria-label": "Zoning map, expanded" } : {})}
    >
      <div className="zm-head">
        <div>
          {placement !== "address" && <h3>{statewide ? "Rhode Island's 39 municipalities" : placement === "site" ? `${town}, on the map` : "Where it sits"}</h3>}
          <p className="sub">
            {statewide
              ? "Shaded by how much of each town this site has read. Hover for its zoning, click to choose it."
              : preview
              ? `The place found, with the parcels within ${RADIUS} m. Use its facts by the address above${onPick ? ", or click elsewhere to look up another point" : ""}.`
              : focus
                ? `Parcels within ${RADIUS} m of the site, coloured by ${mode === "structure" ? "the building the state records on each" : "nothing: the pins carry the colour"}. Hover for details.`
                : onPick
                  ? `${town}'s zoning districts. Search an address above, or click the map to look up a point.`
                  : `${town}'s zoning districts, with ${inputs.zone === "other" ? "no district chosen yet" : `${inputs.zone} tinted`}. Look up an address to see the parcels around your site.`}
          </p>
        </div>
        <div className="zm-tools">
          {onTown && (
            <button type="button" className="btn ghost zm-expand" aria-pressed={statewide} onClick={() => setStatewide(!statewide)}>
              {statewide ? `Back to ${town}` : "All 39 towns"}
            </button>
          )}
          {!statewide && <div className="seg zm-mode" role="group" aria-label="Colour by">
            <button type="button" aria-pressed={mode === "structure"} onClick={() => setMode("structure")}>Structure type</button>
            <button type="button" aria-pressed={mode === "route"} onClick={() => setMode("route")}>Approval route</button>
          </div>}
          {expanded
            ? <button type="button" ref={closeBtn} className="btn ghost zm-expand" onClick={() => setExpanded(false)}>Close ✕</button>
            : <button type="button" ref={expandBtn} className="btn ghost zm-expand" onClick={() => setExpanded(true)} aria-label="Expand the map">Expand ⤢</button>}
        </div>
      </div>

      <div className="zm-frame">
        {seen ? (
          <ZoningMapView
            districts={districts} zone={inputs.zone} districtTip={districtTip}
            parcels={parcels} parcelTip={parcelTip} mode={mode}
            site={site} siteTip={siteTip} siteParcel={siteParcel}
            preview={previewAt} previewTip={previewTip} ring={focus}
            structOnly={structOnly} structHover={structHover} satellite={satellite} onApi={(a) => { zoomApi.current = a; }} kindOnly={kindOnly} kindHover={kindHover} hideZoning={hideZoning} hideParcels={hideParcels}
            pins={pins} onPin={pick} fit={fit} onMapClick={statewide ? undefined : onPick}
            towns={statewide ? towns ?? [] : null} town={town} townTip={townTip}
            townFill={(n) => { const t = townInfo(n); return (levelInPart(t) ? LEVEL_PART_FILL : LEVEL_FILL)[t.level] ?? 0.05; }}
            onTown={(n) => { onTown?.(n); setStatewide(false); }}
          />
        ) : <div className="zm-canvas zm-wait">The map loads when you scroll to it.</div>}
        {/* The key: a panel on the map's right edge that folds into a tab at its middle and opens to the left (ARD D40, amended 2026-11-18).
            The district key is in the map from 1200 px, and under it below that; the statewide key is in the map at every width. */}
        <div className={`zm-overlay${keyOpen ? "" : " is-folded"}${statewide ? " is-state" : ""}`}>
          <button type="button" className="zm-ovhead" aria-expanded={keyOpen} aria-controls={`${placement}-zm-key`} onClick={() => setKeyOpen(!keyOpen)}>
            <span className="zm-ovchev" aria-hidden="true">{keyOpen ? "▸" : "◂"}</span><span className="zm-ovlabel">Key</span>
            <span className="sr-only">{keyOpen ? ": hide it" : ": show it"}</span>
          </button>
          {keyOpen && (
            <div className="zm-ovbody" id={`${placement}-zm-key`}>
              {statewide ? (
                <ul className="zm-legend" aria-label="How much of each town is read">
                  {([4, 3, 2, 1] as const).flatMap((l) => {
                    const n = TOWNS.filter((t) => t.level === l), part = n.filter(levelInPart).length, full = n.length - part;
                    const row = (k: string, fill: number, label: string, count: number) => <li key={k}><span className="zm-swatch" style={{ background: `rgba(46, 109, 180, ${fill})`, border: "1px solid #9aa39c" }} aria-hidden="true" />{label} <span className="muted">· {count}</span></li>;
                    return [...(full ? [row(`${l}`, LEVEL_FILL[l], `Level ${l}: ${LEVELS[l].name}`, full)] : []), ...(part ? [row(`${l}p`, LEVEL_PART_FILL[l], `Level ${l}, in part`, part)] : [])];
                  })}
                  <li><span className="zm-swatch site" aria-hidden="true" />{town}, the project&apos;s town</li>
                </ul>
              ) : <>{zoneKey}<div className="zm-keycol">{parcelHead}{parcelLegend}</div></>}
            </div>
          )}
        </div>
        {seen && <div className="zm-mapctl">{mapButtons}</div>}
        {(() => {
          // One line for what is being read, one for what did not answer, each naming the services (ARD D48, amended).
          const reading = [
            loadingTowns && { what: "the town outlines", from: "Zoning Atlas", slow: slowTowns },
            loadingDistricts && { what: `${town}'s zoning districts`, from: "Zoning Atlas", slow: slowDistricts },
            loadingParcels && { what: "the parcels around the site", from: "state parcel map", slow: slowParcels },
          ].filter(Boolean) as { what: string; from: string; slow: boolean }[];
          const failed = [
            statewide && townsError && { who: "the Zoning Atlas", missing: "the town outlines" },
            !statewide && shapes?.error && shapes.town === town && { who: "the Zoning Atlas", missing: `${town}'s district outlines` },
            near?.error && near.key === focusKey && { who: "the state parcel map", missing: "the parcels around the site" },
          ].filter(Boolean) as { who: string; missing: string }[];
          const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
          const sources = [...new Set(reading.map((r) => r.from))];
          const whos = [...new Set(failed.map((f) => f.who))];
          return (
            <div className="zm-statuses" role="status">
              {reading.length > 0 && (
                <p className="zm-status is-wait">
                  <span className="lk-dots" aria-hidden="true"><i /><i /><i /></span>
                  Reading {list(reading.map((r) => r.what))} from the {list(sources)}
                  {reading.some((r) => r.slow) ? ". Still waiting after 5 seconds; each request gets 20 to 30 before it counts as not answering." : ""}
                </p>
              )}
              {failed.length > 0 && (
                <p className="zm-status is-fail">
                  <span>
                    <b>Not answering: {list(whos)}.</b> Missing: {list(failed.map((f) => f.missing))}.
                    {failed.some((f) => f.who === "the Zoning Atlas") ? (statewide ? " Pick the town from the list." : " The district can still be chosen from the list.") : ""}
                  </span>
                  <button type="button" className="link-btn" onClick={() => setRetry((r) => r + 1)}>Try again</button>
                </p>
              )}
            </div>
          );
        })()}
      </div>

      {!statewide && (
      <>
      <div className="zm-keycols zm-below-key">
        {zoneKey}
        <div className="zm-keycol">{parcelHead}{parcelLegend}</div>
      </div>
      {keyExtras}
      </>
      )}
    </div>
    </>
  );
}
