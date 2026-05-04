import { Calendar, Clock, MapPin, ArrowRight, CalendarPlus } from "lucide-react";
import { SectionHeader } from "../SectionHeader";
import { LogoLight } from "../Logo";

export function MatchCenter() {
  return (
    <section id="matches" className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="Матч-центр"
          title={
            <>
              Игры <span className="text-polotsk-500">сезона</span>
            </>
          }
        />

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Next match — 7 cols */}
          <div className="relative overflow-hidden rounded-3xl bg-polotsk-500 p-7 text-white md:p-10 lg:col-span-7">
            <LogoLight
              size={300}
              opacity={0.06}
              className="pointer-events-none absolute -right-12 -bottom-12"
            />
            <div className="relative">
              <div className="flex items-center justify-between text-xs uppercase tracking-eyebrow text-white/70">
                <span>Следующий матч</span>
                <span>Высшая лига</span>
              </div>

              <div className="mt-7 grid grid-cols-3 items-center gap-4">
                <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
                  <LogoLight size={56} />
                  <p className="font-display text-xl md:text-2xl">Полоцк</p>
                  <p className="text-xs uppercase tracking-eyebrow text-white/60">Дома</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-4xl tabular-nums text-polotsk-300 md:text-5xl">VS</p>
                  <p className="mt-2 text-xs uppercase tracking-eyebrow text-white/60">
                    Дата уточняется
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 text-center md:items-end md:text-right">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/20 font-display text-sm">
                    БРЕ
                  </span>
                  <p className="font-display text-xl md:text-2xl">Брест</p>
                  <p className="text-xs uppercase tracking-eyebrow text-white/60">Гости</p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 border-t border-white/10 pt-6 md:grid-cols-3">
                {[
                  { Icon: Calendar, label: "Дата", value: "—" },
                  { Icon: Clock, label: "Начало", value: "—:—" },
                  { Icon: MapPin, label: "Стадион", value: "Стадион «Полоцк»" },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-4 w-4 text-polotsk-300" />
                    <div>
                      <p className="text-[10px] uppercase tracking-eyebrow text-white/60">
                        {label}
                      </p>
                      <p className="text-sm">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#results"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-polotsk-700 transition hover:bg-polotsk-50"
                >
                  Статистика сезона
                  <ArrowRight className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10"
                >
                  <CalendarPlus className="h-4 w-4" />В календарь
                </button>
              </div>
            </div>
          </div>

          {/* Right column — recent + standings preview */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-eyebrow text-slate-500">
                Последние матчи
              </p>
              <ul className="divide-y divide-slate-100">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-center gap-4 py-3">
                    <span className="h-8 w-1 shrink-0 rounded-full bg-slate-200" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] uppercase tracking-eyebrow text-slate-400">
                        — апр
                      </p>
                      <p className="truncate text-sm text-slate-700">vs соперник</p>
                    </div>
                    <span className="font-display text-2xl tabular-nums text-slate-400">
                      —:—
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-ink p-6 text-white">
              <p className="mb-4 text-xs font-semibold uppercase tracking-eyebrow text-white/60">
                Турнирная таблица
              </p>
              <ul className="space-y-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <li
                    key={i}
                    className={`grid grid-cols-12 items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                      i === 3 ? "bg-polotsk-500" : ""
                    }`}
                  >
                    <span className="col-span-1 font-display tabular-nums text-white/80">{i}</span>
                    <span className="col-span-7 truncate">Команда {i}</span>
                    <span className="col-span-2 text-right text-white/60">—</span>
                    <span className="col-span-2 text-right font-display tabular-nums">—</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
