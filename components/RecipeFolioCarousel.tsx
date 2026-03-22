"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Carrot, Apple, Check } from "lucide-react";
import { useCart } from "@aurora-studio/starter-core";
import { holmesCombosForCart, holmesRecentRecipes, holmesRecipe, holmesRecipeProducts, getStoreConfig } from "@aurora-studio/starter-core";
import { useDietaryExclusions } from "@/components/DietaryExclusionsContext";
import { getMealToComplete } from "@/lib/cart-intelligence";
import { AddToCartButton } from "@aurora-studio/starter-core";
import { ProductImage } from "@aurora-studio/starter-core";
import { formatPrice, toCents } from "@aurora-studio/starter-core";
import type { SearchHit } from "@aurora-studio/starter-core";
import { RecipeInstructions } from "@/components/RecipeInstructions";
import { dedupeSearchHitsByRecordId, getPriceMajor } from "@/lib/catalogue-utils";

function hitPriceCents(hit: SearchHit): number | undefined {
  return toCents(getPriceMajor(hit as Record<string, unknown>));
}

type Combo = { slug: string; title: string; productImageUrls?: string[] };

/** Rank Holmes combo/recipe records by cart match (API still calls them recipes). */
function rankRecipesByCart(
  recipes: Array<{ slug: string; title: string; description: string | null }>,
  cartNames: string[],
  meal: string | null
): Array<{ slug: string; title: string }> {
  const cartWords = new Set(
    cartNames.flatMap((n) => n.toLowerCase().split(/\s+/)).filter((w) => w.length >= 2)
  );
  const mealLower = meal?.toLowerCase() ?? "";

  const score = (r: { slug: string; title: string; description: string | null }) => {
    let s = 0;
    const slugLower = r.slug.toLowerCase();
    const titleLower = (r.title ?? "").toLowerCase();
    const descLower = (r.description ?? "").toLowerCase();
    const combined = `${slugLower} ${titleLower} ${descLower}`;

    if (mealLower && (slugLower === mealLower || slugLower.includes(mealLower) || titleLower.includes(mealLower))) {
      s += 100;
    }
    for (const w of cartWords) {
      if (combined.includes(w)) s += 10;
    }
    return s;
  };

  return [...recipes]
    .sort((a, b) => score(b) - score(a))
    .map((r) => ({ slug: r.slug, title: r.title }));
}

type RecipeData = {
  title: string;
  description: string | null;
  ingredients: Array<{ name: string; quantity?: string; unit?: string }>;
  instructions: string | null;
  products: SearchHit[];
  catalogSlug: string | null;
};

