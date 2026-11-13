"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { TREES } from "@/lib/data/trees";
import { verdict } from "@/lib/engine";
import { SHARE_PARAM, encodeState, fromFile, toFile } from "@/lib/share";
import { useProject } from "./ProjectProvider";

const ORIGIN_NOTE = {
  example: "You're looking at the example project.",
  browser: "This project is saved in this browser only. Clearing site data or switching device loses it.",
  link: "Loaded from a share link. Changes you make here are saved in this browser, not back to the link.",
  file: "Loaded from a project file. Changes you make here are saved in this browser, not back to the file.",
} as const;

/** Ways to keep a project outside this browser: a link that carries it, a file, a printed summary, an email. */
export function ShareTools({ printHere = false }: { printHere?: boolean }) {
  const { saved, importState, inputs, tree, steps, progress, notes, origin } = useProject();
  const [msg, setMsg] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const link = () => `${window.location.origin}${window.location.pathname}#${SHARE_PARAM}=${encodeState(saved)}`;
  const name = `${inputs.units} units, ${inputs.zone === "other" ? inputs.town : `${inputs.zone}, ${inputs.town}`}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link());
      setMsg("Link copied. Anyone who opens it sees this project, notes included.");
    } catch {
      setMsg("Couldn't reach the clipboard. Use the project file instead.");
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([toFile(saved)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `approval-project-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMsg("Project file downloaded.");
  };

  const load = async (f: File | undefined) => {
    if (!f) return;
    const next = fromFile(await f.text());
    if (next) { importState(next); setMsg(`Loaded ${f.name}.`); } else setMsg("That file isn't a project file from this site.");
    if (file.current) file.current.value = "";
  };

  const email = () => {
    const v = verdict(inputs, tree, steps);
    const lines = [
      `${name}${inputs.address ? ` (${inputs.address})` : ""}`,
      `Route: ${TREES[tree].name}`,
      v.reviewDays ? `Town review: up to ${v.reviewDays} days of statutory clocks` : "",
      ...v.fails.map((f) => `Blocker: ${f.t}`),
      ...v.flags.map((f) => `Open: ${f.t}`),
      "",
      ...steps.map((s) => {
        const p = progress(s);
        const note = notes[`${tree}/${s.id}`]?.trim();
        return `${s.n}. ${s.title}${p.done ? ` (${p.done} of ${p.total} considerations dealt with)` : ""}${note ? `\n   Note: ${note}` : ""}`;
      }),
      "",
      "Open the project:",
      link(),
    ].filter((l, i, a) => l !== "" || a[i - 1] !== "");
    // Mail clients cut long links, so keep the body under about 1,800 characters.
    let body = lines.join("\n");
    if (body.length > 1800) body = [lines[0], lines[1], "", "Open the project:", link()].join("\n");
    window.location.href = `mailto:?subject=${encodeURIComponent(`Approval route: ${name}`)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="share no-print">
      <div className="share-actions">
        <button type="button" className="btn" onClick={copy}>Copy share link</button>
        {printHere
          ? <button type="button" className="btn ghost" onClick={() => window.print()}>Print or save as PDF</button>
          : <Link href="/summary" className="btn ghost">Printable summary</Link>}
        <button type="button" className="btn ghost" onClick={email}>Email a summary</button>
        <button type="button" className="btn ghost" onClick={download}>Download project file</button>
        <button type="button" className="btn ghost" onClick={() => file.current?.click()}>Open a project file</button>
        <input ref={file} type="file" accept=".json,application/json" hidden onChange={(e) => load(e.target.files?.[0])} />
      </div>
      <p className="small muted" aria-live="polite">{msg || ORIGIN_NOTE[origin]}</p>
    </div>
  );
}
