"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { holmesRecipe, holmesRecipeProducts } from "@aurora-studio/starter-core";
import { holmesRecipeView } from "@aurora-studio/starter-core";
import { HolmesTidbits } from "@aurora-studio/starter-core";
import { AddToCartButton } from "@aurora-studio/starter-core";
import { ProductImage } from "@aurora-studio/starter-core";
import { formatPrice, toCents } from "@aurora-studio/starter-core";
import { useCart } from "@aurora-studio/starter-core";
import { useStore } from "@aurora-studio/starter-core";
import { useDietaryExclusions } from "@/components/DietaryExclusionsContext";
import { getStoreConfig } from "@aurora-studio/starter-core";
import type { SearchHit } from "@aurora-studio/starter-core";
import { getTimeOfDay } from "@aurora-studio/starter-core";
import { RecipeInstructions } from "@/components/RecipeInstructions";
import {
  dedupeSearchHitsByRecordId,
  getPriceMajor,
  getStockStatus,
} from "@/lib/catalogue-utils";
import { storeAtcButtonClassName, storeViewDetailsClassName } from "@/lib/store-product-card-styles";

function hitPriceCents(hit: SearchHit): number | undefined {
  return toCents(getPriceMajor(hit as Record<string, unknown>));
}

interface RecipePageViewProps {
  recipeSlug: string;
  recipeTitle: string;
  currency?: string;
  embeddedTitle?: boolean;
  /** Medium-confidence home rail: fewer SKUs, no long kit body. */
  compact?: boolean;
}

