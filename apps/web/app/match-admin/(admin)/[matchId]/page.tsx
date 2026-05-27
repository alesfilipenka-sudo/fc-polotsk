import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { sanityFetch } from "@/lib/sanity";
import {
  ADMIN_MATCH_DETAIL_QUERY,
  ADMIN_PLAYERS_QUERY,
} from "@/lib/match-admin-queries";
import { formatShortDate, formatMatchTime } from "@/lib/dateFormat";
import { EventPanel, type EventItem, type PlayerOption } from "./EventPanel";
import { StatusToggle } from "./StatusToggle";
import { FinalizeButton } from "./FinalizeButton";
import { LineupEditor } from "./LineupEditor";

interface TeamRef {
  name?: string;
  short?: string;
  logo?: string;
  isOwn?: boolean;
}

interface AdminLineupEntry {
  _key?: string;
  playerId?: string;
  playerName?: string;
  playerNumber?: number;
  position?: string;
  isStarter?: boolean;
  isCaptain?: boolean;
  positionSlot?: number;
}

interface AdminMatchDetail {
  _id: string;
  date?: string;
  competition?: string;
  tour?: number;
  venue?: string;
  status?: "scheduled" | "live" | "finished";
  hs?: number;
  as?: number;
  currentMinute?: number;
  formation?: string;
  tokenColorHome?: string;
  tokenColorAway?: string;
  home?: TeamRef;
  away?: TeamRef;
  events?: EventItem[];
  lineupHome?: AdminLineupEntry[];
  lineupAway?: AdminLineupEntry[];
}

interface PageProps {
  params: Promise<{ matchId: string }>;
}

export const revalidate = 0;

function TeamSide({ team }: { team?: TeamRef }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {team?.logo ? (
        <img src={team.logo} alt="" className="h-6 w-6 object-contain shrink-0" />
      ) : team?.isOwn ? (
        <img src="/logo.png" alt="" className="h-6 w-6 object-contain shrink-0" />
      ) : null}
      <span
        className={`font-display text-sm md:text-base truncate ${
          team?.isOwn ? "text-polotsk-700 font-bold" : "text-slate-700"
        }`}
      >
        {team?.name ?? "?"}
      </span>
    </div>
  );
}

export default async function EventPanelPage({ params }: PageProps) {
  const { matchId } = await params;

  const [match, players] = await Promise.all([
    sanityFetch<AdminMatchDetail | null>(ADMIN_MATCH_DETAIL_QUERY, { matchId }, 0),
    sanityFetch<PlayerOption[]>(ADMIN_PLAYERS_QUERY, {}, 60),
  ]);

  if (!match) notFound();
  const m = match as AdminMatchDetail;

  const polotskIs: "home" | "away" | null = m.home?.isOwn
    ? "home"
    : m.away?.isOwn
    ? "away"
    : null;

  const goalsCount = (m.events ?? []).filter((e) => e.type === "goal").length;

  return (
    <div className="space-y-4">
      <Link
        href="/match-admin"
        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-polotsk-500"
      >
        <ChevronLeft className="h-4 w-4" />
        Все матчи
      </Link>

      {/* Sticky score */}
      <div className="sticky top-[60px] z-30 -mx-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:top-[64px]">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[10px] uppercase tracking-eyebrow text-slate-500">
            {m.date ? formatShortDate(m.date) : "—"}
            {m.date ? ` · ${formatMatchTime(m.date)}` : ""}
            {m.competition ? ` · ${m.competition}` : ""}
            {m.tour ? ` · Тур ${m.tour}` : ""}
          </div>
          <StatusToggle matchId={m._id} status={m.status} />
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <TeamSide team={m.home} />
          <div className="flex items-center gap-2 font-display text-2xl md:text-3xl tabular-nums text-slate-900">
            <span>{m.hs ?? 0}</span>
            <span className="text-slate-300">:</span>
            <span>{m.as ?? 0}</span>
          </div>
          <div className="flex justify-end">
            <TeamSide team={m.away} />
          </div>
        </div>
        {m.status === "live" && m.currentMinute != null && (
          <p className="mt-1 text-center text-[10px] uppercase tracking-eyebrow text-red-500">
            🔴 LIVE · {m.currentMinute}&prime;
          </p>
        )}
      </div>

      {m.status !== "finished" && (
        <LineupEditor
          matchId={m._id}
          homeName={m.home?.name}
          awayName={m.away?.name}
          polotskIs={polotskIs}
          players={players ?? []}
          initialHome={m.lineupHome ?? []}
          initialAway={m.lineupAway ?? []}
          initialFormation={m.formation}
          initialColorHome={m.tokenColorHome}
          initialColorAway={m.tokenColorAway}
        />
      )}

      {/* Event panel (forms + log) */}
      {m.status !== "finished" ? (
        <>
          <EventPanel
            matchId={m._id}
            homeName={m.home?.name}
            awayName={m.away?.name}
            polotskIs={polotskIs}
            players={players ?? []}
            events={m.events ?? []}
          />
          {m.status === "live" && (
            <FinalizeButton matchId={m._id} goalsCount={goalsCount} />
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Матч завершён — события только для просмотра. Если нужно что-то править — иди в Sanity Studio.
        </div>
      )}
    </div>
  );
}
