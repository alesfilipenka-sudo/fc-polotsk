import Link from "next/link";
import { Target, Handshake, Trophy, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlayerStats as PlayerStatsData } from "./types";

interface PlayerStatsProps {
  stats: PlayerStatsData;
  season?: string;
}

interface StatCardProps {
  label: string;
  value: number | string;
  Icon: React.ComponentType<{ className?: string }>;
  accent?: "polotsk" | "amber" | "slate" | "emerald";
  sub?: string;
}

const ACCENTS: Record<
  NonNullable<StatCardProps["accent"]>,
  { text: string; bg: string; ring: string }
> = {
  polotsk: {
    text: "text-polotsk-500",
    bg: "bg-polotsk-50",
    ring: "ring-polotsk-100",
  },
  amber: { text: "text-amber-500", bg: "bg-amber-50", ring: "ring-amber-100" },
  slate: { text: "text-slate-600", bg: "bg-slate-100", ring: "ring-slate-200" },
  emerald: {
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-100",
  },
};

function StatCard({ label, value, Icon, accent = "polotsk", sub }: StatCardProps) {
  const a = ACCENTS[accent];
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl bg-white p-5 ring-1",
        a.ring,
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          a.bg,
        )}
      >
        <Icon className={cn("h-6 w-6", a.text)} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-eyebrow text-slate-500">
          {label}
        </p>
        <p className="font-display text-3xl leading-tight tabular-nums text-slate-900">
          {value}
        </p>
        {sub && (
          <p className="text-[10px] uppercase tracking-eyebrow text-slate-400">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function formatContribDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}

/**
 * Секция статистики на странице игрока. 5 stat-карт + список последних матчей
 * где игрок отметился (голы/ассисты). Скрывается полностью если у игрока
 * нулевая статистика (нет ни одного finished-матча с его участием).
 */
export function PlayerStats({ stats, season }: PlayerStatsProps) {
  const hasAny =
    stats.matchesPlayed > 0 ||
    stats.goals > 0 ||
    stats.assists > 0 ||
    stats.yellows > 0 ||
    stats.reds > 0;

  if (!hasAny) return null;

  const cards = stats.reds > 0 ? 5 : 4;

  return (
    <section aria-label="Статистика игрока" className="space-y-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl text-slate-900 md:text-3xl">
          Статистика
        </h2>
        {season && (
          <span className="text-[10px] uppercase tracking-eyebrow text-slate-400">
            Сезон {season}
          </span>
        )}
      </div>

      <div
        className={cn(
          "grid gap-3",
          cards === 5
            ? "grid-cols-2 md:grid-cols-5"
            : "grid-cols-2 md:grid-cols-4",
        )}
      >
        <StatCard
          label="Матчи"
          value={stats.matchesPlayed}
          Icon={Trophy}
          accent="slate"
        />
        <StatCard
          label="Голы"
          value={stats.goals}
          Icon={Target}
          accent="polotsk"
        />
        <StatCard
          label="Ассисты"
          value={stats.assists}
          Icon={Handshake}
          accent="emerald"
        />
        <StatCard
          label="Жёлтые"
          value={stats.yellows}
          Icon={Square}
          accent="amber"
        />
        {stats.reds > 0 && (
          <StatCard
            label="Красные"
            value={stats.reds}
            Icon={Square}
            accent="polotsk"
          />
        )}
      </div>

      {stats.contributions.length > 0 && (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-100 md:p-6">
          <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-eyebrow text-slate-500">
            Последние результативные матчи
          </h3>
          <ul className="divide-y divide-slate-100">
            {stats.contributions.map((m) => (
              <li key={m._id}>
                <Link
                  href="/#results"
                  className="flex items-center gap-3 py-3 transition hover:bg-slate-50 md:gap-4"
                >
                  <span className="w-14 shrink-0 text-[10px] uppercase tracking-eyebrow text-slate-400">
                    {formatContribDate(m.date)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-900">
                    <span className={cn(m.home.isOwn && "font-semibold")}>
                      {m.home.short || m.home.name}
                    </span>
                    <span className="mx-2 tabular-nums text-slate-400">
                      {m.hs != null && m.as != null ? `${m.hs}:${m.as}` : "—"}
                    </span>
                    <span className={cn(m.away.isOwn && "font-semibold")}>
                      {m.away.short || m.away.name}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-xs">
                    {m.goals > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-polotsk-50 px-2 py-1 font-semibold text-polotsk-600">
                        <Target className="h-3 w-3" />
                        {m.goals}
                      </span>
                    )}
                    {m.assists > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-600">
                        <Handshake className="h-3 w-3" />
                        {m.assists}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
