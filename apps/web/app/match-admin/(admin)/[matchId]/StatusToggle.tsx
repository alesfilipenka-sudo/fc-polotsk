"use client";

import { useTransition } from "react";
import { setMatchStatusAction } from "./actions";

interface StatusToggleProps {
  matchId: string;
  status?: "scheduled" | "live" | "finished";
}

/**
 * Кнопка переключения статуса матча. scheduled ↔ live.
 * "Завершить матч" вынесем в Phase 2C (там нужна синхронизация в scorers).
 */
export function StatusToggle({ matchId, status }: StatusToggleProps) {
  const [pending, startTransition] = useTransition();

  if (status === "finished") {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Матч завершён
      </span>
    );
  }

  const isLive = status === "live";
  const next = isLive ? "scheduled" : "live";
  const label = isLive ? "На паузу" : "Начать матч";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setMatchStatusAction(matchId, next);
        })
      }
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition disabled:opacity-60 ${
        isLive
          ? "bg-amber-500 text-white hover:bg-amber-600"
          : "bg-red-500 text-white hover:bg-red-600"
      }`}
    >
      {pending ? "Обновляю…" : label}
    </button>
  );
}
