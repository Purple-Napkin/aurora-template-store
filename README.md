# Aurora E-commerce Showcase Template

A full-featured retail storefront for Aurora Studio. Showcases Aurora capabilities: Meilisearch search, Holmes mission inference, delivery slots, per-store promotions, and multi-step checkout.

**Theme:** Dark mode by default. Set `NEXT_PUBLIC_THEME=light` for a light theme.

---

## Quick Start

1. **Create or clone:**
   - **Option A — From Studio:** Sign up at [Aurora](https://aurora.mandeville.digital), create a workspace from the "Hippo Ecom" template (`free-ecom`). Studio provisions the base schema; the storefront adds the full schema on first run.
   - **Option B — Clone:**
   ```bash
   git clone https://github.com/marceldupr/aurora-starter-ecom.git
   cd aurora-starter-ecom
   pnpm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Aurora API URL, API key, and tenant slug (from Aurora Studio → Settings).

3. **Provision schema** (first time only, if not provisioned via Studio):
   ```bash
   AURORA_API_URL=https://api.yourapp.com AURORA_API_KEY=aur_xxx pnpm schema:provision
   ```
   By default uses `init/schema-v2.json` (enterprise schema with Offers) when present; otherwise `init/schema.json`. Or import in Aurora Studio: Data Builder → Import from JSON.

4. **Enable Meilisearch** (for search): Aurora Studio → Settings → Search → configure Meilisearch, then run "Sync index" for your products table.

5. **Run the app:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3001](http://localhost:3001).

---

## Features

- **Location & Store Selection** — Set delivery location on a map, browse nearby stores
- **Meilisearch Search** — Live product search dropdown in header
- **Product Catalogue** — Featured, Bestsellers, New Arrivals, On Sale tabs; category filters
- **Product Detail** — Tabs (Details, Nutrition, Feedback), You May Also Like
- **Basket & Checkout** — Multi-step checkout with delivery slot selection; ACME test payment flow (`/checkout/acme`, `/checkout/success`)
- **Holmes** — AI mission inference; one-click bundle checkout when enabled
- **Promotions** — Store-specific offers and on-sale products
- **Account** — Profile, Orders, Addresses (integrate Supabase Auth for full features)

## Setup

1. Copy `.env.example` to `.env.local`
2. Configure environment variables (see below)
3. Provision your Aurora tenant with the base schema (see Schema)
4. Run `pnpm dev`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_AURORA_API_URL` | Yes | Aurora API base URL (e.g. `https://api.yourapp.com`) |
| `AURORA_API_KEY` | Yes | API key from Aurora Studio → Settings → API Keys |
| `NEXT_PUBLIC_TENANT_SLUG` | Yes | Your tenant slug (e.g. `acme`) |
| `NEXT_PUBLIC_SITE_NAME` | No | Store name (default: "Store") |
| `NEXT_PUBLIC_LOGO_URL` | No | Logo image URL |
| `NEXT_PUBLIC_ACCENT_COLOR` | No | Accent colour (default: `#38bdf8`) |

## Base Schema

Provision the required tables before using the template:

**Option A — Import in Aurora Studio**  
Data Builder → Import from JSON → use `schema/base-store-schema-import.json`

**Option B — Provision script** (requires tenant admin API key)
```bash
AURORA_API_URL=https://api.yourapp.com AURORA_API_KEY=aur_xxx TENANT_SLUG=your-tenant pnpm schema:provision
```
If you get 401/403, use Option A instead.

**Tables created:** vendors, categories, products, promotions, orders, order_items, product_substitutions, addresses

For **Meilisearch** search to work, enable Meilisearch in Aurora Settings and run an index sync for your products table.

For **delivery slots**, add vendors with `location` (PostGIS), create `vendor_catchments` and `delivery_slots` records. Vendors manage slots in the vendor dashboard.

## Holmes

Holmes is auto-injected when `NEXT_PUBLIC_AURORA_API_URL` and `NEXT_PUBLIC_TENANT_SLUG` are set. It captures behavioural signals and surfaces a mission-based product bundle when confidence is high. Enable Holmes in your tenant commerce config.

For standalone deployment, set `NEXT_PUBLIC_APP_URL` on the Aurora API to your storefront URL so Holmes redirects correctly after one-click checkout.

## ACME Checkout

When Stripe is not configured, the template uses **ACME** — a test payment provider. Checkout flow:

1. Create session via `/store/checkout/sessions` → returns ACME session URL
2. User completes payment at `/checkout/acme?session=acme_xxx`
3. Redirect to `/checkout/success` or custom success URL

The API redirects to `/checkout/acme` when the success path starts with `/checkout`. Configure `NEXT_PUBLIC_APP_URL` for correct redirects in standalone deployment.

## Deploy to Vercel

From Aurora Studio: Settings → Storefront → Deploy to Vercel. Uses template `free-ecom` from the Template Registry. Environment variables are injected automatically.

---

## SDK Version

This template uses `@aurora-studio/sdk@0.2.12`. Holmes features (offers, chat, home personalization, session attribution, time-to-completion metrics) are available in SDK 0.2.7+.

_Last build trigger: March 2026_
