import type { MatchStats, LiveEvent, LiveTeamRef } from "./types";

interface StatsPanelProps {
  stats?: MatchStats;
  events?: LiveEvent[];
  home?: LiveTeamRef;
  away?: LiveTeamRef;
}

interface StatRow {
  label: string;
  home: number;
  away: number;
}

function countByType(
  events: LiveEvent[],
  type: string,
  side: "home" | "away",
): number {
  return events.filter((e) => e.type === type && e.forTeam === side).length;
}

/**
 * Прогресс-бары для статистики матча. Все значения опциональны — если
 * stats не задан, рисуем 0:0. Жёлтые считаются прямо из events[].
 */
export function StatsPanel({ stats, events, home, away }: StatsPanelProps) {
  const ev = events ?? [];
  const yellowHome = countByType(ev, "yellow", "home");
  const yellowAway = countByType(ev, "yellow", "away");

  const rows: StatRow[] = [
    {
      label: "Удары",
      home: stats?.shotsHome ?? 0,
      away: stats?.shotsAway ?? 0,
    },
    {
      label: "В створ",
      home: stats?.shotsOnGoalHome ?? 0,
      away: stats?.shotsOnGoalAway ?? 0,
    },
    {
      label: "Владение %",
      home: stats?.possessionHome ?? 0,
      away: stats?.possessionAway ?? 0,
    },
    {
      label: "Угловые",
      home: stats?.cornersHome ?? 0,
      away: stats?.cornersAway ?? 0,
    },
    {
      label: "Офсайды",
      home: stats?.offsidesHome ?? 0,
      away: stats?.offsidesAway ?? 0,
    },
    { label: "Жёлтые", home: yellowHome, away: yellowAway },
  ];

  const homeName = home?.short ?? home?.name ?? "ХОЗ";
  const awayName = away?.short ?? away?.name ?? "ГОС";

  return (
    <div className="space-y-3.5">
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-eyebrow text-white/50">
        <span className="truncate">{homeName}</span>
        <span className="truncate">{awayName}</span>
      </div>

      {rows.map((r) => {
        const total = r.home + r.away;
        const homePct = total > 0 ? (r.home / total) * 100 : 50;
        return (
          <div key={r.label}>
            <div className="mb-1 grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm">
              <span className="font-display tabular-nums text-white">
                {r.home}
              </span>
              <span className="text-center text-[10px] uppercase tracking-eyebrow text-white/60">
                {r.label}
              </span>
              <span className="font-display tabular-nums text-white text-right">
                {r.away}
              </span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-polotsk-300 transition-all"
                style={{ width: `${homePct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
