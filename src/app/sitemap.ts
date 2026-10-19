import type { MetadataRoute } from "next";
import { products, ranges, subRanges } from "@/content/products";
import { news } from "@/content/news";
import { irNav } from "@/lib/nav";
import { SITE_URL } from "@/lib/seo";

/**
 * Sitemap with hreflang alternates.
 *
 * Every URL is emitted once with its Arabic counterpart declared in
 * `alternates.languages`, which is what tells Google the two are translations
 * rather than duplicates.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entry = (
    path: string,
    priority: number,
    changeFrequency: "daily" | "weekly" | "monthly" | "yearly",
  ) => {
    const clean = path === "/" ? "" : path;
    return {
      url: `${SITE_URL}${clean || "/"}`,
      lastModified: now,
      changeFrequency,
      priority,
      alternates: {
        languages: {
          en: `${SITE_URL}${clean || "/"}`,
          ar: `${SITE_URL}/ar${clean}`,
        },
      },
    };
  };

  const staticPages = [
    entry("/", 1, "weekly"),
    entry("/products", 0.9, "weekly"),
    entry("/export", 0.9, "monthly"),
    entry("/about", 0.8, "monthly"),
    entry("/quality", 0.8, "monthly"),
    entry("/contact", 0.8, "monthly"),
    entry("/news", 0.7, "weekly"),
    entry("/careers", 0.7, "weekly"),
    entry("/investor-relations", 0.7, "monthly"),
    entry("/privacy", 0.2, "yearly"),
    entry("/cookies", 0.2, "yearly"),
  ];

  const rangePages = ranges.map((r) => entry(`/products/${r.slug}`, 0.85, "monthly"));

  const subRangePages = subRanges.map((s) =>
    entry(`/products/${s.range}/${s.slug}`, 0.75, "monthly"),
  );

  const productPages = products.map((p) =>
    entry(`/products/${p.range}/${p.subRange}/${p.slug}`, 0.7, "monthly"),
  );

  const newsPages = news.map((n) => entry(`/news/${n.slug}`, 0.6, "monthly"));

  const irPages = irNav
    .filter((i) => i.slug)
    .map((i) => entry(`/investor-relations/${i.slug}`, 0.5, "monthly"));

  return [
    ...staticPages,
    ...rangePages,
    ...subRangePages,
    ...productPages,
    ...newsPages,
    ...irPages,
  ];
}
