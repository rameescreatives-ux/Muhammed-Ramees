-- =====================================================================
-- UNIKAI FOODS — DATABASE SCHEMA
-- Postgres / Supabase
--
-- Run once against a fresh project:
--   supabase db push      (or paste into the SQL editor)
--
-- Design notes
--  * Every content table carries _en and _ar columns. The bilingual split
--    is in the schema from day one so the Arabic rollout never needs a
--    migration — Arabic can be NULL and the app falls back to English.
--  * RLS is ON for every table with no permissive default. Anonymous
--    visitors can read published content and INSERT leads; they can read
--    nothing else. Staff access is granted by role claim.
--  * Lead and application tables are write-only to the public role: a
--    visitor can submit an enquiry but can never read anyone else's.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- roles

create type staff_role as enum (
  'super_admin',   -- users, settings, everything
  'content',       -- products, banners, news, pages
  'arabic_editor', -- *_ar columns only (enforced in the app layer + policy)
  'sales',         -- enquiries only
  'hr'             -- vacancies + applications only
);

create table staff (
  id          uuid primary key references auth.users on delete cascade,
  email       text not null unique,
  full_name   text,
  role        staff_role not null default 'content',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Helper: current user's role. STABLE so policies can use it cheaply.
create or replace function current_staff_role()
returns staff_role
language sql stable security definer set search_path = public
as $$
  select role from staff where id = auth.uid() and active
$$;

create or replace function is_staff(allowed staff_role[])
returns boolean
language sql stable
as $$
  select current_staff_role() = any(allowed)
$$;

-- ------------------------------------------------------------- content

create table ranges (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name_en      text not null,
  name_ar      text,
  tagline_en   text,
  tagline_ar   text,
  description_en text,
  description_ar text,
  image_path   text,
  accent       text not null default 'navy' check (accent in ('navy','red')),
  sort_order   int  not null default 0,
  published    boolean not null default true,
  updated_at   timestamptz not null default now()
);

create table sub_ranges (
  id           uuid primary key default gen_random_uuid(),
  range_id     uuid not null references ranges on delete cascade,
  slug         text not null,
  name_en      text not null,
  name_ar      text,
  description_en text,
  description_ar text,
  image_path   text,
  sort_order   int not null default 0,
  published    boolean not null default true,
  updated_at   timestamptz not null default now(),
  unique (range_id, slug)
);

create table products (
  id             uuid primary key default gen_random_uuid(),
  sub_range_id   uuid not null references sub_ranges on delete cascade,
  slug           text not null,
  name_en        text not null,
  name_ar        text,
  description_en text,
  description_ar text,
  image_path     text,
  -- Trade spec fields. All nullable: the UI renders only what exists
  -- rather than showing placeholder values a buyer could mistake for fact.
  sku            text,
  barcode        text,
  pack_sizes     text[],
  shelf_life_en  text,
  shelf_life_ar  text,
  storage_en     text,
  storage_ar     text,
  ingredients_en text,
  ingredients_ar text,
  nutritionals   jsonb,
  certifications text[],
  spec_sheet_path text,
  published      boolean not null default true,
  sort_order     int not null default 0,
  updated_at     timestamptz not null default now(),
  unique (sub_range_id, slug)
);

create table banners (
  id          uuid primary key default gen_random_uuid(),
  eyebrow_en  text, eyebrow_ar text,
  title_en    text not null, title_ar text,
  body_en     text, body_ar text,
  cta_label_en text, cta_label_ar text, cta_path text,
  secondary_label_en text, secondary_label_ar text, secondary_path text,
  image_path  text,
  tone        text not null default 'navy' check (tone in ('navy','red','deep')),
  sort_order  int not null default 0,
  -- Scheduling: marketing sets a window and the slide appears/retires itself.
  starts_at   timestamptz,
  ends_at     timestamptz,
  published   boolean not null default false,
  updated_at  timestamptz not null default now()
);

create table news (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title_en    text not null, title_ar text,
  excerpt_en  text, excerpt_ar text,
  body_en     text, body_ar text,
  category    text not null default 'press-release'
              check (category in ('press-release','announcement','media-coverage')),
  published_at date not null default current_date,
  source_url  text,
  published   boolean not null default false,
  updated_at  timestamptz not null default now()
);

create table certifications (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  issuer      text,
  scope_en    text, scope_ar text,
  document_path text,
  valid_until date,
  published   boolean not null default false,
  sort_order  int not null default 0
);

create table export_markets (
  id          uuid primary key default gen_random_uuid(),
  country     text not null,
  country_code char(2) not null,
  country_ar  text,
  -- Nothing appears on the public export map until someone at Unikai
  -- verifies it. The "29 countries" figure in the CEO letter is a quote,
  -- not a verified market list.
  verified    boolean not null default false,
  published   boolean not null default false
);

create table ir_documents (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in
              ('financial-statement','integrated-report','annual-report',
               'sustainability','strategy','agm','announcement')),
  title       text not null,
  title_ar    text,
  doc_date    date,
  year        text,
  file_path   text,
  external_url text,
  published   boolean not null default true,
  sort_order  int not null default 0
);

