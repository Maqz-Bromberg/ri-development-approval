import { EVIDENCE, type Evidence } from "@/lib/timelines";

type Risk = "low" | "medium" | "high";

interface Stage {
  n: number;
  title: string;
  who: "Script" | "AI or person" | "Person";
  does: string;
  risk: Risk;
  wrong: string;
  catches: string;
  gap: string;
}

/** The path from a public record to a marker on a timeline, in the order it is done, with the risk at each stage. */
const STAGES: Stage[] = [
  {
    n: 1, title: "Find the public record", who: "Person", risk: "medium",
    does: "Pick the agenda, minutes or memo that mentions the project. Town sites and clerk platforms publish them.",
    wrong: "The wrong meeting, a missing document, or a project that appears under a different name.",
    catches: "Each event lists its source, and the table links every one. Anyone can open it.",
    gap: "A record that was never published, or is not online, cannot appear here.",
  },
  {
    n: 2, title: "Fetch and keep the text", who: "Script", risk: "low",
    does: "fetch.py downloads each cited document and converts it to plain text.",
    wrong: "The town changes its website, a link dies, or a scanned page gives no text.",
    catches: "The script stops and reports an error instead of carrying on with nothing. A near-empty file counts as a failure.",
    gap: "Videos are not fetched, because they need a transcript first. Press sites often refuse automated downloads.",
  },
  {
    n: 3, title: "Read it and propose an event", who: "AI or person", risk: "high",
    does: "Someone, or an AI assistant, reads the passage and writes: this date, this stage, this happened, and this sentence shows it.",
    wrong: "A misreading: the wrong project, a continuance read as a decision, a date typed wrong.",
    catches: "The proposal must include the exact sentence it relied on. That sentence is what stage 4 tests.",
    gap: "A real sentence can still be misread. Nothing in the next stage can catch that.",
  },
  {
    n: 4, title: "Check the quote, word for word", who: "Script", risk: "low",
    does: "verify.py looks for the stored sentence inside the fetched document, ignoring line breaks and spacing.",
    wrong: "An invented, altered or misremembered quote.",
    catches: "The build fails. A decision with no quote also fails.",
    gap: "It proves the sentence exists in that document. It does not prove the sentence means what the event says.",
  },
  {
    n: 5, title: "Check dates and structure", who: "Script", risk: "low",
    does: "Every date must be a real date, every source must exist, and every role must be one of the allowed business or professional roles.",
    wrong: "A typo, a dead source id, or a private resident listed as a party.",
    catches: "The check fails and names the line.",
    gap: "The script cannot tell a company from a person by name. Names are reviewed by a person.",
  },
  {
    n: 6, title: "A person reviews the change", who: "Person", risk: "medium",
    does: "Changes arrive as a pull request with the passages shown. Nothing is merged automatically.",
    wrong: "A reviewer who skims a long report.",
    catches: "The report lists only what is new, with the passage beside it.",
    gap: "This is the stage that most depends on care. It has no automatic backstop.",
  },
  {
    n: 7, title: "Show it, with its evidence", who: "Script", risk: "low",
    does: "Each marker says what backs it: a checked quote, a linked source, a press report, or a date not yet checked. Elapsed times are computed from the dates, and flagged approximate when a day is unknown.",
    wrong: "Readers treating every marker as equally certain.",
    catches: "The four evidence levels, the hollow marker for unchecked dates, and the band across a month when the day is unknown.",
    gap: "Dates can change, and meetings are cancelled. Every record carries a checked date.",
  },
];

const RISK = { low: "Low risk", medium: "Medium risk", high: "Highest risk" } as const;

export function VerificationFlow() {
  return (
    <>
      <ol className="vf" aria-label="Stages from public record to timeline marker">
        {STAGES.map((s, i) => (
          <li key={s.n} className={`vf-stage r-${s.risk}`}>
            <div className="vf-head">
              <span className="vf-n" aria-hidden="true">{s.n}</span>
              <h3>{s.title}</h3>
              <span className="vf-who">{s.who}</span>
              <span className={`vf-risk r-${s.risk}`}>{RISK[s.risk]}</span>
            </div>
            <p>{s.does}</p>
            <dl>
              <div><dt>What could go wrong</dt><dd>{s.wrong}</dd></div>
              <div><dt>What catches it</dt><dd>{s.catches}</dd></div>
              <div><dt>What it cannot catch</dt><dd>{s.gap}</dd></div>
            </dl>
            {i < STAGES.length - 1 && <span className="vf-arrow" aria-hidden="true">↓</span>}
          </li>
        ))}
      </ol>
      <h2 className="h3">What the markers mean</h2>
      <ul className="vf-levels">
        {(Object.keys(EVIDENCE) as Evidence[]).map((k) => (
          <li key={k} className={`e-${k}`}><b>{EVIDENCE[k].label}.</b> {EVIDENCE[k].how}</li>
        ))}
      </ul>
    </>
  );
}
