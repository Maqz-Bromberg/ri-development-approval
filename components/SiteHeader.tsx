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
        <Link href="/dev" className="docs-link" aria-label="Dev notes: verification, maintenance and open questions" title="Dev notes" aria-current={path.replace(/\/$/, "") === "/dev" ? "page" : undefined}>
          <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 2.5h7l3.5 3.5v11.5H5z" /><path d="M12 2.5V6h3.5" /><path d="M7.5 10h5M7.5 13h5" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
