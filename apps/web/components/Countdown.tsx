"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  /** ISO datetime матча (UTC из Sanity). Если null/undefined — рисуем "--". */
  targetIso?: string | null;
}

const LABELS = ["Дней", "Часов", "Минут", "Секунд"] as const;

/**
 * Тикающий обратный отсчёт до даты матча.
 *
 * Hero — Server Component, поэтому таймер вынесен в отдельный клиентский
 * компонент. На первом рендере (и SSR) показываем "--" чтобы избежать
 * hydration mismatch — после mount считаем разницу и тикаем каждую секунду.
 */
export function Countdown({ targetIso }: CountdownProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!targetIso) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  let parts: [string, string, string, string] = ["--", "--", "--", "--"];

  if (targetIso && now !== null) {
    const diff = new Date(targetIso).getTime() - now;
    if (diff <= 0) {
      parts = ["00", "00", "00", "00"];
    } else {
      const totalSec = Math.floor(diff / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      parts = [
        String(days),
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0"),
      ];
    }
  }

  return (
    <>
      {LABELS.map((label, i) => (
        <div key={label}>
          <p className="font-display text-2xl tabular-nums text-white sm:text-3xl">
            {parts[i]}
          </p>
          <p className="mt-1 text-[9px] uppercase tracking-eyebrow text-white/60 sm:text-[10px]">
            {label}
          </p>
        </div>
      ))}
    </>
  );
}
