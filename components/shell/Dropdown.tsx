"use client";

import { useEffect, useRef, useState } from "react";

/** A button that opens a panel under it, closed by Escape, an outside click, or a choice inside it marked data-close. */
export function Dropdown({ label, button, className = "", panelClass = "", align = "right", children }: {
  label: string;
  button: React.ReactNode;
  className?: string;
  panelClass?: string;
  align?: "left" | "right";
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", key); };
  }, [open]);
  const close = () => setOpen(false);
  return (
    <div className={`dd ${className}`} ref={box}>
      <button type="button" className="dd-btn" aria-haspopup="true" aria-expanded={open} aria-label={label} onClick={() => setOpen(!open)}>{button}</button>
      {open && (
        <div className={`dd-panel a-${align} ${panelClass}`} onClick={(e) => { if ((e.target as HTMLElement).closest("[data-close]")) close(); }}>
          {typeof children === "function" ? children(close) : children}
        </div>
      )}
    </div>
  );
}
