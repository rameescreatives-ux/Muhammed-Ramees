"use client";

import { useState } from "react";
import type { Locale } from "@/content/types";
import { T } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

const MAX_CV_MB = 5;
const ACCEPT = ".pdf,.doc,.docx";

/**
 * Job application form with CV upload.
 *
 * Replaces the legacy "email us your CV" flow, which gave HR no pipeline and
 * — given Unikai's own recruitment-fraud notice — no way to show candidates a
 * verified official channel.
 *
 * The CV is validated client-side for type and size, then uploaded through
 * the server route; it is never exposed to a public bucket.
 */
export function ApplicationForm({ locale }: { locale: Locale }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const ar = locale === "ar";

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setFileError("");
    if (!f) return setFileName("");

    if (f.size > MAX_CV_MB * 1024 * 1024) {
      setFileError(ar ? `الحد الأقصى ${MAX_CV_MB} ميجابايت` : `Maximum file size is ${MAX_CV_MB}MB`);
      e.target.value = "";
      setFileName("");
      return;
    }
    setFileName(f.name);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (fileError) return;
    setState("sending");

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        body: new FormData(e.currentTarget),
      });
      if (!res.ok) throw new Error();
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-brand-navy-100 bg-brand-navy-50 p-8 text-center">
        <p className="text-[1.0625rem] font-bold text-ink">
          {ar
            ? "شكراً لك — تم استلام طلبك. سيراجعه فريق الموارد البشرية."
            : "Thank you — your application has been received. Our HR team will review it."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label={T("form.name", locale)} required>
        <input name="name" required autoComplete="name" className={input} />
      </Field>
      <Field label={T("form.email", locale)} required>
        <input name="email" type="email" required autoComplete="email" className={input} />
      </Field>
      <Field label={T("form.phone", locale)}>
        <input name="phone" type="tel" autoComplete="tel" className={input} />
      </Field>
      <Field label={ar ? "الدور المرغوب" : "Role of interest"}>
        <input name="role" className={input} />
      </Field>

      <Field label={ar ? "السيرة الذاتية" : "CV / Résumé"} required className="sm:col-span-2">
        <label
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-4 transition-colors",
            fileError ? "border-brand-red bg-brand-red-50" : "border-ink-300 bg-ink-50 hover:border-brand-navy",
          )}
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-ink-500" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13V3m0 0L6.5 6.5M10 3l3.5 3.5M4 15h12" />
          </svg>
          <span className="text-[0.875rem] text-ink-700">
            {fileName || (ar ? `PDF أو Word — حتى ${MAX_CV_MB} ميجابايت` : `PDF or Word — up to ${MAX_CV_MB}MB`)}
          </span>
          <input
            name="cv"
            type="file"
            accept={ACCEPT}
            required
            onChange={onFile}
            className="sr-only"
          />
        </label>
        {fileError && <p className="mt-1.5 text-[0.8125rem] text-brand-red">{fileError}</p>}
      </Field>

      <Field label={ar ? "نبذة عنك" : "Cover note"} className="sm:col-span-2">
        <textarea name="message" rows={4} className={cn(input, "h-auto resize-y py-3")} />
      </Field>

      <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-[0.875rem] leading-relaxed text-ink-700">
          <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-brand-navy)]" />
          {ar
            ? "أوافق على أن تحتفظ يونيكاي ببياناتي لغرض التوظيف."
            : "I agree that Unikai may retain my details for recruitment purposes."}
        </label>
      </div>

      {state === "error" && (
        <p className="text-[0.875rem] font-medium text-brand-red sm:col-span-2">
          {T("form.error", locale)}
        </p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={state === "sending"}>
          {state === "sending" ? T("form.sending", locale) : T("cta.apply", locale)}
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
