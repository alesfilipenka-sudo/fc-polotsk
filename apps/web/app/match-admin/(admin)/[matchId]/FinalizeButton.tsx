"use client";

import { useTransition } from "react";
import { finalizeMatchAction } from "./actions";

interface FinalizeButtonProps {
  matchId: string;
  goalsCount: number;
}

/**
 * Кнопка завершения матча. Запрашивает подтверждение перед commit'ом —
 * операция перепишет scorers[] на основе events[type=goal] и сменит статус
 * на finished, что необратимо без ручной правки в Studio.
 */
export function FinalizeButton({ matchId, goalsCount }: FinalizeButtonProps) {
  const [pending, startTransition] = useTransition();

  function click() {
    const msg =
      goalsCount === 0
        ? "Завершить матч? В ленте нет ни одного гола — список бомбардиров будет пустым."
        : `Завершить матч? Голов в ленте: ${goalsCount}. Они скопируются в основной список бомбардиров (scorers).`;
    if (!confirm(msg)) return;
    startTransition(async () => {
      try {
        await finalizeMatchAction(matchId);
      } catch (err) {
        alert(
          err instanceof Error ? err.message : "Не удалось завершить матч",
        );
      }
    });
  }

  return (
    <button
      type="button"
      onClick={click}
      disabled={pending}
      className="w-full rounded-2xl border-2 border-red-500 bg-white px-4 py-3 text-sm font-bold uppercase tracking-wider text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Завершаю…" : "Завершить матч"}
    </button>
  );
}
