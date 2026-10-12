// Shared helpers + page shell (head, header, footer, chat). Edit layout here.
import { SITE, PRODUCTS, RETAILERS } from './config.mjs';

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const fmt = (s) => String(s ?? '').replaceAll('{year}', SITE.founded).replaceAll('{email}', SITE.email);
export const href = (lang, p) => (lang === 'ar' ? '/ar' : '') + p;
export const abs = (lang, p) => SITE.url + href(lang, p);
export const imgUrl = (key) => SITE.img[key];
export const absImg = (key) => { const u = SITE.img[key] || ''; return u.startsWith('http') ? u : SITE.url + u; };

export const sizeLabel = ([v, u], lang) => lang === 'ar' ? `${v} ${u === 'ml' ? 'مل' : 'لتر'}` : `${v} ${u === 'ml' ? 'ml' : 'L'}`;

export const RETAILER_AR = { 'Noon': 'نون', 'Amazon.ae': 'أمازون الإمارات', 'Lulu Hypermarket': 'لولو هايبرماركت', 'Carrefour': 'كارفور', 'Union Coop': 'اتحاد التعاونية' };

export const jsonld = (arr) => arr.filter(Boolean).map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');

export function orgLd(c) {
  return {
    '@context': 'https://schema.org', '@type': 'Organization', '@id': SITE.url + '/#org',
    name: 'Coroli', alternateName: ['ADVOC', 'كورولي'], legalName: SITE.company, url: SITE.url + '/',
    logo: SITE.img.logo, foundingDate: String(SITE.founded), description: c.llms.summary,
    parentOrganization: { '@type': 'Organization', name: SITE.company, url: SITE.advocUrl },
    address: { '@type': 'PostalAddress', postOfficeBoxNumber: SITE.address.street.replace('P.O. Box ', ''), addressLocality: SITE.address.city, addressCountry: SITE.address.country },
    contactPoint: [{ '@type': 'ContactPoint', telephone: SITE.phone, email: SITE.email, contactType: 'customer service', areaServed: ['AE', 'SA', 'KW', 'QA', 'BH', 'OM'], availableLanguage: ['en', 'ar'] }],
    sameAs: Object.values(SITE.social),
  };
}
export const siteLd = () => ({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE.url + '/#website', url: SITE.url + '/', name: 'Coroli', inLanguage: ['en', 'ar'], publisher: { '@id': SITE.url + '/#org' } });
export const crumbLd = (lang, crumbs) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: crumbs.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(lang, p) })),
});
export const faqLd = (items) => items && items.length ? ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}) : null;

// ---------- shared UI blocks ----------
export const heading = (eyebrow, title, intro, center = false) =>
  `<div class="sec-head${center ? ' center' : ''} reveal">${eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ''}<h2>${esc(title)}</h2>${intro ? `<p>${esc(intro)}</p>` : ''}</div>`;

export const faqBlock = (items, c) => !items || !items.length ? '' :
  `<section class="sec"><div class="wrap narrow">${heading('', c.ui.faq, '')}<div class="faq">${items.map((f) => `<details class="reveal"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div></div></section>`;

export const picture = (key, alt, cls = '', eager = false) =>
  `<img class="${cls}" src="${esc(imgUrl(key))}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="600" height="600">`;

export function buyButtons(p, c) {
  const l = ({ noon: 'https://www.noon.com/uae-en/search/?q=' + encodeURIComponent('coroli ' + p.term), amazon: 'https://www.amazon.ae/s?k=' + encodeURIComponent('coroli ' + p.term) });
  return `<a class="btn btn-red" href="${esc(l.noon)}" target="_blank" rel="noopener nofollow">${esc(c.ui.buyNoon)}</a><a class="btn btn-dark" href="${esc(l.amazon)}" target="_blank" rel="noopener nofollow">${esc(c.ui.buyAmazon)}</a>`;
}

export const sizeChips = (p, lang) => `<ul class="chips">${p.sizes.map((s) => `<li>${esc(sizeLabel(s, lang))}</li>`).join('')}</ul>`;

