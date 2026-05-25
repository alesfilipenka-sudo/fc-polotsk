import { Calendar, Clock, MapPin, ArrowRight, CalendarPlus } from "lucide-react";
import { SectionHeader } from "../SectionHeader";
import { LogoDecor } from "../Logo";
import { sanityFetch } from "@/lib/sanity";
import {
  RECENT_MATCHES_QUERY,
  STANDINGS_QUERY,
  LAST_FINISHED_MATCH_QUERY,
  NEXT_MATCH_QUERY,
} from "@/lib/queries";
import { formatMatchDate, formatMatchTime, formatShortDate } from "@/lib/dateFormat";
import { getPolotskResult } from "@/lib/matchWindow";

interface TeamRef {
  name?: string;
  short?: string;
  logo?: string;
  isOwn?: boolean;
}
interface NextMatch {
  _id?: string;
  date?: string;
  competition?: string;
  tour?: number;
  venue?: string;
  home?: TeamRef;
  away?: TeamRef;
}
interface RecentMatch {
  _id: string;
  date: string;
  competition?: string;
  hs?: number;
  as?: number;
  home?: TeamRef;
  away?: TeamRef;
}
interface Scorer {
  minute?: number;
  forTeam?: "home" | "away";
  ownGoal?: boolean;
  name?: string;
}
interface FinishedMatch {
  _id: string;
  date?: string;
  competition?: string;
  tour?: number;
  finishedAt?: string;
  hs?: number;
  as?: number;
  home?: TeamRef;
  away?: TeamRef;
  scorers?: Scorer[];
}
interface StandingsRow {
  pos: number;
  mp: number;
  pts: number;
  team?: TeamRef;
}
interface Standings {
  season?: string;
  rows?: StandingsRow[];
}

function resultMark(m: RecentMatch): "W" | "L" | "D" | null {
  if (m.hs == null || m.as == null) return null;
  const polotskHome = m.home?.isOwn;
  const our = polotskHome ? m.hs : m.as;
  const their = polotskHome ? m.as : m.hs;
  if (our > their) return "W";
  if (our < their) return "L";
  return "D";
}

function TeamLogo({ team, size = 56 }: { team?: TeamRef; size?: number }) {
  if (team?.logo) {
    return <img src={team.logo} alt={team.name ?? ""} className="object-contain" style={{ width: size, height: size }} />;
  }
  if (team?.isOwn) {
    return <img src="/logo.png" alt="ФК Полоцк" className="object-contain" style={{ width: size, height: size }} />;
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-full border border-white/20 font-display text-sm"
      style={{ width: size, height: size }}
    >
      {team?.short ?? "?"}
    </span>
  );
}

function TeamRow({ team }: { team?: TeamRef }) {
  const name = team?.name ?? "—";
  return (
    <div className="flex items-center gap-2 min-w-0">
      {team?.logo ? (
        <img src={team.logo} alt={name} className="h-8 w-8 object-contain" />
      ) : team?.isOwn ? (
        <img src="/logo.png" alt="ФК Полоцк" className="h-8 w-8 object-contain" />
      ) : (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 font-display text-xs text-slate-500">
          {team?.short ?? "?"}
        </span>
      )}
      <span className={`font-display text-sm md:text-base truncate ${team?.isOwn ? "text-polotsk-700 font-bold" : "text-slate-600"}`}>
        {name}
      </span>
    </div>
  );
}

