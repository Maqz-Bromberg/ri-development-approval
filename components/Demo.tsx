/** Marks a control or figure that is a stand-in, not a working feature. */
export function DemoTag({ children = "Demo" }: { children?: React.ReactNode }) {
  return <span className="demo-tag" title="A stand-in, not a working feature. See the list of demo parts on the Check page.">{children}</span>;
}

/*
 * Every part of the site that looks more finished than it is, with a view on whether it can be built.
 * "can" = buildable from public data with no input from the applicant; "confirm" = buildable, but a
 * person has to confirm the result; "case" = depends on the individual project.
 */
export const DEMO_PARTS: { where: string; what: string; outlook: "can" | "confirm" | "case"; note: string }[] = [
  {
    where: "Check · Building plans upload",
    what: "Files you drop are listed and nothing else. Nothing is read from them and nothing leaves your browser.",
    outlook: "confirm",
    note: "Unit counts, lot area, parking and height can be read from a PDF plan set's zoning table and title block, but sheets differ by firm, so every value would need your confirmation. CAD files (DWG, DXF) aren't practical. Needs a server.",
  },
  {
    where: "Check · Municipality",
    what: "Only Cumberland has approval steps. The address lookup reads zoning for every town, but the steps and checklists shown are Cumberland's.",
    outlook: "can",
    note: "Zoning and utilities are already statewide through the Zoning Atlas. Steps, checklists and contacts have to be read from each town's regulations. See the statewide plan.",
  },
  {
    where: "Check · Wetlands, state road and transit",
    what: "These three site facts are ticked by hand. The address lookup fills in the district, parcel, lot area, water and sewer only.",
    outlook: "confirm",
    note: "State-road frontage (RIDOT road centrelines) and transit distance (RIPTA stops) can be looked up. Mapped wetlands can be flagged, but the edge that counts is the one RIDEM verifies on site.",
  },
  {
    where: "Check · Land disturbed",
    what: "Entered by hand. It decides whether a state stormwater permit is needed.",
    outlook: "case",
    note: "It comes from the grading plan, so only the applicant's engineer knows it.",
  },
  {
    where: "Schedule · Meeting and hearing dates",
    what: "Hearings fall a fixed number of days after filing. They are not the board's real meeting dates or submission cut-offs.",
    outlook: "can",
    note: "Each board publishes a yearly calendar. See the board calendar plan.",
  },
  {
    where: "Schedule · Durations without a statutory clock",
    what: "State permits, the building permit and construction use round estimates.",
    outlook: "case",
    note: "Real timelines from comparable projects would narrow them. See the real timelines plan.",
  },
  {
    where: "Hearing prep · Towns other than Cumberland",
    what: "The town picker lists where each town's hearings are recorded, but only Cumberland's records have been read into the questions.",
    outlook: "confirm",
    note: "Minutes can be read and tagged with a review step. Meeting videos need transcription first.",
  },
  {
    where: "Hearing prep · Example notes",
    what: "Sheet numbers, distances and plant names in the example notes are placeholders. \"With your numbers\" lines are estimates from the facts you entered.",
    outlook: "case",
    note: "The real figures come from your own plan set and traffic memo.",
  },
  {
    where: "Everywhere · Fees",
    what: "No fees are shown.",
    outlook: "can",
    note: "Cumberland's current fee schedule wasn't available when the rules were read.",
  },
];

const OUTLOOK = { can: "Can be built from public data", confirm: "Can be built, needs your confirmation", case: "Depends on the project" } as const;

export function DemoList() {
  return (
    <details className="demo-list">
      <summary><DemoTag /> <b>What on this site is a stand-in</b> <span className="muted small">· {DEMO_PARTS.length} parts, and whether each can be made real</span></summary>
      <ul>
        {DEMO_PARTS.map((d) => (
          <li key={d.where}>
            <b>{d.where}</b> <span className={`outlook o-${d.outlook}`}>{OUTLOOK[d.outlook]}</span>
            <p>{d.what}</p>
            <p className="muted">{d.note}</p>
          </li>
        ))}
      </ul>
    </details>
  );
}
