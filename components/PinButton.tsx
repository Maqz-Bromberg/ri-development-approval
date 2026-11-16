"use client";

import { Icon } from "./Icon";
import { useProject } from "./ProjectProvider";

/** Pin or unpin something on the site by its id (f:, d:, c:, t:, x:, o:). The tray lists what is pinned. */
export function PinButton({ id, what = "this" }: { id: string; what?: string }) {
  const { pins, togglePin } = useProject();
  const on = pins.some((p) => p.id === id);
  return (
    <button type="button" className={`pinbtn${on ? " on" : ""}`} aria-pressed={on} title={on ? "Unpin from the tray" : "Pin to the tray"} aria-label={`${on ? "Unpin" : "Pin"} ${what}`} onClick={() => togglePin(id)}>
      <Icon name="pin" size={15} />
    </button>
  );
}
