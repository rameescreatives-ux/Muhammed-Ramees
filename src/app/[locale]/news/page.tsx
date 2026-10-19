import type { Metadata } from "next";
import { sortedNews } from "@/content/news";
import type { Locale } from "@/content/types";
import { T } from "@/lib/i18n";
import { alternates, breadcrumbSchema } from "@/lib/seo";
import { Container, Section } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { NewsCard } from "@/components/news/NewsStrip";
import { JsonLd } from "@/components/seo/JsonLd";
import { MediaKit } from "@/components/news/MediaKit";

export const metadata: Metadata = {
  title: "News & Announcements",
  description:
    "Press releases, regulatory disclosures and announcements from Unikai Foods PJSC, including financial results and integrated reports.",
  alternates: alternates("/news"),
};

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const items = sortedNews();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([{ name: T("nav.news", locale), path: "/news" }], locale)}
      />

      <PageHeader
        locale={locale}
        tone="navy"
        eyebrow={T("nav.news", locale)}
        title={locale === "ar" ? "الأخبار والإفصاحات" : "News & announcements"}
        lead={
          locale === "ar"
            ? "البيانات الصحفية والإفصاحات التنظيمية من يونيكاي فودز ش.م.ع."
            : "Press releases and regulatory disclosures from Unikai Foods PJSC."
        }
        crumbs={[{ name: T("nav.news", locale), path: "/news" }]}
      />

      <Section tone="white">
        <Container>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <NewsCard key={item.slug} item={item} locale={locale} />
            ))}
          </div>
        </Container>
      </Section>

      <MediaKit locale={locale} />
    </>
  );
}
