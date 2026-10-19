import Link from "next/link";
import { Container } from "@/components/ui/Container";

/**
 * 404.
 *
 * The legacy site has broken links on every page (the footer "In the News"
 * and "Investor Relations" links point at the current page), so some inbound
 * links will land here. Rather than a dead end, it routes to the four places
 * a lost visitor actually wants.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center py-20">
      <Container size="narrow" className="text-center">
        <p className="nums-latin text-[0.8125rem] font-extrabold tracking-[0.2em] text-brand-red">
          404
        </p>
        <h1 className="t-h1 mt-4 text-balance">
          We couldn&rsquo;t find that page
        </h1>
        <p className="t-lead mt-5">
          The page may have moved during our website migration. Here is where
          most people are heading.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {[
            { href: "/products", title: "Products", body: "Dairy, ice cream, juices and foods" },
            { href: "/export", title: "Export & distribution", body: "Become a Unikai distributor" },
            { href: "/investor-relations", title: "Investor relations", body: "Reports, results and disclosures" },
            { href: "/contact", title: "Contact", body: "Reach the right team directly" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="card-lift rounded-2xl border border-ink-100 bg-white p-5 text-start"
            >
              <p className="font-bold text-ink">{l.title}</p>
              <p className="mt-1 text-[0.875rem] text-ink-500">{l.body}</p>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
