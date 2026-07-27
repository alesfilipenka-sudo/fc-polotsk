import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticlePage } from "@/components/news/ArticlePage";
import type { NewsCardItem } from "@/components/news/NewsCard";
import type { SidebarNewsItem } from "@/components/news/ArticleSidebar";
import { sanityFetch } from "@/lib/sanity";
import {
  ALL_NEWS_SLUGS_QUERY,
  ARTICLE_QUERY,
  RELATED_NEWS_QUERY,
  SIDEBAR_NEWS_QUERY,
} from "@/lib/queries";
import { getSocialUrls } from "@/lib/social-urls";
import { SITE } from "@/lib/constants";
import {
  buildNewsArticleSchema,
  serializeSchema,
} from "@/lib/structured-data";

interface Article {
  _id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  slug: string;
  date?: string;
  readTime?: number;
  body?: unknown;
  coverImageUrl?: string;
}

interface PageProps {
  // Next.js 15: params is a Promise.
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const rows =
    (await sanityFetch<{ slug: string }[]>(ALL_NEWS_SLUGS_QUERY)) ?? [];
  return rows.filter((r) => r.slug).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await sanityFetch<Article | null>(ARTICLE_QUERY, { slug });
  if (!article) {
    return { title: "Новость не найдена — ФК Полоцк" };
  }
  const canonicalUrl = `${SITE.url}/news/${article.slug}`;
  const ogImages = article.coverImageUrl
    ? [{ url: article.coverImageUrl }]
    : undefined;
  return {
    title: `${article.title} — ФК Полоцк`,
    description: article.subtitle ?? undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description: article.subtitle ?? undefined,
      url: canonicalUrl,
      type: "article",
      locale: "ru_BY",
      publishedTime: article.date,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.subtitle ?? undefined,
      images: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    },
  };
}

export const revalidate = 60;

export default async function NewsArticleRoute({ params }: PageProps) {
  const { slug } = await params;
  const [article, related, sidebarNews, socials] = await Promise.all([
    sanityFetch<Article | null>(ARTICLE_QUERY, { slug }),
    sanityFetch<NewsCardItem[]>(RELATED_NEWS_QUERY, { slug }),
    sanityFetch<SidebarNewsItem[]>(SIDEBAR_NEWS_QUERY, { slug }),
    getSocialUrls(),
  ]);

  if (!article) notFound();

  const jsonLd = serializeSchema(
    buildNewsArticleSchema({
      title: article.title,
      slug: article.slug,
      date: article.date ?? new Date().toISOString(),
      excerpt: article.subtitle,
      imageUrl: article.coverImageUrl,
    }),
  );

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <Header />
      <main className="flex-1">
        <ArticlePage
          article={article as Article}
          related={related ?? []}
          sidebarNews={sidebarNews ?? []}
          socials={{
            telegram: socials.telegram,
            vk: socials.vk,
            instagram: socials.instagram,
          }}
        />
      </main>
      <Footer />
    </>
  );
}
