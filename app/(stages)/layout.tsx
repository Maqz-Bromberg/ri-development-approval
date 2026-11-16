import { StageShell } from "@/components/shell/StageShell";

/** The five stages and the landing, inside the app shell (ARD D42). The root layout holds the providers and the fonts. */
export default function StagesLayout({ children }: { children: React.ReactNode }) {
  return <StageShell>{children}</StageShell>;
}
