"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/project", label: "Check" },
  { href: "/steps", label: "Steps" },
  { href: "/schedule", label: "Schedule" },
  { href: "/hearing", label: "Hearing prep" },
  { href: "/atlas", label: "Zoning atlas" },
  { href: "/records", label: "Records" },
  { href: "/towns", label: "Towns" },
];

export function SiteHeader() {
  const path = usePathname();
  // Sticky bars sit under the header, whose height changes with the width (the nav wraps, the subtitle adds a line).
  // Publish the real height as --header-h instead of hard-coding it in the CSS.
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <header className="site-header" ref={ref}>
      <div className="wrap header-inner">
        <Link href="/" className="brand">
          <span className="mark" aria-hidden="true" />
          <span>
            <b>RI Building Plan Approval</b>
            <small>All 39 towns · Cumberland read in full</small>
          </span>
        </Link>
        <nav aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={(path.replace(/\/$/, "") || "/") === n.href ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
