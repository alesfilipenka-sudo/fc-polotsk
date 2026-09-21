"use client";

import { useState } from "react";

interface TeamRef {
  name?: string;
  short?: string;
  logo?: string;
  isOwn?: boolean;
}

export interface StandingsRow {
  pos: number;
  mp: number;
  pts: number;
  team?: TeamRef;
}

export interface StandingsTable {
  _id: string;
  season?: string;
  stage?: string;
  isFinal?: boolean;
  rows?: StandingsRow[];
}

/**
 * Турнирная таблица с переключением между этапами.
 *
 * Таблиц в CMS может быть несколько — по документу на этап (региональный,
 * финальный). Порядок табов задаёт поле `order` в Sanity, сюда они приходят
 * уже отсортированными. При одной таблице переключатель не рисуется.
 *
 * По умолчанию открыт последний таб — это текущий этап.
 */
export function StandingsTabs({ tables }: { tables: StandingsTable[] }) {
  const [active, setActive] = useState(Math.max(0, tables.length - 1));
  const table = tables[active];
  const rows = table?.rows ?? [];

  return (
    <div className="rounded-2xl bg-ink p-6 text-white">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-eyebrow text-white/60">
          Турнирная таблица
        </p>
        {tables.length > 1 && (
          <div className="flex gap-1 rounded-full bg-white/5 p-1">
            {tables.map((t, i) => (
              <button
                key={t._id}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-polotsk-300 ${
                  i === active
                    ? "bg-polotsk-500 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                {t.stage ?? `Этап ${i + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      <ul className="space-y-1">
        {(rows.length > 0
          ? rows
          : (Array.from({ length: 5 }, () => null) as null[])
        ).map((row, i) => {
          if (!row) {
            return (
              <li
                key={`ph-s-${i}`}
                className="grid grid-cols-12 items-center gap-3 rounded-lg px-3 py-2 text-sm"
              >
                <span className="col-span-1 font-display tabular-nums text-white/80">
                  {i + 1}
                </span>
                <span className="col-span-7 truncate">Команда {i + 1}</span>
                <span className="col-span-2 text-right text-white/60">—</span>
                <span className="col-span-2 text-right font-display tabular-nums">
                  —
                </span>
              </li>
            );
          }
          return (
            <li
              key={`s-${row.pos}-${row.team?.name ?? "x"}`}
              className={`grid grid-cols-12 items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                row.team?.isOwn ? "bg-polotsk-500" : ""
              }`}
            >
              <span className="col-span-1 font-display tabular-nums text-white/80">
                {row.pos}
              </span>
              <span className="col-span-2 flex items-center justify-center">
                {row.team?.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.team.logo}
                    alt=""
                    className="h-5 w-5 object-contain"
                  />
                ) : null}
              </span>
              <span className="col-span-5 truncate">
                {row.team?.name ?? "—"}
              </span>
              <span className="col-span-2 text-right text-white/60">
                {row.mp}
              </span>
              <span className="col-span-2 text-right font-display tabular-nums">
                {row.pts}
              </span>
            </li>
          );
        })}
      </ul>

      {table?.isFinal && (
        <p className="mt-3 text-[10px] uppercase tracking-eyebrow text-white/35">
          Этап завершён
        </p>
      )}
    </div>
  );
}
