/**
 * Mission → catalogue config for progressive narrowing.
 * When narrowCatalog is true, categories are reordered by priority.
 */

export const MISSION_CATEGORY_PRIORITY: Record<string, string[]> = {
  travel_prep: ["template-store-tools", "template-store-garden", "template-store-paint-decor"],
  combo_mission: ["template-store-tools", "template-store-paint-decor", "template-store-garden"],
  recipe_mission: ["template-store-tools", "template-store-paint-decor", "template-store-garden"],
  urgent_replenishment: [],
  ready_to_pay: [],
  routine_shop: [],
  browsing: [],
  discovery: [],
};

export const MISSION_FOCUS_QUERY: Record<string, string> = {
  travel_prep: "weekend project kit",
  combo_mission: "fixings screws drill bits consumables",
  recipe_mission: "compatible tools fasteners accessories",
  urgent_replenishment: "essentials",
  ready_to_pay: "",
  routine_shop: "essentials",
  browsing: "",
  discovery: "new arrivals",
};
