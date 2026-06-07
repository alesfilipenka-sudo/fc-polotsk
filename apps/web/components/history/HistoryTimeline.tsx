"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HistoryHero } from "./HistoryHero";
import { EraRail } from "./EraRail";
import { EraNode } from "./EraNode";
import { useScrollProgress, useActiveEra } from "./hooks";
import type { HistoryEra } from "./types";

interface HistoryTimelineProps {
  eras: HistoryEra[];
}

/**
 * Корневой компонент страницы /history.
 *
 * Содержит:
 *   - Hero c заголовком "120 лет полоцкого футбола"
 *   - Sticky EraRail с пилюлями годов
 *   - Вертикальный таймлайн с центральной линией (заполняется по скроллу)
 *   - Каждая эпоха = EraNode с карточкой и фото в противоположной колонке
 *   - CTA в конце на текущий матч
 */
export function HistoryTimeline({ eras }: HistoryTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(timelineRef);

  // Один ref на каждую эпоху для scroll-spy
  const eraRefs = useMemo(
    () =>
      Array.from({ length: eras.length }, () =>
        ({ current: null } as { current: HTMLDivElement | null }),
      ),
    [eras.length],
  );

  // Костыль для совместимости с forwardRef API эпох
  const refSetters = useMemo(
    () =>
      eraRefs.map((r) => (el: HTMLDivElement | null) => {
        r.current = el;
      }),
    [eraRefs],
  );

  const activeIndex = useActiveEra(eraRefs);

  function jumpTo(idx: number) {
    const el = eraRefs[idx]?.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (eras.length === 0) {
    return (
      <main className="flex-1">
        <HistoryHero />
        <div className="mx-auto max-w-3xl px-5 py-20 text-center md:px-8">
          <p className="text-slate-500">
            Эпохи истории пока не добавлены в CMS. Зайди в Studio и создай первую.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <HistoryHero />
      <EraRail eras={eras} activeIndex={activeIndex} onJump={jumpTo} />

      <section
        ref={timelineRef}
        className="relative bg-slate-50/30 py-16 md:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="relative">
            {/* Центральная вертикальная линия (только md+) */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-slate-200 md:block"
              aria-hidden
            />
            {/* Заполнение по scrollProgress */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-polotsk-300 via-polotsk-500 to-polotsk-700 md:block"
              style={{ height: `${Math.round(progress * 100)}%` }}
              aria-hidden
            />

            <div className="space-y-20 md:space-y-32">
              {eras.map((era, i) => (
                <EraNode
                  key={era._id}
                  ref={refSetters[i]}
                  era={era}
                  index={i}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink py-16 text-white md:py-24">
        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <p className="text-[10px] uppercase tracking-eyebrow text-polotsk-300">
            Сегодня
          </p>
          <h2 className="mt-2 font-display text-3xl md:text-5xl">
            История пишется на поле прямо сейчас
          </h2>
          <p className="mt-4 text-base text-white/70 md:text-lg">
            Поддержи команду — приди на ближайший матч или подпишись на клуб
            в соцсетях.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/#matches"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-polotsk-700 transition hover:bg-polotsk-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-polotsk-300"
            >
              К ближайшему матчу
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/#social"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Соцсети клуба
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
