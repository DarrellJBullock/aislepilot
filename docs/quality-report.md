# AislePilot — Quality Report

Last run: 2026-07-16 · mock mode (no external credentials).

## Gates
| Gate | Command | Result |
|------|---------|--------|
| Install | `npm install` | ✅ pass |
| Typecheck | `npm run typecheck` | ✅ pass (0 errors) |
| Lint | `npm run lint` | ✅ pass (0 warnings/errors) |
| Unit + integration | `npm run test` | ✅ **60 passed** (9 files) |
| E2E (Playwright, desktop) | `npm run test:e2e -- --project=desktop` | ✅ **6 passed** |
| Production build | `npm run build` | ✅ pass (12 routes) |
| Seed (mock) | `npm run seed` | ✅ no-op, exits 0 |

## Test coverage summary
- **Unit (domain):** pricing (effective/promo/subtotal/totals/budget), matching
  (normalize/tokenize/score + milk/bread/paper-towels/chicken against catalog),
  progress, status transitions, location confidence, route sort + department
  grouping, provider normalization.
- **Integration:** auth (sign-up/in/out, dup + weak-password rejection, password
  never exposed), list + item CRUD, bulk parsing, product matching, collection +
  collector name, invalid-transition guard, list duplication, shared-list member
  permissions, provider fallback (mock ↔ live selection), `LocationBadge` never
  mislabels estimates as verified.
- **E2E:** sign-up, demo sign-in, protected-route redirect, create list + pick
  store + single/bulk add + match product, Shopping Mode collect + totals update,
  invite member.

## Security / correctness checks
- ✅ No `SUPABASE_SERVICE_ROLE_KEY` / `KROGER_CLIENT_SECRET` referenced in client
  code. Retailer credentials read only in `services/retailers/factory.ts`
  (`server-only`) and never sent to the browser.
- ✅ `.env` / `.env.local` gitignored; only `.env.example` committed.
- ✅ Estimated aisle data never labelled "retailer verified" (enforced in
  `domain/status/location.ts`, asserted in tests).
- ✅ No empty/placeholder routes; all 8 pages render real content.
- ✅ No `any` in application code (one documented test-only cast through `unknown`).
- ✅ App works at mobile (Pixel 7) and desktop widths; no horizontal body scroll.

## Known limitations
See README → "Known limitations".
