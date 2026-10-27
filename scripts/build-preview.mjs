#!/usr/bin/env node
/**
 * Build a self-contained STATIC PREVIEW of the site.
 *
 * This exists so the site can be shown as plain files on any static host
 * (or as a published page) when a Node deployment isn't available yet.
 * It is NOT the production build — `next build` is.
 *
 * What it does, and why each step is needed:
 *
 *  1. Temporarily moves the server-only routes aside. `output: "export"`
 *     cannot build API routes, robots.ts or sitemap.ts.
 *  2. Swaps in an export config (no redirects/headers — those need a server;
 *     images unoptimized — no optimizer either).
 *  3. Builds with NEXT_PUBLIC_STATIC_PREVIEW=true, which makes `href()`
 *     emit explicit /en/… and /ar/…/index.html paths. There is no proxy to
 *     rewrite locales, and a plain static host does not reliably resolve a
 *     directory to its index.html.
 *  4. Post-processes the output:
 *       - drops the RSC .txt payloads (no server to stream them)
 *       - renames _next → next-assets (hosts that reserve "_" prefixes)
 *       - escapes a literal U+FFFD inside a URI-decoding polyfill, which
 *         some publishing pipelines reject as a bad character
 *       - writes a root index.html that forwards to /en/
 *  5. Restores everything it moved, even if the build fails.
 *
 * Usage:  node scripts/build-preview.mjs    → ./out
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "out");

const moves = [
  ["src/app/api", ".preview-stash/api"],
  ["src/app/robots.ts", ".preview-stash/robots.ts"],
  ["src/app/sitemap.ts", ".preview-stash/sitemap.ts"],
  ["next.config.ts", ".preview-stash/next.config.ts"],
];

const EXPORT_CONFIG = `import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
`;

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

function stash() {
  fs.mkdirSync(path.join(root, ".preview-stash"), { recursive: true });
  for (const [from, to] of moves) {
    const src = path.join(root, from);
    if (fs.existsSync(src)) fs.renameSync(src, path.join(root, to));
  }
  fs.writeFileSync(path.join(root, "next.config.ts"), EXPORT_CONFIG);
}

function restore() {
  for (const [from, to] of moves) {
    const stashed = path.join(root, to);
    const dest = path.join(root, from);
    if (fs.existsSync(stashed)) {
      if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.renameSync(stashed, dest);
    }
  }
  fs.rmSync(path.join(root, ".preview-stash"), { recursive: true, force: true });
}

function postProcess() {
  // 1. RSC payloads are useless without a server.
  for (const f of walk(out)) if (f.endsWith(".txt")) fs.rmSync(f);
  const notFound = path.join(out, "_not-found");
  if (fs.existsSync(notFound)) fs.rmSync(notFound, { recursive: true, force: true });

  // 2. A literal U+FFFD lives inside a decodeURIComponent polyfill, where it
  //    is the intended output for malformed input. Escaping it is
  //    byte-equivalent at runtime and leaves no raw replacement character.
  for (const f of walk(path.join(out, "_next"))) {
    if (!f.endsWith(".js")) continue;
    const t = fs.readFileSync(f, "utf8");
    if (t.includes("�")) {
      fs.writeFileSync(f, t.replaceAll("�", "\\uFFFD"));
    }
  }

  // 3. "_next" → "next-assets".
  fs.renameSync(path.join(out, "_next"), path.join(out, "next-assets"));
  for (const f of walk(out)) {
    if (!/\.(html|js|css)$/.test(f)) continue;
    const t = fs.readFileSync(f, "utf8");
    if (t.includes("/_next/")) {
      fs.writeFileSync(f, t.replaceAll("/_next/", "/next-assets/"));
    }
  }

  // 3b. Absolute → relative.
  //
  //     Next emits root-absolute URLs (/next-assets/…, /en/…). Those only
  //     work when the site sits at the origin root. Hosts that serve it
  //     from a sub-path — /artifacts/<id>/, a project folder, a preview
  //     URL — would 404 every stylesheet and script, and the page renders
  //     as raw unstyled HTML.
  //
  //     Rewriting each absolute URL to one relative to its own file works
  //     at the root AND under any prefix, with no runtime guessing.
  // Every top-level name the pages can link to. Anything served from
  // /public needs to be here or its absolute URL survives the rewrite and
  // 404s on a host that serves the site from a sub-path.
  const roots = [
    "next-assets",
    "en",
    "ar",
    "brand",
    "products",
    "team",
    "favicon.ico",
    "404.html",
  ];
  for (const f of walk(out)) {
    if (!f.endsWith(".html")) continue;
    const depth = path.relative(out, f).split(path.sep).length - 1;
    const prefix = depth === 0 ? "" : "../".repeat(depth);
    let t = fs.readFileSync(f, "utf8");
    for (const r of roots) {
      t = t.replaceAll(`"/${r}`, `"${prefix}${r}`);
    }
    fs.writeFileSync(f, t);
  }

  // 3b-ii. Route the remaining legacy pack shots through a resizing CDN.
  //
  //        Range imagery and the team portraits are bundled in /public and
  //        need nothing. The sub-range pack shots still live on the legacy
  //        WordPress host as full-size PNGs — 180KB each for a tile shown
  //        at ~240px. Proxying them resizes to WebP on the fly and serves
  //        from a CDN with permissive CORS, which is both much faster and
  //        less likely to be refused than hot-linking the origin.
  //
  //        Preview only. The production build optimises these itself
  //        through next/image, with no third party involved.
  const PROXY = "https://images.weserv.nl/?url=";
  for (const f of walk(out)) {
    if (!f.endsWith(".html")) continue;
    const t = fs.readFileSync(f, "utf8");
    if (!t.includes("www.unikai.com/wp-content")) continue;
    fs.writeFileSync(
      f,
      t.replace(
        /https:\/\/www\.unikai\.com\/wp-content\/uploads\/([^"'\s)]+\.(?:png|jpe?g))/gi,
        (_m, p) =>
          `${PROXY}www.unikai.com/wp-content/uploads/${p}&w=560&output=webp&q=78`,
      ),
    );
  }

  // 3c. Pack-shot fallback.
  //
  //     Product imagery still lives on the legacy WordPress host. A
  //     preview host may refuse third-party images under its content
  //     security policy, and a page of broken-image icons reads as a
  //     broken site rather than a pending asset migration. This swaps any
  //     image that fails to load for a branded tile carrying its alt text,
  //     so the layout stays intact and the gap is legible.
  const IMG_FALLBACK = `<script>
addEventListener("error", function (e) {
  var img = e.target;
  if (!img || img.tagName !== "IMG" || img.dataset.fallback) return;
  img.dataset.fallback = "1";
  var box = document.createElement("div");
  box.textContent = img.alt || "Image pending";
  box.setAttribute("style",
    "position:absolute;inset:0;display:flex;align-items:center;" +
    "justify-content:center;text-align:center;padding:12%;" +
    "font:600 11px/1.4 ui-sans-serif,system-ui,sans-serif;" +
    "letter-spacing:.06em;text-transform:uppercase;color:#6b7280;" +
    "background:linear-gradient(160deg,#f2f2fb,#fff);border-radius:inherit");
  if (img.parentNode) img.parentNode.appendChild(box);
  img.style.visibility = "hidden";
}, true);
</script>`;

  for (const f of walk(out)) {
    if (!f.endsWith(".html") || f === path.join(out, "index.html")) continue;
    const t = fs.readFileSync(f, "utf8");
    if (t.includes("</body>")) {
      fs.writeFileSync(f, t.replace("</body>", `${IMG_FALLBACK}</body>`));
    }
  }

  // 3d. Replace React with a plain script.
  //
  //     Each exported page carries ~58 KB of inline hydration script. A
  //     host with a strict content-security policy blocks inline script,
  //     React never hydrates, and every interactive part — the menus, the
  //     banner slider, the assistant — is dead on arrival while the page
  //     still looks fine. That failure is invisible until someone clicks.
  //
  //     The markup is already complete, so the framework is not actually
  //     needed to display anything. Stripping it halves the page weight,
  //     removes every inline script, and leaves readable HTML. One small
  //     external file wires the interactions back up.
  const kb = buildPreviewKnowledge();
  fs.writeFileSync(path.join(out, "knowledge.js"), kb);
  fs.copyFileSync(
    path.join(root, "scripts", "preview-site.js"),
    path.join(out, "site.js"),
  );

  for (const f of walk(out)) {
    if (!f.endsWith(".html")) continue;
    const depth = path.relative(out, f).split(path.sep).length - 1;
    const prefix = depth === 0 ? "" : "../".repeat(depth);
    let t = fs.readFileSync(f, "utf8");

    // Drop every <script> — framework bundles and inline hydration alike.
    t = t.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    // Drop the module preloads that pointed at them.
    t = t.replace(/<link\b[^>]*rel="preload"[^>]*as="script"[^>]*>/gi, "");

    t = t.replace(
      "</body>",
      `<script src="${prefix}knowledge.js" defer></script>` +
        `<script src="${prefix}site.js" defer></script></body>`,
    );
    fs.writeFileSync(f, t);
  }

  // 4. Root index.html IS the English homepage.
  //
  //    Not a redirect. Opening the folder and double-clicking index.html
  //    should show the site, including straight off a disk over file://,
  //    which a redirect to a sub-path does not reliably do.
  //
  //    en/index.html sits one level down, so its asset and link paths all
  //    start "../". At the root that prefix is one level too many, so it
  //    comes off.
  const home = fs
    .readFileSync(path.join(out, "en", "index.html"), "utf8")
    .replaceAll('"../', '"');
  fs.writeFileSync(path.join(out, "index.html"), home);

  // 4b. Entry page for hosts that wrap the main document.
  //
  //     Some preview hosts inject their own <html>/<body> around whatever
  //     they treat as the entry page. A complete document there ends up
  //     nested inside a second one. This file is a FRAGMENT, so it stays
  //     valid after wrapping, and it forwards to the real homepage using a
  //     path derived from location at runtime — correct whether the site
  //     sits at the origin root or under a prefix.
  //
  //     Only used when publishing to such a host. Opening index.html
  //     directly does not involve it.
  fs.writeFileSync(
    path.join(out, "start.html"),
    `<style>
  #unikai-splash{position:fixed;inset:0;display:flex;align-items:center;
    justify-content:center;flex-direction:column;gap:.9rem;background:#09018b;
    color:#fff;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",
    Roboto,Arial,sans-serif;z-index:2147483647}
  #unikai-splash strong{font-size:1.3rem;letter-spacing:-.01em}
  #unikai-splash a{color:#fff;font-size:.9rem;opacity:.85}
</style>
<div id="unikai-splash">
  <strong>Unikai Foods</strong>
  <a id="unikai-enter" href="en/index.html">Enter site &rarr;</a>
</div>
<script>
(function () {
  var p = location.pathname;
  if (!/\\/$/.test(p)) p = p.replace(/[^/]*$/, "");
  var target = p + "en/index.html";
  var a = document.getElementById("unikai-enter");
  if (a) a.setAttribute("href", target);
  location.replace(target);
})();
</script>
`,
  );

  // 5. An editable theme layer.
  //
  //    The compiled stylesheet is minified and unreadable. This file is
  //    loaded after it and overrides the design tokens, so colours, fonts
  //    and spacing can be changed by hand without touching build output.
  const THEME = `/* ===================================================================
   UNIKAI — EDITABLE THEME
   Loaded after the compiled stylesheet, so anything set here wins.
   Change a value, save, refresh the page. No build step.
   =================================================================== */

