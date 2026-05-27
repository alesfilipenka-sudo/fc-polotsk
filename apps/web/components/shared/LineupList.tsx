interface LineupEntry {
  playerId?: string;
  name?: string;
  number?: number;
  position?: string;
  isStarter?: boolean;
  isCaptain?: boolean;
}

interface LineupListProps {
  squad?: LineupEntry[];
  color?: string;
  label?: string;
}

/**
 * Список игроков состава. Стартовый XI — обычным шрифтом, запасные —
 * приглушённо (opacity-60). Номер в цветной плашке.
 */
export function LineupList({
  squad,
  color = "#234794",
  label,
}: LineupListProps) {
  const starters = (squad ?? []).filter((p) => p.isStarter !== false);
  const bench = (squad ?? []).filter((p) => p.isStarter === false);

  if (starters.length === 0 && bench.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center text-xs text-white/50">
        Состав ещё не задан.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-[10px] uppercase tracking-eyebrow text-white/60">
          {label}
        </p>
      )}
      <ul className="space-y-1.5">
        {starters.map((p, i) => (
          <li
            key={p.playerId ?? `s-${i}`}
            className="flex items-center gap-2.5 text-sm"
          >
            <span
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-bold"
              style={{ background: color, color: "white" }}
            >
              {p.number ?? "—"}
            </span>
            <span className="truncate text-white">
              {p.name ?? "?"}
              {p.isCaptain && (
                <span className="ml-1 text-polotsk-300">©</span>
              )}
            </span>
            {p.position && (
              <span className="ml-auto text-[10px] uppercase tracking-eyebrow text-white/40 shrink-0">
                {p.position}
              </span>
            )}
          </li>
        ))}
      </ul>
      {bench.length > 0 && (
        <>
          <p className="mt-3 text-[10px] uppercase tracking-eyebrow text-white/40">
            Запас
          </p>
          <ul className="space-y-1.5 opacity-60">
            {bench.map((p, i) => (
              <li
                key={p.playerId ?? `b-${i}`}
                className="flex items-center gap-2.5 text-sm"
              >
                <span
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-bold"
                  style={{ background: color, color: "white" }}
                >
                  {p.number ?? "—"}
                </span>
                <span className="truncate text-white/80">
                  {p.name ?? "?"}
                </span>
                {p.position && (
                  <span className="ml-auto text-[10px] uppercase tracking-eyebrow text-white/40 shrink-0">
                    {p.position}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
