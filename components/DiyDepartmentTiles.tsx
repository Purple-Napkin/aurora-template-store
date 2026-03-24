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
      <p className="text-[0.6rem] font-bold text-aurora-muted uppercase tracking-[0.16em] mb-3">
        Departments
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {DEPTS.map(({ href, label, sub, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-3 rounded-md border border-aurora-border bg-aurora-surface px-4 py-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_1px_2px_rgb(15_23_42/0.04)] transition-[border-color,transform,box-shadow,background-color] duration-150 ease-out hover:-translate-y-px hover:bg-aurora-surface-hover hover:border-aurora-primary/35 hover:shadow-[0_4px_14px_rgb(15_23_42/0.07)]"
          >
            <span className="mt-0.5 rounded-md bg-aurora-primary/12 p-2 text-aurora-primary ring-1 ring-inset ring-aurora-primary/10 group-hover:bg-aurora-primary/18">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block font-display font-bold text-aurora-text">{label}</span>
              <span className="block text-sm text-aurora-muted mt-0.5">{sub}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
