import type { Metadata } from "next";
import { HearingStage } from "@/components/stages/HearingStage";

export const metadata: Metadata = { title: "Hearing" };

export default function Page() {
  return <HearingStage />;
}
