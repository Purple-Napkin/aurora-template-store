import Link from "next/link";
import { Hammer, Flower2, Paintbrush } from "lucide-react";

const DEPTS = [
  {
    href: "/catalogue?category=template-store-tools",
    label: "Tools",
    sub: "Drills, fixings, workshop",
    Icon: Hammer,
  },
  {
    href: "/catalogue?category=template-store-garden",
    label: "Garden",
    sub: "Outdoor, trimmers, compost",
    Icon: Flower2,
  },
  {
    href: "/catalogue?category=template-store-paint-decor",
    label: "Paint & decor",
    sub: "Emulsion, rollers, prep",
    Icon: Paintbrush,
  },
] as const;

/** DIY-style department tiles (store template). */
export function DiyDepartmentTiles() {
  return (
    <section className="marketplace-diy-dept mb-6" aria-label="Shop by department">
      <p className="text-xs font-semibold text-aurora-muted uppercase tracking-widest mb-3">
        Shop by department
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DEPTS.map(({ href, label, sub, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-3 rounded-xl border border-aurora-border bg-aurora-surface hover:bg-aurora-surface-hover px-4 py-4 transition-colors"
          >
            <span className="mt-0.5 rounded-lg bg-aurora-primary/15 p-2 text-aurora-primary group-hover:bg-aurora-primary/25">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block font-display font-semibold text-aurora-text">{label}</span>
              <span className="block text-sm text-aurora-muted mt-0.5">{sub}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
