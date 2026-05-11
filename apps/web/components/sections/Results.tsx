import { SectionHeader } from "../SectionHeader";
import { sanityFetch } from "@/lib/sanity";
import { RESULTS_QUERY } from "@/lib/queries";

interface TeamRef {
  name?: string;
  short?: string;
  isOwn?: boolean;
}
interface MatchDoc {
  _id: string;
  date: string;
  competition?: string;
  hs?: number;
  as?: number;
  home?: TeamRef;
  away?: TeamRef;
}

const FILTERS = [
  { id: "all", label: "Все" },
  { id: "home", label: "Дом" },
  { id: "away", label: "Гости" },
];

function resultMark(m: MatchDoc): "W" | "L" | "D" | null {
  if (m.hs == null || m.as == null) return null;
  const polotskHome = m.home?.isOwn;
  const our = polotskHome ? m.hs : m.as;
  const their = polotskHome ? m.as : m.hs;
  if (our > their) return "W";
  if (our < their) return "L";
  return "D";
}

export async function Results() {
  const matches = (await sanityFetch<MatchDoc[]>(RESULTS_QUERY)) ?? [];

  // Compute stats
  const stats = matches.reduce(
    (acc, m) => {
      const r = resultMark(m);
      if (r === "W") acc.wins++;
      if (m.hs != null && m.as != null) {
        const polotskHome = m.home?.isOwn;
        acc.goalsFor += polotskHome ? m.hs : m.as;
        acc.goalsAgainst += polotskHome ? m.as : m.hs;
      }
      acc.points += r === "W" ? 3 : r === "D" ? 1 : 0;
      return acc;
    },
    { wins: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  );

  const hasMatches = matches.length > 0;
  const rows = hasMatches
    ? matches
    : (Array.from({ length: 4 }, () => null) as null[]);

  return (
    <section id="results" className="bg-ink py-14 text-white md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="Архив сезона"
          title="Результаты"
          dark
          action={
            <div className="flex gap-2">
              {FILTERS.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                    i === 0
                      ? "bg-polotsk-500 text-white"
                      : "border border-white/15 text-white/70 hover:bg-white/5"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          }
        />

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="hidden grid-cols-12 gap-4 border-b border-white/10 px-6 py-4 text-[10px] uppercase tracking-eyebrow text-white/40 md:grid">
            <span className="col-span-2">Дата</span>
            <span className="col-span-3">Турнир</span>
            <span className="col-span-4">Матч</span>
            <span className="col-span-2">Счёт</span>
            <span className="col-span-1 text-right">Итог</span>
          </div>
          <ul className="divide-y divide-white/10">
            {rows.map((m, i) => {
              if (!m) {
                return (
                  <li
                    key={`ph-${i}`}
                    className="grid grid-cols-12 items-center gap-4 px-6 py-4 text-sm"
                  >
                    <span className="col-span-12 text-white/60 md:col-span-2">
                      — апр
                    </span>
                    <span className="col-span-6 text-white/70 md:col-span-3">
                      Высшая лига
                    </span>
                    <span className="col-span-6 truncate md:col-span-4">
                      Полоцк vs соперник
                    </span>
                    <span className="col-span-6 font-display text-2xl tabular-nums text-white md:col-span-2">
                      —:—
                    </span>
                    <span className="col-span-6 flex justify-end md:col-span-1">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-xs font-semibold text-white/60">
                        —
                      </span>
                    </span>
                  </li>
                );
              }
              const r = resultMark(m);
              const polotskHome = m.home?.isOwn;
              const opp = polotskHome ? m.away : m.home;
              const badge =
                r === "W" ? "bg-polotsk-500 text-white"
                : r === "L" ? "bg-red-400 text-white"
                : r === "D" ? "bg-slate-500 text-white"
                : "border border-white/15 text-white/60";
              const letter = r === "W" ? "П" : r === "L" ? "П" : r === "D" ? "Н" : "—";
              return (
                <li
                  key={m._id}
                  className="grid grid-cols-12 items-center gap-4 px-6 py-4 text-sm"
                >
                  <span className="col-span-12 text-white/60 md:col-span-2">
                    {new Date(m.date).toLocaleDateString("ru-RU", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                  <span className="col-span-6 text-white/70 md:col-span-3">
                    {m.competition ?? "Высшая лига"}
                  </span>
                  <span className="col-span-6 truncate md:col-span-4">
                    {polotskHome ? "Полоцк" : opp?.name ?? "?"} —{" "}
                    {polotskHome ? opp?.name ?? "?" : "Полоцк"}
                  </span>
                  <span className="col-span-6 font-display text-2xl tabular-nums text-white md:col-span-2">
                    {m.hs}:{m.as}
                  </span>
                  <span className="col-span-6 flex justify-end md:col-span-1">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${badge}`}
                    >
                      {letter}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-4">
          {[
            {
              value: hasMatches ? stats.points : "—",
              label: "Очки",
              sub: "за сезон",
            },
            {
              value: hasMatches ? `${stats.wins}` : "—",
              label: "Победы",
              sub: hasMatches ? `из ${matches.length} матчей` : "из — матчей",
            },
            {
              value: hasMatches ? stats.goalsFor : "—",
              label: "Голы",
              sub: "забито",
            },
            {
              value: hasMatches ? stats.goalsAgainst : "—",
              label: "Голы",
              sub: "пропущено",
            },
          ].map((s) => (
            <div key={s.label + s.sub} className="bg-ink p-6 text-center">
              <p className="font-display text-5xl tabular-nums text-polotsk-300 md:text-6xl">
                {s.value}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-eyebrow text-white">
                {s.label}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-eyebrow text-white/40">
                {s.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
