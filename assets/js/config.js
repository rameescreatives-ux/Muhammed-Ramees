/* ============================================================================
   SHADOWX STUDIOS — SITE CONFIGURATION
   ----------------------------------------------------------------------------
   Every value you are likely to change lives in this one file.
   Edit here, save, refresh. Nothing else needs touching.
   ========================================================================== */

window.SHADOWX = {

  /* --- Where the site lives. Change this when you buy a domain. ------------
     Used for canonical URLs, sitemap, Open Graph and JSON-LD schema.         */
  domain: 'https://shadowx-studios.vercel.app',

  /* --- Contact ---------------------------------------------------------- */
  whatsapp: '971504842309',              // digits only, no + and no spaces
  whatsappDisplay: '+971 50 484 2309',
  email: 'shadowxgcc@gmail.com',
  city: 'Abu Dhabi',
  country: 'United Arab Emirates',

  /* --- Supabase ---------------------------------------------------------
     Paste these from  Supabase Dashboard -> Project Settings -> API.
     Leaving them blank is safe: the chatbot still works and still hands the
     lead to WhatsApp, it just will not store a database copy.               */
  supabaseUrl: 'https://npnjdhdzckvmagtiwqnp.supabase.co',
  supabaseAnonKey: 'sb_publishable_AM86tD1jMAb9mKKmMNrGxg_VP7T-YNv',

  /* --- Table the leads go into ------------------------------------------ */
  supabaseTable: 'shadowx_leads',

  /* --- Pricing tiers -----------------------------------------------------
     NOTE: the prices shown on the page are written directly into index.html
     and ar/index.html (so search engines can read them). This list is used by
     the chatbot only. If you change a price, change it in all three places.  */
  pricing: [
    {
      id: 'launch',
      name: 'Launch',
      price: '1,999',
      tagline: 'For a brand new business that needs to look real on day one.',
      includes: [
        'Primary logo + 3 lockup variations',
        'Colour palette and type system',
        '4-page mini brand guide (PDF)',
        'Business card design',
        'Social profile kit (avatar + cover)',
        'All source files on handover'
      ],
      turnaround: '7–10 days',
      featured: false
    },
    {
      id: 'identity',
      name: 'Identity',
      price: '2,999',
      tagline: 'The full identity system, documented so anyone can apply it.',
      includes: [
        'Everything in Launch',
        'Full brand book (20+ pages)',
        'Arabic + English logo lockups',
        'Social media template set',
        'Letterhead, envelope, email signature',
        'Icon / graphic device set'
      ],
      turnaround: '2–3 weeks',
      featured: true
    },
    {
      id: 'complete',
      name: 'Complete',
      price: '4,999',
      tagline: 'Brand and web together, so nothing is lost in translation.',
      includes: [
        'Everything in Identity',
        'Packaging design OR company profile',
        '5-page responsive website',
        'Basic on-page SEO setup',
        'Google Business Profile setup',
        '30 days post-launch support'
      ],
      turnaround: '4–6 weeks',
      featured: false
    },
    {
      id: 'custom',
      name: 'Custom',
      price: null,
      priceLabel: "Let's talk",
      tagline: 'Multi-brand groups, full bilingual rollouts, e-commerce builds.',
      includes: [
        'Brand architecture for multiple products',
        'Full Arabic–English rollout',
        'E-commerce design and build',
        'Packaging ranges and artwork',
        'Ongoing retainer available'
      ],
      turnaround: 'Scoped per project',
      featured: false
    }
  ],

  /* --- Chatbot ----------------------------------------------------------- */
  chat: {
    autoOpenAfter: 20000,       // ms. Set to 0 to never auto-open.
    greeting: "Hi — I'm Ramees, founder of ShadowX Studios. Four quick questions and I'll send you a real quote, usually within a couple of hours.",
    alwaysOpen: true            // true = "we reply 24/7" messaging (no after-hours copy)
  }
};
