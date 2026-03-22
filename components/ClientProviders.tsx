"use client";

import type { ReactNode } from "react";
import {
  AuthProvider,
  AddToCartFlyProvider,
  CartProvider,
  StoreConfigProvider,
  StoreProvider,
} from "@aurora-studio/starter-core";
import { AffinityToast } from "@/components/AffinityToast";
import { ConditionalLayout } from "@/components/ConditionalLayout";
import { DietaryExclusionsProvider } from "@/components/DietaryExclusionsContext";
import { HolmesDevTools } from "@/components/HolmesDevTools";
import { MissionAwareHomeProvider } from "@/components/MissionAwareHome";
import { VeggieBuddy } from "@/components/VeggieBuddy";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <DietaryExclusionsProvider>
        <StoreConfigProvider
          profileDefaults={{
            verticalProfile: "general_retail",
            dietaryFilteringEnabled: false,
          }}
        >
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
  );
}
