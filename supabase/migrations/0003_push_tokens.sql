-- Device push tokens for shared-list notifications.
-- Written by a signed-in client for its own device; read only by the
-- service-role client in /api/notifications/notify, which needs every
-- recipient's token — deliberately not something RLS grants a user.

create table if not exists public.device_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null,
  platform text not null default 'unknown' check (platform in ('ios','android','web','unknown')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (token)
);
create index if not exists device_push_tokens_user_idx on public.device_push_tokens(user_id);

drop trigger if exists set_updated_at on public.device_push_tokens;
create trigger set_updated_at before update on public.device_push_tokens
  for each row execute function public.set_updated_at();

alter table public.device_push_tokens enable row level security;

-- A user can register, refresh, and revoke only their own device tokens.
create policy push_tokens_self on public.device_push_tokens
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
