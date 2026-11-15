"use client";

import { useEffect, useState } from "react";
import { lookUpPoint, type LookedUp } from "@/lib/lookup";
import { useProject } from "./ProjectProvider";

export type LookedUpState = { status: "none" } | { status: "loading" } | { status: "error" } | { status: "ready"; data: LookedUp };

/**
 * What the public layers say about the project's site, for checking the entered facts against.
 * Only for a site placed by the address lookup or a map click; the example and hand-entered projects have no point.
 * The lookup is cached, so a page that shows it again does not ask the services twice.
 */
export function useLookedUp(): LookedUpState {
  const { inputs } = useProject();
  const { lat, lon } = inputs;
  const [state, setState] = useState<{ key: string; s: LookedUpState }>({ key: "", s: { status: "none" } });
  const key = lat != null && lon != null ? `${lat},${lon}` : "";
  useEffect(() => {
    if (!key || lat == null || lon == null) return;
    let alive = true;
    setState({ key, s: { status: "loading" } });
    lookUpPoint(lat, lon)
      .then((data) => { if (alive) setState({ key, s: { status: "ready", data } }); })
      .catch(() => { if (alive) setState({ key, s: { status: "error" } }); });
    return () => { alive = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!key) return { status: "none" };
  return state.key === key ? state.s : { status: "loading" };
}
