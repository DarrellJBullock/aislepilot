# AislePilot 🛒

[![Live demo](https://img.shields.io/badge/Live%20demo-store--pilot--black.vercel.app-18b365?logo=vercel&logoColor=white)](https://store-pilot-black.vercel.app)

**Your list. Your route. Your total.**

**▶ Live demo:** https://store-pilot-black.vercel.app — sign in with `demo@aislepilot.app` / `demo123`.

A mobile-first shopping assistant for Kroger-family supermarkets. Build a list,
match each entry to an exact store product, see prices and aisles, track your
running total against a budget, and shop by store route in a focused Shopping
Mode — collecting items as you go.

> Demo MVP. Not affiliated with The Kroger Co. All product, price, store, and
> location data is fictional and clearly marked as demo data.

## Features
- **Authentication** — email/password sign up, sign in, protected routes, session persistence
- **Dashboard** — active/archived lists with live progress and estimated totals
- **Store selection** — 3 fictional Kroger-family stores, each with its own prices, promos, availability, and aisle layout
- **Shopping-list CRUD** — create, rename, archive, delete, duplicate; budgets and notes
- **Fast + bulk item entry** — one-at-a-time (Enter to submit) or paste a whole list (`2 Eggs`, `Bread x3`)
- **Product matching** — token-ranked matches from a mock Kroger catalog in a drawer, with price, availability, department, aisle, and **location confidence**
- **Price + budget** — effective/promotional pricing, subtotals, estimated/collected/remaining totals, budget remaining, over-budget suggestions
- **Department & aisle sorting** — sort by store route, price, or name; grouped by department in route order
- **Shopping Mode** — mobile focus card, large touch actions (collected / skip / unavailable / substitute), quantity edit, next/prev, collapsible completed section, sticky totals, **offline state + sync status**, optimistic updates
- **Shared lists** — invite by email, manage members, see who collected each item
- **Barcode scanner** — camera scanning via the native `BarcodeDetector` API (zero deps), with manual UPC entry fallback; a scan looks up the product and adds it pre-matched
- **Saved products & purchase history** — foundations in the data model + settings
- **Installable PWA** — web app manifest, maskable icons, and a service worker with an offline fallback and cached app shell (registered in production)
- **Responsive, accessible UI** — mobile-first, keyboard + screen-reader friendly, loading/empty/error states

## Stack
Next.js (App Router) · React · TypeScript (strict) · Tailwind CSS · Zod · React
Hook Form · Lucide · Supabase (optional: Auth, Postgres, Realtime) · Vitest +
React Testing Library · Playwright.

## Quick start
```bash
npm install
npm run dev        # http://localhost:3000
```
No accounts or keys needed — the app runs in **mock mode** out of the box.
Sign in with the demo account: **demo@aislepilot.app / demo123** (or create your own).

## Mock-data mode
With no environment variables set, AislePilot uses:
- an in-browser (localStorage) data store with a seeded demo account + list, and
- `MockKrogerProvider` for stores/products/availability/barcode.

Everything is functional offline. A **Demo data** badge marks mock vs. live data
throughout the UI.

## Environment variables
Copy `.env.example` → `.env.local`. **All are optional.**
| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Enable real auth + persistence |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; used by `npm run seed` |
| `KROGER_CLIENT_ID` / `KROGER_CLIENT_SECRET` / `KROGER_BASE_URL` | Server-only; live retailer data |
| `USE_MOCK_RETAILER_DATA` | `true` (default) forces mock even if Kroger creds exist |

Secrets are read only on the server; the browser calls `/api/retailers/*`.

## Supabase (optional)
See **`docs/supabase-setup.md`**. In short:
```bash
supabase db push     # applies supabase/migrations/0001_init.sql + 0002_rls.sql
npm run seed         # upserts demo reference data (no-op without Supabase env)
```
Migrations create all 11 tables with UUID PKs, timestamps, FKs, indexes, and Row
Level Security (owner + shared-member access), plus a profile-creation trigger.

## Scripts
| Command | Action |
|---------|--------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest unit + integration |
| `npm run test:e2e` | Playwright (`npx playwright install` first) |
| `npm run seed` | Seed Supabase reference data (mock mode: no-op) |
| `npm run kroger:smoke -- [zip]` | Live Kroger API end-to-end check (needs credentials; no-op without) |

## Testing
```bash
npm run test                          # 60 unit + integration tests
npx playwright install chromium
npm run test:e2e -- --project=desktop # end-to-end flow
```

## Build & deploy
```bash
npm run build && npm run start
```
Vercel-compatible: import the repo, add any optional env vars, deploy. Works with
zero env vars (mock mode).

## Known limitations
- Persistence in mock mode is **per-browser** (localStorage); "shared lists" and
  "realtime" are simulated locally until Supabase is configured.
- The service worker registers only in a production build (`npm run build && npm run start`);
  regenerate icons with `node scripts/generate-icons.mjs` if the logo changes.
- `KrogerProvider` is **fully implemented** (OAuth client-credentials + token
  caching, Locations/Products mapping, availability, barcode). It's inactive
  until you add credentials; without them the app uses mock data. Live **store
  search is zip-based** (Kroger's Locations API is geo-filtered).
- Sync/offline indicators reflect network state and local writes; true multi-device
  sync requires the Supabase path.
- Barcode camera scanning uses the native `BarcodeDetector` API (Chromium/Android;
  requires HTTPS or localhost for camera access). Browsers without it — notably
  Safari/Firefox — automatically get the manual UPC-entry fallback.
- Out of scope by design: payments, checkout/delivery, indoor GPS, live inventory
  polling, loyalty sync, paid AI, non-Kroger retailers, native apps.

## Live Kroger integration steps
The `KrogerProvider` is already implemented — you only need credentials:

1. Register an app at **developer.kroger.com** and copy the **Client ID** and
   **Client Secret** (the client-credentials flow with scope `product.compact`
   covers stores, products, prices, availability, and barcode — no user login).
2. Set the env vars and flip off mock mode:
   ```bash
   KROGER_CLIENT_ID=...
   KROGER_CLIENT_SECRET=...
   KROGER_BASE_URL=https://api.kroger.com/v1
   USE_MOCK_RETAILER_DATA=false
   ```
   The factory then selects `KrogerProvider` automatically.
3. Verify the live path end-to-end:
   ```bash
   npm run kroger:smoke -- 45202   # auth → store search → products → barcode
   ```

**What it does** (`src/providers/kroger.ts` + `kroger-map.ts`):
- OAuth2 client-credentials token fetch with in-memory caching + 401 retry.
- `GET /locations?filter.zipCode.near=` → `searchStores` (zip-based) / `getStore`.
- `GET /products?filter.term=&filter.locationId=` → `searchProducts` / `getProduct`,
  mapped to the normalized `Product` (price, promo, size, image, availability).
- Aisle data is marked `retailer_verified` only when Kroger returns it for the
  requested store; otherwise it's a `category_estimate`.
- UPC term search → `lookupBarcode`; `items[].inventory.stockLevel` → availability.
- All calls stay server-side; the browser continues to use `/api/retailers/*`.

Optionally cache responses into `products_cache` / `store_product_locations` to
stay within Kroger's per-day rate limits.

## Documentation
- `docs/implementation-plan.md` · `docs/architecture.md` · `docs/design-system.md`
- `docs/supabase-setup.md` · `docs/quality-report.md`