export function productCard(p, c, lang) {
  const t = c.products[p.slug];
  return `<article class="card pcard reveal">
  <a class="pimg" href="${href(lang, '/coroli/' + p.slug + '/')}" aria-label="${esc(t.name)}">${picture(p.img, t.name)}</a>
  <div class="pbody"><h3><a href="${href(lang, '/coroli/' + p.slug + '/')}">${esc(t.short)}</a></h3><p class="tag">${esc(t.tagline)}</p>${sizeChips(p, lang)}
  <div class="pact"><a class="btn btn-ghost" href="${href(lang, '/coroli/' + p.slug + '/')}">${esc(c.ui.viewProduct)}</a><a class="btn btn-red" href="${esc('https://www.noon.com/uae-en/search/?q=' + encodeURIComponent('coroli ' + p.term))}" target="_blank" rel="noopener nofollow">${esc(c.ui.buyNoon)}</a></div></div></article>`;
}

export function leadForm({ kind, c, lang, page }) {
  const f = c.ui.form;
  const b2b = kind === 'b2b';
  const opts = b2b ? c.pro.productOptions : c.contact.topics;
  const optLabel = b2b ? f.interest : c.contact.topic;
  return `<form class="lead-form" data-kind="${kind}" data-page="${esc(page)}" novalidate>
  <div class="grid2">
    <label>${esc(f.name)}*<input name="name" required maxlength="120" autocomplete="name"></label>
    ${b2b ? `<label>${esc(f.company)}<input name="company" maxlength="160" autocomplete="organization"></label>` : `<label>${esc(f.phone)}<input name="phone" maxlength="40" autocomplete="tel" inputmode="tel"></label>`}
    <label>${esc(f.email)}*<input name="email" type="email" required maxlength="160" autocomplete="email"></label>
    ${b2b ? `<label>${esc(f.phone)}<input name="phone" maxlength="40" autocomplete="tel" inputmode="tel"></label>` : ''}
    <label>${esc(optLabel)}<select name="product_interest"><option value="">${esc(f.choose)}</option>${opts.map((o) => `<option>${esc(o)}</option>`).join('')}</select></label>
    ${b2b ? `<label>${esc(f.quantity)}<input name="quantity" maxlength="80" placeholder="${lang === 'ar' ? 'مثال: 2 طن شهرياً' : 'e.g. 2 tonnes per month'}"></label>` : ''}
  </div>
  <label>${esc(f.message)}<textarea name="message" rows="4" maxlength="2000"></textarea></label>
  <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
  <p class="fine">${esc(f.consent)}</p>
  <button class="btn btn-red" type="submit">${esc(f.send)}</button>
  <p class="form-msg" role="status" aria-live="polite"></p>
</form>`;
}

// ---------- page shell ----------
const GFONTS = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700;800&display=swap';

