import Link from "next/link";
import { RIZA_LINKS } from "@/lib/data/atlas";

/** The slim strip fixed at the bottom of the shell, on every stage (ARD D42). */
export function Strip() {
  return (
    <div className="strip no-print" role="contentinfo">
      <span><b>Development version.</b> Not reviewed or confirmed by any town or state agency. Not legal advice.</span>
      <span className="strip-links">
        <Link href="/engine">How the engine decides</Link>
        <Link href="/docs">Documentation</Link>
        <Link href="/docs/sources">Sources and citations</Link>
      </span>
    </div>
  );
}

/**
 * The full text, at the end of each stage and every reference page, and in print. It stands on its own because the site may be
 * shown to subject experts without its author there: it says how an answer is made, what has been read, and where to report an error.
 */
export function FullDisclaimer() {
  return (
    <footer className="full-disclaimer" aria-label="About these answers">
      <h2>About these answers</h2>
      <p>
        RI Building Plan Approval reads state and local rules as published (October 2026). It is a development version: it has not been reviewed or confirmed by any town
        or state agency, it is not legal advice, and it does not replace a determination by a municipality or a state agency. Town staff verify final versions.
      </p>
      <ul>
        <li><b>How an answer is worked out.</b> Each part of the engine is drawn as a flowchart, with the code and the decision behind every box: <Link href="/engine">How the engine decides</Link>.</li>
        <li><b>What has been read for this town.</b> Only Cumberland has been read in full beyond state law. Providence is a trial reading that the city has not confirmed. Every other town runs on state law and the Zoning Atlas. The level of each town, and the dates it was read, are on <Link href="/towns">Towns</Link>.</li>
        <li><b>Every requirement cites its source.</b> A finding, a document and a deadline each carry the law, ordinance or record it comes from, with the quotation where one was read. All of them are listed on <Link href="/docs/sources">Sources and citations</Link>. Where something has not been read, or is not public, it is shown as a gap and not guessed.</li>
        <li><b>The Zoning Atlas</b> is HousingWorks RI&apos;s reading of zoning as of September 2024, not real-time. <a href={RIZA_LINKS.housingworks} target="_blank" rel="noopener noreferrer">About HousingWorks RI ↗</a></li>
        <li><b>Where to report an error.</b> A wrong date, a rule misread, a link that no longer works: tell the person who gave you this address. Each finding and document names the source to check it against.</li>
      </ul>
      <p className="links"><Link href="/docs">Documentation</Link> · <Link href="/glossary">Glossary of terms</Link> · <Link href="/docs/site-facts">How site facts are found</Link> · <Link href="/verification">How records are checked</Link></p>
    </footer>
  );
}
