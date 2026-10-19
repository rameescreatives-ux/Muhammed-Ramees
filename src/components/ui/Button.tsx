import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 " +
  "disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-navy text-white hover:bg-brand-navy-600 shadow-[0_10px_30px_-14px_rgba(9,1,139,.8)] hover:shadow-[0_16px_38px_-14px_rgba(9,1,139,.9)]",
  secondary:
    "bg-brand-red text-white hover:bg-brand-red-600 shadow-[0_10px_30px_-14px_rgba(210,49,55,.8)]",
  ghost:
    "border border-ink-300 text-ink hover:border-brand-navy hover:text-brand-navy bg-white/60",
  light:
    "bg-white text-brand-navy hover:bg-cream shadow-[0_10px_30px_-16px_rgba(0,0,0,.5)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[0.9375rem]",
  lg: "h-13 px-8 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & { href: string } & React.ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

/** Directional arrow that flips in RTL. */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn("h-4 w-4 rtl:-scale-x-100", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 8h11M9 4l4 4-4 4" />
    </svg>
  );
}
