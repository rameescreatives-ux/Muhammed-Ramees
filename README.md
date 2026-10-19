# Unikai Foods — Website

Rebuild of unikai.com as a bilingual (EN/AR), B2B-led FMCG corporate
platform.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 ·
Supabase · Vercel

---

## Run it

```bash
npm install
cp .env.example .env.local     # works as-is for local dev
npm run dev                    # http://localhost:3000
```

Arabic: <http://localhost:3000/ar>

```bash
npm run build && npm start     # production build
```

> **Next.js 16 note:** middleware is now called **proxy**. Locale routing
> lives in `src/proxy.ts`, not `middleware.ts`.

---

## Where things are

```
src/
  app/
    [locale]/            every page; locale is "en" or "ar"
      page.tsx           homepage
      products/          catalogue → range → sub-range → product
      about/ quality/ export/ news/ careers/ contact/
      investor-relations/
    api/
      chat/              strict-RAG sales assistant
      enquiry/           lead capture + department routing
      apply/             job applications with CV upload
    sitemap.ts robots.ts globals.css   ← design tokens live in globals.css
  components/
    layout/   Header (mega menu, EN/AR switch), Footer, Analytics, Consent
    home/     Hero slider, range grid, strengths, export band
    forms/    EnquiryForm, ApplicationForm
    chat/     Chatbot
    ir/       IR document library
    ui/       Button, Container, PackShot, PageHeader, Logo
  content/    ← EDIT CONTENT HERE
    site.ts      company copy, contacts, board, management, CEO letter
    products.ts  4 ranges, 24 sub-ranges, products
    news.ts      news & disclosures
    ir.ts        investor-relations document library
    types.ts     shared types
  lib/
    i18n.ts      translations + locale helpers
    seo.ts       metadata, hreflang, JSON-LD schema
    redirects.ts 301 map from every legacy URL
    knowledge.ts the ONLY facts the chatbot may use
    leads.ts     lead persistence + department routing
    nav.ts       navigation structure
  proxy.ts       locale routing (EN at root, AR under /ar)
supabase/
  schema.sql     full database schema with row-level security
```

---

## Common edits

**Change text on a page** → the page file in `src/app/[locale]/…`, or
`src/content/site.ts` for company copy.

**Add a product** → `src/content/products.ts`. Add an entry to
`products[]` with `range`, `subRange` and `slug`. The page, the sitemap
entry and the Product schema all generate themselves.

**Add a nav item** → `src/lib/nav.ts`, plus a label in `src/lib/i18n.ts`.

**Change brand colours** → `src/app/globals.css`, the `@theme` block at
the top. `--color-brand-red` and `--color-brand-navy`.

**Replace the logo** → drop the SVG in `public/brand/` and update the
`src` in `src/components/ui/Logo.tsx`. Nothing else changes.

**Add a translation** → the `ui` object in `src/lib/i18n.ts`. Every
user-facing string is `{ en, ar }`; Arabic falls back to English when
empty, so a missing translation never renders a blank.

**Add a redirect** → `src/lib/redirects.ts`. It is the single source of
truth and `next.config.ts` reads from it.

---

## Two rules that matter

1. **Never invent company facts.** Certifications, export markets,
   nutritionals, pack sizes, prices — if Unikai has not published it, the
   UI says "available on request". A wrong Halal or allergen claim on an
   FMCG site is a liability, not a cosmetic issue. See `CONTENT-GAPS.md`.

2. **Do not loosen the chatbot prompt.** `src/app/api/chat/route.ts`
   forbids stating prices, stock, delivery, export markets,
   certifications and allergens, and answers only from
   `src/lib/knowledge.ts`. Keep that boundary if you edit it.

---

See `DEPLOYMENT.md` for environment variables, the go-live cutover plan
and known limitations. See `CONTENT-GAPS.md` for what Unikai still needs
to supply.
