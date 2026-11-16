"use client";

import { itemKey, visibleDocs } from "@/lib/engine";
import { SHARE_PARAM, encodeState } from "@/lib/share";
import { buildSchedule, tickDocs, toICS } from "@/lib/schedule";
import { useProject } from "./ProjectProvider";

/**
 * Download the approval schedule as an .ics file. Each event carries the project's considerations as done or open,
 * so what is ticked here reaches the calendar, and the link in each event reopens the project with its ticks.
 */
export function useCalendarFile() {
  const { tree, steps, inputs, checked, flags, saved } = useProject();
  return () => {
    const plan = buildSchedule(tree, steps, inputs.startDate, inputs.town);
    const progress = (p: (typeof plan)[number], t: (typeof plan)[number]["ticks"][number]) => {
      const items = tickDocs(t, visibleDocs(p.step, flags)).flatMap((d) => d.checklist.map((text, i) => ({ text, on: !!checked[itemKey(tree, p.step.id, d, i)] })));
      return { items, done: items.filter((x) => x.on).length, total: items.length };
    };
    const link = `${window.location.origin}/law#${SHARE_PARAM}=${encodeState(saved)}`;
    const blob = new Blob([toICS(plan, `${inputs.units} units, ${inputs.zone}, ${inputs.town}`, progress, link)], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "approval-schedule.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
}
