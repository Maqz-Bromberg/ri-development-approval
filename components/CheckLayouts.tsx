"use client";

import { useState } from "react";
import { TREES } from "@/lib/data/trees";
import { verdict } from "@/lib/engine";
import { useProject } from "./ProjectProvider";
import { ORIGIN_LABEL, ProjectFacts, focusField, verdictHeadline } from "./Verdict";

/*
 * Pieces for the Check page layouts on trial (Trial.tsx, "Check page layout"). Both keep the rule from
 * docs/plans/check-page.md: the answer is never read apart from the facts it rests on.
 */

const STATE_LABEL = { fail: "Blocker", flag: "Open", pass: "Clear" } as const;

function OriginKicker({ note = false }: { note?: boolean }) {
  const { origin } = useProject();
  return (
    <p className="verdict-kicker">
      {origin === "example" ? <span className="example-flag">{ORIGIN_LABEL.example}</span> : <span>{ORIGIN_LABEL[origin]}</span>}
      {note && origin === "example" && <span className="muted"> Sample facts, not yours. Enter your own to check them.</span>}
    </p>
  );
}

/**
 * "Project on top, folds away": the project as a card of facts above the answer. Unfolded, it holds the
 * address lookup and the form; folded, the facts line still sits directly above the answer.
 */
export function ProjectCard({ children }: { children: React.ReactNode }) {
  const { origin } = useProject();
  const [open, setOpen] = useState(false);
  // A fact folded away is unfolded first, then focused once the form has rendered.
  const pick = (field: string) => {
    setOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => focusField(field)));
  };

  return (
    <section className={`project-card${open ? " is-open" : ""}`} aria-labelledby="pc-h">
      <div className="pc-head">
        <div className="pc-text">
          <p className="col-label" id="pc-h"><span aria-hidden="true">1</span> The project</p>
          <OriginKicker note />
          <ProjectFacts check onPick={pick} className="verdict-basis pc-facts" />
        </div>
        <button type="button" className={`btn${open ? " ghost" : ""} pc-toggle`} aria-expanded={open} aria-controls="pc-body" onClick={() => setOpen(!open)}>
          {open ? "Fold away ▴" : origin === "example" ? "Enter your project ▾" : "Edit the project ▾"}
        </button>
      </div>
      <div id="pc-body" className="pc-body" hidden={!open}>{children}</div>
    </section>
  );
}

/**
 * "Sticky project-and-answer bar": the facts on the left and the answer on the right, pinned under the site
 * header for the whole page, so whichever part of the page is on screen, the premise and the answer are too.
 */
export function CheckBar() {
  const { inputs, tree, steps } = useProject();
  const v = verdict(inputs, tree, steps);
  const state = v.fails.length ? "fail" : v.flags.length ? "flag" : "pass";
  const months = v.reviewDays ? Math.max(1, Math.round(v.reviewDays / 30.4)) : 0;

  return (
    <div className={`check-bar v-${state}`} role="region" aria-label="The project and its answer">
      <div className="cb-project">
        <OriginKicker />
        <ProjectFacts check className="verdict-basis cb-facts" />
      </div>
      <div className="cb-answer">
        <p className="cb-head"><span className={`st ${state}`}>{STATE_LABEL[state]}</span> <b>{verdictHeadline(v)}</b></p>
        <p className="cb-meta muted">
          {TREES[tree].name}{months ? ` · town review up to ${months} months` : ""}
          {v.fails.length + v.flags.length > 0 && <> · <a href="#answer">{v.fails.length + v.flags.length} to settle ↓</a></>}
        </p>
      </div>
    </div>
  );
}
