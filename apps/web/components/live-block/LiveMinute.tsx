"use client";

import { useEffect, useState } from "react";

interface LiveMinuteProps {
  /** Дата начала матча (kickoff) — для авто-подсчёта. ISO из Sanity. */
  kickoffIso?: string | null;
  /** Ручное значение из CMS. Если задано — перебивает авто-подсчёт. */
  override?: number | null;
  /** Максимальная минута. Default 120 (с учётом доп. времени). */
  cap?: number;
}

/**
 * Минута live-матча. Если оператор не задал `currentMinute` в Studio —
 * считаем автоматически от kickoff (match.date). Тикаем каждые 30 секунд.
 *
 * На SSR / первом рендере возвращаем null чтобы не было hydration mismatch
 * (на сервере и клиенте Date.now() разный).
 */
export function LiveMinute({
  kickoffIso,
  override,
  cap = 120,
}: LiveMinuteProps) {
  // Хуки всегда на верхнем уровне, до любых ранних возвратов.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (override != null) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [override]);

  // 1. Ручной override из CMS — приоритет.
  if (override != null) {
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
  if (diffMin > cap) {
    return <>{cap}&prime;</>;
  }
  return <>{diffMin}&prime;</>;
}