export function RecipePageView({
  recipeSlug,
  recipeTitle,
  currency = "GBP",
  embeddedTitle = false,
  compact = false,
}: RecipePageViewProps) {
  const { addItem } = useCart();
  const { store } = useStore();
  const { excludeDietary } = useDietaryExclusions();
  const [recipe, setRecipe] = useState<{
    title: string;
    description: string | null;
    ingredients: Array<{ name: string; quantity?: string; unit?: string }>;
    instructions: string | null;
    origin_tidbit: string | null;
  } | null>(null);
  const [products, setProducts] = useState<SearchHit[]>([]);
  const [catalogSlug, setCatalogSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const TitleTag = embeddedTitle || compact ? "h2" : "h1";
  const titleClass = compact
    ? "font-display text-xl sm:text-2xl font-bold mb-1"
    : "font-display text-2xl sm:text-3xl font-bold mb-2";

  useEffect(() => {
    holmesRecipeView(recipeSlug, recipe?.title ?? recipeTitle);
  }, [recipeSlug, recipe?.title, recipeTitle]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      holmesRecipe(recipeSlug),
      holmesRecipeProducts(recipeSlug, compact ? 8 : 24, {
        excludeDietary: excludeDietary.length ? excludeDietary : undefined,
      }),
      getStoreConfig(),
    ])
      .then(([rec, prodRes, config]) => {
        if (cancelled) return;
        if (rec) {
          setRecipe({
            title: rec.title,
            description: rec.description,
            ingredients: rec.ingredients ?? [],
            instructions: rec.instructions,
            origin_tidbit: rec.origin_tidbit,
          });
        }
        setProducts(dedupeSearchHitsByRecordId((prodRes.products ?? []) as SearchHit[]));
        const slug = (config as { catalogTableSlug?: string })?.catalogTableSlug ?? null;
        setCatalogSlug(slug);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load kit");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [recipeSlug, excludeDietary, compact]);

  const displayProducts = compact ? products.slice(0, 8) : products;
  const displayTitle = recipe?.title ?? recipeTitle;

  const addAllToCart = () => {
    if (!catalogSlug) return;
    for (const hit of displayProducts) {
      const id = (hit.recordId ?? hit.id) as string;
      const name = hit.name ?? hit.title ?? String(id);
      const priceCents = hitPriceCents(hit);
      if (priceCents != null && priceCents > 0) {
        addItem({
          recordId: id,
          tableSlug: catalogSlug,
          name,
          unitAmount: priceCents,
          imageUrl: hit.image_url,
        });
      }
    }
  };

  const totalCents = displayProducts.reduce((s, p) => s + (hitPriceCents(p) ?? 0), 0);

  if (loading) {
    return (
      <div
        className={`w-full flex flex-col items-center justify-center text-aurora-muted ${compact ? "py-8" : "py-16"}`}
      >
        <div className={`animate-pulse ${compact ? "text-base" : "text-lg"}`}>
          {compact ? "Loading kit picks…" : "Loading your kit…"}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-aurora-muted">
        <p className="mb-4">{error}</p>
        <Link
          href="/catalogue"
          className="px-4 py-2 rounded-lg bg-aurora-primary text-white font-medium hover:bg-aurora-primary-dark"
        >
          Browse catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className={`w-full ${compact ? "space-y-4" : "space-y-8"}`}>
      <header>
        {compact && (
          <p className="text-xs font-semibold text-aurora-muted uppercase tracking-widest mb-2">
            Complete this project
          </p>
        )}
        <TitleTag className={titleClass}>
          {compact
            ? displayTitle
            : getTimeOfDay() === "evening"
              ? `Finish tonight: ${displayTitle}`
              : `Your kit: ${displayTitle}`}
        </TitleTag>
        {!compact && recipe?.origin_tidbit && (
          <p className="text-aurora-muted text-sm sm:text-base max-w-2xl italic">
            {recipe.origin_tidbit}
          </p>
        )}
        {!compact && recipe?.description && (
          <p className="mt-3 text-aurora-text text-base">{recipe.description}</p>
        )}
        {!compact && (
          <div className="mt-4">
            <HolmesTidbits entity={recipeSlug} entityType="recipe" />
          </div>
        )}
      </header>

      {displayProducts.length > 0 && catalogSlug && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={addAllToCart}
            className={`rounded-lg bg-aurora-primary text-white font-semibold hover:bg-aurora-primary-dark transition-colors ${
              compact ? "px-3 py-2 text-sm" : "px-4 py-2 text-sm"
            }`}
          >
            {compact ? "Add kit picks" : "Add all to cart"}
            {totalCents > 0 && ` – ${formatPrice(totalCents, currency)}`}
          </button>
        </div>
      )}

      {!compact && recipe?.ingredients && recipe.ingredients.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold mb-3">What&apos;s in the kit</h2>
          <ul className="list-disc list-inside text-aurora-text space-y-1">
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

      {!compact && recipe?.instructions && (
        <section>
          <h2 className="font-display text-lg font-semibold mb-3">How to use</h2>
          <RecipeInstructions text={recipe.instructions} />
        </section>
      )}

      {displayProducts.length > 0 && (
        <section>
          <h2 className={`font-display font-semibold mb-4 ${compact ? "text-base" : "text-lg"}`}>
            {compact ? "Popular picks for this kit" : "Products in this kit"}
          </h2>
          <div
            className={
              compact
                ? "grid w-full grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4"
                : "grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5"
            }
          >
            {displayProducts.map((hit) => {
              const id = (hit.recordId ?? hit.id) as string;
              const name = hit.name ?? hit.title ?? String(id);
              const priceCents = hitPriceCents(hit);
              const imageUrl = hit.image_url ?? null;
              const stock = getStockStatus(hit as Record<string, unknown>);
              const canAdd = priceCents != null && priceCents > 0 && catalogSlug;
              return (
                <div key={id} className="store-product-card group min-w-0">
                  <Link
                    href={`/catalogue/${id}`}
                    className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-primary/25"
                  >
                    <div className="store-product-card__media">
                      <ProductImage
                        src={imageUrl}
                        className="absolute inset-0 h-full w-full"
                        objectFit="cover"
                        thumbnail
                        fallback={
                          <div className="flex h-full w-full items-center justify-center text-aurora-muted text-4xl">
                            -
                          </div>
                        }
                      />
                    </div>
                    <div className="store-product-card__body">
                      <p className="store-product-card__title transition-colors group-hover:text-aurora-primary">
                        {name}
                      </p>
                      <div className="store-product-card__price-row">
                        {priceCents != null && priceCents > 0 ? (
                          <p className="text-sm font-bold tabular-nums text-aurora-primary">
                            {formatPrice(priceCents, currency)}
                          </p>
                        ) : (
                          <span className="text-sm text-aurora-muted">Price on request</span>
                        )}
                      </div>
                      {stock ? (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-aurora-muted">
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${stock.inStock ? "bg-emerald-500" : "bg-red-500"}`}
                            aria-hidden
                          />
                          {stock.label}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                  <div className="store-product-card__actions">
                    {canAdd ? (
                      <AddToCartButton
                        recordId={id}
                        tableSlug={catalogSlug!}
                        name={name}
                        unitAmount={priceCents!}
                        imageUrl={imageUrl}
                        className={storeAtcButtonClassName}
                      />
                    ) : (
                      <Link href={`/catalogue/${id}`} className={storeViewDetailsClassName}>
                        View details
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
