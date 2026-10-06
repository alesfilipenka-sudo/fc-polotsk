import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { sanityFetch } from "@/lib/sanity";
import {
  LAST_STAGE_STANDING_QUERY,
  SEASON_SCORERS_QUERY,
  SEASONS_QUERY,
} from "@/lib/queries";
import { Countdown } from "./Countdown";

interface StandingRow {
  pos?: number;
  mp?: number;
  w?: number;
  d?: number;
  l?: number;
  gf?: number;
  ga?: number;
  pts?: number;
  isOwn?: boolean;
}
interface StandingDoc {
  stage?: string;
  totalMatches?: number;
  rows?: StandingRow[];
}
interface GoalsDoc {
  goals?: { ownGoal?: boolean; name?: string; slug?: string }[];
}
interface SeasonsDoc {
  current?: { year?: number; endsAt?: string } | null;
  upcoming?: { year?: number; startsAt?: string } | null;
}

/** Лучший бомбардир сезона по заведённым авторам голов. Автоголы не в счёт. */
function topScorer(docs: GoalsDoc[]) {
  const tally = new Map<string, { name: string; slug?: string; goals: number }>();
  for (const doc of docs) {
    for (const g of doc.goals ?? []) {
      if (g.ownGoal || !g.name) continue;
      const key = g.slug ?? g.name;
      const hit = tally.get(key);
      if (hit) hit.goals += 1;
      else tally.set(key, { name: g.name, slug: g.slug, goals: 1 });
    }
  }
  let best: { name: string; slug?: string; goals: number } | null = null;
  for (const entry of tally.values()) {
    if (!best || entry.goals > best.goals) best = entry;
  }
  return best;
}

/**
 * Карточка межсезонья.
 *
 * Занимает место обратного отсчёта, когда сезон сыгран. «Расписание
 * уточняется» зимой читается как сломанный сайт; итоги сезона — как
 * законченная история, тем более что все цифры для неё уже в CMS.
 *
 * Возвращается к обратному отсчёту сама: как только у следующего сезона
 * появится дата старта, под итогами включится счётчик, а когда в календаре
 * появится первый матч — Hero покажет его вместо этой карточки.
 */
export async function OffseasonCard({
  tone = "dark",
}: {
  tone?: "light" | "dark";
}) {
  const [standing, goalDocs, seasons] = await Promise.all([
    sanityFetch<StandingDoc>(LAST_STAGE_STANDING_QUERY),
    sanityFetch<GoalsDoc[]>(SEASON_SCORERS_QUERY),
    sanityFetch<SeasonsDoc>(SEASONS_QUERY),
  ]);

  const row = standing?.rows?.find((r) => r.isOwn) ?? null;
  const scorer = topScorer(goalDocs ?? []);
  const year = seasons?.current?.year;
  const nextStart = seasons?.upcoming?.startsAt;
  const nextYear = seasons?.upcoming?.year;

  const dark = tone === "dark";
  const c = dark
    ? {
        box: "border-white/15 bg-white/[0.07] backdrop-blur-md",
        eyebrow: "text-white/60",
        accent: "text-polotsk-300",
        value: "text-white",
        label: "text-white/50",
        divider: "border-white/10",
        link: "text-white hover:text-polotsk-300",
      }
    : {
        box: "border-slate-200 bg-white",
        eyebrow: "text-slate-400",
        accent: "text-polotsk-500",
        value: "text-ink",
        label: "text-slate-400",
        divider: "border-slate-100",
        link: "text-polotsk-600 hover:text-polotsk-500",
      };

  const tiles = row
    ? [
        {
          value: `${row.w ?? 0}-${row.d ?? 0}-${row.l ?? 0}`,
          label: "В · Н · П",
        },
        { value: `${row.gf ?? 0}:${row.ga ?? 0}`, label: "Мячи" },
        { value: row.pts ?? 0, label: "Очки" },
      ]
    : [];

  return (
    <div className={`overflow-hidden rounded-2xl border p-5 md:p-7 ${c.box}`}>
      <div
        className={`flex items-center justify-between gap-3 text-xs uppercase tracking-eyebrow ${c.eyebrow}`}
      >
        <span>Сезон {year ?? ""} завершён</span>
        <Trophy className="h-4 w-4 shrink-0" aria-hidden />
      </div>

      {row?.pos != null ? (
        <div className="mt-5 flex items-baseline gap-3">
          <span
            className={`font-display text-5xl leading-none tabular-nums md:text-6xl ${c.accent}`}
          >
            {row.pos}
          </span>
          <span className={`text-sm ${c.label}`}>
            место
            {standing?.stage ? ` · ${standing.stage}` : ""}
          </span>
        </div>
      ) : (
        <p className={`mt-5 text-sm ${c.label}`}>
          Команда завершила сезон. Итоги — в архиве результатов.
        </p>
      )}

      {tiles.length > 0 && (
        <div className={`mt-5 grid grid-cols-3 gap-3 border-t pt-5 ${c.divider}`}>
          {tiles.map((t) => (
            <div key={t.label}>
              <p
                className={`font-display text-xl tabular-nums md:text-2xl ${c.value}`}
              >
                {t.value}
              </p>
              <p
                className={`mt-0.5 text-[10px] uppercase tracking-eyebrow ${c.label}`}
              >
                {t.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {scorer && (
        <div
          className={`mt-5 flex items-center justify-between gap-3 border-t pt-4 text-sm ${c.divider}`}
        >
          <span className={`text-[10px] uppercase tracking-eyebrow ${c.label}`}>
            Лучший бомбардир
          </span>
          <span className={c.value}>
            {scorer.slug ? (
              <Link href={`/player/${scorer.slug}`} className={c.link}>
                {scorer.name}
              </Link>
            ) : (
              scorer.name
            )}
            <span className={c.label}> · {scorer.goals}</span>
          </span>
        </div>
      )}

      {nextStart ? (
        <div className={`mt-5 border-t pt-5 ${c.divider}`}>
          <p
            className={`mb-3 text-[10px] uppercase tracking-eyebrow ${c.label}`}
          >
            До старта сезона {nextYear ?? ""}
          </p>
          <div className="grid grid-cols-4 gap-2 text-center sm:gap-3">
            <Countdown targetIso={nextStart} />
          </div>
        </div>
      ) : (
        <p className={`mt-5 border-t pt-4 text-xs ${c.divider} ${c.label}`}>
          Календарь нового сезона появится здесь, как только он выйдет.
        </p>
      )}

      <Link
        href="/results"
        className={`mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition ${c.link}`}
      >
        Все результаты
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
