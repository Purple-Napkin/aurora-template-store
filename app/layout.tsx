import type { Metadata } from "next";
import Script from "next/script";
import { getHolmesScriptUrl } from "@aurora-studio/sdk";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { StoreProvider } from "@/components/StoreContext";
import { AuthProvider } from "@/components/AuthProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const siteName =
  process.env.NEXT_PUBLIC_SITE_NAME ?? "Store";

export const metadata: Metadata = {
  title: siteName,
  description: "Storefront powered by Aurora Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="min-h-screen bg-aurora-bg text-white"
        style={
          {
            "--aurora-accent":
              process.env.NEXT_PUBLIC_ACCENT_COLOR ?? "#38bdf8",
          } as React.CSSProperties
        }
      >
        <StoreProvider>
          <AuthProvider>
            <CartProvider>
              <Nav />
            <main className="min-h-[calc(100vh-3.5rem)] flex flex-col">
              {children}
              <Footer />
            </main>
            </CartProvider>
          </AuthProvider>
        </StoreProvider>
        {process.env.NEXT_PUBLIC_AURORA_API_URL && process.env.NEXT_PUBLIC_TENANT_SLUG && (
          <Script
            src={getHolmesScriptUrl(
              process.env.NEXT_PUBLIC_AURORA_API_URL,
              process.env.NEXT_PUBLIC_TENANT_SLUG
            )}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
