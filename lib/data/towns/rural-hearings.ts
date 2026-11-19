import type { Heard, Objection } from "../../types";

/*
 * Concerns raised at the small towns' comprehensive permit hearings (ARD D66), from the Planning Boards' minutes,
 * read 2026-11-19: Hopkinton (Brushy Brook, 2023), West Greenwich (Lace Mill, Raccoon Hill Townhomes, The VUE, Bella
 * View Estates), Richmond (Switch Road) and Exeter (Gardner Ridge). Residents are described by role, never by name,
 * though the minutes name them. `q` is a sentence from the first source, word for word, checked by verify_quotes.py.
 * West Greenwich's minutes list who spoke, by name and street, but seldom what each said: its hearings are taken down by
 * a stenographer and the transcripts are not posted. So what residents said there is read from the Board's discussion
 * and conditions, and the entry says so. Keep `src` before `q` on the same line.
 */
const H = (locality: string, date: string, body: string, project: string, rest: Omit<Heard, "locality" | "date" | "body" | "project">): Heard => ({ locality, date, body, project, ...rest });
const BB = "Brushy Brook, 140 homes (comprehensive permit), RFR-80";
const HOP = "Planning Board (preliminary plan hearing)";
const HOP_OUT = "Preliminary approved 3–2 in August 2023";

