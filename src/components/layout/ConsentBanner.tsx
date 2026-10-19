"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/content/types";
import { Button } from "@/components/ui/Button";

const KEY = "unikai.consent.v1";

type Choice = "granted" | "denied";

/**
 * Cookie consent, wired to Google Consent Mode v2.
 *
 * Analytics storage stays denied until the visitor opts in, which is what
 * UAE PDPL and GDPR-equivalent expectations require for GCC and European
 * trade visitors alike. Declining is a single click, same prominence as
 * accepting — a "reject" buried in a settings sheet is not real consent.
 */
export function ConsentBanner({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      /* storage blocked — stay hidden rather than nag on every page */
    }
  }, []);

  const decide = (choice: Choice) => {
    try {
      localStorage.setItem(KEY, choice);
    } catch {
      /* ignore */
    }
    const w = window as unknown as { gtag?: (...a: unknown[]) => void };
    w.gtag?.("consent", "update", {
      analytics_storage: choice,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    setVisible(false);
  };

  if (!visible) return null;

  const copy =
    locale === "ar"
      ? {
          text: "نستخدم ملفات تعريف ارتباط تحليلية لفهم كيفية استخدام الموقع. لن يتم تفعيلها دون موافقتك.",
          accept: "أوافق",
          decline: "الضروري فقط",
        }
      : {
          text: "We use analytics cookies to understand how this site is used. Nothing is enabled without your consent.",
          accept: "Accept analytics",
          decline: "Essential only",
        };

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-2xl rounded-2xl border border-ink-100 bg-white/95 p-5 shadow-[0_24px_60px_-24px_rgba(5,3,58,.45)] backdrop-blur-xl sm:inset-x-6 sm:bottom-6"
    >
      <p className="text-[0.875rem] leading-relaxed text-ink-700">{copy.text}</p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Button size="sm" onClick={() => decide("granted")}>
          {copy.accept}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => decide("denied")}>
          {copy.decline}
        </Button>
      </div>
    </div>
  );
}
