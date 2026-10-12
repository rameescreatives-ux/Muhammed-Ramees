// Page bodies. Layout/sections are defined here; wording lives in content.en.mjs / content.ar.mjs.
import { SITE, PRODUCTS, PRO, BULK, RETAILERS, CERTS } from './config.mjs';
import { esc, fmt, href, abs, absImg, imgUrl, sizeLabel, heading, faqBlock, faqLd, picture, buyButtons, sizeChips, productCard, leadForm, orgLd, siteLd, RETAILER_AR } from './lib.mjs';

const CERT_AR = { 'Halal': 'حلال', 'Emirates Quality Mark': 'علامة الإمارات للجودة', 'ADAFSA A grade': 'درجة A من أديفسا' };
const certName = (k, lang) => (lang === 'ar' && CERT_AR[k]) || k;
const retailerName = (n, lang) => (lang === 'ar' && RETAILER_AR[n]) || n;
const today = new Date().toISOString().slice(0, 10);

const pageHero = (h1, lead, crumbs, lang, c, extra = '', bg = '') =>
  `<section class="page-hero${bg ? ' has-bg' : ''}"${bg ? ` style="--bg:url(/assets/img/art/${bg}.svg)"` : ''}><div class="wrap">${crumbNav(crumbs, lang)}<h1 class="reveal">${esc(fmt(h1))}</h1><p class="lead reveal">${esc(fmt(lead))}</p>${extra}</div></section>`;

function crumbNav(crumbs, lang) {
  if (!crumbs || crumbs.length < 2) return '';
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs.map(([n, p], i) => i === crumbs.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${href(lang, p)}">${esc(n)}</a></li>`).join('')}</ol></nav>`;
}

const recipeImg = (r, eager = false) => `<img class="cover" src="/assets/img/recipes/${r.slug}.svg" alt="${esc(r.name)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="800" height="500">`;
const recipeCard = (r, c, lang) => {
  const p = PRODUCTS.find((x) => x.slug === r.product);
  return `<article class="card rcard reveal"><a class="rimg" href="${href(lang, '/recipes/' + r.slug + '/')}" aria-label="${esc(r.name)}">${recipeImg(r)}</a>
  <div class="rbody"><span class="pill">${esc(r.cat)}</span><h3><a href="${href(lang, '/recipes/' + r.slug + '/')}">${esc(r.name)}</a></h3><p>${esc(r.desc)}</p>
  <p class="meta">${esc(c.ui.time)}: ${r.time} ${esc(c.ui.minutes)} · ${esc(c.ui.serves)}: ${r.serves}</p></div></article>`;
};
const guideCard = (g, c, lang) => `<article class="card gcard reveal"><h3><a href="${href(lang, '/health-lifestyle/' + g.slug + '/')}">${esc(g.name)}</a></h3><p>${esc(g.desc)}</p><a class="more" href="${href(lang, '/health-lifestyle/' + g.slug + '/')}">${esc(c.ui.readMore)} <span aria-hidden="true">→</span></a></article>`;

const certBadges = (lang) => `<ul class="certs">${CERTS.map((k) => `<li>${esc(certName(k, lang))}</li>`).join('')}</ul>`;

const retailerCards = (lang, c) => `<div class="rgrid">${RETAILERS.map((r) => `<a class="rcard-l reveal" href="${esc(r.href)}" target="_blank" rel="noopener nofollow"><strong>${esc(retailerName(r.name, lang))}</strong><span>${esc(c.ui.buyNote)}</span></a>`).join('')}</div>`;

const skuRows = (c, lang) => {
  const retail = PRODUCTS.map((p) => `<tr><th scope="row"><a href="${href(lang, '/coroli/' + p.slug + '/')}">${esc(c.products[p.slug].short)}</a></th><td>${sizeChips(p, lang)}</td></tr>`);
  const pro = PRO.map((p) => `<tr class="pro-row"><th scope="row"><a href="${href(lang, '/coroli-pro/')}">${esc(c.pro.items[p.slug].name)}</a></th><td><ul class="chips"><li>${esc(c.pro.items[p.slug].size)}</li></ul></td></tr>`);
  const bulk = `<tr class="pro-row"><th scope="row"><a href="${href(lang, '/coroli-pro/')}">${esc(c.pro.bulkTitle)}</a></th><td><ul class="chips"><li>${esc(c.pro.bulkSizes)}</li></ul></td></tr>`;
  return [...retail, ...pro, bulk].join('');
};

const ST = 'fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const TILE_ICONS = {
  sunflower: `<svg viewBox="0 0 32 32" ${ST}><circle cx="16" cy="16" r="4.2"/>${Array.from({ length: 10 }, (_, i) => `<ellipse cx="16" cy="6.6" rx="2.3" ry="3.6" transform="rotate(${i * 36} 16 16)"/>`).join('')}</svg>`,
  corn: `<svg viewBox="0 0 32 32" ${ST}><ellipse cx="16" cy="13" rx="5" ry="9"/><path d="M16 4v18M12 9h8M11.5 14h9"/><path d="M16 29c-7-1-9-8-9-13 4 2 7 5 9 9M16 29c7-1 9-8 9-13-4 2-7 5-9 9"/></svg>`,
  canola: `<svg viewBox="0 0 32 32" ${ST}><circle cx="16" cy="9" r="3.4"/><circle cx="9.5" cy="15" r="3.4"/><circle cx="22.5" cy="15" r="3.4"/><circle cx="16" cy="15" r="1.4"/><path d="M16 18.5V29M16 24c-3-1-4-3-4-5M16 25c3-1 4-3 4-5"/></svg>`,
  fats: `<svg viewBox="0 0 32 32" ${ST}><path d="M4 14l5-5h19l-5 5z"/><rect x="4" y="14" width="19" height="11" rx="1.5"/><path d="M23 14l5-5v11l-5 5M8 19h11"/></svg>`,
};

