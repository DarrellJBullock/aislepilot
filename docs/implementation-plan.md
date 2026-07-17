# AislePilot — Implementation Plan

Mobile-first shopping assistant for Kroger-family stores. Mock data first; runs with zero external credentials.

## Principles
- App must build and run with **no** Supabase/Kroger credentials (mock mode).
- Data layer abstraction: in-memory/localStorage store by default; Supabase when env present.
- Retailer abstraction: `MockKrogerProvider` default, `KrogerProvider` shell (server-only creds).
- Reusable domain logic (pure functions) so a future React Native app can share `src/domain`.

## Stack
Next.js (App Router) · React · TS strict · Tailwind · Supabase (optional) · Zod · RHF · Lucide · Vitest · RTL · Playwright.

## Architecture
- `src/domain/*` — pure types + logic (matching, pricing, progress, routing, status).
- `src/providers/*` + `src/services/retailers/*` — retailer providers + factory.
- `src/data/mock/*` — 3 stores, 40+ products each, departments, aisles.
- `src/lib/store/*` — data store abstraction (mock local + supabase adapters).
- `src/lib/supabase/*` — browser/server clients (guarded).
- `src/components/ui/*` — design system. Feature components under `src/components/*`.
- `src/app/*` — routes: `/`, `/sign-in`, `/sign-up`, `/dashboard`, `/lists/new`, `/lists/[id]`, `/lists/[id]/shopping`, `/settings`.

## Phases (keep runnable after each)
1. Scaffold: package.json, tsconfig, tailwind, next config, plan/architecture docs.
2. Domain: types.ts, provider contract, pricing/progress/matching/routing/status logic.
3. Mock data + providers + factory + retailer API routes.
4. Data store abstraction (mock) + auth context + Supabase clients/migrations/seed.
5. Design system UI primitives + styles.
6. App UI: landing, auth, dashboard, store select, list CRUD, item entry, matching, budget.
7. Shopping Mode + offline/optimistic.
8. Collaboration (shared lists, realtime shell).
9. Tests: unit (domain), integration, Playwright e2e.
10. Quality: lint, typecheck, test, build; quality-report.md; README + docs.

## Subagent use
Lead owns architecture, integration, build. Isolated workstreams delegated: mock catalog data,
design-system components, test suites. Core compiling wiring built by lead for integration integrity.

## Domain models
User, Profile, Retailer, Store, StoreDepartment, StoreLocation, Product, ProductPrice,
ProductAvailability, ShoppingList, ShoppingListMember, ShoppingListItem, ShoppingTrip,
PurchaseHistory, SavedProduct, RetailerCapabilities.
Item statuses: unmatched, matched, available, collected, unavailable, skipped, purchased.
Location sources: retailer_verified, aislepilot_mapped, community_verified, category_estimate, unknown.

## Quality gates
npm install/lint/typecheck/test/build all pass · no client secrets · no empty routes ·
estimated locations never labeled verified · mobile + desktop widths.
