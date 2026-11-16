"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** An old address. The visitor is sent on, with the # part kept so deep links and share links still work. */
export function Moved({ to, name }: { to: string; name: string }) {
  const router = useRouter();
  useEffect(() => { router.replace(`${to}${window.location.hash}`); }, [router, to]);
  return (
    <section className="sec wrap">
      <p>This page has moved to <Link href={to}>{name}</Link>.</p>
    </section>
  );
}