// ------------------------------------------------------------------ HOME
function home(lang, c) {
  const hero = c.home.hero;
  const BGS = ['hero-sunflower', 'hero-corn', 'hero-canola', 'hero-fats'];
  const slides = hero.map((s, i) => `<div class="slide s${i + 1}${i === 0 ? ' is-active' : ''}" style="--bg:url(/assets/img/art/${BGS[i]}.svg)" role="group" aria-roledescription="slide" aria-label="${esc(c.ui.slide)} ${i + 1} / ${hero.length}">
    <div class="wrap slide-in"><div class="stext"><span class="eyebrow light">${esc(s.eyebrow)}</span>${i === 0 ? '<h1>' : '<h2>'}${esc(fmt(s.h))}${i === 0 ? '</h1>' : '</h2>'}<p>${esc(fmt(s.p))}</p><a class="btn btn-white" href="${href(lang, s.href)}">${esc(s.cta)}</a></div></div></div>`).join('');
  const dots = hero.map((_, i) => `<button type="button" class="dot${i === 0 ? ' is-active' : ''}" data-i="${i}" aria-label="${esc(c.ui.slide)} ${i + 1}"></button>`).join('');
  const tiles = c.home.tiles.map((t) => `<a class="tile" href="${href(lang, t.href)}"><span class="ti">${TILE_ICONS[t.k]}</span><span class="tt">${esc(t.t)}</span><span class="ta" aria-hidden="true"></span></a>`).join('');
  const first4 = PRODUCTS.slice(0, 4), rest = PRODUCTS.slice(4);

  const body = `
<section class="hero" aria-roledescription="carousel" aria-label="Coroli">
  <div class="stage">
    <div class="slides">${slides}</div>
    <button type="button" class="hnav prev" aria-label="${esc(c.ui.sliderPrev)}"><span aria-hidden="true"></span></button>
    <button type="button" class="hnav next" aria-label="${esc(c.ui.sliderNext)}"><span aria-hidden="true"></span></button>
    <div class="dots">${dots}</div>
  </div>
  <div class="wrap"><nav class="tiles" aria-label="${esc(c.home.rangeTitle)}">${tiles}</nav></div>
</section>

<section class="sec" id="range"><div class="wrap">
  ${heading(c.home.rangeEyebrow, c.home.rangeTitle, c.home.rangeIntro, true)}
  <div class="pgrid">${first4.map((p) => productCard(p, c, lang)).join('')}</div>
  <div class="more-wrap" id="more" hidden>
    <div class="pgrid">${rest.map((p) => productCard(p, c, lang)).join('')}</div>
    <h3 class="sku-title">${esc(c.range.tableTitle)}</h3>
    <div class="table-wrap"><table class="sku"><thead><tr><th>${esc(c.range.tableProduct)}</th><th>${esc(c.range.tableSizes)}</th></tr></thead><tbody>${skuRows(c, lang)}</tbody></table></div>
  </div>
  <div class="center"><a class="btn btn-dark" href="${href(lang, '/coroli/')}" id="more-btn" data-more="${esc(c.ui.showMore)}" data-less="${esc(c.ui.showLess)}" aria-expanded="false" aria-controls="more">${esc(c.ui.showMore)}</a></div>
</div></section>

<section class="sec dark"><div class="wrap">
  ${heading('', c.home.whyTitle, '', true)}
  <div class="why">${c.home.why.map((w, i) => `<div class="why-i reveal"><span class="num">0${i + 1}</span><h3>${esc(w.h)}</h3><p>${esc(fmt(w.p))}</p></div>`).join('')}</div>
</div></section>

<section class="sec certs-sec"><div class="wrap center">
  <h2 class="reveal">${esc(c.ui.certsTitle)}</h2><p class="reveal">${esc(c.ui.certsText)}</p>${certBadges(lang)}
</div></section>

<section class="sec pro-sec"><div class="wrap split">
  <div class="reveal"><span class="eyebrow">${esc(c.home.proEyebrow)}</span><h2>${esc(c.home.proTitle)}</h2><p>${esc(c.home.proText)}</p>
    <ul class="ticks">${c.home.proPoints.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <div class="row"><a class="btn btn-red" href="${href(lang, '/coroli-pro/')}#enquiry">${esc(c.ui.enquire)}</a><a class="btn btn-ghost" href="${href(lang, '/coroli-pro/')}">${esc(c.ui.readMore)}</a></div></div>
  <div class="pro-imgs reveal">${PRO.map((p) => picture(p.img, c.pro.items[p.slug].name + ' ' + c.pro.items[p.slug].size)).join('')}</div>
</div></section>

<section class="sec"><div class="wrap">
  ${heading('', c.home.recipesTitle, c.home.recipesIntro)}
  <div class="cgrid">${c.recipes.items.slice(0, 3).map((r) => recipeCard(r, c, lang)).join('')}</div>
  <div class="center"><a class="btn btn-ghost" href="${href(lang, '/recipes/')}">${esc(c.ui.allRecipes)}</a></div>
</div></section>

<section class="sec grey"><div class="wrap">
  ${heading('', c.home.guidesTitle, c.home.guidesIntro)}
  <div class="cgrid">${c.health.guides.slice(0, 3).map((g) => guideCard(g, c, lang)).join('')}</div>
</div></section>

<section class="sec"><div class="wrap">
  ${heading('', c.home.buyTitle, c.home.buyIntro, true)}
  ${retailerCards(lang, c)}
  <div class="center"><a class="btn btn-red" href="${href(lang, '/where-to-buy/')}">${esc(c.nav.buy)}</a></div>
</div></section>

${faqBlock(c.home.faq, c).replace(c.ui.faq, c.home.faqTitle)}`;

  return {
    path: '/', seo: c.home.seo, body, crumbs: [[c.ui.breadcrumbHome, '/']], ogImage: 'sunflower',
    ld: [orgLd(c), siteLd(), faqLd(c.home.faq)],
  };
}

