"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { KIND_LABEL, type Flow, type FlowEdge, type FlowNode, type NodeKind, type Side } from "@/lib/data/engine/types";
import { place } from "./Popover";

/*
 * A flowchart drawn as SVG from a Flow (lib/data/engine/types.ts), with a card for each node on hover or focus.
 * Node positions are grid units in the data; the sizes below turn them into pixels. A line leaves and enters a node
 * by the side facing the other node unless the data names the sides, and is drawn as a curve whose ends run
 * straight out of those sides.
 */

interface Metrics { w: number; h: number; px: number; py: number; pad: number; label: number; sub: number; chars: number; subChars: number }
const NORMAL: Metrics = { w: 204, h: 64, px: 252, py: 104, pad: 28, label: 13, sub: 11.5, chars: 24, subChars: 29 };
const LARGE: Metrics = { w: 248, h: 96, px: 346, py: 156, pad: 28, label: 15, sub: 12.5, chars: 26, subChars: 34 };

const OPEN_DELAY = 120;
const CLOSE_DELAY = 260;

/** Break text into lines of about `max` characters, at spaces. */
function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let line = "";
  text.split(/\s+/).forEach((word) => {
    if (line && (line + " " + word).length > max) { lines.push(line); line = word; } else line = line ? line + " " + word : word;
  });
  if (line) lines.push(line);
  return lines;
}

function Shape({ kind, w, h }: { kind: NodeKind; w: number; h: number }) {
  switch (kind) {
    case "decision": {
      const t = 20;
      return <polygon className="fc-shape" points={`${t},0 ${w - t},0 ${w},${h / 2} ${w - t},${h} ${t},${h} 0,${h / 2}`} />;
    }
    case "data": case "output":
      return <rect className="fc-shape" width={w} height={h} rx={h / 2.4} />;
    case "town":
      return <><rect className="fc-shape" width={w} height={h} rx={8} /><path className="fc-bar" d={`M0 8a8 8 0 0 1 8-8h3v${h}H8a8 8 0 0 1-8-8z`} /></>;
    default:
      return <rect className="fc-shape" width={w} height={h} rx={8} />;
  }
}

function NodeText({ node, m }: { node: FlowNode; m: Metrics }) {
  const narrow = node.kind === "decision" ? 4 : node.kind === "data" || node.kind === "output" ? 2 : 0;
  const bar = node.kind === "town" ? 4 : 0;
  const label = wrap(node.label, m.chars - narrow - bar / 2);
  const sub = node.sub ? wrap(node.sub, m.subChars - narrow - bar / 2).slice(0, 2) : [];
  const lh = m.label * 1.22, sh = m.sub * 1.25;
  const total = label.length * lh + (sub.length ? 4 + sub.length * sh : 0);
  const cx = m.w / 2 + bar;
  let at = (m.h - total) / 2;
  const rows: { t: string; y: number; sub: boolean }[] = [];
  label.forEach((t) => { rows.push({ t, y: at + m.label * 0.82, sub: false }); at += lh; });
  if (sub.length) at += 4;
  sub.forEach((t) => { rows.push({ t, y: at + m.sub * 0.82, sub: true }); at += sh; });
  return (
    <text textAnchor="middle" className="fc-text">
      {rows.map((r, i) => <tspan key={i} x={cx} y={r.y} className={r.sub ? "fc-sub" : "fc-label"} style={{ fontSize: r.sub ? m.sub : m.label }}>{r.t}</tspan>)}
    </text>
  );
}