export function renderPage({ lang, c, other, page }) {
  const { path, seo, body, ld = [], crumbs, ogImage, noindex } = page;
  const dir = c.dir;
  const canonical = abs(lang, path);
  const alts = ['en', 'ar'].map((l) => `<link rel="alternate" hreflang="${l}" href="${abs(l, path)}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${abs('en', path)}">`;
  const og = ogImage ? absImg(ogImage) : absImg('sunflower');
  const robots = (SITE.noindex || noindex) ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1';
  const graph = [...ld];
  if (crumbs && crumbs.length > 1) graph.push(crumbLd(lang, crumbs));
  const t = esc(seo.title), d = esc(fmt(seo.desc));

  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t}</title>
<meta name="description" content="${d}">
<meta name="robots" content="${robots}">
<meta name="theme-color" content="#D71920">
<link rel="canonical" href="${canonical}">
${alts}
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="Coroli">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${esc(og)}">
<meta property="og:locale" content="${c.locale}">
<meta property="og:locale:alternate" content="${other.locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${esc(og)}">
<link rel="icon" href="${esc(SITE.img.favicon)}">
<link rel="apple-touch-icon" href="${esc(SITE.img.favicon)}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${GFONTS}">
<link rel="stylesheet" href="/assets/css/site.css">
<script>document.documentElement.classList.add('js')</script>
${jsonld(graph)}
</head>
<body class="${lang === 'ar' ? 'is-ar' : 'is-en'}">
<a class="skip" href="#main">${esc(c.ui.skip)}</a>
${header(lang, c, other, path)}
<main id="main">
${body}
</main>
${footer(lang, c)}
${chat(lang, c)}
<script>window.COROLI=${JSON.stringify({ lang, sb: SITE.supabase, msg: c.ui.form, news: { ok: c.ui.newsletterOk, err: c.ui.newsletterErr }, chat: SITE.chatEmbedScript })}</script>
<script src="/assets/js/site.js" defer></script>
</body>
</html>`;
}

function header(lang, c, other, path) {
  const h = (p) => href(lang, p);
  const sub = PRODUCTS.map((p) => `<li><a href="${h('/coroli/' + p.slug + '/')}">${esc(c.products[p.slug].short)}</a></li>`).join('');
  const cur = (p) => (path === p ? ' aria-current="page"' : '');
  return `<header class="site-header" id="top">
<div class="wrap bar">
  <a class="brand" href="${h('/')}" aria-label="Coroli"><img src="${esc(SITE.img.logo)}" alt="Coroli" width="150" height="48"></a>
  <nav class="nav" id="nav" aria-label="${lang === 'ar' ? 'التنقل الرئيسي' : 'Main'}">
    <ul>
      <li><a href="${h('/')}"${cur('/')}>${esc(c.nav.home)}</a></li>
      <li><a href="${h('/about/')}"${cur('/about/')}>${esc(c.nav.about)}</a></li>
      <li class="has-sub"><button type="button" aria-expanded="false" aria-haspopup="true">${esc(c.nav.products)}<span class="caret" aria-hidden="true"></span></button>
        <div class="sub"><div class="sub-col"><a class="sub-title" href="${h('/coroli/')}">${esc(c.nav.coroli)}</a><ul>${sub}</ul></div>
        <div class="sub-col"><a class="sub-title" href="${h('/coroli-pro/')}">${esc(c.nav.pro)}</a><ul><li><a href="${h('/coroli-pro/')}">${esc(c.pro.items.margarine.name)}</a></li><li><a href="${h('/coroli-pro/')}">${esc(c.pro.items.shortening.name)}</a></li><li><a href="${h('/coroli-pro/')}">${esc(c.pro.items.icf.name)}</a></li><li><a href="${h('/coroli-pro/')}">${esc(c.pro.bulkTitle)}</a></li></ul></div></div></li>
      <li><a href="${h('/health-lifestyle/')}"${cur('/health-lifestyle/')}>${esc(c.nav.health)}</a></li>
      <li><a href="${h('/where-to-buy/')}"${cur('/where-to-buy/')}>${esc(c.nav.buy)}</a></li>
      <li><a href="${h('/recipes/')}"${cur('/recipes/')}>${esc(c.nav.recipes)}</a></li>
    </ul>
  </nav>
  <div class="bar-end">
    <a class="lang" href="${href(other.lang, path)}" hreflang="${other.lang}" lang="${other.lang}" title="${esc(c.ui.langTitle)}">${esc(c.ui.langName)}</a>
    <a class="advoc" href="${esc(SITE.advocUrl)}" target="_blank" rel="noopener" aria-label="ADVOC"><img src="${esc(SITE.img.advoc)}" alt="ADVOC" width="96" height="40"></a>
    <button class="burger" type="button" aria-controls="nav" aria-expanded="false" aria-label="${esc(c.ui.menu)}"><span></span><span></span><span></span></button>
  </div>
</div>
</header>`;
}

function footer(lang, c) {
  const h = (p) => href(lang, p);
  return `<footer class="site-footer">
<div class="wrap">
  <div class="news reveal"><div><h3>${esc(c.ui.newsletterTitle)}</h3><p>${esc(c.ui.newsletterText)}</p></div>
    <form class="news-form" novalidate><input type="email" name="email" required maxlength="160" placeholder="${esc(c.ui.newsletterEmail)}" aria-label="${esc(c.ui.newsletterEmail)}" autocomplete="email"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="btn btn-red" type="submit">${esc(c.ui.newsletterBtn)}</button><p class="form-msg" role="status" aria-live="polite"></p></form></div>
  <div class="fgrid">
    <div><img class="flogo" src="${esc(SITE.img.logo)}" alt="Coroli" width="140" height="44" loading="lazy"><p>${esc(c.ui.footerAbout)}</p>
      <a class="fadvoc" href="${esc(SITE.advocUrl)}" target="_blank" rel="noopener"><span>${esc(c.ui.by)}</span><img src="${esc(SITE.img.advoc)}" alt="ADVOC" width="90" height="38" loading="lazy"></a></div>
    <div><h4>${esc(c.ui.footerExplore)}</h4><ul>
      <li><a href="${h('/coroli/')}">${esc(c.nav.coroli)}</a></li><li><a href="${h('/coroli-pro/')}">${esc(c.nav.pro)}</a></li>
      <li><a href="${h('/health-lifestyle/')}">${esc(c.nav.health)}</a></li><li><a href="${h('/recipes/')}">${esc(c.nav.recipes)}</a></li>
      <li><a href="${h('/where-to-buy/')}">${esc(c.nav.buy)}</a></li><li><a href="${h('/about/')}">${esc(c.nav.about)}</a></li><li><a href="${h('/contact/')}">${esc(c.nav.contact)}</a></li></ul></div>
    <div><h4>${esc(c.ui.footerContact)}</h4><ul class="contact-list">
      <li><a href="tel:${SITE.phoneHref}" dir="ltr">${esc(SITE.phone)}</a></li>
      <li><a href="mailto:${SITE.email}">${esc(SITE.email)}</a></li>
      <li><a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener">${esc(c.ui.whatsapp)}</a></li>
      <li>${esc(SITE.address.street)}, ${lang === 'ar' ? 'أبوظبي، الإمارات' : 'Abu Dhabi, UAE'}</li></ul></div>
    <div><h4>${esc(c.ui.footerFollow)}</h4><ul>
      <li><a href="${esc(SITE.social.instagram)}" target="_blank" rel="noopener me">Instagram</a></li>
      <li><a href="${esc(SITE.social.facebook)}" target="_blank" rel="noopener me">Facebook</a></li>
      <li><a href="${esc(SITE.social.youtube)}" target="_blank" rel="noopener me">YouTube</a></li></ul></div>
  </div>
  <div class="fbottom"><span>© ${new Date().getFullYear()} Coroli · ${esc(SITE.company)}. ${esc(c.ui.rights)}</span><a href="${h('/privacy/')}">${esc(c.ui.privacy)}</a></div>
</div>
</footer>`;
}

function chat(lang, c) {
  return `<div class="chat" id="chat">
  <div class="chat-panel" id="chat-panel" hidden role="dialog" aria-label="${esc(c.ui.chatTitle)}">
    <div class="chat-head"><strong>${esc(c.ui.chatTitle)}</strong><button type="button" class="chat-x" aria-label="${esc(c.ui.close)}">×</button></div>
    <p>${esc(c.ui.chatNote)}</p>
    <a class="btn btn-red" href="${href(lang, '/where-to-buy/')}">${esc(c.ui.chatBuy)}</a>
    <a class="btn btn-dark" href="${href(lang, '/coroli-pro/')}#enquiry">${esc(c.ui.chatPro)}</a>
    <a class="btn btn-ghost" href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener">${esc(c.ui.chatWa)}</a>
    <div id="chatbot-slot"><!-- Free chatbot embed: set chatEmbedScript in src/config.mjs --></div>
  </div>
  <button type="button" class="chat-btn" aria-expanded="false" aria-controls="chat-panel"><span class="dot"></span>${esc(c.ui.chatBtn)}</button>
</div>`;
}
