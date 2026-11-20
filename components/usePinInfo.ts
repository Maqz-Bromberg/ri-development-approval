"use client";

import { useMemo } from "react";
import { CONTACTS, AUTHORITY_KIND_LABEL, shortName } from "@/lib/data/contacts";
import { OBJECTIONS } from "@/lib/data/objections";
import { visibleDocs } from "@/lib/engine";
import { sortedFindings } from "@/lib/findings";
import { fmtDate } from "@/lib/schedule";
import { useProject } from "./ProjectProvider";
import { projectBasis } from "./Verdict";
import { useStageFacts } from "./useStages";

export interface PinInfo {
  label: string;
  detail: string;
  /** Where "Go to it" leads, and the element to scroll to there */
  href: string;
  target?: string;
  /** False when the project has changed so that the thing no longer applies. The pin stays until it is unpinned. */
  live: boolean;
}

/** Each pin's label and detail are worked out from the project every time, not copied, so a pin follows the project (ARD D42). */
export function usePinInfo(): (id: string) => PinInfo {
  const { inputs, tree, steps, flags } = useProject();
  const { plan } = useStageFacts();
  const findings = useMemo(() => sortedFindings(inputs, tree), [inputs, tree]);
  const facts = useMemo(() => projectBasis(inputs), [inputs]);
  return (id) => {
    const [kind, rest = ""] = [id.slice(0, id.indexOf(":")), id.slice(id.indexOf(":") + 1)];
    if (kind === "f") {
      const f = findings.find((x) => x.id === rest);
      return f ? { label: f.t, detail: f.st === "fail" ? "Blocker" : f.st === "flag" ? "Open question" : "Finding", href: "/law", target: `fd-${rest}`, live: true }
        : { label: "A finding", detail: "No longer applies to this project", href: "/law", live: false };
    }
    if (kind === "d") {
      const [stepId, title] = rest.split("|");
      const s = steps.find((x) => x.id === stepId);
      const d = s && visibleDocs(s, flags).find((x) => x.title === title);
      return d ? { label: d.title, detail: `Document · step ${s!.n}: ${s!.title}`, href: "/route", target: `d-${stepId}`, live: true }
        : { label: title ?? "A document", detail: "No longer applies to this project", href: "/route", live: false };
    }
    if (kind === "c") {
      const c = CONTACTS[rest];
      return c ? { label: shortName(c.name), detail: AUTHORITY_KIND_LABEL[c.kind], href: "/route", live: true } : { label: rest, detail: "Not on this route", href: "/route", live: false };
    }
    if (kind === "t") {
      const hit = plan.flatMap((p) => p.ticks.map((t) => ({ p, t }))).find(({ t }) => t.id === rest);
      return hit ? { label: hit.t.label, detail: `${fmtDate(hit.t.date, { weekday: "short", month: "short", day: "numeric", year: "numeric" })} · step ${hit.p.step.n}`, href: "/calendar", target: `m-${rest}`, live: true }
        : { label: "A date", detail: "No longer on this schedule", href: "/calendar", live: false };
    }
    if (kind === "x") {
      const b = facts.find((x) => x.field === rest);
      return b ? { label: b.t, detail: "Site fact", href: "/site", target: rest, live: true } : { label: rest, detail: "Site fact", href: "/site", target: rest, live: true };
    }
    if (kind === "o") {
      const o = OBJECTIONS.find((x) => x.id === rest);
      return o ? { label: `"${o.said}"`, detail: `Hearing question · ${o.topic}`, href: "/hearing", target: rest, live: true } : { label: rest, detail: "No longer listed", href: "/hearing", live: false };
    }
    return { label: id, detail: "", href: "/site", live: false };
  };
}
