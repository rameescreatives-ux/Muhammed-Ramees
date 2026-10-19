import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProducts,
  getRange,
  getSubRange,
  getSubRanges,
  subRanges,
} from "@/content/products";
import type { Locale } from "@/content/types";
import { T, href, locales, t } from "@/lib/i18n";
import { alternates, breadcrumbSchema } from "@/lib/seo";
import { Container, Section } from "@/components/ui/Container";
import { GapNotice, PageHeader } from "@/components/ui/PageHeader";
import { PackShot } from "@/components/ui/PackShot";
import { ButtonLink, Arrow } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { EnquiryForm } from "@/components/forms/EnquiryForm";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    subRanges.map((s) => ({ locale, range: s.range, sub: s.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; range: string; sub: string }>;
}): Promise<Metadata> {
  const { range, sub } = await params;
  const subRange = getSubRange(range, sub);
  const parent = getRange(range);
  if (!subRange || !parent) return {};

  return {
    title: `${subRange.name.en} — ${parent.name.en}`,
    description: `${subRange.name.en} from Unikai Foods, part of the Unikai ${parent.name.en} range. Produced in the UAE. Trade, wholesale and export enquiries welcome.`,
    alternates: alternates(`/products/${range}/${sub}`),
    openGraph: { images: subRange.image ? [{ url: subRange.image }] : undefined },
  };
}

export default async function SubRangePage({
  params,
}: {
  params: Promise<{ locale: Locale; range: string; sub: string }>;
}) {
  const { locale, range: rangeSlug, sub: subSlug } = await params;
  const range = getRange(rangeSlug);
  const sub = getSubRange(rangeSlug, subSlug);
  if (!range || !sub) notFound();

  const items = getProducts(rangeSlug, subSlug);
  const siblings = getSubRanges(rangeSlug).filter((s) => s.slug !== subSlug);
  const accent = range.accent === "red" ? "red" : "navy";

  const crumbs = [
    { name: T("nav.products", locale), path: "/products" },
    { name: t(range.name, locale), path: `/products/${rangeSlug}` },
    { name: t(sub.name, locale), path: `/products/${rangeSlug}/${subSlug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs, locale)} />

      <PageHeader
        locale={locale}
        tone="cream"
        eyebrow={t(range.name, locale)}
        title={t(sub.name, locale)}
        crumbs={crumbs}
      />

      <Section tone="white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <PackShot
                src={sub.image}
                alt={t(sub.name, locale)}
                tone={accent}
                sizes="(max-width: 1024px) 90vw, 420px"
                priority
              />
            </div>

            <div>
              <h2 className="t-h3">
                {locale === "ar" ? "عن هذه المجموعة" : "About this sub-range"}
              </h2>
              <p className="t-body mt-4">
                {t(sub.description, locale) ||
                  (locale === "ar"
                    ? `${t(sub.name, locale)} جزء من مجموعة ${t(range.name, locale)} من يونيكاي، وتُنتج في منشآت الشركة بدولة الإمارات.`
                    : `${t(sub.name, locale)} is part of the Unikai ${t(range.name, locale)} range, produced at the company's UAE facilities and distributed across the UAE and Oman.`)}
              </p>

              {items.length > 0 ? (
                <>
                  <h3 className="t-h3 mt-10">
                    {locale === "ar" ? "المنتجات" : "Products"}
                  </h3>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {items.map((p) => (
                      <Link
                        key={p.slug}
                        href={href(
                          `/products/${rangeSlug}/${subSlug}/${p.slug}`,
                          locale,
                        )}
                        className="card-lift group rounded-2xl border border-ink-100 bg-white p-4"
                      >
                        <PackShot
                          src={p.image}
                          alt={t(p.name, locale)}
                          tone={accent}
                          sizes="(max-width: 640px) 80vw, 260px"
                        />
                        <p className="mt-4 font-bold leading-snug text-ink transition-colors group-hover:text-brand-navy">
                          {t(p.name, locale)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-8 rounded-2xl border border-ink-100 bg-ink-50 p-6">
                  <p className="font-bold text-ink">
                    {locale === "ar"
                      ? "قائمة المنتجات قيد الإعداد"
                      : "Individual product listings in preparation"}
                  </p>
                  <p className="t-body mt-2 text-[0.9375rem]">
                    {locale === "ar"
                      ? "تتوفر المواصفات الكاملة وأحجام العبوات وتفاصيل التعبئة لهذه المجموعة عند الطلب من فريق المبيعات."
                      : "Full specifications, pack sizes and case configurations for this sub-range are available on request from the sales team."}
                  </p>
                  <ButtonLink href={href("/contact", locale)} className="mt-5" size="sm">
                    {T("cta.enquire", locale)}
                    <Arrow />
                  </ButtonLink>
                </div>
              )}

              <div className="mt-8">
                <GapNotice notes={sub.gaps ?? []} />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {siblings.length > 0 && (
        <Section tone="cream">
          <Container>
            <h2 className="t-h3 mb-7">
              {locale === "ar"
                ? `المزيد من ${t(range.name, locale)}`
                : `More from ${t(range.name, locale)}`}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {siblings.slice(0, 5).map((s) => (
                <Link
                  key={s.slug}
                  href={href(`/products/${rangeSlug}/${s.slug}`, locale)}
                  className="card-lift group rounded-2xl border border-ink-100 bg-white p-3"
                >
                  <PackShot src={s.image} alt="" tone={accent} sizes="180px" />
                  <p className="mt-3 text-[0.8125rem] font-bold leading-snug text-ink transition-colors group-hover:text-brand-navy">
                    {t(s.name, locale)}
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section tone="white">
        <Container size="narrow">
          <h2 className="t-h2 text-center">{T("cta.enquireProduct", locale)}</h2>
          <p className="t-lead mt-4 text-center">
            {locale === "ar"
              ? "أخبرنا بما تحتاجه وسنعود إليك بالمواصفات والخطوات."
              : "Tell us what you need and we'll come back with specifications and next steps."}
          </p>
          <div className="mt-9">
            <EnquiryForm
              locale={locale}
              defaultType="distribution"
              productContext={`${range.name.en} → ${sub.name.en}`}
            />
          </div>
        </Container>
      </Section>
    </>
  );
}
