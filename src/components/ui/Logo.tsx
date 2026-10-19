import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Locale } from "@/content/types";
import { href } from "@/lib/i18n";

/**
 * Unikai logo.
 *
 * PLACEHOLDER ASSET: this is the raster mark supplied by the client, cleaned
 * and alpha-trimmed. Replace `public/brand/unikai-logo.png` with the official
 * vector (SVG) the moment Unikai supply it — no other change is needed.
 */
export function Logo({
  locale,
  className,
  invert = false,
}: {
  locale: Locale;
  className?: string;
  invert?: boolean;
}) {
  return (
    <Link
      href={href("/", locale)}
      className={cn(
        "group relative flex shrink-0 items-center",
        className,
      )}
      aria-label="Unikai Foods PJSC"
    >
      <Image
        src="/brand/unikai-logo.png"
        alt="Unikai"
        width={392}
        height={188}
        priority
        className={cn(
          "h-9 w-auto transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03] sm:h-10",
          invert && "brightness-0 invert",
        )}
      />
    </Link>
  );
}
