import type { I18nString, Locale } from "@/content/types";

export const locales: Locale[] = ["en", "ar"];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

export const dir = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");

export const isLocale = (v: string): v is Locale =>
  locales.includes(v as Locale);

/**
 * Resolve a bilingual string. Arabic falls back to English when a professional
 * translation has not yet been supplied — a visible English string beats an
 * empty one, and the gap is tracked in src/content/gaps.ts.
 */
export function t(value: I18nString | undefined, locale: Locale): string {
  if (!value) return "";
  if (locale === "ar") return value.ar?.trim() ? value.ar : value.en;
  return value.en;
}

export function tArray(
  value: { en: string[]; ar?: string[] } | undefined,
  locale: Locale,
): string[] {
  if (!value) return [];
  if (locale === "ar" && value.ar?.length) return value.ar;
  return value.en;
}

/**
 * Static-preview mode.
 *
 * `src/proxy.ts` rewrites unprefixed paths to /en internally, so in a normal
 * deployment English lives at the root. A static export has no proxy, so the
 * /en prefix has to be real. This flag is set only for the preview build and
 * is off in every real deployment.
 */
const STATIC_PREVIEW = process.env.NEXT_PUBLIC_STATIC_PREVIEW === "true";

/** Build a locale-aware href. English is served at the root, Arabic under /ar. */
export function href(path: string, locale: Locale): string {
  const clean = path === "/" ? "" : path.replace(/\/$/, "");
  if (STATIC_PREVIEW) {
    // Explicit index.html: a plain static host does not reliably resolve
    // /path/ to /path/index.html, and a preview that 404s is worthless.
    const [p, hash = ""] = clean.split("#");
    return `/${locale}${p}/index.html${hash ? `#${hash}` : ""}`;
  }
  return locale === "en" ? clean || "/" : `/ar${clean}`;
}

/** Swap the locale on the current pathname, preserving the rest of the route. */
export function swapLocale(pathname: string, to: Locale): string {
  const stripped = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
  return href(stripped, to);
}

// ---------------------------------------------------------------- UI strings

type Dict = Record<string, I18nString>;

