"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { EnquiryType, Locale } from "@/content/types";
import { T, href } from "@/lib/i18n";
import { buildKnowledge, classifyIntent, retrieve } from "@/lib/knowledge";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { trackLead } from "@/components/layout/Analytics";

interface Msg {
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; path?: string }[];
}

export function Chatbot({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [intent, setIntent] = useState<EnquiryType | null>(null);
  const [showCapture, setShowCapture] = useState(false);
  const [captured, setCaptured] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: T("chat.greeting", locale) }]);
    }
  }, [open, messages.length, locale]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, showCapture]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          messages: next.map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!res.ok) throw new Error(`upstream_${res.status}`);
      const data = await res.json();

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply ?? T("form.error", locale),
          sources: data.sources?.filter((s: { path?: string }) => s.path),
        },
      ]);

      if (data.intent) {
        setIntent(data.intent);
        if (!captured) setShowCapture(true);
      }
    } catch {
      // The route is unreachable (offline, cold start, or a static preview
      // with no server). The knowledge base is plain data, so retrieval can
      // run here instead — the assistant keeps answering from exactly the
      // same approved passages rather than showing a dead end.
      const local = answerLocally(trimmed, locale);
      setMessages((m) => [...m, local.message]);
      if (local.intent) {
        setIntent(local.intent);
        if (!captured) setShowCapture(true);
      }
    } finally {
      setBusy(false);
    }
  }

  const suggestions =
    locale === "ar"
      ? ["ما هي مجموعات منتجاتكم؟", "كيف أصبح موزعاً؟", "أريد التصدير إلى بلدي"]
      : [
          "What product ranges do you make?",
          "How do I become a distributor?",
          "I want to import to my country",
        ];

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={T("chat.open", locale)}
        aria-expanded={open}
        className={cn(
          "fixed bottom-5 end-5 z-[65] flex h-14 items-center gap-2.5 rounded-full bg-brand-navy px-5 text-white shadow-[0_16px_40px_-16px_rgba(9,1,139,.9)] transition-all duration-400 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-brand-navy-600",
          open && "scale-0 opacity-0",
        )}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.3-.6L3 21l1.8-5A8.3 8.3 0 0 1 3.6 11.5 8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z" />
        </svg>
        <span className="hidden text-sm font-semibold sm:inline">
          {T("chat.open", locale)}
        </span>
      </button>

      {/* Panel */}
      <div
        className={cn(
          "fixed bottom-0 end-0 z-[66] flex w-full flex-col overflow-hidden bg-white transition-all duration-400 ease-[cubic-bezier(.22,1,.36,1)] sm:bottom-5 sm:end-5 sm:w-[25rem] sm:rounded-2xl sm:shadow-[0_32px_70px_-28px_rgba(5,3,58,.5)]",
          open
            ? "h-[min(640px,88vh)] opacity-100 sm:h-[min(620px,80vh)]"
            : "pointer-events-none h-0 opacity-0",
        )}
        role="dialog"
        aria-label={T("chat.title", locale)}
      >
        <header className="flex shrink-0 items-center justify-between bg-brand-navy px-4 py-3.5 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.3-.6L3 21l1.8-5A8.3 8.3 0 0 1 3.6 11.5 8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">{T("chat.title", locale)}</p>
              <p className="text-[0.6875rem] text-white/60">Unikai Foods PJSC</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={T("nav.close", locale)}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/15"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-ink-50 p-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[0.875rem] leading-relaxed",
                  m.role === "user"
                    ? "rounded-ee-sm bg-brand-navy text-white"
                    : "rounded-es-sm border border-ink-100 bg-white text-ink-700",
                )}
              >
                {m.content}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-ink-100 pt-2.5">
                    {m.sources.slice(0, 3).map((s) => (
                      <Link
                        key={s.path}
                        href={href(s.path!, locale)}
                        onClick={() => setOpen(false)}
                        className="rounded-full bg-brand-navy-50 px-2.5 py-1 text-[0.6875rem] font-semibold text-brand-navy transition-colors hover:bg-brand-navy-100"
                      >
                        {s.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-2xl rounded-es-sm border border-ink-100 bg-white px-4 py-3.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-300"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {messages.length <= 1 && !busy && (
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[0.75rem] font-medium text-ink-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {showCapture && !captured && intent && (
            <LeadCapture
              locale={locale}
              intent={intent}
              transcript={messages}
              onDone={() => {
                setCaptured(true);
                setShowCapture(false);
                trackLead(intent);
                setMessages((m) => [
                  ...m,
                  { role: "assistant", content: T("form.success", locale) },
                ]);
              }}
              onDismiss={() => setShowCapture(false)}
            />
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="shrink-0 border-t border-ink-100 bg-white p-3"
        >
          <div className="flex items-end gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={T("chat.placeholder", locale)}
              disabled={busy}
              className="h-10 flex-1 rounded-full border border-ink-200 bg-ink-50 px-4 text-[0.875rem] outline-none transition-colors placeholder:text-ink-500 focus:border-brand-navy focus:bg-white"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white transition-opacity disabled:opacity-40"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 10h13M11 5l5 5-5 5" />
              </svg>
            </button>
          </div>
          <p className="mt-2 px-1 text-[0.625rem] leading-snug text-ink-500">
            {T("chat.disclaimer", locale)}
          </p>
        </form>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- capture

function LeadCapture({
  locale,
  intent,
  transcript,
  onDone,
  onDismiss,
}: {
  locale: Locale;
  intent: EnquiryType;
  transcript: Msg[];
  onDone: () => void;
  onDismiss: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSending(true);
    setError(false);

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          company: fd.get("company"),
          country: fd.get("country"),
          enquiryType: intent,
          consent: true,
          locale,
          source: "chatbot",
          message: transcript
            .map((m) => `${m.role}: ${m.content}`)
            .join("\n")
            .slice(0, 3500),
        }),
      });
      if (!res.ok) throw new Error();
      onDone();
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  }

  const copy =
    locale === "ar"
      ? { head: "لنوصلك بالفريق المختص", hint: "شارك بياناتك وسيتواصل معك الفريق." }
      : {
          head: "Let's connect you with the right team",
          hint: "Share your details and the relevant team will follow up.",
        };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-brand-navy-100 bg-white p-4 shadow-sm"
    >
      <p className="text-[0.875rem] font-bold text-ink">{copy.head}</p>
      <p className="mt-1 text-[0.75rem] text-ink-500">{copy.hint}</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <input name="name" required placeholder={T("form.name", locale)} className={miniInput} />
        <input name="company" placeholder={T("form.company", locale)} className={miniInput} />
        <input name="email" type="email" required placeholder={T("form.email", locale)} className={cn(miniInput, "col-span-2")} />
        {intent === "export" && (
          <input name="country" required placeholder={T("form.country", locale)} className={cn(miniInput, "col-span-2")} />
        )}
      </div>

      {error && (
        <p className="mt-2 text-[0.75rem] text-brand-red">{T("form.error", locale)}</p>
      )}

      <div className="mt-3 flex gap-2">
        <Button type="submit" size="sm" disabled={sending} className="flex-1">
          {sending ? T("form.sending", locale) : T("cta.submit", locale)}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDismiss}>
          {locale === "ar" ? "لاحقاً" : "Not now"}
        </Button>
      </div>

      <p className="mt-2.5 text-[0.625rem] leading-snug text-ink-500">
        {T("form.consent", locale)}
      </p>
    </form>
  );
}

