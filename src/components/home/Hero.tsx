"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/content/types";
import { href, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Arrow } from "@/components/ui/Button";
import { ranges, subRanges } from "@/content/products";

/**
 * Homepage hero.
 *
 * Slides are admin-managed in production (scheduled, reorderable, with
 * independent EN/AR copy) — this component renders whatever the banners table
 * returns. The array below is the launch seed, built only from assets and
 * claims that already exist on unikai.com.
 */

export interface Slide {
  id: string;
  eyebrow: { en: string; ar?: string };
  title: { en: string; ar?: string };
  body: { en: string; ar?: string };
  cta: { label: { en: string; ar?: string }; path: string };
  secondary?: { label: { en: string; ar?: string }; path: string };
  image?: string;
  tone: "navy" | "red" | "deep";
}

export function Hero({ slides, locale }: { slides: Slide[]; locale: Locale }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (n: number) => setIndex((n + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = setInterval(() => go(index + 1), 7000);
    return () => clearInterval(id);
  }, [index, paused, go, slides.length]);

  const slide = slides[index];

  const bg =
    slide.tone === "red"
      ? "from-brand-red-700 via-brand-red to-brand-red-600"
      : slide.tone === "deep"
        ? "from-brand-navy-900 via-brand-navy-800 to-brand-navy"
        : "from-brand-navy-800 via-brand-navy to-brand-navy-600";

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      data-hero
      /* Static exports ship only the first slide's markup. Carrying the
         rest as data lets a plain script rotate them with no framework. */
      data-slides={JSON.stringify(
        slides.map((s) => ({
          eyebrow: t(s.eyebrow, locale),
          title: t(s.title, locale),
          body: t(s.body, locale),
          image: s.image,
          ctaLabel: t(s.cta.label, locale),
          ctaHref: href(s.cta.path, locale),
        })),
      )}
    >
      <div className={cn("grain bg-gradient-to-br transition-colors duration-700", bg)}>
        <div className="mx-auto grid max-w-[1480px] items-center gap-8 px-5 pb-16 pt-12 sm:px-8 sm:gap-10 sm:pt-14 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:pb-24 lg:pt-20">
          {/* Copy */}
          <div key={slide.id} className="anim-fade-up relative z-10 order-2 text-white lg:order-1">
            <p className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {t(slide.eyebrow, locale)}
            </p>

            <h1 className="t-display max-w-[16ch] text-balance">
              {t(slide.title, locale)}
            </h1>

            <p className="mt-6 max-w-[48ch] text-[1.0625rem] leading-relaxed text-white/75 sm:text-[1.125rem]">
              {t(slide.body, locale)}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={href(slide.cta.path, locale)}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[0.9375rem] font-bold text-brand-navy shadow-[0_14px_36px_-16px_rgba(0,0,0,.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-16px_rgba(0,0,0,.7)]"
              >
                {t(slide.cta.label, locale)}
                <Arrow />
              </Link>
              {slide.secondary && (
                <Link
                  href={href(slide.secondary.path, locale)}
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-7 text-[0.9375rem] font-bold text-white transition-colors hover:border-white/60 hover:bg-white/10"
                >
                  {t(slide.secondary.label, locale)}
                </Link>
              )}
            </div>
          </div>

          {/* Visual.
              Shown on every breakpoint: hiding it below lg left phones —
              most of the traffic — with a hero that had no image at all. */}
          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-[5/3] sm:aspect-4/3">
              {slide.image ? (
                <Image
                  key={slide.image}
                  src={slide.image}
                  alt={t(slide.eyebrow, locale)}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 560px"
                  className="anim-slow-zoom object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,.35)]"
                />
              ) : null}
              <div
                aria-hidden
                className="absolute -inset-10 -z-10 rounded-full bg-white/10 blur-3xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-5 z-20">
          <div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 sm:px-8">
            <div className="flex gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Slide ${i + 1}`}
                  data-hero-dot={i}
                  aria-current={i === index}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === index ? "w-10 bg-white" : "w-4 bg-white/35 hover:bg-white/60",
                  )}
                />
              ))}
            </div>
            <div className="hidden gap-2 sm:flex">
              <HeroArrow onClick={() => go(index - 1)} dir="prev" />
              <HeroArrow onClick={() => go(index + 1)} dir="next" />
            </div>
          </div>
        </div>
      )}

      {/* Key figures strip */}
      <div className="border-b border-ink-100 bg-white">
        <div className="mx-auto grid max-w-[1480px] grid-cols-2 gap-px bg-ink-100 px-5 sm:px-8 lg:grid-cols-4">
          <Figure value="1977" label={{ en: "Founded in Dubai", ar: "تأسست في دبي" }} locale={locale} />
          <Figure value={String(ranges.length)} label={{ en: "Product ranges", ar: "مجموعات منتجات" }} locale={locale} />
          <Figure value={String(subRanges.length)} label={{ en: "Sub-ranges", ar: "مجموعة فرعية" }} locale={locale} />
          <Figure value="DFM" label={{ en: "Listed — ticker UNIKAI", ar: "مدرجة — رمز يونيكاي" }} locale={locale} />
        </div>
      </div>
    </section>
  );
}

function HeroArrow({ onClick, dir }: { onClick: () => void; dir: "prev" | "next" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous slide" : "Next slide"}
      data-hero-arrow={dir}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/80 backdrop-blur-sm transition-colors hover:border-white/50 hover:bg-white/10 hover:text-white"
    >
      <svg
        viewBox="0 0 16 16"
        className={cn("h-3.5 w-3.5 rtl:-scale-x-100", dir === "prev" && "rotate-180")}
        fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M3 8h10M9 4l4 4-4 4" />
      </svg>
    </button>
  );
}

function Figure({
  value,
  label,
  locale,
}: {
  value: string;
  label: { en: string; ar?: string };
  locale: Locale;
}) {
  return (
    <div className="bg-white px-1 py-6 text-center sm:py-7">
      <p className="nums-latin text-[1.75rem] font-extrabold tracking-tight text-brand-navy sm:text-[2rem]">
        {value}
      </p>
      <p className="mt-1 text-[0.75rem] font-medium text-ink-500">{t(label, locale)}</p>
    </div>
  );
}
