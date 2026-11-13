import Link from "next/link";
import { ApprovalTrail } from "@/components/ApprovalTrail";
import { TrailHeading } from "@/components/TrailHeading";
import { Verdict } from "@/components/Verdict";

export default function Home() {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-text">
        <p className="eyebrow">Rhode Island · building plan approval</p>
        <h1>From a set of plans to the keys in the door, one step at a time</h1>
        <p className="lede">
          Enter your project and see every approval it needs, who decides each one, and the forms to file. Every document comes
          with a checklist, and every requirement links to the law that sets it.
        </p>
        <div className="hero-actions">
          <Link href="/project" className="btn">Check your project</Link>
          <Link href="/hearing" className="btn ghost">Prepare for the hearing</Link>
        </div>
        </div>
        <aside className="hero-aside" aria-label="The example project at a glance">
          <Verdict compact />
        </aside>
      </section>

      <section className="sec" aria-labelledby="trail-h">
        <TrailHeading />
        <ApprovalTrail />
      </section>

      <section className="sec features" aria-label="What's inside">
        <Link href="/project" className="feature">
          <span className="f-icon" aria-hidden="true">⌂</span>
          <h3>A verdict from an address</h3>
          <p>Type an address to get the district, the parcel and the utilities, then see the route, the blockers and the nearby alternatives.</p>
        </Link>
        <Link href="/steps" className="feature">
          <span className="f-icon" aria-hidden="true">✓</span>
          <h3>Every step, and who decides it</h3>
          <p>What you file, which elected, appointed or staff body holds the decision, and what to consider before filing. Share it as a link.</p>
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
        <Link href="/hearing" className="feature">
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
    </div>
  );
}
