"use client";

import { useProject } from "./ProjectProvider";
import { Dropdown } from "./shell/Dropdown";

/**
 * A step's note. With no note the icon offers "Add a note"; with one it becomes a comment icon with a dot. The pop-up holds a text box,
 * saved as you type. A note that came in a project file or a share link says where it came from (ARD D42).
 */
export function NoteButton({ stepId, compact = false }: { stepId: string; compact?: boolean }) {
  const { notes, setNote, tree, origin } = useProject();
  const note = notes[`${tree}/${stepId}`] ?? "";
  const has = note.trim().length > 0;
  const from = origin === "link" ? "the shared link" : origin === "file" ? "the project file" : null;
  const icon = (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16v11H10l-4 4v-4H4z" />
      {has ? <circle cx="18" cy="5" r="3" fill="currentColor" stroke="none" /> : <path d="M12 8v5M9.5 10.5h5" />}
    </svg>
  );
  return (
    <Dropdown label={has ? "Read or edit your note on this step" : "Add a note"} button={icon} className={`note-dd${has ? " has" : ""}${compact ? " compact" : ""}`} panelClass="note-pop" align="left">
      <label className="step-note">
        <span>Your note on this step</span>
        <textarea rows={4} value={note} autoFocus placeholder="Who you spoke to, what they asked for, what's still open" onChange={(e) => setNote(stepId, e.target.value)} />
        <span className="muted small">Saved as you type. Travels with the share link, the project file and the printed summary.{has && from ? ` Came in ${from}, if you did not write it.` : ""}</span>
      </label>
    </Dropdown>
  );
}