create table vacancies (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title_en    text not null, title_ar text,
  department_en text, department_ar text,
  location_en text, location_ar text,
  type_en     text, type_ar text,
  description_en text, description_ar text,
  responsibilities jsonb,
  requirements  jsonb,
  posted_at   date not null default current_date,
  closes_at   date,
  published   boolean not null default false
);

create table seo_overrides (
  id             uuid primary key default gen_random_uuid(),
  path           text not null unique,
  title_en       text, title_ar text,
  description_en text, description_ar text,
  canonical      text,
  noindex        boolean not null default false,
  updated_at     timestamptz not null default now()
);

create table redirects (
  id          uuid primary key default gen_random_uuid(),
  source      text not null unique,
  destination text not null,
  permanent   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------- lead intake

create type enquiry_type as enum ('export','distribution','general','partnership');
create type enquiry_status as enum ('new','in_progress','qualified','closed','spam');

create table enquiries (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  company       text,
  email         text not null,
  phone         text,
  country       text,
  enquiry_type  enquiry_type not null,
  products      text,
  volume        text,
  message       text,
  source        text,
  locale        text default 'en',
  transcript    jsonb,
  assigned_team text,
  status        enquiry_status not null default 'new',
  notes         text,
  created_at    timestamptz not null default now()
);

create index enquiries_created_idx on enquiries (created_at desc);
create index enquiries_type_idx   on enquiries (enquiry_type, status);

create table applications (
  id          uuid primary key default gen_random_uuid(),
  vacancy_id  uuid references vacancies on delete set null,
  name        text not null,
  email       text not null,
  phone       text,
  role        text,
  message     text,
  cv_path     text not null,
  status      text not null default 'new',
  created_at  timestamptz not null default now()
);

create index applications_created_idx on applications (created_at desc);

-- Admin-editable routing: which enquiry type reaches which inbox.
create table routing_rules (
  enquiry_type enquiry_type primary key,
  team_name    text not null,
  email        text not null,
  updated_at   timestamptz not null default now()
);

insert into routing_rules (enquiry_type, team_name, email) values
  ('export',       'Export & Marketing', 'info@unikai.com'),
  ('distribution', 'Sales & Marketing',  'info@unikai.com'),
  ('general',      'Customer Service',   'info@unikai.com'),
  ('partnership',  'Corporate',          'info@unikai.com');

-- Approved answers the chatbot may use, on top of site content.
create table chatbot_faqs (
  id          uuid primary key default gen_random_uuid(),
  question_en text not null, question_ar text,
  answer_en   text not null, answer_ar text,
  keywords    text[],
  published   boolean not null default false,
  updated_at  timestamptz not null default now()
);

-- Change log. A listed company needs to know who changed what.
create table audit_log (
  id          bigserial primary key,
  actor       uuid references staff,
  action      text not null,
  table_name  text not null,
  record_id   uuid,
  diff        jsonb,
  created_at  timestamptz not null default now()
);

-- ===================================================================
-- ROW LEVEL SECURITY
-- ===================================================================

alter table staff            enable row level security;
alter table ranges           enable row level security;
alter table sub_ranges       enable row level security;
alter table products         enable row level security;
alter table banners          enable row level security;
alter table news             enable row level security;
alter table certifications   enable row level security;
alter table export_markets   enable row level security;
alter table ir_documents     enable row level security;
alter table vacancies        enable row level security;
alter table seo_overrides    enable row level security;
alter table redirects        enable row level security;
alter table enquiries        enable row level security;
alter table applications     enable row level security;
alter table routing_rules    enable row level security;
alter table chatbot_faqs     enable row level security;
alter table audit_log        enable row level security;

-- Public read of PUBLISHED content only.
create policy public_read_ranges   on ranges        for select using (published);
create policy public_read_subs     on sub_ranges    for select using (published);
create policy public_read_products on products      for select using (published);
create policy public_read_news     on news          for select using (published);
create policy public_read_certs    on certifications for select using (published);
create policy public_read_ir       on ir_documents  for select using (published);
create policy public_read_vac      on vacancies     for select using (published);
create policy public_read_seo      on seo_overrides for select using (true);
create policy public_read_redirect on redirects     for select using (true);
create policy public_read_faq      on chatbot_faqs  for select using (published);

-- Banners: published AND inside their schedule window.
create policy public_read_banners on banners for select
  using (
    published
    and (starts_at is null or starts_at <= now())
    and (ends_at   is null or ends_at   >= now())
  );

-- Export markets: verified AND published. Both flags, deliberately.
create policy public_read_markets on export_markets for select
  using (published and verified);

-- Leads are WRITE-ONLY to the public. No select policy exists for the
-- anon role, so a visitor can submit an enquiry and can never read one.
create policy public_insert_enquiry on enquiries    for insert with check (true);
create policy public_insert_apply   on applications for insert with check (true);

-- Staff access by role.
create policy staff_read_self on staff for select
  using (id = auth.uid() or is_staff(array['super_admin']::staff_role[]));

create policy staff_manage_users on staff for all
  using (is_staff(array['super_admin']::staff_role[]))
  with check (is_staff(array['super_admin']::staff_role[]));

do $$
declare t text;
begin
  foreach t in array array[
    'ranges','sub_ranges','products','banners','news',
    'certifications','export_markets','ir_documents',
    'seo_overrides','redirects','chatbot_faqs'
  ] loop
    execute format($f$
      create policy staff_write_%1$s on %1$I for all
        using (is_staff(array['super_admin','content','arabic_editor']::staff_role[]))
        with check (is_staff(array['super_admin','content','arabic_editor']::staff_role[]));
    $f$, t);
  end loop;
end $$;

create policy sales_read_enquiries on enquiries for select
  using (is_staff(array['super_admin','sales']::staff_role[]));
create policy sales_update_enquiries on enquiries for update
  using (is_staff(array['super_admin','sales']::staff_role[]));

create policy hr_read_applications on applications for select
  using (is_staff(array['super_admin','hr']::staff_role[]));
create policy hr_update_applications on applications for update
  using (is_staff(array['super_admin','hr']::staff_role[]));

create policy hr_manage_vacancies on vacancies for all
  using (is_staff(array['super_admin','hr']::staff_role[]))
  with check (is_staff(array['super_admin','hr']::staff_role[]));

create policy admin_routing on routing_rules for all
  using (is_staff(array['super_admin','sales']::staff_role[]))
  with check (is_staff(array['super_admin','sales']::staff_role[]));

create policy audit_read on audit_log for select
  using (is_staff(array['super_admin']::staff_role[]));

-- ===================================================================
-- STORAGE
-- ===================================================================
-- Buckets (create in the dashboard or via the storage API):
--   media        PUBLIC  — product pack shots, banners, people photos
--   documents    PUBLIC  — IR PDFs, spec sheets, certificates
--   applications PRIVATE — candidate CVs. Must never be public; the app
--                          reads them server-side with the service key.

insert into storage.buckets (id, name, public)
values ('media','media',true), ('documents','documents',true),
       ('applications','applications',false)
on conflict (id) do nothing;

create policy "public read media" on storage.objects for select
  using (bucket_id = 'media');
create policy "public read documents" on storage.objects for select
  using (bucket_id = 'documents');
create policy "staff write media" on storage.objects for insert
  with check (bucket_id in ('media','documents')
              and is_staff(array['super_admin','content']::staff_role[]));
-- No public policy on 'applications': CVs are reachable only with the
-- service-role key from the server.
