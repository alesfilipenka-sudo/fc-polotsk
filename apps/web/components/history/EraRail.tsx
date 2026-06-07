"use client";

import { getTone } from "@/lib/history-tones";
import type { HistoryEra } from "./types";

interface EraRailProps {
  eras: HistoryEra[];
  activeIndex: number;
  onJump: (idx: number) => void;
}

/**
 * Sticky-планка с годами эпох. Клик скроллит к нужной эпохе, активная
 * подсвечивается своим tone-цветом.
 *
 * Горизонтально прокручиваемая на мобиле; на десктопе влезает в один ряд.
 */
export function EraRail({ eras, activeIndex, onJump }: EraRailProps) {
  return (
    <div className="sticky top-16 z-30 -mx-5 border-b border-slate-200 bg-white/95 px-5 backdrop-blur md:top-20 md:-mx-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <ul className="-mx-1 flex gap-1 overflow-x-auto py-3 [scrollbar-width:none] [-ms-overflow-style:none] md:gap-2">
          {eras.map((era, i) => {
            const active = i === activeIndex;
            const tone = getTone(era.tone);
            return (
              <li key={era._id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onJump(i)}
                  className="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition focus:outline-none focus-visible:ring-2 focus-visible:ring-polotsk-300 md:px-4 md:text-[11px]"
                  style={
                    active
                      ? {
                          background: tone.accent,
                          color:
                            tone.tone === "current" || tone.bg === "#003399"
                              ? "white"
                              : "white",
                        }
                      : {
                          background: tone.chip,
                          color: tone.accent,
                        }
                  }
                >
                  {era.year ?? "—"}
                  {era.kicker ? (
                    <span className="ml-2 hidden text-[10px] opacity-80 md:inline">
                      {era.kicker}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
