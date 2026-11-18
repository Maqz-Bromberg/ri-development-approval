"use client";

import { CONTACTS } from "@/lib/data/contacts";
import type { IconName } from "@/lib/iconSprite";
import { KindIcon } from "./Authority";
import { Icon } from "./Icon";
import { useTrial } from "./Trial";
import { Vignette } from "./Vignettes";

/** A line icon per kind of step, after the old pathway's pictures (map, town hall, coffee table, blueprint, stamp, ledger, crane, house). */
const LINE: Record<string, IconName> = {
  zoning: "atlas", rezone: "townhall", preapp: "talk", master: "townhall", state: "state", prelim: "blueprint",
  final: "stamp", record: "book", building: "crane", occupy: "home", elig: "key", zcheck: "ruler",
};

/** The order steps run in, for laying two routes' steps side by side */
export const STEP_RANK = ["zoning", "rezone", "elig", "preapp", "zcheck", "master", "state", "prelim", "final", "record", "building", "occupy"];

/**
 * The mark beside a step, in the style the `stepIcons` trial sets (ARD D52): a line icon, the old pathway's picture, the mark of the body
 * that decides it, or nothing. `who` is the deciding contact's id.
 */
export function StepIcon({ id, who, size = 18 }: { id: string; who?: string; size?: number }) {
  const { stepIcons } = useTrial();
  if (stepIcons === "none") return null;
  if (stepIcons === "vignette") {
    return <svg className="step-ic vig" width={size * 1.5} height={size * 1.4} viewBox="0 0 120 110" aria-hidden="true"><Vignette id={id} /></svg>;
  }
  if (stepIcons === "who") {
    const c = who ? CONTACTS[who] : undefined;
    return <span className={`step-ic who${c ? ` k-${c.kind}` : " none"}`} aria-hidden="true">{c ? <KindIcon kind={c.kind} size={size - 2} /> : <Icon name="file" size={size - 2} />}</span>;
  }
  return <span className="step-ic line" aria-hidden="true"><Icon name={LINE[id] ?? "milestone"} size={size} /></span>;
}
