/*
 * Cartoon vignettes for the approval trail. Each draws inside a 120 x 110 box.
 * Built from simple shapes so they stay crisp at any size and take colours from the theme tokens.
 */
const ink = { stroke: "var(--ink)", strokeWidth: 2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Ground() {
  return <ellipse cx="60" cy="104" rx="52" ry="6" fill="var(--hill-near)" />;
}

function ZoningMap() {
  return (
    <g>
      <Ground />
      <g transform="rotate(-6 55 55)">
        <rect x="14" y="22" width="78" height="62" rx="3" fill="var(--surface)" {...ink} />
        <rect x="20" y="28" width="30" height="22" fill="var(--hill-near)" />
        <rect x="52" y="28" width="34" height="22" fill="var(--accent-soft)" />
        <rect x="20" y="52" width="66" height="26" fill="var(--wall)" />
        <rect x="56" y="56" width="22" height="16" fill="var(--roof)" opacity="0.55" />
        <line x1="50" y1="28" x2="50" y2="78" {...ink} strokeWidth={1} />
      </g>
      <circle cx="86" cy="64" r="15" fill="var(--sky)" fillOpacity="0.7" {...ink} strokeWidth={3} />
      <line x1="97" y1="75" x2="110" y2="90" {...ink} strokeWidth={5} />
    </g>
  );
}

function TownHall({ flag = false, sign }: { flag?: boolean; sign?: string }) {
  return (
    <g>
      <Ground />
      <polygon points="14,40 60,14 106,40" fill="var(--wall)" {...ink} />
      <rect x="18" y="40" width="84" height="56" fill="var(--wall)" {...ink} />
      {[28, 46, 64, 82].map((x) => <rect key={x} x={x} y="46" width="8" height="44" fill="var(--surface)" {...ink} strokeWidth={1.5} />)}
      <rect x="12" y="94" width="96" height="6" fill="var(--path-edge)" {...ink} strokeWidth={1.5} />
      <circle cx="60" cy="31" r="5" fill="var(--sun)" {...ink} strokeWidth={1.5} />
      {flag && (
        <g>
          <line x1="60" y1="14" x2="60" y2="0" {...ink} />
          <polygon points="60,1 76,5 60,9" fill="var(--roof)" {...ink} strokeWidth={1.5} />
        </g>
      )}
      {sign && (
        <g>
          <rect x="30" y="60" width="60" height="16" rx="3" fill="var(--accent)" />
          <text x="60" y="72" textAnchor="middle" className="v-text v-text-light">{sign}</text>
        </g>
      )}
    </g>
  );
}

function CoffeeTable() {
  return (
    <g>
      <Ground />
      <ellipse cx="60" cy="70" rx="44" ry="10" fill="var(--path)" {...ink} />
      <line x1="34" y1="76" x2="30" y2="100" {...ink} strokeWidth={3} />
      <line x1="86" y1="76" x2="90" y2="100" {...ink} strokeWidth={3} />
      <rect x="34" y="56" width="12" height="12" rx="2" fill="var(--surface)" {...ink} />
      <path d="M46 59 q6 3 0 7" fill="none" {...ink} strokeWidth={1.5} />
      <rect x="72" y="56" width="12" height="12" rx="2" fill="var(--surface)" {...ink} />
      <rect x="50" y="60" width="18" height="8" fill="var(--accent-soft)" {...ink} strokeWidth={1.5} />
      <path d="M38 52 q2 -6 0 -10 M78 52 q2 -6 0 -10" fill="none" stroke="var(--muted)" strokeWidth={1.5} strokeLinecap="round" />
      <ellipse cx="60" cy="22" rx="24" ry="15" fill="var(--surface)" {...ink} />
      <polygon points="52,35 48,44 60,36" fill="var(--surface)" {...ink} />
      <text x="60" y="28" textAnchor="middle" className="v-text v-text-big">?</text>
    </g>
  );
}

function StateHouse() {
  return (
    <g>
      <Ground />
      <rect x="10" y="62" width="100" height="36" fill="var(--wall)" {...ink} />
      <rect x="40" y="44" width="40" height="20" fill="var(--wall)" {...ink} />
      <path d="M42 44 A18 18 0 0 1 78 44 Z" fill="var(--surface)" {...ink} />
      <line x1="60" y1="26" x2="60" y2="14" {...ink} />
      <circle cx="60" cy="12" r="3" fill="var(--sun)" {...ink} strokeWidth={1.5} />
      {[18, 32, 46, 60, 74, 88].map((x) => <rect key={x} x={x} y="70" width="6" height="22" fill="var(--surface)" {...ink} strokeWidth={1.2} />)}
      <rect x="100" y="56" width="16" height="22" rx="2" fill="var(--surface)" {...ink} strokeWidth={1.5} transform="rotate(10 108 67)" />
      <line x1="104" y1="64" x2="113" y2="66" stroke="var(--muted)" strokeWidth={1.5} />
      <line x1="103" y1="69" x2="112" y2="71" stroke="var(--muted)" strokeWidth={1.5} />
    </g>
  );
}

function Blueprint() {
  return (
    <g>
      <Ground />
      <rect x="12" y="20" width="86" height="70" rx="3" fill="var(--accent)" {...ink} />
      {[34, 48, 62, 76].map((y) => <line key={y} x1="12" y1={y} x2="98" y2={y} stroke="var(--accent-soft)" strokeOpacity="0.35" strokeWidth={1} />)}
      {[30, 48, 66, 84].map((x) => <line key={x} x1={x} y1="20" x2={x} y2="90" stroke="var(--accent-soft)" strokeOpacity="0.35" strokeWidth={1} />)}
      <rect x="30" y="44" width="46" height="34" fill="none" stroke="var(--surface)" strokeWidth={2} />
      <polyline points="30,44 53,30 76,44" fill="none" stroke="var(--surface)" strokeWidth={2} />
      <rect x="48" y="62" width="10" height="16" fill="none" stroke="var(--surface)" strokeWidth={2} />
      <ellipse cx="98" cy="55" rx="6" ry="35" fill="var(--accent-soft)" {...ink} />
      <g transform="rotate(35 92 88)">
        <rect x="70" y="84" width="40" height="7" rx="1" fill="var(--sun)" {...ink} strokeWidth={1.5} />
        <polygon points="110,84 118,87.5 110,91" fill="var(--wall)" {...ink} strokeWidth={1.5} />
      </g>
    </g>
  );
}

function Stamp() {
  return (
    <g>
      <Ground />
      <rect x="16" y="14" width="64" height="82" rx="3" fill="var(--surface)" {...ink} />
      {[28, 36, 44, 52].map((y) => <line key={y} x1="24" y1={y} x2="72" y2={y} stroke="var(--rule)" strokeWidth={2.5} strokeLinecap="round" />)}
      <g transform="rotate(-14 48 72)">
        <rect x="24" y="62" width="50" height="20" rx="4" fill="none" stroke="var(--stamp)" strokeWidth={2.5} />
        <text x="49" y="76" textAnchor="middle" className="v-text v-stamp">APPROVED</text>
      </g>
      <rect x="86" y="44" width="22" height="12" rx="2" fill="var(--stamp)" {...ink} />
      <rect x="92" y="24" width="10" height="20" rx="4" fill="var(--roof)" {...ink} />
      <circle cx="97" cy="20" r="7" fill="var(--roof)" {...ink} />
    </g>
  );
}

function Ledger() {
  return (
    <g>
      <Ground />
      <rect x="16" y="54" width="88" height="40" rx="3" fill="var(--roof)" {...ink} />
      <rect x="22" y="48" width="80" height="8" fill="var(--wall)" {...ink} strokeWidth={1.5} />
      <rect x="20" y="22" width="40" height="28" fill="var(--surface)" {...ink} />
      <rect x="60" y="22" width="40" height="28" fill="var(--surface)" {...ink} />
      {[30, 36, 42].map((y) => <line key={y} x1="26" y1={y} x2="54" y2={y} stroke="var(--rule)" strokeWidth={2} />)}
      {[30, 36].map((y) => <line key={y} x1="66" y1={y} x2="94" y2={y} stroke="var(--rule)" strokeWidth={2} />)}
      <polygon points="84,22 92,22 92,52 88,47 84,52" fill="var(--accent)" />
      <text x="60" y="80" textAnchor="middle" className="v-text v-text-light">LAND RECORDS</text>
    </g>
  );
}

function Crane() {
  return (
    <g>
      <Ground />
      <line x1="22" y1="100" x2="22" y2="10" {...ink} strokeWidth={4} />
      <line x1="14" y1="12" x2="104" y2="12" {...ink} strokeWidth={4} />
      <rect x="8" y="10" width="10" height="10" fill="var(--hat)" {...ink} strokeWidth={1.5} />
      <line x1="84" y1="12" x2="84" y2="40" stroke="var(--ink)" strokeWidth={1.5} />
      <rect x="74" y="40" width="20" height="6" fill="var(--hat)" {...ink} strokeWidth={1.5} />
      <rect x="44" y="50" width="62" height="50" fill="none" {...ink} />
      <line x1="44" y1="67" x2="106" y2="67" {...ink} />
      <line x1="44" y1="84" x2="106" y2="84" {...ink} />
      <line x1="64" y1="50" x2="64" y2="100" {...ink} />
      <line x1="86" y1="50" x2="86" y2="100" {...ink} />
      <rect x="44" y="84" width="62" height="16" fill="var(--wall)" {...ink} />
    </g>
  );
}

function Home() {
  return (
    <g>
      <Ground />
      <polygon points="24,30 62,8 100,30" fill="var(--roof)" {...ink} />
      <rect x="28" y="30" width="68" height="70" fill="var(--wall)" {...ink} />
      {[38, 58, 76].map((y) => [34, 52, 70, 84].map((x) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="9" height="11" fill="var(--sun)" fillOpacity="0.85" {...ink} strokeWidth={1.2} />
      )))}
      <rect x="54" y="84" width="14" height="16" fill="var(--accent)" {...ink} strokeWidth={1.5} />
      <circle cx="12" cy="74" r="12" fill="var(--leaf)" {...ink} />
      <line x1="12" y1="86" x2="12" y2="100" {...ink} strokeWidth={3} />
      <circle cx="106" cy="80" r="4" fill="var(--skin)" {...ink} strokeWidth={1.5} />
      <path d="M100 100 v-10 q6 -6 12 0 v10" fill="var(--accent)" {...ink} strokeWidth={1.5} />
      <rect x="0" y="92" width="10" height="8" fill="var(--path-edge)" {...ink} strokeWidth={1.2} />
    </g>
  );
}

