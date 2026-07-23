import type { PlayerPreviousClub } from "./types";

interface PlayerCareerTimelineProps {
  clubs?: PlayerPreviousClub[];
}

function formatYears(from?: number, to?: number): string {
  if (from && to) return `${from} — ${to}`;
  if (from) return `с ${from}`;
  if (to) return `до ${to}`;
  return "";
}

/**
 * Карьера игрока — timeline предыдущих клубов. Показываем в обратном
 * хронологическом порядке (свежие сверху) — как это обычно на sports-сайтах.
 */
export function PlayerCareerTimeline({ clubs }: PlayerCareerTimelineProps) {
  const list = (clubs ?? []).filter((c) => c.clubName);
  if (list.length === 0) return null;

  const sorted = list.slice().sort((a, b) => {
    const aYear = a.from ?? a.to ?? 0;
    const bYear = b.from ?? b.to ?? 0;
    return bYear - aYear;
  });

  return (
    <div>
      <p className="mb-4 text-[10px] uppercase tracking-eyebrow text-polotsk-500">
        Карьера до ФК Полоцк
      </p>
      <ol className="relative border-l-2 border-slate-200 pl-6">
        {sorted.map((c, i) => (
          <li key={`${c.clubName}-${i}`} className="relative mb-6 last:mb-0">
            <span
              className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-polotsk-500"
              aria-hidden
            />
            <p className="font-display text-lg text-slate-900">
              {c.clubName}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              {formatYears(c.from, c.to) && (
                <span className="tabular-nums">{formatYears(c.from, c.to)}</span>
              )}
              {c.note && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="italic">{c.note}</span>
                </>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
