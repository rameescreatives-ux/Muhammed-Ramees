import type { Metadata } from "next";
import type { Locale, Product } from "@/content/types";
import { site } from "@/content/site";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.unikai.com";

/** Absolute URL for a locale-aware path. */
export function abs(path: string, locale: Locale = "en") {
  const clean = path === "/" ? "" : `/${path.replace(/^\/|\/$/g, "")}`;
  return `${SITE_URL}${locale === "ar" ? "/ar" : ""}${clean}`;
}

/**
 * Canonical + hreflang for every page.
 *
 * Correct hreflang is the difference between Google treating the Arabic site
 * as a translation and treating it as duplicate content.
 */
export function alternates(path: string) {
  return {
    canonical: abs(path, "en"),
    languages: {
      en: abs(path, "en"),
      ar: abs(path, "ar"),
      "x-default": abs(path, "en"),
    },
  };
}

export function pageMetadata({
  title,
  description,
  path,
  locale,
  image,
}: {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  image?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: alternates(path),
    openGraph: {
      title,
      description,
      url: abs(path, locale),
      locale: locale === "ar" ? "ar_AE" : "en_AE",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

// ---------------------------------------------------------------- schema

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: site.name,
    alternateName: "Unikai",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/unikai-logo.png`,
    foundingDate: "1977",
    description: site.summary.en,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Al Quoz Industrial Area",
      postOfficeBoxNumber: "6424",
      addressLocality: "Dubai",
      addressCountry: "AE",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: "+971800864524",
        email: site.contact.email,
        areaServed: "AE",
        availableLanguage: ["en", "ar"],
      },
      {
        "@type": "ContactPoint",
        contactType: "investor relations",
        telephone: site.contact.investorContact.phone,
        email: site.contact.investorEmail,
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: site.contact.email,
        availableLanguage: ["en", "ar"],
      },
    ],
    sameAs: site.social
      .filter((s) => s.href)
      .map((s) => s.href as string),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: site.name,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: ["en", "ar"],
  };
}

export function breadcrumbSchema(
  crumbs: { name: string; path: string }[],
  locale: Locale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.path, locale),
    })),
  };
}

/**
 * Product schema.
 *
 * Deliberately omits `offers` — Unikai does not publish prices and inventing
 * an availability or price value would be both wrong and a structured-data
 * violation. Specs are emitted only where real data exists.
 */
export function productSchema(product: Product, locale: Locale, url: string) {
  const props = [
    ...(product.packSizes?.length
      ? [{ "@type": "PropertyValue", name: "Pack sizes", value: product.packSizes.join(", ") }]
      : []),
    ...(product.shelfLife
      ? [{ "@type": "PropertyValue", name: "Shelf life", value: product.shelfLife.en }]
      : []),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name.en,
    image: product.image ? [product.image] : undefined,
    description: product.description?.en,
    sku: product.sku,
    gtin13: product.barcode,
    brand: { "@type": "Brand", name: "Unikai" },
    manufacturer: { "@id": `${SITE_URL}/#organization` },
    url,
    ...(props.length ? { additionalProperty: props } : {}),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function jobPostingSchema(job: {
  title: string;
  description: string;
  datePosted: string;
  location: string;
  employmentType: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.datePosted,
    employmentType: job.employmentType,
    hiringOrganization: { "@id": `${SITE_URL}/#organization` },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location, addressCountry: "AE" },
    },
  };
}

export function articleSchema(a: {
  headline: string;
  datePublished: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.headline,
    datePublished: a.datePublished,
    description: a.description,
    url: a.url,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

// JsonLd lives in src/components/seo/JsonLd.tsx — this file stays JSX-free so
// it can be imported from non-React contexts (sitemap, proxy, scripts).