function HouseKey() {
  return (
    <g>
      <Ground />
      <polygon points="22,48 54,22 86,48" fill="var(--roof)" {...ink} />
      <rect x="28" y="48" width="52" height="50" fill="var(--wall)" {...ink} />
      <path d="M54 66 c-6 -8 -16 -2 -10 6 l10 10 l10 -10 c6 -8 -4 -14 -10 -6z" fill="var(--roof)" {...ink} strokeWidth={1.5} />
      <circle cx="98" cy="40" r="9" fill="none" stroke="var(--sun)" strokeWidth={5} />
      <line x1="98" y1="49" x2="98" y2="78" stroke="var(--sun)" strokeWidth={5} strokeLinecap="round" />
      <line x1="98" y1="68" x2="106" y2="68" stroke="var(--sun)" strokeWidth={4} />
      <line x1="98" y1="76" x2="104" y2="76" stroke="var(--sun)" strokeWidth={4} />
    </g>
  );
}

function Ruler() {
  return (
    <g>
      <Ground />
      <polygon points="40,46 66,26 92,46" fill="var(--roof)" {...ink} />
      <rect x="46" y="46" width="40" height="52" fill="var(--wall)" {...ink} />
      <rect x="10" y="80" width="100" height="12" fill="var(--sun)" {...ink} transform="rotate(-8 60 86)" />
      {[18, 30, 42, 54, 66, 78, 90, 102].map((x) => <line key={x} x1={x} y1="80" x2={x} y2="86" stroke="var(--ink)" strokeWidth={1.5} transform="rotate(-8 60 86)" />)}
    </g>
  );
}

