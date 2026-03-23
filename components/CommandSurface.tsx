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
  Check,
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
import type { StoreFeaturedProject } from "@/lib/store-featured-project";

const POPULAR_LINKS = [
  { label: "Drill kits", href: "/catalogue?q=drill" },
  { label: "Screws & fixings", href: "/catalogue?q=screws" },
  { label: "Paint & stain", href: "/catalogue?q=paint" },
  { label: "Garden power", href: "/catalogue?q=garden" },
] as const;

function StoreFeaturedProjectCard({ project }: { project: StoreFeaturedProject }) {
  return (
    <div className="store-featured-project overflow-hidden rounded-xl border border-zinc-200/90 bg-[var(--aurora-surface)] shadow-[0_2px_14px_rgba(15,23,42,0.07)]">
      <Link
        href={`/combos/${encodeURIComponent(project.slug)}`}
        aria-label={`View kit: ${project.title}`}
        className="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-primary/30 focus-visible:ring-offset-2"
      >
        <div className="store-featured-project__media relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200">
              <Wrench className="h-14 w-14 text-zinc-400" aria-hidden />
            </div>
          )}
        </div>
        <div className="store-featured-project__body p-4 sm:p-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-aurora-muted">
            Featured project
          </p>
          <h3 className="mt-1.5 font-display text-lg font-bold leading-snug tracking-tight text-aurora-text transition-colors group-hover:text-aurora-primary sm:text-xl line-clamp-2">
            {project.title}
          </h3>
          {project.description ? (
            <p className="mt-2 text-sm leading-snug text-aurora-muted line-clamp-2">{project.description}</p>
          ) : null}
          <span className="store-featured-project__cta mt-4 flex h-11 w-full items-center justify-center rounded-lg text-sm font-bold">
            View kit
          </span>
        </div>
      </Link>
    </div>
  );
}

function HomeTrustList({ storeName }: { storeName: string | undefined }) {
  const loc = storeName?.trim() || "your branch";
  const items = [
    `In stock at ${loc}`,
    "Click & collect today",
    "Trade & bulk discounts on qualifying lines",
  ];
  return (
    <ul className="store-home-trust mt-6 space-y-2.5 border-t border-aurora-border/55 pt-6">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-2.5 text-sm leading-snug text-aurora-text">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} aria-hidden />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

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
  "Paint prep": PaintBucket,
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
  featuredProject = null,
}: {
  heroImageUrl?: string | null;
  heroLayout?: "split" | "full_width";
  heroSize?: HeroSize;
  featuredProject?: StoreFeaturedProject | null;
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

  const formContentInner = (
    <>
      {isRecipeMission && (
        <div className="mb-6">
          <RecipeMissionHero
            recipeTitle={homeData.recipeTitle!}
            recipeSlug={homeData.recipeSlug!}
            compact
          />
        </div>
      )}
      <h1
        className={`font-sans font-bold tracking-tight text-aurora-text mb-2 leading-tight ${
          isRecipeMission
            ? "text-2xl sm:text-3xl md:text-4xl"
            : "store-home-hero-headline text-xl sm:text-2xl md:text-3xl lg:text-[2rem]"
        }`}
      >
        {isRecipeMission ? "Something else?" : "What are you working on?"}
      </h1>
      <p className="text-aurora-muted text-sm sm:text-base mb-5 font-medium leading-snug max-w-xl">
        {isRecipeMission ? "Pick another category or search" : verticalMissionSubtitle(verticalProfile)}
      </p>

      <div className="relative z-20 mb-5">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-aurora-muted mb-2.5">
          Shop by task
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 max-w-2xl">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const href = action.href;
            return (
              <Link
                key={action.label}
                href={href}
                onClick={() => {
                  if (shouldLockRecipeMissionForMissionPill(action.label, href)) holmesMissionLockCombo();
                }}
                className="store-home-task-chip inline-flex min-h-[2.75rem] flex-col items-center justify-center gap-1 rounded-lg border border-aurora-border bg-aurora-surface px-2 py-2.5 text-center text-xs font-semibold text-aurora-text transition-colors hover:border-aurora-primary sm:min-h-[3rem] sm:text-[0.8125rem]"
              >
                <Icon className="h-4 w-4 shrink-0 text-aurora-primary" aria-hidden />
                <span className="leading-tight line-clamp-2">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {!isRecipeMission && (
        <div className="store-home-popular mb-6">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-aurora-muted mb-2">
            Popular right now
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {POPULAR_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-semibold text-aurora-primary hover:underline underline-offset-2"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}

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

      {!isRecipeMission && <HomeTrustList storeName={store?.name} />}
    </>
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
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12 lg:py-16">
          <div className="max-w-2xl mx-auto lg:mx-0">{formContentInner}</div>
          {featuredProject ? (
            <div className="mt-10 max-w-md mx-auto lg:mx-0">
              <StoreFeaturedProjectCard project={featuredProject} />
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`command-surface-hero px-4 sm:px-6 bg-gradient-to-b from-aurora-surface to-aurora-bg ${splitHeroSectionPaddingClass(heroSize)}`}
    >
      <div
        className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_minmax(280px,360px)] xl:grid-cols-[1fr_minmax(300px,400px)] items-start ${splitHeroRowGapClass(heroSize)}`}
      >
        <div className="min-w-0 order-1 flex justify-center lg:justify-start w-full">
          <div className="w-full max-w-2xl lg:max-w-none">{formContentInner}</div>
        </div>

        <aside className="min-w-0 order-2 w-full max-w-md mx-auto lg:max-w-none lg:mx-0 lg:sticky lg:top-24 store-home-hero-aside">
          {featuredProject ? (
            <StoreFeaturedProjectCard project={featuredProject} />
          ) : (
            <HeroImageLink
              href="/"
              heroImageUrl={displayUrl}
              splitClampClass={splitClamp}
              fullBleed={false}
              heroSize={heroSize}
            />
          )}
        </aside>
      </div>
    </section>
  );
}
