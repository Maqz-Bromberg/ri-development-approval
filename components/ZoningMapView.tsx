"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { RADIUS, STRUCTURE, type DistrictShape, type LatLon, type Parcel } from "@/lib/map";

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
  siteParcel: string | null;
  pins: Pin[];
  onPin: (key: string) => void;
  /** The view refits when the key changes */
  fit: { key: string; points: LatLon[] };
}

const INK = "#26332E";
const ACCENT = "#2E6DB4";
const MUTED = "#5F6D67";
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
  const groups = useRef<Record<"districts" | "labels" | "parcels" | "site" | "pins", L.LayerGroup> | null>(null);
  const tips = useRef(props);
  tips.current = props;

  useEffect(() => {
    if (!el.current) return;
    // SVG, not canvas: Leaflet 1.9.4's canvas renderer can run a scheduled redraw after map.remove() when shapes were
    // added in the same frame (React's dev double mount does exactly that), and throws. 6,000 SVG paths at most is fine.
    const m = L.map(el.current, { scrollWheelZoom: false, zoomSnap: 0.5, center: [41.82, -71.42], zoom: 10 });
    m.attributionControl.setPrefix(false);
    // Esri's light grey canvas: street names are drawn into the base and show through the gaps between parcels
    // (roads aren't parcels); place names come as a separate layer above the coloured parcels.
    // CARTO's keyless basemaps, the plan's first choice, now answer "API key required".
    const labels = m.createPane("labels");
    labels.style.zIndex = "450";
    labels.style.pointerEvents = "none";
    const ESRI = "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas";
    L.tileLayer(`${ESRI}/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`, {
      maxZoom: 19, maxNativeZoom: 16,
      attribution: 'Basemap: Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · Zoning: RI Zoning Atlas · Parcels: RIDEM',
    }).addTo(m);
    L.tileLayer(`${ESRI}/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 19, maxNativeZoom: 16, pane: "labels" }).addTo(m);
    // The wheel zooms only once the map has been clicked or focused, so scrolling the page never gets caught.
    m.on("focus click", () => m.scrollWheelZoom.enable());
    m.on("blur", () => m.scrollWheelZoom.disable());
    groups.current = {
      districts: L.layerGroup().addTo(m),
      labels: L.layerGroup().addTo(m),
      parcels: L.layerGroup().addTo(m),
      site: L.layerGroup().addTo(m),
      pins: L.layerGroup().addTo(m),
    };
    map.current = m;
    // Stop any pan or zoom first: a canvas redraw scheduled by an animation would otherwise run on the removed map.
    return () => { m.stop(); m.off(); m.remove(); map.current = null; groups.current = null; };
  }, []);

  const { districts, zone } = props;
  useEffect(() => {
    const g = groups.current;
    if (!g) return;
    g.districts.clearLayers();
    g.labels.clearLayers();
    districts.forEach((d) => {
      const own = d.abbr === zone;
      const poly = L.polygon(d.rings, {
        color: own ? ACCENT : MUTED, weight: own ? 2.5 : 1.2, opacity: own ? 1 : 0.75,
        fillColor: own ? ACCENT : MUTED, fillOpacity: own ? 0.1 : 0.02,
      });
      poly.bindTooltip(() => tips.current.districtTip(d.abbr), { sticky: true, className: "zm-tip" });
      g.districts.addLayer(poly);
      const big = d.rings.reduce((a, b) => (b.length > a.length ? b : a), d.rings[0] ?? []);
      if (big.length) {
        const c = L.polygon(big).getBounds().getCenter();
        g.labels.addLayer(L.tooltip({ permanent: true, direction: "center", className: `zm-dlabel${own ? " own" : ""}`, interactive: false }).setLatLng(c).setContent(d.abbr));
      }
    });
  }, [districts, zone]);

  const { parcels, mode, site, siteParcel } = props;
  useEffect(() => {
    const g = groups.current;
    if (!g) return;
    g.parcels.clearLayers();
    g.site.clearLayers();
    (parcels ?? []).forEach((p) => {
      const color = STRUCTURE[p.cls].color;
      const fill = mode === "structure" ? color : color ? GREY : null;
      const base: L.PathOptions = {
        color: fill ? "#ffffff" : "#9aa39c", weight: fill ? 0.8 : 0.6, opacity: 0.9,
        fillColor: fill ?? "#ffffff", fillOpacity: fill ? (mode === "structure" ? 0.62 : 0.4) : 0.01,
      };
      const poly = L.polygon(p.rings, base);
      poly.bindTooltip(() => tips.current.parcelTip(p), { sticky: true, className: "zm-tip" });
      poly.on("mouseover", () => poly.setStyle({ color: INK, weight: 2 }));
      poly.on("mouseout", () => poly.setStyle(base));
      g.parcels.addLayer(poly);
      if (p.id === siteParcel) {
        g.site.addLayer(L.polygon(p.rings, { color: "#ffffff", weight: 6, opacity: 0.9, fill: false, interactive: false }));
        g.site.addLayer(L.polygon(p.rings, { color: INK, weight: 3, fill: false, interactive: false }));
      }
    });
    if (site) {
      g.site.addLayer(L.circle(site, { radius: RADIUS, color: INK, weight: 1.5, dashArray: "6 6", fill: false, interactive: false }));
      g.site.addLayer(
        L.circleMarker(site, { radius: 7, color: "#ffffff", weight: 2.5, fillColor: INK, fillOpacity: 1 })
          .bindTooltip(() => tips.current.siteTip, { className: "zm-tip", direction: "top", offset: [0, -6] }),
      );
    }
  }, [parcels, mode, site, siteParcel]);

  const { pins } = props;
  useEffect(() => {
    const g = groups.current;
    if (!g) return;
    g.pins.clearLayers();
    pins.forEach((p) => {
      const mk = L.marker(p.at, { icon: pinIcon(p), title: p.key, keyboard: true, riseOnHover: true });
      mk.bindTooltip(p.tip, { className: "zm-tip", direction: "right" });
      mk.on("click", () => tips.current.onPin(p.key));
      g.pins.addLayer(mk);
    });
  }, [pins]);

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
