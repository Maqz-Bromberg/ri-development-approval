import Link from "next/link";
import { ApprovalTrail } from "@/components/ApprovalTrail";
import { TrailHeading } from "@/components/TrailHeading";

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Rhode Island · building plan approval</p>
        <h1>From a set of plans to the keys in the door, one step at a time</h1>
        <p className="lede">
          Enter your project and see every approval it needs, who decides each one, and the forms to file. Every document comes
          with a checklist, and every requirement links to the law that sets it.
        </p>
        <div className="hero-actions">
          <Link href="/project" className="btn">Start with your project</Link>
          <Link href="/objections" className="btn ghost">Prepare for the hearing</Link>
        </div>
      </section>

      <section className="sec" aria-labelledby="trail-h">
        <TrailHeading />
        <ApprovalTrail />
      </section>

      <section className="sec features" aria-label="What's inside">
        <Link href="/project" className="feature">
          <span className="f-icon" aria-hidden="true">✓</span>
          <h3>A checklist for every form</h3>
          <p>Each application is broken down into the things to check before you file, with progress saved in your browser.</p>
        </Link>
        <Link href="/schedule" className="feature">
          <span className="f-icon" aria-hidden="true">▦</span>
          <h3>A calendar from start to move-in</h3>
          <p>Every filing, deadline and hearing dated from your start date. Each tick opens the checklist due that day.</p>
        </Link>
        <Link href="/atlas" className="feature">
          <span className="f-icon" aria-hidden="true">⌖</span>
          <h3>What your district allows</h3>
          <p>Read live from the Rhode Island Zoning Atlas: housing types, lot sizes, density, height and parking for every Cumberland district.</p>
        </Link>
        <Link href="/objections" className="feature">
          <span className="f-icon" aria-hidden="true">“</span>
          <h3>Questions neighbours actually ask</h3>
          <p>Drawn from Cumberland's own minutes and meeting videos, with what applicants did and how the board voted.</p>
        </Link>
        <Link href="/records" className="feature">
          <span className="f-icon" aria-hidden="true">§</span>
          <h3>Where meeting records live</h3>
          <p>Links to Town Council and Planning Board agendas, plus recent Cumberland projects like yours.</p>
        </Link>
      </section>
    </>
  );
}
