import type { Kind } from "../types";
import type { IconName } from "../iconSprite";

/**
 * The five kinds of body that hold a decision, with the mode each decides in and one line on what that means.
 * Written per kind, not per town: a town's own reading of a body stays in its contacts and steps (ARD D42).
 */
export interface KindInfo {
  label: string;
  mode: string;
  icon: IconName;
  desc: string;
}

export const KINDS: Record<Kind, KindInfo> = {
  elected: { label: "Elected", mode: "Legislative", icon: "elected", desc: "Votes on policy, such as a zone change. Political and discretionary: there is no right to approval and no statutory deadline." },
  appointed: { label: "Appointed board", mode: "Quasi-judicial", icon: "appointed", desc: "Decides on findings in the record, at a noticed meeting, within statutory deadlines. Missing a deadline can count as approval." },
  staff: { label: "Town staff", mode: "Administrative", icon: "staff", desc: "Certifies completeness, which starts the board's clock, and advises. Staff can decide some plans without a hearing." },
  state: { label: "State / court", mode: "Permitting", icon: "state", desc: "Technical permits, each on its agency's own timeline." },
  utility: { label: "Utility", mode: "Service letter", icon: "utility", desc: "Confirms capacity in writing. A verbal answer does not count." },
};

export const KIND_ORDER: Kind[] = ["elected", "appointed", "staff", "state", "utility"];
