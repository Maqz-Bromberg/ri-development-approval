"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { RADIUS, STRUCTURE, ZONE_KIND, zoneKind, type DistrictShape, type LatLon, type StructureClass, type ZoneKind, type Parcel, type TownShape } from "@/lib/map";

/*
 * The Leaflet half of the zoning map, loaded only in the browser (see ZoningMap). It draws what it is given and
 * owns no data: districts, parcels, the site and the project pins each live in their own layer group and are
 * redrawn when their props change. Hover text comes through refs, so a new function identity doesn't redraw.
 */

export interface Pin {
  key: string;
  at: LatLon;
  color: string;
  shape: "dot" | "ring" | "square";
  tip: string;
}

export interface MapViewProps {
  districts: DistrictShape[];
  zone: string;
  districtTip: (abbr: string) => string;
  parcels: Parcel[] | null;
  parcelTip: (p: Parcel) => string;
  /** "route" greys the parcels so the project pins carry the colour */
  mode: "structure" | "route";
  site: LatLon | null;
  siteTip: string;
  /** The parcel outlined: the site's, or the found place's */
  siteParcel: string | null;
  /** A found place not yet applied, marked apart from the site */
  preview: LatLon | null;
  previewTip: string;
  /** Centre of the dashed 400 m circle */
  ring: LatLon | null;
  /** A click on the map, when the map is used to pick a point */
  onMapClick?: (lat: number, lon: number) => void;
  pins: Pin[];
  onPin: (key: string) => void;
  /** The view refits when the key changes */
  fit: { key: string; points: LatLon[] };
  /** The statewide view: every town's outline, shaded by how much of it is read, and clickable. Null in a town's view. */
  /** Kind of district kept on the map; the rest are removed. Null shows every kind. */
  kindOnly?: ZoneKind | null;
  /** Kind under the pointer in the key: the others fade */
  kindHover?: ZoneKind | null;
  /** Building type kept among the parcels (structure mode); the rest are removed. The site's parcel always stays. */
  structOnly?: StructureClass | null;
  /** Building type under the pointer in the key: the other parcels fade */
  structHover?: StructureClass | null;
  /** Parcels (or, in route mode, the project pins) off; the site's own outline stays */
  hideParcels?: boolean;
  /** All district shading and labels off */
  hideZoning?: boolean;
  towns?: TownShape[] | null;
  /** The project's town, outlined in the statewide view */
  town?: string;
  townTip?: (name: string) => string;
  townFill?: (name: string) => number;
  onTown?: (name: string) => void;
  /** Aerial imagery instead of the grey map */
  satellite?: boolean;
  /** Hands the page the zoom buttons' actions (the map's own controls are off) */
  onApi?: (api: { zoomIn: () => void; zoomOut: () => void } | null) => void;
}

const INK = "#26332E";
const ACCENT = "#2E6DB4";
const GREY = "#c9cec8";

const pinIcon = (p: Pin) => {
  const shape =
    p.shape === "square" ? `<rect x="3.5" y="3.5" width="13" height="13" rx="2" fill="${p.color}" stroke="#fff" stroke-width="2"/>`
    : p.shape === "ring" ? `<circle cx="10" cy="10" r="6.5" fill="#fff" stroke="${p.color}" stroke-width="4"/>`
    : `<circle cx="10" cy="10" r="7.5" fill="${p.color}" stroke="#fff" stroke-width="2"/>`;
  return L.divIcon({ className: "zm-pin", html: `<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">${shape}</svg>`, iconSize: [20, 20], iconAnchor: [10, 10], tooltipAnchor: [10, 0] });
};

