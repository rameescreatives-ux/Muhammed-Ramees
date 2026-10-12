# Coroli website (ADVOC)

Bilingual (EN + AR/RTL) static website. Zero dependencies. See full instructions below.

## Edit
- Settings (contact, links, images, retailers, certs, Supabase, chatbot slot): `src/config.mjs`
- English text: `src/content.en.mjs` | Arabic text: `src/content.ar.mjs`
- Layout/sections: `src/pages.mjs`, header/footer/SEO head: `src/lib.mjs`
- Styles: `public/assets/css/site.css` | Behaviour: `public/assets/js/site.js`
- Images: `public/assets/img/` (Pro cartons already there; swap remote bottle URLs in `config.mjs` for local files when you have them)

## Build
```
node build.mjs                  # output in dist/
SITE_NOINDEX=1 node build.mjs   # preview build (hidden from search engines)
SITE_URL=https://www.corolilife.com TARGET=hostinger node build.mjs   # live build + .htaccess
node scripts/check.mjs          # links / JSON-LD / hreflang checks
```

## Go live on Hostinger
1. Run the live build above (needs Node 18+). 2. Upload the **contents of `dist/`** into `public_html` (File Manager or FTP). 3. Point the domain, enable SSL. 4. Submit `https://www.corolilife.com/sitemap.xml` in Google Search Console.

## Forms (Supabase)
Run `supabase/schema.sql` once in Supabase > SQL Editor. Leads land in table `leads`, subscribers in `subscribers`.

## Chatbot
Paste your free chatbot's embed script URL into `chatEmbedScript` in `src/config.mjs`, rebuild.

## Vercel
`vercel.json` is included. Build command `node build.mjs`, output `dist`. Set `SITE_NOINDEX=1` on preview hosts, remove it for production.
