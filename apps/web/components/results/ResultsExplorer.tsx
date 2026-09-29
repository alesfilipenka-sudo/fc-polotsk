"use client";

import { useMemo, useState } from "react";
import { formatShortDate } from "@/lib/dateFormat";
import {
  competitionLabel,
  seasonLabel,
  type CompetitionAware,
} from "@/lib/competition-label";
import { ExpandableMatch, type ExpandableMatchData } from "../ExpandableMatch";
import { AwardedBadge } from "../AwardedBadge";

interface TeamRef {
  name?: string;
  short?: string;
  logo?: string;
  isOwn?: boolean;
}

export interface ResultMatch extends ExpandableMatchData, CompetitionAware {
  _id: string;
  date: string;
  tour?: number;
  awarded?: boolean;
  hs?: number;
  as?: number;
  home?: TeamRef;
  away?: TeamRef;
}

const VENUES = [
  { id: "all", label: "Все" },
  { id: "home", label: "Дом" },
  { id: "away", label: "Гости" },
] as const;

type Venue = (typeof VENUES)[number]["id"];

const ALL = "__all__";

function resultMark(m: ResultMatch): "W" | "L" | "D" | null {
  if (m.hs == null || m.as == null) return null;
  const ourHome = m.home?.isOwn;
  const our = ourHome ? m.hs : m.as;
  const their = ourHome ? m.as : m.hs;
  if (our > their) return "W";
  if (our < their) return "L";
  return "D";
}

/** Ключ сезона — год: он же лежит в документе и не зависит от подписи. */
function seasonKey(m: ResultMatch): string {
  return m.season?.year != null ? String(m.season.year) : "";
}

function tournamentKey(m: ResultMatch): string {
  return m.tournament?.name ?? m.competition ?? "";
}

/**
 * Архив результатов с фильтрами.
 *
 * Фильтры считаются по данным, а не по захардкоженному списку турниров:
 * заведёшь в CMS новый турнир или сезон — он появится здесь сам.
 */
export function ResultsExplorer({ matches }: { matches: ResultMatch[] }) {
  const seasons = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of matches) {
      const key = seasonKey(m);
      if (!key) continue;
      if (!map.has(key)) map.set(key, seasonLabel(m) || key);
    }
    return [...map.entries()].sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [matches]);

  // По умолчанию — текущий сезон, а не всё сразу: чаще всего нужен он.
  const defaultSeason =
    matches.find((m) => m.season?.isCurrent && seasonKey(m))?.season?.year ??
    (seasons.length > 0 ? Number(seasons[0][0]) : null);

  const [season, setSeason] = useState<string>(
    defaultSeason != null ? String(defaultSeason) : ALL,
  );
  const [tournament, setTournament] = useState<string>(ALL);
  const [venue, setVenue] = useState<Venue>("all");

  // Список турниров зависит от выбранного сезона: в 2026-м кубка могло не быть.
  const tournaments = useMemo(() => {
    const inSeason =
      season === ALL ? matches : matches.filter((m) => seasonKey(m) === season);
    return [...new Set(inSeason.map(tournamentKey).filter(Boolean))].sort();
  }, [matches, season]);

  const visible = useMemo(() => {
    return matches.filter((m) => {
      if (season !== ALL && seasonKey(m) !== season) return false;
      if (tournament !== ALL && tournamentKey(m) !== tournament) return false;
      if (venue === "home" && !m.home?.isOwn) return false;
      if (venue === "away" && !m.away?.isOwn) return false;
      return true;
    });
  }, [matches, season, tournament, venue]);

  const tally = useMemo(() => {
    let w = 0;
    let d = 0;
    let l = 0;
    let gf = 0;
    let ga = 0;
    for (const m of visible) {
      const r = resultMark(m);
      if (!r || m.hs == null || m.as == null) continue;
      const ourHome = m.home?.isOwn;
      gf += ourHome ? m.hs : m.as;
      ga += ourHome ? m.as : m.hs;
      if (r === "W") w++;
      else if (r === "D") d++;
      else l++;
    }
    return { w, d, l, gf, ga, played: w + d + l };
  }, [visible]);

  const selectClass =
    "rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-polotsk-300";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {seasons.length > 1 && (
          <select
            value={season}
            onChange={(e) => {
              setSeason(e.target.value);
              setTournament(ALL);
            }}
            className={selectClass}
            aria-label="Сезон"
          >
            <option value={ALL}>Все сезоны</option>
            {seasons.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        )}

        {tournaments.length > 1 && (
          <select
            value={tournament}
            onChange={(e) => setTournament(e.target.value)}
            className={selectClass}
            aria-label="Турнир"
          >
            <option value={ALL}>Все турниры</option>
            {tournaments.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}

        <div className="flex gap-2">
          {VENUES.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVenue(v.id)}
              aria-pressed={venue === v.id}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                venue === v.id
                  ? "bg-polotsk-500 text-white"
                  : "border border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {tally.played > 0 && (
        <p className="mt-4 text-xs text-slate-500">
          {tally.played}{" "}
          {tally.played % 10 === 1 && tally.played % 100 !== 11
            ? "матч"
            : "матчей"}{" "}
          · {tally.w}–{tally.d}–{tally.l} · мячи {tally.gf}:{tally.ga}
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="hidden grid-cols-12 gap-4 border-b border-slate-200 px-6 py-3 text-[10px] uppercase tracking-eyebrow text-slate-400 md:grid">
          <span className="col-span-2">Дата</span>
          <span className="col-span-3">Турнир</span>
          <span className="col-span-5">Матч</span>
          <span className="col-span-1 text-center">Счёт</span>
          <span className="col-span-1 text-right">Итог</span>
        </div>

        {visible.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            Матчей по этим условиям нет.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((m) => {
              const r = resultMark(m);
              const badge =
                r === "W"
                  ? "bg-polotsk-500 text-white"
                  : r === "L"
                    ? "bg-red-400 text-white"
                    : r === "D"
                      ? "bg-slate-400 text-white"
                      : "border border-slate-200 text-slate-400";
              const letter =
                r === "W" ? "В" : r === "L" ? "П" : r === "D" ? "Н" : "—";
              return (
                <li key={m._id}>
                  <ExpandableMatch match={m} tone="light">
                    <div className="text-sm md:grid md:grid-cols-12 md:items-center md:gap-4">
                      <p className="text-slate-400 md:col-span-2">
                        {formatShortDate(m.date)}
                      </p>
                      <p className="mt-0.5 truncate text-slate-500 md:col-span-3 md:mt-0">
                        {competitionLabel(m)}
                      </p>
                      <div className="mt-1 flex items-center gap-2 md:col-span-5 md:mt-0">
                        <p className="truncate text-slate-800">
                          {m.home?.name ?? "?"} — {m.away?.name ?? "?"}
                        </p>
                        {m.awarded && <AwardedBadge />}
                      </div>
                      <p className="mt-1 font-display text-xl tabular-nums text-ink md:col-span-1 md:mt-0 md:text-center">
                        {m.hs}:{m.as}
                      </p>
                      <span className="mt-2 inline-flex md:col-span-1 md:mt-0 md:flex md:justify-end">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${badge}`}
                        >
                          {letter}
                        </span>
                      </span>
                    </div>
                  </ExpandableMatch>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