type Pt = { x: number; y: number };
const NORMAL_OF: Record<Side, Pt> = { top: { x: 0, y: -1 }, bottom: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

function port(box: { l: number; t: number }, side: Side, m: Metrics): Pt {
  return side === "top" ? { x: box.l + m.w / 2, y: box.t } : side === "bottom" ? { x: box.l + m.w / 2, y: box.t + m.h } : side === "left" ? { x: box.l, y: box.t + m.h / 2 } : { x: box.l + m.w, y: box.t + m.h / 2 };
}

function route(a: { l: number; t: number }, b: { l: number; t: number }, edge: FlowEdge, m: Metrics) {
  const dx = b.l - a.l, dy = b.t - a.t;
  const same = Math.abs(dy) < m.h * 0.6;
  const out: Side = edge.out ?? (same ? (dx >= 0 ? "right" : "left") : dy > 0 ? "bottom" : "top");
  const inn: Side = edge.in ?? (same ? (dx >= 0 ? "left" : "right") : dy > 0 ? "top" : "bottom");
  const p = port(a, out, m), q = port(b, inn, m);
  const dist = Math.hypot(q.x - p.x, q.y - p.y);
  const d = Math.max(34, Math.min(130, dist * 0.45));
  const no = NORMAL_OF[out], ni = NORMAL_OF[inn];
  const c1 = { x: p.x + no.x * d, y: p.y + no.y * d }, c2 = { x: q.x + ni.x * d, y: q.y + ni.y * d };
  const mid = { x: (p.x + 3 * c1.x + 3 * c2.x + q.x) / 8, y: (p.y + 3 * c1.y + 3 * c2.y + q.y) / 8 };
  return { path: `M${p.x} ${p.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${q.x} ${q.y}`, mid };
}

export function Flowchart({ flow }: { flow: Flow }) {
  const m = flow.size === "lg" ? LARGE : NORMAL;
  const router = useRouter();
  const uid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const refs = useRef<Record<string, SVGGElement | null>>({});
  const cardRef = useRef<HTMLDivElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shown = pinned ?? hover;
  const byId = useMemo(() => Object.fromEntries(flow.nodes.map((nd) => [nd.id, nd])), [flow]);
  const box = useCallback((nd: FlowNode) => ({ l: m.pad + nd.x * m.px, t: m.pad + nd.y * m.py + 10 }), [m]);
  // Lines that leave and enter by the same side bulge out beyond the boxes, so the drawing is given room for them.
  const bulge = (side: Side) => (flow.edges.some((ed) => ed.out === side && ed.in === side) ? 90 : 0);
  const width = Math.max(...flow.nodes.map((nd) => box(nd).l)) + m.w + m.pad + bulge("right");
  const totalH = Math.max(...flow.nodes.map((nd) => box(nd).t)) + m.h + m.pad;

  const edges = useMemo(() => flow.edges.map((ed) => {
    const a = byId[ed.from], b = byId[ed.to];
    if (!a || !b) throw new Error(`Flow ${flow.slug}: edge ${ed.from} to ${ed.to} names a node that is not there`);
    return { ed, ...route(box(a), box(b), ed, m) };
  }), [flow, byId, box, m]);

  const near = useMemo(() => {
    if (!shown) return null;
    const s = new Set([shown]);
    flow.edges.forEach((ed) => { if (ed.from === shown) s.add(ed.to); if (ed.to === shown) s.add(ed.from); });
    return s;
  }, [shown, flow]);

  const canHover = () => typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

  const open = (id: string) => {
    setRect(refs.current[id]?.getBoundingClientRect() ?? null);
    setHeight(null);
    setHover(id);
  };
  const enter = (id: string) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (showTimer.current) clearTimeout(showTimer.current);
    if (pinned) return;
    showTimer.current = setTimeout(() => open(id), hover ? 0 : OPEN_DELAY);
  };
  const leave = () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (!pinned) hideTimer.current = setTimeout(() => setHover(null), CLOSE_DELAY);
  };
  const close = useCallback(() => { setHover(null); setPinned(null); setHeight(null); }, []);

  useEffect(() => () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  useEffect(() => {
    if (!shown) return;
    const onKey = (ev: KeyboardEvent) => { if (ev.key === "Escape") close(); };
    const onDown = (ev: PointerEvent) => {
      const t = ev.target as Node;
      const inNode = Object.values(refs.current).some((g) => g?.contains(t));
      if (!inNode && !cardRef.current?.contains(t)) close();
    };
    // The card is fixed to the window, so scrolling would leave it behind.
    const onMove = (ev: Event) => { if (!cardRef.current?.contains(ev.target as Node)) close(); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onMove, { passive: true, capture: true });
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onMove, { capture: true });
      window.removeEventListener("resize", close);
    };
  }, [shown, close]);

  useLayoutEffect(() => {
    if (shown && rect && height === null && cardRef.current) setHeight(cardRef.current.scrollHeight);
  }, [shown, rect, height]);

  const activate = (nd: FlowNode) => {
    if (flow.size === "lg" && nd.to && canHover()) { router.push(nd.to.href); return; }
    if (pinned === nd.id) { close(); return; }
    open(nd.id);
    setPinned(nd.id);
  };

  const card = shown ? byId[shown] : null;
  const w = typeof window === "undefined" ? 360 : Math.min(360, window.innerWidth - 16);
  const pos = card && rect ? place(rect, w, height ?? 180) : null;

  return (
    <div className="fc">
      <div className="fc-scroll">
        <svg
          className="fc-svg" viewBox={`0 0 ${width} ${totalH}`} width="100%" role="group"
          aria-label={`${flow.title}: flowchart. Each box opens a card on hover, focus or click.`}
          style={{ maxWidth: width, minWidth: Math.min(width, Math.round(width * 0.72)) }}
        >
          <defs>
            <marker id={`${uid}a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 1 10 5 0 9z" className="fc-head" /></marker>
          </defs>
          {edges.map(({ ed, path, mid }, i) => {
            const lit = shown && (ed.from === shown || ed.to === shown);
            return (
              <g key={i} className={`fc-edge${ed.dashed ? " is-dashed" : ""}${lit ? " is-lit" : shown ? " is-dim" : ""}`}>
                <path d={path} markerEnd={`url(#${uid}a)`} />
                {ed.label && <text x={mid.x} y={mid.y + 4} textAnchor="middle" className="fc-elabel">{ed.label}</text>}
              </g>
            );
          })}
          {flow.nodes.map((nd) => {
            const b = box(nd);
            const link = flow.size === "lg" && nd.to;
            return (
              <g
                key={nd.id}
                ref={(el) => { refs.current[nd.id] = el; }}
                transform={`translate(${b.l} ${b.t})`}
                className={`fc-node fk-${nd.kind}${shown === nd.id ? " is-on" : near && !near.has(nd.id) ? " is-dim" : ""}`}
                role={link ? "link" : "button"} tabIndex={0}
                aria-label={`${nd.label}. ${KIND_LABEL[nd.kind].name}.${link ? ` Opens ${nd.to!.label}.` : ""}`}
                aria-describedby={shown === nd.id ? `${uid}c` : undefined}
                onMouseEnter={() => enter(nd.id)}
                onMouseLeave={leave}
                onFocus={() => { if (!pinned) open(nd.id); }}
                onBlur={() => { if (!pinned) setHover(null); }}
                onClick={() => activate(nd)}
                onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); activate(nd); } }}
              >
                <Shape kind={nd.kind} w={m.w} h={m.h} />
                <NodeText node={nd} m={m} />
                {nd.town && <g className="fc-tag" transform={`translate(${m.w - 66} -9)`}><rect width="62" height="16" rx="8" /><text x="31" y="11.5" textAnchor="middle">town first</text></g>}
                {nd.to && flow.size !== "lg" && <text className="fc-go" x={m.w - 16} y={m.h - 9} textAnchor="middle" aria-hidden="true">↗</text>}
              </g>
            );
          })}
        </svg>
      </div>
      {pos && card && createPortal(
        <div
          ref={cardRef} id={`${uid}c`} role="tooltip"
          className={`popcard fc-card${pinned ? " is-pinned" : ""}`}
          style={{ top: pos.top, left: pos.left, width: w, transform: pos.below ? undefined : "translateY(-100%)", maxHeight: pos.maxHeight, overflowY: pos.maxHeight ? "auto" : undefined, visibility: height === null ? "hidden" : undefined }}
          onMouseEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current); }}
          onMouseLeave={leave}
        >
          <p className={`fc-kind fk-${card.kind}`}>{KIND_LABEL[card.kind].name}{card.town ? " · the town is asked first" : ""}</p>
          <b className="pop-title">{card.label}</b>
          <p>{card.info}</p>
          {card.note && <p className="fc-note">{card.note}</p>}
          {card.where && <ul className="fc-where">{card.where.map((wh) => <li key={wh}><code>{wh}</code></li>)}</ul>}
          {card.to && <p className="fc-go-link"><Link href={card.to.href}>{card.to.label} →</Link></p>}
        </div>,
        document.body,
      )}
      <ul className="fc-key" aria-label="Key to the boxes">
        {(Object.keys(KIND_LABEL) as NodeKind[]).map((k) => (
          <li key={k}>
            <svg width="34" height="20" viewBox="0 0 34 20" aria-hidden="true" className={`fk-${k}`}><g className="fc-node"><Shape kind={k} w={34} h={20} /></g></svg>
            <span><b>{KIND_LABEL[k].name}.</b> {KIND_LABEL[k].what}</span>
          </li>
        ))}
        <li><svg width="34" height="20" viewBox="0 0 34 20" aria-hidden="true"><g className="fc-tag"><rect x="1" y="2" width="32" height="16" rx="8" /></g></svg><span><b>Town first.</b> The town&rsquo;s reading answers where it has one</span></li>
      </ul>
    </div>
  );
}
