import { e, n, type Flow } from "./types";

export const SOURCES_FLOW: Flow = {
  slug: "sources",
  title: "Sources and quotes",
  blurb: "How every claim is traced to a document, and how a script keeps the quotes honest.",
  intro:
    "Nothing the engine shows as a requirement is stored without the document it came from. A requirement carries a source id, a pinpoint (the section or page) and, where it was read, the exact sentence. " +
    "Scripts fetch the documents and check every stored sentence against them word for word. Where a rule has not been read, the engine says so, and names what would answer it.",
  shows: [{ href: "/verification", label: "How records are checked" }, { href: "/docs", label: "Documentation" }],
  nodes: [
    n("claim", "data", "A requirement, a finding or an event", 2.2, 0, "A document in a step's checklist, a finding of the law check, a contact's details, or a dated event on a timeline. Each is data in the repository, written with its source.", { where: ["lib/types.ts#Doc", "lib/types.ts#Finding", "lib/types.ts#TimelineEvent"] }),
    n("src", "data", "src: the document's id", 0.2, 1.3, "An id into the table of every cited document: its label and its address. A statute, an ordinance, a regulation, an agenda, minutes, a recording, a court decision, a news story.", { where: ["lib/data/sources.ts#SOURCES"], note: "Each entry must stay on one line, as id: { label, url }. The scripts read the file as text (debt 11)." }),
    n("pin", "data", "pin: the section or page", 2.2, 1.3, "Where in the document: \"§ 45-23-32(19)(i)(C)\", \"Art. 3, lot area per unit\", \"Minutes, Item 6\".", {}),
    n("q", "data", "q: the exact sentence", 4.2, 1.3, "Copied word for word from the document. A decision on a timeline must have one.", { note: "Principle 6: nothing is stored without the document it came from, and a script matches every quote it can." }),

    n("cite", "step", "Shown together", 2.2, 2.7, "The quote and a link to the document at the pinpoint appear beside the claim, so nothing is shown apart from what it rests on.", { where: ["components/Cite.tsx"], note: "Principle 2." }),

    n("fetch", "step", "Scripts fetch the documents", 0.2, 4.1, "fetch_sources.py downloads what a script can reach, fetch_ecode.py the eCode360 ordinances, fetch_captions.py machine transcripts of meeting recordings. A person saves any that refuse scripts by hand, under any name, and the organizer files it.", { where: ["scripts/towns/fetch_sources.py", "scripts/towns/fetch_ecode.py", "scripts/towns/fetch_captions.py", "scripts/towns/organize_sources.py"], note: "ARD D9, D12. The copies live in .sources/ outside the repository." }),
    n("ver", "step", "verify_quotes.py and verify.py", 2.2, 4.1, "Every q in the town data files is found in the text of the document its src names, ignoring line breaks, spacing and curly quotes. Timeline events get the same check, plus: every date is real, every source exists, a decision has a quote, and parties are business or professional roles only.", { where: ["scripts/towns/verify_quotes.py", "scripts/timelines/verify.py"] }),
    n("found", "decision", "Is the sentence in the document?", 2.2, 5.4, "Whitespace-normalised, case-insensitive.", { where: ["scripts/towns/verify_quotes.py"] }),
    n("bad", "gap", "The check fails and names the line", 0.2, 6.7, "An invented, altered or misremembered quote stops the check. It proves the sentence exists in that document, not that it means what the finding says.", { note: "A person reviews the change: automation reports, it does not edit (principle 8)." }),
    n("ok", "output", "The quote stands", 4.2, 6.7, "Shown as a checked quote. A scan with no text layer, or a machine transcript, is marked as such and never passed silently.", { to: { href: "/engine/records", label: "How evidence classes are computed" } }),

    n("unread", "gap", "Not read: a named gap", 4.6, 0, "Where a rule has not been read (a town's use table for a commercial use, an overlay's article, the density without utilities), the finding carries gap: what would answer it, and the town's official ordinance link beside it.", { where: ["lib/types.ts#Finding", "lib/data/towns.ts"], note: "Principle 10, ARD D31, D35: the project is partly a map of where public information runs out." }),
  ],
  edges: [
    e("claim", "src"), e("claim", "pin"), e("claim", "q"),
    e("src", "cite"), e("pin", "cite"), e("q", "cite"),
    e("src", "fetch", undefined, { dashed: true, out: "bottom", in: "top" }),
    e("q", "ver", "is checked", { dashed: true, out: "bottom", in: "right" }),
    e("fetch", "ver", "text"),
    e("ver", "found"),
    e("found", "bad", "no"), e("found", "ok", "yes"),
    e("claim", "unread", "no document read", { dashed: true }),
  ],
};
