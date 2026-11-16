"use client";

import { useEffect, useState } from "react";
import { onSitesChanged, readSites, sameSite, saveSite, unsavedChanges, type SavedSite } from "@/lib/savedSites";
import { Icon } from "../Icon";
import { useProject } from "../ProjectProvider";
import { ShareTools } from "../ShareTools";
import { Dropdown } from "./Dropdown";

/**
 * The save chip: "N changes not saved" or "Saved", with the changes listed on hover. Save writes the project to Your sites,
 * replacing the earlier copy of the same site (ARD D42, D28). Its card holds the project file, the share link and the printed review.
 * Nothing warns on leaving (D26): everything can be kept.
 */
export function SaveChip() {
  const { saved, origin, hydrated } = useProject();
  const [list, setList] = useState<SavedSite[]>([]);
  const [msg, setMsg] = useState("");
  const [flash, setFlash] = useState(false);
  useEffect(() => { if (!hydrated) return; setList(readSites()); return onSitesChanged(() => setList(readSites())); }, [hydrated]);

  const copy = list.find((x) => sameSite(x.project, saved));
  const changes = unsavedChanges(saved, copy?.project);
  const example = origin === "example";
  const clean = !example && changes.length === 0;

  const save = () => {
    if (saveSite(saved)) { setMsg("Saved to Your sites, in this browser."); setFlash(true); setTimeout(() => setFlash(false), 700); }
    else setMsg("This browser won't keep it (a private window, or storage is blocked). Download the project file instead.");
  };

  return (
    <div className={`save${clean ? " clean" : ""}${flash ? " justsaved" : ""}${example ? " is-example" : ""}`}>
      <span className="st hc-tip" tabIndex={0}>
        <span className="disk">
          <Icon name="save" size={20} />
          {!example && <span className="badge" aria-hidden="true">{clean ? "✓" : changes.length || 1}</span>}
        </span>
        <span>
          <b>{example ? "Example project" : clean ? "Saved" : changes[0] === "Not saved yet" ? "Not saved yet" : `${changes.length} change${changes.length > 1 ? "s" : ""} not saved`}</b>
          <small>{example ? "Nothing of yours to save" : "Your sites, this browser"}</small>
        </span>
        <span className="tip" role="tooltip">
          {example ? "Choose a site, or change a fact, and the project becomes yours to save." : clean ? "The project on screen matches its saved copy." : <>Not saved: <ul>{changes.map((c) => <li key={c}>{c}</li>)}</ul></>}
        </span>
      </span>
      <button type="button" className="go" onClick={save} disabled={example || clean}>Save</button>
      <Dropdown label="Keep this project: file, share link, printed review" button={<Icon name="chev" size={14} className="rot" />} className="save-more" panelClass="save-card">
        <b className="t">Keep this project</b>
        <p className="small muted">Your sites is this browser only: clearing site data or switching device loses it. A project file or a share link carries everything, notes and pins included.</p>
        <ShareTools printHere={false} />
        <p className="small" aria-live="polite">{msg}</p>
      </Dropdown>
    </div>
  );
}
