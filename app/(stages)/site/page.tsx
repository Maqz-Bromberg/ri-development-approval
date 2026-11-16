import type { Metadata } from "next";
import { SiteStage } from "@/components/stages/SiteStage";

export const metadata: Metadata = { title: "Site" };

export default function Page() {
  return <SiteStage />;
}
