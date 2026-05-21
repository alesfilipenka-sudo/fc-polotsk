import { Calendar, Clock, MapPin, ArrowRight, CalendarPlus } from "lucide-react";
import { SectionHeader } from "../SectionHeader";
import { LogoLight } from "../Logo";
import { sanityFetch } from "@/lib/sanity";
import {
  SITE_SETTINGS_QUERY,
  RECENT_MATCHES_QUERY,
  STANDINGS_QUERY,
} from "@/lib/queries";

interface TeamRef {
  name?: string;
  short?: string;
  logo?: string;
  isOwn?: boolean;
}
interface NextMatch {
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

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
  });
}
function formatTime(iso?: string) {
  if (!iso) return "—:—";
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
    return (
      <img
        src={team.logo}
        alt={team.name ?? ""}
        className="object-contain"
        style={{ width: size, height: size }}
      />
    );
  }
  if (team?.isOwn) return <LogoLight size={size} />;
  return (
    <span
      className="inline-flex items-center justify-center rounded-full border border-white/20 font-display text-sm"
      style={{ width: size, height: size }}
    >
      {team?.short ?? "?"}
    </span>
  );
}

export async function MatchCenter() {
  const [settings, recent, standings] = await Promise.all([
    sanityFetch<{ nextMatch?: NextMatch | null }>(SITE_SETTINGS_QUERY),
    sanityFetch<RecentMatch[]>(RECENT_MATCHES_QUERY),
    sanityFetch<Standings | null>(STANDINGS_QUERY),
  ]);

  const next = settings?.nextMatch;
  const recentList = recent ?? [];
  const standingsRows = standings?.rows ?? [];

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
          {/* Next match card */}
          <div className="relative overflow-hidden rounded-3xl bg-polotsk-500 p-6 text-white md:p-10 lg:col-span-7">
            <LogoLight
              size={300}
              opacity={0.06}
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
                {/* Home — always left */}
                <div className="flex flex-col items-center gap-2 text-center min-w-0">
                  <TeamLogo team={next?.home} size={56} />
                  <p className="font-display text-base md:text-2xl truncate max-w-full">
                    {next?.home?.name ?? "Хозяева"}
                  </p>
                  <p className="text-[10px] uppercase tracking-eyebrow text-white/60">
                    Дома
                  </p>
                </div>
                <div className="text-center min-w-[60px]">
                  <p className="font-display text-3xl tabular-nums text-polotsk-300 md:text-5xl">
                    VS
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-eyebrow text-white/60">
                    {next?.tour ? `Тур ${next.tour}` : ""}
                  </p>
                </div>
                {/* Away — always right */}
                <div className="flex flex-col items-center gap-2 text-center min-w-0">
                  <TeamLogo team={next?.away} size={56} />
                  <p className="font-display text-base md:text-2xl truncate max-w-full">
                    {next?.away?.name ?? "Гости"}
                  </p>
                  <p className="text-[10px] uppercase tracking-eyebrow text-white/60">
                    Гости
                  </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 border-t border-white/10 pt-6 md:grid-cols-3">
                {[
                  { Icon: Calendar, label: "Дата", value: formatDate(next?.date) },
                  { Icon: Clock, label: "Начало", value: formatTime(next?.date) },
                  {
                    Icon: MapPin,
                    label: "Стадион",
                    value: next?.venue ?? "Стадион «Полоцк»",
                  },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-4 w-4 text-polotsk-300" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-eyebrow text-white/60">
                        {label}
                      </p>
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

          {/* Right column */}
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
                      <li
                        key={`ph-${i}`}
                        className="flex items-center gap-4 py-3"
                      >
                        <span className="h-8 w-1 shrink-0 rounded-full bg-slate-200" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] uppercase tracking-eyebrow text-slate-400">
                            — апр
                          </p>
                          <p className="truncate text-sm text-slate-700">
                            Полоцк — соперник
                          </p>
                        </div>
                        <span className="font-display text-2xl tabular-nums text-slate-400">
                          —:—
                        </span>
                      </li>
                    );
                  }
                  const r = resultMark(m);
                  const stripeColor =
                    r === "W"
                      ? "bg-polotsk-500"
                      : r === "L"
                      ? "bg-red-400"
                      : r === "D"
                      ? "bg-slate-400"
                      : "bg-slate-200";
                  return (
                    <li
                      key={m._id}
                      className="flex items-center gap-3 py-3"
                    >
                      <span
                        className={`h-8 w-1 shrink-0 rounded-full ${stripeColor}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] uppercase tracking-eyebrow text-slate-400">
                          {new Date(m.date).toLocaleDateString("ru-RU", {
                            day: "2-digit",
                            month: "short",
                          })}
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
                      <li
                        key={`ph-s-${i}`}
                        className="grid grid-cols-12 items-center gap-3 rounded-lg px-3 py-2 text-sm"
                      >
                        <span className="col-span-1 font-display tabular-nums text-white/80">
                          {i + 1}
                        </span>
                        <span className="col-span-7 truncate">
                          Команда {i + 1}
                        </span>
                        <span className="col-span-2 text-right text-white/60">—</span>
                        <span className="col-span-2 text-right font-display tabular-nums">
                          —
                        </span>
                      </li>
                    );
                  }
                  return (
                    <li
                      key={`s-${row.pos}-${row.team?.name ?? "x"}`}
                      className={`grid grid-cols-12 items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                        row.team?.isOwn ? "bg-polotsk-500" : ""
                      }`}
                    >
                      <span className="col-span-1 font-display tabular-nums text-white/80">
                        {row.pos}
                      </span>
                      <span className="col-span-2 flex items-center justify-center">
                        {row.team?.logo ? (
                          <img
                            src={row.team.logo}
                            alt=""
                            className="h-5 w-5 object-contain"
                          />
                        ) : null}
                      </span>
                      <span className="col-span-5 truncate">
                        {row.team?.name ?? "—"}
                      </span>
                      <span className="col-span-2 text-right text-white/60">
                        {row.mp}
                      </span>
                      <span className="col-span-2 text-right font-display tabular-nums">
                        {row.pts}
                      </span>
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
