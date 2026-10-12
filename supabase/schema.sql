-- ============================================================================
-- SHADOWX STUDIOS — SUPABASE SCHEMA  (already applied to the live project)
-- ----------------------------------------------------------------------------
-- Project : npnjdhdzckvmagtiwqnp
-- Table   : public.shadowx_leads
--
-- This file is a record of what is deployed. You only need to run it if you
-- ever move to a fresh Supabase project.
--
-- NOTE: this Supabase project is shared with other sites. There is a separate
-- `leads` table belonging to a different project — do not use it. ShadowX
-- leads go into `shadowx_leads`.
-- ============================================================================

create table if not exists public.shadowx_leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  form        text not null,          -- quote | call | contact-form | chatbot | website
  name        text,
  company     text,
  email       text,
  phone       text,
  service     text,
  budget      text,
  timeline    text,
  message     text,
  locale      text default 'en',      -- en | ar
  source_url  text,
  user_agent  text,

  status      text not null default 'new',   -- new | contacted | quoted | won | lost
  notes       text,

  constraint shadowx_leads_form_check
    check (form in ('quote','call','contact-form','chatbot','website'))
);

comment on table public.shadowx_leads is
  'Lead submissions from the ShadowX Studios website and chatbot. Insert-only for anonymous visitors.';

create index if not exists shadowx_leads_created_idx on public.shadowx_leads (created_at desc);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
-- The website ships the public "anon" key in config.js, which anyone can read
-- out of the page source. So anon may INSERT a new lead and nothing else —
-- it cannot read, update or delete. Reading requires being signed in.
--
-- The WITH CHECK below is deliberately strict:
--   * status must be 'new'  -> a visitor cannot mark their own lead as "won"
--   * form must be a real form on the site
--   * they must leave either a valid-looking email or a usable phone number
--
-- IMPORTANT: if you add a new form or a new `form` value in the JavaScript,
-- add it to this list too, or RLS will silently reject those leads.
-- ----------------------------------------------------------------------------

alter table public.shadowx_leads enable row level security;

create policy "anon can submit from the new site"
  on public.shadowx_leads
  for insert
  to anon
  with check (
    status = 'new'
    and form in ('quote','call','contact-form','chatbot','website')
    and (
      (email is not null and email like '%_@_%.__%')
      or (phone is not null and length(btrim(phone)) >= 7)
    )
  );

create policy "authenticated can read leads"
  on public.shadowx_leads
  for select
  to authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- Handy view for reviewing recent enquiries
-- ----------------------------------------------------------------------------
create or replace view public.shadowx_leads_recent
with (security_invoker = true) as
  select id, created_at, form, name, company, email, phone,
         service, budget, timeline, locale, status
  from public.shadowx_leads
  where created_at > now() - interval '90 days'
  order by created_at desc;
