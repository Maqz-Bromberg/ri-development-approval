"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SOURCES } from "@/lib/data/sources";
import { STAGE_REFS } from "@/lib/data/stageRefs";
import { RIZA_LINKS } from "@/lib/data/atlas";
import { stageOf } from "@/lib/stages";
import { Icon } from "../Icon";
import type { IconName } from "@/lib/iconSprite";
import { Dropdown } from "./Dropdown";

const PAGES: { href: string; label: string; note?: string; icon: IconName; ext?: boolean }[] = [
  { href: RIZA_LINKS.app, label: "Zoning Atlas", note: "HousingWorks RI", icon: "atlas", ext: true },
  { href: "/towns", label: "Towns", note: "what is read, by town", icon: "site" },
  { href: "/records", label: "Records", note: "meetings and projects", icon: "folder" },
  { href: "/glossary", label: "Glossary", icon: "book" },
  { href: "/docs", label: "Documentation", icon: "book" },
  { href: "/docs/sources", label: "Sources and citations", icon: "law" },
  { href: "/engine", label: "How the engine decides", note: "flowcharts", icon: "route" },
  { href: "/after-approval", label: "After approval", icon: "check" },
];

/** The Reference menu: the current stage's own reference chips first, then the pages that sit outside the stages. */
export function RefMenu() {
  const path = usePathname();
  const stage = stageOf(path);
  const refs = stage ? STAGE_REFS[stage.id] : [];
  return (
    <Dropdown label="Reference" button={<><Icon name="book" size={16} /> Reference <Icon name="chev" size={13} className="rot" /></>} className="refmenu" panelClass="menu">
      {refs.length > 0 && (
        <>
          <h4>For {stage!.label.toLowerCase()}</h4>
          {refs.map((r) => {
            const href = r.src ? SOURCES[r.src]?.url : r.href;
            if (!href) return null;
            return /^https?:/.test(href)
              ? <a key={r.label} href={href} target="_blank" rel="noopener noreferrer" data-close><span>{r.label}</span><small>↗</small></a>
              : <Link key={r.label} href={href} data-close><span>{r.label}</span></Link>;
          })}
          <hr />
        </>
      )}
      <h4>Reference</h4>
      {PAGES.map((p) => p.ext
        ? <a key={p.href} href={p.href} target="_blank" rel="noopener noreferrer" data-close><Icon name={p.icon} size={16} /><span>{p.label}</span><small>↗</small></a>
        : <Link key={p.href} href={p.href} data-close><Icon name={p.icon} size={16} /><span>{p.label}</span>{p.note && <small>{p.note}</small>}</Link>)}
    </Dropdown>
  );
}
