# ShadowX Studios — website

Static, bilingual (English + Arabic) marketing site for ShadowX Studios, Abu Dhabi.
No build step, no framework, no npm install. Open the folder in VS Code and edit.

---

## Run it locally

Open `index.html` in a browser — that works for most things, but the Arabic page
and blog use absolute paths (`/assets/...`), so for a proper local preview run a
tiny server from the project root:

```bash
# Python (already on macOS and most Linux)
python3 -m http.server 3000

# or Node
npx serve .
```

Then open <http://localhost:3000>.

In VS Code, the **Live Server** extension also works: right-click `index.html` →
*Open with Live Server*.

---

## What's in here

```
shadowx/
├── index.html                   English home page
├── ar/index.html                Arabic home page (RTL)
├── blog/
│   ├── index.html               Insights listing
│   ├── branding-cost-uae/
│   ├── what-is-in-a-brand-book/
│   ├── bilingual-arabic-english-branding/
│   ├── when-to-rebrand/
│   ├── agency-freelancer-or-studio/
│   └── logo-only-or-full-branding/
├── assets/
│   ├── css/
│   │   ├── main.css             everything — tokens at the top
│   │   ├── blog.css             article + blog index styles
│   │   └── rtl.css              Arabic / right-to-left overrides
│   ├── js/
│   │   ├── config.js            ← phone, email, domain, Supabase keys
│   │   ├── config-ar.js         Arabic chatbot wording
│   │   ├── main.js              nav, reveal, form submission
│   │   └── chatbot.js           the lead chatbot
│   └── img/                     logo files
├── work/                        project images (case studies)
├── supabase/
│   ├── schema.sql               run this once in Supabase
│   └── functions/notify-lead/   optional email notifications
├── robots.txt
├── sitemap.xml
├── site.webmanifest
└── vercel.json
```

---

## Things you'll want to change first

| What | Where |
|---|---|
| Phone, email, domain, Supabase keys | `assets/js/config.js` |
| Brand colours, fonts, spacing | `assets/css/main.css` — section 1, `:root` |
| Prices | `index.html` (pricing section) **and** `ar/index.html` **and** `assets/js/config.js` |
| Project images | replace files in `work/`, keep the same names |
| Your headshot | add `assets/img/ramees.jpg`, then swap the placeholder in the Founder section |
| Chatbot questions | `assets/js/chatbot.js` → the `SCRIPT` array near the top |
| Arabic chatbot questions | `assets/js/config-ar.js` |

Every section in the HTML starts with a comment naming it — search for
`======= PRICING =======` and so on.

---

## Connecting Supabase (stores every lead)

Without this the site still works; the chatbot still hands off to WhatsApp.
Supabase just gives you a permanent record so nothing gets lost.

1. Create a project at <https://supabase.com> (free tier is plenty).
2. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**.
3. **Project Settings → API** → copy the *Project URL* and the *anon public* key.
4. Paste both into `assets/js/config.js`:

```js
supabaseUrl: 'https://xxxxxxxxxxxx.supabase.co',
supabaseAnonKey: 'eyJhbGciOi...',
```

5. Redeploy. New leads appear in **Table Editor → leads**.

The anon key is safe to put in the page: row-level security in the schema lets
the public insert a lead and nothing else. Nobody can read your leads without
signing in.

### Email notifications (optional)

See the comment block at the top of `supabase/functions/notify-lead/index.ts`.
It needs one free Resend API key. Until you set it up, leads are stored and sent
to WhatsApp but not emailed.

---

## Deploying to Vercel

Already connected to GitHub? Push, and Vercel builds automatically.

Fresh setup:

```bash
git init
git add .
git commit -m "ShadowX Studios website"
git branch -M main
git remote add origin https://github.com/<you>/shadowx-studios.git
git push -u origin main
```

Then in Vercel: **Add New → Project → Import** the repo.
Framework preset: **Other**. Build command: *none*. Output directory: `.`

`vercel.json` already sets clean URLs, trailing slashes, cache headers and
security headers.

### When you buy a real domain

1. Add it in Vercel → **Settings → Domains**.
2. Find and replace `https://shadowx-studios.vercel.app` across the project —
   it appears in the canonical tags, `hreflang`, Open Graph tags, JSON-LD,
   `robots.txt` and `sitemap.xml`.
3. Update `domain` in `assets/js/config.js`.

---

## SEO notes

Already done:

- Unique title, description and keywords per page
- Canonical URLs and `hreflang` between English and Arabic
- Open Graph and Twitter card tags
- JSON-LD: `ProfessionalService`, `Person`, `WebSite`, `FAQPage`, `OfferCatalog`
  with real prices, `BlogPosting` on every article
- `areaServed` covering the UAE and the five other GCC countries
- `robots.txt` explicitly allowing the AI crawlers (GPTBot, PerplexityBot,
  ClaudeBot, Google-Extended) — that's how the articles get cited
- `sitemap.xml` with language alternates

Still worth doing yourself:

1. **Create a Google Business Profile** for Abu Dhabi. Biggest single local-SEO
   lever available and it's free.
2. **Submit the sitemap** in Google Search Console and Bing Webmaster Tools.
3. **Keep publishing.** The six articles target the questions GCC founders
   actually search. More of those is what moves rankings.
4. **Collect Google reviews.** They feed both local ranking and trust.

---

## Accessibility and performance

- Keyboard navigable, visible focus rings, `aria-*` on nav, drawer and chat
- Respects `prefers-reduced-motion`
- No render-blocking JS; images lazy-loaded below the fold
- Only external request is Google Fonts

---

© 2026 ShadowX Studios · Abu Dhabi, UAE