function PostMatchCard({ match }: { match: FinishedMatch }) {
  const r = getPolotskResult(match);
  const accentColor = r === "W" ? "#234794" : r === "L" ? "#ef4444" : "#64748b";
  const label = r === "W" ? "Победа" : r === "L" ? "Поражение" : "Ничья";
  const when = match.finishedAt ?? match.date;
  const scorers = match.scorers ?? [];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 md:p-7">
      <span
        className="absolute left-0 top-6 bottom-6 w-1 rounded-full"
        style={{ background: accentColor }}
        aria-hidden
      />
      <div className="flex items-center justify-between gap-3 pl-3">
        <span className="text-[10px] uppercase tracking-eyebrow text-slate-400">
          Сыгран · {when ? formatShortDate(when) : ""}
          {match.competition ? ` · ${match.competition}` : ""}
        </span>
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ background: accentColor }}
        >
          {label}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4 pl-3">
        <TeamRow team={match.home} />
        <div className="flex items-center gap-2 shrink-0 font-display text-[2rem] md:text-[2.4rem] leading-none tabular-nums text-ink">
          <span>{match.hs ?? "—"}</span>
          <span className="text-slate-300 text-xl">:</span>
          <span>{match.as ?? "—"}</span>
        </div>
        <div className="flex justify-end">
          <TeamRow team={match.away} />
        </div>
      </div>

      {scorers.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 pl-3 text-xs text-slate-500">
          <span aria-hidden>⚽</span>
          {scorers.map((s, i) => (
            <span key={i}>
              <span className="font-medium text-slate-700">{s.name ?? "?"}</span>
              {s.minute != null ? ` ${s.minute}'` : ""}
              {s.ownGoal ? " (а/г)" : ""}
              {i < scorers.length - 1 ? "," : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export async function MatchCenter() {
  const [recent, standings, lastMatch, nextMatchData] = await Promise.all([
    sanityFetch<RecentMatch[]>(RECENT_MATCHES_QUERY),
    sanityFetch<Standings | null>(STANDINGS_QUERY),
    sanityFetch<FinishedMatch | null>(LAST_FINISHED_MATCH_QUERY),
    sanityFetch<NextMatch | null>(NEXT_MATCH_QUERY),
  ]);

  const next = nextMatchData ?? null;
  const recentList = recent ?? [];
  const standingsRows = standings?.rows ?? [];
  const showPostMatch = !!lastMatch;
  const showNext = !!next;

  return (
    <section id="matches" className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="Матч-центр"
          title={
            <>
              Игры <span className="text-polotsk-500">сезона</span>
            </>
          }
        />

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-6 lg:col-span-7">
            {showPostMatch && lastMatch && <PostMatchCard match={lastMatch} />}

            {!showPostMatch && !showNext && (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Расписание уточняется
              </div>
            )}

            {showNext && (
              <div className="relative overflow-hidden rounded-3xl bg-polotsk-500 p-6 text-white md:p-10">
                <LogoDecor
                  size={300}
                  opacity={0.08}
                  className="pointer-events-none absolute -right-12 -bottom-12 hidden md:block"
                />
                <div className="relative">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-eyebrow text-white/70">
                    <span>Следующий матч</span>
                    <span className="truncate max-w-full md:max-w-[60%]">
                      {next?.competition ?? "Высшая лига"}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-4">
                    <div className="flex flex-col items-center gap-2 text-center min-w-0">
                      <TeamLogo team={next?.home} size={56} />
                      <p className="font-display text-base md:text-2xl truncate max-w-full">
                        {next?.home?.name ?? "Хозяева"}
                      </p>
                      <p className="text-[10px] uppercase tracking-eyebrow text-white/60">Дома</p>
                    </div>
                    <div className="text-center min-w-[60px]">
                      <p className="font-display text-3xl tabular-nums text-polotsk-300 md:text-5xl">VS</p>
                      <p className="mt-1 text-[10px] uppercase tracking-eyebrow text-white/60">
                        {next?.tour ? `Тур ${next.tour}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center min-w-0">
                      <TeamLogo team={next?.away} size={56} />
                      <p className="font-display text-base md:text-2xl truncate max-w-full">
                        {next?.away?.name ?? "Гости"}
                      </p>
                      <p className="text-[10px] uppercase tracking-eyebrow text-white/60">Гости</p>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-4 border-t border-white/10 pt-6 md:grid-cols-3">
                    {[
                      { Icon: Calendar, label: "Дата", value: formatMatchDate(next?.date) },
                      { Icon: Clock, label: "Начало", value: formatMatchTime(next?.date) },
                      { Icon: MapPin, label: "Стадион", value: next?.venue ?? "Стадион «Полоцк»" },
                    ].map(({ Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <Icon className="mt-0.5 h-4 w-4 text-polotsk-300" />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-eyebrow text-white/60">{label}</p>
                          <p className="text-sm truncate">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href="#results"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-polotsk-700 transition hover:bg-polotsk-50"
                    >
                      Статистика сезона
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10"
                    >
                      <CalendarPlus className="h-4 w-4" />В календарь
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-eyebrow text-slate-500">
                Последние матчи
              </p>
              <ul className="divide-y divide-slate-100">
                {(recentList.length > 0
                  ? recentList
                  : (Array.from({ length: 4 }, () => null) as null[])
                ).map((m, i) => {
                  if (!m) {
                    return (
                      <li key={`ph-${i}`} className="flex items-center gap-4 py-3">
                        <span className="h-8 w-1 shrink-0 rounded-full bg-slate-200" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] uppercase tracking-eyebrow text-slate-400">— апр</p>
                          <p className="truncate text-sm text-slate-700">Полоцк — соперник</p>
                        </div>
                        <span className="font-display text-2xl tabular-nums text-slate-400">—:—</span>
                      </li>
                    );
                  }
                  const r = resultMark(m);
                  const stripeColor =
                    r === "W" ? "bg-polotsk-500" : r === "L" ? "bg-red-400" : r === "D" ? "bg-slate-400" : "bg-slate-200";
                  return (
                    <li key={m._id} className="flex items-center gap-3 py-3">
                      <span className={`h-8 w-1 shrink-0 rounded-full ${stripeColor}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] uppercase tracking-eyebrow text-slate-400">
                          {formatShortDate(m.date)}
                        </p>
                        <p className="truncate text-sm text-slate-700">
                          {m.home?.name ?? "?"} — {m.away?.name ?? "?"}
                        </p>
                      </div>
                      <span className="font-display text-xl tabular-nums text-slate-700 shrink-0">
                        {m.hs}:{m.as}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl bg-ink p-6 text-white">
              <p className="mb-4 text-xs font-semibold uppercase tracking-eyebrow text-white/60">
                Турнирная таблица
              </p>
              <ul className="space-y-1">
                {(standingsRows.length > 0
                  ? standingsRows
                  : (Array.from({ length: 5 }, () => null) as null[])
                ).map((row, i) => {
                  if (!row) {
                    return (
                      <li key={`ph-s-${i}`} className="grid grid-cols-12 items-center gap-3 rounded-lg px-3 py-2 text-sm">
                        <span className="col-span-1 font-display tabular-nums text-white/80">{i + 1}</span>
                        <span className="col-span-7 truncate">Команда {i + 1}</span>
                        <span className="col-span-2 text-right text-white/60">—</span>
                        <span className="col-span-2 text-right font-display tabular-nums">—</span>
                      </li>
                    );
                  }
                  return (
                    <li
                      key={`s-${row.pos}-${row.team?.name ?? "x"}`}
                      className={`grid grid-cols-12 items-center gap-2 rounded-lg px-3 py-2 text-sm ${row.team?.isOwn ? "bg-polotsk-500" : ""}`}
                    >
                      <span className="col-span-1 font-display tabular-nums text-white/80">{row.pos}</span>
                      <span className="col-span-2 flex items-center justify-center">
                        {row.team?.logo ? <img src={row.team.logo} alt="" className="h-5 w-5 object-contain" /> : null}
                      </span>
                      <span className="col-span-5 truncate">{row.team?.name ?? "—"}</span>
                      <span className="col-span-2 text-right text-white/60">{row.mp}</span>
                      <span className="col-span-2 text-right font-display tabular-nums">{row.pts}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