export const RURAL_HEARD: Record<string, Heard[]> = {
  wells: [
    H("hopkinton", "2023-01-04", HOP, BB, {
      who: "Board members and abutters", said: "Asked whether the project's wells would draw down abutters' wells, and where the septic systems would go.",
      answer: "The applicant's water experts had located a second well and offered testing of nearby wells; abutters with a concern were asked to contact the applicant.", outcome: HOP_OUT,
      src: ["hopb230104"], q: "located a second well and further ensure through acquired data that they do not impact the abutter’s wells",
    }),
    H("hopkinton", "2023-07-24", HOP, BB, {
      who: "An abutter", said: "Asked the Board to weigh an irrigation well for the project's lawns against the quality and quantity of abutters' wells.",
      answer: "The peer experts reported no adverse impact on abutters' water, and the Department of Health does not want the public wells used for irrigation.", outcome: HOP_OUT,
      src: ["hopb230724"], q: "She wished the Board to consider carefully whether green lawns are as important as the abutters’ wells quality and quantity",
    }),
    H("west-greenwich", "2025-11-17", "Planning Board (master plan hearing)", "Raccoon Hill Townhomes, 52 affordable homes (comprehensive permit), RFR-2", {
      who: "Residents, as the applicant reported their concerns", said: "Worried the project's wells would take water from their own.",
      answer: "The applicant committed to no impact on neighbours' water. The master plan was conditioned on draw-down tests of abutting wells in the dry months and monitoring of the Blueberry Heights water system.", outcome: "Master plan approved 4–0",
      src: ["wgpb251117"], q: "She also discussed the residents’ concerns about well water",
    }),
    H("west-greenwich", "2026-03-31", "Planning Board (master plan decision)", "Bella View Estates, 292 homes (comprehensive permit), RFR-2", {
      who: "Residents of the Stubble Brook area, as the town's engineer relayed them", said: "Doubted there was water for 292 three-bedroom homes, about 758 residents, where wells already run short.",
      answer: "The Board's counsel advised that the applicant had not given competent evidence of water for the density bonus, and the Board denied the master plan.", outcome: "Master plan denied 5–0",
      src: ["wgpb260331"], q: "the residents have first-hand knowledge of the issues with lack of water in that area",
    }),
    H("richmond", "2026-03-10", "Planning Board (preliminary plan hearing)", "Switch Road, 8 new homes (comprehensive permit)", {
      who: "The Conservation Commission and Board members", said: "Asked what eight new septic systems and lawns would do to Sandy Pond, and where the wells would go.",
      answer: "Five years of water testing, four times a year from spring 2026, limits on fertilizer and pesticides, and a conservation easement.", outcome: "Preliminary approved",
      src: ["ripb260310"], q: "the applicant agreeing to five years of testing, with samples taken four times a year",
    }),
  ],
  traffic: [
    H("hopkinton", "2023-06-07", HOP, BB, {
      who: "A resident", said: "Traffic on the narrow town roads, especially from the construction vehicles and contractors the project would bring.",
      answer: "The Board discussed involving abutters in its review of the traffic study, and the town roads were to be examined.", outcome: HOP_OUT,
      src: ["hopb230607"], q: "He stated traffic was a significant concern especially in the future with the construction vehicles and contractors needed to build this Brushy Brook project.",
    }),
    H("hopkinton", "2023-07-24", HOP, BB, {
      who: "The Police Chief and the Public Works director, through the Board", said: "Other town roads beyond the three studied are narrow and winding, with no sidewalks, and the added population would need significant road work.",
      answer: "The decision required sidewalks at significant roadway locations, including the main entrance road.", outcome: HOP_OUT,
      src: ["hopb230724"], q: "the Police Chief indicated that Woody Hill Road, Fairview Avenue and Fenner Hill Road are all narrow and winding with no sidewalks",
    }),
    H("west-greenwich", "2025-05-19", "Planning Board (preliminary plan hearing)", "The VUE, 333 apartments (comprehensive permit), SMD", {
      who: "The Board and members of the audience", said: "Questioned the traffic study, the planned road from the Centre of New England to Hopkins Hill Road, and crosswalks.",
      answer: "The traffic study was sent for a peer review at the applicant's cost; crosswalk signs were promised.", outcome: "Preliminary approved 4–0",
      src: ["wgpb250519"], q: "Traffic study to have a peer review conducted",
    }),
  ],
  renters: [
    H("west-greenwich", "2025-10-20", "Planning Board (preliminary plan hearing)", "Lace Mill, 6 apartments (comprehensive permit), RFR-1", {
      who: "Some residents, before the hearing", said: "Took the affordable apartments to mean Section 8 housing.",
      answer: "The owner, who lives in the neighbourhood, said affordable housing is not the same as Section 8.", outcome: "Approved 3–0",
      src: ["wgpb251020"], q: "He made it known that Affordable Housing is not the same as Section 8, which had been a concern brought up by some residents prior to this meeting.",
    }),
  ],
  privacy: [
    H("west-greenwich", "2025-10-20", "Planning Board (preliminary plan hearing)", "Lace Mill, 6 apartments (comprehensive permit), RFR-1", {
      who: "Nineteen neighbours spoke and one wrote in opposition; the minutes record their names, not their words", said: "The Board's conditions answer what was raised: privacy for the abutters, traffic on Mishnock Road, trees and construction hours.",
      answer: "Privacy fencing on two lines with high and low planting, a traffic engineer to work with the town, no more tree cutting, and construction limited to weekdays and Saturday daytime.", outcome: "Approved 3–0",
      src: ["wgpb251020"], q: "to provide privacy to abutting neighbors",
    }),
    H("west-greenwich", "2025-11-17", "Planning Board (master plan hearing)", "Raccoon Hill Townhomes, 52 affordable homes (comprehensive permit), RFR-2", {
      who: "The Board's chairman and secretary", said: "Asked for screening of abutters' rear yards and of both sides of the entrance road.",
      answer: "Conditions: fencing on the access road with or instead of planting, and wider buffers where possible.", outcome: "Master plan approved 4–0",
      src: ["wgpb251117"], q: "Chairman O’Loughlin asked for screening of abutter rear yards.",
    }),
  ],
  stormwater: [
    H("hopkinton", "2023-07-12", HOP, BB, {
      who: "An abutter", said: "Feared stormwater running off the project onto his property.",
      answer: "The applicant offered to raise the berm, and described the spillway designed to keep overflow off abutters' land.", outcome: HOP_OUT,
      src: ["hopb230712"], q: "the applicant has offered to affect their (the applicant) raising the berm in height if the abutter wished",
    }),
    H("exeter", "2026-06-23", "Planning Board (preliminary plan hearing)", "Gardner Ridge, 20 homes (comprehensive permit), RU-3", {
      who: "The town planner", said: "Drainage on Gardner Road was a concern at the site.",
      answer: "The applicant pays $10,000 for the culvert and road on Gardner Road, the rest toward chip seal, under the Public Works director.", outcome: "Preliminary approved 5–0",
      src: ["expb260623"], q: "The Drainage infrastructure is a concern at the sight and is being addressed with the assistance of Exeter’s DPW Director",
    }),
  ],
  funding: [
    H("hopkinton", "2023-06-07", HOP, BB, {
      who: "A resident", said: "The cost to the town: its schools, roads and taxes over the long term.",
      outcome: HOP_OUT, src: ["hopb230607"], q: "He was concerned about the impact on the town, specifically on its schools, infrastructure and bottom line long term fiscally on the town tax payer.",
    }),
    H("hopkinton", "2023-07-24", HOP, BB, {
      who: "The town's finance director", said: "More children in the regional schools, at about $12,985 a pupil in 2022, could add some $3.5 million to the budget residents pay.",
      outcome: HOP_OUT, src: ["hopb230724"], q: "there would be an increase in enrollment of children into the school system",
    }),
  ],
  character: [
    H("hopkinton", "2023-08-24", "Planning Board (preliminary plan decision)", BB, {
      who: "A speaker at the hearing", said: "Residents' first reason for living in Hopkinton, and their biggest concern, is its rural character.",
      outcome: "Preliminary approved 3–2", src: ["hopb230824"], q: "the residents’ number one reason for living in Hopkinton was the rural character of the town and this was also their biggest concern",
    }),
  ],
};

/** Concerns first heard in the small towns. */
export const RURAL_OBJECTIONS: Objection[] = [
  {
    id: "wells", topic: "Water and environment",
    said: "Our wells will run dry.",
    weight: "material",
    boardView: "Where there is no public water, a comprehensive permit's density bonus depends on competent evidence that water is available (§ 45-53-4). West Greenwich denied Bella View Estates for want of it; Hopkinton and West Greenwich have conditioned approvals on draw-down tests of neighbours' wells.",
    response: "Bring a hydrogeologist's report before the hearing: pumping tests of your wells with neighbouring wells monitored, and the dry-season yield. Show every proposed well and septic system on the plan, and offer draw-down testing of abutters' wells as a condition.",
    say: "We pumped both wells for 72 hours last August with eight neighbouring wells monitored, and none dropped by more than a foot. We will test abutters' wells again in the dry months before construction and after, at our cost.",
    bring: [{ step: "master", doc: "Water, if there is no public water" }, { step: "prelim", doc: "Ordinance provisions to adjust" }],
    heard: [],
  },
];
