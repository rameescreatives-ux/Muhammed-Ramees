import { ranges } from "@/content/products";

export interface NavItem {
  key: string;
  path: string;
  /** Mega-menu columns, products only. */
  mega?: boolean;
}

/**
 * Main navigation. Export & Distribution is promoted to top level because the
 * site is B2B-led and the legacy site had no export path at all.
 */
export const mainNav: NavItem[] = [
  { key: "nav.products", path: "/products", mega: true },
  { key: "nav.about", path: "/about" },
  { key: "nav.quality", path: "/quality" },
  { key: "nav.export", path: "/export" },
  { key: "nav.news", path: "/news" },
  { key: "nav.investors", path: "/investor-relations" },
  { key: "nav.careers", path: "/careers" },
  { key: "nav.contact", path: "/contact" },
];

export const rangeNav = () =>
  ranges.map((r) => ({ slug: r.slug, name: r.name, image: r.image }));

/** Investor Relations sub-navigation — mirrors the legacy IR structure. */
export const irNav = [
  { slug: "", key: "ir.overview", en: "Overview", ar: "نظرة عامة" },
  { slug: "structure-and-governance", key: "ir.governance", en: "Structure & Governance", ar: "الهيكل والحوكمة" },
  { slug: "key-figures", key: "ir.figures", en: "Key Figures", ar: "المؤشرات الرئيسية" },
  { slug: "results-and-presentations", key: "ir.results", en: "Results & Presentations", ar: "النتائج والعروض" },
  { slug: "integrated-reports", key: "ir.reports", en: "Integrated Reports", ar: "التقارير المتكاملة" },
  { slug: "annual-general-meetings", key: "ir.agm", en: "General Assembly Meetings", ar: "اجتماعات الجمعية العمومية" },
  { slug: "announcements", key: "ir.announcements", en: "Announcements", ar: "الإفصاحات" },
  { slug: "unclaimed-dividends", key: "ir.dividends", en: "Unclaimed Dividends", ar: "الأرباح غير المطالب بها" },
  { slug: "disclaimer", key: "ir.disclaimer", en: "Disclaimer", ar: "إخلاء المسؤولية" },
];
