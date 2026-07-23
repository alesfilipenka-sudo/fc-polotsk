import { LogoDecor } from "../Logo";
import { POS_LABEL } from "@/lib/constants";
import type { PlayerDetail } from "./types";
import { computeAge } from "./types";

interface PlayerHeroProps {
  player: PlayerDetail;
}

export function PlayerHero({ player }: PlayerHeroProps) {
  const age = computeAge(player);
  const posLabel = POS_LABEL[player.pos];

  return (
    <section className="stadium-bg relative overflow-hidden text-white">
      <div
        className="grain pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
        aria-hidden
      />
      <LogoDecor
        size={420}
        opacity={0.06}
        className="pointer-events-none absolute right-[-80px] top-[-40px] hidden md:block"
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-28 md:px-8 md:pb-20 md:pt-32">
        <div className="grid items-stretch gap-8 md:grid-cols-12 md:gap-10">
          {/* Left: text */}
          <div className="flex flex-col justify-end md:col-span-7">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-polotsk-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                {posLabel}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                {player.country}
              </span>
              {player.isArchived && (
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
                  Бывший игрок
                </span>
              )}
            </div>

            <h1 className="font-display text-[10vw] leading-[0.9] md:text-[6.5rem]">
              {player.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-baseline gap-6 text-white/80">
              {player.num != null && (
                <div>
                  <p className="text-[10px] uppercase tracking-eyebrow text-white/50">
                    Номер
                  </p>
                  <p className="font-display text-4xl tabular-nums text-white md:text-5xl">
                    {player.num}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-eyebrow text-white/50">
                  Возраст
                </p>
                <p className="font-display text-4xl tabular-nums text-white md:text-5xl">
                  {age}
                </p>
              </div>
            </div>
          </div>

          {/* Right: photo — растягивается по высоте текстового блока слева.
              На мобилке даём явную высоту, чтобы не схлопнулось. */}
          <div className="md:col-span-5">
            <div
              className="ph-jersey relative h-[420px] overflow-hidden rounded-3xl md:h-full md:min-h-[420px]"
              style={
                player.photoUrl
                  ? {
                      backgroundImage: `url(${player.photoUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center top",
                    }
                  : undefined
              }
            >
              {player.num != null && (
                <span
                  className="absolute -bottom-4 right-2 select-none font-display tabular-nums text-white/15"
                  style={{ fontSize: "12rem", lineHeight: "1" }}
                >
                  {player.num}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