export function Vignette({ id }: { id: string }) {
  switch (id) {
    case "zoning": return <ZoningMap />;
    case "rezone": return <TownHall flag sign="ZONING" />;
    case "preapp": return <CoffeeTable />;
    case "master": return <TownHall flag />;
    case "state": return <StateHouse />;
    case "prelim": return <Blueprint />;
    case "final": return <Stamp />;
    case "record": return <Ledger />;
    case "building": return <Crane />;
    case "occupy": return <Home />;
    case "elig": return <HouseKey />;
    case "zcheck": return <Ruler />;
    default: return <Blueprint />;
  }
}

/** The little builder who walks the trail, carrying the plans. Drawn around (0,0) at the feet. */
export function Walker() {
  return (
    <g className="walker-body">
      <ellipse cx="0" cy="2" rx="14" ry="3.5" fill="var(--ink)" opacity="0.15" />
      <line x1="-4" y1="0" x2="-5" y2="-16" {...ink} strokeWidth={3.5} className="leg leg-a" />
      <line x1="4" y1="0" x2="5" y2="-16" {...ink} strokeWidth={3.5} className="leg leg-b" />
      <rect x="-10" y="-38" width="20" height="24" rx="6" fill="var(--vest)" {...ink} />
      <line x1="-10" y1="-28" x2="10" y2="-28" stroke="var(--sun)" strokeWidth={2.5} />
      <circle cx="0" cy="-47" r="9" fill="var(--skin)" {...ink} />
      <circle cx="3" cy="-48" r="1.2" fill="var(--ink)" />
      <path d="M1 -43 q3 2 5 0" fill="none" stroke="var(--ink)" strokeWidth={1.2} strokeLinecap="round" />
      <path d="M-10 -52 a10 9 0 0 1 20 0 z" fill="var(--hat)" {...ink} />
      <line x1="-12" y1="-52" x2="13" y2="-52" {...ink} strokeWidth={2.5} />
      <g transform="rotate(-20 12 -28)">
        <rect x="6" y="-34" width="24" height="7" rx="3.5" fill="var(--accent-soft)" {...ink} strokeWidth={1.5} />
        <line x1="12" y1="-34" x2="12" y2="-27" stroke="var(--accent)" strokeWidth={1.2} />
      </g>
    </g>
  );
}
