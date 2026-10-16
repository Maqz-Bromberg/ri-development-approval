import type { Metadata } from "next";
import { ProjectWorkspace } from "@/components/ProjectWorkspace";

export const metadata: Metadata = { title: "Your project" };

export default function ProjectPage() {
  return <ProjectWorkspace />;
}
