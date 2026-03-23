import type { ActiveMission } from "@/components/MissionAwareHome";

const PROJECT_MISSION_KEYS = new Set(["recipe_mission", "combo_mission"]);

export type StoreMissionHeroSkin = {
  /** Extra classes on the hero `<section>` (gradients, borders). */
  sectionClass: string;
  /** When set, replaces the default home headline (not used during compact recipe-mission form header). */
  headline: string | null;
  subline: string | null;
};

export type StoreMissionCatalogueSkin = {
  wrapperClass: string;
  kicker: string;
  title: string;
  body: string;
};

/**
 * Template-only visuals and copy for the hardware / DIY demo.
 * Generic store behaviour stays in Aurora home-personalization; this layer adds the narrative.
 */
export function getStoreMissionHeroSkin(
  activeMission: ActiveMission | undefined,
  recipeMissionMode: boolean
): StoreMissionHeroSkin {
  if (recipeMissionMode) {
    return {
      sectionClass:
        "from-amber-950/25 via-aurora-surface to-aurora-bg bg-gradient-to-b border-b border-amber-500/20",
      headline: null,
      subline: null,
    };
  }

  const key = activeMission?.key ?? "";
  const band = activeMission?.band ?? "low";

  if (PROJECT_MISSION_KEYS.has(key) && band === "high") {
    return {
      sectionClass:
        "from-slate-950 via-amber-950/35 to-aurora-bg bg-gradient-to-b border-b border-amber-500/30 shadow-[inset_0_1px_0_rgba(251,191,36,0.12)]",
      headline: "We think you’re mid-project",
      subline:
        "Search, catalogue order, and cart intelligence are biased toward the job implied by your basket—compatible fasteners, the right driver profile, consumables, and promotional bundles that usually go with what you already added.",
    };
  }

  if (PROJECT_MISSION_KEYS.has(key) && band === "medium") {
    return {
      sectionClass:
        "from-aurora-surface via-amber-950/20 to-aurora-bg bg-gradient-to-b border-b border-amber-500/18",
      headline: "Task-aware shopping",
      subline:
        "We’re narrowing categories and surfacing complementary SKUs and deal bundles matched to specs you’re likely to need (sizes, bit types, fixings) based on what’s in your basket.",
    };
  }

  if (key === "travel_prep" && band !== "low") {
    return {
      sectionClass:
        "from-sky-950/25 via-aurora-surface to-aurora-bg bg-gradient-to-b border-b border-sky-500/25",
      headline: "Trip prep mode",
      subline: "The catalogue skews toward compact, travel-ready, and packable lines.",
    };
  }

  return { sectionClass: "", headline: null, subline: null };
}

export function getStoreMissionCatalogueSkin(
  activeMission: ActiveMission | undefined,
  narrowCatalog: boolean,
  missionLabel: string
): StoreMissionCatalogueSkin | null {
  if (!activeMission || activeMission.band === "low") return null;

  const key = activeMission.key;

  if (PROJECT_MISSION_KEYS.has(key)) {
    const bodyNarrow =
      "Category order, the spotlight strip below, and basket bundles reflect the DIY task we inferred—so you see matching tools, fixings, and value bundles next to the heavy items already in your cart—not a generic aisle.";
    const bodyBroad =
      "We’re still biasing search relevance, injected rails, and sort hints toward this project—so complements, right-size fixings, and bundle deals surface before unrelated aisles.";
    return {
      wrapperClass:
        "mb-8 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/50 via-slate-900/90 to-slate-950 p-6 sm:p-8 text-white shadow-xl shadow-amber-950/25",
      kicker: narrowCatalog ? "Mission-scoped catalogue" : "Task-aware catalogue",
      title: narrowCatalog
        ? `Everything on this page is angled toward: ${missionLabel}`
        : `Browsing while we think you’re doing: ${missionLabel}`,
      body: narrowCatalog ? bodyNarrow : bodyBroad,
    };
  }

  if (!narrowCatalog) return null;

  if (key === "travel_prep") {
    return {
      wrapperClass:
        "mb-8 rounded-2xl border border-sky-500/35 bg-gradient-to-br from-sky-950/55 to-slate-900 p-6 sm:p-8 text-white shadow-lg shadow-sky-950/20",
      kicker: "Travel prep",
      title: `Picked for: ${missionLabel}`,
      body: "Filters and suggestions prioritize compact and travel-sized products.",
    };
  }

  if (key === "urgent_replenishment" || key === "ready_to_pay") {
    return {
      wrapperClass:
        "mb-8 rounded-2xl border border-emerald-500/35 bg-gradient-to-br from-emerald-950/45 to-slate-900 p-6 sm:p-8 text-white shadow-lg shadow-emerald-950/15",
      kicker: "Quick path",
      title: missionLabel,
      body: "We’re emphasizing essentials and items that complete what you already started.",
    };
  }

  return {
    wrapperClass:
      "mb-8 rounded-2xl border border-aurora-border bg-gradient-to-br from-aurora-surface to-aurora-bg p-6 sm:p-8",
    kicker: "Tailored browse",
    title: missionLabel,
    body:
      activeMission.summary ??
      "We’ve adjusted category priority and what we surface first on this catalogue view.",
  };
}
