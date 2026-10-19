import { cn } from "@/lib/cn";

export function Container({
  children,
  className,
  size = "default",
  as: As = "div",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
  as?: React.ElementType;
}) {
  return (
    <As
      className={cn(
        "mx-auto w-full px-5 sm:px-8",
        size === "default" && "max-w-[1280px]",
        size === "wide" && "max-w-[1480px]",
        size === "narrow" && "max-w-[820px]",
        className,
      )}
    >
      {children}
    </As>
  );
}

export function Section({
  children,
  className,
  tone = "white",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "white" | "cream" | "navy" | "ink";
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 sm:py-24",
        tone === "cream" && "bg-cream",
        tone === "navy" && "bg-brand-navy text-white",
        tone === "ink" && "bg-ink text-white",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="t-eyebrow">{children}</p>;
}
