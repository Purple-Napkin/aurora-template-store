import { StoreContextBar } from "@/components/StoreContextBar";
import { HeroBanner } from "@/components/HeroBanner";
import { HolmesContextualWell } from "@/components/HolmesContextualWell";
import { SpecialOffers } from "@/components/SpecialOffers";
import { CategoryCards } from "@/components/CategoryCards";
import { CategoryNav } from "@/components/CategoryNav";
import { HolmesHomeRefresher } from "@/components/HolmesHomeRefresher";
import { HomeSections } from "@/components/HomeSections";
import { RecentRecipes } from "@/components/RecentRecipes";
import { getTimeOfDay } from "@/lib/utils";
import {
  MissionAwareHomeProvider,
  MissionAwareHero,
  MissionAwareSections,
} from "@/components/MissionAwareHome";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const timeOfDay = getTimeOfDay();
  return (
    <>
      <HolmesHomeRefresher />
      <MissionAwareHomeProvider>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <StoreContextBar />
        </div>

        {/* Hero breaks out to full viewport width - no dark side bars */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <MissionAwareHero>
            <HeroBanner />
          </MissionAwareHero>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <HolmesContextualWell />
          <CategoryNav />

          {/* Category suggestions - Holmes-ordered when session available */}
          <section className="py-6">
            <h2 className="text-xl font-bold mb-4">Suggestions for {timeOfDay}</h2>
            <CategoryCards />
          </section>

          <RecentRecipes />

          {/* Mission-aware: RecipeIngredientsSection when Holmes infers recipe, else HomeSections */}
          <MissionAwareSections>
            <HomeSections />
          </MissionAwareSections>

      <section className="py-12">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          Special Offers
          <span className="text-aurora-muted text-base font-normal">Store-specific offers</span>
        </h2>
        <SpecialOffers />
      </section>
      </div>
      </MissionAwareHomeProvider>
    </>
  );
}
