# Unikai Foods — Deployment & Handover

Next.js 16 (App Router) · Tailwind v4 · Supabase · Vercel

---

## 1. Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical origin. Drives canonicals, hreflang, sitemap, schema. Set to `https://www.unikai.com` at cutover. |
| `SUPABASE_URL` | for persistence | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | for persistence | **Server only.** Never expose with a `NEXT_PUBLIC_` prefix. |
| `ANTHROPIC_API_KEY` | for the chatbot | Enables natural-language RAG. Without it the assistant still answers, but extractively. |
| `ANTHROPIC_MODEL` | no | Defaults to `claude-sonnet-5-5`. |
| `RESEND_API_KEY` | for email alerts | Transactional email for lead notifications. |
| `NOTIFY_FROM` | with Resend | Verified sender address. |
| `NEXT_PUBLIC_GA_ID` | no | GA4 measurement ID. Omit and no analytics renders at all. |
| `NEXT_PUBLIC_SHOW_GAPS` | no | `true` surfaces the "content pending from Unikai" notices. Use on staging, never in production. |

The site runs with **none** of these set — it degrades rather than breaks.
Leads are logged to the server console when Supabase is absent, so nothing
is silently lost while credentials are pending.

---

## 2. Deploying

### First time

1. Connect GitHub to Vercel (Vercel → Settings → Login Connections → GitHub).
2. Import `rameescreatives-ux/Muhammed-Ramees`, branch `unikai-website`.
3. Framework preset: **Next.js** (auto-detected). No build overrides needed.
4. Add the environment variables above.
5. Deploy.

Thereafter every push to `unikai-website` deploys automatically.

### Database

```bash
# Paste supabase/schema.sql into the Supabase SQL editor, or:
supabase db push
```

Then create the three storage buckets if the SQL did not (`media`,
`documents` public; `applications` **private**).

---

## 3. Go-live cutover

The current unikai.com is a live listed-company site. The plan is
zero-downtime with an instant rollback.

1. **Review on the Vercel preview URL.** Vercel Authentication is on by
   default, so the staging site is not publicly reachable or indexable.
2. **Lower DNS TTL to 300s** at least 24h before cutover.
3. Set `NEXT_PUBLIC_SITE_URL=https://www.unikai.com`.
4. Add `unikai.com` and `www.unikai.com` in Vercel → Domains.
5. **Keep the old WordPress host running, untouched, for 30 days.** It is
   the rollback: revert DNS and the legacy site is back in minutes.
6. Switch DNS. Verify the redirect map (section 5) before announcing.
7. Submit `https://www.unikai.com/sitemap.xml` in Search Console and watch
   Coverage for two weeks.

---

## 4. What the legacy site was doing wrong

Recorded here because several of these are the reason specific decisions
were made, and they should be verified as fixed after cutover.

- **WooCommerce 3.5.10** (2019) powering a catalogue with no cart, prices
  or checkout. Removed entirely — this is not a shop.
- **Every form was dead.** `[contact-form-7 id="24"]` rendered as literal
  text on every page, as did the Instagram, Facebook, Twitter and YouTube
  feed shortcodes. The site captured **zero** enquiries.
- **Raw PHP leaked into the HTML** on `/our-brands/` —
  `echo get_term_link( $subcat )` printed five times above the tiles.
- **Footer links pointed at the current page.** "In the News" and
  "Investor Relations" resolved to whatever page you were on.
- **Duplicate ice-cream taxonomy.** `/product-category/ice-cream/` (linked
  from the brands page) held one mislabelled tile; the real eight-sub-range
  catalogue sat at `/product-category/unikai-ice-cream-range/`, unlinked.
  Both now 301 to `/products/ice-cream`.
- **Insecure IR link.** The Investor Relations parent pointed at
  `http://` (not https) `/overview/`.
- **No LinkedIn** anywhere, and the X link was malformed
  (`twitter.com/@Unikai_Foods`). Corrected to `x.com/Unikai_Foods`.
  LinkedIn is still missing — see CONTENT-GAPS.md.

---

## 5. Redirect map

`src/lib/redirects.ts` is the single source of truth and is consumed by
`next.config.ts`. It covers every legacy URL found during the audit:
all page routes, all 4 ranges, all 24 sub-ranges, the two live product
pages, the percent-encoded Arabic IR slug, and WooCommerce scaffolding
(`/cart`, `/checkout`, `/my-account`, `/shop`).

Verify after cutover:

```bash
for p in /our-brands /who-we-are /get-in-touch /overview \
         /product-category/dairy /product-category/unikai-ice-cream-range \
         /integrated-results /results-and-presentations; do
  echo -n "$p -> "
  curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "https://www.unikai.com$p"
done
```

Every line must be `308` plus a destination. A `200` means the redirect
is missing; a loop means source and destination match.

---

## 6. Architecture notes

**Locale routing.** English is served at the root (`/about`), Arabic under
`/ar/about`. `src/proxy.ts` rewrites unprefixed paths to `/en/...`
internally. Root-level English is deliberate: unikai.com's existing
equity sits on unprefixed URLs, and an `/en` redirect would add a hop to
every legacy path.

**Content layer.** `src/content/*` holds the catalogue, company copy, news
and IR library as typed data. Swapping these modules for Supabase queries
is a contained change — the components take the same shapes either way.

**Chatbot safety.** `src/app/api/chat/route.ts` passes only retrieved
passages from `src/lib/knowledge.ts` as context, and the system prompt
forbids stating prices, stock, delivery, export markets, certifications,
ingredients or allergens. For a food manufacturer a confidently invented
allergen claim is a liability, not a UX quirk. Keep this constraint if the
prompt is ever edited.

**Content gaps are visible, not invented.** Where Unikai publishes nothing
— certifications, nutritionals, pack sizes, export markets — the UI
renders an honest "available on request" state rather than placeholder
data. See CONTENT-GAPS.md.

---

## 7. Known limitations

- **Rate limiting is in-memory** (`src/lib/rate-limit.ts`). It does not
  survive cold starts or coordinate across serverless instances. Move to
  Upstash Redis or Vercel KV before significant traffic.
- **Legacy images are hot-linked** from `www.unikai.com/wp-content/uploads`
  via `next/image`. They are optimised and cached, but the old host must
  stay up until the media is migrated to Supabase Storage. Do this before
  decommissioning WordPress.
- **Privacy and cookie policies are templates.** They describe what the
  site actually does, which is the honest starting point, but they require
  legal review against UAE PDPL before go-live.
- **The admin dashboard is not built.** The schema, RLS policies, storage
  buckets and API routes are in place; the UI is the next phase.
- **The logo is a raster placeholder.** `public/brand/unikai-logo.png` is
  the supplied avatar, cleaned and alpha-trimmed. Replace with the official
  SVG when Unikai provide it — no other change is required.
