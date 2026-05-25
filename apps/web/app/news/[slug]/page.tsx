import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticlePage } from "@/components/news/ArticlePage";
import type { NewsCardItem } from "@/components/news/NewsCard";
import { sanityFetch } from "@/lib/sanity";
import {
  ALL_NEWS_SLUGS_QUERY,
  ARTICLE_QUERY,
  RELATED_NEWS_QUERY,
} from "@/lib/queries";

interface Article {
  _id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  slug: string;
  date?: string;
  readTime?: number;
  body?: unknown;
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
  return {
    title: `${article.title} — ФК Полоцк`,
    description: article.subtitle ?? undefined,
  };
}

export const revalidate = 60;

export default async function NewsArticleRoute({ params }: PageProps) {
  const { slug } = await params;
  const [article, related] = await Promise.all([
    sanityFetch<Article | null>(ARTICLE_QUERY, { slug }),
    sanityFetch<NewsCardItem[]>(RELATED_NEWS_QUERY, { slug }),
  ]);

  if (!article) notFound();

  return (
    <>
      <Header />
      <main className="flex-1">
        <ArticlePage article={article as Article} related={related ?? []} />
      </main>
      <Footer />
    </>
  );
}
