import type { LiveEvent } from "./types";

interface EventFeedProps {
  events?: LiveEvent[];
  /** Скрыть после max событий (Phase 1: показываем все, max=null). */
  max?: number | null;
}

function eventIcon(type?: string): string {
  switch (type) {
    case "goal":
      return "⚽";
    case "yellow":
      return "🟨";
    case "red":
      return "🟥";
    case "sub":
      return "↕";
    default:
      return "·";
  }
}

function EventLine({ ev }: { ev: LiveEvent }) {
  const icon = eventIcon(ev.type);
  const name = ev.name ?? "?";
  const minute = ev.minute != null ? `${ev.minute}'` : "—";
  const isHome = ev.forTeam === "home";

  return (
    <div
      className={`flex items-center gap-2 text-sm ${isHome ? "" : "justify-end text-right"}`}
    >
      {isHome ? (
        <>
          <span className="text-white/60 tabular-nums w-9 shrink-0">{minute}</span>
          <span aria-hidden>{icon}</span>
          <span className="font-medium text-white truncate">{name}</span>
          {ev.type === "goal" && ev.assistName && (
            <span className="text-white/50 text-xs truncate">
              · 🎯 {ev.assistName}
            </span>
          )}
          {ev.type === "sub" && ev.playerOffName && (
            <span className="text-white/50 text-xs truncate">
              ↓ {ev.playerOffName}
            </span>
          )}
          {ev.type === "goal" && ev.ownGoal && (
            <span className="text-white/40 text-xs">(а/г)</span>
          )}
          <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-polotsk-300" />
        </>
      ) : (
        <>
          <span className="mr-auto h-1.5 w-1.5 shrink-0 rounded-full bg-white/25" />
          {ev.type === "goal" && ev.ownGoal && (
            <span className="text-white/40 text-xs">(а/г)</span>
          )}
          {ev.type === "sub" && ev.playerOffName && (
            <span className="text-white/50 text-xs truncate">
              {ev.playerOffName} ↓
            </span>
          )}
          {ev.type === "goal" && ev.assistName && (
            <span className="text-white/50 text-xs truncate">
              🎯 {ev.assistName} ·
            </span>
          )}
          <span className="font-medium text-white truncate">{name}</span>
          <span aria-hidden>{icon}</span>
          <span className="text-white/60 tabular-nums w-9 shrink-0">{minute}</span>
        </>
      )}
    </div>
  );
}

/**
 * Лента событий матча. События идут сверху вниз: новые → старые
 * (предполагается что админка вставляет последнее событие в начало массива,
 * либо что Sanity возвращает в порядке создания — упорядочим по убыванию
 * минуты как фолбэк, чтобы UI был стабильным независимо от формы хранения).
 */
export function EventFeed({ events, max = null }: EventFeedProps) {
  const list = (events ?? [])
    .filter((e) => e && e.type)
    .slice()
    .sort((a, b) => (b.minute ?? 0) - (a.minute ?? 0));

  const limited = max != null ? list.slice(0, max) : list;

  if (limited.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-6 text-center text-sm text-white/60">
        Пока без событий. Лента обновится автоматически.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {limited.map((ev, i) => (
        <EventLine key={`${ev.minute ?? "?"}-${ev.type ?? "?"}-${i}`} ev={ev} />
      ))}
    </div>
  );
}
