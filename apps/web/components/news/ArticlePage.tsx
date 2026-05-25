import { Breadcrumb } from "./Breadcrumb";
import { ArticleHeader } from "./ArticleHeader";
import { ArticleBody } from "./ArticleBody";
import { ArticleSidebar } from "./ArticleSidebar";
import { RelatedNews } from "./RelatedNews";
import { ShareBar } from "./ShareBar";
import type { NewsCardItem } from "./NewsCard";

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

interface ArticlePageProps {
  article: Article;
  related: NewsCardItem[];
}

export function ArticlePage({ article, related }: ArticlePageProps) {
  return (
    <div className="bg-slate-50/30 pt-20 md:pt-24">
      <div className="mx-auto max-w-7xl px-5 pt-8 md:px-8 md:pt-12">
        <Breadcrumb
          items={[
            { label: "Главная", href: "/" },
            { label: "Новости", href: "/news" },
            { label: article.title },
          ]}
        />

        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <article className="min-w-0 lg:col-span-7">
            <ArticleHeader
              title={article.title}
              subtitle={article.subtitle}
              tag={article.tag}
              date={article.date}
              readTime={article.readTime}
            />
            <ArticleBody body={article.body} />

            {article.tag && (
              <div className="mt-10 flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-eyebrow text-slate-400">
                  Тег:
                </span>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                  {article.tag}
                </span>
              </div>
            )}

            <div className="mt-8 border-t border-slate-100 pt-8">
              <ShareBar />
            </div>
          </article>

          <aside className="min-w-0 lg:col-span-5">

            <ArticleSidebar currentSlug={article.slug} />
          </aside>
        </div>

        <RelatedNews items={related} />
      </div>
    </div>
  );
}
