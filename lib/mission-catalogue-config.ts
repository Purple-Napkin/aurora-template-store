/**
 * Mission → catalogue config for progressive narrowing.
 * When narrowCatalog is true, categories are reordered by priority.
 */

export const MISSION_CATEGORY_PRIORITY: Record<string, string[]> = {
  travel_prep: ["snacks", "beverages", "dairy-products", "frozen-foods", "bakery-items"],
  recipe_mission: ["vegetables", "fruits", "dairy-products", "bakery-items", "frozen-foods", "snacks", "beverages"],
  urgent_replenishment: [],
  ready_to_pay: [],
  routine_shop: [],
  browsing: [],
  discovery: [],
};

export const MISSION_FOCUS_QUERY: Record<string, string> = {
  travel_prep: "travel essentials",
  recipe_mission: "fresh ingredients",
  urgent_replenishment: "essentials",
  ready_to_pay: "",
  routine_shop: "essentials",
  browsing: "",
  discovery: "new arrivals",
};
