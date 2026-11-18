"use client";

import Link from "next/link";
import { FACT_SOURCES } from "@/lib/data/factSources";
import { fmt } from "@/lib/engine";
import { Icon } from "./Icon";
import { HoverCard } from "./Popover";
import { useProject } from "./ProjectProvider";
import { useLookedUp } from "./useLookedUp";

/** How one fact is found, from the fact sources, for the card behind a check mark. */
function How({ id }: { id: string }) {
  const src = FACT_SOURCES.find((f) => f.id === id);
  if (!src) return null;
  return (
    <>
      <p><b>How it was found:</b> {src.layer ? <a href={src.layer.url} target="_blank" rel="noopener noreferrer">{src.layer.label} ↗</a> : null}. {src.query}</p>
      <p className="muted"><b>What it can miss:</b> {src.misses}</p>
      <p className="small"><Link href={`/docs/site-facts#${id}`}>Every fact the site looks up →</Link></p>
    </>
  );
}

/**
 * A check beside a fact the map layers found and the form holds: the fact was applied by the lookup, or entered and confirmed by it.
 * The card says what was found and how (ARD D48).
 */
export function FactMark({ id, said, label }: { id: string; said: React.ReactNode; label: string }) {
  return (
    <HoverCard
      className="fact-mark"
      label={`${label}: found on the map. How it was found`}
      width={340}
      card={<><b className="pop-title">Found on the map</b><p>{said}</p><How id={id} /></>}
    >
      <Icon name="check" size={13} />
    </HoverCard>
  );
}

type Row = { id: string; label: string; found: string | null; held: string; same: boolean };

const yn = (v: boolean) => (v ? "yes" : "no");

/**
 * A document mark beside the site's address: what the lookup found for the site, fact by fact, and whether the form still
 * holds it or the applicant changed it. Read from the cached lookup, so it is right after a reload too (ARD D48).
 */
export function AppliedDoc({ appliedNow }: { appliedNow: boolean }) {
  const { inputs } = useProject();
  const look = useLookedUp();
  if (look.status !== "ready") return null;
  const { facts: f, suggest: s } = look.data;
  const sqft = f.acres ? Math.round((f.acres * 43560) / 100) * 100 : null;
  const rows: Row[] = [
    { id: "town", label: "Municipality", found: f.town, held: inputs.town, same: f.town === inputs.town },
    { id: "zone", label: "Zoning district", found: f.zone, held: inputs.zone === "other" ? "not chosen" : inputs.zone, same: f.zone === inputs.zone },
    { id: "parcel", label: "Parcel", found: f.platLot, held: inputs.parcel || "blank", same: f.platLot === inputs.parcel },
    { id: "lot", label: "Lot area", found: sqft ? `${fmt(sqft)} sq ft` : null, held: `${fmt(inputs.lot)} sq ft`, same: sqft !== null && Math.abs(sqft - inputs.lot) <= 100 },
    { id: "water", label: "Public water", found: f.water === null ? null : yn(f.water), held: yn(inputs.water), same: f.water === inputs.water },
    { id: "sewer", label: "Public sewer", found: f.sewer === null ? null : yn(f.sewer), held: yn(inputs.sewer), same: f.sewer === inputs.sewer },
    { id: "dot", label: "State road", found: s.stateRoads === null ? null : yn(s.stateRoads.length > 0), held: yn(inputs.dot), same: s.stateRoads !== null && s.stateRoads.length > 0 === inputs.dot },
    { id: "wet", label: "Wetlands", found: s.wetlands === null ? null : yn(s.wetlands.length > 0), held: yn(inputs.wet), same: s.wetlands !== null && s.wetlands.length > 0 === inputs.wet },
    { id: "transit", label: "Bus stop, 1/8 mile", found: s.stops === null ? null : yn(s.stops.length > 0), held: yn(inputs.transit), same: s.stops !== null && s.stops.length > 0 === inputs.transit },
  ];
  const changed = rows.filter((r) => r.found !== null && !r.same).length;
  return (
    <HoverCard
      className="applied-doc"
      label="What the map lookup applied to the project"
      width={380}
      card={
        <>
          <b className="pop-title">{appliedNow ? "Applied from the map" : "What the map layers found for this site"}</b>
          <table className="applied-table">
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={r.found === null ? "is-gap" : r.same ? "is-same" : "is-changed"}>
                  <th scope="row">{r.label}</th>
                  <td>{r.found ?? "not found"}</td>
                  <td>{r.found === null ? <span className="gap-tag">Gap</span> : r.same ? <span className="ap-ok"><Icon name="check" size={12} /> in the form</span> : <span className="ap-chg">you have {r.held}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small muted">
            {changed ? `${changed} changed by you since. ` : ""}Each fact stays yours to change. A check beside a fact in the form opens how it was found.
          </p>
        </>
      }
    >
      <Icon name="doc" size={15} />
    </HoverCard>
  );
}
