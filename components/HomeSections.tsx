import Link from "next/link";
import { getHomePersonalization } from "@/lib/aurora";
import { getStoreConfig } from "@/lib/aurora";
import { ProductImage } from "@/components/ProductImage";

const CURRENCY_SYMBOLS: Record<string, string> = {
  gbp: "£",
  usd: "$",
  eur: "€",
  aud: "A$",
};

/** SSR fallback for home sections. Holmes script replaces this when ready. */
export async function HomeSections() {
  const [homeData, config] = await Promise.all([
    getHomePersonalization(),
    getStoreConfig(),
  ]);

  const currency =
    (config as { currency?: string })?.currency?.toLowerCase() ?? "gbp";
  const symbol = CURRENCY_SYMBOLS[currency] ?? "£";

  if (!homeData?.sections?.length) {
    return (
      <div data-holmes="home-sections" className="py-6 min-h-[1px]" />
    );
  }

  return (
    <div data-holmes="home-sections" className="py-6">
      {homeData.sections.map((sec, i) => (
        <section
          key={i}
          data-holmes-home-section
          className="mb-10 last:mb-0"
        >
          <h2 data-holmes-home-section-title className="text-xl font-bold mb-4">
            {sec.title}
          </h2>
          {sec.products && sec.products.length > 0 && (
            <div
              data-holmes-home-section-grid
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {sec.products.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/catalogue/${prod.id}`}
                  data-holmes-home-card
                  className="block p-4 rounded-xl bg-aurora-surface border border-aurora-border hover:border-aurora-primary/40 hover:shadow-md transition-all"
                >
                  <div
                    data-holmes-home-card-image
                    className="aspect-square rounded-lg bg-aurora-surface-hover mb-2 overflow-hidden"
                  >
                    <ProductImage
                      src={prod.image_url}
                      baseUrl={process.env.NEXT_PUBLIC_APP_URL}
                      className="w-full h-full"
                      objectFit="contain"
                      thumbnail
                      fallback={
                        <span
                          data-holmes-home-card-fallback
                          className="w-full h-full flex items-center justify-center text-aurora-muted text-2xl"
                        >
                          -
                        </span>
                      }
                    />
                  </div>
                  <div
                    data-holmes-home-card-title
                    className="font-semibold text-sm truncate"
                  >
                    {prod.name}
                  </div>
                  {prod.price != null && Number(prod.price) > 0 && (
                    <div
                      data-holmes-home-card-price
                      className="text-sm font-bold text-aurora-primary mt-0.5"
                    >
                      {symbol}
                      {Number(prod.price).toFixed(2)}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
          {sec.cards && sec.cards.length > 0 && (
            <div
              data-holmes-home-section-grid
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {sec.cards.map((card, j) => (
                <Link
                  key={j}
                  href={card.linkUrl || "/catalogue"}
                  data-holmes-home-card
                  className="block p-4 rounded-xl bg-aurora-surface border border-aurora-border hover:border-aurora-primary/40 hover:shadow-md transition-all"
                >
                  <div
                    data-holmes-home-card-image
                    className="aspect-square rounded-lg bg-aurora-surface-hover mb-2 overflow-hidden"
                  >
                    <ProductImage
                      src={card.imageUrl}
                      className="w-full h-full"
                      objectFit="contain"
                      thumbnail
                      fallback={
                        <span
                          data-holmes-home-card-fallback
                          className="w-full h-full flex items-center justify-center text-aurora-muted text-sm text-center px-2"
                        >
                          {card.title}
                        </span>
                      }
                    />
                  </div>
                  <div
                    data-holmes-home-card-title
                    className="font-semibold text-sm truncate"
                  >
                    {card.title}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
