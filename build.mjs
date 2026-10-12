// Builds the whole website into ./dist  ->  node build.mjs
// Env: SITE_URL (final domain), SITE_NOINDEX=1 (preview hosts), TARGET=hostinger (also writes .htaccess)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, PRODUCTS } from './src/config.mjs';
import en from './src/content.en.mjs';
import ar from './src/content.ar.mjs';
import { renderPage, abs, fmt } from './src/lib.mjs';
import { buildPages, notFound } from './src/pages.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const L = { en, ar };

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
if (fs.existsSync(path.join(ROOT, 'public'))) fs.cpSync(path.join(ROOT, 'public'), DIST, { recursive: true });

const write = (rel, data) => {
  const f = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, data);
};
const outFile = (lang, p) => (lang === 'ar' ? 'ar' : '') + p + 'index.html';

const sitemapEntries = [];
for (const lang of ['en', 'ar']) {
  const c = L[lang], other = L[lang === 'en' ? 'ar' : 'en'];
  other.lang = lang === 'en' ? 'ar' : 'en';
  const pages = buildPages(lang, c);
  for (const page of pages) {
    write(outFile(lang, page.path), renderPage({ lang, c, other, page }));
    if (lang === 'en' && !page.noindex) sitemapEntries.push(page.path);
  }
  const nf = notFound(lang, c);
  write(lang === 'ar' ? 'ar/404.html' : '404.html', renderPage({ lang, c, other, page: nf }));
}

// sitemap with hreflang alternates
const today = new Date().toISOString().slice(0, 10);
const urlBlock = (lang, p) => `<url><loc>${abs(lang, p)}</loc><lastmod>${today}</lastmod>` +
  `<xhtml:link rel="alternate" hreflang="en" href="${abs('en', p)}"/><xhtml:link rel="alternate" hreflang="ar" href="${abs('ar', p)}"/><xhtml:link rel="alternate" hreflang="x-default" href="${abs('en', p)}"/></url>`;
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  sitemapEntries.flatMap((p) => [urlBlock('en', p), urlBlock('ar', p)]).join('\n') + `\n</urlset>\n`);

// robots.txt
const aiBots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'Googlebot'];
write('robots.txt', SITE.noindex
  ? `User-agent: *\nDisallow: /\n`
  : `User-agent: *\nAllow: /\n\n${aiBots.map((b) => `User-agent: ${b}\nAllow: /\n`).join('\n')}\nSitemap: ${SITE.url}/sitemap.xml\n`);

// llms.txt (plain-language summary for AI assistants)
const e = L.en;
const prodLines = PRODUCTS.map((p) => `- [${e.products[p.slug].name}](${abs('en', '/coroli/' + p.slug + '/')}): ${e.products[p.slug].lead} Sizes: ${p.sizes.map(([v, u]) => v + (u === 'ml' ? ' ml' : ' L')).join(', ')}.`).join('\n');
write('llms.txt', `# Coroli

> ${fmt(e.llms.summary)}

Coroli is the consumer brand. ADVOC (${SITE.company}) is the producer. Brand message: "Winning Hearts Since ${SITE.founded}".
Contact: ${SITE.email} | ${SITE.phone} | WhatsApp ${SITE.whatsappDisplay} | ${SITE.address.street}, Abu Dhabi, UAE.

## Products (retail)
${prodLines}

## Coroli Professional (business)
- [Coroli Professional](${abs('en', '/coroli-pro/')}): Margarine 15 kg, Shortening BD40 25 kg, ICF 30PL 25 kg, and bulk sunflower, corn and canola oil in 20 L and 210 L drums. Minimum order quantities apply.

## Where to buy
- [Where to buy](${abs('en', '/where-to-buy/')}): Noon, Amazon.ae, Lulu, Carrefour, Union Coop.

## Guides and recipes
${e.health.guides.map((g) => `- [${g.name}](${abs('en', '/health-lifestyle/' + g.slug + '/')}): ${g.desc}`).join('\n')}
${e.recipes.items.map((r) => `- [${r.name}](${abs('en', '/recipes/' + r.slug + '/')}): ${r.desc}`).join('\n')}

## Languages
- English: ${abs('en', '/')}
- Arabic: ${abs('ar', '/')}
`);

// Hostinger / Apache rules
if (process.env.TARGET === 'hostinger') {
  write('.htaccess', `Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
RewriteEngine On
# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
# Bare domain -> www (edit if you prefer the bare domain)
RewriteCond %{HTTP_HOST} ^corolilife\\.com$ [NC]
RewriteRule ^ https://www.corolilife.com%{REQUEST_URI} [L,R=301]
# Add trailing slash to folders
RewriteCond %{REQUEST_FILENAME} -d
RewriteCond %{REQUEST_URI} !/$
RewriteRule ^(.*)$ /$1/ [L,R=301]
</IfModule>

<IfModule mod_headers.c>
Header set X-Content-Type-Options "nosniff"
Header set Referrer-Policy "strict-origin-when-cross-origin"
Header set X-Frame-Options "SAMEORIGIN"
<FilesMatch "\\.(css|js|jpg|jpeg|png|webp|svg|woff2)$">
Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml text/xml
</IfModule>
`);
}

const count = (d) => fs.readdirSync(d, { recursive: true }).filter((f) => f.endsWith('.html')).length;
console.log(`Built ${count(DIST)} HTML pages -> dist/  (url: ${SITE.url}${SITE.noindex ? ', NOINDEX preview' : ''})`);
