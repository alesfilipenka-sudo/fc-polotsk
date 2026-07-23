import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PlayerHero } from "./PlayerHero";
import { PlayerInfoCard } from "./PlayerInfoCard";
import { PlayerBio } from "./PlayerBio";
import { PlayerCareerTimeline } from "./PlayerCareerTimeline";
import { PlayerGallery } from "./PlayerGallery";
import type { PlayerDetail } from "./types";

interface PlayerPageProps {
  player: PlayerDetail;
}

/**
 * Публичная страница игрока /player/[slug].
 * Layout: Hero (full-width) → 12-column grid (bio + info + gallery + career).
 */
export function PlayerPage({ player }: PlayerPageProps) {
  return (
    <>
      <PlayerHero player={player} />

      <div className="bg-slate-50/30 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Link
            href="/#team"
            className="mb-6 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 transition hover:text-polotsk-500"
          >
            <ChevronLeft className="h-4 w-4" />
            Ко всему составу
          </Link>

          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left: bio + gallery + career */}
            <div className="space-y-10 lg:col-span-8">
              <PlayerBio bioLong={player.bioLong} bio={player.bio} />
              <PlayerCareerTimeline clubs={player.previousClubs} />
              <PlayerGallery items={player.gallery} />
            </div>

            {/* Right: sticky info card */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <PlayerInfoCard player={player} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
