"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** The hearing page used to live here. Old links, including "#question" anchors, are sent on. */
export default function ObjectionsMoved() {
  const router = useRouter();
  useEffect(() => { router.replace(`/hearing${window.location.hash}`); }, [router]);
  return (
    <section className="sec">
      <p>This page has moved to <Link href="/hearing">Hearing prep</Link>.</p>
    </section>
  );
}
