import type { Metadata } from "next";
import { StepsWorkspace } from "@/components/StepsWorkspace";

export const metadata: Metadata = { title: "Approval steps" };

export default function StepsPage() {
  return <StepsWorkspace />;
}
