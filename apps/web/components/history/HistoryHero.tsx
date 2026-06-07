import { LogoDecor } from "../Logo";

/**
 * Hero страницы /history — крупный заголовок, краткое описание, отбивка.
 */
export function HistoryHero() {
  return (
    <section className="stadium-bg relative overflow-hidden text-white">
      <div
        className="grain pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
        aria-hidden
      />
      <LogoDecor
        size={420}
        opacity={0.08}
        className="pointer-events-none absolute right-[-60px] top-1/2 hidden -translate-y-1/2 md:block"
      />
      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-32">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium tracking-wide">
          <span className="h-2 w-2 rounded-full bg-polotsk-300" />
          1905 — наши дни
        </span>

        <h1 className="mt-6 font-display text-[13vw] leading-[0.88] md:text-[6.5rem]">
          120 лет<br />
          <span className="text-polotsk-300">полоцкого футбола</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base text-white/75 md:text-lg">
          От первого мяча на плацу кадетского корпуса до профессионального клуба
          наших дней. Семь эпох, через которые прошёл футбол в Полоцке.
        </p>
      </div>
    </section>
  );
}
