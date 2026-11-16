import type { Metadata } from "next";
import { CalendarStage } from "@/components/stages/CalendarStage";

export const metadata: Metadata = { title: "Calendar" };

export default function Page() {
  return <CalendarStage />;
}
