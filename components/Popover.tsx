"use client";

// Adapted from remystifying-science app/lib/hooks/usePopover.ts @ ed3bc22.
// Kept from the original: hover intent (a short delay before opening, a grace period before closing
// so the pointer can cross into the card), and a horizontal clamp that guards both viewport edges.
// Changed for this site: no MUI, a click or tap pins the card open (touch screens have no hover),
// and Escape, an outside click, a scroll or a resize closes it.

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const EDGE = 8;
/** Room kept clear between a card and the top or bottom of the window */
const MARGIN = 24;
const OPEN_DELAY = 180;
const CLOSE_DELAY = 250;

/**
 * Where the card goes, from its measured height: below the trigger if it fits there, else above, else on the roomier
 * side with its height capped so it scrolls inside. Either way it stays MARGIN clear of the window's edges.
 */
export function place(rect: DOMRect, width: number, height: number): { top: number; left: number; below: boolean; maxHeight?: number } {
  const left = Math.max(EDGE, Math.min(rect.left, window.innerWidth - width - EDGE));
  const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
  const below = window.innerHeight - rect.bottom - EDGE - MARGIN;
  const above = rect.top - EDGE - Math.max(MARGIN, header + EDGE);
  if (height <= below) return { top: rect.bottom + EDGE, left, below: true };
  if (height <= above) return { top: rect.top - EDGE, left, below: false };
  return below >= above
    ? { top: rect.bottom + EDGE, left, below: true, maxHeight: Math.max(120, below) }
    : { top: rect.top - EDGE, left, below: false, maxHeight: Math.max(120, above) };
}

interface HoverCardProps {
  /** What the card says */
  card: React.ReactNode;
  /** The trigger's own content */
  children: React.ReactNode;
  className?: string;
  /** Accessible name for the trigger, when its content is an icon */
  label?: string;
  width?: number;
  /** Room the card wants below the trigger before it flips above */
  minSpaceBelow?: number;
}

/** A trigger that shows a card on hover or focus, and pins it on click or tap. */
export function HoverCard({ card, children, className, label, width = 320, minSpaceBelow = 180 }: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  // The card's height, measured once it is drawn (hidden) so it can be placed to fit.
  const [height, setHeight] = useState<number | null>(null);
  const show = useCallback(() => {
    setRect(trigger.current?.getBoundingClientRect() ?? null);
    setOpen(true);
  }, []);
  const close = useCallback(() => { setOpen(false); setPinned(false); setHeight(null); }, []);

  const enter = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (!open) showTimer.current = setTimeout(show, OPEN_DELAY);
  };
  const leave = () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (!pinned) hideTimer.current = setTimeout(() => { setOpen(false); setHeight(null); }, CLOSE_DELAY);
  };

  useEffect(() => () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!trigger.current?.contains(t) && !cardRef.current?.contains(t)) close();
    };
    // The card is fixed to the viewport, so it would drift away from its trigger on scroll.
    const onMove = () => close();
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onMove, { passive: true, capture: true });
    window.addEventListener("resize", onMove);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onMove, { capture: true });
      window.removeEventListener("resize", onMove);
    };
  }, [open, close]);

  const w = typeof window === "undefined" ? width : Math.min(width, window.innerWidth - 2 * EDGE);
  useLayoutEffect(() => {
    if (open && rect && height === null && cardRef.current) setHeight(cardRef.current.scrollHeight);
  }, [open, rect, height]);
  const pos = open && rect ? place(rect, w, height ?? minSpaceBelow) : null;

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={className}
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onMouseEnter={enter}
        onMouseLeave={leave}
        onFocus={show}
        onBlur={() => { if (!pinned) { setOpen(false); setHeight(null); } }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (pinned) close(); else { show(); setPinned(true); }
        }}
      >
        {children}
      </button>
      {pos && createPortal(
        <div
          ref={cardRef}
          id={id}
          role="tooltip"
          className={`popcard${pinned ? " is-pinned" : ""}`}
          style={{
            top: pos.top, left: pos.left, width: w, transform: pos.below ? undefined : "translateY(-100%)",
            maxHeight: pos.maxHeight, overflowY: pos.maxHeight ? "auto" : undefined,
            // Drawn once unseen to measure it, then placed.
            visibility: height === null ? "hidden" : undefined,
          }}
          onMouseEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current); }}
          onMouseLeave={leave}
        >
          {card}
        </div>,
        document.body,
      )}
    </>
  );
}