// ------------------------------------------------------------------ ABOUT
function about(lang, c) {
  const crumbs = [[c.ui.breadcrumbHome, '/'], [c.nav.about, '/about/']];
  const body = `${pageHero(c.about.h1, c.about.lead, crumbs, lang, c, '', 'about')}
<section class="sec"><div class="wrap narrow prose">${c.about.sections.map((s) => `<div class="reveal"><h2>${esc(s.h)}</h2><p>${esc(fmt(s.p))}</p></div>`).join('')}</div></section>
<section class="sec certs-sec"><div class="wrap center"><h2 class="reveal">${esc(c.about.certsTitle)}</h2><p class="reveal">${esc(c.about.certsText)}</p>${certBadges(lang)}<p><a class="more" href="${esc(c.about.certsUrl)}" target="_blank" rel="noopener">${esc(c.about.certsLink)} <span aria-hidden="true">→</span></a></p></div></section>`;
  return { path: '/about/', seo: c.about.seo, body, crumbs, ld: [{ '@context': 'https://schema.org', '@type': 'AboutPage', name: c.about.h1, url: abs(lang, '/about/'), about: { '@id': SITE.url + '/#org' } }] };
}

// ------------------------------------------------------------------ RANGE
function range(lang, c) {
  const crumbs = [[c.ui.breadcrumbHome, '/'], [c.nav.coroli, '/coroli/']];
  const body = `${pageHero(c.range.h1, c.range.lead, crumbs, lang, c, '', 'products')}
<section class="sec"><div class="wrap"><div class="pgrid">${PRODUCTS.map((p) => productCard(p, c, lang)).join('')}</div></div></section>
<section class="sec grey"><div class="wrap narrow"><h2 class="reveal">${esc(c.range.tableTitle)}</h2><div class="table-wrap reveal"><table class="sku"><thead><tr><th>${esc(c.range.tableProduct)}</th><th>${esc(c.range.tableSizes)}</th></tr></thead><tbody>${skuRows(c, lang)}</tbody></table></div></div></section>
${faqBlock(c.range.faq, c)}`;
  const itemList = { '@context': 'https://schema.org', '@type': 'ItemList', name: c.range.h1, itemListElement: PRODUCTS.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(lang, '/coroli/' + p.slug + '/'), name: c.products[p.slug].name })) };
  return { path: '/coroli/', seo: c.range.seo, body, crumbs, ld: [itemList, faqLd(c.range.faq)] };
}

