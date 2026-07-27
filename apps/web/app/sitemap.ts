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

const PLAYER_SLUGS_WITH_DATE_QUERY = `*[_type == "player" && defined(slug.current) && !(isArchived == true)]{
  "slug": slug.current,
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

  // Динамические страницы игроков /player/[slug].
  // Архивных не включаем — их страницы не индексируются.
  interface PlayerRow {
    slug?: string;
    updatedAt?: string;
  }
  const playerRows =
    (await sanityFetch<PlayerRow[]>(PLAYER_SLUGS_WITH_DATE_QUERY, {}, 3600)) ??
    [];

  const playerPages: MetadataRoute.Sitemap = playerRows
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${base}/player/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

  return [...staticPages, ...newsPages, ...playerPages];
}

// Используем ALL_NEWS_SLUGS_QUERY как fallback, если кому-то нужна простая версия
void ALL_NEWS_SLUGS_QUERY;
