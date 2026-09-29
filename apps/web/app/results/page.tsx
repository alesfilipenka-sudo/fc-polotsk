import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { sanityFetch } from "@/lib/sanity";
import { RESULTS_QUERY } from "@/lib/queries";
import {
  ResultsExplorer,
  type ResultMatch,
} from "@/components/results/ResultsExplorer";

export const metadata: Metadata = {
  title: "Результаты — ФК Полоцк",
  description:
    "Архив матчей ФК Полоцк: счёт, авторы голов и карточки по сезонам и турнирам.",
};

export const revalidate = 60;

export default async function ResultsPage() {
  const matches = (await sanityFetch<ResultMatch[]>(RESULTS_QUERY)) ?? [];

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50/30 pt-20 md:pt-24">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
          <SectionHeader
            eyebrow="Архив матчей"
            title={
              <>
                Все <span className="text-polotsk-500">результаты</span>
              </>
            }
          />

          {matches.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              Сыгранных матчей пока нет.
            </p>
          ) : (
            <ResultsExplorer matches={matches} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
