/**
 * The site's mark: a house half built. The left half is finished (walls, roof, a window), the right half is still framing
 * (rafter, top plate, studs and a brace), for a project somewhere between a set of plans and the keys in the door.
 * The same drawing is the favicon (app/icon.svg).
 */
export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M3 28.5h26" stroke="#8A97A6" strokeWidth="1.6" strokeLinecap="round" />
      {/* built half */}
      <path d="M16 4.5 3.2 15.6h3V28.5H16z" fill="#24508F" />
      <rect x="8.6" y="18.4" width="4.4" height="4.4" rx=".6" fill="#E6EDF6" />
      <path d="M16 4.5 3.2 15.6" stroke="#1B3A68" strokeWidth="1.6" strokeLinecap="round" />
      {/* framing half */}
      <g stroke="#24508F" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <path d="M16 4.5 28.8 15.6" />
        <path d="M16 15.6h10" />
        <path d="M20.3 15.6v12.9M25.8 15.6v12.9" />
        <path d="M20.3 27.5 25.8 16.6" strokeWidth="1.1" opacity=".75" />
        <path d="M20.3 8.2v7.4M24.4 11.8v3.8" strokeWidth="1.1" opacity=".75" />
      </g>
    </svg>
  );
}