export const ui: Dict = {
  // nav
  "nav.products": { en: "Products", ar: "المنتجات" },
  "nav.about": { en: "About", ar: "من نحن" },
  "nav.quality": { en: "Quality", ar: "الجودة" },
  "nav.export": { en: "Export", ar: "التصدير" },
  "nav.news": { en: "News", ar: "الأخبار" },
  "nav.investors": { en: "Investor Relations", ar: "علاقات المستثمرين" },
  "nav.careers": { en: "Careers", ar: "الوظائف" },
  "nav.contact": { en: "Contact", ar: "اتصل بنا" },
  "nav.menu": { en: "Menu", ar: "القائمة" },
  "nav.close": { en: "Close", ar: "إغلاق" },
  "nav.allRanges": { en: "View all ranges", ar: "عرض جميع المجموعات" },
  "nav.skip": { en: "Skip to content", ar: "تخطَّ إلى المحتوى" },

  // generic
  "cta.enquire": { en: "Make an enquiry", ar: "أرسل استفساراً" },
  "cta.enquireProduct": { en: "Enquire about this product", ar: "استفسر عن هذا المنتج" },
  "cta.becomeDistributor": { en: "Become a distributor", ar: "كن موزعاً" },
  "cta.exploreRange": { en: "Explore the range", ar: "استكشف المجموعة" },
  "cta.viewProducts": { en: "View products", ar: "عرض المنتجات" },
  "cta.readMore": { en: "Read more", ar: "اقرأ المزيد" },
  "cta.allNews": { en: "All news", ar: "كل الأخبار" },
  "cta.downloadCatalogue": { en: "Download trade catalogue", ar: "تحميل الكتالوج التجاري" },
  "cta.submit": { en: "Send enquiry", ar: "إرسال الاستفسار" },
  "cta.apply": { en: "Apply now", ar: "قدّم الآن" },
  "cta.back": { en: "Back", ar: "رجوع" },

  "label.ranges": { en: "Ranges", ar: "المجموعات" },
  "label.subRanges": { en: "sub-ranges", ar: "مجموعة فرعية" },
  "label.products": { en: "products", ar: "منتج" },
  "label.home": { en: "Home", ar: "الرئيسية" },
  "label.since": { en: "Since 1977", ar: "منذ ١٩٧٧" },
  "label.specifications": { en: "Specifications", ar: "المواصفات" },
  "label.packSizes": { en: "Pack sizes", ar: "أحجام العبوات" },
  "label.shelfLife": { en: "Shelf life", ar: "مدة الصلاحية" },
  "label.storage": { en: "Storage", ar: "التخزين" },
  "label.ingredients": { en: "Ingredients", ar: "المكونات" },
  "label.nutritionals": { en: "Nutritional information", ar: "المعلومات الغذائية" },
  "label.certifications": { en: "Certifications", ar: "الشهادات" },
  "label.downloads": { en: "Downloads", ar: "التحميلات" },
  "label.sku": { en: "SKU", ar: "رمز المنتج" },
  "label.barcode": { en: "Barcode", ar: "الباركود" },
  "label.pending": { en: "Awaiting data", ar: "بانتظار البيانات" },
  "label.contactForSpecs": {
    en: "Full specifications available on request",
    ar: "المواصفات الكاملة متاحة عند الطلب",
  },

  // forms
  "form.name": { en: "Full name", ar: "الاسم الكامل" },
  "form.company": { en: "Company", ar: "الشركة" },
  "form.email": { en: "Work email", ar: "البريد الإلكتروني" },
  "form.phone": { en: "Phone", ar: "الهاتف" },
  "form.country": { en: "Country", ar: "الدولة" },
  "form.enquiryType": { en: "Enquiry type", ar: "نوع الاستفسار" },
  "form.products": { en: "Products of interest", ar: "المنتجات المطلوبة" },
  "form.volume": { en: "Estimated volume", ar: "الكمية التقديرية" },
  "form.message": { en: "Message", ar: "الرسالة" },
  "form.consent": {
    en: "I agree that Unikai may contact me about this enquiry.",
    ar: "أوافق على أن تتواصل معي يونيكاي بخصوص هذا الاستفسار.",
  },
  "form.required": { en: "Required", ar: "مطلوب" },
  "form.sending": { en: "Sending…", ar: "جارٍ الإرسال…" },
  "form.success": {
    en: "Thank you — your enquiry has been received. The relevant team will be in touch.",
    ar: "شكراً لك — تم استلام استفسارك وسيتواصل معك الفريق المختص.",
  },
  "form.error": {
    en: "Something went wrong. Please try again, or email us directly.",
    ar: "حدث خطأ ما. يرجى المحاولة مرة أخرى أو مراسلتنا مباشرة.",
  },

  "enquiry.export": { en: "Export / international distribution", ar: "التصدير / التوزيع الدولي" },
  "enquiry.distribution": { en: "UAE & Oman distribution / wholesale", ar: "التوزيع والجملة في الإمارات وعُمان" },
  "enquiry.general": { en: "General or product enquiry", ar: "استفسار عام أو عن المنتجات" },
  "enquiry.partnership": { en: "Supplier, partnership or media", ar: "توريد أو شراكة أو إعلام" },

  // chatbot
  "chat.title": { en: "Unikai Assistant", ar: "مساعد يونيكاي" },
  "chat.open": { en: "Chat with us", ar: "تحدّث معنا" },
  "chat.placeholder": { en: "Ask about our products or export process…", ar: "اسأل عن منتجاتنا أو عملية التصدير…" },
  "chat.greeting": {
    en: "Hello. I can answer questions about Unikai's product ranges, company information and export or distribution process. How can I help?",
    ar: "مرحباً. يمكنني الإجابة عن أسئلتك حول مجموعات منتجات يونيكاي ومعلومات الشركة وعملية التصدير أو التوزيع. كيف يمكنني المساعدة؟",
  },
  "chat.disclaimer": {
    en: "Answers come from Unikai's published information. Prices, stock and commercial terms are confirmed by our sales team.",
    ar: "تستند الإجابات إلى معلومات يونيكاي المنشورة. يؤكد فريق المبيعات الأسعار والتوافر والشروط التجارية.",
  },

  // footer
  "footer.rights": { en: "All rights reserved.", ar: "جميع الحقوق محفوظة." },
  "footer.privacy": { en: "Privacy Policy", ar: "سياسة الخصوصية" },
  "footer.cookies": { en: "Cookie Policy", ar: "سياسة ملفات تعريف الارتباط" },
  "footer.follow": { en: "Connect with us", ar: "تواصل معنا" },
  "footer.headOffice": { en: "Head office", ar: "المكتب الرئيسي" },
};

export const T = (key: string, locale: Locale) => t(ui[key], locale);
