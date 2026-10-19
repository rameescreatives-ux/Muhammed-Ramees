import type { Metadata } from "next";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { T, t } from "@/lib/i18n";
import { alternates, breadcrumbSchema } from "@/lib/seo";
import { Container, Eyebrow, Section } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { EnquiryForm } from "@/components/forms/EnquiryForm";

export const metadata: Metadata = {
  title: "Contact Unikai Foods",
  description:
    "Contact Unikai Foods PJSC in Dubai for export, distribution, wholesale, product or investor enquiries. Head office, telephone and department contacts.",
  alternates: alternates("/contact"),
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const ar = locale === "ar";

  const routes = [
    {
      title: ar ? "التصدير والتوزيع الدولي" : "Export & international distribution",
      body: ar
        ? "للمستوردين والموزعين خارج الإمارات."
        : "For importers and distributors outside the UAE.",
      email: site.contact.email,
    },
    {
      title: ar ? "التوزيع والجملة محلياً" : "UAE & Oman distribution",
      body: ar
        ? "تجارة الجملة والتجزئة وقطاع الضيافة."
        : "Wholesale, retail and HORECA supply.",
      email: site.contact.email,
    },
    {
      title: ar ? "علاقات المستثمرين" : "Investor relations",
      body: `${site.contact.investorContact.name} — ${site.contact.investorContact.phone}`,
      email: site.contact.investorEmail,
    },
    {
      title: ar ? "التوظيف" : "Careers",
      body: ar ? "طلبات التوظيف والاستفسارات." : "Applications and recruitment enquiries.",
      email: site.contact.careersEmail,
    },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([{ name: T("nav.contact", locale), path: "/contact" }], locale)}
      />

      <PageHeader
        locale={locale}
        tone="navy"
        eyebrow={T("nav.contact", locale)}
        title={ar ? "تواصل معنا" : "Get in touch"}
        lead={
          ar
            ? "اختر نوع الاستفسار وسيصل طلبك مباشرة إلى الفريق المختص."
            : "Choose your enquiry type and your message reaches the right team directly."
        }
        crumbs={[{ name: T("nav.contact", locale), path: "/contact" }]}
      />

      <Section tone="white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            {/* Details */}
            <div>
              <Eyebrow>{T("footer.headOffice", locale)}</Eyebrow>
              <address className="mt-4 not-italic">
                <p className="t-body text-[1.0625rem]">
                  {t(site.contact.headOffice, locale)}
                </p>
                <p className="mt-4">
                  <a
                    href={site.contact.tollHref}
                    className="text-[1.25rem] font-extrabold tracking-tight text-brand-navy"
                  >
                    {site.contact.toll}
                  </a>
                </p>
                <p className="mt-1.5">
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="font-semibold text-ink-700 hover:text-brand-navy"
                  >
                    {site.contact.email}
                  </a>
                </p>
              </address>

              <div className="mt-10 space-y-px overflow-hidden rounded-2xl border border-ink-100 bg-ink-100">
                {routes.map((r) => (
                  <div key={r.title} className="bg-white p-5">
                    <p className="text-[0.9375rem] font-bold text-ink">{r.title}</p>
                    <p className="mt-1 text-[0.8125rem] text-ink-500">{r.body}</p>
                    <a
                      href={`mailto:${r.email}`}
                      className="mt-2 inline-block text-[0.8125rem] font-semibold text-brand-navy hover:underline"
                    >
                      {r.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="rounded-3xl border border-ink-100 bg-white p-7 sm:p-9">
              <h2 className="t-h3">{T("cta.enquire", locale)}</h2>
              <p className="t-body mt-2 text-[0.9375rem]">
                {ar
                  ? "املأ النموذج وسيتواصل معك الفريق المختص."
                  : "Fill in the form and the relevant team will be in touch."}
              </p>
              <div className="mt-7">
                <EnquiryForm locale={locale} defaultType="general" />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
