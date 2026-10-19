import Link from "next/link";
import type { Locale } from "@/content/types";
import { ranges, subRanges } from "@/content/products";
import { aboutCopy, site } from "@/content/site";
import { T, href, t, tArray } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Container, Eyebrow, Section } from "@/components/ui/Container";
import { ButtonLink, Arrow } from "@/components/ui/Button";
import { PackShot } from "@/components/ui/PackShot";

/* ---------------------------------------------------------------- ranges */

export function RangeGrid({ locale }: { locale: Locale }) {
  return (
    <Section tone="white">
      <Container>
        <div className="mb-11 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <Eyebrow>{T("label.ranges", locale)}</Eyebrow>
            <h2 className="t-h2 mt-3 text-balance">
              {locale === "ar"
                ? "أربع مجموعات، محفظة واحدة متكاملة"
                : "Four ranges, one integrated portfolio"}
            </h2>
            <p className="t-lead mt-4">
              {locale === "ar"
                ? "من الحليب الطازج إلى الآيس كريم والعصائر والأغذية — تُنتج جميعها في منشآتنا بدولة الإمارات."
                : "From fresh dairy through ice cream, juices and ambient foods — all produced at our UAE facilities."}
            </p>
          </div>
          <ButtonLink href={href("/products", locale)} variant="ghost" className="self-start sm:self-auto">
            {T("nav.allRanges", locale)}
            <Arrow />
          </ButtonLink>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ranges.map((range, i) => {
            const count = subRanges.filter((s) => s.range === range.slug).length;
            return (
              <Link
                key={range.slug}
                href={href(`/products/${range.slug}`, locale)}
                className="card-lift group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white p-5"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <span
                  className={cn(
                    "absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100 rtl:origin-right",
                    range.accent === "red" ? "bg-brand-red" : "bg-brand-navy",
                  )}
                />
                <PackShot
                  src={range.image}
                  alt={t(range.name, locale)}
                  tone={range.accent === "red" ? "red" : "navy"}
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                />
                <div className="mt-5 flex flex-1 flex-col">
                  <h3 className="t-h3">{t(range.name, locale)}</h3>
                  <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-ink-500">
                    {t(range.tagline, locale)}
                  </p>
                  <p className="mt-4 inline-flex items-center gap-2 text-[0.8125rem] font-bold text-brand-navy">
                    <span className="nums-latin">{count}</span>{" "}
                    {T("label.subRanges", locale)}
                    <Arrow className="transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

/* ---------------------------------------------------------------- intro */

export function Intro({ locale }: { locale: Locale }) {
  const paras = tArray(aboutCopy.body, locale);

  return (
    <Section tone="cream">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1fr] lg:gap-20">
          <div>
            <Eyebrow>{T("label.since", locale)}</Eyebrow>
            <h2 className="t-h2 mt-3 text-balance">
              {t(aboutCopy.heading, locale)}
            </h2>
            <div className="swoosh-divider mt-7 w-28" />
          </div>

          <div>
            <p className="t-lead font-medium text-ink">{paras[0]}</p>
            <p className="t-body mt-5">{paras[1]}</p>
            <p className="t-body mt-5">{paras[2]}</p>

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href={href("/about", locale)}>
                {locale === "ar" ? "تعرّف على يونيكاي" : "About Unikai"}
                <Arrow />
              </ButtonLink>
              <ButtonLink href={href("/quality", locale)} variant="ghost">
                {T("nav.quality", locale)}
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------- strengths */

const strengths = [
  {
    key: "heritage",
    title: { en: "Nearly five decades of manufacturing", ar: "قرابة خمسة عقود من التصنيع" },
    body: {
      en: "Founded in 1977 and inaugurated by the then Ruler of Dubai, Sheikh Rashid bin Saeed Al Maktoum. One of the UAE's longest-established food manufacturers.",
      ar: "تأسست عام ١٩٧٧ وافتتحها حاكم دبي آنذاك الشيخ راشد بن سعيد آل مكتوم. من أعرق مصنّعي الأغذية في الإمارات.",
    },
  },
  {
    key: "portfolio",
    title: { en: "A genuinely diversified portfolio", ar: "محفظة منتجات متنوعة" },
    body: {
      en: "Chilled dairy, frozen ice cream, chilled and ambient beverages and dry foods — four temperature regimes under one manufacturer.",
      ar: "ألبان مبردة، وآيس كريم مجمّد، ومشروبات مبردة وطويلة الأجل، وأغذية جافة — أربع أنظمة حرارية لدى مصنّع واحد.",
    },
  },
  {
    key: "distribution",
    title: { en: "Established regional distribution", ar: "شبكة توزيع إقليمية راسخة" },
    body: {
      en: "An extensive distribution network across the UAE and Oman, with the brand present in homes across the region.",
      ar: "شبكة توزيع واسعة في الإمارات وعُمان، وحضور للعلامة في منازل المنطقة.",
    },
  },
  {
    key: "governance",
    title: { en: "Public-company governance", ar: "حوكمة شركة مساهمة عامة" },
    body: {
      en: "A public joint stock company listed on the Dubai Financial Market, reporting under a published governance framework.",
      ar: "شركة مساهمة عامة مدرجة في سوق دبي المالي، تفصح وفق إطار حوكمة معلن.",
    },
  },
];

export function Strengths({ locale }: { locale: Locale }) {
  return (
    <Section tone="white">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>{locale === "ar" ? "لماذا يونيكاي" : "Why Unikai"}</Eyebrow>
          <h2 className="t-h2 mt-3 text-balance">
            {locale === "ar"
              ? "شريك تصنيع يمكن للمشترين الاعتماد عليه"
              : "A manufacturing partner trade buyers can rely on"}
          </h2>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-ink-100 bg-ink-100 sm:grid-cols-2">
          {strengths.map((s, i) => (
            <div key={s.key} className="bg-white p-7 transition-colors hover:bg-cream sm:p-9">
              <p className="nums-latin text-[0.75rem] font-extrabold tracking-widest text-brand-red">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="t-h3 mt-3">{t(s.title, locale)}</h3>
              <p className="t-body mt-3 text-[0.9375rem]">{t(s.body, locale)}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ---------------------------------------------------------------- export */

export function ExportBand({ locale }: { locale: Locale }) {
  const steps =
    locale === "ar"
      ? [
          { n: "01", t: "أخبرنا بسوقك", b: "الدولة والمنتجات والكميات التقديرية." },
          { n: "02", t: "نؤكد التوافر", b: "يراجع فريق التصدير المنتجات المناسبة لسوقك." },
          { n: "03", t: "المستندات والشروط", b: "نوضح المتطلبات والخطوات التالية." },
        ]
      : [
          { n: "01", t: "Tell us your market", b: "Destination country, products of interest and estimated volumes." },
          { n: "02", t: "We confirm availability", b: "The export team reviews which products suit your market." },
          { n: "03", t: "Documentation & terms", b: "We set out the requirements and the next steps." },
        ];

  return (
    <Section tone="navy" className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -end-32 -top-32 h-96 w-96 rounded-full bg-brand-red/20 blur-3xl"
      />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <p className="t-eyebrow text-white/60">{T("nav.export", locale)}</p>
            <h2 className="t-h2 mt-3 text-balance text-white">
              {locale === "ar"
                ? "تبحث عن الاستيراد أو التوزيع؟"
                : "Looking to import or distribute Unikai?"}
            </h2>
            <p className="mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-white/70">
              {locale === "ar"
                ? "نوصل منتجاتنا إلى الأسواق الدولية عبر موزعين معتمدين. أرسل استفسار تصدير وسيتواصل معك فريق التصدير بالخطوات المناسبة لسوقك."
                : "We supply international markets through appointed distributors. Send an export enquiry and our export team will come back with the process for your market."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={href("/export", locale)} variant="light">
                {T("cta.becomeDistributor", locale)}
                <Arrow />
              </ButtonLink>
              <ButtonLink
                href={href("/contact", locale)}
                variant="ghost"
                className="border-white/30 bg-transparent text-white hover:border-white/60 hover:text-white"
              >
                {T("cta.enquire", locale)}
              </ButtonLink>
            </div>
          </div>

          <ol className="space-y-px overflow-hidden rounded-2xl bg-white/10">
            {steps.map((s) => (
              <li key={s.n} className="bg-brand-navy-800/60 p-6 backdrop-blur-sm sm:p-7">
                <div className="flex gap-5">
                  <span className="nums-latin shrink-0 text-[0.8125rem] font-extrabold tracking-widest text-white/40">
                    {s.n}
                  </span>
                  <div>
                    <p className="font-bold text-white">{s.t}</p>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-white/60">{s.b}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------- contact */

export function ContactBand({ locale }: { locale: Locale }) {
  return (
    <Section tone="cream">
      <Container>
        <div className="grid gap-10 rounded-3xl border border-ink-100 bg-white p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Eyebrow>{T("nav.contact", locale)}</Eyebrow>
            <h2 className="t-h2 mt-3 text-balance">
              {locale === "ar" ? "تحدّث إلى فريق المبيعات" : "Talk to the sales team"}
            </h2>
            <p className="t-lead mt-4 max-w-xl">
              {locale === "ar"
                ? "سواء كنت موزعاً أو مستورداً أو مشتري تجزئة أو لديك سؤال عن منتج — وجّه استفسارك إلى الفريق المناسب."
                : "Distributor, importer, retail buyer, or a question about a product — send your enquiry to the right team."}
            </p>

            <dl className="mt-8 grid gap-6 sm:grid-cols-3">
              <div>
                <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-ink-500">
                  {locale === "ar" ? "هاتف" : "Telephone"}
                </dt>
                <dd className="mt-1.5">
                  <a href={site.contact.tollHref} className="font-bold text-brand-navy">
                    {site.contact.toll}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-ink-500">
                  {locale === "ar" ? "بريد إلكتروني" : "Email"}
                </dt>
                <dd className="mt-1.5">
                  <a href={`mailto:${site.contact.email}`} className="font-bold text-brand-navy">
                    {site.contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-ink-500">
                  {T("footer.headOffice", locale)}
                </dt>
                <dd className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-700">
                  {t(site.contact.headOffice, locale)}
                </dd>
              </div>
            </dl>
          </div>

          <ButtonLink href={href("/contact", locale)} size="lg" variant="secondary">
            {T("cta.enquire", locale)}
            <Arrow />
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
