// Relative import (not the "@/" alias) so next.config.ts can load this file.
import { ranges, subRanges } from "../content/products";

/**
 * 301 map from the legacy WordPress/WooCommerce URLs to the new structure.
 *
 * Preserving link equity is the single most important SEO task in this
 * migration: the legacy URLs are what Google, the DFM and any inbound links
 * currently point at. Every legacy path we know of resolves here.
 *
 * Consumed by next.config.ts.
 */

export interface Redirect {
  source: string;
  destination: string;
  permanent: true;
}

const r = (source: string, destination: string): Redirect => ({
  source,
  destination,
  permanent: true,
});

/** Range and sub-range redirects, derived from the catalogue itself. */
function catalogueRedirects(): Redirect[] {
  const out: Redirect[] = [];

  for (const range of ranges) {
    if (range.legacyUrl) {
      out.push(r(range.legacyUrl.replace(/\/$/, ""), `/products/${range.slug}`));
    }
  }

  // The duplicate ice-cream taxonomy: both legacy paths land on one range.
  out.push(r("/product-category/ice-cream", "/products/ice-cream"));
  out.push(r("/product-category/unikai-ice-cream-range", "/products/ice-cream"));

  for (const sub of subRanges) {
    if (!sub.legacyUrl) continue;
    out.push(
      r(
        sub.legacyUrl.replace(/\/$/, ""),
        `/products/${sub.range}/${sub.slug}`,
      ),
    );
  }

  return out;
}

/** Hand-mapped page redirects. */
const pageRedirects: Redirect[] = [
  r("/our-brands", "/products"),
  r("/who-we-are", "/about"),
  r("/get-in-touch", "/contact"),
  r("/overview", "/investor-relations"),
  // NB: no redirect for /investor-relations itself — the legacy URL and the
  // new URL are the same, and a self-redirect is an infinite loop.
  r("/structure-and-governance", "/investor-relations/structure-and-governance"),
  r("/key-figures", "/investor-relations/key-figures"),
  r("/results-and-presentations", "/investor-relations/results-and-presentations"),
  r("/integrated-results", "/investor-relations/integrated-reports"),
  r("/annual-general-meetings", "/investor-relations/annual-general-meetings"),
  r("/announcement", "/investor-relations/announcements"),
  r("/unclaimed-dividends", "/investor-relations/unclaimed-dividends"),
  r("/disclaimer", "/investor-relations/disclaimer"),

  // The legacy Arabic IR page sits on a percent-encoded Arabic slug.
  r(
    "/%d8%b9%d9%84%d8%a7%d9%82%d8%a7%d8%aa-%d8%a7%d9%84%d9%85%d8%b3%d8%aa%d8%ab%d9%85%d8%b1%d9%8a%d9%86",
    "/ar/investor-relations",
  ),

  // Legacy WooCommerce product detail pages.
  r("/product/fresh-milk", "/products/dairy/fresh-milk/fresh-milk"),
  r(
    "/product/orange-lolly-family-pack",
    "/products/ice-cream/lollies-and-bars/orange-lolly-family-pack",
  ),
  r("/product/milk-powder", "/products/dairy/milk-powder"),

  // WooCommerce scaffolding that should never have been public on a
  // catalogue-only site.
  r("/cart", "/products"),
  r("/checkout", "/products"),
  r("/my-account", "/"),
  r("/shop", "/products"),
];

export const redirects: Redirect[] = [...pageRedirects, ...catalogueRedirects()];
