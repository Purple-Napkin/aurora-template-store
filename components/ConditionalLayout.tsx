"use client";

import { usePathname } from "next/navigation";
import { Nav } from "./Nav";
import { IntentPresenceBar } from "./intent/IntentPresenceBar";
import { Footer } from "./Footer";
import { FooterTip } from "./FooterTip";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <Nav />
      <IntentPresenceBar />
      <main className="min-h-[calc(100vh-3.5rem)] flex flex-col">
        <div key={pathname} className="animate-page-enter">
          {children}
        </div>
        <FooterTip />
        <Footer />
      </main>
    </>
  );
}
