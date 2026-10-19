import Link from "next/link";
import type { Locale } from "@/content/types";
import { T, href } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Container } from "./Container";

export interface Crumb {
  name: string;
  path: string;
}

export function Breadcrumbs({
  crumbs,
  locale,
  light,
}: {
  crumbs: Crumb[];
  locale: Locale;
  light?: boolean;
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol
        className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem]",
          light ? "text-white/60" : "text-ink-500",
        )}
      >
        <li>
          <Link href={href("/", locale)} className="transition-colors hover:underline">
            {T("label.home", locale)}
          </Link>
        </li>
        {crumbs.map((c, i) => (
          <li key={c.path} className="flex items-center gap-2">
            <span aria-hidden className="opacity-50">
              /
            </span>
            {i === crumbs.length - 1 ? (
              <span className={cn("font-semibold", light ? "text-white" : "text-ink")}>
                {c.name}
              </span>
            ) : (
              <Link href={href(c.path, locale)} className="transition-colors hover:underline">
                {c.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lead,
  crumbs,
  locale,
  tone = "light",
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  crumbs?: Crumb[];
  locale: Locale;
  tone?: "light" | "navy" | "cream";
  children?: React.ReactNode;
}) {
  const dark = tone === "navy";

  return (
    <header
      className={cn(
        "border-b",
        dark && "grain border-transparent bg-gradient-to-br from-brand-navy-900 via-brand-navy-800 to-brand-navy text-white",
        tone === "cream" && "border-ink-100 bg-cream",
        tone === "light" && "border-ink-100 bg-white",
      )}
    >
      <Container className="py-10 sm:py-14">
        {crumbs && <Breadcrumbs crumbs={crumbs} locale={locale} light={dark} />}

        <div className="mt-6 max-w-3xl">
          {eyebrow && (
            <p className={cn("t-eyebrow", dark && "text-white/60")}>{eyebrow}</p>
          )}
          <h1 className={cn("t-h1 mt-3 text-balance", dark && "text-white")}>
            {title}
          </h1>
          {lead && (
            <p
              className={cn(
                "mt-5 text-[1.0625rem] leading-relaxed sm:text-[1.125rem]",
                dark ? "text-white/70" : "text-ink-700",
              )}
            >
              {lead}
            </p>
          )}
          {children && <div className="mt-7">{children}</div>}
        </div>
      </Container>
    </header>
  );
}

/**
 * Surfaces content Unikai still needs to supply, rather than hiding a gap
 * behind invented copy. Hidden from visitors in production unless
 * NEXT_PUBLIC_SHOW_GAPS is on — during review it is exactly what the client
 * needs to see.
 */
export function GapNotice({
  notes,
}: {
  notes: { field: string; note: string; severity: string }[];
}) {
  if (!notes.length || process.env.NEXT_PUBLIC_SHOW_GAPS !== "true") return null;

  return (
    <aside className="rounded-xl border border-dashed border-amber-400 bg-amber-50/70 p-4">
      <p className="text-[0.6875rem] font-extrabold uppercase tracking-[0.14em] text-amber-700">
        Content pending from Unikai
      </p>
      <ul className="mt-2.5 space-y-1.5">
        {notes.map((n) => (
          <li key={n.field} className="text-[0.8125rem] leading-relaxed text-amber-900">
            <span className="font-semibold">{n.severity}</span> — {n.note}
          </li>
        ))}
      </ul>
    </aside>
  );
}
