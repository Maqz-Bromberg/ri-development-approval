"use client";

import { useEffect, useState } from "react";
import { CUMBERLAND_DISTRICTS, diffAgainstSnapshot, fetchAtlasDistricts } from "@/lib/data/atlas";
import type { AtlasDistrict } from "@/lib/types";

export type AtlasStatus = "loading" | "live" | "snapshot";

interface AtlasState {
  districts: AtlasDistrict[];
  status: AtlasStatus;
  diffs: { abbrvname: string; fields: string[] }[];
  error?: string;
}

let cache: AtlasState | null = null;
let inflight: Promise<AtlasState> | null = null;

function load(): Promise<AtlasState> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetchAtlasDistricts("Cumberland")
      .then((live) => {
        const order = new Map(CUMBERLAND_DISTRICTS.map((d, i) => [d.abbrvname, i]));
        live.sort((a, b) => (order.get(a.abbrvname) ?? 99) - (order.get(b.abbrvname) ?? 99));
        cache = { districts: live.length ? live : CUMBERLAND_DISTRICTS, status: live.length ? "live" : "snapshot", diffs: diffAgainstSnapshot(live) };
        return cache;
      })
      .catch((e: Error) => {
        cache = { districts: CUMBERLAND_DISTRICTS, status: "snapshot", diffs: [], error: e.message };
        return cache;
      });
  }
  return inflight;
}

/** Cumberland's Zoning Atlas districts: the bundled snapshot at once, then the live layer when it answers. */
export function useAtlas(): AtlasState {
  const [state, setState] = useState<AtlasState>(cache ?? { districts: CUMBERLAND_DISTRICTS, status: "loading", diffs: [] });
  useEffect(() => {
    let alive = true;
    load().then((s) => { if (alive) setState(s); });
    return () => { alive = false; };
  }, []);
  return state;
}