:root {
  /* --- Brand colours ---------------------------------------------
     Sampled from the supplied logo. Replace with the exact values
     from Unikai's brand guidelines when they arrive.              */
  --color-brand-red:   #d23137;   /* accents, CTAs, eyebrow labels */
  --color-brand-navy:  #09018b;   /* headers, primary buttons      */

  /* Darker shades, used for hover states */
  --color-brand-red-600:  #b82a2f;
  --color-brand-navy-600: #0b0a73;
  --color-brand-navy-800: #080551;
  --color-brand-navy-900: #05033a;

  /* --- Warm neutrals ---------------------------------------------- */
  --color-cream: #faf7f2;   /* alternating section background */
  --color-sand:  #e8dfd0;
  --color-gold:  #b08d4f;

  /* --- Text ------------------------------------------------------- */
  --color-ink:      #14161a;  /* headings */
  --color-ink-700:  #3c424c;  /* body copy */
  --color-ink-500:  #6b7280;  /* captions, labels */
}

/* --- Typography ---------------------------------------------------
   Swap the font stacks here. Remember to load any new web font in
   the <head> of the page before it will apply.                    */
:root {
  --font-sans:   "Inter", ui-sans-serif, system-ui, Arial, sans-serif;
  --font-arabic: "IBM Plex Sans Arabic", "Noto Sans Arabic", Tahoma, sans-serif;
}

