"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { RecipeMissionHero } from "./RecipeMissionHero";
import { RecipeIngredientsSection } from "./RecipeIngredientsSection";
import { getStoreConfig } from "@/lib/aurora";

type HomePersonalization = {
  mode: "default" | "recipe_mission";
  recipeSlug?: string;
  recipeTitle?: string;
} | null;

const MissionAwareContext = createContext<HomePersonalization>(null);

function useMissionAware() {
  return useContext(MissionAwareContext);
}

/** Fetches home-personalization with Holmes sid. Provides mode, recipeSlug, recipeTitle. */
export function MissionAwareHomeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<HomePersonalization>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = () => {
      const sid = (window as { holmes?: { getSessionId?: () => string } }).holmes?.getSessionId?.();
      if (!sid) return;
      fetch(`/api/holmes/home-personalization?sid=${encodeURIComponent(sid)}`)
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          if (d.mode === "recipe_mission" && d.recipeSlug && d.recipeTitle) {
            setData({
              mode: "recipe_mission",
              recipeSlug: d.recipeSlug,
              recipeTitle: d.recipeTitle,
            });
          } else {
            setData({ mode: "default" });
          }
        })
        .catch(() => {
          if (!cancelled) setData({ mode: "default" });
        });
    };
    fetchData();
    const onReady = () => fetchData();
    document.addEventListener("holmes:ready", onReady);
    return () => {
      cancelled = true;
      document.removeEventListener("holmes:ready", onReady);
    };
  }, []);

  return (
    <MissionAwareContext.Provider value={data}>
      {children}
    </MissionAwareContext.Provider>
  );
}

/** Hero area: RecipeMissionHero when in recipe mission, else default hero (server component). */
export function MissionAwareHero({ children }: { children: React.ReactNode }) {
  const data = useMissionAware();
  if (data?.mode === "recipe_mission" && data.recipeSlug && data.recipeTitle) {
    return (
      <div data-holmes="home-hero">
        <RecipeMissionHero recipeTitle={data.recipeTitle} recipeSlug={data.recipeSlug} />
      </div>
    );
  }
  return <div data-holmes="home-hero">{children}</div>;
}

/** Sections area: RecipeIngredientsSection when in recipe mission, else default sections (server component). */
export function MissionAwareSections({ children }: { children: React.ReactNode }) {
  const data = useMissionAware();
  const [currency, setCurrency] = useState("GBP");

  useEffect(() => {
    getStoreConfig().then((c) => {
      const curr = (c as { currency?: string })?.currency ?? "GBP";
      setCurrency(curr);
    });
  }, []);

  if (data?.mode === "recipe_mission" && data.recipeSlug && data.recipeTitle) {
    return (
      <RecipeIngredientsSection
        recipeSlug={data.recipeSlug}
        recipeTitle={data.recipeTitle}
        currency={currency}
      />
    );
  }
  return <>{children}</>;
}