// ------------------------------------------------------------------ PRODUCT
function product(lang, c, p) {
  const t = c.products[p.slug];
  const path = '/coroli/' + p.slug + '/';
  const crumbs = [[c.ui.breadcrumbHome, '/'], [c.nav.coroli, '/coroli/'], [t.short, path]];
  const sizes = p.sizes.map((s) => sizeLabel(s, lang)).join(lang === 'ar' ? '، ' : ', ');
  const quick = lang === 'ar'
    ? `${t.name} منتج من ${SITE.companyAr} (أدفوك) في أبوظبي بالإمارات. الأحجام: ${sizes}. متوفر على نون وأمازون الإمارات وفي السوبرماركت في الإمارات.`
    : `${t.name} is made by ${SITE.company} (ADVOC) in Abu Dhabi, UAE. Sizes: ${sizes}. Available on Noon, Amazon.ae and in UAE supermarkets.`;
  const recs = c.recipes.items.filter((r) => r.product === p.slug);
  const others = PRODUCTS.filter((x) => x.slug !== p.slug);
  const guideSlugs = ['best-cooking-oil-for-frying', ['sunflower', 'corn', 'canola'].includes(p.slug) ? 'sunflower-vs-corn-vs-canola-oil' : p.slug === 'ghee' ? 'cow-ghee-vs-cooking-oil' : 'how-to-choose-and-store-cooking-oil'];
  const guides = c.health.guides.filter((g) => guideSlugs.includes(g.slug));
  const bulk = BULK.find((b) => b.slug === p.slug);

  const body = `<section class="pdp"><div class="wrap">${crumbNav(crumbs, lang)}
  <div class="pdp-grid">
    <div class="pdp-img reveal">${picture(p.img, t.name, '', true)}</div>
    <div class="pdp-info">
      <span class="eyebrow reveal">${esc(t.tagline)}</span>
      <h1 class="reveal">${esc(t.h1)}</h1>
      <p class="lead reveal">${esc(t.lead)}</p>
      <p class="quick reveal">${esc(quick)}</p>
      <h2 class="mini">${esc(c.ui.sizes)}</h2>${sizeChips(p, lang)}
      ${bulk ? `<p class="note">${esc(c.pro.bulkSizes)} · <a href="${href(lang, '/coroli-pro/')}">${esc(c.nav.pro)}</a></p>` : ''}
      ${p.slug === 'ghee' ? `<p class="note">${esc(c.ui.customSize)}</p>` : ''}
      <h2 class="mini">${esc(c.ui.buyHere)}</h2>
      <div class="row">${buyButtons(p, c)}</div><p class="note">${esc(c.ui.buyNote)}</p>
    </div>
  </div></div></section>
<section class="sec grey"><div class="wrap split">
  <div class="reveal"><h2>${esc(c.ui.keyFacts)}</h2><ul class="ticks">${t.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>
  <div class="reveal"><h2>${esc(c.ui.howToUse)}</h2><p>${esc(t.use)}</p></div>
</div></section>
${recs.length ? `<section class="sec"><div class="wrap">${heading('', c.ui.related, '')}<div class="cgrid">${recs.map((r) => recipeCard(r, c, lang)).join('')}</div></div></section>` : ''}
${faqBlock(t.faq, c)}
<section class="sec grey"><div class="wrap">${heading('', c.nav.health, '')}<div class="cgrid">${guides.map((g) => guideCard(g, c, lang)).join('')}</div></div></section>
<section class="sec"><div class="wrap">${heading('', c.nav.coroli, '')}<div class="pgrid">${others.slice(0, 4).map((x) => productCard(x, c, lang)).join('')}</div></div></section>`;

  const ld = [{
    '@context': 'https://schema.org', '@type': 'Product', name: t.name, description: fmt(t.seo.desc), url: abs(lang, path),
    image: [absImg(p.img)], category: p.kind === 'ghee' ? 'Ghee' : 'Cooking oil', inLanguage: lang,
    brand: { '@type': 'Brand', name: 'Coroli' }, manufacturer: { '@id': SITE.url + '/#org' },
    countryOfOrigin: { '@type': 'Country', name: 'United Arab Emirates' },
  }, faqLd(t.faq)];
  return { path, seo: t.seo, body, crumbs, ld, ogImage: p.img, ogType: 'product' };
}

