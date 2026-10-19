import type { Metadata } from "next";
import type { Locale } from "@/content/types";
import { T } from "@/lib/i18n";
import { alternates, breadcrumbSchema, faqSchema } from "@/lib/seo";
import { Container, Eyebrow, Section } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink, Arrow } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { href } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Quality & Food Safety",
  description:
    "How Unikai Foods approaches quality assurance and food safety across its UAE manufacturing operations, and how trade buyers can request certification documentation.",
  alternates: alternates("/quality"),
};

/**
 * Quality & Certifications.
 *
 * DELIBERATE OMISSION: no certification is named anywhere on this page.
 * unikai.com does not publish its certifications, and for an importer
 * screening suppliers on ISO 22000 / HACCP / Halal, a wrong badge is worse
 * than a missing one. The certification grid below renders from a database
 * table that is intentionally empty until Unikai upload the actual
 * certificates through the admin dashboard — at which point the section
 * appears with no code change.
 */

type Certificate = {
  name: string;
  issuer: string;
  scope: string;
  document?: string;
};

const certificates: Certificate[] = [];

export default async function QualityPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const ar = locale === "ar";

  const pillars = ar
    ? [
        { t: "التصنيع في الإمارات", b: "تُنتج منتجاتنا في منشآت الشركة داخل دولة الإمارات، على مدار الساعة." },
        { t: "ضمان الجودة قبل التوزيع", b: "تمر المنتجات بضمان الجودة قبل وصولها إلى نقاط البيع." },
        { t: "سلاسل تبريد متعددة", b: "مبرّد ومجمّد وطويل الأجل وجاف — تُدار كل سلسلة وفق متطلباتها." },
        { t: "شركة مساهمة عامة", b: "نعمل ضمن إطار حوكمة وإفصاح معلن بصفتنا شركة مدرجة." },
      ]
    : [
        { t: "Manufactured in the UAE", b: "Our products are made at the company's own facilities in the United Arab Emirates, operating around the clock." },
        { t: "Quality assurance before distribution", b: "Products pass through quality assurance before they reach the point of sale." },
        { t: "Four temperature regimes", b: "Chilled, frozen, ambient long-life and dry goods — each chain managed to its own requirements." },
        { t: "Public-company governance", b: "As a listed PJSC we operate under a published governance and disclosure framework." },
      ];

  const faqs = ar
    ? [
        { q: "هل منتجات يونيكاي حلال؟", a: "يؤكد فريق الجودة لدينا تفاصيل الشهادات لكل منتج. يرجى إرسال استفسار للحصول على الوثائق الرسمية." },
        { q: "كيف أحصل على شهادات الجودة؟", a: "أرسل استفساراً تجارياً موضحاً المنتجات وسوق الوجهة، وسيزوّدك الفريق بالوثائق المطلوبة." },
        { q: "هل يمكن الحصول على مواصفات المنتج؟", a: "نعم. تتوفر أوراق المواصفات وأحجام العبوات ومدد الصلاحية للمشترين التجاريين عند الطلب." },
      ]
    : [
        {
          q: "Are Unikai products Halal certified?",
          a: "Certification details are confirmed per product by our quality team. Please send an enquiry and we will provide the official documentation for the products and market you are asking about.",
        },
        {
          q: "How do I obtain quality certificates?",
          a: "Submit a trade enquiry stating the products and destination market. The team will supply the relevant certification documentation directly.",
        },
        {
          q: "Can I get product specification sheets?",
          a: "Yes. Specification sheets covering pack sizes, case configuration, shelf life and storage conditions are available to trade buyers on request.",
        },
      ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: T("nav.quality", locale), path: "/quality" }], locale),
          faqSchema(faqs),
        ]}
      />

      <PageHeader
        locale={locale}
        tone="navy"
        eyebrow={T("nav.quality", locale)}
        title={ar ? "الجودة وسلامة الغذاء" : "Quality & food safety"}
        lead={
          ar
            ? "ارتبطت يونيكاي بالجودة المتميزة منذ عام ١٩٧٧. إليك كيف نتعامل مع الجودة — وكيف يحصل المشترون على الوثائق الرسمية."
            : "Unikai has stood for superior quality since 1977. Here is how we approach it — and how trade buyers obtain the formal documentation."
        }
        crumbs={[{ name: T("nav.quality", locale), path: "/quality" }]}
      />

      <Section tone="white">
        <Container>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-ink-100 bg-ink-100 sm:grid-cols-2">
            {pillars.map((p, i) => (
              <div key={p.t} className="bg-white p-7 sm:p-9">
                <p className="nums-latin text-[0.75rem] font-extrabold tracking-widest text-brand-red">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="t-h3 mt-3">{p.t}</h2>
                <p className="t-body mt-3 text-[0.9375rem]">{p.b}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Certifications */}
      <Section tone="cream">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>{T("label.certifications", locale)}</Eyebrow>
            <h2 className="t-h2 mt-3">
              {ar ? "الشهادات والوثائق" : "Certifications & documentation"}
            </h2>
          </div>

          {certificates.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.map((c) => (
                <div key={c.name} className="rounded-2xl border border-ink-100 bg-white p-6">
                  <h3 className="t-h3">{c.name}</h3>
                  <p className="mt-1.5 text-[0.8125rem] text-ink-500">{c.issuer}</p>
                  <p className="t-body mt-3 text-[0.875rem]">{c.scope}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-ink-100 bg-white p-8 sm:p-10">
              <p className="t-lead font-medium text-ink">
                {ar
                  ? "لا تنشر يونيكاي حالياً قائمة شهاداتها على الموقع."
                  : "Unikai does not currently publish its certification list on the website."}
              </p>
              <p className="t-body mt-4">
                {ar
                  ? "يقدّم فريق الجودة وثائق الشهادات مباشرة للمشترين التجاريين والمستوردين حسب المنتج وسوق الوجهة. أرسل استفساراً موضحاً المنتجات والسوق وسنرد بالوثائق المناسبة."
                  : "Our quality team supplies certification documentation directly to trade buyers and importers, specific to the product and destination market. Send an enquiry stating the products and market, and we will respond with the appropriate documents."}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href={href("/contact", locale)}>
                  {ar ? "اطلب الوثائق" : "Request documentation"}
                  <Arrow />
                </ButtonLink>
                <ButtonLink href={href("/export", locale)} variant="ghost">
                  {T("nav.export", locale)}
                </ButtonLink>
              </div>
            </div>
          )}
        </Container>
      </Section>

      {/* FAQ — also feeds FAQPage schema for AI search surfaces */}
      <Section tone="white">
        <Container size="narrow">
          <h2 className="t-h2">{ar ? "أسئلة شائعة" : "Frequently asked"}</h2>
          <dl className="mt-9 divide-y divide-ink-100 border-y border-ink-100">
            {faqs.map((f) => (
              <div key={f.q} className="py-6">
                <dt className="text-[1.0625rem] font-bold text-ink">{f.q}</dt>
                <dd className="t-body mt-2.5">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>
    </>
  );
}
