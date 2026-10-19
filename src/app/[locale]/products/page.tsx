import Link from "next/link";
import type { Metadata } from "next";
import { ranges, subRanges } from "@/content/products";
import type { Locale } from "@/content/types";
import { T, href, t } from "@/lib/i18n";
import { alternates, breadcrumbSchema } from "@/lib/seo";
import { cn } from "@/lib/cn";
import { Container, Section } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PackShot } from "@/components/ui/PackShot";
import { ButtonLink, Arrow } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Products — Dairy, Ice Cream, Juices & Foods",
  description:
    "Browse the full Unikai product catalogue: fresh and long-life dairy, a complete ice cream portfolio, fresh and long-life juices, and Delite cheese, cakes, nuts and basmati rice.",
  alternates: alternates("/products"),
};

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [{ name: T("nav.products", locale), path: "/products" }],
          locale,
        )}
      />

      <PageHeader
        locale={locale}
        tone="navy"
        eyebrow={T("nav.products", locale)}
        title={
          locale === "ar"
            ? "محفظة منتجات يونيكاي"
            : "The Unikai product portfolio"
        }
        lead={
          locale === "ar"
            ? `أربع مجموعات رئيسية تضم ${subRanges.length} مجموعة فرعية — من الألبان المبردة إلى الآيس كريم المجمّد والمشروبات والأغذية الجافة.`
            : `Four ranges spanning ${subRanges.length} sub-ranges — chilled dairy, frozen ice cream, beverages and ambient foods, all from one UAE manufacturer.`
        }
        crumbs={[{ name: T("nav.products", locale), path: "/products" }]}
      />

      {ranges.map((range, i) => {
        const subs = subRanges.filter((s) => s.range === range.slug);
        return (
          <Section
            key={range.slug}
            tone={i % 2 === 0 ? "white" : "cream"}
            id={range.slug}
          >
            <Container>
              <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "h-8 w-1 rounded-full",
                        range.accent === "red" ? "bg-brand-red" : "bg-brand-navy",
                      )}
                    />
                    <h2 className="t-h2">{t(range.name, locale)}</h2>
                  </div>
                  <p className="t-body mt-4">{t(range.description, locale)}</p>
                </div>
                <ButtonLink
                  href={href(`/products/${range.slug}`, locale)}
                  variant="ghost"
                  className="shrink-0 self-start sm:self-auto"
                >
                  {T("cta.exploreRange", locale)}
                  <Arrow />
                </ButtonLink>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {subs.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={href(`/products/${range.slug}/${sub.slug}`, locale)}
                    className="card-lift group rounded-2xl border border-ink-100 bg-white p-4"
                  >
                    <PackShot
                      src={sub.image}
                      alt={t(sub.name, locale)}
                      tone={range.accent === "red" ? "red" : "navy"}
                      sizes="(max-width: 640px) 44vw, (max-width: 1024px) 30vw, 22vw"
                    />
                    <h3 className="mt-4 text-[0.9375rem] font-bold leading-snug tracking-tight text-ink transition-colors group-hover:text-brand-navy">
                      {t(sub.name, locale)}
                    </h3>
                  </Link>
                ))}
              </div>
            </Container>
          </Section>
        );
      })}

      <Section tone="navy">
        <Container className="text-center">
          <h2 className="t-h2 mx-auto max-w-2xl text-balance text-white">
            {locale === "ar"
              ? "تحتاج مواصفات كاملة أو كتالوجاً تجارياً؟"
              : "Need full specifications or a trade catalogue?"}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-white/70">
            {locale === "ar"
              ? "يقدّم فريق المبيعات المواصفات وأحجام العبوات وتفاصيل التعبئة للمشترين التجاريين."
              : "Our sales team provides specifications, pack sizes and case configurations to trade buyers."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href={href("/contact", locale)} variant="light" size="lg">
              {T("cta.enquire", locale)}
              <Arrow />
            </ButtonLink>
            <ButtonLink
              href={href("/export", locale)}
              variant="ghost"
              size="lg"
              className="border-white/30 bg-transparent text-white hover:border-white/60 hover:text-white"
            >
              {T("nav.export", locale)}
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
