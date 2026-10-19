import type { Metadata } from "next";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { T } from "@/lib/i18n";
import { alternates } from "@/lib/seo";
import { Container, Section } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Unikai Foods PJSC collects, uses and protects personal data submitted through this website.",
  alternates: alternates("/privacy"),
  robots: { index: true, follow: true },
};

/**
 * Privacy policy.
 *
 * TEMPLATE — REQUIRES LEGAL REVIEW BEFORE GO-LIVE.
 * This describes what the site as built actually does with data (enquiry
 * forms, CV uploads, chatbot transcripts, consent-gated analytics), which is
 * the honest starting point. It is not legal advice, and Unikai's counsel
 * must review it against UAE PDPL and any market-specific obligations.
 */
export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const ar = locale === "ar";

  const sections = ar
    ? [
        { h: "البيانات التي نجمعها", b: "نجمع البيانات التي تقدّمها عبر نماذج الاستفسار وطلبات التوظيف ومحادثات المساعد الرقمي: الاسم والشركة والبريد الإلكتروني والهاتف والدولة وتفاصيل استفسارك والسيرة الذاتية عند التقديم للوظائف." },
        { h: "كيف نستخدمها", b: "نستخدم بياناتك للرد على استفسارك وتوجيهه إلى الفريق المختص، ولمعالجة طلبات التوظيف. لا نبيع بياناتك الشخصية." },
        { h: "التحليلات وملفات تعريف الارتباط", b: "لا تُفعَّل ملفات تعريف الارتباط التحليلية إلا بعد موافقتك الصريحة عبر إشعار الموافقة. يمكنك رفضها دون التأثير على استخدامك للموقع." },
        { h: "الاحتفاظ بالبيانات", b: "نحتفظ ببيانات الاستفسارات وطلبات التوظيف طالما كانت ضرورية للغرض الذي جُمعت من أجله أو وفق ما يقتضيه القانون." },
        { h: "حقوقك", b: "يحق لك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها عبر مراسلتنا على العنوان أدناه." },
      ]
    : [
        {
          h: "Data we collect",
          b: "We collect the information you provide through enquiry forms, job applications and conversations with the website assistant: your name, company, email address, telephone number, country, the details of your enquiry, and — where you apply for a role — your CV.",
        },
        {
          h: "How we use it",
          b: "We use your information to respond to your enquiry and route it to the relevant team, and to process job applications. We do not sell your personal data.",
        },
        {
          h: "Analytics and cookies",
          b: "Analytics cookies are not enabled until you give explicit consent through the consent notice. Declining has no effect on your use of this website.",
        },
        {
          h: "Data retention",
          b: "Enquiry and application data is retained for as long as necessary for the purpose for which it was collected, or as required by law.",
        },
        {
          h: "Your rights",
          b: "You may request access to, correction of, or deletion of your personal data by contacting us at the address below.",
        },
      ];

  return (
    <>
      <PageHeader
        locale={locale}
        tone="cream"
        title={ar ? "سياسة الخصوصية" : "Privacy policy"}
        crumbs={[{ name: T("footer.privacy", locale), path: "/privacy" }]}
      />

      <Section tone="white">
        <Container size="narrow">
          <div className="space-y-9">
            {sections.map((s) => (
              <div key={s.h}>
                <h2 className="t-h3">{s.h}</h2>
                <p className="t-body mt-3">{s.b}</p>
              </div>
            ))}

            <div>
              <h2 className="t-h3">{ar ? "التواصل" : "Contact"}</h2>
              <p className="t-body mt-3">
                {site.name}
                <br />
                {ar
                  ? "ص.ب ٦٤٢٤، منطقة القوز الصناعية، دبي، الإمارات"
                  : "P.O. Box 6424, Al Quoz Industrial Area, Dubai, UAE"}
                <br />
                <a
                  href={`mailto:${site.contact.email}`}
                  className="font-semibold text-brand-navy"
                >
                  {site.contact.email}
                </a>
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
