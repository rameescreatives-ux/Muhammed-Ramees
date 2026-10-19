import type { Metadata } from "next";
import type { Locale } from "@/content/types";
import { T, href } from "@/lib/i18n";
import { alternates, breadcrumbSchema, faqSchema } from "@/lib/seo";
import { Container, Eyebrow, Section } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink, Arrow } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { ranges } from "@/content/products";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Export & Distribution — Become a Unikai distributor",
  description:
    "Import or distribute Unikai products. Learn how the export enquiry process works, what documentation is involved, and submit a qualified distributor enquiry.",
  alternates: alternates("/export"),
};

/**
 * Export & Distribution — the commercial centre of the site, and the single
 * biggest gap on the legacy site, which offered no export path at all.
 *
 * NO MARKETS MAP IS RENDERED. The CEO's message claims Unikai is "a household
 * name in 29 countries", but that is a quote, not a verified market list, and
 * publishing a map of guessed countries on a page importers use to qualify a
 * supplier would be a material misstatement. The map component is built and
 * the section is ready — it renders the moment Unikai supply the confirmed
 * list through the dashboard.
 */

const markets: { country: string; code: string }[] = [];

export default async function ExportPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const ar = locale === "ar";

  const steps = ar
    ? [
        { n: "01", t: "أرسل استفسار التصدير", b: "أخبرنا بدولة الوجهة والمنتجات التي تهمك وبيانات شركتك والكميات التقديرية." },
        { n: "02", t: "مراجعة الفريق لسوقك", b: "يراجع فريق التصدير المنتجات المناسبة لسوقك ومتطلباته التنظيمية." },
        { n: "03", t: "المستندات والمواصفات", b: "نزوّدك بأوراق المواصفات ووثائق الشهادات المطلوبة لسوقك." },
        { n: "04", t: "الشروط التجارية", b: "يتفق الفريق معك على الشروط وترتيبات التوزيع وخطة الإطلاق." },
      ]
    : [
        { n: "01", t: "Send an export enquiry", b: "Tell us your destination country, the products you are interested in, your company details and estimated volumes." },
        { n: "02", t: "We review your market", b: "The export team assesses which products suit your market and its regulatory requirements." },
        { n: "03", t: "Documentation & specifications", b: "We supply specification sheets and the certification documentation your market requires." },
        { n: "04", t: "Commercial terms", b: "The team agrees terms, distribution arrangements and a launch plan with you." },
      ];

  const faqs = ar
    ? [
        { q: "كيف أصبح موزعاً ليونيكاي؟", a: "أرسل استفسار تصدير عبر هذه الصفحة موضحاً دولتك والمنتجات والكميات التقديرية، وسيتواصل معك فريق التصدير بالخطوات." },
        { q: "ما المستندات المطلوبة للاستيراد؟", a: "تختلف المتطلبات حسب سوق الوجهة. يحدد فريق التصدير الوثائق اللازمة لسوقك بعد استلام استفسارك." },
        { q: "هل تصدّرون إلى بلدي؟", a: "يؤكد فريق التصدير توافر المنتجات لكل سوق على حدة. أرسل استفساراً بدولتك وسنرد عليك." },
      ]
    : [
        {
          q: "How do I become a Unikai distributor?",
          a: "Submit an export enquiry through this page stating your country, the products you are interested in and your estimated volumes. The export team will come back to you with the process.",
        },
        {
          q: "What documentation is required to import?",
          a: "Requirements vary by destination market. Once we receive your enquiry, the export team identifies the documentation your specific market requires.",
        },
        {
          q: "Do you export to my country?",
          a: "Product availability is confirmed market by market by the export team. Send an enquiry with your destination country and we will respond.",
        },
      ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: T("nav.export", locale), path: "/export" }], locale),
          faqSchema(faqs),
        ]}
      />

      <PageHeader
        locale={locale}
        tone="navy"
        eyebrow={T("nav.export", locale)}
        title={ar ? "التصدير والتوزيع" : "Export & distribution"}
        lead={
          ar
            ? "نزوّد الأسواق الدولية عبر موزعين معتمدين. إليك كيف تبدأ العملية — وما نحتاجه منك لنرد برد مفيد."
            : "We supply international markets through appointed distributors. Here is how the process starts — and what we need from you to give you a useful answer."
        }
        crumbs={[{ name: T("nav.export", locale), path: "/export" }]}
      >
        <ButtonLink href="#enquiry" variant="light" size="lg">
          {T("cta.becomeDistributor", locale)}
          <Arrow />
        </ButtonLink>
      </PageHeader>

      {/* Process */}
      <Section tone="white">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>{ar ? "العملية" : "The process"}</Eyebrow>
            <h2 className="t-h2 mt-3">
              {ar ? "من الاستفسار إلى أول شحنة" : "From enquiry to first shipment"}
            </h2>
          </div>

          <ol className="mt-11 grid gap-px overflow-hidden rounded-2xl border border-ink-100 bg-ink-100 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <li key={s.n} className="bg-white p-7">
                <p className="nums-latin text-[0.75rem] font-extrabold tracking-widest text-brand-red">
                  {s.n}
                </p>
                <h3 className="mt-3 text-[1.0625rem] font-bold leading-snug tracking-tight text-ink">
                  {s.t}
                </h3>
                <p className="t-body mt-2.5 text-[0.875rem]">{s.b}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* What we export */}
      <Section tone="cream">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div>
              <Eyebrow>{ar ? "المنتجات" : "What we supply"}</Eyebrow>
              <h2 className="t-h2 mt-3">
                {ar ? "أربع مجموعات متاحة للتصدير" : "Four ranges available for export"}
              </h2>
              <p className="t-body mt-5">
                {ar
                  ? "يحدد فريق التصدير المنتجات المناسبة لسوقك بناءً على متطلبات التنظيم ومدة الصلاحية وسلسلة التبريد."
                  : "The export team identifies which products suit your market based on regulatory requirements, shelf life and cold-chain capability."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {ranges.map((r) => (
                <div key={r.slug} className="rounded-2xl border border-ink-100 bg-white p-6">
                  <h3 className="t-h3">{t(r.name, locale)}</h3>
                  <p className="t-body mt-2 text-[0.875rem]">{t(r.tagline, locale)}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Markets — renders only with verified data */}
      {markets.length > 0 && (
        <Section tone="white">
          <Container>
            <Eyebrow>{ar ? "أسواقنا" : "Our markets"}</Eyebrow>
            <h2 className="t-h2 mt-3">
              {ar ? "أين تتوفر يونيكاي" : "Where Unikai is available"}
            </h2>
            <div className="mt-9 flex flex-wrap gap-2.5">
              {markets.map((m) => (
                <span
                  key={m.code}
                  className="rounded-full border border-ink-200 bg-white px-4 py-2 text-[0.875rem] font-semibold text-ink-700"
                >
                  {m.country}
                </span>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Enquiry */}
      <Section tone="white" id="enquiry">
        <Container size="narrow">
          <div className="text-center">
            <Eyebrow>{T("cta.enquire", locale)}</Eyebrow>
            <h2 className="t-h2 mt-3">
              {ar ? "ابدأ استفسار التصدير" : "Start an export enquiry"}
            </h2>
            <p className="t-lead mt-4">
              {ar
                ? "كلما زادت التفاصيل، كان ردّنا أدق وأسرع."
                : "The more detail you give, the more specific and faster our response."}
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-ink-100 bg-white p-7 sm:p-10">
            <EnquiryForm locale={locale} defaultType="export" lockType />
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section tone="cream">
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
          <div className="mt-9">
            <ButtonLink href={href("/contact", locale)} variant="ghost">
              {T("nav.contact", locale)}
              <Arrow />
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
