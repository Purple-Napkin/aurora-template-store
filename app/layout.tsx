import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { AddToCartFlyProvider } from "@/components/AddToCartFly";
import { ConditionalHolmesScript } from "@/components/ConditionalHolmesScript";
import { StoreProvider } from "@/components/StoreContext";
import { StoreConfigProvider } from "@/components/StoreConfigContext";
import { AuthProvider } from "@/components/AuthProvider";
import { ConditionalLayout } from "@/components/ConditionalLayout";
import { DietaryExclusionsProvider } from "@/components/DietaryExclusionsContext";
import { MissionAwareHomeProvider } from "@/components/MissionAwareHome";
import { AffinityToast } from "@/components/AffinityToast";
import { HolmesDevTools } from "@/components/HolmesDevTools";
import { VeggieBuddy } from "@/components/VeggieBuddy";

const siteName =
  process.env.NEXT_PUBLIC_SITE_NAME ?? "Hippo Ecom";

export const metadata: Metadata = {
  title: siteName,
  description: "Storefront powered by Aurora Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = process.env.NEXT_PUBLIC_THEME === "dark" ? "dark" : "light";
  return (
    <html lang="en" data-theme={theme}>
      <body
        className="min-h-screen bg-aurora-bg pb-12"
        style={
          {
            "--aurora-accent":
              process.env.NEXT_PUBLIC_ACCENT_COLOR ?? "#15803D",
            color: "var(--aurora-text)",
          } as React.CSSProperties
        }
      >
        <StoreProvider>
          <DietaryExclusionsProvider>
          <StoreConfigProvider>
          <AuthProvider>
        <CartProvider>
          <AddToCartFlyProvider>
            <MissionAwareHomeProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
            </MissionAwareHomeProvider>
            <AffinityToast />
            <VeggieBuddy />
            <HolmesDevTools />
          </AddToCartFlyProvider>
        </CartProvider>
          </AuthProvider>
          </StoreConfigProvider>
          </DietaryExclusionsProvider>
        </StoreProvider>
        <ConditionalHolmesScript />
      </body>
    </html>
  );
}