// ------------------------------------------------------------------ PRO
function pro(lang, c) {
  const crumbs = [[c.ui.breadcrumbHome, '/'], [c.nav.pro, '/coroli-pro/']];
  const cartons = PRO.map((p) => {
    const it = c.pro.items[p.slug];
    return `<article class="card pro-card reveal">${picture(p.img, it.name + ' ' + it.size)}<div class="pbody"><h3>${esc(it.name)}</h3><p class="tag">${esc(it.size)}</p><p>${esc(it.p)}</p><a class="btn btn-red" href="#enquiry">${esc(c.ui.enquire)}</a></div></article>`;
  }).join('');
  const bulk = BULK.map((b) => {
    const p = PRODUCTS.find((x) => x.slug === b.slug);
    return `<article class="card bulk-card reveal">${picture(p.img, c.products[b.slug].short)}<div class="pbody"><h3>${esc(c.products[b.slug].short)}</h3><ul class="chips">${b.sizes.map((s) => `<li>${esc(lang === 'ar' ? s.replace('L', 'لتر').replace('drum', 'برميل') : s)}</li>`).join('')}</ul></div></article>`;
  }).join('');
  const body = `${pageHero(c.pro.h1, c.pro.lead, crumbs, lang, c, `<div class="row"><a class="btn btn-red" href="#enquiry">${esc(c.pro.formTitle)}</a><a class="btn btn-ghost" href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener">${esc(c.ui.whatsapp)}</a></div>`, 'hero-fats')}
<section class="sec"><div class="wrap">${heading('', c.pro.fatsTitle, '')}<div class="cgrid">${cartons}</div></div></section>
<section class="sec grey"><div class="wrap">${heading('', c.pro.bulkTitle, c.pro.bulkText)}<div class="cgrid">${bulk}</div><p class="note center">${esc(c.pro.moq)}</p></div></section>
<section class="sec"><div class="wrap narrow">${heading('', c.pro.howTitle, '')}<ol class="steps">${c.pro.steps.map((s) => `<li class="reveal">${esc(s)}</li>`).join('')}</ol></div></section>
<section class="sec dark" id="enquiry"><div class="wrap narrow">${heading('', c.pro.formTitle, c.pro.formText)}<div class="form-card reveal">${leadForm({ kind: 'b2b', c, lang, page: '/coroli-pro/' })}</div></div></section>
${faqBlock(c.pro.faq, c)}`;
  const ld = [faqLd(c.pro.faq), { '@context': 'https://schema.org', '@type': 'ItemList', name: c.pro.h1, itemListElement: PRO.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Product', name: 'Coroli ' + c.pro.items[p.slug].name + ' ' + c.pro.items[p.slug].size, image: absImg(p.img), brand: { '@type': 'Brand', name: 'Coroli Professional' }, manufacturer: { '@id': SITE.url + '/#org' } } })) }];
  return { path: '/coroli-pro/', seo: c.pro.seo, body, crumbs, ld, ogImage: 'icf' };
}

// ------------------------------------------------------------------ BUY
function buy(lang, c) {
  const crumbs = [[c.ui.breadcrumbHome, '/'], [c.nav.buy, '/where-to-buy/']];
  const rows = PRODUCTS.map((p) => `<tr><th scope="row">${esc(c.products[p.slug].short)}</th><td><div class="row">${buyButtons(p, c)}</div></td></tr>`).join('');
  const body = `${pageHero(c.buy.h1, c.buy.lead, crumbs, lang, c, '', 'buy')}
<section class="sec"><div class="wrap">${heading('', c.buy.onlineTitle, '')}${retailerCards(lang, c)}</div></section>
<section class="sec grey"><div class="wrap narrow"><h2 class="reveal">${esc(c.buy.byProduct)}</h2><div class="table-wrap reveal"><table class="sku"><tbody>${rows}</tbody></table></div></div></section>
<section class="sec"><div class="wrap split"><div class="reveal"><h2>${esc(c.buy.storesTitle)}</h2><p>${esc(c.buy.storesText)}</p><div class="map-ph"><strong>${esc(c.buy.mapTitle)}</strong><span>${esc(c.buy.mapText)}</span></div></div>
<div class="reveal biz"><h2>${esc(c.buy.bizTitle)}</h2><p>${esc(c.buy.bizText)}</p><a class="btn btn-red" href="${href(lang, '/coroli-pro/')}#enquiry">${esc(c.buy.bizCta)}</a></div></div></section>`;
  return { path: '/where-to-buy/', seo: c.buy.seo, body, crumbs, ld: [] };
}

// ------------------------------------------------------------------ RECIPES
function recipes(lang, c) {
  const crumbs = [[c.ui.breadcrumbHome, '/'], [c.nav.recipes, '/recipes/']];
  const used = [...new Set(c.recipes.items.map((r) => r.product))];
  const filters = `<div class="filters" role="group"><button type="button" class="chip is-active" data-f="all">${esc(c.ui.filterAll)}</button>${used.map((s) => `<button type="button" class="chip" data-f="${s}">${esc(c.products[s].short)}</button>`).join('')}</div>`;
  const cards = c.recipes.items.map((r) => `<div class="fitem" data-p="${r.product}">${recipeCard(r, c, lang)}</div>`).join('');
  const body = `${pageHero(c.recipes.h1, c.recipes.lead, crumbs, lang, c, '', 'recipes')}
<section class="sec"><div class="wrap">${filters}<div class="cgrid">${cards}</div></div></section>`;
  return { path: '/recipes/', seo: c.recipes.seo, body, crumbs, ld: [] };
}

function recipe(lang, c, r) {
  const p = PRODUCTS.find((x) => x.slug === r.product);
  const path = '/recipes/' + r.slug + '/';
  const crumbs = [[c.ui.breadcrumbHome, '/'], [c.nav.recipes, '/recipes/'], [r.name, path]];
  const body = `<section class="pdp"><div class="wrap">${crumbNav(crumbs, lang)}
  <div class="pdp-grid"><div class="pdp-img recipe-img reveal">${recipeImg(r, true)}</div>
  <div class="pdp-info"><span class="pill">${esc(r.cat)}</span><h1 class="reveal">${esc(r.name)}</h1><p class="lead reveal">${esc(r.desc)}</p>
  <p class="meta">${esc(c.ui.time)}: ${r.time} ${esc(c.ui.minutes)} · ${esc(c.ui.serves)}: ${r.serves}</p>
  <a class="btn btn-red" href="${href(lang, '/coroli/' + p.slug + '/')}">${esc(c.products[p.slug].short)}</a></div></div></div></section>
<section class="sec"><div class="wrap split">
  <div class="reveal"><h2>${esc(c.ui.ingredients)}</h2><ul class="ticks">${r.ing.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>
  <div class="reveal"><h2>${esc(c.ui.method)}</h2><ol class="steps">${r.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div></div></section>
<section class="sec grey"><div class="wrap">${heading('', c.ui.buyHere, '')}<div class="row">${buyButtons(p, c)}</div></div></section>`;
  const ld = [{
    '@context': 'https://schema.org', '@type': 'Recipe', name: r.name, description: r.desc, image: [absImg(p.img)], inLanguage: lang,
    author: { '@id': SITE.url + '/#org' }, datePublished: today, recipeCategory: r.cat, recipeYield: String(r.serves), totalTime: 'PT' + r.time + 'M',
    recipeIngredient: r.ing, recipeInstructions: r.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s })),
  }];
  return { path, seo: { title: `${r.name} | Coroli ${lang === 'ar' ? 'وصفات' : 'Recipes'}`, desc: r.desc + ' ' + (lang === 'ar' ? 'وصفة من كورولي.' : 'A Coroli recipe.') }, body, crumbs, ld, ogImage: 'sunflower', ogType: 'article' };
}

// ------------------------------------------------------------------ HEALTH / GUIDES
function health(lang, c) {
  const crumbs = [[c.ui.breadcrumbHome, '/'], [c.nav.health, '/health-lifestyle/']];
  const body = `${pageHero(c.health.h1, c.health.lead, crumbs, lang, c, '', 'health')}
<section class="sec"><div class="wrap"><div class="cgrid">${c.health.guides.map((g) => guideCard(g, c, lang)).join('')}</div><p class="note center">${esc(c.health.disclaimer)}</p></div></section>`;
  return { path: '/health-lifestyle/', seo: c.health.seo, body, crumbs, ld: [] };
}

function guide(lang, c, g) {
  const path = '/health-lifestyle/' + g.slug + '/';
  const crumbs = [[c.ui.breadcrumbHome, '/'], [c.nav.health, '/health-lifestyle/'], [g.name, path]];
  const table = g.table ? `<div class="table-wrap reveal"><table class="sku"><thead><tr>${g.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${g.table.rows.map((r) => `<tr>${r.map((x, i) => i === 0 ? `<th scope="row">${esc(x)}</th>` : `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
  const body = `${pageHero(g.name, g.desc, crumbs, lang, c, `<p class="meta">${esc(c.ui.published)}: ${g.date}</p>`, 'health')}
<section class="sec"><div class="wrap narrow prose">${g.sections.map((s) => `<div class="reveal"><h2>${esc(s.h)}</h2><p>${esc(s.p)}</p></div>`).join('')}${table}
<p class="note">${esc(c.health.disclaimer)}</p>
<div class="row"><a class="btn btn-red" href="${href(lang, '/coroli/')}">${esc(c.nav.coroli)}</a><a class="btn btn-ghost" href="${href(lang, '/where-to-buy/')}">${esc(c.nav.buy)}</a></div></div></section>
${faqBlock(g.faq, c)}`;
  const ld = [{
    '@context': 'https://schema.org', '@type': 'Article', headline: g.name, description: g.desc, inLanguage: lang,
    datePublished: g.date, dateModified: g.date, mainEntityOfPage: abs(lang, path), image: [absImg('sunflower')],
    author: { '@id': SITE.url + '/#org' }, publisher: { '@id': SITE.url + '/#org' },
  }, faqLd(g.faq)];
  return { path, seo: { title: `${g.name} | Coroli`, desc: g.desc + ' ' + (lang === 'ar' ? 'دليل من كورولي للطهي في مطابخ الإمارات ودول الخليج.' : 'A Coroli cooking guide for kitchens in the UAE and GCC.') }, body, crumbs, ld, ogType: 'article' };
}

// ------------------------------------------------------------------ CONTACT / PRIVACY / 404
function contact(lang, c) {
  const crumbs = [[c.ui.breadcrumbHome, '/'], [c.nav.contact, '/contact/']];
  const body = `${pageHero(c.contact.h1, c.contact.lead, crumbs, lang, c, '', 'about')}
<section class="sec"><div class="wrap split">
  <div class="reveal"><h2>${esc(c.contact.detailsTitle)}</h2><ul class="contact-list big">
    <li><strong>${lang === 'ar' ? 'هاتف' : 'Phone'}</strong><a href="tel:${SITE.phoneHref}" dir="ltr">${esc(SITE.phone)}</a></li>
    <li><strong>${lang === 'ar' ? 'بريد' : 'Email'}</strong><a href="mailto:${SITE.email}">${esc(SITE.email)}</a></li>
    <li><strong>WhatsApp</strong><a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener" dir="ltr">${esc(SITE.whatsappDisplay)}</a></li>
    <li><strong>${lang === 'ar' ? 'العنوان' : 'Address'}</strong><span>${esc(SITE.company)}<br>${esc(SITE.address.street)}, ${lang === 'ar' ? 'أبوظبي، الإمارات' : 'Abu Dhabi, UAE'}</span></li></ul></div>
  <div class="form-card reveal"><h2>${esc(c.contact.formTitle)}</h2>${leadForm({ kind: 'general', c, lang, page: '/contact/' })}</div></div></section>`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'ContactPage', name: c.contact.h1, url: abs(lang, '/contact/'), about: { '@id': SITE.url + '/#org' } }];
  return { path: '/contact/', seo: c.contact.seo, body, crumbs, ld };
}

function privacy(lang, c) {
  const crumbs = [[c.ui.breadcrumbHome, '/'], [c.ui.privacy, '/privacy/']];
  const body = `${pageHero(c.privacy.h1, '', crumbs, lang, c)}<section class="sec"><div class="wrap narrow prose">${c.privacy.body.map((p) => `<p>${esc(fmt(p))}</p>`).join('')}</div></section>`;
  return { path: '/privacy/', seo: c.privacy.seo, body, crumbs, ld: [], noindex: true };
}

export function notFound(lang, c) {
  const body = `<section class="sec nf"><div class="wrap center"><p class="big404">404</p><h1>${esc(c.notFound.h1)}</h1><p>${esc(c.notFound.p)}</p><a class="btn btn-red" href="${href(lang, '/')}">${esc(c.notFound.cta)}</a></div></section>`;
  return { path: '/', seo: { title: c.notFound.title, desc: c.notFound.p + ' ' + c.notFound.p }, body, crumbs: [], ld: [], noindex: true };
}

export function buildPages(lang, c) {
  const list = [home(lang, c), about(lang, c), range(lang, c), ...PRODUCTS.map((p) => product(lang, c, p)), pro(lang, c), buy(lang, c),
    health(lang, c), ...c.health.guides.map((g) => guide(lang, c, g)), recipes(lang, c), ...c.recipes.items.map((r) => recipe(lang, c, r)), contact(lang, c), privacy(lang, c)];
  return list;
}
