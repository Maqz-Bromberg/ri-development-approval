"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { housingTypeLabel, treatmentFor } from "@/lib/data/atlas";
import { HISTORY, precedentId } from "@/lib/data/history";
import { TREES } from "@/lib/data/trees";
import { fmt } from "@/lib/engine";
import {
  RADIUS, ROUTE_COLOR, STRUCTURE, STRUCTURE_ORDER, districtShapes, esc, inRings, metresBetween, parcelsNear, ringCenter,
  type DistrictShape, type LatLon, type Parcel, type StructureClass,
} from "@/lib/map";
import type { PrecedentStatus, TreeId } from "@/lib/types";
import { useAtlas } from "./useAtlas";
import { useProject } from "./ProjectProvider";
import type { Pin } from "./ZoningMapView";

const ZoningMapView = dynamic(() => import("./ZoningMapView"), {
  ssr: false,
  loading: () => <div className="zm-canvas zm-wait">Loading the map…</div>,
});

type Mode = "structure" | "route";
const PLATLOT = /^[A-Z]{2} \d{3}-\d{4}-\d{3}$/;
const SHAPE: Record<PrecedentStatus, Pin["shape"]> = { approved: "dot", pending: "ring", unknown: "ring", administrative: "square" };
const SHAPE_LABEL = { dot: "Approved", ring: "Pending or not stated", square: "Approved by staff" } as const;

/** Four corners of the circle the parcels are drawn in, to fit the view to. */
function circleBox([lat, lon]: LatLon, m: number): LatLon[] {
  const dLat = m / 111320, dLon = m / (111320 * Math.cos((lat * Math.PI) / 180));
  return [[lat - dLat, lon - dLon], [lat + dLat, lon + dLon]];
}

const distLabel = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);

