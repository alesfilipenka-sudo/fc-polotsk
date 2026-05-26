import { LogoDecor } from "../Logo";
import { EventFeed } from "./EventFeed";
import { LiveMinute } from "./LiveMinute";
import type { LiveMatch, LiveTeamRef, LiveEvent } from "./types";

interface LiveBlockProps {
  match: LiveMatch;
}

function TeamLogo({ team, size = 56 }: { team?: LiveTeamRef; size?: number }) {
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
  if (team?.isOwn) {
    return (
      <img
        src="/logo.png"
        alt="ФК Полоцк"
        className="object-contain"
        style={{ width: size, height: size }}
      />
    );
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

function LiveIndicator({
  minute,
  kickoffIso,
  competition,
  tour,
}: {
  minute?: number;
  kickoffIso?: string;
  competition?: string;
  tour?: number;
}) {
  const tourLabel = tour ? ` · Тур ${tour}` : "";
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-eyebrow">
      <span className="inline-flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1 font-bold text-white">
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-300 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-300" />
        </span>
        LIVE
        <span className="font-display tabular-nums">
          <span>· </span>
          <LiveMinute override={minute} kickoffIso={kickoffIso} />
        </span>
      </span>
      <span className="truncate text-white/70">
        {(competition ?? "Матч")}{tourLabel}
      </span>
    </div>
  );
}

function LastEventTicker({ event }: { event?: LiveEvent }) {
  if (!event) return null;
  const icon =
    event.type === "goal" ? "⚽" :
    event.type === "yellow" ? "🟨" :
    event.type === "red" ? "🟥" :
    event.type === "sub" ? "↕" : "·";
  const minute = event.minute != null ? `${event.minute}' ` : "";
  return (
    <div className="mt-5 flex items-center gap-3 rounded-2xl bg-black/20 px-4 py-3 text-sm">
      <span className="text-base" aria-hidden>{icon}</span>
      <span className="tabular-nums text-white/70">{minute}</span>
      <span className="font-medium text-white truncate">
        {event.name ?? "?"}
      </span>
      {event.type === "sub" && event.playerOffName && (
        <span className="text-white/60 text-xs truncate">↓ {event.playerOffName}</span>
      )}
      <span className="ml-auto text-[10px] uppercase tracking-eyebrow text-white/50">
        Последнее событие
      </span>
    </div>
  );
}

/**
 * Публичная live-карточка в MatchCenter. Phase 1 = только лента событий.
 *
 * Все поля опциональны — если оператор не зашёл, всё работает с фолбэками:
 *   - currentMinute нет → авто-подсчёт от match.date в LiveMinute
 *   - hs/as нет → 0:0
 *   - events[] пуст → "Пока без событий"
 *   - имена нет → "?"
 */
export function LiveBlock({ match }: LiveBlockProps) {
  // Свежий event для тикера: с максимальной минутой
  const lastEvent = (match.events ?? [])
    .filter((e) => e && e.type)
    .slice()
    .sort((a, b) => (b.minute ?? 0) - (a.minute ?? 0))[0];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-polotsk-500 p-6 text-white md:p-10">
      <LogoDecor
        size={300}
        opacity={0.08}
        className="pointer-events-none absolute -right-12 -bottom-12 hidden md:block"
      />

      <div className="relative">
        <LiveIndicator
          minute={match.currentMinute}
          kickoffIso={match.date}
          competition={match.competition}
          tour={match.tour}
        />

        {/* Score */}
        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-4">
          <div className="flex flex-col items-center gap-2 text-center min-w-0">
            <TeamLogo team={match.home} size={56} />
            <p className="font-display text-base md:text-2xl truncate max-w-full">
              {match.home?.name ?? "Хозяева"}
            </p>
            <p className="text-[10px] uppercase tracking-eyebrow text-white/60">Дома</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <span className="font-display text-5xl md:text-7xl leading-none tabular-nums">
              {match.hs ?? 0}
            </span>
            <span className="font-display text-3xl md:text-5xl text-polotsk-300">:</span>
            <span className="font-display text-5xl md:text-7xl leading-none tabular-nums">
              {match.as ?? 0}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center min-w-0">
            <TeamLogo team={match.away} size={56} />
            <p className="font-display text-base md:text-2xl truncate max-w-full">
              {match.away?.name ?? "Гости"}
            </p>
            <p className="text-[10px] uppercase tracking-eyebrow text-white/60">Гости</p>
          </div>
        </div>

        {match.venue && (
          <p className="mt-3 text-center text-[11px] uppercase tracking-eyebrow text-white/50">
            {match.venue}
          </p>
        )}

        <LastEventTicker event={lastEvent} />

        <div className="mt-6">
          <p className="mb-3 text-[10px] uppercase tracking-eyebrow text-white/60">
            Лента матча
          </p>
          <EventFeed events={match.events} />
        </div>
      </div>
    </div>
  );
}
