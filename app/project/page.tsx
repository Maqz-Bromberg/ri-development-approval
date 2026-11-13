import type { Metadata } from "next";
import { ProjectWorkspace } from "@/components/ProjectWorkspace";

export const metadata: Metadata = { title: "Check your project" };

export default function ProjectPage() {
  return <ProjectWorkspace />;
}
