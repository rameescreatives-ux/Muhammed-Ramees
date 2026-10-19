import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getRange, getSubRange, products } from "@/content/products";
import type { Locale, Product } from "@/content/types";
import { T, href, locales, t } from "@/lib/i18n";
import { abs, alternates, breadcrumbSchema, productSchema } from "@/lib/seo";
import { Container, Section } from "@/components/ui/Container";
import { GapNotice, PageHeader } from "@/components/ui/PageHeader";
import { PackShot } from "@/components/ui/PackShot";
import { ButtonLink, Arrow } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { EnquiryForm } from "@/components/forms/EnquiryForm";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    products.map((p) => ({
      locale,
      range: p.range,
      sub: p.subRange,
      product: p.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; range: string; sub: string; product: string }>;
}): Promise<Metadata> {
  const { range, sub, product: slug } = await params;
  const product = getProduct(slug);
  const parent = getRange(range);
  if (!product || !parent) return {};

  return {
    title: product.name.en,
    description:
      product.description?.en ??
      `${product.name.en} from Unikai Foods PJSC, part of the Unikai ${parent.name.en} range. Manufactured in the UAE. Specifications available to trade buyers on request.`,
    alternates: alternates(`/products/${range}/${sub}/${slug}`),
    openGraph: { images: product.image ? [{ url: product.image }] : undefined },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: Locale; range: string; sub: string; product: string }>;
}) {
  const { locale, range: rangeSlug, sub: subSlug, product: slug } = await params;

  const product = getProduct(slug);
  const range = getRange(rangeSlug);
  const sub = getSubRange(rangeSlug, subSlug);
  if (!product || !range || !sub) notFound();

  const path = `/products/${rangeSlug}/${subSlug}/${slug}`;
  const crumbs = [
    { name: T("nav.products", locale), path: "/products" },
    { name: t(range.name, locale), path: `/products/${rangeSlug}` },
    { name: t(sub.name, locale), path: `/products/${rangeSlug}/${subSlug}` },
    { name: t(product.name, locale), path },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs, locale),
          productSchema(product, locale, abs(path, locale)),
        ]}
      />

      <PageHeader
        locale={locale}
        tone="cream"
        eyebrow={t(sub.name, locale)}
        title={t(product.name, locale)}
        crumbs={crumbs}
      />

      <Section tone="white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <PackShot
                src={product.image}
                alt={t(product.name, locale)}
                tone={range.accent === "red" ? "red" : "navy"}
                sizes="(max-width: 1024px) 90vw, 460px"
                priority
              />
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="#enquire" variant="secondary">
                  {T("cta.enquireProduct", locale)}
                  <Arrow />
                </ButtonLink>
              </div>
            </div>

            <div>
              {product.description ? (
                <p className="t-lead">{t(product.description, locale)}</p>
              ) : (
                <p className="t-lead">
                  {locale === "ar"
                    ? `${t(product.name, locale)} من مجموعة ${t(range.name, locale)} من يونيكاي، تُنتج في منشآت الشركة بدولة الإمارات.`
                    : `${t(product.name, locale)} is part of the Unikai ${t(range.name, locale)} range, manufactured at the company's UAE facilities.`}
                </p>
              )}

              <SpecSheet product={product} locale={locale} />

              <div className="mt-8">
                <GapNotice notes={product.gaps ?? []} />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="cream" id="enquire">
        <Container size="narrow">
          <h2 className="t-h2 text-center">
            {locale === "ar"
              ? `استفسر عن ${t(product.name, locale)}`
              : `Enquire about ${t(product.name, locale)}`}
          </h2>
          <p className="t-lead mt-4 text-center">
            {T("label.contactForSpecs", locale)}
          </p>
          <div className="mt-9 rounded-3xl border border-ink-100 bg-white p-7 sm:p-10">
            <EnquiryForm
              locale={locale}
              defaultType="distribution"
              productContext={`${product.name.en} (${range.name.en} → ${sub.name.en})`}
            />
          </div>
        </Container>
      </Section>
    </>
  );
}

/**
 * Trade specification sheet.
 *
 * Every row renders only where real data exists. Rather than printing an
 * empty table or — worse — placeholder values that a buyer could mistake for
 * fact, missing sections collapse to a single honest line pointing at the
 * sales team. The admin dashboard fills these fields; the layout is ready.
 */
function SpecSheet({ product, locale }: { product: Product; locale: Locale }) {
  const rows: { label: string; value: React.ReactNode }[] = [];

  if (product.sku) rows.push({ label: T("label.sku", locale), value: <span className="nums-latin">{product.sku}</span> });
  if (product.barcode) rows.push({ label: T("label.barcode", locale), value: <span className="nums-latin">{product.barcode}</span> });
  if (product.packSizes?.length)
    rows.push({ label: T("label.packSizes", locale), value: product.packSizes.join(" · ") });
  if (product.shelfLife)
    rows.push({ label: T("label.shelfLife", locale), value: t(product.shelfLife, locale) });
  if (product.storage)
    rows.push({ label: T("label.storage", locale), value: t(product.storage, locale) });
  if (product.ingredients)
    rows.push({ label: T("label.ingredients", locale), value: t(product.ingredients, locale) });
  if (product.certifications?.length)
    rows.push({ label: T("label.certifications", locale), value: product.certifications.join(" · ") });

  return (
    <div className="mt-10">
      <h2 className="t-h3">{T("label.specifications", locale)}</h2>

      {rows.length > 0 ? (
        <dl className="mt-5 overflow-hidden rounded-2xl border border-ink-100">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`grid gap-1 px-5 py-4 sm:grid-cols-[200px_1fr] sm:gap-6 ${
                i % 2 ? "bg-white" : "bg-ink-50"
              }`}
            >
              <dt className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-ink-500">
                {row.label}
              </dt>
              <dd className="text-[0.9375rem] text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="mt-5 rounded-2xl border border-ink-100 bg-ink-50 p-6">
          <p className="text-[0.9375rem] leading-relaxed text-ink-700">
            {locale === "ar"
              ? "لم تُنشر المواصفات التفصيلية لهذا المنتج بعد. يقدّم فريق المبيعات أحجام العبوات وتفاصيل التعبئة ومدة الصلاحية والمعلومات الغذائية والشهادات عند الطلب."
              : "Detailed specifications for this product have not yet been published. Pack sizes, case configuration, shelf life, nutritional information and certification details are provided by the sales team on request."}
          </p>
        </div>
      )}

      {product.nutritionals?.length ? (
        <>
          <h3 className="t-h3 mt-10">{T("label.nutritionals", locale)}</h3>
          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-100 bg-ink-100 sm:grid-cols-4">
            {product.nutritionals.map((n) => (
              <div key={n.label.en} className="bg-white p-4 text-center">
                <dt className="text-[0.6875rem] font-bold uppercase tracking-wider text-ink-500">
                  {t(n.label, locale)}
                </dt>
                <dd className="nums-latin mt-1 text-lg font-extrabold text-brand-navy">
                  {t(n.value, locale)}
                </dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}

      {product.specSheet && (
        <a
          href={product.specSheet}
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink-200 px-5 py-2.5 text-[0.875rem] font-bold text-brand-navy transition-colors hover:border-brand-navy"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3v10m0 0 3.5-3.5M10 13 6.5 9.5M4 16h12" />
          </svg>
          {T("label.downloads", locale)}
        </a>
      )}
    </div>
  );
}
