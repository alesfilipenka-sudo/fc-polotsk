import { SectionHeader } from "../SectionHeader";

const FILTERS = [
  { id: "all", label: "Все" },
  { id: "home", label: "Дом" },
  { id: "away", label: "Гости" },
];

const STATS = [
  { value: "—", label: "Очки", sub: "за сезон" },
  { value: "—", label: "Победы", sub: "из — матчей" },
  { value: "—", label: "Голы", sub: "забито" },
  { value: "—", label: "Голы", sub: "пропущено" },
];

export function Results() {
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

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="hidden grid-cols-12 gap-4 border-b border-white/10 px-6 py-4 text-[10px] uppercase tracking-eyebrow text-white/40 md:grid">
            <span className="col-span-2">Дата</span>
            <span className="col-span-3">Турнир</span>
            <span className="col-span-4">Матч</span>
            <span className="col-span-2">Счёт</span>
            <span className="col-span-1 text-right">Итог</span>
          </div>
          <ul className="divide-y divide-white/10">
            {[1, 2, 3, 4].map((i) => (
              <li
                key={i}
                className="grid grid-cols-12 items-center gap-4 px-6 py-4 text-sm"
              >
                <span className="col-span-12 text-white/60 md:col-span-2">— апр</span>
                <span className="col-span-6 text-white/70 md:col-span-3">Высшая лига</span>
                <span className="col-span-6 truncate md:col-span-4">Полоцк vs соперник</span>
                <span className="col-span-6 font-display text-2xl tabular-nums text-white md:col-span-2">
                  —:—
                </span>
                <span className="col-span-6 flex justify-end md:col-span-1">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-xs font-semibold text-white/60">
                    —
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats strip */}
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-4">
          {STATS.map((s) => (
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
