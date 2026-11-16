import { ICON_SPRITE, type IconName } from "@/lib/iconSprite";

/** The sprite, rendered once in the shell. `<Icon name>` points into it. */
export function IconSprite() {
  return <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: ICON_SPRITE }} />;
}

export function Icon({ name, size = 18, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={`i ${className}`.trim()} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <use href={`#ic-${name}`} />
    </svg>
  );
}
