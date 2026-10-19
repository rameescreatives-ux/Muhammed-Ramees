import type { Metadata } from "next";
import Link from "next/link";
import {
  annualReports,
  financialStatements,
  integratedReports,
  otherReports,
} from "@/content/ir";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { T, href } from "@/lib/i18n";
import { alternates, breadcrumbSchema } from "@/lib/seo";
import { Container, Eyebrow, Section } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { DocList } from "@/components/ir/DocList";

export const metadata: Metadata = {
  title: "Investor Relations",
  description:
    "Unikai Foods PJSC investor relations: financial statements, integrated reports, annual reports, governance and disclosures. Listed on the Dubai Financial Market (UNIKAI).",
  alternates: alternates("/investor-relations"),
};

export default async function InvestorRelationsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const ar = locale === "ar";

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [{ name: T("nav.investors", locale), path: "/investor-relations" }],
          locale,
        )}
      />

      <PageHeader
        locale={locale}
        tone="navy"
        eyebrow={T("nav.investors", locale)}
        title={ar ? "علاقات المستثمرين" : "Investor relations"}
        lead={
          ar
            ? "يونيكاي فودز ش.م.ع شركة مساهمة عامة مدرجة في سوق دبي المالي تحت الرمز UNIKAI."
            : "Unikai Foods PJSC is a public joint stock company listed on the Dubai Financial Market under the ticker UNIKAI."
        }
        crumbs={[{ name: T("nav.investors", locale), path: "/investor-relations" }]}
      />

      {/* Stock + contact */}
      <Section tone="white">
        <Container>
          <div className="grid gap-5 lg:grid-cols-3">
            <a
              href={site.dfm.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card-lift group rounded-2xl border border-ink-100 bg-white p-7"
            >
              <Eyebrow>{ar ? "معلومات السهم" : "Stock information"}</Eyebrow>
              <p className="mt-3 text-[1.75rem] font-extrabold tracking-tight text-brand-navy">
                {site.dfm.ticker}
              </p>
              <p className="mt-1.5 text-[0.875rem] text-ink-500">
                {ar ? "سوق دبي المالي" : "Dubai Financial Market"}
              </p>
              <span className="mt-4 inline-block text-[0.8125rem] font-bold text-brand-red">
                {ar ? "عرض الملف في DFM ↗" : "View DFM profile ↗"}
              </span>
            </a>

            <div className="rounded-2xl border border-ink-100 bg-white p-7 lg:col-span-2">
              <Eyebrow>{ar ? "جهة الاتصال" : "IR contact"}</Eyebrow>
              <p className="mt-3 text-[1.0625rem] font-bold text-ink">
                {site.contact.investorContact.name}
              </p>
              <p className="mt-0.5 text-[0.875rem] text-ink-500">
                {ar ? "مدير علاقات المستثمرين" : "Investor Relations Manager"}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2 text-[0.9375rem]">
                <a
                  href={site.contact.investorContact.phoneHref}
                  className="font-semibold text-brand-navy"
                >
                  {site.contact.investorContact.phone}
                </a>
                <a
                  href={`mailto:${site.contact.investorEmail}`}
                  className="font-semibold text-brand-navy"
                >
                  {site.contact.investorEmail}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <DocList
        id="financial-statements"
        title={ar ? "البيانات المالية" : "Financial statements"}
        docs={financialStatements}
        locale={locale}
        tone="cream"
        grouped
      />

      <DocList
        id="integrated-reports"
        title={ar ? "التقارير المتكاملة" : "Integrated reports"}
        docs={integratedReports}
        locale={locale}
        tone="white"
      />

      <DocList
        id="annual-reports"
        title={ar ? "التقارير السنوية" : "Annual reports"}
        docs={annualReports}
        locale={locale}
        tone="cream"
      />

      <DocList
        id="other"
        title={ar ? "تقارير أخرى" : "Sustainability & strategy"}
        docs={otherReports}
        locale={locale}
        tone="white"
      />

      {/* Governance + disclaimer */}
      <Section tone="cream">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2">
            <Link
              href={href("/investor-relations/structure-and-governance", locale)}
              className="card-lift rounded-2xl border border-ink-100 bg-white p-7"
            >
              <h2 className="t-h3">
                {ar ? "الهيكل والحوكمة" : "Structure & governance"}
              </h2>
              <p className="t-body mt-2.5 text-[0.9375rem]">
                {ar
                  ? "مجلس الإدارة والإدارة التنفيذية وإطار الحوكمة."
                  : "Board of directors, senior management and the governance framework."}
              </p>
            </Link>
            <Link
              href={href("/investor-relations/disclaimer", locale)}
              className="card-lift rounded-2xl border border-ink-100 bg-white p-7"
            >
              <h2 className="t-h3">{ar ? "إخلاء المسؤولية" : "Disclaimer"}</h2>
              <p className="t-body mt-2.5 text-[0.9375rem]">
                {ar
                  ? "شروط استخدام المعلومات المنشورة في هذا القسم."
                  : "Terms governing the use of information published in this section."}
              </p>
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
