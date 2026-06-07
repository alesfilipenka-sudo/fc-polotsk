"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Прогресс прокрутки внутри секции таймлайна. Возвращает значение [0..1]
 * — сколько процентов высоты секции уже выше «середины вьюпорта».
 *
 * Используется для заполнения центральной вертикальной линии.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function recalc() {
      const elNow = ref.current;
      if (!elNow) return;
      const rect = elNow.getBoundingClientRect();
      const viewportH = window.innerHeight;
      // Когда верх секции на уровне центра viewport — start (0).
      // Когда низ секции на уровне центра viewport — end (1).
      const start = rect.top - viewportH / 2;
      const end = rect.bottom - viewportH / 2;
      const total = end - start;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      const passed = -start;
      const p = Math.max(0, Math.min(1, passed / total));
      setProgress(p);
    }

    recalc();
    window.addEventListener("scroll", recalc, { passive: true });
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", recalc);
      window.removeEventListener("resize", recalc);
    };
  }, [ref]);

  return progress;
}

/**
 * Scroll-spy: возвращает индекс эпохи, ближайшей к центру вьюпорта.
 * Передавай массив refs (по индексам эпох).
 */
export function useActiveEra(refs: RefObject<HTMLElement | null>[]): number {
  const [active, setActive] = useState(0);

  useEffect(() => {
    function recalc() {
      const center = window.innerHeight / 2;
      let bestIdx = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      refs.forEach((r, i) => {
        const el = r.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const dist = Math.abs(elCenter - center);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });
      setActive(bestIdx);
    }

    recalc();
    window.addEventListener("scroll", recalc, { passive: true });
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", recalc);
      window.removeEventListener("resize", recalc);
    };
  }, [refs]);

  return active;
}

/**
 * Reveal-on-scroll: добавляет boolean visible когда элемент входит в
 * viewport на threshold-долю.
 */
export function useReveal(
  ref: RefObject<HTMLElement | null>,
  threshold = 0.12,
): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);

  return visible;
}
