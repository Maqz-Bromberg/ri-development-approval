"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProject } from "./ProjectProvider";
import { Verdict } from "./Verdict";

/**
 * The overview's first card. With no project of the visitor's own yet, it asks where the site is, which is the first
 * thing to do, and offers the example as an example. Once a project is entered, it shows that project's verdict.
 */
export function StartCard() {
  const { origin, hydrated } = useProject();
  const router = useRouter();
  const [q, setQ] = useState("");

  if (hydrated && origin !== "example") {
    return (
      <>
        <p className="eyebrow">Your project at a glance</p>
        <Verdict compact />
      </>
    );
  }
  return (
    <div className="start-card">
      <p className="eyebrow">Start here</p>
      <h2>Where is your site?</h2>
      <p className="sub">An address finds the zoning district, the parcel, its area and utilities, and suggests the rest. Or pick the town on a map.</p>
      <form className="lookup-form" onSubmit={(e) => { e.preventDefault(); if (q.trim().length >= 4) router.push(`/site?address=${encodeURIComponent(q.trim())}`); }}>
        <label htmlFor="start-address" className="sr-only">Street address</label>
        <input id="start-address" type="text" value={q} placeholder="45 Broad Street, Cumberland" autoComplete="street-address" onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="btn">Look up</button>
      </form>
      <div className="start-links">
        <Link href="/site" className="link-btn">Pick the town on the map →</Link>
        <Link href="/project" className="link-btn">See the check for an example project</Link>
      </div>
    </div>
  );
}
