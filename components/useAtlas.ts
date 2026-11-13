"use client";

import { useEffect, useState } from "react";
import { CUMBERLAND_DISTRICTS, diffAgainstSnapshot, fetchAtlasDistricts, registerDistricts } from "@/lib/data/atlas";
import type { AtlasDistrict } from "@/lib/types";
import { useProject } from "./ProjectProvider";

export type AtlasStatus = "loading" | "live" | "snapshot";

interface AtlasState {
  town: string;
  districts: AtlasDistrict[];
  status: AtlasStatus;
  diffs: { abbrvname: string; fields: string[] }[];
  error?: string;
}

const cache = new Map<string, AtlasState>();
const inflight = new Map<string, Promise<AtlasState>>();

function load(town: string): Promise<AtlasState> {
  const hit = cache.get(town);
  if (hit) return Promise.resolve(hit);
  let p = inflight.get(town);
  if (!p) {
    const snapshot = town === "Cumberland" ? CUMBERLAND_DISTRICTS : [];
    p = fetchAtlasDistricts(town)
      .then((live): AtlasState => {
        if (town === "Cumberland") {
          const order = new Map(CUMBERLAND_DISTRICTS.map((d, i) => [d.abbrvname, i]));
          live.sort((a, b) => (order.get(a.abbrvname) ?? 99) - (order.get(b.abbrvname) ?? 99));
        } else {
          live.sort((a, b) => a.abbrvname.localeCompare(b.abbrvname, undefined, { numeric: true }));
          registerDistricts(town, live);
        }
        return { town, districts: live.length ? live : snapshot, status: live.length ? "live" : "snapshot", diffs: town === "Cumberland" ? diffAgainstSnapshot(live) : [] };
      })
      .catch((e: Error): AtlasState => ({ town, districts: snapshot, status: "snapshot", diffs: [], error: e.message }));
    p = p.then((s) => { cache.set(town, s); return s; });
    inflight.set(town, p);
  }
  return p;
}

/** The Zoning Atlas districts of the project's town: Cumberland's bundled snapshot at once, then the live layer when it answers. */
export function useAtlas(): AtlasState {
  const { inputs } = useProject();
  const town = inputs.town;
  const [state, setState] = useState<AtlasState>(cache.get(town) ?? { town, districts: town === "Cumberland" ? CUMBERLAND_DISTRICTS : [], status: "loading", diffs: [] });
  useEffect(() => {
    let alive = true;
    load(town).then((s) => { if (alive) setState(s); });
    return () => { alive = false; };
  }, [town]);
  // Until the town's own districts arrive, show nothing of another town's.
  return state.town === town ? state : { town, districts: town === "Cumberland" ? CUMBERLAND_DISTRICTS : [], status: "loading", diffs: [] };
}
