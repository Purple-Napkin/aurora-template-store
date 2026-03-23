"use client";

import { RecipePageView } from "./RecipePageView";

interface RecipeIngredientsSectionProps {
  recipeSlug: string;
  recipeTitle: string;
  currency?: string;
  /** Medium-confidence home: slimmer rail below main merchandising. */
  compact?: boolean;
}

/**
 * Home combo / kit section when Holmes has `comboViewed` or `recipeViewed` (mode recipe_mission).
 */
export function RecipeIngredientsSection({
  recipeSlug,
  recipeTitle,
  currency = "GBP",
  compact = false,
}: RecipeIngredientsSectionProps) {
  return (
    <section
      className={compact ? "py-6" : "py-8"}
      data-holmes={compact ? "combo-mission-rail-compact" : "combo-mission-section"}
    >
      <RecipePageView
        recipeSlug={recipeSlug}
        recipeTitle={recipeTitle}
        currency={currency}
        compact={compact}
        embeddedTitle={compact}
      />
    </section>
  );
}
