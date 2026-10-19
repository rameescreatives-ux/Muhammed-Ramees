"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/types";
import { ranges, subRanges } from "@/content/products";
import { T, href, swapLocale, t } from "@/lib/i18n";
import { mainNav } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink, Arrow } from "@/components/ui/Button";
import { PackShot } from "@/components/ui/PackShot";

export function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close everything on route change.
  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 160);
  };

  const isActive = (path: string) => {
    const p = pathname.replace(/^\/ar(?=\/|$)/, "") || "/";
    return path === "/" ? p === "/" : p.startsWith(path);
  };

  return (
    <>
      <a className="skip-link" href="#main">
        {T("nav.skip", locale)}
      </a>

      {/* Utility bar */}
      <div className="hidden bg-brand-navy-900 text-white lg:block">
        <div className="mx-auto flex h-9 max-w-[1480px] items-center justify-between px-8 text-[0.75rem]">
          <p className="tracking-wide text-white/70">
            {locale === "ar"
              ? "يونيكاي فودز ش.م.ع — مدرجة في سوق دبي المالي"
              : "Unikai Foods PJSC — Listed on the Dubai Financial Market"}
          </p>
          <div className="flex items-center gap-5">
            <a
              href="tel:800864524"
              className="text-white/80 transition-colors hover:text-white"
            >
              800UNIKAI
            </a>
            <span className="h-3 w-px bg-white/20" />
            <LocaleSwitcher locale={locale} pathname={pathname} />
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-300",
          scrolled || megaOpen
            ? "border-ink-100 bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_-24px_rgba(0,0,0,.4)]"
            : "border-transparent bg-white",
        )}
        onMouseLeave={scheduleClose}
      >
        <div className="mx-auto flex h-[68px] max-w-[1480px] items-center justify-between gap-6 px-5 sm:px-8">
          <Logo locale={locale} />

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {mainNav.map((item) =>
              item.mega ? (
                <button
                  key={item.key}
                  type="button"
                  onMouseEnter={openMega}
                  onFocus={openMega}
                  onClick={() => setMegaOpen((v) => !v)}
                  aria-expanded={megaOpen}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.9375rem] font-semibold transition-colors",
                    isActive(item.path) || megaOpen
                      ? "text-brand-navy"
                      : "text-ink-700 hover:text-brand-navy",
                  )}
                >
                  {T(item.key, locale)}
                  <svg
                    viewBox="0 0 12 12"
                    className={cn(
                      "h-3 w-3 transition-transform duration-300",
                      megaOpen && "rotate-180",
                    )}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="m3 4.5 3 3 3-3" />
                  </svg>
                </button>
              ) : (
                <Link
                  key={item.key}
                  href={href(item.path, locale)}
                  onMouseEnter={scheduleClose}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-[0.9375rem] font-semibold transition-colors",
                    isActive(item.path)
                      ? "text-brand-navy"
                      : "text-ink-700 hover:text-brand-navy",
                  )}
                >
                  {T(item.key, locale)}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink
              href={href("/contact", locale)}
              size="sm"
              variant="secondary"
              className="hidden sm:inline-flex"
            >
              {T("cta.enquire", locale)}
            </ButtonLink>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-100 text-ink lg:hidden"
              aria-label={T("nav.menu", locale)}
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 6h14M3 10h14M3 14h14" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mega menu */}
        <div
          onMouseEnter={openMega}
          className={cn(
            "absolute inset-x-0 top-full hidden overflow-hidden border-b border-ink-100 bg-white transition-[max-height,opacity] duration-400 ease-[cubic-bezier(.22,1,.36,1)] lg:block",
            megaOpen ? "max-h-[640px] opacity-100 shadow-[0_30px_60px_-30px_rgba(5,3,58,.35)]" : "pointer-events-none max-h-0 opacity-0",
          )}
        >
          <div className="mx-auto max-w-[1480px] px-8 py-9">
            <div className="grid grid-cols-4 gap-8">
              {ranges.map((range) => {
                const subs = subRanges.filter((s) => s.range === range.slug);
                return (
                  <div key={range.slug}>
                    <Link
                      href={href(`/products/${range.slug}`, locale)}
                      className="group block"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <span
                          className={cn(
                            "h-7 w-1 rounded-full",
                            range.accent === "red" ? "bg-brand-red" : "bg-brand-navy",
                          )}
                        />
                        <span className="text-[1.0625rem] font-bold tracking-tight text-ink transition-colors group-hover:text-brand-navy">
                          {t(range.name, locale)}
                        </span>
                      </div>
                      <p className="mb-4 text-[0.8125rem] leading-relaxed text-ink-500">
                        {t(range.tagline, locale)}
                      </p>
                    </Link>
                    <ul className="space-y-1.5">
                      {subs.slice(0, 8).map((sub) => (
                        <li key={sub.slug}>
                          <Link
                            href={href(`/products/${range.slug}/${sub.slug}`, locale)}
                            className="link-underline text-[0.875rem] text-ink-700 transition-colors hover:text-brand-navy"
                          >
                            {t(sub.name, locale)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-ink-100 pt-6">
              <Link
                href={href("/products", locale)}
                className="inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-brand-navy"
              >
                {T("nav.allRanges", locale)}
                <Arrow />
              </Link>
              <Link
                href={href("/export", locale)}
                className="inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-brand-red"
              >
                {T("cta.becomeDistributor", locale)}
                <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        locale={locale}
        pathname={pathname}
      />
    </>
  );
}

// ---------------------------------------------------------------- locale

function LocaleSwitcher({
  locale,
  pathname,
  dark = true,
}: {
  locale: Locale;
  pathname: string;
  dark?: boolean;
}) {
  const other: Locale = locale === "en" ? "ar" : "en";
  return (
    <Link
      href={swapLocale(pathname, other)}
      hrefLang={other}
      lang={other}
      className={cn(
        "font-semibold transition-colors",
        dark ? "text-white/80 hover:text-white" : "text-ink-700 hover:text-brand-navy",
      )}
    >
      {other === "ar" ? "العربية" : "English"}
    </Link>
  );
}

// ---------------------------------------------------------------- mobile

function MobileNav({
  open,
  onClose,
  locale,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  pathname: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] lg:hidden",
        open ? "" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-brand-navy-900/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "absolute inset-y-0 end-0 flex w-[min(92vw,26rem)] flex-col bg-white transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)]",
          open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
        )}
      >
        <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-ink-100 px-5">
          <Logo locale={locale} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-100"
          >
            <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-4" aria-label="Mobile">
          <button
            type="button"
            onClick={() => setExpanded(expanded === "products" ? null : "products")}
            className="flex w-full items-center justify-between py-3 text-lg font-bold text-ink"
          >
            {T("nav.products", locale)}
            <svg
              viewBox="0 0 12 12"
              className={cn("h-3.5 w-3.5 transition-transform", expanded === "products" && "rotate-180")}
              fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
            >
              <path d="m3 4.5 3 3 3-3" />
            </svg>
          </button>
          {expanded === "products" && (
            <ul className="mb-2 space-y-3 border-s-2 border-ink-100 ps-4">
              {ranges.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={href(`/products/${r.slug}`, locale)}
                    className="flex items-center gap-3 py-1 font-semibold text-ink-700"
                  >
                    <PackShot src={r.image} alt="" className="h-10 w-10 shrink-0 rounded-lg" sizes="40px" tone={r.accent} />
                    {t(r.name, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {mainNav
            .filter((i) => !i.mega)
            .map((item) => (
              <Link
                key={item.key}
                href={href(item.path, locale)}
                className="block border-t border-ink-100 py-3 text-lg font-bold text-ink"
              >
                {T(item.key, locale)}
              </Link>
            ))}
        </nav>

        <div className="shrink-0 border-t border-ink-100 p-5">
          <ButtonLink href={href("/contact", locale)} variant="secondary" className="w-full">
            {T("cta.enquire", locale)}
          </ButtonLink>
          <div className="mt-4 flex items-center justify-between text-sm">
            <a href="tel:800864524" className="font-semibold text-ink-700">800UNIKAI</a>
            <LocaleSwitcher locale={locale} pathname={pathname} dark={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