const miniInput =
  "h-9 rounded-lg border border-ink-200 bg-ink-50 px-3 text-[0.8125rem] outline-none transition-colors placeholder:text-ink-500 focus:border-brand-navy focus:bg-white";

// ------------------------------------------------------- client fallback

/**
 * Answer from the approved knowledge base without the server.
 *
 * Same passages, same retrieval, same intent classification as the API
 * route — only the natural-language phrasing is missing. The safety
 * boundary is unchanged: it can only say what the passages say, so it
 * still cannot invent a price, a certification or an export market.
 */
function answerLocally(
  question: string,
  locale: Locale,
): { message: Msg; intent: EnquiryType | null } {
  const hits = retrieve(question, buildKnowledge(locale), 3);
  const intent = classifyIntent(question);

  if (!hits.length) {
    return {
      message: {
        role: "assistant",
        content:
          locale === "ar"
            ? "ليس لدي هذه المعلومة ضمن محتوى يونيكاي المنشور. يسعدني توصيلك بالفريق المختص — هل ترغب بمشاركة بيانات التواصل؟"
            : "I don't have that detail in Unikai's published information. I can put you in touch with the right team — would you like to share your contact details?",
      },
      intent,
    };
  }

  const extra = hits[1] ? ` ${hits[1].body.split(". ")[0]}.` : "";
  return {
    message: {
      role: "assistant",
      content: `${hits[0].body}${extra}`,
      sources: hits
        .filter((h) => h.path)
        .map((h) => ({ title: h.title, path: h.path })),
    },
    intent,
  };
}
