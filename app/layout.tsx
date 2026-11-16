import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Bitter, IBM_Plex_Mono, Nunito_Sans } from "next/font/google";
import { IconSprite } from "@/components/Icon";
import { ProjectProvider } from "@/components/ProjectProvider";
import { TrialProvider } from "@/components/Trial";
import "./globals.css";
import "./shell.css";
import "./stages.css";

// Bitter for headings and Atkinson Hyperlegible for text, on trial against Nunito Sans for both (ARD D42, trial k).
const heading = Bitter({ subsets: ["latin"], variable: "--font-heading", display: "swap" });
const text = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-text", display: "swap" });
const nunito = Nunito_Sans({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-data", display: "swap" });

export const metadata: Metadata = {
  title: { default: "RI Building Plan Approval", template: "%s · RI Building Plan Approval" },
  description: "Every approval step, authority, form and checklist for a Rhode Island building project, with each requirement traced to the law that sets it. Zoning and state-law routes for all 39 towns; Cumberland read in full, Providence on trial.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F2F4F6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${text.variable} ${nunito.variable} ${mono.variable}`} data-type="bitter">
      <body>
        <TrialProvider>
          <ProjectProvider>
            <IconSprite />
            {children}
          </ProjectProvider>
        </TrialProvider>
      </body>
    </html>
  );
}
