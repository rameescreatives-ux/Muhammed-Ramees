import Link from "next/link";
import type { Locale } from "@/content/types";
import { ranges } from "@/content/products";
import { site } from "@/content/site";
import { T, href, t } from "@/lib/i18n";
import { irNav } from "@/lib/nav";
import { Logo } from "@/components/ui/Logo";

const socialIcon: Record<string, React.ReactNode> = {
  LinkedIn: <path d="M4.98 3.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM.5 8h4V21h-4zM8 8h3.8v1.8h.05c.53-1 1.83-2.05 3.76-2.05C19.6 7.75 21 10.1 21 13.5V21h-4v-6.6c0-1.58-.03-3.6-2.2-3.6-2.2 0-2.54 1.72-2.54 3.49V21H8z" />,
  Facebook: <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />,
  Instagram: <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2zm0 3.05A6.75 6.75 0 1 0 18.75 12 6.75 6.75 0 0 0 12 5.25zm0 11.14A4.39 4.39 0 1 1 16.39 12 4.39 4.39 0 0 1 12 16.39zm6.99-11.4a1.58 1.58 0 1 1-1.58-1.58 1.58 1.58 0 0 1 1.58 1.58z" />,
  YouTube: <path d="M23 12s0-3.2-.41-4.74a2.5 2.5 0 0 0-1.76-1.76C19.28 5.09 12 5.09 12 5.09s-7.28 0-8.83.41a2.5 2.5 0 0 0-1.76 1.76C1 8.8 1 12 1 12s0 3.2.41 4.74a2.5 2.5 0 0 0 1.76 1.76c1.55.41 8.83.41 8.83.41s7.28 0 8.83-.41a2.5 2.5 0 0 0 1.76-1.76C23 15.2 23 12 23 12zM9.68 15.25v-6.5L15.3 12z" />,
  X: <path d="M17.53 3h3.08l-6.73 7.7L21.8 21h-6.2l-4.86-6.35L5.18 21H2.1l7.2-8.23L2.2 3h6.36l4.39 5.8zm-1.08 16.14h1.7L7.63 4.77H5.8z" />,
};

export function Footer({ locale }: { locale: Locale }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-navy-900 text-white">
      <div className="mx-auto max-w-[1480px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand + contact */}
          <div>
            <Logo locale={locale} invert />
            <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-white/60">
              {t(site.summary, locale)}
            </p>

            <div className="mt-7 space-y-3 text-[0.875rem]">
              <div>
                <p className="mb-1 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white/40">
                  {T("footer.headOffice", locale)}
                </p>
                <p className="text-white/80">{t(site.contact.headOffice, locale)}</p>
              </div>
              <p>
                <a href={site.contact.tollHref} className="font-semibold text-white transition-opacity hover:opacity-70">
                  {site.contact.toll}
                </a>
              </p>
              <p>
                <a href={`mailto:${site.contact.email}`} className="text-white/80 transition-colors hover:text-white">
                  {site.contact.email}
                </a>
              </p>
            </div>

            <div className="mt-7">
              <p className="mb-3 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white/40">
                {T("footer.follow", locale)}
              </p>
              <div className="flex gap-2.5">
                {site.social
                  .filter((s) => s.href)
                  .map((s) => (
                    <a
                      key={s.label}
                      href={s.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all hover:border-white/40 hover:bg-white/10 hover:text-white"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                        {socialIcon[s.label]}
                      </svg>
                    </a>
                  ))}
              </div>
            </div>
          </div>

          <FooterCol title={T("label.ranges", locale)}>
            {ranges.map((r) => (
              <FooterLink key={r.slug} href={href(`/products/${r.slug}`, locale)}>
                {t(r.name, locale)}
              </FooterLink>
            ))}
            <FooterLink href={href("/products", locale)}>
              {T("nav.allRanges", locale)}
            </FooterLink>
          </FooterCol>

          <FooterCol title={locale === "ar" ? "الشركة" : "Company"}>
            <FooterLink href={href("/about", locale)}>{T("nav.about", locale)}</FooterLink>
            <FooterLink href={href("/quality", locale)}>{T("nav.quality", locale)}</FooterLink>
            <FooterLink href={href("/export", locale)}>{T("nav.export", locale)}</FooterLink>
            <FooterLink href={href("/news", locale)}>{T("nav.news", locale)}</FooterLink>
            <FooterLink href={href("/careers", locale)}>{T("nav.careers", locale)}</FooterLink>
            <FooterLink href={href("/contact", locale)}>{T("nav.contact", locale)}</FooterLink>
          </FooterCol>

          <FooterCol title={T("nav.investors", locale)}>
            {irNav.slice(0, 6).map((i) => (
              <FooterLink
                key={i.slug || "overview"}
                href={href(`/investor-relations${i.slug ? `/${i.slug}` : ""}`, locale)}
              >
                {locale === "ar" ? i.ar : i.en}
              </FooterLink>
            ))}
            <FooterLink href={site.dfm.profileUrl} external>
              {locale === "ar" ? "معلومات السهم (سوق دبي المالي)" : "Stock information (DFM)"}
            </FooterLink>
          </FooterCol>
        </div>

        <div className="swoosh-divider mt-14 opacity-60" />

        <div className="mt-6 flex flex-col gap-4 text-[0.8125rem] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. {T("footer.rights", locale)}
          </p>
          <div className="flex gap-6">
            <Link href={href("/privacy", locale)} className="transition-colors hover:text-white">
              {T("footer.privacy", locale)}
            </Link>
            <Link href={href("/cookies", locale)} className="transition-colors hover:text-white">
              {T("footer.cookies", locale)}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-4 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white/40">
        {title}
      </p>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({
  href: h,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <li>
      {external ? (
        <a
          href={h}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline text-[0.875rem] text-white/70 transition-colors hover:text-white"
        >
          {children}
        </a>
      ) : (
        <Link
          href={h}
          className="link-underline text-[0.875rem] text-white/70 transition-colors hover:text-white"
        >
          {children}
        </Link>
      )}
    </li>
  );
}
