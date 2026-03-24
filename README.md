# Aurora template — Store

General e-commerce storefront template for Aurora Studio (products, cart, checkout). Built on [`@aurora-studio/starter-core` (npm)](https://www.npmjs.com/package/@aurora-studio/starter-core) and `@aurora-studio/sdk`.

**Live demo:** [store.purple-napkin.com](https://store.purple-napkin.com) · **Aurora Studio:** [aurora.purple-napkin.com](https://aurora.purple-napkin.com)

- **Studio:** create a workspace with template **Store (example template)** (`aurora-template-store`).
- **Deploy:** Settings → Apps → generate credentials → use GitHub template **Purple-Napkin/aurora-template-store**.

See [Storefront deploy](../aurora-studio/docs/06-storefront-deploy.md) for the full checklist.

## Run locally

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001).

### Vertical theme (CSS tokens)

Defined in `app/globals.css` (`:root` / `[data-theme="dark"]`). Precedence: **`NEXT_PUBLIC_ACCENT_COLOR`** → Studio **`branding.accent_color`** → template default (`app/layout.tsx` + starter-core `getResolvedStorefrontAccentForLayout`).

| Token | Light | Dark |
|-------|-------|------|
| `--aurora-primary` | `#1e3a8a` | `#3b82f6` |
| `--aurora-accent` | `#ea580c` | `#fb923c` |
| `--aurora-bg` | `#f4f4f5` | `#0c0f14` |
