"use client";

import { useEffect, useState } from "react";
import { onSitesChanged, readSites, sameSite, saveSite, unsavedChanges, type SavedSite } from "@/lib/savedSites";
import { Icon } from "../Icon";
import { useProject } from "../ProjectProvider";
import { SavedSites } from "../SavedSites";
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
  const example = !hydrated || origin === "example";
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
          <span className="badge" aria-hidden="true">{example || clean ? "✓" : changes.length || 1}</span>
        </span>
        <span>
          <b>{example ? "No changes to save" : clean ? "Saved" : changes[0] === "Not saved yet" ? "Not saved yet" : `${changes.length} change${changes.length > 1 ? "s" : ""} not saved`}</b>
          <small>{example ? "The example, as it comes" : "Your sites, this browser"}</small>
        </span>
        <span className="tip" role="tooltip">
          {example ? "This is the example project, unchanged, and it is always here. Choose a site or change a fact, and the project becomes yours to save." : clean ? "The project on screen matches its saved copy." : <>Not saved: <ul>{changes.map((c) => <li key={c}>{c}</li>)}</ul></>}
          <span className="tip-foot">Save keeps the whole project, with its pins, ticks and notes, under Your sites. A pin only marks something inside the project.</span>
        </span>
      </span>
      <button type="button" className="go" onClick={save} disabled={example || clean}>Save</button>
      <Dropdown label="Your sites, and other ways to keep this project" button={<Icon name="chev" size={14} className="rot" />} className="save-more" panelClass="save-card">
        <h4 className="sc-h">Your sites <small>this browser only</small></h4>
        <SavedSites inMenu />
        <h4 className="sc-h">Take it with you <small>works on any device</small></h4>
        <ShareTools printHere={false} />
        <p className="small muted sc-foot">Clearing site data or switching device loses Your sites. A project file or a share link carries everything, notes and pins included.</p>
        <p className="small" aria-live="polite">{msg}</p>
      </Dropdown>
    </div>
  );
}
