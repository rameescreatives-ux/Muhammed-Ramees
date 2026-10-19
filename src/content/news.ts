import type { NewsItem } from "./types";
import { LEGACY_ORIGIN } from "./site";

/**
 * News & announcements.
 *
 * The legacy site has NO news section — the footer "In the News" link is one
 * of the broken self-referencing links found in the audit. What it does have
 * is a dated record of regulatory disclosures on the investor-relations pages.
 *
 * Those disclosures are real, dated, published facts, so they seed the news
 * section rather than leaving it empty. Each entry links to the actual source
 * document. Marketing adds editorial news from the dashboard; nothing here is
 * invented, and no entry claims more than the document itself states.
 */

const DOC = `${LEGACY_ORIGIN}/wp-content/uploads`;

export const news: NewsItem[] = [
  {
    slug: "h1-2026-financial-statements",
    date: "2026-08-14",
    category: "announcement",
    title: {
      en: "Unikai Foods publishes interim financial statements for the period ended 30 June 2026",
      ar: "يونيكاي فودز تنشر البيانات المالية المرحلية للفترة المنتهية في ٣٠ يونيو ٢٠٢٦",
    },
    excerpt: {
      en: "The reviewed interim condensed consolidated financial statements for the six months ended 30 June 2026 have been published in the investor relations section.",
      ar: "تم نشر البيانات المالية المرحلية الموجزة الموحدة للأشهر الستة المنتهية في ٣٠ يونيو ٢٠٢٦ في قسم علاقات المستثمرين.",
    },
    sourceUrl: `${DOC}/2021/08/UNIKAI-FOODS-PJSC-CONSO-JUN-2026.pdf`,
  },
  {
    slug: "q1-2026-financial-statements",
    date: "2026-05-14",
    category: "announcement",
    title: {
      en: "First quarter 2026 financial statements published",
      ar: "نشر البيانات المالية للربع الأول من عام ٢٠٢٦",
    },
    excerpt: {
      en: "Interim condensed consolidated financial statements for the three months ended 31 March 2026 are available to download.",
      ar: "تتوفر البيانات المالية المرحلية الموجزة الموحدة للأشهر الثلاثة المنتهية في ٣١ مارس ٢٠٢٦ للتحميل.",
    },
    sourceUrl: `${DOC}/2021/08/UNIKAI-FOODS-PJSC-CONSO-MAR-2026.pdf`,
  },
  {
    slug: "integrated-report-2025",
    date: "2026-03-17",
    category: "press-release",
    title: {
      en: "Unikai Foods releases its 2025 Integrated Report",
      ar: "يونيكاي فودز تصدر تقريرها المتكامل لعام ٢٠٢٥",
    },
    excerpt: {
      en: "The company's Integrated Report for the 2025 financial year has been published alongside the audited financial statements for the year ended 31 December 2025.",
      ar: "تم نشر التقرير المتكامل للسنة المالية ٢٠٢٥ إلى جانب البيانات المالية المدققة للسنة المنتهية في ٣١ ديسمبر ٢٠٢٥.",
    },
    sourceUrl: `${DOC}/2022/03/Integrated-Reports-FY-2025_Batch-Compress.pdf`,
  },
  {
    slug: "preliminary-results-2025",
    date: "2026-02-13",
    category: "announcement",
    title: {
      en: "Preliminary financial results for 2025 announced",
      ar: "الإعلان عن النتائج المالية الأولية لعام ٢٠٢٥",
    },
    excerpt: {
      en: "Preliminary results for the financial year ended 31 December 2025 have been disclosed to the market.",
      ar: "تم الإفصاح عن النتائج الأولية للسنة المالية المنتهية في ٣١ ديسمبر ٢٠٢٥.",
    },
    sourceUrl: `${DOC}/2021/08/Preliminary-Results-.pdf`,
  },
  {
    slug: "integrated-report-2024",
    date: "2025-03-23",
    category: "press-release",
    title: {
      en: "2024 Integrated Report published",
      ar: "نشر التقرير المتكامل لعام ٢٠٢٤",
    },
    excerpt: {
      en: "Unikai Foods PJSC published its Integrated Report for the 2024 financial year.",
      ar: "نشرت يونيكاي فودز ش.م.ع تقريرها المتكامل للسنة المالية ٢٠٢٤.",
    },
    sourceUrl: `${DOC}/2022/03/Integrated-Reports-FY-2024_EN.pdf`,
  },
];

export const getNews = (slug: string) => news.find((n) => n.slug === slug);

export const sortedNews = () =>
  [...news].sort((a, b) => b.date.localeCompare(a.date));
