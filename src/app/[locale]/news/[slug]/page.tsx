import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNews, news, sortedNews } from "@/content/news";
import type { Locale } from "@/content/types";
import { T, href, locales, t } from "@/lib/i18n";
import { abs, alternates, articleSchema, breadcrumbSchema } from "@/lib/seo";
import { Container, Section } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink, Arrow } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { NewsCard, formatDate } from "@/components/news/NewsStrip";

export function generateStaticParams() {
  return locales.flatMap((locale) => news.map((n) => ({ locale, slug: n.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getNews(slug);
  if (!item) return {};

  return {
    title: item.title.en,
    description: item.excerpt.en,
    alternates: alternates(`/news/${slug}`),
    openGraph: { type: "article", publishedTime: item.date },
  };
}

export default async function NewsItemPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const item = getNews(slug);
  if (!item) notFound();

  const related = sortedNews()
    .filter((n) => n.slug !== slug)
    .slice(0, 3);

  const crumbs = [
    { name: T("nav.news", locale), path: "/news" },
    { name: t(item.title, locale), path: `/news/${slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs, locale),
          articleSchema({
            headline: item.title.en,
            datePublished: item.date,
            description: item.excerpt.en,
            url: abs(`/news/${slug}`, locale),
          }),
        ]}
      />

      <PageHeader
        locale={locale}
        tone="cream"
        eyebrow={formatDate(item.date, locale)}
        title={t(item.title, locale)}
        crumbs={crumbs}
      />

      <Section tone="white">
        <Container size="narrow">
          <p className="t-lead font-medium text-ink">{t(item.excerpt, locale)}</p>

          {item.body && (
            <div className="mt-6 space-y-5">
              <p className="t-body">{t(item.body, locale)}</p>
            </div>
          )}

          {item.sourceUrl && (
            <div className="mt-10 rounded-2xl border border-ink-100 bg-ink-50 p-6">
              <p className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-ink-500">
                {locale === "ar" ? "المستند الأصلي" : "Source document"}
              </p>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 font-bold text-brand-navy hover:underline"
              >
                {locale === "ar" ? "تحميل ملف PDF" : "Download PDF"}
                <Arrow />
              </a>
            </div>
          )}

          <div className="mt-10">
            <ButtonLink href={href("/news", locale)} variant="ghost">
              {T("cta.back", locale)} — {T("nav.news", locale)}
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section tone="cream">
          <Container>
            <h2 className="t-h3 mb-7">
              {locale === "ar" ? "أخبار أخرى" : "More news"}
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              {related.map((n) => (
                <NewsCard key={n.slug} item={n} locale={locale} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
