# Supabase Setup (optional)

AislePilot runs fully without Supabase (local mock mode). Follow this only to
enable real authentication and cross-device persistence.

## 1. Create a project
Create a project at https://supabase.com and copy from **Project Settings → API**:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only; never in the browser)

Put them in `.env.local` (copy from `.env.example`).

## 2. Apply migrations
Using the Supabase CLI:
```bash
supabase link --project-ref <your-ref>
supabase db push          # applies supabase/migrations/*.sql
```
Or paste `supabase/migrations/0001_init.sql` then `0002_rls.sql` into the SQL
editor and run them in order.

**What they create**
- Tables: `profiles`, `retailers`, `stores`, `store_departments`,
  `shopping_lists`, `shopping_list_members`, `shopping_list_items`,
  `products_cache`, `store_product_locations`, `purchase_history`,
  `saved_products` — all UUID PKs with `created_at` / `updated_at`, FKs, indexes.
- Row Level Security on every user table: a list is visible only to its owner and
  invited members (`is_list_member()`); history and saved products are owner-only;
  reference data is read-only to authenticated users.
- A trigger that inserts a `profiles` row when an `auth.users` record is created.

## 3. Seed reference data
```bash
npm run seed
```
Upserts the demo retailers, stores, departments, product cache, and estimated
locations from `src/data/mock`. With no Supabase env set, it's a safe no-op.

## 4. Auth
Enable **Email** auth in Authentication → Providers. For local dev you may turn
off email confirmations so sign-up logs in immediately.

## Notes
- The service role key bypasses RLS — use it only in server scripts (`scripts/seed.ts`).
- To wire the app's persistence to Supabase, replace the setters in
  `src/lib/store/provider.tsx` with async calls to the matching tables; the pure
  ops in `state.ts` map 1:1 to rows.
