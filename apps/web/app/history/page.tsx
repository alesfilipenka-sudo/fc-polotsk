import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HistoryTimeline } from "@/components/history/HistoryTimeline";
import type { HistoryEra } from "@/components/history/types";
import { sanityFetch } from "@/lib/sanity";
import { HISTORY_QUERY } from "@/lib/queries";

export const metadata: Metadata = {
  title: "История — ФК Полоцк",
  description:
    "120 лет полоцкого футбола: от первого мяча на плацу кадетского корпуса в 1905 году до профессионального клуба наших дней.",
};

// История меняется редко — кеш на сутки, сбрасывается вебхуком при правке.
export const revalidate = 86400;

export default async function HistoryPage() {
  const eras = (await sanityFetch<HistoryEra[]>(HISTORY_QUERY)) ?? [];

  return (
    <>
      <Header />
      <HistoryTimeline eras={eras} />
      <Footer />
    </>
  );
}
