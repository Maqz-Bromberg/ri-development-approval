"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/site", label: "Site selection" },
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
            <small>All 39 towns · Cumberland read in full · Providence on trial</small>
          </span>
        </Link>
        <nav aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={(path.replace(/\/$/, "") || "/") === n.href ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="header-tools">
          <Link href="/engine" className="docs-link" aria-label="Engine: how the checks work, as flowcharts" title="How the engine works" aria-current={path.startsWith("/engine") ? "page" : undefined}>
            <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="10" r="2.6" />
              <path d="M10 2.2v2.1M10 15.7v2.1M2.2 10h2.1M15.7 10h2.1M4.5 4.5 6 6M14 14l1.5 1.5M15.5 4.5 14 6M6 14l-1.5 1.5" />
              <circle cx="10" cy="10" r="5.6" />
            </svg>
          </Link>
          <Link href="/dev" className="docs-link" aria-label="Dev notes: verification, maintenance and open questions" title="Dev notes" aria-current={path.replace(/\/$/, "") === "/dev" ? "page" : undefined}>
            <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 2.5h7l3.5 3.5v11.5H5z" /><path d="M12 2.5V6h3.5" /><path d="M7.5 10h5M7.5 13h5" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
