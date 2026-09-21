import { SectionHeader } from "../SectionHeader";
import { sanityFetch } from "@/lib/sanity";
import { RESULTS_QUERY, OWN_STANDING_QUERY } from "@/lib/queries";
import { formatShortDate } from "@/lib/dateFormat";
import {
  LEAGUE,
  LEAGUE_MAX_POINTS,
  isLeagueCompetition,
  splitCupLabel,
} from "@/lib/constants";

interface TeamRef {
  name?: string;
  short?: string;
  logo?: string;
  isOwn?: boolean;
}
interface MatchDoc {
  _id: string;
  date: string;
  competition?: string;
  hs?: number;
  as?: number;
  home?: TeamRef;
  away?: TeamRef;
}

interface StandingRow {
  pos?: number;
  mp?: number;
  w?: number;
  d?: number;
  l?: number;
  gf?: number;
  ga?: number;
  pts?: number;
}
interface OwnStanding {
  season?: string;
  stage?: string;
  isFinal?: boolean;
  updatedAt?: string;
  rows?: (StandingRow & { isOwn?: boolean })[];
}

const FILTERS = [
  { id: "all", label: "Все" },
  { id: "home", label: "Дом" },
  { id: "away", label: "Гости" },
];

function resultMark(m: MatchDoc): "W" | "L" | "D" | null {
  if (m.hs == null || m.as == null) return null;
  const polotskHome = m.home?.isOwn;
  const our = polotskHome ? m.hs : m.as;
  const their = polotskHome ? m.as : m.hs;
  if (our > their) return "W";
  if (our < their) return "L";
  return "D";
}

/**
 * Запасной расчёт, когда турнирной таблицы в CMS ещё нет.
 * Считается ТОЛЬКО по лиговым матчам — кубки в зачёт этапа не идут.
 */
