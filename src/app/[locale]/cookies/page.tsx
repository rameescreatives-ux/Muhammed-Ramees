import type { Metadata } from "next";
import type { Locale } from "@/content/types";
import { T } from "@/lib/i18n";
import { alternates } from "@/lib/seo";
import { Container, Section } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Which cookies this website uses, what they do, and how to control them.",
  alternates: alternates("/cookies"),
};

/** TEMPLATE — requires legal review before go-live. */
export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const ar = locale === "ar";

  const rows = ar
    ? [
        { n: "الضرورية", p: "دائماً مفعّلة", d: "تحفظ تفضيل اللغة واختيارك بشأن الموافقة. لا تتعقّبك." },
        { n: "التحليلية", p: "بموافقتك فقط", d: "Google Analytics — تقيس كيفية استخدام الموقع. لا تُفعَّل إلا بعد موافقتك." },
      ]
    : [
        {
          n: "Essential",
          p: "Always on",
          d: "Remember your language preference and your consent choice. These do not track you.",
        },
        {
          n: "Analytics",
          p: "Consent required",
          d: "Google Analytics — measures how the site is used. Not activated until you accept.",
        },
      ];

  return (
    <>
      <PageHeader
        locale={locale}
        tone="cream"
        title={ar ? "سياسة ملفات تعريف الارتباط" : "Cookie policy"}
        crumbs={[{ name: T("footer.cookies", locale), path: "/cookies" }]}
      />

      <Section tone="white">
        <Container size="narrow">
          <p className="t-body">
            {ar
              ? "نستخدم عدداً محدوداً من ملفات تعريف الارتباط. لا تُفعَّل ملفات التحليلات إلا بعد موافقتك الصريحة."
              : "We use a small number of cookies. Analytics cookies are not activated until you give explicit consent."}
          </p>

          <div className="mt-9 overflow-hidden rounded-2xl border border-ink-100">
            {rows.map((r, i) => (
              <div
                key={r.n}
                className={`p-6 ${i % 2 ? "bg-white" : "bg-ink-50"}`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-[1.0625rem] font-bold text-ink">{r.n}</h2>
                  <span className="rounded-full bg-brand-navy-50 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-brand-navy">
                    {r.p}
                  </span>
                </div>
                <p className="t-body mt-2.5 text-[0.9375rem]">{r.d}</p>
              </div>
            ))}
          </div>

          <p className="t-body mt-9">
            {ar
              ? "يمكنك تغيير اختيارك في أي وقت عبر مسح بيانات الموقع من متصفحك، وسيظهر إشعار الموافقة من جديد."
              : "You can change your choice at any time by clearing this site's data in your browser; the consent notice will then appear again."}
          </p>
        </Container>
      </Section>
    </>
  );
}
