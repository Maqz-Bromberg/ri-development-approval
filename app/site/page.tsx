import type { Metadata } from "next";
import { SiteWorkspace } from "@/components/SiteWorkspace";

export const metadata: Metadata = { title: "Site selection" };

export default function SitePage() {
  return <SiteWorkspace />;
}
