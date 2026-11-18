"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef } from "react";
import { STAGES, stageOf } from "@/lib/stages";
import { Icon } from "../Icon";
import { useProject } from "../ProjectProvider";
import { useStageFacts } from "../useStages";
import { useTrial } from "../Trial";
import { BrandMark } from "./BrandMark";
import { RefMenu } from "./RefMenu";
import { SaveChip } from "./SaveChip";

/**
 * The header: the brand, the five stages with a live subtitle each, the Reference menu and the save chip (ARD D42).
 * With no stage open the five are spaced evenly. On a stage, the stages before it gather at the left end and the ones after at
 * the right, and a dotted arrow in the stage's colour runs into it and out of it (ARD D49). The gaps are one flat row of
 * separators, so a change of stage slides them rather than redrawing the bar.
 */
export function Header({ onOutline }: { onOutline?: () => void }) {
  const path = usePathname();
  const here = stageOf(path);
  const curIdx = STAGES.findIndex((s) => s.id === here?.id);
  const { subs, standing, hydrated } = useStageFacts();
  const { origin, chosen } = useProject();
  const trial = useTrial();
  const gated = trial.gate === "gated" && hydrated && !chosen;
  // Sticky things sit under the header, whose height changes with the width. Publish it as --header-h.
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <header className="top" ref={ref}>
      <Link href="/" className="brand">
        <BrandMark />
        <b>RI Building Plan Approval</b>
      </Link>
      <nav className={`stages${curIdx >= 0 ? ` has-cur ${STAGES[curIdx].wash}` : " no-cur"}`} aria-label="Stages">
        {STAGES.map((s, i) => {
          const cur = here?.id === s.id;
          const dim = gated && s.id !== "site";
          const arrow = curIdx >= 0 && (i === curIdx || i - 1 === curIdx);
          return (
            <Fragment key={s.id}>
              {i > 0 && <span className={`sep${arrow ? " arrow" : ""}`} aria-hidden="true"><span className="sep-line" /><Icon name="chev" size={14} /></span>}
              <Link href={s.href} className={`stg ${s.wash}${cur ? " cur" : ""}${dim ? " dim" : ""}`} aria-current={cur ? "page" : undefined}>
                <span className="ic"><Icon name={s.icon} size={19} /></span>
                <span className="nm">
                  {s.label}
                  {s.id === "site" && origin === "example" && <span className="ex-tag">EXAMPLE</span>}
                </span>
                <span className="sub">
                  {s.id === "law" && !dim && <span className={`dot ${standing}`} aria-hidden="true" />}
                  {dim ? "Choose a site first" : hydrated ? subs[s.id] : " "}
                </span>
              </Link>
            </Fragment>
          );
        })}
      </nav>
      <div className="top-tools">
        {onOutline && <button type="button" className="chipbtn outline-btn" onClick={onOutline}><Icon name="outline" size={16} /> Outline</button>}
        <RefMenu />
      </div>
      <SaveChip />
    </header>
  );
}
