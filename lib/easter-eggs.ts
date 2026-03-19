/**
 * Easter eggs & delightful tips - little touches that show someone cared.
 */

/** Tips shown when clicking the floating veggie buddy */
export const VEGGIE_TIPS = [
  "Fresh herbs last longer wrapped in a damp paper towel in the fridge! 🌿",
  "Seasonal produce is often cheaper and tastier. Check what's in season!",
  "Store tomatoes at room temperature – the fridge makes them mealy.",
  "Bananas ripen faster next to other fruit. Keep them separate if you want them to last!",
  "Freeze leftover herbs in olive oil in ice cube trays – instant flavour bombs.",
  "The stem end of a strawberry tells you if it's sweet – the smaller the green leaves, the sweeter!",
  "Avocados ripen in a paper bag with a banana. Magic! 🥑",
  "Onions and potatoes shouldn't be stored together – they make each other sprout.",
  "Lemon juice on cut avocado keeps it from browning.",
  "Your loaf will stay fresher if you store it in a bread bin, not the fridge.",
  "Rub the cut end of a cucumber with salt to reduce bitterness.",
  "A spoon of sugar in the fridge absorbs odours. Who knew?",
  "Keep ginger in the freezer – it grates easily and lasts for months.",
  "Store mushrooms in a paper bag, not plastic. They'll stay fresh longer.",
  "Brown sugar gone hard? Add a slice of bread overnight – it'll soften right up.",
];

/** Cart-based save-money tips: match item name patterns, suggest switching */
export const BASKET_SAVER_TIPS: Array<{
  pattern: RegExp | ((name: string) => boolean);
  tip: string;
  searchHint?: string;
}> = [
  {
    pattern: /olive oil|extra virgin|evoo/i,
    tip: "Using olive oil for everyday cooking? Our standard range works just as well and often costs less!",
    searchHint: "olive oil",
  },
  {
    pattern: /premium|gourmet|artisan|finest/i,
    tip: "Love the quality but watching the budget? Try our everyday range – many shoppers say they can't tell the difference.",
    searchHint: undefined,
  },
  {
    pattern: /organic/i,
    tip: "Going organic where it matters most (like dairy and leafy greens) can save money while still eating well.",
  },
  {
    pattern: /branded|heinz|kellogg|nestlé/i,
    tip: "Our own-brand versions are often made in the same factories. Worth a look if you're trying to trim the bill!",
  },
  {
    pattern: /ready meal|prepared|pre-cooked/i,
    tip: "Batch cooking at home can save a bundle. Our fresh ingredients make it easy!",
    searchHint: "fresh ingredients",
  },
  {
    pattern: /single serve|individual|snack pack/i,
    tip: "Buying larger packs and portioning at home usually works out cheaper. Your future self will thank you!",
  },
  {
    pattern: /sparkling water|fizzy water|soda water/i,
    tip: "A soda stream or our large bottles work out much cheaper than single cans. Fizz for days!",
    searchHint: "sparkling water",
  },
  {
    pattern: /coffee.*pod|capsule|nespresso/i,
    tip: "Reusable pods or our ground coffee can cut your coffee spend in half. Still delicious!",
    searchHint: "ground coffee",
  },
];

/** Cute veggie emojis for the buddy – variety! */
export const VEGGIE_EMOJIS = ["🥕", "🥦", "🍅", "🥬", "🫑", "🌽"];

/** Get a random veggie emoji (stable per session) */
export function getVeggieEmoji(seed?: number): string {
  const idx = seed != null
    ? Math.floor(seed * VEGGIE_EMOJIS.length) % VEGGIE_EMOJIS.length
    : Math.floor(Math.random() * VEGGIE_EMOJIS.length);
  return VEGGIE_EMOJIS[idx];
}

/** Get a random tip for the veggie buddy (stable per session to avoid jarring changes) */
export function getRandomVeggieTip(seed?: number): string {
  const idx = seed != null
    ? Math.floor(seed * VEGGIE_TIPS.length) % VEGGIE_TIPS.length
    : Math.floor(Math.random() * VEGGIE_TIPS.length);
  return VEGGIE_TIPS[idx];
}

/** Find a basket saver tip that matches any cart item */
export function getBasketSaverTip(
  itemNames: string[]
): { tip: string; searchHint?: string } | null {
  const lower = itemNames.map((n) => n.toLowerCase());
  for (const { pattern, tip, searchHint } of BASKET_SAVER_TIPS) {
    const matches = lower.some((name) => {
      if (typeof pattern === "function") return pattern(name);
      return pattern.test(name);
    });
    if (matches) return { tip, searchHint };
  }
  return null;
}
