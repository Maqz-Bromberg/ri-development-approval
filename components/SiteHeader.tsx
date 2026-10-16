"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/project", label: "Your project" },
  { href: "/schedule", label: "Schedule" },
  { href: "/atlas", label: "Zoning atlas" },
  { href: "/objections", label: "Common questions" },
  { href: "/records", label: "Meeting records" },
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
            <small>Pilot: Cumberland</small>
          </span>
        </Link>
        <nav aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
