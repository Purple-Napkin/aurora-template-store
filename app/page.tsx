import { StoreContextBar } from "@/components/StoreContextBar";
import { HeroCommandSurface } from "@/components/HeroCommandSurface";
import { HolmesContextualWell } from "@/components/HolmesContextualWell";
import { MissionEntryPoints } from "@/components/MissionEntryPoints";
import { ShoppingListTemplates } from "@/components/ShoppingListTemplates";
import { HolmesHomeRefresher } from "@/components/HolmesHomeRefresher";
import { HomeSections } from "@/components/HomeSections";
import { SmartCartPanel } from "@/components/SmartCartPanel";
import { LiveSignalsRow } from "@/components/LiveSignalsRow";
import {
  MissionAwareHomeProvider,
  MissionAwareHero,
  MissionAwareSections,
} from "@/components/MissionAwareHome";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <HolmesHomeRefresher />
      <MissionAwareHomeProvider>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <StoreContextBar />
        </div>

        {/* Hero + command surface - actionable intent capture with real retail warmth */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <MissionAwareHero>
            <HeroCommandSurface />
          </MissionAwareHero>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <HolmesContextualWell />

          {/* Mission-based entry points - Holmes-influenced when inference exists */}
          <MissionEntryPoints />

          {/* Shopping list templates - e.g. Travel essentials when travel prep detected */}
          <ShoppingListTemplates />

          {/* Live adapting signals - perceived intelligence */}
          <LiveSignalsRow />

          {/* Single adaptive feed - Holmes data via event, trust signals, merged sections */}
          <MissionAwareSections>
            <HomeSections />
          </MissionAwareSections>

          {/* Smart cart panel - bridges browsing to conversion */}
          <SmartCartPanel />
        </div>
      </MissionAwareHomeProvider>
    </>
  );
}
