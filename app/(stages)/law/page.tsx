import type { Metadata } from "next";
import { LawStage } from "@/components/stages/LawStage";

export const metadata: Metadata = { title: "Zoning & law" };

export default function Page() {
  return <LawStage />;
}