export default function ZoningMapView(props: MapViewProps) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const base = useRef<{ street: L.TileLayer; names: L.TileLayer; air: L.TileLayer } | null>(null);
  const groups = useRef<Record<"towns" | "districts" | "labels" | "parcels" | "site" | "pins", L.LayerGroup> | null>(null);
  const tips = useRef(props);
  tips.current = props;

  useEffect(() => {
    if (!el.current) return;
    // SVG, not canvas: Leaflet 1.9.4's canvas renderer can run a scheduled redraw after map.remove() when shapes were
    // added in the same frame (React's dev double mount does exactly that), and throws. 6,000 SVG paths at most is fine.
    const m = L.map(el.current, { scrollWheelZoom: false, zoomControl: false, zoomSnap: 0.5, center: [41.82, -71.42], zoom: 10 });
    m.attributionControl.setPrefix(false);
    // Esri's light grey canvas: street names are drawn into the base and show through the gaps between parcels
    // (roads aren't parcels); place names come as a separate layer above the coloured parcels.
    // CARTO's keyless basemaps, the plan's first choice, now answer "API key required".
    const labels = m.createPane("labels");
    labels.style.zIndex = "450";
    labels.style.pointerEvents = "none";
    const ESRI = "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas";
    const street = L.tileLayer(`${ESRI}/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`, {
      maxZoom: 19, maxNativeZoom: 16,
      attribution: 'Basemap: Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · Zoning: RI Zoning Atlas · Parcels: RIDEM',
    }).addTo(m);
    const names = L.tileLayer(`${ESRI}/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 19, maxNativeZoom: 16, pane: "labels" }).addTo(m);
    // Aerial imagery to see the lot itself: the buildings, trees and what is already there. The district and parcel
    // shading stays on top; the place-name layer belongs to the grey map, so it goes off with it.
    const air = L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19, maxNativeZoom: 19,
      attribution: 'Imagery: Esri, Maxar, Earthstar Geographics · Zoning: RI Zoning Atlas · Parcels: RIDEM',
    });
    base.current = { street, names, air };
    // The wheel zooms only once the map has been clicked or focused, so scrolling the page never gets caught.
    m.on("focus click", () => m.scrollWheelZoom.enable());
    m.on("blur", () => m.scrollWheelZoom.disable());
    m.on("click", (e: L.LeafletMouseEvent) => tips.current.onMapClick?.(e.latlng.lat, e.latlng.lng));
    // The container changes size when the map is expanded into a modal, or a folded section opens.
    const ro = new ResizeObserver(() => m.invalidateSize({ pan: false }));
    ro.observe(el.current);
    groups.current = {
      towns: L.layerGroup().addTo(m),
      districts: L.layerGroup().addTo(m),
      labels: L.layerGroup().addTo(m),
      parcels: L.layerGroup().addTo(m),
      site: L.layerGroup().addTo(m),
      pins: L.layerGroup().addTo(m),
    };
    map.current = m;
    tips.current.onApi?.({ zoomIn: () => m.zoomIn(), zoomOut: () => m.zoomOut() });
    // Stop any pan or zoom first: a canvas redraw scheduled by an animation would otherwise run on the removed map.
    return () => { tips.current.onApi?.(null); ro.disconnect(); m.stop(); m.off(); m.remove(); map.current = null; groups.current = null; };
  }, []);

  // The Map / Satellite choice: the grey map and its place names, or the aerial photo.
  const { satellite } = props;
  useEffect(() => {
    const m = map.current, b = base.current;
    if (!m || !b) return;
    if (satellite) { m.removeLayer(b.street); m.removeLayer(b.names); b.air.addTo(m); b.air.bringToBack(); }
    else { m.removeLayer(b.air); b.street.addTo(m); b.street.bringToBack(); b.names.addTo(m); }
  }, [satellite]);

  const { districts, zone, kindOnly, kindHover, hideZoning } = props;
  useEffect(() => {
    const g = groups.current;
    if (!g) return;
    g.districts.clearLayers();
    g.labels.clearLayers();
    if (hideZoning) return;
    districts.forEach((d) => {
      const own = d.abbr === zone;
      const kind = zoneKind(d.type);
      if (kindOnly && kind !== kindOnly) return;
      const faded = !!kindHover && kind !== kindHover;
      // Coloured by the Atlas's kind of district, as in the district picker. The project's district is outlined in ink.
      const kc = ZONE_KIND[kind].color;
      // An overlay lies on top of base districts: a dashed outline with no fill, so the districts beneath show through.
      const poly = d.overlay
        ? L.polygon(d.rings, { color: INK, weight: 1.6, opacity: faded ? 0.15 : 0.8, dashArray: "6 5", fill: false })
        : L.polygon(d.rings, {
          color: own ? INK : kc, weight: own ? 3 : 1.2, opacity: faded ? 0.15 : own ? 1 : 0.85,
          fillColor: kc, fillOpacity: faded ? 0.02 : own ? 0.34 : 0.13,
        });
      poly.bindTooltip(() => tips.current.districtTip(d.abbr), { sticky: true, className: "zm-tip" });
      g.districts.addLayer(poly);
      const big = d.rings.reduce((a, b) => (b.length > a.length ? b : a), d.rings[0] ?? []);
      if (big.length && !faded) {
        const c = L.polygon(big).getBounds().getCenter();
        g.labels.addLayer(L.tooltip({ permanent: true, direction: "center", className: `zm-dlabel${own ? " own" : ""}`, interactive: false }).setLatLng(c).setContent(d.abbr));
      }
    });
  }, [districts, zone, kindOnly, kindHover, hideZoning]);

  const { towns, town } = props;
  useEffect(() => {
    const g = groups.current;
    if (!g) return;
    g.towns.clearLayers();
    (towns ?? []).forEach((t) => {
      const own = t.name === town;
      const base: L.PathOptions = {
        color: own ? INK : "#5F6D67", weight: own ? 3 : 1, opacity: own ? 1 : 0.7,
        fillColor: ACCENT, fillOpacity: tips.current.townFill?.(t.name) ?? 0.06,
      };
      const poly = L.polygon(t.rings, base);
      poly.bindTooltip(() => tips.current.townTip?.(t.name) ?? t.name, { sticky: true, className: "zm-tip" });
      poly.on("mouseover", () => poly.setStyle({ color: INK, weight: 2.5 }));
      poly.on("mouseout", () => poly.setStyle(base));
      poly.on("click", (e: L.LeafletMouseEvent) => { L.DomEvent.stopPropagation(e); tips.current.onTown?.(t.name); });
      g.towns.addLayer(poly);
    });
  }, [towns, town]);

  const { parcels, mode, site, siteParcel, preview, ring, structOnly, structHover, hideParcels } = props;
  // Parcel styles are looked up again on a hover in the key, without redrawing thousands of shapes.
  const drawn = useRef<{ p: Parcel; poly: L.Polygon }[]>([]);
  const parcelStyle = (p: Parcel): L.PathOptions => {
    const color = STRUCTURE[p.cls].color;
    const fill = mode === "structure" ? color : color ? GREY : null;
    const h = tips.current.structHover;
    const faded = mode === "structure" && !!h && p.cls !== h && p.id !== siteParcel;
    return {
      color: fill ? "#ffffff" : "#9aa39c", weight: fill ? 0.8 : 0.6, opacity: faded ? 0.15 : 0.9,
      fillColor: fill ?? "#ffffff", fillOpacity: fill ? (faded ? 0.06 : mode === "structure" ? 0.62 : 0.4) : 0.01,
    };
  };
  useEffect(() => {
    const g = groups.current;
    if (!g) return;
    g.parcels.clearLayers();
    g.site.clearLayers();
    drawn.current = [];
    (parcels ?? []).forEach((p) => {
      if (hideParcels && p.id !== siteParcel) return;
      if (mode === "structure" && structOnly && p.cls !== structOnly && p.id !== siteParcel) return;
      const poly = L.polygon(p.rings, parcelStyle(p));
      poly.bindTooltip(() => tips.current.parcelTip(p), { sticky: true, className: "zm-tip" });
      poly.on("mouseover", () => poly.setStyle({ color: INK, weight: 2 }));
      poly.on("mouseout", () => poly.setStyle(parcelStyle(p)));
      g.parcels.addLayer(poly);
      drawn.current.push({ p, poly });
      if (p.id === siteParcel) {
        g.site.addLayer(L.polygon(p.rings, { color: "#ffffff", weight: 6, opacity: 0.9, fill: false, interactive: false }));
        g.site.addLayer(L.polygon(p.rings, { color: INK, weight: 3, fill: false, interactive: false }));
      }
    });
    if (ring) g.site.addLayer(L.circle(ring, { radius: RADIUS, color: INK, weight: 1.5, dashArray: "6 6", fill: false, interactive: false }));
    if (preview) {
      g.site.addLayer(
        L.circleMarker(preview, { radius: 10, color: ACCENT, weight: 3.5, fillColor: "#ffffff", fillOpacity: 0.85 })
          .bindTooltip(() => tips.current.previewTip, { className: "zm-tip", direction: "top", offset: [0, -8], permanent: false }),
      );
    }
    if (site) {
      g.site.addLayer(
        L.circleMarker(site, { radius: 7, color: "#ffffff", weight: 2.5, fillColor: INK, fillOpacity: 1 })
          .bindTooltip(() => tips.current.siteTip, { className: "zm-tip", direction: "top", offset: [0, -6] }),
      );
    }
  }, [parcels, mode, site, siteParcel, preview, ring, structOnly, hideParcels]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { drawn.current.forEach(({ p, poly }) => poly.setStyle(parcelStyle(p))); }, [structHover]); // eslint-disable-line react-hooks/exhaustive-deps

  const { pins, hideParcels: noPins } = props;
  useEffect(() => {
    const g = groups.current;
    if (!g) return;
    g.pins.clearLayers();
    if (noPins) return;
    pins.forEach((p) => {
      const mk = L.marker(p.at, { icon: pinIcon(p), title: p.key, keyboard: true, riseOnHover: true });
      mk.bindTooltip(p.tip, { className: "zm-tip", direction: "right" });
      mk.on("click", () => tips.current.onPin(p.key));
      g.pins.addLayer(mk);
    });
  }, [pins, noPins]);

  const fitKey = props.fit.key;
  useEffect(() => {
    const m = map.current;
    const pts = tips.current.fit.points;
    if (!m || !pts.length) return;
    // Jump rather than animate: the view changes with the site or the mode, and a zoom animation can outlive the map.
    if (pts.length === 1) m.setView(pts[0], 16, { animate: false });
    else m.fitBounds(L.latLngBounds(pts), { padding: [24, 24], maxZoom: 17, animate: false });
  }, [fitKey]);

  return <div ref={el} className="zm-canvas" role="region" aria-label="Zoning map. Use the legend and list below for the same information as text." />;
}