export function RecipeFolioCarousel() {
  const { items, addItem } = useCart();
  const { excludeDietary } = useDietaryExclusions();
  const [combos, setCombos] = useState<Combo[]>([]);
  const [index, setIndex] = useState(0);
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const [animating, setAnimating] = useState(false);
  const [enterFrom, setEnterFrom] = useState<"right" | "left" | null>(null);
  const [currency, setCurrency] = useState("GBP");

  useEffect(() => {
    if (items.length === 0) {
      setCombos([]);
      setLoading(false);
      return;
    }
    const cartNames = items.map((i) => i.name).filter(Boolean);
    const cartIds = items.map((i) => i.recordId).filter(Boolean);
    let cancelled = false;

    const dietaryOpts = excludeDietary.length ? { excludeDietary } : undefined;
    const fetchCatalogueFallback = () => {
      holmesRecentRecipes(24, undefined, dietaryOpts)
        .then(({ recipes }) => {
          if (cancelled || !recipes?.length) return;
          const meal = getMealToComplete(cartNames)?.meal ?? null;
          const ranked = rankRecipesByCart(recipes, cartNames, meal);
          setCombos(ranked.map((r) => ({ slug: r.slug, title: r.title })));
        })
        .catch(() => {});
    };

    if (items.length < 2) {
      fetchCatalogueFallback();
      return () => { cancelled = true; };
    }

    holmesCombosForCart({
      cartIds,
      cartNames,
      limit: 12,
      sid:
        typeof window !== "undefined"
          ? (window as { holmes?: { getSessionId?: () => string } }).holmes?.getSessionId?.()
          : undefined,
    })
      .then((res) => {
        if (cancelled) return;
        if (res.combos?.length) {
          setCombos(res.combos);
          return;
        }
        fetchCatalogueFallback();
      })
      .catch(() => {
        if (!cancelled) fetchCatalogueFallback();
      });
    return () => { cancelled = true; };
  }, [items.length, items.map((i) => i.recordId).join(","), items.map((i) => i.name).join("|"), excludeDietary.join(",")]);

  const currentSlug = combos[index]?.slug;

  useEffect(() => {
    if (!currentSlug) {
      setRecipe(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    Promise.all([
      holmesRecipe(currentSlug),
      holmesRecipeProducts(currentSlug, 24, {
        excludeDietary: excludeDietary.length ? excludeDietary : undefined,
      }),
      getStoreConfig(),
    ])
      .then(([rec, prodRes, config]) => {
        if (cancelled) return;
        const slug = (config as { catalogTableSlug?: string })?.catalogTableSlug ?? null;
        setRecipe(
          rec
            ? {
                title: rec.title,
                description: rec.description,
                ingredients: rec.ingredients ?? [],
                instructions: rec.instructions,
                products: dedupeSearchHitsByRecordId((prodRes.products ?? []) as SearchHit[]),
                catalogSlug: slug,
              }
            : null
        );
        setCurrency((config as { currency?: string })?.currency ?? "GBP");
      })
      .catch(() => {
        if (!cancelled) setRecipe(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [currentSlug, excludeDietary]);

  const goNext = useCallback(() => {
    if (animating || combos.length <= 1) return;
    setDirection("next");
    setAnimating(true);
    setTimeout(() => {
      setIndex((i) => (i + 1) % combos.length);
      setEnterFrom("right");
      setDirection(null);
      setAnimating(false);
      setTimeout(() => setEnterFrom(null), 320);
    }, 300);
  }, [combos.length, animating]);

  const goPrev = useCallback(() => {
    if (animating || combos.length <= 1) return;
    setDirection("prev");
    setAnimating(true);
    setTimeout(() => {
      setIndex((i) => (i - 1 + combos.length) % combos.length);
      setEnterFrom("left");
      setDirection(null);
      setAnimating(false);
      setTimeout(() => setEnterFrom(null), 320);
    }, 300);
  }, [combos.length, animating]);

  const addAllToCart = () => {
    if (!recipe?.catalogSlug || !recipe.products.length) return;
    for (const hit of recipe.products) {
      const id = (hit.recordId ?? hit.id) as string;
      const name = hit.name ?? hit.title ?? String(id);
      const priceCents = hitPriceCents(hit);
      if (priceCents != null && priceCents > 0) {
        addItem({
          recordId: id,
          tableSlug: recipe.catalogSlug,
          name,
          unitAmount: priceCents,
          imageUrl: hit.image_url,
        });
      }
    }
  };

  const totalCents = recipe?.products.reduce((s, p) => s + (hitPriceCents(p) ?? 0), 0) ?? 0;

  const recipeProductIds = new Set(
    recipe?.products
      .filter((p) => {
        const c = hitPriceCents(p);
        return c != null && c > 0;
      })
      .map((p) => `${recipe!.catalogSlug}:${(p.recordId ?? p.id) as string}`) ?? []
  );
  const inCartProductIds = new Set(items.filter((i) => recipeProductIds.has(i.id)).map((i) => i.id));
  const totalAddable = recipeProductIds.size;
  const allAdded = totalAddable > 0 && inCartProductIds.size >= totalAddable;

  if (items.length < 2) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center">
        <p className="font-sans text-2xl text-aurora-muted mb-4">
          Add at least 2 items to your cart to see kit ideas.
        </p>
        <Link
          href="/catalogue"
          className="inline-block px-6 py-3 rounded-component bg-aurora-primary text-white font-medium"
        >
          Browse catalogue
        </Link>
      </div>
    );
  }

  if (combos.length === 0 && !loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center">
        <p className="font-sans text-2xl text-aurora-muted mb-4">
          No kit matches for your cart yet. Keep shopping!
        </p>
        <Link
          href="/catalogue"
          className="inline-block px-6 py-3 rounded-component bg-aurora-primary text-white font-medium"
        >
          Browse catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center isolate">
      {/* Prev button */}
      {combos.length > 1 && (
        <button
          type="button"
          onClick={goPrev}
          disabled={animating}
          className="absolute left-2 sm:left-4 top-[28%] -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-aurora-surface/95 backdrop-blur-sm shadow-lg border border-aurora-border flex items-center justify-center text-aurora-muted hover:text-aurora-primary hover:bg-aurora-surface disabled:opacity-50 transition-all"
          aria-label="Previous kit"
        >
          <Carrot className="w-6 h-6" />
        </button>
      )}

      {/* Project kit card */}
      <div
        className="relative w-full max-w-2xl mx-4 sm:mx-16"
        style={{ perspective: "1200px" }}
      >
        <div
          className={`relative folio-paper rounded-lg p-8 sm:p-12 min-h-[500px] transition-all duration-300 ease-out z-10 ${
            direction === "next"
              ? "opacity-0 -translate-x-8 scale-[0.98]"
              : direction === "prev"
                ? "opacity-0 translate-x-8 scale-[0.98]"
                : enterFrom === "right"
                  ? "animate-[page-enter-from-right_0.3s_ease-out_forwards]"
                  : enterFrom === "left"
                    ? "animate-[page-enter-from-left_0.3s_ease-out_forwards]"
                    : ""
          }`}
        >
          {loading ? (
            <div className="font-sans text-2xl text-aurora-muted py-20 text-center">
              Loading your kit…
            </div>
          ) : recipe ? (
            <div className="font-sans space-y-6 relative z-10">
              <h1 className="text-3xl sm:text-4xl font-semibold text-aurora-text">
                {recipe.title}
              </h1>
              {recipe.description && (
                <p className="text-xl text-aurora-muted">
                  {recipe.description}
                </p>
              )}
              {recipe.ingredients.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold text-aurora-text mb-2">
                    What&apos;s in the kit
                  </h2>
                  <ul className="text-xl text-aurora-text space-y-1">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i}>
                        {ing.quantity && `${ing.quantity} `}
                        {ing.unit && `${ing.unit} `}
                        {ing.name}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {recipe.instructions && (
                <section>
                  <h2 className="text-2xl font-semibold text-aurora-text mb-2">
                    How to use
                  </h2>
                  <RecipeInstructions text={recipe.instructions} className="text-xl" />
                </section>
              )}
              {recipe.products.length > 0 && recipe.catalogSlug && (
                <section>
                  <h2 className="text-2xl font-semibold text-aurora-text mb-3">
                    Products
                  </h2>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {recipe.products.slice(0, 6).map((hit) => {
                      const id = (hit.recordId ?? hit.id) as string;
                      const name = hit.name ?? hit.title ?? String(id);
                      const priceCents = hitPriceCents(hit);
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-aurora-surface/90 border border-aurora-border"
                        >
                          <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-aurora-surface-hover">
                            <ProductImage
                              src={hit.image_url}
                              className="w-full h-full"
                              thumbnail
                              fallback={<span className="text-aurora-muted text-sm">-</span>}
                            />
                          </div>
                          <span
                            className="text-lg truncate max-w-[120px] text-aurora-text"
                          >
                            {name}
                          </span>
                          {priceCents != null && (
                            <AddToCartButton
                              recordId={id}
                              tableSlug={recipe.catalogSlug!}
                              name={name}
                              unitAmount={priceCents}
                              imageUrl={hit.image_url}
                              className="text-sm px-2 py-1 shrink-0"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={addAllToCart}
                    disabled={allAdded}
                    className="px-6 py-3 rounded-lg bg-aurora-primary text-white font-semibold text-xl hover:bg-aurora-primary-dark transition-colors disabled:opacity-90 disabled:cursor-default inline-flex items-center gap-2"
                  >
                    {allAdded ? (
                      <>
                        <Check className="w-5 h-5 shrink-0" aria-hidden />
                        All added
                      </>
                    ) : (
                      <>
                        Add all to cart
                        {totalCents > 0 && ` – ${formatPrice(totalCents, currency)}`}
                      </>
                    )}
                  </button>
                </section>
              )}
              {currentSlug && (
                <a
                  href={`/combos/${encodeURIComponent(currentSlug)}`}
                  className="inline-block mt-4 text-aurora-primary hover:underline font-semibold text-xl cursor-pointer"
                >
                  View full kit →
                </a>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Next button */}
      {combos.length > 1 && (
        <button
          type="button"
          onClick={goNext}
          disabled={animating}
          className="absolute right-2 sm:right-4 top-[28%] -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-aurora-surface/95 backdrop-blur-sm shadow-lg border border-aurora-border flex items-center justify-center text-aurora-muted hover:text-aurora-primary hover:bg-aurora-surface disabled:opacity-50 transition-all"
          aria-label="Next kit"
        >
          <Apple className="w-6 h-6" />
        </button>
      )}

      {/* Page indicator */}
      {combos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {combos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => !animating && setIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === index ? "bg-aurora-primary" : "bg-aurora-border hover:bg-aurora-muted"
              }`}
              aria-label={`Go to kit ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
