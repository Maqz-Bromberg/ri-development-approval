/**
 * Scroll to something on the stage and flash it. The stage scrolls inside its own column, so scrollIntoView does the work.
 * A component that keeps its target folded away listens for "goto" and opens it first (rows of steps, a hearing question).
 */
export function goTo(id: string, opts: { focus?: boolean } = {}): void {
  window.dispatchEvent(new CustomEvent("goto", { detail: id }));
  window.setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "start", behavior: calm ? "auto" : "smooth" });
    if (opts.focus && "focus" in el) (el as HTMLElement).focus({ preventScroll: true });
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
    window.setTimeout(() => el.classList.remove("flash"), 1600);
  }, 60);
}
