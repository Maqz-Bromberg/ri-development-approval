import type { Metadata } from "next";
import { RouteStage } from "@/components/stages/RouteStage";

export const metadata: Metadata = { title: "Route & people" };

export default function Page() {
  return <RouteStage />;
}
