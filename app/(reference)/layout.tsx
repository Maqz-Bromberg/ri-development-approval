import { Header } from "@/components/shell/Header";
import { FullDisclaimer, Strip } from "@/components/shell/Disclaimer";

/** Reference pages keep a normal scrolling page under the same header, without the rail and the tray (ARD D42). */
export default function ReferenceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell ref-page">
      <Header />
      <main className="wrap">{children}</main>
      <div className="wrap"><FullDisclaimer /></div>
      <Strip />
    </div>
  );
}
