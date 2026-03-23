"use client";

import Link from "next/link";
import { Wrench, PaintBucket, Trees, Hammer, Sparkles } from "lucide-react";
import { useMissionAware } from "./MissionAwareHome";
import { holmesMissionLockCombo } from "@aurora-studio/starter-core";
import { shouldLockRecipeMissionForMissionPill } from "@/lib/holmes-mission-lock";

const DEFAULT_MISSIONS = [
  { label: "DIY weekend", href: "/catalogue?q=tools", icon: Hammer },
  { label: "Tools & fixes", href: "/catalogue?q=tools", icon: Wrench },
  { label: "Refresh a room", href: "/catalogue?q=paint", icon: PaintBucket },
  { label: "Garden project", href: "/catalogue?q=garden", icon: Trees },
  { label: "Paint & supplies", href: "/catalogue?q=paint", icon: PaintBucket },
] as const;

const ICON_MAP: Record<string, typeof Wrench> = {
  "DIY weekend": Hammer,
  "Tools & fixes": Wrench,
  "Refresh a room": PaintBucket,
  "Garden project": Trees,
  "Paint & supplies": PaintBucket,
  "Explore more": Sparkles,
  "Recipe ideas": Sparkles,
  "Kits & bundles": Sparkles,
  "Paint prep": PaintBucket,
  "Cook dinner": Sparkles,
};

/** Mission-based entry points - Holmes-influenced when inference exists, else defaults. */
export function MissionEntryPoints() {
  const homeData = useMissionAware();
  const missions = homeData?.missions?.length
    ? homeData.missions.map((m) => ({
        label: m.label,
        href: m.href,
        icon: ICON_MAP[m.label] ?? Sparkles,
      }))
    : DEFAULT_MISSIONS;

  return (
    <section className="py-8">
      <h2 className="text-xs font-semibold text-aurora-muted uppercase tracking-widest mb-4">
        Start here
      </h2>
      <div className="flex flex-wrap gap-3">
        {missions.map((m) => {
          const Icon = m.icon;
          const href = m.href;
          return (
            <Link
              key={m.label}
              href={href}
              onClick={() => {
                if (shouldLockRecipeMissionForMissionPill(m.label, href)) holmesMissionLockCombo();
              }}
              className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-aurora-surface border border-aurora-border/80 shadow-sm hover:border-aurora-primary/40 hover:shadow-md hover:shadow-aurora-primary/5 transition-all font-medium text-aurora-text"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-aurora-primary/10 text-aurora-primary">
                <Icon className="w-5 h-5" />
              </span>
              {m.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