function computeLeagueStats(matches: MatchDoc[]): StandingRow {
  return matches.reduce<StandingRow>(
    (acc, m) => {
      const r = resultMark(m);
      if (m.hs == null || m.as == null) return acc;
      const polotskHome = m.home?.isOwn;
      acc.mp = (acc.mp ?? 0) + 1;
      acc.gf = (acc.gf ?? 0) + (polotskHome ? m.hs : m.as);
      acc.ga = (acc.ga ?? 0) + (polotskHome ? m.as : m.hs);
      if (r === "W") acc.w = (acc.w ?? 0) + 1;
      if (r === "D") acc.d = (acc.d ?? 0) + 1;
      if (r === "L") acc.l = (acc.l ?? 0) + 1;
      acc.pts = (acc.pts ?? 0) + (r === "W" ? 3 : r === "D" ? 1 : 0);
      return acc;
    },
    { mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
  );
}

/**
 * Итоговые стадии кубков: для каждого кубка берём самый поздний матч.
 * "Кубок Беларуси 1/64" + "Кубок Беларуси 1/32" → "Кубок Беларуси — 1/32".
 */
function cupSummary(matches: MatchDoc[]): string[] {
  const latest = new Map<string, { round?: string; date: string }>();
  for (const m of matches) {
    if (!m.competition) continue;
    const { cup, round } = splitCupLabel(m.competition);
    const prev = latest.get(cup);
    if (!prev || m.date > prev.date) latest.set(cup, { round, date: m.date });
  }
  return [...latest.entries()].map(([cup, v]) =>
    v.round ? `${cup} — ${v.round}` : cup,
  );
}

export async function Results() {
  const [matchesRaw, standing] = await Promise.all([
    sanityFetch<MatchDoc[]>(RESULTS_QUERY),
    sanityFetch<OwnStanding>(OWN_STANDING_QUERY),
  ]);

  const matches = matchesRaw ?? [];
  const leagueMatches = matches.filter((m) => isLeagueCompetition(m.competition));
  const cupMatches = matches.filter((m) => !isLeagueCompetition(m.competition));

  // Таблица — источник истины. Расчёт по матчам только как запасной вариант.
  const fromTable = standing?.rows?.find((r) => r.isOwn) ?? null;
  const stats = fromTable ?? computeLeagueStats(leagueMatches);
  const usingTable = !!fromTable;

  const stageLabel = standing?.stage || LEAGUE.stageLabel;
  const played = stats.mp ?? 0;
  const goalDiff =
    stats.gf != null && stats.ga != null ? stats.gf - stats.ga : null;

  const hasMatches = matches.length > 0;
  const rows = hasMatches
    ? matches
    : (Array.from({ length: 4 }, () => null) as null[]);

  const tiles = [
    {
      value: usingTable && stats.pos != null ? stats.pos : "—",
      label: "Место",
      sub: stageLabel,
    },
    {
      value: hasMatches ? (stats.pts ?? 0) : "—",
      label: "Очки",
      sub: `из ${LEAGUE_MAX_POINTS} возможных`,
    },
    {
      value: hasMatches
        ? `${stats.w ?? 0}-${stats.d ?? 0}-${stats.l ?? 0}`
        : "—",
      label: "В · Н · П",
      sub: `${played} из ${LEAGUE.matches} матчей`,
      compact: true,
    },
    {
      value: hasMatches ? `${stats.gf ?? 0}:${stats.ga ?? 0}` : "—",
      label: "Мячи",
      sub:
        goalDiff == null
          ? "забито : пропущено"
          : `разница ${goalDiff > 0 ? "+" : ""}${goalDiff}`,
      compact: true,
    },
  ];

  const cups = cupSummary(cupMatches);

  return (
    <section id="results" className="bg-ink py-14 text-white md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="Архив сезона"
          title="Результаты"
          dark
          action={
            <div className="flex gap-2">
              {FILTERS.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                    i === 0
                      ? "bg-polotsk-500 text-white"
                      : "border border-white/15 text-white/70 hover:bg-white/5"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          }
        />

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="hidden grid-cols-12 gap-4 border-b border-white/10 px-6 py-4 text-[10px] uppercase tracking-eyebrow text-white/40 md:grid">
            <span className="col-span-2">Дата</span>
            <span className="col-span-3">Турнир</span>
            <span className="col-span-5">Матч</span>
            <span className="col-span-1 text-center">Счёт</span>
            <span className="col-span-1 text-right">Итог</span>
          </div>
          <ul className="divide-y divide-white/10">
            {rows.map((m, i) => {
              if (!m) {
                return (
                  <li
                    key={`ph-${i}`}
                    className="px-5 py-4 md:px-6"
                  >
                    <div className="md:grid md:grid-cols-12 md:items-center md:gap-4 text-sm">
                      <p className="text-white/60 md:col-span-2">— апр</p>
                      <p className="text-white/70 md:col-span-3">{LEAGUE.prefix}</p>
                      <p className="text-white/80 md:col-span-5 mt-1 md:mt-0">
                        Полоцк — соперник
                      </p>
                      <p className="font-display text-2xl tabular-nums text-white md:col-span-1 md:text-center mt-1 md:mt-0">
                        —:—
                      </p>
                      <span className="md:col-span-1 md:flex md:justify-end mt-2 md:mt-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-xs font-semibold text-white/60">
                          —
                        </span>
                      </span>
                    </div>
                  </li>
                );
              }
              const r = resultMark(m);
              const badge =
                r === "W" ? "bg-polotsk-500 text-white"
                : r === "L" ? "bg-red-400 text-white"
                : r === "D" ? "bg-slate-500 text-white"
                : "border border-white/15 text-white/60";
              const letter =
                r === "W" ? "В" : r === "L" ? "П" : r === "D" ? "Н" : "—";
              return (
                <li
                  key={m._id}
                  className="px-5 py-4 md:px-6"
                >
                  <div className="md:grid md:grid-cols-12 md:items-center md:gap-4 text-sm">
                    <p className="text-white/60 md:col-span-2">
                      {formatShortDate(m.date)}
                    </p>
                    <p className="text-white/70 md:col-span-3 truncate mt-0.5 md:mt-0">
                      {m.competition ?? LEAGUE.prefix}
                    </p>
                    <p className="text-white md:col-span-5 truncate mt-1 md:mt-0">
                      {m.home?.name ?? "?"} — {m.away?.name ?? "?"}
                    </p>
                    <p className="font-display text-xl tabular-nums text-white md:col-span-1 md:text-center mt-1 md:mt-0">
                      {m.hs}:{m.as}
                    </p>
                    <span className="md:col-span-1 md:flex md:justify-end mt-2 md:mt-0 inline-flex">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${badge}`}
                      >
                        {letter}
                      </span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Блок статистики — только по региональному этапу. Кубки отдельно. */}
        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-4">
          {tiles.map((s) => (
            <div key={s.label} className="bg-ink p-5 text-center md:p-6">
              <p
                className={`font-display tabular-nums text-polotsk-300 ${
                  s.compact
                    ? "text-3xl md:text-5xl"
                    : "text-4xl md:text-6xl"
                }`}
              >
                {s.value}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-eyebrow text-white">
                {s.label}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-eyebrow text-white/40">
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-1 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <p>
            {usingTable
              ? `${standing?.isFinal ? "Итоговая таблица" : "Турнирная таблица"} · ${stageLabel}${
                  standing?.season ? ` · ${standing.season}` : ""
                }`
              : "По сыгранным матчам лиги — турнирная таблица в CMS не заполнена"}
          </p>
          {cups.length > 0 && <p>{cups.join(" · ")}</p>}
        </div>
      </div>
    </section>
  );
}
