"use client";

import { useRef, forwardRef, type ForwardedRef } from "react";
import { EraCard } from "./EraCard";
import { useReveal } from "./hooks";
import { getTone } from "@/lib/history-tones";
import type { HistoryEra } from "./types";

interface EraNodeProps {
  era: HistoryEra;
  index: number;
}

/**
 * Один узел таймлайна: круглый маркер с годом, карточка слева/справа,
 * фото в противоположной колонке. На мобиле — стопкой (карточка → фото).
 */
function EraNodeInner(
  { era, index }: EraNodeProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const tone = getTone(era.tone);
  const isLeft = index % 2 === 0; // 0,2,4… → карточка слева
  const innerRef = useRef<HTMLDivElement>(null);
  const revealed = useReveal(innerRef, 0.12);

  // Sepia-фильтр для самой старой эпохи
  const photoFilter =
    era.tone === "sepia" ? "sepia(0.28) contrast(1.02)" : undefined;

  return (
    <div ref={ref} data-era-id={era.eraId} className="relative">
      <div
        ref={innerRef}
        className={`grid gap-6 transition-all duration-700 md:grid-cols-2 md:gap-10 ${
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Year-маркер по центру (только md+) */}
        <div className="pointer-events-none absolute left-1/2 top-0 z-10 hidden -translate-x-1/2 md:block">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white text-sm font-bold tabular-nums shadow-lg"
            style={{
              background: tone.node,
              color: tone.bg === "#003399" ? "#001f5c" : "white",
            }}
          >
            {era.year ?? ""}
          </div>
        </div>

        {/* Карточка */}
        <div
          className={`${
            isLeft
              ? "md:col-start-1 md:pr-12"
              : "md:col-start-2 md:row-start-1 md:pl-12"
          }`}
        >
          <EraCard era={era} />
        </div>

        {/* Фото в противоположной колонке */}
        <div
          className={`${
            isLeft
              ? "md:col-start-2 md:row-start-1 md:pl-12"
              : "md:col-start-1 md:row-start-1 md:pr-12"
          } flex items-center`}
        >
          {era.photo ? (
            <figure className="w-full">
              <div
                className="overflow-hidden rounded-2xl shadow-md"
                style={{ background: tone.chip }}
              >
                <img
                  src={era.photo}
                  alt={era.photoAlt ?? era.name ?? ""}
                  loading="lazy"
                  decoding="async"
                  className="block aspect-[4/3] w-full object-cover"
                  style={{ filter: photoFilter }}
                />
              </div>
              {era.photoAlt && (
                <figcaption
                  className="mt-2 text-xs italic"
                  style={{ color: tone.label, opacity: 0.7 }}
                >
                  {era.photoAlt}
                </figcaption>
              )}
            </figure>
          ) : (
            <div
              className="aspect-[4/3] w-full rounded-2xl"
              style={{ background: tone.chip }}
              aria-hidden
            />
          )}
        </div>

        {/* Year-маркер мобильный (над карточкой) */}
        <div className="md:hidden">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tabular-nums"
            style={{ background: tone.node, color: "white" }}
          >
            {era.year ?? ""}
            {era.range ? (
              <span className="text-[10px] opacity-80">· {era.range}</span>
            ) : null}
          </span>
        </div>
      </div>
    </div>
  );
}

export const EraNode = forwardRef<HTMLDivElement, EraNodeProps>(EraNodeInner);
