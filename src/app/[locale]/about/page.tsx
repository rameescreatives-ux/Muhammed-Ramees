import type { Metadata } from "next";
import Image from "next/image";
import {
  aboutCopy,
  board,
  ceoMessage,
  management,
  mission,
  values,
  vision,
} from "@/content/site";
import { ranges, subRanges } from "@/content/products";
import type { Locale, Person } from "@/content/types";
import { T, t, tArray } from "@/lib/i18n";
import { alternates, breadcrumbSchema } from "@/lib/seo";
import { Container, Eyebrow, Section } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Portrait } from "@/components/ui/PackShot";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "About Unikai Foods — A UAE food manufacturer since 1977",
  description:
    "Unikai Foods PJSC was established in Dubai in 1977 and inaugurated by Sheikh Rashid bin Saeed Al Maktoum. Read our story, mission, values, board of directors and senior management.",
  alternates: alternates("/about"),
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const paras = tArray(aboutCopy.body, locale);
  const ceoParas = tArray(ceoMessage.body, locale);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([{ name: T("nav.about", locale), path: "/about" }], locale)}
      />

      <PageHeader
        locale={locale}
        tone="navy"
        eyebrow={T("label.since", locale)}
        title={t(aboutCopy.heading, locale)}
        lead={paras[0]}
        crumbs={[{ name: T("nav.about", locale), path: "/about" }]}
      />

      {/* Story */}
      <Section tone="white">
        <Container size="narrow">
          <div className="space-y-6">
            {paras.slice(1).map((p, i) => (
              <p key={i} className="t-body text-[1.0625rem]">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-ink-100 bg-ink-100 sm:grid-cols-3">
            <Stat value="1977" label={locale === "ar" ? "سنة التأسيس" : "Year founded"} />
            <Stat value={String(ranges.length)} label={locale === "ar" ? "مجموعات منتجات" : "Product ranges"} />
            <Stat value={String(subRanges.length)} label={locale === "ar" ? "مجموعة فرعية" : "Sub-ranges"} />
          </div>
        </Container>
      </Section>

      {/* Mission & vision */}
      <Section tone="cream">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-8 sm:p-10">
              <Eyebrow>{locale === "ar" ? "رسالتنا" : "Mission"}</Eyebrow>
              <p className="mt-5 text-[1.125rem] leading-relaxed text-ink">
                {t(mission, locale)}
              </p>
            </div>
            <div className="grain rounded-3xl bg-brand-navy p-8 text-white sm:p-10">
              <p className="t-eyebrow text-white/60">
                {locale === "ar" ? "رؤيتنا" : "Vision"}
              </p>
              <p className="mt-5 text-[1.125rem] leading-relaxed">
                {t(vision, locale)}
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Values */}
      <Section tone="white">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>{locale === "ar" ? "قيمنا" : "Our values"}</Eyebrow>
            <h2 className="t-h2 mt-3">
              {locale === "ar"
                ? "مبادئ توجّه كل ما نقوم به"
                : "Principles that guide everything we do"}
            </h2>
          </div>

          <div className="mt-11 grid gap-px overflow-hidden rounded-2xl border border-ink-100 bg-ink-100 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <div key={v.key} className="bg-white p-7 transition-colors hover:bg-cream">
                <h3 className="t-h3">{t(v.title, locale)}</h3>
                <p className="t-body mt-3 text-[0.9375rem]">{t(v.body, locale)}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CEO */}
      <Section tone="cream" id="ceo">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[340px_1fr] lg:gap-16">
            <div>
              <div className="relative aspect-4/5 overflow-hidden rounded-2xl">
                <Image
                  src={ceoMessage.image}
                  alt={ceoMessage.author}
                  fill
                  sizes="(max-width: 1024px) 70vw, 340px"
                  className="object-cover object-top"
                />
              </div>
              <p className="mt-5 text-[1.0625rem] font-bold text-ink">
                {ceoMessage.author}
              </p>
              <p className="text-[0.875rem] text-ink-500">
                {t(ceoMessage.authorRole, locale)}
              </p>
            </div>

            <div>
              <Eyebrow>
                {locale === "ar" ? "كلمة الرئيس التنفيذي" : "Message from our CEO"}
              </Eyebrow>
              <h2 className="t-h2 mt-3">{t(ceoMessage.heading, locale)}</h2>
              <div className="mt-7 space-y-5">
                {ceoParas.map((p, i) => (
                  <p
                    key={i}
                    className={i === 0 ? "t-lead font-medium text-ink" : "t-body"}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <PeopleGrid
        id="board"
        eyebrow={locale === "ar" ? "الحوكمة" : "Governance"}
        title={locale === "ar" ? "مجلس الإدارة" : "Board of Directors"}
        people={board}
        locale={locale}
        tone="white"
      />

      <PeopleGrid
        id="management"
        eyebrow={locale === "ar" ? "القيادة" : "Leadership"}
        title={locale === "ar" ? "الإدارة التنفيذية" : "Senior Management"}
        people={management}
        locale={locale}
        tone="cream"
      />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white px-4 py-7 text-center">
      <p className="nums-latin text-[2rem] font-extrabold tracking-tight text-brand-navy">
        {value}
      </p>
      <p className="mt-1 text-[0.8125rem] text-ink-500">{label}</p>
    </div>
  );
}

function PeopleGrid({
  id,
  eyebrow,
  title,
  people,
  locale,
  tone,
}: {
  id: string;
  eyebrow: string;
  title: string;
  people: Person[];
  locale: Locale;
  tone: "white" | "cream";
}) {
  return (
    <Section tone={tone} id={id}>
      <Container>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="t-h2 mt-3">{title}</h2>

        <div className="mt-11 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {people.map((p) => (
            <div key={p.name} className="group">
              <Portrait src={p.image} alt={p.name} />
              <p className="mt-3.5 text-[0.9375rem] font-bold leading-snug text-ink">
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
  );
}
