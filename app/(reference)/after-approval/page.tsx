import type { Metadata } from "next";
import Link from "next/link";
import { HISTORY } from "@/lib/data/history";
import { fmtEventDate } from "@/lib/timelines";

export const metadata: Metadata = { title: "From build" };

const POST = new Set(["recorded", "permit", "start", "co"]);
const LABEL: Record<string, string> = { recorded: "Plan recorded", permit: "Building permit", start: "Construction start", co: "Certificate of occupancy" };

export default function AfterApprovalPage() {
  return (
    <section className="sec" aria-labelledby="build-h">
      <div className="sec-head">
        <div>
          <p className="eyebrow">From build</p>
          <h1 id="build-h" className="h2">What happened after approval</h1>
        </div>
        <p>
          Planning records stop at approval. Recording, the building permit, construction start and the certificate of occupancy are found
          elsewhere, and are not yet read for any project. This page is the place for them, kept apart so the approval timelines stay what the minutes support.
        </p>
      </div>
      <div className="callout-note">
        <b>Where each milestone is public.</b> The plan is recorded with the Town Clerk's land evidence. The building permit and certificate of
        occupancy are in the building office's permit portal, where the town has one. Construction start and completion are usually only in press and developer statements. See <Link href="/verification">how records are checked</Link>.
      </div>
      <ul className="build-list">
        {HISTORY.map((h) => {
          const post = h.events.filter((e) => POST.has(e.stage));
          return (
            <li key={h.name}>
              <b>{h.name}</b> <span className="muted small">{h.statusLabel}</span>
              {post.length ? (
                <ul>{post.map((e) => <li key={e.date + e.what}><span className="mono small">{fmtEventDate(e.date)}</span> {LABEL[e.stage]}: {e.what}</li>)}</ul>
              ) : (
                <p className="muted small">No recording, permit, start or completion found yet. Not in the planning record.</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
