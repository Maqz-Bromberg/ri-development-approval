"use client";

import Link from "next/link";
import { useProject } from "../ProjectProvider";

/** Shown in place of a stage while the gate trial asks for a site first (ARD D42). A share link or a file always opens past it. */
export function GateCard() {
  const { openExample } = useProject();
  return (
    <section className="gate" aria-labelledby="gate-h">
      <h1 id="gate-h" className="h2">Choose a site first</h1>
      <p>These answers are for one site. Choose it first, or open the example.</p>
      <div className="gate-acts">
        <Link href="/site" className="btn">Find your site</Link>
        <button type="button" className="btn ghost" onClick={openExample}>Open the example</button>
      </div>
    </section>
  );
}
