# AislePilot — how it works

Monorepo (npm workspaces): a Next.js 14 App Router web app at the root (`src/`),
an Expo/React Native app (`apps/mobile`), and three shared packages
(`packages/domain`, `packages/validation`, `packages/design-tokens`).

Two independent "backend switches" define every runtime mode:

| Switch | Off (default) | On |
|---|---|---|
| Persistence/auth (`NEXT_PUBLIC_SUPABASE_*`) | `LocalAppProvider` — localStorage + seeded demo account | `SupabaseAppProvider` — Postgres + Auth + Realtime, durable write queue |
| Retailer data (`KROGER_*` + `USE_MOCK_RETAILER_DATA=false`) | `MockKrogerProvider` — fictional stores/catalog | `KrogerProvider` — OAuth client-credentials, live Locations/Products |

Both switches are resolved behind one interface each (`AppContextValue`,
`RetailerProvider`), so no UI component knows which mode it's in.

## 1. System overview

```mermaid
flowchart TB
  subgraph clients[Clients]
    web["Web app (Next.js App Router)<br/>src/app, src/components"]
    mob["Mobile app (Expo Router)<br/>apps/mobile"]
  end

  subgraph shared["Shared packages (framework-free)"]
    dom["@aislepilot/domain<br/>types, matching, pricing, routing,<br/>status, progress, assignment, sync, store/state"]
    val["@aislepilot/validation (zod)"]
    tok["@aislepilot/design-tokens"]
  end

  subgraph server["Next.js server (same deployment)"]
    api["/api/retailers/{stores,products,barcode}<br/>/api/notifications/notify"]
    fact["getRetailerProvider() — server-only<br/>src/services/retailers/factory.ts"]
  end

  subgraph ext[External services]
    kro["Kroger API<br/>OAuth2 client_credentials"]
    sup["Supabase<br/>Auth · Postgres+RLS · Realtime"]
    expo["Expo Push"]
  end

  web --> dom
  mob --> dom
  web --> val
  mob --> val
  web --> tok
  mob --> tok

  web -- "fetch /api/retailers/*" --> api
  mob -- "EXPO_PUBLIC_API_BASE_URL<br/>(falls back to local MockKroger)" --> api
  api --> fact
  fact -- "creds + USE_MOCK_RETAILER_DATA=false" --> kro
  fact -- "otherwise" --> dom

  web <-- "auth · CRUD · realtime" --> sup
  mob <-- "auth · CRUD · realtime" --> sup
  api -- "service-role read of push tokens" --> sup
  api --> expo
  expo --> mob
```

Credentials never reach a client bundle: Kroger secrets are read only inside
`factory.ts` (marked `import "server-only"`), and the service-role key only in
`/api/notifications/notify`.

## 2. Layers inside the repo

```mermaid
flowchart TD
  ui["src/components/*<br/>ui/ design system + feature components<br/>(lists, products, shopping-mode, stores, collaboration)"]
  pages["src/app/*<br/>sign-in · dashboard · lists/[id] · lists/[id]/shopping · settings"]
  ctx["useApp() — src/lib/store/context.ts<br/>single client-state interface"]
  local["LocalAppProvider<br/>localStorage 'aislepilot:v1' + seedDemoState()"]
  supa["SupabaseAppProvider<br/>optimistic apply + realtime + sync-queue"]
  state["@aislepilot/domain/store/state.ts<br/>pure reducers: createList, addItem,<br/>matchItem, setItemStatus, inviteMember…"]
  pure["Pure domain modules<br/>matching · pricing (+ state grocery tax) · routing<br/>status transitions · progress · assignment · status/location"]
  rc["src/lib/retailer-client.ts<br/>fetchStores/fetchProducts/fetchBarcode"]

  pages --> ui --> ctx
  ctx --> local
  ctx --> supa
  local --> state
  supa --> state
  ui --> pure
  state --> pure
  ui --> rc
```

