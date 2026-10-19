import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRange, getSubRanges, ranges } from "@/content/products";
import type { Locale } from "@/content/types";
import { T, href, t } from "@/lib/i18n";
import { alternates, breadcrumbSchema } from "@/lib/seo";
import { Container, Section } from "@/components/ui/Container";
import { GapNotice, PageHeader } from "@/components/ui/PageHeader";
import { PackShot } from "@/components/ui/PackShot";
import { ButtonLink, Arrow } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { locales } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    ranges.map((r) => ({ locale, range: r.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; range: string }>;
}): Promise<Metadata> {
  const { range: slug } = await params;
  const range = getRange(slug);
  if (!range) return {};

  return {
    title: `${range.name.en} Range`,
    description: range.description?.en?.slice(0, 180),
    alternates: alternates(`/products/${slug}`),
    openGraph: { images: range.image ? [{ url: range.image }] : undefined },
  };
}

export default async function RangePage({
  params,
}: {
  params: Promise<{ locale: Locale; range: string }>;
}) {
  const { locale, range: slug } = await params;
  const range = getRange(slug);
  if (!range) notFound();

  const subs = getSubRanges(slug);
  const accent = range.accent === "red" ? "red" : "navy";

  const crumbs = [
    { name: T("nav.products", locale), path: "/products" },
    { name: t(range.name, locale), path: `/products/${slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs, locale)} />

      <PageHeader
        locale={locale}
        tone="navy"
        eyebrow={T("nav.products", locale)}
        title={t(range.name, locale)}
        lead={t(range.description, locale)}
        crumbs={crumbs}
      />

      <Section tone="white">
        <Container>
          <div className="mb-9 flex items-end justify-between gap-4">
            <h2 className="t-h3">
              <span className="nums-latin">{subs.length}</span>{" "}
              {T("label.subRanges", locale)}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {subs.map((sub) => (
              <Link
                key={sub.slug}
                href={href(`/products/${slug}/${sub.slug}`, locale)}
                className="card-lift group rounded-2xl border border-ink-100 bg-white p-4"
              >
                <PackShot
                  src={sub.image}
                  alt={t(sub.name, locale)}
                  tone={accent}
                  sizes="(max-width: 640px) 44vw, (max-width: 1024px) 30vw, 22vw"
                />
                <h3 className="mt-4 text-[0.9375rem] font-bold leading-snug tracking-tight text-ink transition-colors group-hover:text-brand-navy">
                  {t(sub.name, locale)}
                </h3>
                <span className="mt-2 inline-flex items-center gap-1.5 text-[0.75rem] font-bold text-brand-navy opacity-0 transition-opacity group-hover:opacity-100">
                  {T("cta.viewProducts", locale)}
                  <Arrow className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>

          {subs.some((s) => s.gaps?.length) && (
            <div className="mt-8">
              <GapNotice notes={subs.flatMap((s) => s.gaps ?? [])} />
            </div>
          )}
        </Container>
      </Section>

      {/* Other ranges */}
      <Section tone="cream">
        <Container>
          <h2 className="t-h3 mb-7">
            {locale === "ar" ? "مجموعات أخرى" : "Other ranges"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {ranges
              .filter((r) => r.slug !== slug)
              .map((r) => (
                <Link
                  key={r.slug}
                  href={href(`/products/${r.slug}`, locale)}
                  className="card-lift group flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-4"
                >
                  <PackShot
                    src={r.image}
                    alt=""
                    tone={r.accent === "red" ? "red" : "navy"}
                    className="h-16 w-16 shrink-0 rounded-xl"
                    sizes="64px"
                  />
                  <div>
                    <p className="font-bold text-ink transition-colors group-hover:text-brand-navy">
                      {t(r.name, locale)}
                    </p>
                    <p className="mt-0.5 text-[0.8125rem] text-ink-500">
                      <span className="nums-latin">{getSubRanges(r.slug).length}</span>{" "}
                      {T("label.subRanges", locale)}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </Container>
      </Section>

      <Section tone="white">
        <Container size="narrow">
          <div className="mb-8 text-center">
            <h2 className="t-h2">
              {locale === "ar"
                ? `استفسر عن مجموعة ${t(range.name, locale)}`
                : `Enquire about the ${t(range.name, locale)} range`}
            </h2>
            <p className="t-lead mt-4">
              {locale === "ar"
                ? "أرسل استفسارك وسيتواصل معك الفريق المختص بالمواصفات والخطوات التالية."
                : "Send an enquiry and the relevant team will come back with specifications and next steps."}
            </p>
          </div>
          <EnquiryForm
            locale={locale}
            defaultType="distribution"
            productContext={`${range.name.en} range`}
          />
        </Container>
      </Section>

      <div className="border-t border-ink-100 bg-cream py-10">
        <Container>
          <ButtonLink href={href("/products", locale)} variant="ghost">
            {T("cta.back", locale)} — {T("nav.allRanges", locale)}
          </ButtonLink>
        </Container>
      </div>
    </>
  );
}
