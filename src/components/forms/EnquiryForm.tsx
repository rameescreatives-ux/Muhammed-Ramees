"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import type { EnquiryType, Locale } from "@/content/types";
import { T } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { trackLead } from "@/components/layout/Analytics";

const TYPES: EnquiryType[] = ["export", "distribution", "general", "partnership"];

/** Static preview build: there is no server, so submission cannot work. */
const PREVIEW = process.env.NEXT_PUBLIC_STATIC_PREVIEW === "true";

/**
 * The enquiry form.
 *
 * Worth stating plainly: the current unikai.com has no working form at all —
 * every page renders the Contact Form 7 shortcode as literal text, so the
 * site captures nothing. This is the component that fixes that, and the
 * fields change with the enquiry type so an exporter is asked export
 * questions and a consumer is not.
 */
export function EnquiryForm({
  locale,
  defaultType = "general",
  lockType = false,
  productContext,
  compact = false,
}: {
  locale: Locale;
  defaultType?: EnquiryType;
  lockType?: boolean;
  productContext?: string;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const [type, setType] = useState<EnquiryType>(defaultType);
  const [state, setState] = useState<
    "idle" | "sending" | "done" | "error" | "preview"
  >("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("sending");

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          company: fd.get("company"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          country: fd.get("country"),
          products: productContext ?? fd.get("products"),
          volume: fd.get("volume"),
          message: fd.get("message"),
          enquiryType: type,
          consent: fd.get("consent") === "on",
          website: fd.get("website"),
          locale,
          source: pathname,
        }),
      });
      if (!res.ok) throw new Error();
      trackLead(type);
      setState("done");
    } catch {
      setState(PREVIEW ? "preview" : "error");
    }
  }

  if (state === "preview") {
    return (
      <div className="rounded-2xl border border-dashed border-ink-300 bg-ink-50 p-8 text-center">
        <p className="text-[1.0625rem] font-bold text-ink">
          {locale === "ar"
            ? "هذه معاينة ثابتة — الإرسال معطّل"
            : "Static preview — submission is disabled"}
        </p>
        <p className="t-body mx-auto mt-3 max-w-md text-[0.9375rem]">
          {locale === "ar"
            ? "النموذج يعمل بالكامل في النسخة المنشورة: يُحفظ الاستفسار ويُوجَّه إلى الفريق المختص."
            : "The form is fully working in the deployed build — the enquiry is stored and routed to the right department."}
        </p>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-brand-navy-100 bg-brand-navy-50 p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy text-white">
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 10.5 4 4 8-9" />
          </svg>
        </span>
        <p className="mt-4 text-[1.0625rem] font-bold text-ink">
          {T("form.success", locale)}
        </p>
      </div>
    );
  }

  const isExport = type === "export";
  const isTrade = type === "export" || type === "distribution";

  return (
    <form onSubmit={onSubmit} className={cn("grid gap-4", compact ? "" : "sm:grid-cols-2")}>
      {!lockType && (
        <Field label={T("form.enquiryType", locale)} className="sm:col-span-2">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setType(o)}
                aria-pressed={type === o}
                className={cn(
                  "rounded-full border px-4 py-2 text-[0.8125rem] font-semibold transition-all",
                  type === o
                    ? "border-brand-navy bg-brand-navy text-white"
                    : "border-ink-200 bg-white text-ink-700 hover:border-brand-navy hover:text-brand-navy",
                )}
              >
                {T(`enquiry.${o}`, locale)}
              </button>
            ))}
          </div>
        </Field>
      )}

      <Field label={T("form.name", locale)} required>
        <input name="name" required autoComplete="name" className={input} />
      </Field>

      <Field label={T("form.company", locale)} required={isTrade}>
        <input name="company" required={isTrade} autoComplete="organization" className={input} />
      </Field>

      <Field label={T("form.email", locale)} required>
        <input name="email" type="email" required autoComplete="email" className={input} />
      </Field>

      <Field label={T("form.phone", locale)}>
        <input name="phone" type="tel" autoComplete="tel" className={input} />
      </Field>

      {isTrade && (
        <Field label={T("form.country", locale)} required={isExport}>
          <input name="country" required={isExport} autoComplete="country-name" className={input} />
        </Field>
      )}

      {isTrade && (
        <Field label={T("form.volume", locale)}>
          <input
            name="volume"
            className={input}
            placeholder={locale === "ar" ? "مثال: حاوية شهرياً" : "e.g. 1 container per month"}
          />
        </Field>
      )}

      {!productContext && isTrade && (
        <Field label={T("form.products", locale)} className="sm:col-span-2">
          <input
            name="products"
            className={input}
            placeholder={locale === "ar" ? "الألبان، الآيس كريم، العصائر…" : "Dairy, ice cream, juices…"}
          />
        </Field>
      )}

      <Field label={T("form.message", locale)} className="sm:col-span-2">
        <textarea name="message" rows={5} className={cn(input, "h-auto resize-y py-3")} />
      </Field>

      {/* Honeypot — visually hidden, never announced to screen readers. */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-[0.875rem] leading-relaxed text-ink-700">
          <input
            name="consent"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-brand-navy)]"
          />
          {T("form.consent", locale)}
        </label>
      </div>

      {state === "error" && (
        <p className="text-[0.875rem] font-medium text-brand-red sm:col-span-2">
          {T("form.error", locale)}
        </p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={state === "sending"}>
          {state === "sending" ? T("form.sending", locale) : T("cta.submit", locale)}
        </Button>
      </div>
    </form>
  );
}

const input =
  "h-11 w-full rounded-xl border border-ink-200 bg-white px-4 text-[0.9375rem] outline-none transition-colors placeholder:text-ink-300 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15";

function Field({
  label,
  children,
  required,
  className,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[0.75rem] font-bold uppercase tracking-[0.1em] text-ink-500">
        {label}
        {required && <span className="ms-1 text-brand-red">*</span>}
      </span>
      {children}
    </label>
  );
}
