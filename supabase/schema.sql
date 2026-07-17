-- AislePilot full schema — paste into Supabase → SQL Editor → Run.
-- Combines migrations 0001_init.sql + 0002_rls.sql.

-- AislePilot initial schema
-- UUID PKs, created_at/updated_at, foreign keys, indexes, and RLS.
-- The app runs in local mock mode without Supabase; these migrations enable the
-- optional production (persisted, multi-user) path.

create extension if not exists "pgcrypto";

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- retailers ----------
create table if not exists public.retailers (
  id text primary key,
  name text not null,
  demo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- stores ----------
create table if not exists public.stores (
  id text primary key,
  retailer text not null references public.retailers(id) on delete cascade,
  name text not null,
  banner text not null,
  address text,
  city text,
  state text,
  zip text,
  demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists stores_retailer_idx on public.stores(retailer);

-- ---------- store_departments ----------
create table if not exists public.store_departments (
  id uuid primary key default gen_random_uuid(),
  store_id text not null references public.stores(id) on delete cascade,
  name text not null,
  route_order int not null default 999,
  created_at timestamptz not null default now()
);
create index if not exists store_departments_store_idx on public.store_departments(store_id);

-- ---------- shopping_lists ----------
create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  notes text,
  budget numeric(10,2),
  store_id text references public.stores(id) on delete set null,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists shopping_lists_owner_idx on public.shopping_lists(owner_id);

-- ---------- shopping_list_members ----------
create table if not exists public.shopping_list_members (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  role text not null default 'member' check (role in ('owner','member')),
  joined_at timestamptz not null default now(),
  unique (list_id, email)
);
create index if not exists list_members_list_idx on public.shopping_list_members(list_id);
create index if not exists list_members_user_idx on public.shopping_list_members(user_id);

-- ---------- shopping_list_items ----------
create table if not exists public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists(id) on delete cascade,
  raw_text text not null,
  quantity int not null default 1 check (quantity >= 1),
  notes text,
  priority text not null default 'normal' check (priority in ('low','normal','high')),
  status text not null default 'unmatched'
    check (status in ('unmatched','matched','available','collected','unavailable','skipped','purchased')),
  product jsonb,
  substitute_for uuid,
  collected_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists list_items_list_idx on public.shopping_list_items(list_id);
create index if not exists list_items_status_idx on public.shopping_list_items(status);

-- ---------- products_cache ----------
create table if not exists public.products_cache (
  id text primary key,
  store_id text references public.stores(id) on delete cascade,
  external_id text not null,
  payload jsonb not null,
  source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_cache_store_idx on public.products_cache(store_id);

-- ---------- store_product_locations ----------
create table if not exists public.store_product_locations (
  id uuid primary key default gen_random_uuid(),
  store_id text not null references public.stores(id) on delete cascade,
  external_id text not null,
  aisle text,
  section text,
  route_order int,
  location_source text not null default 'category_estimate'
    check (location_source in ('retailer_verified','aislepilot_mapped','community_verified','category_estimate','unknown')),
  updated_at timestamptz not null default now(),
  unique (store_id, external_id)
);

-- ---------- purchase_history ----------
create table if not exists public.purchase_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  list_id uuid references public.shopping_lists(id) on delete set null,
  store_id text references public.stores(id) on delete set null,
  total numeric(10,2) not null default 0,
  item_count int not null default 0,
  purchased_at timestamptz not null default now()
);
create index if not exists purchase_history_user_idx on public.purchase_history(user_id);

-- ---------- saved_products ----------
create table if not exists public.saved_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product jsonb not null,
  saved_at timestamptz not null default now()
);
create index if not exists saved_products_user_idx on public.saved_products(user_id);

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','stores','shopping_lists','shopping_list_items','products_cache'
  ] loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I; create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end$$;

-- ============ RLS ============

-- Row Level Security: owners and shared members can access a list; nobody else.

alter table public.profiles enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_list_members enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.purchase_history enable row level security;
alter table public.saved_products enable row level security;

-- Reference data is world-readable, writable only by service role.
alter table public.retailers enable row level security;
alter table public.stores enable row level security;
alter table public.store_departments enable row level security;
alter table public.products_cache enable row level security;
alter table public.store_product_locations enable row level security;

-- Helper: is the current user a member (or owner) of a list?
create or replace function public.is_list_member(target_list uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.shopping_lists l
    where l.id = target_list and l.owner_id = auth.uid()
  ) or exists (
    select 1 from public.shopping_list_members m
    where m.list_id = target_list and m.user_id = auth.uid()
  );
$$;

-- profiles: a user sees and edits only their own profile.
create policy profiles_self_select on public.profiles
  for select using (id = auth.uid());
create policy profiles_self_upsert on public.profiles
  for insert with check (id = auth.uid());
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid());

-- shopping_lists
create policy lists_member_select on public.shopping_lists
  for select using (public.is_list_member(id));
create policy lists_owner_insert on public.shopping_lists
  for insert with check (owner_id = auth.uid());
create policy lists_owner_update on public.shopping_lists
  for update using (owner_id = auth.uid());
create policy lists_owner_delete on public.shopping_lists
  for delete using (owner_id = auth.uid());

-- shopping_list_members
create policy members_select on public.shopping_list_members
  for select using (public.is_list_member(list_id));
create policy members_owner_write on public.shopping_list_members
  for all using (
    exists (select 1 from public.shopping_lists l where l.id = list_id and l.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.shopping_lists l where l.id = list_id and l.owner_id = auth.uid())
  );

-- shopping_list_items: any member can read/write items on a shared list.
create policy items_select on public.shopping_list_items
  for select using (public.is_list_member(list_id));
create policy items_write on public.shopping_list_items
  for all using (public.is_list_member(list_id))
  with check (public.is_list_member(list_id));

-- purchase_history / saved_products: owner-only.
create policy history_self on public.purchase_history
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy saved_self on public.saved_products
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Reference data: readable by any authenticated user.
create policy retailers_read on public.retailers for select using (true);
create policy stores_read on public.stores for select using (true);
create policy departments_read on public.store_departments for select using (true);
create policy products_cache_read on public.products_cache for select using (true);
create policy locations_read on public.store_product_locations for select using (true);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
