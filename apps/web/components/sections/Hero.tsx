import { ArrowRight, MapPin } from "lucide-react";
import { LogoLight } from "../Logo";
import { SITE } from "@/lib/constants";
import { sanityFetch } from "@/lib/sanity";
import { SITE_SETTINGS_QUERY } from "@/lib/queries";

interface SiteSettings {
  heroBadge?: string;
  heroLine1?: string;
  heroLine2?: string;
  heroSubtitle?: string;
  city?: string;
  nextMatch?: {
    tour?: number;
    home?: { name?: string; short?: string; isOwn?: boolean };
    away?: { name?: string; short?: string; isOwn?: boolean };
    date?: string;
  } | null;
}

export async function Hero() {
  const settings = await sanityFetch<SiteSettings | null>(
    SITE_SETTINGS_QUERY,
  ).catch(() => null);

  const badge = settings?.heroBadge ?? `Сезон ${SITE.season} · ${SITE.league}`;
  const line1 = settings?.heroLine1 ?? "НОВАЯ";
  const line2 = settings?.heroLine2 ?? "ЭРА";
  const subtitle =
    settings?.heroSubtitle ??
    "ФК Полоцк — клуб с историей и амбициями. Следи за командой, ближайшими матчами и новостями клуба.";
  const city = settings?.city ?? SITE.city;
  const next = settings?.nextMatch;

  return (
    <section
      id="top"
      className="stadium-bg relative overflow-hidden text-white"
    >
      <div
        className="grain pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
        aria-hidden
      />
      <LogoLight
        size={420}
        opacity={0.05}
        className="pointer-events-none absolute right-[-60px] top-1/2 hidden -translate-y-1/2 md:block"
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-32">
        <div className="grid items-end gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium tracking-wide">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-polotsk-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-polotsk-300" />
              </span>
              {badge}
            </span>

            <p className="mt-5 inline-flex items-center gap-2 text-sm text-white/70">
              <MapPin className="h-4 w-4" />
              {city}
            </p>

            <h1 className="mt-6 font-display text-[16vw] leading-[0.85] md:text-[8.5rem]">
              {line1}
              <br />
              <span className="text-polotsk-300">{line2}</span>
            </h1>

            <p className="mt-6 max-w-xl text-base text-white/70 text-balance">
              {subtitle}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#matches"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-polotsk-700 transition hover:bg-polotsk-50"
              >
                Ближайший матч
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#team"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10"
              >
                Состав
              </a>
            </div>
          </div>

          {/* Glass card */}
          <div className="md:col-span-5">
            <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-md md:p-7">
              <div className="flex items-center justify-between text-xs uppercase tracking-eyebrow text-white/60">
                <span>Следующий матч</span>
                <span>{next?.tour ? `Тур ${next.tour}` : "—"}</span>
              </div>
              <div className="mt-5 grid grid-cols-3 items-center gap-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <LogoLight size={40} />
                  <p className="font-display text-sm">
                    {next?.home?.isOwn ? "Полоцк" : (next?.home?.name ?? "Полоцк")}
                  </p>
                </div>
                <div className="font-display text-2xl tabular-nums text-polotsk-300">
                  VS
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 font-display text-xs">
                    {next?.away?.short ?? "БРЕ"}
                  </span>
                  <p className="font-display text-sm">
                    {next?.away?.name ?? "Брест"}
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-3 border-t border-white/10 pt-5 text-center">
                {["Дней", "Часов", "Минут", "Секунд"].map((label) => (
                  <div key={label}>
                    <p className="font-display text-3xl tabular-nums text-white">
                      --
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-eyebrow text-white/60">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/70">
                <span>
                  {next?.date
                    ? new Date(next.date).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "long",
                      })
                    : "Дата уточняется"}
                </span>
                <span>
                  {next?.date
                    ? new Date(next.date).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—:—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
