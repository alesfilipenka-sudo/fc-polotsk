import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlayerPage } from "@/components/player/PlayerPage";
import type {
  PlayerDetail,
  PlayerStats as PlayerStatsData,
} from "@/components/player/types";
import { sanityFetch } from "@/lib/sanity";
import {
  ALL_PLAYER_SLUGS_QUERY,
  MATCHES_FOR_STATS_QUERY,
  PLAYER_BY_SLUG_QUERY,
} from "@/lib/queries";
import { POS_LABEL, SITE } from "@/lib/constants";
import {
  computePlayerStats,
  type FlatMatch,
} from "@/lib/player-stats";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const rows =
    (await sanityFetch<{ slug: string }[]>(ALL_PLAYER_SLUGS_QUERY)) ?? [];
  return rows.filter((r) => r.slug).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const player = await sanityFetch<PlayerDetail | null>(
    PLAYER_BY_SLUG_QUERY,
    { slug },
  );
  if (!player) {
    return { title: `Игрок не найден — ${SITE.name}` };
  }
  const posLabel = POS_LABEL[player.pos] ?? player.pos;
  const description = `${posLabel}${player.num != null ? `, № ${player.num}` : ""} · ${player.country}. ${SITE.name} — состав ${SITE.season}.`;
  return {
    title: `${player.name} — ${SITE.name}`,
    description,
    openGraph: {
      title: `${player.name} · ${SITE.name}`,
      description,
      images: player.photoUrl ? [{ url: player.photoUrl }] : undefined,
    },
  };
}

export const revalidate = 300;

export default async function PlayerRoute({ params }: PageProps) {
  const { slug } = await params;
  const player = await sanityFetch<PlayerDetail | null>(
    PLAYER_BY_SLUG_QUERY,
    { slug },
  );

  if (!player) notFound();

  // Тянем ВСЕ finished-матчи одним запросом (кэш 300 сек), затем считаем
  // статистику игрока в TS. GROQ count() с фильтрами по _ref работает
  // непредсказуемо на вложенных массивах, поэтому агрегируем сами.
  const matches =
    (await sanityFetch<FlatMatch[]>(MATCHES_FOR_STATS_QUERY)) ?? [];
  const stats: PlayerStatsData = computePlayerStats(matches, player._id);

  return (
    <>
      <Header />
      <main className="flex-1">
        <PlayerPage player={player as PlayerDetail} stats={stats} />
      </main>
      <Footer />
    </>
  );
}
