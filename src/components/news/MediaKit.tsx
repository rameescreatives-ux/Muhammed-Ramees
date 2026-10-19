import type { Locale } from "@/content/types";
import { site } from "@/content/site";
import { Container, Eyebrow, Section } from "@/components/ui/Container";

/**
 * Media kit.
 *
 * Journalists currently have no way to get Unikai assets without emailing —
 * this replaces that round trip. Only facts Unikai already publishes appear
 * here; the logo pack link points at the brand assets served by this site.
 */
export function MediaKit({ locale }: { locale: Locale }) {
  const ar = locale === "ar";

  const facts = [
    { k: ar ? "الاسم القانوني" : "Legal name", v: site.name },
    { k: ar ? "سنة التأسيس" : "Founded", v: "1977" },
    { k: ar ? "المقر" : "Headquarters", v: ar ? "دبي، الإمارات" : "Dubai, UAE" },
    { k: ar ? "الإدراج" : "Listing", v: `Dubai Financial Market — ${site.dfm.ticker}` },
    { k: ar ? "القطاع" : "Sector", v: ar ? "السلع الاستهلاكية سريعة الدوران" : "FMCG — food & beverage manufacturing" },
    { k: ar ? "الرئيس التنفيذي" : "Chief Executive", v: "Neeraj Vohra" },
  ];

  return (
    <Section tone="cream">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <Eyebrow>{ar ? "للإعلام" : "Press kit"}</Eyebrow>
            <h2 className="t-h2 mt-3">
              {ar ? "موارد إعلامية" : "Media resources"}
            </h2>
            <p className="t-body mt-5">
              {ar
                ? "للاستفسارات الإعلامية وطلبات المقابلات والأصول عالية الدقة، يرجى التواصل عبر البريد الإلكتروني أدناه."
                : "For media enquiries, interview requests and high-resolution assets, contact us using the email below."}
            </p>
            <a
              href={`mailto:${site.contact.email}`}
              className="mt-5 inline-block font-bold text-brand-navy"
            >
              {site.contact.email}
            </a>
          </div>

          <div>
            <dl className="overflow-hidden rounded-2xl border border-ink-100">
              {facts.map((f, i) => (
                <div
                  key={f.k}
                  className={`grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-6 ${
                    i % 2 ? "bg-white" : "bg-ink-50"
                  }`}
                >
                  <dt className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-ink-500">
                    {f.k}
                  </dt>
                  <dd className="text-[0.9375rem] text-ink">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </Section>
  );
}
