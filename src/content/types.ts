/**
 * Shared content types.
 *
 * Every user-facing string is bilingual (EN/AR) from day one so the Arabic
 * layer never needs a schema migration. Where Arabic has not yet been
 * supplied by Unikai, `ar` is left empty and the UI falls back to `en`
 * (see `t()` in src/lib/i18n.ts) — this is deliberate, not an oversight.
 */

export type Locale = "en" | "ar";

/** A bilingual string. `ar` empty = awaiting professional translation. */
export interface I18nString {
  en: string;
  ar?: string;
}

/** Marks content Unikai must supply or verify before it goes live. */
export interface ContentGap {
  /** Dot-path of the field, e.g. "product.fresh-milk.nutritionals" */
  field: string;
  /** What is missing and who needs to provide it. */
  note: string;
  severity: "blocker" | "review" | "nice-to-have";
}

export interface ProductSpec {
  label: I18nString;
  value: I18nString;
}

export interface Product {
  slug: string;
  name: I18nString;
  /** Sub-range slug this product belongs to. */
  subRange: string;
  /** Range slug. */
  range: string;
  image?: string;
  description?: I18nString;
  packSizes?: string[];
  shelfLife?: I18nString;
  storage?: I18nString;
  ingredients?: I18nString;
  /** Per-100g/ml nutritional panel. */
  nutritionals?: ProductSpec[];
  barcode?: string;
  sku?: string;
  certifications?: string[];
  /** Downloadable spec sheet path, once supplied. */
  specSheet?: string;
  gaps?: ContentGap[];
}

export interface SubRange {
  slug: string;
  name: I18nString;
  range: string;
  image?: string;
  description?: I18nString;
  /** Original WordPress URL, used to build the 301 redirect map. */
  legacyUrl?: string;
  gaps?: ContentGap[];
}

export interface Range {
  slug: string;
  name: I18nString;
  shortName: I18nString;
  tagline?: I18nString;
  description?: I18nString;
  image?: string;
  accent: "navy" | "red";
  legacyUrl?: string;
  gaps?: ContentGap[];
}

export interface Person {
  name: string;
  role: I18nString;
  image?: string;
}

export interface NewsItem {
  slug: string;
  title: I18nString;
  date: string;
  category: "press-release" | "announcement" | "media-coverage";
  excerpt: I18nString;
  body?: I18nString;
  /** Source document on the existing site, where one exists. */
  sourceUrl?: string;
}

export type EnquiryType =
  | "export"
  | "distribution"
  | "general"
  | "partnership";

export interface Vacancy {
  slug: string;
  title: I18nString;
  department: I18nString;
  location: I18nString;
  type: I18nString;
  postedAt: string;
  description: I18nString;
  responsibilities?: I18nString[];
  requirements?: I18nString[];
}
