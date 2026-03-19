"use client";

import { RecipePageView } from "./RecipePageView";

interface RecipeIngredientsSectionProps {
  recipeSlug: string;
  recipeTitle: string;
  currency?: string;
}

/**
 * Home-page section showing recipe ingredients and products when Holmes infers a recipe mission.
 */
export function RecipeIngredientsSection({
  recipeSlug,
  recipeTitle,
  currency = "GBP",
}: RecipeIngredientsSectionProps) {
  return (
    <section className="py-8" data-holmes="recipe-mission-section">
      <RecipePageView
        recipeSlug={recipeSlug}
        recipeTitle={recipeTitle}
        currency={currency}
      />
    </section>
  );
}
