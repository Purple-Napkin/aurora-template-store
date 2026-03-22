"use client";

import Link from "next/link";
import { useStore } from "@aurora-studio/starter-core";
import { getTimeOfDay } from "@aurora-studio/starter-core";
import { TrendingUp } from "lucide-react";

/** Live adapting UI signals - creates perceived intelligence before intent system kicks in */
export function LiveSignalsRow() {
  const { store } = useStore();
  const timeOfDay = getTimeOfDay();

  const signal = store
    ? { label: `Popular at ${store.name} today`, href: "/catalogue" }
    : timeOfDay === "evening"
      ? { label: "Finish today’s job — tools & fixings", href: "/catalogue?q=tools" }
      : timeOfDay === "afternoon"
        ? { label: "Project supplies in stock", href: "/catalogue" }
        : { label: "Browse departments", href: "/catalogue" };

  return (
    <section className="py-4">
      <Link
        href={signal.href}
        className="flex items-center gap-2 text-sm text-aurora-muted hover:text-aurora-primary transition-colors"
      >
        <TrendingUp className="w-4 h-4 text-aurora-primary shrink-0" />
        <span>{signal.label}</span>
      </Link>
    </section>
  );
}
