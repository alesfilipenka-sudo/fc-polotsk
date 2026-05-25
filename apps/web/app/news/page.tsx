import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { NewsCard, type NewsCardItem } from "@/components/news/NewsCard";
import { sanityFetch } from "@/lib/sanity";
import { ALL_NEWS_QUERY } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Новости — ФК Полоцк",
  description: "Все новости, анонсы и материалы ФК Полоцк.",
};

export const revalidate = 60;

export default async function NewsIndexPage() {
  const items = (await sanityFetch<NewsCardItem[]>(ALL_NEWS_QUERY)) ?? [];

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50/30 pt-20 md:pt-24">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
          <SectionHeader
            eyebrow="Новости клуба"
            title={
              <>
                Все <span className="text-polotsk-500">материалы</span>
              </>
            }
          />

          {items.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              Новостей пока нет. Возвращайся позже.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {items.map((item) => (
                <NewsCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
