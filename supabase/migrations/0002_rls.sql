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
