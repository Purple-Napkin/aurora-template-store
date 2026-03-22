"use client";

import Link from "next/link";
import {
  Search,
  RotateCcw,
  Sparkles,
  Wrench,
  PaintBucket,
  Trees,
  PiggyBank,
  Hammer,
  Sun,
} from "lucide-react";
import {
  SearchDropdown,
  mergeTemplateLogoMask,
  useStore,
  useAuth,
  useVerticalProfile,
  verticalMissionSubtitle,
} from "@aurora-studio/starter-core";
import { useDietaryExclusions } from "./DietaryExclusionsContext";
import { getRecipeSuggestion } from "@/lib/cart-intelligence";
import { useMissionAware } from "./MissionAwareHome";
import { RecipeMissionHero } from "./RecipeMissionHero";
import { getTimeOfDay } from "@aurora-studio/starter-core";
import { holmesMissionLockCombo } from "@aurora-studio/starter-core";
import { shouldLockRecipeMissionForMissionPill } from "@/lib/holmes-mission-lock";
import {
  fullWidthHeroBandClass,
  splitHeroFallbackTitleClass,
  splitHeroImageClampClass,
  splitHeroLogoWellLinkClass,
  splitHeroRowGapClass,
  splitHeroSectionPaddingClass,
  type HeroSize,
} from "@/lib/commandSurfaceHeroStyles";

const ICON_MAP: Record<string, typeof Wrench> = {
  "Tools & hardware": Wrench,
  "Paint & decor": PaintBucket,
  "Garden & outdoor": Trees,
  "Deals under £50": PiggyBank,
  "Today's project": Hammer,
  "Paint this weekend": PaintBucket,
  "Outdoor jobs": Trees,
  "Budget picks": PiggyBank,
  "Finish the job": Wrench,
  "Lighting & finish": Sun,
  "Travel essentials": Sparkles,
  "Explore more": Sparkles,
  "New arrivals": Sparkles,
  "Seasonal picks": Sparkles,
  "Healthy options": Sparkles,
  "Breakfast ideas": Sparkles,
  "Recipe ideas": Sparkles,
  "Kits & bundles": Sparkles,
  "Dinner now": Sparkles,
  "Dinner in 20 mins": Sparkles,
  "Repeat last shop": RotateCcw,
};

type LocalQuickAction = {
  label: string;
  href: string;
  icon: typeof Wrench;
  authOnly?: boolean;
};

function getDefaultQuickActions(timeOfDay: string): LocalQuickAction[] {
  const afternoon: LocalQuickAction[] = [
    { label: "Fix something", href: "/catalogue?q=tools", icon: Wrench },
    { label: "Paint a room", href: "/catalogue?q=paint", icon: PaintBucket },
    { label: "Build something", href: "/catalogue?q=timber", icon: Hammer },
    { label: "Garden & outdoor", href: "/catalogue?q=garden", icon: Trees },
  ];
  if (timeOfDay === "morning") {
    return [
      { label: "Stock up", href: "/catalogue?q=screws", icon: Wrench },
      { label: "Paint a room", href: "/catalogue?q=paint", icon: PaintBucket },
      { label: "Outdoor jobs", href: "/catalogue?q=garden", icon: Trees },
      { label: "Deals", href: "/catalogue", icon: PiggyBank },
    ];
  }
  if (timeOfDay === "evening") {
    return [
      { label: "Finish the job", href: "/catalogue?q=tools", icon: Wrench },
      { label: "Lighting & electrics", href: "/catalogue?q=lighting", icon: Sun },
      { label: "Garden & outdoor", href: "/catalogue?q=garden", icon: Trees },
      { label: "Deals", href: "/catalogue", icon: PiggyBank },
    ];
  }
  return afternoon;
}

function HeroImageLink({
  href,
  heroImageUrl,
  splitClampClass,
  fullBleed,
  heroSize,
}: {
  href: string;
  heroImageUrl: string | null;
  splitClampClass: string;
  fullBleed: boolean;
  heroSize: HeroSize;
}) {
  if (fullBleed) {
    return (
      <Link
        href={href}
        className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-b from-aurora-surface to-aurora-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aurora-primary/50"
        aria-label="Home"
      >
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt=""
            className={mergeTemplateLogoMask(
              heroImageUrl,
              "absolute inset-0 h-full w-full object-cover object-center"
            )}
          />
        ) : (
          <span className="font-display relative z-[1] text-2xl sm:text-4xl font-bold text-aurora-text px-4 text-center">
            {process.env.NEXT_PUBLIC_SITE_NAME ?? "Store"}
          </span>
        )}
      </Link>
    );
  }
  return (
    <Link href={href} className={splitHeroLogoWellLinkClass(heroSize)} aria-label="Home">
      {heroImageUrl ? (
        <img
          src={heroImageUrl}
          alt=""
          className={mergeTemplateLogoMask(
            heroImageUrl,
            `w-auto max-w-full h-auto object-contain mx-auto drop-shadow-sm ${splitClampClass}`
          )}
        />
      ) : (
        <span className={splitHeroFallbackTitleClass(heroSize)}>
          {process.env.NEXT_PUBLIC_SITE_NAME ?? "Store"}
        </span>
      )}
    </Link>
  );
}

