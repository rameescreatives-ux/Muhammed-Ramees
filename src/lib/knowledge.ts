import { ranges, subRanges, products } from "@/content/products";
import { aboutCopy, careersCopy, mission, site, values, vision } from "@/content/site";
import type { Locale } from "@/content/types";
import { t, tArray } from "./i18n";

/**
 * The chatbot's entire universe of facts.
 *
 * Everything the assistant can say is derived from this file, which is built
 * only from content published on unikai.com. There is no open-web retrieval
 * and no model general knowledge in the answer path — for a food business,
 * a confidently invented allergen, certification or export market is a
 * liability, not a UX quirk.
 */

export interface Passage {
  id: string;
  title: string;
  body: string;
  /** Locale-aware link the assistant can offer. */
  path?: string;
  keywords: string[];
}

export function buildKnowledge(locale: Locale): Passage[] {
  const p: Passage[] = [];

  p.push({
    id: "company",
    title: "About Unikai",
    body: `${t(site.summary, locale)} ${tArray(aboutCopy.body, locale).slice(0, 2).join(" ")}`,
    path: "/about",
    keywords: ["about", "company", "who", "history", "founded", "1977", "unikai", "pjsc", "dubai"],
  });

  p.push({
    id: "mission",
    title: "Mission and vision",
    body: `Mission: ${t(mission, locale)} Vision: ${t(vision, locale)} Values: ${values
      .map((v) => t(v.title, locale))
      .join(", ")}.`,
    path: "/about",
    keywords: ["mission", "vision", "values", "purpose"],
  });

  p.push({
    id: "contact",
    title: "Contact",
    body: `Head office: ${t(site.contact.headOffice, locale)}. Telephone ${site.contact.toll}. General enquiries ${site.contact.email}. Investor relations: ${site.contact.investorContact.name}, ${site.contact.investorContact.phone}, ${site.contact.investorEmail}. Careers: ${site.contact.careersEmail}.`,
    path: "/contact",
    keywords: ["contact", "phone", "email", "address", "office", "reach", "call", "location"],
  });

  for (const r of ranges) {
    const subs = subRanges.filter((s) => s.range === r.slug);
    p.push({
      id: `range-${r.slug}`,
      title: `${t(r.name, locale)} range`,
      body: `${t(r.description, locale)} Sub-ranges: ${subs.map((s) => t(s.name, locale)).join(", ")}.`,
      path: `/products/${r.slug}`,
      keywords: [
        r.slug,
        ...t(r.name, locale).toLowerCase().split(/\s+/),
        ...subs.flatMap((s) => t(s.name, locale).toLowerCase().split(/\s+/)),
      ],
    });
  }

  for (const s of subRanges) {
    p.push({
      id: `sub-${s.range}-${s.slug}`,
      title: t(s.name, locale),
      body: `${t(s.name, locale)} is part of the Unikai ${t(ranges.find((r) => r.slug === s.range)?.name, locale)} range.`,
      path: `/products/${s.range}/${s.slug}`,
      keywords: [s.slug, ...t(s.name, locale).toLowerCase().split(/\s+/)],
    });
  }

  for (const prod of products) {
    p.push({
      id: `product-${prod.slug}`,
      title: t(prod.name, locale),
      body: [
        t(prod.name, locale),
        prod.description ? t(prod.description, locale) : "",
        prod.packSizes?.length ? `Pack sizes: ${prod.packSizes.join(", ")}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
      path: `/products/${prod.range}/${prod.subRange}/${prod.slug}`,
      keywords: [prod.slug, ...t(prod.name, locale).toLowerCase().split(/\s+/)],
    });
  }

  p.push({
    id: "export",
    title: "Export and international distribution",
    body: "Unikai supplies international markets through appointed distributors. Export enquiries are handled by the export team, who confirm product availability for your market, the documentation required, and commercial terms. To start, submit an export enquiry with your destination country, the products you are interested in, your company details and estimated volumes.",
    path: "/export",
    keywords: ["export", "import", "importing", "exporting", "international", "overseas", "ship", "country", "distributor", "distribution", "markets", "documentation", "shipping"],
  });

  p.push({
    id: "distribution",
    title: "UAE and Oman distribution, wholesale and retail supply",
    body: "Unikai operates an extensive distribution network across the UAE and Oman supplying retail, wholesale and trade customers. For wholesale, retail supply or HORECA enquiries, submit a distribution enquiry and the local sales team will respond with the relevant process.",
    path: "/contact",
    keywords: ["wholesale", "retail", "supply", "buy", "purchase", "order", "stock", "trade", "horeca", "supermarket", "uae", "oman", "distribution"],
  });

  p.push({
    id: "careers",
    title: "Careers",
    body: `${t(careersCopy.environment.body, locale)} Applications are made through the careers page. Important: Unikai has not appointed any agent to recruit on its behalf and will never ask candidates for payment. All recruiter email addresses end in @Unikai.com.`,
    path: "/careers",
    keywords: ["career", "careers", "job", "jobs", "vacancy", "hiring", "work", "apply", "recruitment", "cv"],
  });

  p.push({
    id: "investors",
    title: "Investor relations",
    body: `Unikai Foods PJSC is listed on the Dubai Financial Market under the ticker ${site.dfm.ticker}. Financial statements, integrated reports, general assembly materials and disclosures are published in the investor relations section. Investor contact: ${site.contact.investorContact.name}, ${site.contact.investorEmail}.`,
    path: "/investor-relations",
    keywords: ["investor", "investors", "share", "shares", "stock", "dfm", "financial", "results", "dividend", "annual", "report", "shareholder"],
  });

  p.push({
    id: "quality",
    title: "Quality and certifications",
    body: "Unikai products are produced at the company's UAE facilities and pass quality assurance before distribution. Specific certification details are confirmed by the quality team — the assistant does not state which certifications apply to a given product.",
    path: "/quality",
    keywords: ["quality", "certification", "certified", "halal", "iso", "haccp", "food safety", "standard", "audit"],
  });

  return p;
}

const STOP = new Set([
  "the", "a", "an", "is", "are", "do", "does", "you", "your", "i", "we", "for",
  "to", "of", "and", "in", "on", "can", "what", "how", "me", "my", "it", "with",
  "have", "has", "about", "please", "tell", "would", "like", "there", "any",
]);

/** Lightweight lexical retrieval — no embeddings service required. */
export function retrieve(query: string, passages: Passage[], k = 4): Passage[] {
  const terms = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

  if (!terms.length) return [];

  const scored = passages.map((p) => {
    const hay = `${p.title} ${p.body}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      for (const kw of p.keywords) {
        if (kw === term) score += 3;
        else if (kw.includes(term) || term.includes(kw)) score += 1;
      }
      if (hay.includes(term)) score += 1.5;
    }
    return { p, score };
  });

  return scored
    .filter((s) => s.score > 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.p);
}

/** Classify commercial intent so leads route to the right department. */
export function classifyIntent(
  text: string,
): "export" | "distribution" | "general" | "partnership" | null {
  const q = text.toLowerCase();

  // Prefix matching, not whole-word: a trailing \b after a stem like
  // "distribut" can never match "distributor" or "distributing", which are
  // exactly the words a real trade enquiry uses.
  if (/\b(export|import|overseas|international|ship to|another country|abroad|customs|documentation)/.test(q))
    return "export";
  if (/\b(distribut|wholesal|bulk|retail|supply|supplying|stock|supermarket|horeca|resell|trade)/.test(q))
    return "distribution";
  if (/\b(supplier|partner|vendor|media|press|journalist|co-?manufact)/.test(q))
    return "partnership";
  if (/\b(buy|purchas|price|order|quote|quotation)/.test(q)) return "distribution";
  return null;
}
