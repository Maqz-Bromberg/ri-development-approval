"use client";

// Adapted from remystifying-science app/lib/hooks/usePopover.ts @ ed3bc22.
// Kept from the original: hover intent (a short delay before opening, a grace period before closing
// so the pointer can cross into the card), and a horizontal clamp that guards both viewport edges.
// Changed for this site: no MUI, a click or tap pins the card open (touch screens have no hover),
// and Escape, an outside click, a scroll or a resize closes it.

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

const EDGE = 8;
const OPEN_DELAY = 180;
const CLOSE_DELAY = 250;

function place(rect: DOMRect, width: number, minSpaceBelow: number): { top: number; left: number; below: boolean } {
  const left = Math.max(EDGE, Math.min(rect.left, window.innerWidth - width - EDGE));
  const below = window.innerHeight - rect.bottom >= minSpaceBelow || rect.top < minSpaceBelow;
  return { top: below ? rect.bottom + EDGE : rect.top - EDGE, left, below };
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

  const show = useCallback(() => {
    setRect(trigger.current?.getBoundingClientRect() ?? null);
    setOpen(true);
  }, []);
  const close = useCallback(() => { setOpen(false); setPinned(false); }, []);

  const enter = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (!open) showTimer.current = setTimeout(show, OPEN_DELAY);
  };
  const leave = () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (!pinned) hideTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
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
  const pos = open && rect ? place(rect, w, minSpaceBelow) : null;

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
        onBlur={() => { if (!pinned) setOpen(false); }}
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
          style={{ top: pos.top, left: pos.left, width: w, transform: pos.below ? undefined : "translateY(-100%)" }}
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
