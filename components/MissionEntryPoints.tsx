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
      <h2 className="text-[0.6rem] font-bold text-aurora-muted uppercase tracking-[0.16em] mb-4">
        Jump to a task
      </h2>
      <div className="flex flex-wrap gap-2.5">
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
              className="store-mission-pill flex items-center gap-3 px-4 py-3 rounded-md bg-aurora-surface border border-aurora-border font-bold text-aurora-text shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_1px_2px_rgb(15_23_42/0.05)] transition-[border-color,transform,box-shadow] duration-150 ease-out hover:-translate-y-px hover:border-aurora-primary/45 hover:shadow-[0_2px_10px_rgb(29_78_216/0.1)]"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-md bg-aurora-primary/12 text-aurora-primary ring-1 ring-inset ring-aurora-primary/10">
                <Icon className="w-5 h-5" aria-hidden />
              </span>
              {m.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
