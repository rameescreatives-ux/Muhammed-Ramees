import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  annualReports,
  financialStatements,
  integratedReports,
  otherReports,
} from "@/content/ir";
import { board, management, site } from "@/content/site";
import type { Locale } from "@/content/types";
import { T, href, locales, t } from "@/lib/i18n";
import { alternates, breadcrumbSchema } from "@/lib/seo";
import { Container, Eyebrow, Section } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Portrait } from "@/components/ui/PackShot";
import { JsonLd } from "@/components/seo/JsonLd";
import { DocList } from "@/components/ir/DocList";
import { irNav } from "@/lib/nav";

const SECTIONS = irNav.filter((i) => i.slug).map((i) => i.slug);

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    SECTIONS.map((section) => ({ locale, section })),
  );
}

function meta(section: string) {
  return irNav.find((i) => i.slug === section);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const m = meta(section);
  if (!m) return {};

  return {
    title: `${m.en} — Investor Relations`,
    alternates: alternates(`/investor-relations/${section}`),
  };
}

export default async function IrSectionPage({
  params,
}: {
  params: Promise<{ locale: Locale; section: string }>;
}) {
  const { locale, section } = await params;
  const m = meta(section);
  if (!m) notFound();

  const ar = locale === "ar";
  const title = ar ? m.ar : m.en;

  const crumbs = [
    { name: T("nav.investors", locale), path: "/investor-relations" },
    { name: title, path: `/investor-relations/${section}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs, locale)} />

      <PageHeader
        locale={locale}
        tone="navy"
        eyebrow={T("nav.investors", locale)}
        title={title}
        crumbs={crumbs}
      />

      {section === "structure-and-governance" && (
        <Governance locale={locale} />
      )}

      {section === "results-and-presentations" && (
        <>
          <DocList
            id="fs"
            title={ar ? "البيانات المالية" : "Financial statements"}
            docs={financialStatements}
            locale={locale}
            tone="white"
            grouped
          />
          <DocList
            id="ar"
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
        </>
      )}

      {section === "integrated-reports" && (
        <DocList
          id="ir"
          title={ar ? "التقارير المتكاملة" : "Integrated reports"}
          docs={integratedReports}
          locale={locale}
          tone="white"
        />
      )}

      {section === "disclaimer" && <Disclaimer locale={locale} />}

      {["key-figures", "annual-general-meetings", "announcements", "unclaimed-dividends"].includes(
        section,
      ) && <PendingSection locale={locale} title={title} section={section} />}

      <Section tone="cream">
        <Container>
          <h2 className="t-h3 mb-6">
            {ar ? "أقسام أخرى" : "Other sections"}
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {irNav
              .filter((i) => i.slug !== section)
              .map((i) => (
                <Link
                  key={i.slug || "overview"}
                  href={href(
                    `/investor-relations${i.slug ? `/${i.slug}` : ""}`,
                    locale,
                  )}
                  className="rounded-full border border-ink-200 bg-white px-4 py-2 text-[0.875rem] font-semibold text-ink-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                >
                  {ar ? i.ar : i.en}
                </Link>
              ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

function Governance({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  return (
    <>
      <Section tone="white">
        <Container>
          <Eyebrow>{ar ? "مجلس الإدارة" : "Board of Directors"}</Eyebrow>
          <h2 className="t-h2 mt-3">
            {ar ? "أعضاء مجلس الإدارة" : "Board composition"}
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {board.map((p) => (
              <div key={p.name} className="group">
                <Portrait src={p.image} alt={p.name} />
                <p className="mt-3 text-[0.9375rem] font-bold leading-snug text-ink">
                  {p.name}
                </p>
                <p className="mt-0.5 text-[0.8125rem] text-ink-500">
                  {t(p.role, locale)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="cream">
        <Container>
          <Eyebrow>{ar ? "الإدارة التنفيذية" : "Senior Management"}</Eyebrow>
          <h2 className="t-h2 mt-3">
            {ar ? "فريق الإدارة" : "Management team"}
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {management.map((p) => (
              <div key={p.name} className="group">
                <Portrait src={p.image} alt={p.name} />
                <p className="mt-3 text-[0.9375rem] font-bold leading-snug text-ink">
                  {p.name}
                </p>
                <p className="mt-0.5 text-[0.8125rem] text-ink-500">
                  {t(p.role, locale)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

function Disclaimer({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  return (
    <Section tone="white">
      <Container size="narrow">
        <div className="space-y-5">
          <p className="t-body">
            {ar
              ? "المعلومات المنشورة في قسم علاقات المستثمرين مقدَّمة لأغراض إعلامية عامة فقط، ولا تشكل دعوة أو عرضاً لشراء أو بيع أي أوراق مالية."
              : "Information published in this investor relations section is provided for general informational purposes only and does not constitute an invitation or offer to buy or sell any securities."}
          </p>
          <p className="t-body">
            {ar
              ? "قد تتضمن بعض البيانات تطلعات مستقبلية تنطوي على مخاطر وعوامل غير مؤكدة، وقد تختلف النتائج الفعلية اختلافاً جوهرياً عنها."
              : "Certain statements may be forward-looking and involve risks and uncertainties. Actual results may differ materially from those expressed or implied."}
          </p>
          <p className="t-body">
            {ar
              ? "تُنشر الوثائق المالية كما تم الإفصاح عنها في حينها، ولا تتحمل الشركة التزاماً بتحديثها."
              : "Financial documents are published as disclosed at the time and the company undertakes no obligation to update them."}
          </p>
          <p className="t-body">
            {ar ? "للاستفسارات: " : "For enquiries: "}
            <a
              href={`mailto:${site.contact.investorEmail}`}
              className="font-bold text-brand-navy"
            >
              {site.contact.investorEmail}
            </a>
          </p>
        </div>
      </Container>
    </Section>
  );
}

/**
 * Sections that exist in the legacy navigation but whose content Unikai
 * publishes irregularly (AGM notices, announcements, unclaimed dividends,
 * key figures). The route and the structure exist so links never break;
 * the content is populated from the dashboard.
 */
function PendingSection({
  locale,
  title,
  section,
}: {
  locale: Locale;
  title: string;
  section: string;
}) {
  const ar = locale === "ar";
  return (
    <Section tone="white">
      <Container size="narrow">
        <div className="rounded-3xl border border-ink-100 bg-ink-50 p-8 sm:p-10">
          <h2 className="t-h3">{title}</h2>
          <p className="t-body mt-4">
            {ar
              ? "تُنشر وثائق هذا القسم عند إصدارها. للحصول على أحدث الإفصاحات، يرجى مراجعة البيانات المالية أو التواصل مع علاقات المستثمرين."
              : "Documents in this section are published as they are issued. For the latest disclosures, see the financial statements or contact investor relations."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={href("/investor-relations/results-and-presentations", locale)}
              className="text-[0.9375rem] font-bold text-brand-navy hover:underline"
            >
              {ar ? "النتائج والعروض" : "Results & presentations"}
            </Link>
            <span className="text-ink-300">·</span>
            <a
              href={`mailto:${site.contact.investorEmail}`}
              className="text-[0.9375rem] font-bold text-brand-navy hover:underline"
            >
              {site.contact.investorEmail}
            </a>
          </div>
          {section === "key-figures" && (
            <p className="mt-6 text-[0.8125rem] text-ink-500">
              {ar
                ? "تتوفر المؤشرات المالية الرئيسية ضمن البيانات المالية والتقارير المتكاملة."
                : "Key financial figures are available within the financial statements and integrated reports."}
            </p>
          )}
        </div>
      </Container>
    </Section>
  );
}
