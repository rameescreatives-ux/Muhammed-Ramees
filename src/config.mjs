// ============================================================
// COROLI WEBSITE: SITE SETTINGS (edit this file first)
// ============================================================
// Build with:  node build.mjs
// Env overrides:
//   SITE_URL       final public address (default https://www.corolilife.com)
//   SITE_NOINDEX=1 hide the site from search engines (use on test/preview hosts)
// ============================================================

const UP = 'https://www.corolilife.com/wp-content/uploads/';

export const SITE = {
  url: (process.env.SITE_URL || 'https://www.corolilife.com').replace(/\/$/, ''),
  noindex: process.env.SITE_NOINDEX === '1',

  brand: 'Coroli',
  company: 'Abu Dhabi Vegetable Oil Company L.L.C.',
  companyShort: 'ADVOC',
  advocUrl: 'https://advocuae.com',
  founded: 1973, // CONFIRM with ADVOC (other sources say 1968 / 1977). Used in copy + schema.

  email: 'info@advocuae.com',
  phone: '+971 2 673 0400',
  phoneHref: '+97126730400',
  whatsapp: '971506415711',
  whatsappDisplay: '+971 50 641 5711',
  address: { street: 'P.O. Box 7125', city: 'Abu Dhabi', country: 'AE' },

  social: {
    instagram: 'https://www.instagram.com/corolilife/',
    youtube: 'https://www.youtube.com/channel/UCKoTmD6FRWsJIAF-k4cGtDQ',
    facebook: 'https://www.facebook.com/corolilife/',
  },

  // Enquiry + newsletter forms post straight to this Supabase project.
  // The publishable key is public by design; protection is done by row-level security (see supabase/schema.sql).
  supabase: {
    url: process.env.SUPABASE_URL || 'https://npnjdhdzckvmagtiwqnp.supabase.co',
    key: process.env.SUPABASE_KEY || 'sb_publishable_AM86tD1jMAb9mKKmMNrGxg_VP7T-YNv',
  },

  // Paste a free chatbot embed script URL here later (Tawk.to, Chatbase, etc.). Empty = built-in quick-help panel only.
  chatEmbedScript: '',

  // Images. Remote links point at the current corolilife.com uploads until you copy the files into public/assets/img/.
  // To switch to local files, replace a value with e.g. '/assets/img/sunflower.png'.
  img: {
    logo: UP + '2019/10/coroli-english-01.svg',
    advoc: 'https://advocuae.com/wp-content/uploads/2025/07/ADVOC.EN_.AR_.Logo_Final.svg',
    favicon: UP + '2019/08/cropped-icon-01-270x270.png',
    sunflower: UP + '2019/09/sunfloweren.png',
    corn: UP + '2019/09/corn-eng.png',
    canola: UP + '2019/09/Canola-En.png',
    ghee: UP + '2019/09/cow-ghee-en.png',
    olive: UP + '2019/09/Coroli-EVOO-Pack-Shot.jpg',
    coconut: UP + '2019/09/500ML-Coconut-Front-English.png',
    margarine: '/assets/img/pro/margarine-15kg.jpg',
    shortening: '/assets/img/pro/shortening-bd40-25kg.jpg',
    icf: '/assets/img/pro/icf-30pl-25kg.jpg',
  },
};

// Retail products (language-neutral facts). Texts live in src/content.en.mjs and src/content.ar.mjs.
// sizes: [value, unit] where unit is 'ml' | 'l'
export const PRODUCTS = [
  { slug: 'sunflower', img: 'sunflower', term: 'sunflower oil', kind: 'oil',
    sizes: [[750, 'ml'], [1.8, 'l'], [3, 'l'], [5, 'l']] },
  { slug: 'corn', img: 'corn', term: 'corn oil', kind: 'oil',
    sizes: [[750, 'ml'], [1.8, 'l'], [3, 'l'], [5, 'l']] },
  { slug: 'canola', img: 'canola', term: 'canola oil', kind: 'oil',
    sizes: [[750, 'ml'], [1.8, 'l'], [3, 'l'], [5, 'l']] },
  { slug: 'ghee', img: 'ghee', term: 'cow ghee', kind: 'ghee',
    sizes: [[500, 'ml'], [800, 'ml'], [1, 'l'], [2, 'l'], [4, 'l'], [10, 'l']] },
  { slug: 'olive', img: 'olive', term: 'olive oil', kind: 'oil',
    sizes: [[500, 'ml'], [1, 'l']] },
  { slug: 'coconut', img: 'coconut', term: 'coconut oil', kind: 'oil',
    sizes: [[500, 'ml'], [1, 'l']] },
];

// Professional (B2B) line
export const PRO = [
  { slug: 'margarine', img: 'margarine', size: '15 kg' },
  { slug: 'shortening', img: 'shortening', size: '25 kg' },
  { slug: 'icf', img: 'icf', size: '25 kg' },
];
export const BULK = [
  { slug: 'sunflower', sizes: ['20 L', '210 L drum'] },
  { slug: 'corn', sizes: ['20 L', '210 L drum'] },
  { slug: 'canola', sizes: ['20 L', '210 L drum'] },
];

export const buyLinks = (term) => ({
  noon: 'https://www.noon.com/uae-en/search/?q=' + encodeURIComponent('coroli ' + term),
  amazon: 'https://www.amazon.ae/s?k=' + encodeURIComponent('coroli ' + term),
});

// Retail partners shown on Where to Buy. Links go to search/category pages until exact SKU pages are supplied.
export const RETAILERS = [
  { name: 'Noon', href: 'https://www.noon.com/uae-en/search/?q=coroli', type: 'online' },
  { name: 'Amazon.ae', href: 'https://www.amazon.ae/s?k=coroli+oil', type: 'online' },
  { name: 'Lulu Hypermarket', href: 'https://gcc.luluhypermarket.com/ar-sa/coroli-pure-sunflower-oil-2-15-litres/p/1857570/', type: 'online' },
  { name: 'Carrefour', href: 'https://www.carrefouruae.com/mafuae/en/c/F1760406', type: 'online' },
  { name: 'Union Coop', href: 'https://www.unioncoop.ae/coroli-sunflower-oil-3ltr-2431086.html', type: 'online' },
];

// Certifications (valid on advocuae.com/certificates as checked 12 Oct 2026).
// Left out on purpose: Kosher (expired 28.10.2025) and FSSC 22000 (expired 06.09.2026). Add back once renewed.
export const CERTS = ['ISO 9001', 'ISO 14001', 'ISO 45001', 'Halal', 'RSPO', 'Emirates Quality Mark', 'ADAFSA A grade'];
