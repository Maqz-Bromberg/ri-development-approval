"use client";

import { useMemo } from "react";
import { shortAddress } from "@/lib/lookup";
import { routeText, verdict } from "@/lib/engine";
import { buildSchedule, fmtDate } from "@/lib/schedule";
import type { StageId } from "@/lib/stages";
import { useProject } from "./ProjectProvider";

export type Standing = "fail" | "flag" | "pass";

/** What the header, the rail and the tray say about the project, worked out once from it (ARD D42). */
export function useStageFacts() {
  const { inputs, tree, steps, hearing, hydrated, origin, chosen } = useProject();
  return useMemo(() => {
    const v = verdict(inputs, tree, steps);
    const plan = buildSchedule(tree, steps, inputs.startDate, inputs.town);
    const standing: Standing = v.fails.length ? "fail" : v.flags.length ? "flag" : "pass";
    const approved = plan.find((p) => p.step.id === "record") ?? plan.find((p) => p.step.id === "final") ?? plan.find((p) => p.step.id === "zcheck");
    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const ticks = plan.flatMap((p) => p.ticks.map((t) => ({ p, t }))).sort((a, b) => a.t.date.getTime() - b.t.date.getTime());
    const next = ticks.find(({ t }) => t.date >= today) ?? ticks[0];
    const hearingTick = ticks.find(({ t }) => t.cal === "pb" && t.kind === "hearing") ?? ticks.find(({ t }) => t.kind === "hearing");
    const short = (d: Date) => fmtDate(d, { month: "short", day: "numeric" });
    const place = inputs.address ? shortAddress(inputs.address) : inputs.zone === "other" ? inputs.town : `${inputs.zone}, ${inputs.town}`;
    const n = hearing.length;
    const subs: Record<StageId, string> = {
      site: origin === "example" ? `Example, ${inputs.town}` : place,
      law: v.fails.length + v.flags.length
        ? `${v.fails.length ? `${v.fails.length} blocker${v.fails.length > 1 ? "s" : ""}` : ""}${v.fails.length && v.flags.length ? " · " : ""}${v.flags.length ? `${v.flags.length} open` : ""}`
        : "Clear on these facts",
      route: `${routeText(tree).name} · ${steps.filter((s) => !s.branch).length} steps`,
      cal: next ? `${short(next.t.date)} · ${next.t.label}` : "Not scheduled",
      hear: `${hearingTick ? `${short(hearingTick.t.date)} · ` : ""}${n} question${n === 1 ? "" : "s"} on your sheet`,
    };
    return { v, plan, standing, approved, next, hearingTick, subs, place, hydrated, origin, chosen };
  }, [inputs, tree, steps, hearing, hydrated, origin, chosen]);
}