export function CommandSurface({
  heroImageUrl = null,
  heroLayout = "split",
  heroSize = "default",
}: {
  heroImageUrl?: string | null;
  heroLayout?: "split" | "full_width";
  heroSize?: HeroSize;
}) {
  const { store } = useStore();
  const { user } = useAuth();
  const { excludeDietary } = useDietaryExclusions();
  const { dietaryFilteringEnabled, verticalProfile } = useVerticalProfile();
  const excludeForSearch = dietaryFilteringEnabled ? excludeDietary : [];
  const homeData = useMissionAware();
  const timeOfDay = getTimeOfDay();

  const rawActions = homeData?.quickActions?.length
    ? homeData.quickActions.map((a) => ({
        label: a.label,
        href: a.href,
        icon: ICON_MAP[a.label] ?? Sparkles,
        authOnly: a.href === "/account/orders",
      }))
    : getDefaultQuickActions(timeOfDay);

  const quickActions = rawActions.filter((a) => !a.authOnly || user);

  const isRecipeMission =
    homeData?.mode === "recipe_mission" && homeData.recipeSlug && homeData.recipeTitle;

  const formContent = (
    <div className="relative z-10 w-full max-w-xl">
      {isRecipeMission && (
        <div className="mb-6">
          <RecipeMissionHero
            recipeTitle={homeData.recipeTitle!}
            recipeSlug={homeData.recipeSlug!}
            compact
          />
        </div>
      )}
      <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-aurora-text mb-2 leading-tight">
        {isRecipeMission ? "Something else?" : "What do you need?"}
      </h1>
      <p className="text-aurora-muted text-sm sm:text-base mb-5 font-medium leading-snug">
        {isRecipeMission ? "Pick another category or search" : verticalMissionSubtitle(verticalProfile)}
      </p>

      <div className="relative z-20 mb-5">
        <p className="text-xs font-semibold text-aurora-muted uppercase tracking-wide mb-2">Quick tasks</p>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const href =
              action.label === "Recipe ideas" || action.label === "Kits & bundles"
                ? "/combos"
                : action.href;
            return (
              <Link
                key={action.label}
                href={href}
                onClick={() => {
                  if (shouldLockRecipeMissionForMissionPill(action.label, href)) holmesMissionLockCombo();
                }}
                className="inline-flex min-h-[2.5rem] items-center gap-2 px-4 py-2.5 rounded-md bg-aurora-surface border border-aurora-border hover:border-aurora-primary transition-colors text-sm font-semibold text-aurora-text"
              >
                <Icon className="h-4 w-4 shrink-0 text-aurora-primary" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-xs font-semibold text-aurora-muted uppercase tracking-widest mb-2">
          Search the store
        </p>
        {store ? (
          <div
            className="rounded-xl border border-aurora-border bg-aurora-surface shadow-sm focus-within:border-aurora-primary/60 focus-within:ring-1 focus-within:ring-aurora-primary/25 transition-all max-w-md overflow-hidden"
            data-command-search
          >
            <SearchDropdown
              placeholder="drill, paint, garden hose…"
              vendorId={store.id}
              fullWidth
              variant="embedded"
              excludeDietary={excludeForSearch}
              getRecipeSuggestion={getRecipeSuggestion}
            />
          </div>
        ) : (
          <Link
            href="/location"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-aurora-border bg-aurora-surface/80 text-aurora-muted hover:text-aurora-text hover:border-aurora-primary/40 transition-all text-sm"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>Set location to search</span>
          </Link>
        )}
      </div>
    </div>
  );

  const splitClamp = splitHeroImageClampClass(heroSize);
  const displayUrl = heroImageUrl?.trim() || null;

  if (heroLayout === "full_width") {
    return (
      <section className="command-surface-hero bg-gradient-to-b from-aurora-surface to-aurora-bg">
        <div
          className={`relative w-full overflow-hidden bg-aurora-surface/80 border-b border-aurora-border ${fullWidthHeroBandClass(heroSize)}`}
        >
          <HeroImageLink
            href="/"
            heroImageUrl={displayUrl}
            splitClampClass={splitClamp}
            fullBleed
            heroSize={heroSize}
          />
        </div>
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12 lg:py-16 flex justify-center lg:justify-start">
          {formContent}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`command-surface-hero px-4 sm:px-6 bg-gradient-to-b from-aurora-surface to-aurora-bg ${splitHeroSectionPaddingClass(heroSize)}`}
    >
      <div
        className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center lg:items-start ${splitHeroRowGapClass(heroSize)}`}
      >
        <div className="min-w-0 order-2 lg:order-1 flex justify-center lg:justify-start items-start w-full lg:min-w-[280px] justify-self-center lg:justify-self-start">
          <HeroImageLink
            href="/"
            heroImageUrl={displayUrl}
            splitClampClass={splitClamp}
            fullBleed={false}
            heroSize={heroSize}
          />
        </div>

        <div className="min-w-0 order-1 lg:order-2 flex justify-center lg:justify-end w-full lg:min-w-[320px] justify-self-center lg:justify-self-end">
          {formContent}
        </div>
      </div>
    </section>
  );
}
