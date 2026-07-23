"use client";

import { useEffect, useState } from "react";

interface LiveMinuteProps {
  /** Дата начала матча (kickoff) — для авто-подсчёта. ISO из Sanity. */
  kickoffIso?: string | null;
  /** Ручное значение из CMS. Если задано — перебивает авто-подсчёт. */
  override?: number | null;
  /** Регулярное время матча в минутах. По умолчанию 90 (два тайма). */
  regularTime?: number;
}

/**
 * Минута live-матча. Если оператор не задал `currentMinute` в Studio —
 * считаем автоматически от kickoff (match.date). Тикаем каждые 30 секунд.
 *
 * После regularTime (90) вместо голого числа показываем "90+" — стандартная
 * футбольная нотация для добавленного времени. Это защита от ситуации когда
 * админ забыл нажать «Завершить матч» и минута тикает бесконечно.
 *
 * На SSR / первом рендере возвращаем null чтобы не было hydration mismatch.
 */
export function LiveMinute({
  kickoffIso,
  override,
  regularTime = 90,
}: LiveMinuteProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (override != null) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [override]);

  // 1. Ручной override из CMS — приоритет.
  // Оператор может явно написать "45+2" сам — тогда покажем как есть.
  if (override != null) {
    if (override > regularTime) {
      return <>{regularTime}+&prime;</>;
    }
    return <>{override}&prime;</>;
  }

  // 2. Авто-подсчёт от kickoff.
  if (!kickoffIso || now == null) {
    return null;
  }

  const kickoff = new Date(kickoffIso).getTime();
  const diffMin = Math.floor((now - kickoff) / 60_000);

  if (diffMin < 0) {
    return null;
  }
  // После regularTime (90) показываем "90+" — компактно и корректно для футбола
  if (diffMin > regularTime) {
    return <>{regularTime}+&prime;</>;
  }
  return <>{diffMin}&prime;</>;
}
