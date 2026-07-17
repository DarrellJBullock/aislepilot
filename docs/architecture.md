# AislePilot — Architecture

## Layers

```
src/
  domain/        Pure, framework-free logic + types (reusable in React Native)
    types.ts       Shared domain models
    provider.ts    RetailerProvider contract
    matching/      List-entry → product ranking
    pricing/       Unit price, subtotals, totals, budget
    progress/      Trip progress
    routing/       Route sort + department grouping
    status/        Item status transitions + location confidence
    assignment/    Match/replace product, budget suggestions
  providers/     RetailerProvider implementations (Mock + Kroger shell)
  services/
    retailers/     Provider factory (server-only credential read)
    offline/       Online + sync-status hooks
  data/mock/     Demo stores, departments, product catalog
  lib/
    store/         Client state: pure ops (state.ts, auth.ts) + React provider
    supabase/      Guarded browser/server clients + config
    retailer-client.ts  Browser → /api fetch helpers
  components/    ui/ (design system) + feature components
  app/          Next.js App Router pages + /api/retailers routes
```

## Key decisions

- **Runs with zero credentials.** No Supabase or Kroger keys are required. The
  data store defaults to an in-browser (localStorage) implementation and the
  retailer layer defaults to `MockKrogerProvider`.
- **Retailer abstraction.** `RetailerProvider` is the single seam for live data.
  `getRetailerProvider()` (server-only) picks Mock vs. Kroger from env and caches
  the choice. Credentials are read only on the server; the browser talks to
  `/api/retailers/*` routes, never to Kroger directly.
- **Pure domain core.** Everything in `src/domain` is side-effect free and unit
  tested, so the same logic can back a future React Native client. UI and
  persistence are thin shells over it.
- **Client state is a reducer.** `lib/store/state.ts` + `auth.ts` are pure
  functions over an `AppState`; `provider.tsx` wires them into React context with
  localStorage persistence and optimistic updates. Swapping in Supabase means
  replacing the provider's setters with async calls to the equivalent tables.
- **Location honesty.** `locationSource` is carried end-to-end. Only
  `retailer_verified` renders as "verified" (`domain/status/location.ts`); all
  estimated aisles are labelled as estimates in the UI.

## Data flow (matching a product)

```
ItemRow → ProductMatchDrawer → fetchProducts()  (browser)
        → GET /api/retailers/products             (server route)
        → getRetailerProvider().searchProducts()  (Mock or Kroger)
        → domain/matching.matchProducts()          (ranking)
        ← normalized Product[]  → user selects → matchItem() → AppState
```

## Optional Supabase path

When `NEXT_PUBLIC_SUPABASE_URL` + anon key are set, `lib/supabase/*` clients
activate. Schema, RLS, and a profile-creation trigger live in
`supabase/migrations`. RLS scopes every list to its owner and invited members.
See `docs/supabase-setup.md`.