`state.ts` is side-effect-free, so both providers (and, in principle, the mobile
store) apply the exact same transitions; persistence is the only difference.

## 3. Matching an item to a product (core flow)

```mermaid
sequenceDiagram
  participant U as User
  participant Row as ItemRow / ProductMatchDrawer
  participant C as retailer-client (browser)
  participant R as /api/retailers/products
  participant F as getRetailerProvider()
  participant P as MockKroger | Kroger API
  participant S as useApp() store

  U->>Row: type "2 Eggs" / tap Match
  Row->>C: fetchProducts(query, storeId)
  C->>R: GET ?q=&storeId=
  R->>F: provider (cached per process)
  F->>P: searchProducts
  P-->>R: normalized Product[] (price, promo, aisle, locationSource)
  R-->>C: { products, live }
  C-->>Row: candidates ranked by domain/matching.scoreProduct
  U->>Row: pick a candidate
  Row->>S: matchItem(listId, itemId, product)
  S->>S: assignProduct → status "available", recompute totals/progress
  Note over S: local mode → localStorage<br/>supabase mode → optimistic state + queued write
```

Aisle honesty is carried end-to-end via `locationSource`; only
`retailer_verified` renders as verified (`domain/status/location.ts`), everything
else is labelled an estimate.

## 4. Item status machine (`domain/status`)

```mermaid
stateDiagram-v2
  [*] --> unmatched
  unmatched --> matched: product assigned
  matched --> available
  matched --> unmatched: clear match
  available --> collected
  available --> unavailable
  available --> skipped
  unavailable --> matched: substitute
  unavailable --> available
  skipped --> available
  collected --> available: undo
  collected --> purchased: trip saved
  purchased --> [*]
```

Shopping Mode drives these transitions (collect / skip / unavailable /
substitute); `computeProgress` counts everything except `unmatched` as active,
and `resolved/total` is the progress bar.

## 5. Supabase mode: writes, offline queue, realtime

```mermaid
flowchart LR
  act["User action"] --> opt["Optimistic apply()<br/>state updated immediately"]
  opt --> enq["enqueueOps(WriteOp[])<br/>src/lib/sync-queue.ts"]
  enq --> drain["drainQueue()<br/>domain/sync/queue.ts"]
  drain -->|success| db[("Supabase Postgres<br/>RLS: owner + invited members")]
  drain -->|first failure| keep["keep failed op + everything after<br/>retry in order when online"]
  online["useOnlineStatus / useSyncStatus"] --> drain
  db -- "realtime channel 'aislepilot-lists'" --> reload["loadLists() → other devices update"]
  act -. shared list .-> notify["/api/notifications/notify<br/>service-role → Expo Push"]
```

`drainQueue` stops at the first failure so ops never apply out of order (an item
update can't land before the insert that created it).

## 6. Data model (Supabase, `supabase/migrations`)

```mermaid
erDiagram
  profiles ||--o{ shopping_lists : owns
  shopping_lists ||--o{ shopping_list_items : contains
  shopping_lists ||--o{ shopping_list_members : "shared with (by email)"
  retailers ||--o{ stores : has
  stores ||--o{ store_departments : "route order"
  stores ||--o{ store_product_locations : "aisle per product"
  shopping_lists }o--|| stores : "selected store"
  profiles ||--o{ purchase_history : records
  profiles ||--o{ saved_products : saves
  products_cache ||--o{ store_product_locations : caches
```

RLS scopes every list to its owner plus invited members; a trigger creates a
`profiles` row on sign-up.

## Known gaps

- `/api/notifications/notify` reads `device_push_tokens` and cites
  `supabase/migrations/0003_push_tokens.sql`, but only `0001_init.sql` and
  `0002_rls.sql` exist in the repo — push notifications will fail against a fresh
  schema push.
- Mobile has no mock-mode fallback for auth/lists (it shows a "Supabase not
  configured" screen), while retailer data still works fully offline.
- Tests: 18 Vitest files (unit + integration) plus two Playwright e2e specs.