/** Where the project sits: its district among the town's, the parcels around it by structure type, and recent projects by route. */
export function ZoningMap() {
  const { inputs } = useProject();
  const { districts: atlas } = useAtlas();
  const [mode, setMode] = useState<Mode>("structure");
  const [picked, setPicked] = useState<string | null>(null);

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
  useEffect(() => {
    if (!seen) return;
    let alive = true;
    districtShapes(town)
      .then((list) => { if (alive) setShapes({ town, list }); })
      .catch(() => { if (alive) setShapes({ town, list: [], error: true }); });
    return () => { alive = false; };
  }, [seen, town]);
  const districts = shapes?.town === town ? shapes.list : [];

  const site: LatLon | null = inputs.lat != null && inputs.lon != null ? [inputs.lat, inputs.lon] : null;
  const siteKey = site ? `${site[0].toFixed(6)},${site[1].toFixed(6)}` : "";
  const [near, setNear] = useState<{ key: string; parcels: Parcel[] | null; truncated?: boolean; error?: boolean } | null>(null);
  useEffect(() => {
    if (!seen || !siteKey) return;
    const [lat, lon] = siteKey.split(",").map(Number);
    const ac = new AbortController();
    setNear({ key: siteKey, parcels: null });
    parcelsNear(lat, lon, ac.signal)
      .then((r) => setNear({ key: siteKey, parcels: r.parcels, truncated: r.truncated }))
      .catch(() => { if (!ac.signal.aborted) setNear({ key: siteKey, parcels: [], error: true }); });
    return () => ac.abort();
  }, [seen, siteKey]);
  const parcels = near?.key === siteKey && siteKey ? near.parcels : null;
  const loadingParcels = !!siteKey && seen && (!near || near.key !== siteKey || near.parcels === null);

  const siteParcel = useMemo(() => {
    if (!parcels || !site) return null;
    if (PLATLOT.test(inputs.parcel) && parcels.some((p) => p.id === inputs.parcel)) return inputs.parcel;
    return parcels.find((p) => inRings(site, p.rings))?.id ?? null;
  }, [parcels, siteKey, inputs.parcel]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => {
    const c = Object.fromEntries(STRUCTURE_ORDER.map((k) => [k, 0])) as Record<StructureClass, number>;
    (parcels ?? []).forEach((p) => { if (p.id !== siteParcel) c[p.cls]++; });
    return c;
  }, [parcels, siteParcel]);

  // Recorded projects are Cumberland's only, so pins show for Cumberland projects only.
  const projects = useMemo(
    () => (town === "Cumberland" ? HISTORY.filter((h) => h.at) : []).map((h) => ({
      h, at: [h.at!.lat, h.at!.lon] as LatLon, dist: site ? metresBetween(site, [h.at!.lat, h.at!.lon]) : null,
    })).sort((a, b) => (a.dist ?? 0) - (b.dist ?? 0)),
    [town, siteKey], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const routes = [...new Set(projects.map((p) => p.h.route))] as TreeId[];

  const pins: Pin[] = useMemo(() => (mode === "route" ? projects.map(({ h, at, dist }) => ({
    key: h.name, at, color: ROUTE_COLOR[h.route] ?? "#a3a9a2", shape: SHAPE[h.status],
    tip: `<b>${esc(h.name)}</b><br>${h.units} unit${h.units === 1 ? "" : "s"}${h.aff ? `, ${h.aff} affordable` : ""} · ${esc(TREES[h.route].name)}<br>${esc(h.statusLabel)}`
      + (dist !== null ? `<br>${distLabel(dist)} from your site` : "")
      + (h.at!.exact ? "" : "<br><i>Placed at the street address; parcel not confirmed</i>"),
  })) : []), [mode, projects]);

  const districtTip = (abbr: string) => {
    const d = atlas.find((x) => x.abbrvname === abbr);
    const shape = districts.find((x) => x.abbr === abbr);
    const t = treatmentFor(d, inputs.units);
    return `<b>${esc(abbr)}</b> ${esc(shape?.name ?? d?.name ?? "")}`
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
      p.id === siteParcel ? "<i>Your site</i>" : "",
    ];
    return lines.filter(Boolean).join("<br>");
  };
  const siteTip = `<b>Your site</b>${inputs.address ? `<br>${esc(inputs.address.split(",")[0])}` : ""}${siteParcel ? `<br>${esc(siteParcel)}` : ""}`;

  // Refit when the site, the town or the mode changes; not when parcels finish loading.
  const fit = useMemo(() => {
    const own = districts.filter((d) => d.abbr === inputs.zone).flatMap((d) => d.rings.flat());
    const all = districts.flatMap((d) => d.rings.flat());
    let points: LatLon[];
    if (mode === "route" && projects.length) points = [...projects.map((p) => p.at), ...(site ? [site] : [])];
    else if (site) points = circleBox(site, RADIUS);
    else points = own.length ? own : all;
    return { key: `${mode}|${siteKey}|${town}|${inputs.zone}|${districts.length > 0}`, points };
  }, [mode, siteKey, town, inputs.zone, districts, projects]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (key: string) => {
    setPicked(key);
    document.getElementById(`zm-p-${precedentId(key)}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  return (
    <div className="panel zm" ref={box}>
      <div className="zm-head">
        <div>
          <h3>Where it sits</h3>
          <p className="sub">
            {site
              ? `Parcels within ${RADIUS} m of the site, coloured by ${mode === "structure" ? "the building the state records on each" : "nothing: the pins carry the colour"}. Hover for details.`
              : `${town}'s zoning districts, with ${inputs.zone === "other" ? "no district chosen yet" : `${inputs.zone} tinted`}. Look up an address to see the parcels around your site.`}
          </p>
        </div>
        <div className="seg zm-mode" role="group" aria-label="Colour by">
          <button type="button" aria-pressed={mode === "structure"} onClick={() => setMode("structure")}>Structure type</button>
          <button type="button" aria-pressed={mode === "route"} onClick={() => setMode("route")}>Approval route</button>
        </div>
      </div>

      <div className="zm-frame">
        {seen ? (
          <ZoningMapView
            districts={districts} zone={inputs.zone} districtTip={districtTip}
            parcels={parcels} parcelTip={parcelTip} mode={mode}
            site={site} siteTip={siteTip} siteParcel={siteParcel}
            pins={pins} onPin={pick} fit={fit}
          />
        ) : <div className="zm-canvas zm-wait">The map loads when you scroll to it.</div>}
        {loadingParcels && <p className="zm-status" role="status">Reading the parcels around the site…</p>}
        {shapes?.error && <p className="zm-status" role="status">The Zoning Atlas didn't answer, so district outlines are missing.</p>}
        {near?.error && near.key === siteKey && <p className="zm-status" role="status">The state parcel map didn't answer. Try the address lookup again later.</p>}
      </div>

      {mode === "structure" ? (
        <>
          <ul className="zm-legend" aria-label={site ? `Parcels within ${RADIUS} m by structure type` : "Structure types"}>
            {STRUCTURE_ORDER.map((k) => (
              <li key={k} title={STRUCTURE[k].note}>
                <span className={`zm-swatch${STRUCTURE[k].color ? "" : " empty"}`} style={STRUCTURE[k].color ? { background: STRUCTURE[k].color } : undefined} aria-hidden="true" />
                {STRUCTURE[k].label}{parcels ? <b className="mono">{counts[k]}</b> : null}
              </li>
            ))}
            {site && <li><span className="zm-swatch site" aria-hidden="true" />Your site</li>}
          </ul>
          <p className="small muted zm-note">
            Types are the state's E-911 structure points on each tax parcel, not zoning uses or unit counts. "Multi-family" covers a two-family house and an apartment block alike.
            {near?.truncated && " The area is dense, and only the first 6,000 parcels are drawn."}
          </p>
        </>
      ) : (
        <>
          <ul className="zm-legend" aria-label="Approval routes">
            {routes.map((r) => (
              <li key={r}><span className="zm-swatch" style={{ background: ROUTE_COLOR[r] }} aria-hidden="true" />{TREES[r].name}</li>
            ))}
            {(["dot", "ring", "square"] as const).map((s) => (
              <li key={s}><span className={`zm-shape ${s}`} aria-hidden="true" />{SHAPE_LABEL[s]}</li>
            ))}
          </ul>
          {projects.length ? (
            <ol className="zm-projects">
              {projects.map(({ h, dist }) => (
                <li key={h.name} id={`zm-p-${precedentId(h.name)}`} className={picked === h.name ? "is-picked" : undefined}>
                  <span className={`zm-shape ${SHAPE[h.status]}`} style={{ "--c": ROUTE_COLOR[h.route] } as React.CSSProperties} aria-hidden="true" />
                  <span>
                    <Link href={`/records#p-${precedentId(h.name)}`}><b>{h.name}</b></Link>{" "}
                    <span className="muted">{h.units} units{h.aff ? `, ${h.aff} affordable` : ""} · {TREES[h.route].name} · {h.statusLabel}</span>
                  </span>
                  <span className="mono small">{dist !== null ? distLabel(dist) : h.zone || ""}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="small muted zm-note">No projects have been read into the records for {town} yet. Cumberland's are in the precedent table.</p>
          )}
          {projects.length > 0 && <p className="small muted zm-note">Cumberland multifamily projects from Planning Board records. Select a pin to find it in the list.{site ? " Distances are from your site." : ""}</p>}
        </>
      )}
    </div>
  );
}
