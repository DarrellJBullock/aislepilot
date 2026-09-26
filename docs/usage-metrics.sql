-- Usage metrics straight from Supabase (run in the SQL editor). These count
-- what people do in the app without any extra tracking. Test accounts (yours)
-- are included, so filter them out with an email condition if needed.

-- 1) Sign-ups per week
select date_trunc('week', created_at)::date as week, count(*) as new_users
from public.profiles
group by 1 order by 1 desc;

-- 2) How many lists each person has made (2nd/3rd list = they came back)
select p.email, count(l.id) as lists, min(l.created_at)::date as first_list, max(l.created_at)::date as last_list
from public.profiles p
left join public.shopping_lists l on l.owner_id = p.id
group by p.email order by lists desc;

-- 3) Completed shopping trips per person (the real "it worked" signal)
select p.email, count(h.id) as trips, round(avg(h.total), 2) as avg_total, max(h.purchased_at)::date as last_trip
from public.profiles p
left join public.purchase_history h on h.user_id = p.id
group by p.email order by trips desc;

-- 4) Weekly active users: people who created or updated an item that week
select date_trunc('week', i.updated_at)::date as week, count(distinct l.owner_id) as active_owners
from public.shopping_list_items i
join public.shopping_lists l on l.id = i.list_id
group by 1 order by 1 desc;

-- 5) How far people get: lists -> matched items -> trips
select
  (select count(*) from public.shopping_lists) as lists,
  (select count(*) from public.shopping_list_items where product is not null) as matched_items,
  (select count(*) from public.purchase_history) as trips;

-- 6) Which stores/banners people pick
select s.banner, count(*) as lists
from public.shopping_lists l
join public.stores s on s.id = l.store_id
group by 1 order by 2 desc;
