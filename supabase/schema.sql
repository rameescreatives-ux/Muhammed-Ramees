-- Coroli website: lead + newsletter tables.
-- Run once in Supabase > SQL Editor. The website can only INSERT (cannot read), so visitors never see other people's data.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('b2b','general')),
  name text not null check (char_length(name) between 1 and 120),
  company text check (char_length(company) <= 160),
  email text not null check (char_length(email) between 5 and 160 and email like '%@%'),
  phone text check (char_length(phone) <= 40),
  product_interest text check (char_length(product_interest) <= 120),
  quantity text check (char_length(quantity) <= 80),
  message text check (char_length(message) <= 2000),
  lang text check (lang in ('en','ar')),
  source_page text check (char_length(source_page) <= 200)
);

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique check (char_length(email) between 5 and 160 and email like '%@%'),
  lang text check (lang in ('en','ar'))
);

alter table public.leads enable row level security;
alter table public.subscribers enable row level security;

drop policy if exists "anon can insert leads" on public.leads;
create policy "anon can insert leads" on public.leads for insert to anon with check (true);
drop policy if exists "anon can insert subscribers" on public.subscribers;
create policy "anon can insert subscribers" on public.subscribers for insert to anon with check (true);

grant insert on public.leads to anon;
grant insert on public.subscribers to anon;