/* --- Examples -----------------------------------------------------
   Uncomment and edit. These show the pattern for overriding
   anything the compiled stylesheet sets.

   Make every headline tighter:
     .t-display, .t-h1, .t-h2 { letter-spacing: -0.04em; }

   Square off the buttons:
     .rounded-full { border-radius: 8px !important; }

   Calm the hover lift on cards:
     .card-lift:hover { transform: translateY(-2px); }
------------------------------------------------------------------- */
`;
  fs.writeFileSync(path.join(out, "theme.css"), THEME);

  // Link theme.css from every page, last in <head> so it overrides.
  for (const f of walk(out)) {
    if (!f.endsWith(".html")) continue;
    const depth = path.relative(out, f).split(path.sep).length - 1;
    const prefix = depth === 0 ? "" : "../".repeat(depth);
    const t = fs.readFileSync(f, "utf8");
    if (t.includes("theme.css") || !t.includes("</head>")) continue;
    fs.writeFileSync(
      f,
      t.replace(
        "</head>",
        `<link rel="stylesheet" href="${prefix}theme.css"></head>`,
      ),
    );
  }
}

/**
 * The assistant's knowledge base, emitted as a plain script.
 *
 * Exactly the passages the server route is allowed to use, so the static
 * assistant answers from the same approved content and is bound by the
 * same limits: it cannot state a price, a certification or an export
 * market, because none of them are in here to state.
 */
function buildPreviewKnowledge() {
  const { ranges, subRanges } = JSON.parse(
    execSync("node scripts/dump-content.mjs", { encoding: "utf8" }),
  );

  const P = [];
  const push = (title, body, href, keywords) =>
    P.push({ title, body, href, keywords });

  push(
    "About Unikai",
    "Unikai Foods PJSC is among the largest and most diversified FMCG companies in the Middle East and North Africa. Established in Dubai in 1977 and inaugurated by the then Ruler of Dubai, Sheikh Rashid bin Saeed Al Maktoum, it produces dairy, ice cream, juice and food products at its UAE facilities.",
    "en/about/index.html",
    ["about", "company", "who", "history", "founded", "1977", "unikai", "dubai", "pjsc"],
  );
  push(
    "Contact",
    "Head office: P.O. Box 6424, Al Quoz Industrial Area, Dubai, UAE. Telephone 800UNIKAI (864524). General enquiries info@unikai.com. Investor relations: Ahmed Bedier, +971 4 507 6866, investor.relations@unikai.com. Careers: careers@unikai.com.",
    "en/contact/index.html",
    ["contact", "phone", "email", "address", "office", "call", "reach", "location"],
  );
  push(
    "Export and international distribution",
    "Unikai supplies international markets through appointed distributors. Export enquiries are handled by the export team, who confirm which products suit your market, the documentation required and the commercial terms. To start, send an export enquiry with your destination country, the products you are interested in, your company details and estimated volumes.",
    "en/export/index.html",
    ["export", "import", "importing", "exporting", "international", "overseas", "abroad", "country", "distributor", "distribution", "documentation", "shipping", "customs"],
  );
  push(
    "UAE and Oman distribution, wholesale and retail supply",
    "Unikai operates an extensive distribution network across the UAE and Oman supplying retail, wholesale and trade customers. For wholesale, retail supply or HORECA enquiries, send a distribution enquiry and the local sales team will respond with the process.",
    "en/contact/index.html",
    ["wholesale", "retail", "supply", "buy", "purchase", "order", "stock", "trade", "horeca", "supermarket", "uae", "oman", "distributor", "distribution"],
  );
  push(
    "Quality and certifications",
    "Unikai products are produced at the company's UAE facilities and pass quality assurance before distribution. Specific certification details are confirmed per product and market by the quality team — ask and we will send the documentation.",
    "en/quality/index.html",
    ["quality", "certification", "certified", "halal", "iso", "haccp", "food", "safety", "standard"],
  );
  push(
    "Careers",
    "Unikai hires across its UAE operations. Applications are made through the careers page. Important: Unikai has not appointed any agent to recruit on its behalf and will never ask candidates for payment. All recruiter email addresses end in @Unikai.com.",
    "en/careers/index.html",
    ["career", "careers", "job", "jobs", "vacancy", "hiring", "work", "apply", "cv", "recruitment"],
  );
  push(
    "Investor relations",
    "Unikai Foods PJSC is listed on the Dubai Financial Market under the ticker UNIKAI. Financial statements, integrated reports, general assembly materials and disclosures are published in the investor relations section.",
    "en/investor-relations/index.html",
    ["investor", "investors", "share", "shares", "stock", "dfm", "financial", "results", "dividend", "annual", "report", "shareholder"],
  );

  for (const r of ranges) {
    const subs = subRanges.filter((s) => s.range === r.slug);
    push(
      `${r.name} range`,
      `${r.description} Sub-ranges: ${subs.map((s) => s.name).join(", ")}.`,
      `en/products/${r.slug}/index.html`,
      [r.slug, ...r.name.toLowerCase().split(/\s+/),
       ...subs.flatMap((s) => s.name.toLowerCase().split(/\s+/))],
    );
  }
  for (const s of subRanges) {
    const parent = ranges.find((r) => r.slug === s.range);
    push(
      s.name,
      `${s.name} is part of the Unikai ${parent ? parent.name : ""} range, produced at the company's UAE facilities.`,
      `en/products/${s.range}/${s.slug}/index.html`,
      [s.slug, ...s.name.toLowerCase().split(/\s+/)],
    );
  }

  const strings = {
    en: {
      greeting:
        "Hello. I can answer questions about Unikai's product ranges, company information and export or distribution process. How can I help?",
      noAnswer:
        "I don't have that detail in Unikai's published information. I can put you in touch with the right team — would you like to share your contact details?",
    },
    ar: {
      greeting:
        "مرحباً. يمكنني الإجابة عن أسئلتك حول مجموعات منتجات يونيكاي ومعلومات الشركة وعملية التصدير أو التوزيع. كيف يمكنني المساعدة؟",
      noAnswer:
        "ليس لدي هذه المعلومة ضمن محتوى يونيكاي المنشور. يسعدني توصيلك بالفريق المختص — هل ترغب بمشاركة بيانات التواصل؟",
    },
  };

  return (
    "/* Unikai assistant knowledge base — GENERATED by scripts/build-preview.mjs.\n" +
    "   Edit src/content/* and rebuild; changes here are overwritten.\n" +
    "\n" +
    "   This is the whole universe of facts the assistant may use. It\n" +
    "   deliberately contains no prices, stock levels, certifications or\n" +
    "   export markets — it cannot state what it does not hold. */\n" +
    "window.UNIKAI_KB = " +
    JSON.stringify({ passages: P, strings }, null, 1) +
    ";\n"
  );
}

let failed = false;
try {
  stash();
  execSync("npx next build", {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_STATIC_PREVIEW: "true",
      NEXT_PUBLIC_SITE_URL: "https://unikai-preview.local",
    },
  });
} catch (err) {
  failed = true;
  console.error("\nPreview build failed:", err.message);
} finally {
  restore();
}

if (!failed) {
  postProcess();
  const files = walk(out);
  console.log(
    `\nPreview ready: ${files.length} files in ./out ` +
      `(${files.filter((f) => f.endsWith(".html")).length} pages)`,
  );
}
