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

  // 4. Root entry.
  //
  //    This file is the one the host may wrap in its own <html>/<body>, so
  //    it is written as a FRAGMENT — no doctype, no <head>. A full document
  //    here ends up nested inside another document and the redirect never
  //    runs.
  //
  //    The target is resolved at runtime from location.pathname so it works
  //    whether this page is served from the origin root or from a
  //    sub-path, with or without a trailing slash. A plain link is left
  //    visible as a fallback for the case where script is blocked.
  fs.writeFileSync(
    path.join(out, "index.html"),
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
  var link = document.getElementById("unikai-enter");
  if (link) link.setAttribute("href", target);
  location.replace(target);
})();
</script>
`,
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
