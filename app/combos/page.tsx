import Link from "next/link";
import { holmesRecentRecipes, holmesRecipeProducts } from "@aurora-studio/starter-core";
import { getDietaryFromCookie } from "@/lib/dietary-server";
import { RecipeProductCollage } from "@/components/RecipeProductCollage";
import { StoreContentRails } from "@/components/StoreContentRails";
import { Wrench, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Featured kits in the catalogue (API still uses "recipe" for this entity).
 * Day-to-day “what goes with my basket?” lives on the basket page — this index is editorial / curated bundles.
 */
export default async function CombosIndexPage() {
  const excludeDietary = await getDietaryFromCookie();
  const dietaryOpts = excludeDietary.length ? { excludeDietary } : undefined;

  /* Omit time_of_day: API filter was hiding rows when DB time_of_day ≠ client clock. */
  const { recipes } = await holmesRecentRecipes(48, undefined, dietaryOpts);

  const recipesWithProducts = await Promise.all(
    recipes.map(async (r) => {
      try {
        const { products } = await holmesRecipeProducts(r.slug, 4, dietaryOpts);
        const imageUrls = (products ?? [])
          .map((p) => (p as { image_url?: string }).image_url)
          .filter((u): u is string => !!u);
        return { ...r, productImageUrls: imageUrls };
      } catch {
        return { ...r, productImageUrls: [] as string[] };
      }
    })
  );

  return (
    <div className="min-h-screen bg-aurora-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-aurora-muted hover:text-aurora-text text-sm font-medium mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-md bg-aurora-surface border border-aurora-border">
            <Wrench className="w-5 h-5 text-aurora-primary" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-aurora-text font-sans leading-snug">
              Featured bundles & project kits
            </h1>
            <p className="text-aurora-muted text-sm mt-0.5 leading-snug">
              Curated multi-SKU kits. For real-time “goes with your basket” suggestions and deal bundles, add items to your
              basket — we surface those on the cart, not in the main nav.
            </p>
          </div>
        </div>

        <StoreContentRails
          contentPage="recipe_index"
          contentRegion="recipes_index_below_header"
          className="mb-6"
        />

        {recipesWithProducts.length === 0 ? (
          <div className="py-12 text-center rounded-md bg-aurora-surface border border-aurora-border">
            <p className="text-aurora-muted text-sm">No kits listed yet, or the list is still loading.</p>
            <Link
              href="/catalogue"
              className="mt-3 inline-block text-sm text-aurora-primary font-semibold hover:underline"
            >
              Browse catalogue →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {recipesWithProducts.map((r) => (
              <Link
                key={r.id}
                href={`/combos/${encodeURIComponent(r.slug)}`}
                className="group block p-3 rounded-md bg-aurora-surface border border-aurora-border hover:border-aurora-primary transition-colors"
              >
                <div className="aspect-square rounded-sm mb-2 overflow-hidden bg-aurora-bg border border-aurora-border/80">
                  <RecipeProductCollage
                    imageUrls={r.productImageUrls ?? []}
                    className="w-full h-full"
                  />
                </div>
                <h2 className="font-semibold text-sm truncate group-hover:text-aurora-primary transition-colors">
                  {r.title}
                </h2>
                {r.description && (
                  <p className="text-xs text-aurora-muted line-clamp-2 mt-0.5">
                    {r.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
