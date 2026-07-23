"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SectionHeader } from "../SectionHeader";
import { POS_FILTERS, POS_LABEL } from "@/lib/constants";
import type { Player, Position } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TeamClientProps {
  squad: Player[];
}

// Normalize pos value from CMS — uppercase + trim, since admins
// sometimes paste lowercase or with stray whitespace.
function normPos(p: unknown): Position | null {
  if (typeof p !== "string") return null;
  const v = p.trim().toUpperCase();
  return v === "GK" || v === "DF" || v === "MF" || v === "FW" || v === "COACH"
    ? (v as Position)
    : null;
}

/**
 * Внутренняя карточка игрока. Рендерит визуал (фото + бейджи + имя + номер).
 * Не имеет собственной обёртки — обёртывается либо в <Link> (если у игрока
 * есть slug) либо в <div> (fallback).
 */
function PlayerCardVisual({ p, idx }: { p: Player; idx: number }) {
  const hasPhoto = !!p.photoUrl;
  const badgeClass = hasPhoto
    ? "bg-polotsk-500/90 text-white"
    : "bg-white/15 text-white";
  return (
    <div
      className="group animate-fade-in-up"
      style={{ animationDelay: `${idx * 40}ms` }}
    >
      <div
        className="ph-jersey relative aspect-[3/4] overflow-hidden rounded-2xl"
        style={
          hasPhoto
            ? {
                backgroundImage: `url(${p.photoUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
              }
            : undefined
        }
      >
        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm",
            badgeClass,
          )}
        >
          {p.country}
        </span>
        {p.pos !== "COACH" && (
          <span
            className={cn(
              "absolute right-3 top-3 inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm",
              badgeClass,
            )}
          >
            {p.pos}
          </span>
        )}
        {p.num != null && (
          <span
            className="absolute -bottom-2 right-2 select-none font-display tabular-nums text-white/15"
            style={{ fontSize: "8rem", lineHeight: "1" }}
          >
            {p.num}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-polotsk-700 via-polotsk-500/80 to-transparent p-4 text-xs text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
          Возраст: {p.age}
          {p.slug && (
            <span className="ml-2 font-semibold uppercase tracking-eyebrow text-white/90">
              · Подробнее →
            </span>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-eyebrow text-slate-400">
            {POS_LABEL[p.pos]}
          </p>
          <p className="truncate font-display text-lg leading-tight text-slate-900 transition group-hover:text-polotsk-500">
            {p.name}
          </p>
        </div>
        {p.num != null && (
          <span className="font-display text-3xl tabular-nums text-polotsk-500">
            {p.num}
          </span>
        )}
      </div>
    </div>
  );
}

export function TeamClient({ squad }: TeamClientProps) {
  const [filter, setFilter] = useState<"ALL" | Position>("ALL");

  const normalized = useMemo(() => {
    const seen = new Set<string>();
    const out: Player[] = [];
    for (const p of squad) {
      const key =
        ((p as { _id?: string })._id as string) ?? `${p.num}-${p.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const pos = normPos(p.pos);
      if (!pos) continue;
      out.push({ ...p, pos });
    }
    return out.sort((a, b) => {
      const aIsCoach = a.pos === "COACH";
      const bIsCoach = b.pos === "COACH";
      if (aIsCoach && !bIsCoach) return 1;
      if (!aIsCoach && bIsCoach) return -1;
      const an = a.num ?? 999;
      const bn = b.num ?? 999;
      return an - bn;
    });
  }, [squad]);

  const filtered = useMemo(
    () =>
      filter === "ALL"
        ? normalized
        : normalized.filter((p) => p.pos === filter),
    [filter, normalized],
  );

  const counts = useMemo(() => {
    const acc: Record<string, number> = { ALL: normalized.length };
    for (const p of normalized) acc[p.pos] = (acc[p.pos] ?? 0) + 1;
    return acc;
  }, [normalized]);

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
          {filtered.map((p, idx) => {
            const key =
              ((p as { _id?: string })._id as string) ??
              `${p.num}-${p.name}-${idx}`;
            // Если у игрока есть slug — карточка кликабельна и ведёт на /player/[slug]
            if (p.slug) {
              return (
                <Link
                  key={key}
                  href={`/player/${p.slug}`}
                  className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-polotsk-500 focus-visible:ring-offset-2"
                >
                  <PlayerCardVisual p={p} idx={idx} />
                </Link>
              );
            }
            // Без slug (старые записи) — не кликабельно
            return (
              <article key={key}>
                <PlayerCardVisual p={p} idx={idx} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
