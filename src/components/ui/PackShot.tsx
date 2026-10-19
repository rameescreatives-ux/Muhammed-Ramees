import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Product / pack-shot image.
 *
 * The legacy pack shots are transparent PNGs from 2016 sitting on the old
 * WordPress uploads directory. They are served through next/image (AVIF/WebP,
 * responsive srcset) and re-composited on a soft brand-tinted plate so a
 * ten-year-old cut-out reads as deliberate rather than dated.
 *
 * When a pack shot is missing — the legacy site has at least one sub-range
 * with an empty <img src> — we render a flagged placeholder instead of
 * silently showing a broken image.
 */
export function PackShot({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority,
  tone = "navy",
}: {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  tone?: "navy" | "red" | "cream";
}) {
  const plate =
    tone === "red"
      ? "from-brand-red-50 to-white"
      : tone === "cream"
        ? "from-cream to-white"
        : "from-brand-navy-50 to-white";

  if (!src) {
    return (
      <div
        className={cn(
          "relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-dashed border-ink-300 bg-ink-50",
          className,
        )}
      >
        <div className="px-4 text-center">
          <svg
            viewBox="0 0 24 24"
            className="mx-auto h-7 w-7 text-ink-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="m3 16 5-4 4 3 3-3 6 5" />
            <circle cx="9" cy="9" r="1.4" />
          </svg>
          <p className="mt-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-500">
            Image pending
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-b",
        plate,
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-contain p-5 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]"
      />
    </div>
  );
}

/** Portrait frame for board / management photography. */
export function Portrait({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[4/5] overflow-hidden rounded-xl bg-ink-50",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 45vw, 240px"
          className="object-cover object-top grayscale-[.25] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-ink-300">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="12" cy="8.5" r="3.5" />
            <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
          </svg>
        </div>
      )}
    </div>
  );
}
