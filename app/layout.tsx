import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito_Sans, IBM_Plex_Mono } from "next/font/google";
import { ProjectProvider } from "@/components/ProjectProvider";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const display = Fredoka({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display", display: "swap" });
const body = Nunito_Sans({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-data", display: "swap" });

export const metadata: Metadata = {
  title: { default: "RI Building Plan Approval", template: "%s · RI Building Plan Approval" },
  description: "Every approval step, authority, form and checklist for a Rhode Island building project, with each requirement traced to the law that sets it. Pilot: Cumberland.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F6F8F3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <ProjectProvider>
          <SiteHeader />
          <main className="wrap">{children}</main>
          <footer className="site-footer">
            <div className="wrap">
              <p>
                RI Building Plan Approval reads state and local rules as published (October 2026). It is not legal advice and does not
                replace a determination by the Town of Cumberland or a state agency. Town staff verify final versions.
              </p>
            </div>
          </footer>
        </ProjectProvider>
      </body>
    </html>
  );
}
