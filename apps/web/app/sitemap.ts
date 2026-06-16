import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { sanityFetch } from "@/lib/sanity";
import { ALL_NEWS_SLUGS_QUERY } from "@/lib/queries";

interface NewsSlug {
  slug?: string;
  date?: string;
}

const NEWS_SLUGS_WITH_DATE_QUERY = `*[_type == "news" && defined(slug.current)]{
  "slug": slug.current,
  date,
  "updatedAt": _updatedAt
}`;

/**
 * Динамический sitemap. Содержит:
 *   - статические страницы (главная, /news, /history)
 *   - все опубликованные новости /news/[slug] с актуальной датой обновления
 *
 * Sanity подтягивается на build/revalidate. Cache 1 час.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const now = new Date();

  // Статические маршруты
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${base}/news`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${base}/history`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Динамические новости из Sanity
  type NewsRow = NewsSlug & { updatedAt?: string };
  const newsRows =
    (await sanityFetch<NewsRow[]>(NEWS_SLUGS_WITH_DATE_QUERY, {}, 3600)) ?? [];

  const newsPages: MetadataRoute.Sitemap = newsRows
    .filter((n) => n.slug)
    .map((n) => ({
      url: `${base}/news/${n.slug}`,
      lastModified: n.updatedAt ? new Date(n.updatedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [...staticPages, ...newsPages];
}

// Используем ALL_NEWS_SLUGS_QUERY как fallback, если кому-то нужна простая версия
void ALL_NEWS_SLUGS_QUERY;
