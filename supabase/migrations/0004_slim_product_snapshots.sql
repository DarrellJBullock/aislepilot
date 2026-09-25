-- Kroger's API terms don't allow long-lived copies of its data, so we keep
-- only a slim product snapshot and re-fetch prices (see PRICE_TTL_MS in
-- packages/domain/src/pricing). This migration cleans up what was stored
-- before that change. The app already ignores stale prices when it reads,
-- so it is safe to run before or after deploying.

-- Never read or written by the app.
drop table if exists public.products_cache cascade;

-- Existing list items: drop fields we no longer keep, and the prices
-- (they have no pricedAt, so the app would discard them anyway).
update public.shopping_list_items
set product = product
  - array['description', 'metadata', 'regularPrice', 'currentPrice', 'promotionalPrice', 'sourceUpdatedAt']
where product is not null;

-- Saved products keep no prices at all.
update public.saved_products
set product = (product
  - array['description', 'metadata', 'regularPrice', 'currentPrice', 'promotionalPrice', 'sourceUpdatedAt', 'pricedAt'])
  || '{"availability":"unknown"}'::jsonb;
