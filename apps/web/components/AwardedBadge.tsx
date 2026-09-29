/**
 * Метка «результат присуждён» рядом со счётом.
 *
 * Счёт остаётся обычным — он идёт в турнирную таблицу. Метка лишь объясняет,
 * почему у матча нет протокола. Так же это показывают Flashscore и
 * Transfermarkt: цифры не трогают, статус выносят отдельно.
 */
export function AwardedBadge({ tone = "light" }: { tone?: "light" | "dark" }) {
  const styles =
    tone === "dark"
      ? "border-white/20 text-white/60"
      : "border-slate-300 text-slate-500";

  return (
    <span
      title="Результат присуждён — матч не состоялся"
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles}`}
    >
      Тех.
    </span>
  );
}
