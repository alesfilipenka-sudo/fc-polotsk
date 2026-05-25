import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "../SectionHeader";
import { NewsCard, type NewsCardItem } from "../news/NewsCard";
import { sanityFetch } from "@/lib/sanity";
import { NEWS_QUERY } from "@/lib/queries";

const PLACEHOLDER_NEWS: NewsCardItem[] = Array.from({ length: 6 }, (_, i) => ({
  _id: `n-${i + 1}`,
  title: "Заголовок новости появится после публикации в CMS",
  date: new Date(Date.now() - i * 3 * 86400000).toISOString(),
  tag: ["Матч", "Команда", "Анонс", "Интервью", "Тренировка", "Партнёры"][i],
  excerpt:
    "Короткое описание новости. Все материалы будут редактироваться через Sanity Studio и появляться здесь автоматически.",
  placeholderClass: `ph-news-${i + 1}`,
}));

export async function News() {
  const items = await sanityFetch<NewsCardItem[]>(NEWS_QUERY);
  const list = items && items.length > 0 ? items : PLACEHOLDER_NEWS;

  return (
    <section id="news" className="bg-slate-50/60 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="Новости клуба"
          title={
            <>
              Последние <span className="text-polotsk-500">события</span>
            </>
          }
          action={
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-polotsk-500 hover:text-polotsk-700"
            >
              Все новости
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {list.map((item) => (
            <NewsCard key={item._id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
