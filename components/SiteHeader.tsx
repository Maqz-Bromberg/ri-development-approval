"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  return (
    <header className="site-header">
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
