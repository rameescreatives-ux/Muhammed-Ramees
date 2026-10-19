import type { Metadata } from "next";
import { Hero, type Slide } from "@/components/home/Hero";
import {
  ContactBand,
  ExportBand,
  Intro,
  RangeGrid,
  Strengths,
} from "@/components/home/Sections";
import { NewsStrip } from "@/components/news/NewsStrip";
import { LEGACY_ORIGIN } from "@/content/site";
import type { Locale } from "@/content/types";
import { alternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Unikai Foods PJSC — UAE Dairy, Ice Cream, Juice & Food Manufacturer",
  description:
    "Unikai Foods PJSC has manufactured dairy, ice cream, juices and foods in the UAE since 1977. Explore four product ranges and enquire about distribution, wholesale or export.",
  alternates: alternates("/"),
};

/**
 * Hero banner seed.
 *
 * In production these come from the `banners` table and are scheduled and
 * reordered by marketing from the admin dashboard. Copy here is derived from
 * Unikai's own published positioning — no invented claims, no figures the
 * company has not stated publicly.
 */
const slides: Slide[] = [
  {
    id: "heritage",
    tone: "deep",
    eyebrow: { en: "Since 1977", ar: "منذ ١٩٧٧" },
    title: {
      en: "Come home to a household name",
      ar: "اسم تعرفه كل بيت",
    },
    body: {
      en: "Unikai Foods PJSC has produced dairy, ice cream, juices and foods in the UAE for nearly five decades — a diversified FMCG portfolio built on consistent quality.",
      ar: "تنتج يونيكاي فودز ش.م.ع منتجات الألبان والآيس كريم والعصائر والأغذية في الإمارات منذ قرابة خمسة عقود — محفظة متنوعة قوامها الجودة الثابتة.",
    },
    cta: { label: { en: "Explore our ranges", ar: "استكشف مجموعاتنا" }, path: "/products" },
    secondary: { label: { en: "About Unikai", ar: "من نحن" }, path: "/about" },
    image: `${LEGACY_ORIGIN}/wp-content/uploads/2016/02/Dairy-range-website-1.png`,
  },
  {
    id: "export",
    tone: "navy",
    eyebrow: { en: "Export & Distribution", ar: "التصدير والتوزيع" },
    title: {
      en: "Bring Unikai to your market",
      ar: "أدخل يونيكاي إلى سوقك",
    },
    body: {
      en: "We supply international markets through appointed distributors. Tell us your destination country, products and volumes, and our export team will set out the process.",
      ar: "نزوّد الأسواق الدولية عبر موزعين معتمدين. أخبرنا بدولتك والمنتجات والكميات، وسيوضح لك فريق التصدير الخطوات.",
    },
    cta: { label: { en: "Start an export enquiry", ar: "ابدأ استفسار التصدير" }, path: "/export" },
    secondary: { label: { en: "View products", ar: "عرض المنتجات" }, path: "/products" },
    image: `${LEGACY_ORIGIN}/wp-content/uploads/2016/02/Juice-beverage-Range-1.png`,
  },
  {
    id: "icecream",
    tone: "red",
    eyebrow: { en: "Ice Cream", ar: "الآيس كريم" },
    title: {
      en: "Eight sub-ranges, one freezer",
      ar: "ثماني مجموعات فرعية، فريزر واحد",
    },
    body: {
      en: "Lollies and bars, cones and sandwiches, soft scoop, kulfi, a sugar-free line and the Royal Treat premium range — impulse and take-home, from one manufacturer.",
      ar: "مصاصات وألواح، كونز وساندويتش، سوفت سكوب، كُلفي، خط خالٍ من السكر ومجموعة رويال تريت الفاخرة — من مصنّع واحد.",
    },
    cta: { label: { en: "See the ice cream range", ar: "شاهد مجموعة الآيس كريم" }, path: "/products/ice-cream" },
    image: `${LEGACY_ORIGIN}/wp-content/uploads/2016/02/Ice-cream-Range-Website-1.png`,
  },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <>
      <Hero slides={slides} locale={locale} />
      <RangeGrid locale={locale} />
      <Intro locale={locale} />
      <Strengths locale={locale} />
      <ExportBand locale={locale} />
      <NewsStrip locale={locale} limit={3} />
      <ContactBand locale={locale} />
    </>
  );
}
