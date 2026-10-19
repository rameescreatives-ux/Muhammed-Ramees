import Link from "next/link";
import type { Locale, NewsItem } from "@/content/types";
import { sortedNews } from "@/content/news";
import { T, href, t } from "@/lib/i18n";
import { Container, Eyebrow, Section } from "@/components/ui/Container";
import { ButtonLink, Arrow } from "@/components/ui/Button";

export function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-AE" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

const categoryLabel: Record<NewsItem["category"], { en: string; ar: string }> = {
  "press-release": { en: "Press release", ar: "بيان صحفي" },
  announcement: { en: "Disclosure", ar: "إفصاح" },
  "media-coverage": { en: "Media coverage", ar: "تغطية إعلامية" },
};

export function NewsStrip({ locale, limit = 3 }: { locale: Locale; limit?: number }) {
  const items = sortedNews().slice(0, limit);
  if (!items.length) return null;

  return (
    <Section tone="white">
      <Container>
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>{T("nav.news", locale)}</Eyebrow>
            <h2 className="t-h2 mt-3">
              {locale === "ar" ? "آخر المستجدات" : "Latest from Unikai"}
            </h2>
          </div>
          <ButtonLink href={href("/news", locale)} variant="ghost" className="self-start sm:self-auto">
            {T("cta.allNews", locale)}
            <Arrow />
          </ButtonLink>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.slug} item={item} locale={locale} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function NewsCard({ item, locale }: { item: NewsItem; locale: Locale }) {
  return (
    <Link
      href={href(`/news/${item.slug}`, locale)}
      className="card-lift group flex flex-col rounded-2xl border border-ink-100 bg-white p-6"
    >
      <div className="flex items-center gap-3 text-[0.6875rem] font-bold uppercase tracking-[0.12em]">
        <span className="rounded-full bg-brand-navy-50 px-2.5 py-1 text-brand-navy">
          {t(categoryLabel[item.category], locale)}
        </span>
        <time dateTime={item.date} className="text-ink-500">
          {formatDate(item.date, locale)}
        </time>
      </div>

      <h3 className="mt-4 flex-1 text-[1.0625rem] font-bold leading-snug tracking-tight text-ink transition-colors group-hover:text-brand-navy">
        {t(item.title, locale)}
      </h3>

      <p className="mt-3 line-clamp-3 text-[0.875rem] leading-relaxed text-ink-500">
        {t(item.excerpt, locale)}
      </p>

      <span className="mt-5 inline-flex items-center gap-2 text-[0.8125rem] font-bold text-brand-navy">
        {T("cta.readMore", locale)}
        <Arrow className="transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
      </span>
    </Link>
  );
}
