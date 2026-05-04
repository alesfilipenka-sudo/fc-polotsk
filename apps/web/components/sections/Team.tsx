"use client";

import { useMemo, useState } from "react";
import { SectionHeader } from "../SectionHeader";
import { POS_FILTERS, POS_LABEL } from "@/lib/constants";
import type { Player, Position } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Placeholder squad — replaced by Sanity GROQ fetch in Phase 3.
 */
const PLACEHOLDER_SQUAD: Player[] = [
  { num: 1, name: "Игрок один", pos: "GK", age: 28, country: "BLR" },
  { num: 2, name: "Игрок два", pos: "DF", age: 24, country: "BLR" },
  { num: 5, name: "Игрок пять", pos: "DF", age: 26, country: "BLR" },
  { num: 8, name: "Игрок восемь", pos: "MF", age: 22, country: "BLR" },
  { num: 10, name: "Игрок десять", pos: "MF", age: 27, country: "BLR" },
  { num: 17, name: "Игрок семнадцать", pos: "FW", age: 21, country: "BLR" },
  { num: 9, name: "Игрок девять", pos: "FW", age: 25, country: "BLR" },
  { num: 4, name: "Игрок четыре", pos: "DF", age: 30, country: "BLR" },
];

export function Team() {
  const [filter, setFilter] = useState<"ALL" | Position>("ALL");

  const filtered = useMemo(
    () =>
      filter === "ALL"
        ? PLACEHOLDER_SQUAD
        : PLACEHOLDER_SQUAD.filter((p) => p.pos === filter),
    [filter],
  );

  const counts = useMemo(() => {
    const acc: Record<string, number> = { ALL: PLACEHOLDER_SQUAD.length };
    for (const p of PLACEHOLDER_SQUAD) acc[p.pos] = (acc[p.pos] ?? 0) + 1;
    return acc;
  }, []);

  return (
    <section id="team" className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="Состав 2025/26"
          title={
            <>
              Наша <span className="text-polotsk-500">команда</span>
            </>
          }
        />

        <div className="mb-8 flex flex-wrap gap-2">
          {POS_FILTERS.map(({ id, label }) => {
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition",
                  active
                    ? "bg-polotsk-500 text-white shadow-lg shadow-polotsk-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                )}
              >
                {label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px]",
                    active ? "bg-white/20" : "bg-white text-slate-500",
                  )}
                >
                  {counts[id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {filtered.map((p, idx) => (
            <article
              key={p.num}
              className="group animate-fade-in-up"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="ph-jersey relative aspect-[3/4] overflow-hidden rounded-2xl">
                <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  {p.country}
                </span>
                <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  {p.pos}
                </span>
                <span
                  className="absolute -bottom-2 right-2 select-none font-display tabular-nums text-white/15"
                  style={{ fontSize: "8rem", lineHeight: "1" }}
                >
                  {p.num}
                </span>
                <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-polotsk-700 via-polotsk-500/80 to-transparent p-4 text-xs text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                  Возраст: {p.age}
                </div>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-eyebrow text-slate-400">
                    {POS_LABEL[p.pos]}
                  </p>
                  <p className="truncate font-display text-lg leading-tight text-slate-900">
                    {p.name}
                  </p>
                </div>
                <span className="font-display text-3xl tabular-nums text-polotsk-500">
                  {p.num}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
