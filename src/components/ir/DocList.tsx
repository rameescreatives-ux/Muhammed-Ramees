import type { IrDoc } from "@/content/ir";
import type { Locale } from "@/content/types";
import { Container, Eyebrow, Section } from "@/components/ui/Container";

/**
 * Investor-relations document library.
 *
 * The legacy site renders these as a flat wall of "View | Download" pairs
 * going back to 2015. Grouping by year makes a decade of filings navigable
 * without hiding anything — every document that exists today still appears.
 */
export function DocList({
  id,
  title,
  docs,
  locale,
  tone,
  grouped,
}: {
  id: string;
  title: string;
  docs: IrDoc[];
  locale: Locale;
  tone: "white" | "cream";
  grouped?: boolean;
}) {
  if (!docs.length) return null;

  const years = grouped
    ? [...new Set(docs.map((d) => d.year))].sort((a, b) => b.localeCompare(a))
    : null;

  return (
    <Section tone={tone} id={id}>
      <Container>
        <Eyebrow>{locale === "ar" ? "الوثائق" : "Documents"}</Eyebrow>
        <h2 className="t-h2 mt-3">{title}</h2>

        {years ? (
          <div className="mt-9 space-y-8">
            {years.map((year) => (
              <div key={year}>
                <h3 className="nums-latin mb-3 text-[0.8125rem] font-extrabold tracking-[0.12em] text-brand-red">
                  {year}
                </h3>
                <DocRows docs={docs.filter((d) => d.year === year)} locale={locale} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-9">
            <DocRows docs={docs} locale={locale} />
          </div>
        )}
      </Container>
    </Section>
  );
}

function DocRows({ docs, locale }: { docs: IrDoc[]; locale: Locale }) {
  return (
    <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white">
      {docs.map((doc) => (
        <li key={doc.url}>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-4 transition-colors hover:bg-ink-50 sm:px-6"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy-50 text-brand-navy">
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11.5 2H5.5A1.5 1.5 0 0 0 4 3.5v13A1.5 1.5 0 0 0 5.5 18h9a1.5 1.5 0 0 0 1.5-1.5V6.5zM11.5 2v4.5H16" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.9375rem] font-semibold text-ink transition-colors group-hover:text-brand-navy">
                {doc.title}
              </span>
              {doc.date && (
                <time
                  dateTime={doc.date}
                  className="mt-0.5 block text-[0.75rem] text-ink-500"
                >
                  {new Intl.DateTimeFormat(locale === "ar" ? "ar-AE" : "en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(doc.date))}
                </time>
              )}
            </span>
            <span className="shrink-0 text-[0.75rem] font-bold uppercase tracking-wider text-ink-500 transition-colors group-hover:text-brand-navy">
              PDF
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
