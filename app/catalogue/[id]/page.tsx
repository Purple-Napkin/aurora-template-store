import Link from "next/link";
import { notFound } from "next/navigation";
import { createAuroraClient } from "@aurora-studio/starter-core";
import { AddToCartButton } from "@aurora-studio/starter-core";
import { HolmesProductViewTracker } from "@aurora-studio/starter-core";
import { ProductDetailTabs } from "@aurora-studio/starter-core";
import { ProductImageGallery } from "@aurora-studio/starter-core";
import { YouMayAlsoLike } from "@/components/YouMayAlsoLike";
import { HolmesContextualWell } from "@/components/HolmesContextualWell";
import { HolmesTidbits } from "@aurora-studio/starter-core";
import { StoreContentRails } from "@/components/StoreContentRails";

export const dynamic = "force-dynamic";

function getImageUrl(record: Record<string, unknown>): string | null {
  const field = ["image_url", "image", "thumbnail", "photo"].find((f) => record[f]);
  return field ? String(record[field]) : null;
}

function getPrice(record: Record<string, unknown>): number | undefined {
  if (record.on_sale && record.sale_price != null) return Number(record.sale_price);
  const field = ["price", "amount", "value"].find((f) => record[f] != null);
  return field ? Number(record[field]) : undefined;
}

function getDisplayName(record: Record<string, unknown>): string {
  const field = ["name", "title", "slug"].find((f) => record[f]) ?? "id";
  return String(record[field] ?? record.id ?? "");
}

/** Entity for Holmes tidbits lookup (entity_slug). API lowercases; use slug format to match common storage. */
function toProductEntity(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function formatPrice(cents: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const aurora = createAuroraClient();
  const baseUrl = process.env.NEXT_PUBLIC_AURORA_API_URL ?? "";
  const apiKey = process.env.AURORA_API_KEY ?? "";

  if (!baseUrl || !apiKey) notFound();

  let catalogTableSlug: string | null = null;
  let currency = "GBP";

  try {
    const config = await aurora.store.config();
    if (config.enabled && config.catalogTableSlug) {
      catalogTableSlug = config.catalogTableSlug;
      currency = (config as { currency?: string }).currency ?? "GBP";
    }
  } catch {
    notFound();
  }

  if (!catalogTableSlug) notFound();

  let record: Record<string, unknown>;

  try {
    record = await aurora.tables(catalogTableSlug).records.get(id);
  } catch {
    notFound();
  }

  const name = getDisplayName(record);
  const rawPrice = getPrice(record);
  const priceCents = rawPrice != null ? Math.round(rawPrice * 100) : undefined;
  const sellByWeight = Boolean(record.sell_by_weight);
  const unit = (record.unit as string) || "kg";
  const pricePerUnit = record.price_per_unit as number | undefined;
  const pricePerUnitCents = pricePerUnit != null ? Math.round(pricePerUnit * 100) : undefined;
  const imageUrl = getImageUrl(record);
  const vendorName = record.vendor_name as string | undefined;
  const categoryObj = record.category as Record<string, unknown> | undefined;
  const categoryName = categoryObj?.name ?? record.subcategory ?? "Products";
  const categoryId = (record.category_id ?? categoryObj?.id) as string | undefined;
  const stockQuantity = record.stock_quantity as number | undefined;
  const description = record.description as string | undefined;

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      <HolmesProductViewTracker productId={id} />
      <HolmesContextualWell currentProductId={id} />

      <nav className="text-sm text-aurora-muted mb-6">
        <Link href="/" className="hover:text-aurora-text">Home</Link>
        {" > "}
        <Link href="/catalogue" className="hover:text-aurora-text">{String(categoryName)}</Link>
        {" > "}
        <span className="text-aurora-text">{name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        <div className="shrink-0 lg:w-2/5">
          <ProductImageGallery record={record} />
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-aurora-text leading-snug">
            {name}
          </h1>
          {sellByWeight && pricePerUnitCents != null ? (
            <p className="text-2xl sm:text-3xl font-extrabold text-aurora-text tabular-nums">
              {formatPrice(pricePerUnitCents, currency)}/{unit}
            </p>
          ) : priceCents != null ? (
            <p className="text-2xl sm:text-3xl font-extrabold text-aurora-text tabular-nums">
              {formatPrice(priceCents, currency)}
            </p>
          ) : null}
          {description && (
            <p className="text-aurora-muted text-sm leading-snug">{description}</p>
          )}
          <div className="mt-2">
            <HolmesTidbits
              entity={toProductEntity(name)}
              entityType="product"
            />
          </div>
          {vendorName && (
            <p className="text-sm">
              Sold by:{" "}
              <Link href="/stores" className="text-aurora-accent hover:underline">
                {vendorName}
              </Link>
            </p>
          )}
          <p className="text-xs text-aurora-muted flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-aurora-primary" />
            Free delivery on orders over £50
          </p>
          {stockQuantity != null && (
            <p className="text-sm font-semibold text-aurora-text">
              {Number(stockQuantity) > 0
                ? `In stock — ${stockQuantity} available`
                : "Out of stock online — try your local branch"}
            </p>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {((sellByWeight && pricePerUnitCents != null) || priceCents != null) && catalogTableSlug && (
              <AddToCartButton
                recordId={id}
                tableSlug={catalogTableSlug}
                name={name}
                unitAmount={sellByWeight ? pricePerUnitCents! : priceCents!}
                sellByWeight={sellByWeight}
                unit={unit}
                imageUrl={imageUrl}
                className="px-6 py-3 rounded-md bg-aurora-primary text-white font-semibold hover:bg-aurora-primary-dark flex items-center gap-2"
              />
            )}
            <button
              type="button"
              className="px-5 py-3 rounded-md border border-aurora-border text-aurora-text text-sm font-medium hover:bg-aurora-surface-hover transition-colors"
            >
              Save for later
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <ProductDetailTabs record={record} tabSet="retail" />
      </div>

      <div className="mt-8 space-y-8">
        <StoreContentRails contentPage="product_detail" contentRegion="pdp_below_tabs" />
        <StoreContentRails contentPage="product_detail" contentRegion="pdp_below_context" />
      </div>

      <div className="mt-12">
        <YouMayAlsoLike
          productId={id}
          catalogTableSlug={catalogTableSlug}
          categoryId={categoryId}
        />
      </div>
    </div>
  );
}
