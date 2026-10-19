import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Chatbot } from "@/components/chat/Chatbot";
import { ConsentBanner } from "@/components/layout/ConsentBanner";
import { Analytics } from "@/components/layout/Analytics";
import { dir, isLocale, locales } from "@/lib/i18n";
import { organizationSchema, websiteSchema, SITE_URL } from "@/lib/seo";
import type { Locale } from "@/content/types";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Unikai Foods PJSC — Dairy, Ice Cream, Juice & Foods | UAE",
    template: "%s | Unikai Foods",
  },
  description:
    "Unikai Foods PJSC is one of the largest diversified FMCG manufacturers in the UAE, producing dairy, ice cream, juice and food products since 1977. Distribution, wholesale and export enquiries welcome.",
  applicationName: "Unikai Foods",
  authors: [{ name: "Unikai Foods PJSC" }],
  openGraph: {
    type: "website",
    siteName: "Unikai Foods PJSC",
    locale: "en_AE",
    alternateLocale: "ar_AE",
  },
  twitter: { card: "summary_large_image", site: "@Unikai_Foods" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <html lang={locale} dir={dir(locale)} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
        />
        <script
          type="application/ld+json"
          // Organization + WebSite schema. Static, author-controlled JSON.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema(), websiteSchema()]),
          }}
        />
      </head>
      <body className="min-h-screen bg-white antialiased">
        <Header locale={locale} />
        <main id="main">{children}</main>
        <Footer locale={locale} />
        <Chatbot locale={locale} />
        <ConsentBanner locale={locale} />
        <Analytics />
      </body>
    </html>
  );
}
