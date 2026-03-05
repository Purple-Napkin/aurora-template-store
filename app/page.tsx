import { StoreContextBar } from "@/components/StoreContextBar";
import { HeroBanner } from "@/components/HeroBanner";
import { SpecialOffers } from "@/components/SpecialOffers";
import { CategoryNav } from "@/components/CategoryNav";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto">
      <StoreContextBar />

      {/* Holmes script injects personalized hero when data-holmes=home-hero exists */}
      <div data-holmes="home-hero">
        <HeroBanner />
      </div>

      <CategoryNav />

      {/* Holmes script injects personalized sections (Meals, Top up, Inspiration) when data-holmes=home-sections exists */}
      <div data-holmes="home-sections" className="px-4 sm:px-6 py-6" />

      <section className="py-12 px-4 sm:px-6">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          Special Offers
          <span className="text-aurora-muted text-base font-normal">Store-specific promotions</span>
        </h2>
        <SpecialOffers />
      </section>
    </div>
  );
}
