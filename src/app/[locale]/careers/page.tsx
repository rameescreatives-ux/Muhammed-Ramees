import type { Metadata } from "next";
import { careersCopy, site } from "@/content/site";
import type { Locale } from "@/content/types";
import { T, t, tArray } from "@/lib/i18n";
import { alternates, breadcrumbSchema } from "@/lib/seo";
import { Container, Eyebrow, Section } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { ApplicationForm } from "@/components/forms/ApplicationForm";

export const metadata: Metadata = {
  title: "Careers at Unikai Foods",
  description:
    "Join Unikai Foods PJSC in Dubai. Current vacancies, our working environment, and how to apply — plus our official recruitment-fraud notice.",
  alternates: alternates("/careers"),
};

/**
 * Careers.
 *
 * Vacancies come from the `vacancies` table, posted by HR from the dashboard.
 * The list is empty until HR post the first role — an honest empty state with
 * a speculative-application route beats inventing jobs that don't exist.
 *
 * The recruitment notice is reproduced verbatim from unikai.com. It is an
 * anti-fraud warning, so it must not be paraphrased.
 */
const vacancies: { slug: string; title: string; location: string; type: string }[] = [];

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const ar = locale === "ar";
  const env = careersCopy.environment;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([{ name: T("nav.careers", locale), path: "/careers" }], locale)}
      />

      <PageHeader
        locale={locale}
        tone="navy"
        eyebrow={T("nav.careers", locale)}
        title={ar ? "اعمل معنا" : "Build your career with Unikai"}
        lead={t(env.body, locale)}
        crumbs={[{ name: T("nav.careers", locale), path: "/careers" }]}
      />

      {/* Working environment */}
      <Section tone="white">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>{t(env.heading, locale)}</Eyebrow>
            <h2 className="t-h2 mt-3">{t(env.sub, locale)}</h2>
          </div>

          <div className="mt-11 grid gap-px overflow-hidden rounded-2xl border border-ink-100 bg-ink-100 sm:grid-cols-3">
            {env.pillars.map((p) => (
              <div key={p.title.en} className="bg-white p-7">
                <h3 className="t-h3">{t(p.title, locale)}</h3>
                <p className="t-body mt-3 text-[0.9375rem]">{t(p.body, locale)}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Vacancies */}
      <Section tone="cream" id="vacancies">
        <Container>
          <Eyebrow>{ar ? "الشواغر" : "Open roles"}</Eyebrow>
          <h2 className="t-h2 mt-3">
            {ar ? "الوظائف المتاحة" : "Current vacancies"}
          </h2>

          {vacancies.length > 0 ? (
            <ul className="mt-9 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white">
              {vacancies.map((v) => (
                <li key={v.slug} className="flex flex-wrap items-center justify-between gap-4 p-6">
                  <div>
                    <p className="text-[1.0625rem] font-bold text-ink">{v.title}</p>
                    <p className="mt-1 text-[0.875rem] text-ink-500">
                      {v.location} · {v.type}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-9 rounded-3xl border border-ink-100 bg-white p-8 sm:p-10">
              <p className="t-lead font-medium text-ink">
                {ar
                  ? "لا توجد شواغر معلنة حالياً."
                  : "There are no advertised vacancies at the moment."}
              </p>
              <p className="t-body mt-4">
                {ar
                  ? "نرحّب دائماً بالطلبات المفتوحة من أصحاب الكفاءات. أرسل سيرتك الذاتية عبر النموذج أدناه وسنتواصل معك عند توفر دور مناسب."
                  : "We always welcome speculative applications from talented people. Send your CV using the form below and we will be in touch when a suitable role opens."}
              </p>
            </div>
          )}
        </Container>
      </Section>

      {/* Application */}
      <Section tone="white" id="apply">
        <Container size="narrow">
          <div className="text-center">
            <Eyebrow>{T("cta.apply", locale)}</Eyebrow>
            <h2 className="t-h2 mt-3">
              {ar ? "قدّم طلبك" : "Submit an application"}
            </h2>
          </div>
          <div className="mt-9 rounded-3xl border border-ink-100 bg-white p-7 sm:p-10">
            <ApplicationForm locale={locale} />
          </div>
        </Container>
      </Section>

      {/* Recruitment notice — verbatim, must not be paraphrased */}
      <Section tone="cream">
        <Container size="narrow">
          <div className="rounded-2xl border-s-4 border-brand-red bg-white p-7 sm:p-9">
            <h2 className="t-h3">{t(careersCopy.recruitmentNotice.heading, locale)}</h2>
            <div className="mt-4 space-y-4">
              {tArray(careersCopy.recruitmentNotice.body, locale).map((p, i) => (
                <p key={i} className="t-body text-[0.9375rem]">
                  {p}
                </p>
              ))}
            </div>
            <p className="mt-5 text-[0.875rem] text-ink-500">
              {ar ? "للتقديم: " : "To apply: "}
              <a
                href={`mailto:${site.contact.careersEmail}`}
                className="font-bold text-brand-navy"
              >
                {site.contact.careersEmail}
              </a>
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
