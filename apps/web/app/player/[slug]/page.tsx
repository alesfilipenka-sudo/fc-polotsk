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
import {
  buildAthleteSchema,
  serializeSchema,
} from "@/lib/structured-data";

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
  const canonicalUrl = `${SITE.url}/player/${player.slug}`;
  // Не задаём openGraph.images и twitter.images вручную —
  // opengraph-image.tsx в этой же папке автоматически добавит правильные
  // og:image и twitter:image теги через file convention Next.js.
  // Если задавать оба — получим дублирование og:image тегов и мессенджеры
  // выбирают непредсказуемо (Telegram обычно первый = photoUrl фото).
  return {
    title: `${player.name} — ${SITE.name}`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${player.name} · ${SITE.name}`,
      description,
      url: canonicalUrl,
      type: "profile",
      locale: "ru_BY",
    },
    twitter: {
      card: "summary_large_image",
      title: `${player.name} · ${SITE.name}`,
      description,
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
  const computed: PlayerStatsData = computePlayerStats(matches, player._id);

  // Ручные override'ы из Sanity перекрывают автоподсчёт, если заполнены.
  // Например: старые матчи без detailed events, но статы за них известны.
  // Список contributions всегда остаётся автоматическим — он показывает
  // конкретные матчи по events, а не суммарное число.
  const stats: PlayerStatsData = {
    ...computed,
    matchesPlayed: player.manualMatches ?? computed.matchesPlayed,
    goals: player.manualGoals ?? computed.goals,
    assists: player.manualAssists ?? computed.assists,
    yellows: player.manualYellows ?? computed.yellows,
    reds: player.manualReds ?? computed.reds,
  };

  // JSON-LD для поисковиков и мессенджеров (schema.org Athlete)
  const jsonLd = serializeSchema(buildAthleteSchema(player as PlayerDetail));

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <Header />
      <main className="flex-1">
        <PlayerPage player={player as PlayerDetail} stats={stats} />
      </main>
      <Footer />
    </>
  );
}
