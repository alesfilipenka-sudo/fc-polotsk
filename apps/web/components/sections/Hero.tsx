import { ArrowRight, MapPin } from "lucide-react";
import { LogoDecor } from "../Logo";
import { Countdown } from "../Countdown";
import { SITE } from "@/lib/constants";
import { sanityFetch } from "@/lib/sanity";
import {
  SITE_SETTINGS_QUERY,
  LAST_FINISHED_MATCH_QUERY,
  NEXT_MATCH_QUERY,
} from "@/lib/queries";
import { formatMatchDate, formatMatchTime, formatShortDate } from "@/lib/dateFormat";
import { getMatchDisplayMode, getPolotskResult } from "@/lib/matchWindow";

interface TeamRef {
  name?: string;
  short?: string;
  logo?: string;
  isOwn?: boolean;
}

interface Scorer {
  minute?: number;
  forTeam?: "home" | "away";
  ownGoal?: boolean;
  name?: string;
}

interface FinishedMatch {
  _id?: string;
  date?: string;
  competition?: string;
  tour?: number;
  finishedAt?: string;
  hs?: number;
  as?: number;
  home?: TeamRef;
  away?: TeamRef;
  scorers?: Scorer[];
}

interface SiteSettings {
  heroBadge?: string;
  heroLine1?: string;
  heroLine2?: string;
  heroSubtitle?: string;
  city?: string;
}

interface NextMatch {
  _id?: string;
  date?: string;
  competition?: string;
  tour?: number;
  venue?: string;
  home?: TeamRef;
  away?: TeamRef;
}

function TeamMini({ team, side }: { team?: TeamRef; side: "home" | "away" }) {
  const name = team?.name ?? (side === "home" ? "Хозяева" : "Гости");
  return (
    <div className="flex items-center gap-2 min-w-0">
      {team?.logo ? (
        <img src={team.logo} alt={name} className="h-7 w-7 object-contain" />
      ) : team?.isOwn ? (
        <img src="/logo.png" alt="ФК Полоцк" className="h-7 w-7 object-contain" />
      ) : (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 font-display text-[10px]">
          {team?.short ?? "?"}
        </span>
      )}
      <span className={`font-display text-sm truncate ${team?.isOwn ? "text-white" : "text-white/70"}`}>
        {name}
      </span>
    </div>
  );
}

function TeamSide({ team, side }: { team?: TeamRef; side: "home" | "away" }) {
  const label = side === "home" ? "Дома" : "Гости";
  const name = team?.name ?? (side === "home" ? "Дома" : "Гости");
  return (
    <div className="flex flex-col items-center gap-2 text-center min-w-0">
      {team?.logo ? (
        <img src={team.logo} alt={name} className="h-10 w-10 object-contain" />
      ) : team?.isOwn ? (
        <img src="/logo.png" alt="ФК Полоцк" className="h-10 w-10 object-contain" />
      ) : (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 font-display text-xs">
          {team?.short ?? "?"}
        </span>
      )}
      <p className="font-display text-sm truncate max-w-full">{name}</p>
      <p className="text-[10px] uppercase tracking-eyebrow text-white/60">{label}</p>
    </div>
  );
}

function PostMatchStrip({ match }: { match: FinishedMatch }) {
  const r = getPolotskResult(match);
  const accent = r === "W" ? "bg-polotsk-300" : r === "L" ? "bg-red-400" : "bg-slate-300";
  const badgeStyles =
    r === "W" ? "bg-polotsk-300 text-polotsk-900" : r === "L" ? "bg-red-400 text-white" : "bg-slate-300 text-ink";
  const label = r === "W" ? "Победа" : r === "L" ? "Поражение" : "Ничья";
  const when = match.finishedAt ?? match.date;
  const scorers = match.scorers ?? [];

  return (
    <div className="relative mb-4 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-md md:p-5">
      <span className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${accent}`} aria-hidden />
      <div className="flex items-center justify-between gap-3 pl-3">
        <span className="text-[10px] uppercase tracking-eyebrow text-white/60">
          Сыгран · {when ? formatShortDate(when) : ""}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeStyles}`}>
          {label}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 pl-3">
        <TeamMini team={match.home} side="home" />
        <div className="flex items-center gap-1.5 shrink-0 font-display text-2xl tabular-nums">
          <span>{match.hs ?? "—"}</span>
          <span className="text-white/40">:</span>
          <span>{match.as ?? "—"}</span>
        </div>
        <div className="flex justify-end">
          <TeamMini team={match.away} side="away" />
        </div>
      </div>
      {scorers.length > 0 && (
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] gap-3 pl-3 text-[11px] text-white/70">
          <div className="flex flex-col gap-0.5">
            {scorers
              .filter((s) => s.forTeam === "home")
              .map((s, i) => (
                <div key={`h-${i}`}>
                  <span aria-hidden>⚽</span> {s.name ?? "?"}
                  {s.minute != null ? ` ${s.minute}'` : ""}
                  {s.ownGoal ? " (а/г)" : ""}
                </div>
              ))}
          </div>
          <div />
          <div className="flex flex-col gap-0.5 text-right">
            {scorers
              .filter((s) => s.forTeam === "away")
              .map((s, i) => (
                <div key={`a-${i}`}>
                  {s.minute != null ? `${s.minute}' ` : ""}
                  {s.name ?? "?"}
                  {s.ownGoal ? " (а/г)" : ""} <span aria-hidden>⚽</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export async function Hero() {
  const [settings, lastMatch, nextMatch] = await Promise.all([
    sanityFetch<SiteSettings | null>(SITE_SETTINGS_QUERY),
    sanityFetch<FinishedMatch | null>(LAST_FINISHED_MATCH_QUERY),
    sanityFetch<NextMatch | null>(NEXT_MATCH_QUERY),
  ]);

  const badge = settings?.heroBadge ?? `Сезон ${SITE.season} · ${SITE.league}`;
  const line1 = settings?.heroLine1 ?? "НОВАЯ";
  const line2 = settings?.heroLine2 ?? "ЭРА";
  const subtitle =
    settings?.heroSubtitle ??
    "ФК Полоцк — клуб с историей и амбициями. Следи за командой, ближайшими матчами и новостями клуба.";
  const city = settings?.city ?? SITE.city;
  const next = nextMatch ?? null;

  const mode = getMatchDisplayMode(next, lastMatch);
  const showPostMatch = mode === "post_match" || mode === "post_match_no_next";
  const showNext = mode === "scheduled" || mode === "post_match";

  return (
    <section id="top" className="stadium-bg relative overflow-hidden text-white">
      <div className="grain pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay" aria-hidden />
      <LogoDecor
        size={420}
        opacity={0.08}
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

            <p className="mt-6 max-w-xl text-base text-white/70 text-balance">{subtitle}</p>

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

          <div className="md:col-span-5">
            {showPostMatch && lastMatch && <PostMatchStrip match={lastMatch} />}

            {showNext && (
              <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-md md:p-7">
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-eyebrow text-white/60">
                  <span>Следующий матч</span>
                  <span className="truncate">{next?.tour ? `Тур ${next.tour}` : ""}</span>
                </div>
                <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
                  <TeamSide team={next?.home} side="home" />
                  <div className="font-display text-2xl tabular-nums text-polotsk-300">VS</div>
                  <TeamSide team={next?.away} side="away" />
                </div>
                <div className="mt-5 grid grid-cols-4 gap-2 border-t border-white/10 pt-5 text-center sm:gap-3">
                  <Countdown targetIso={next?.date} />
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/70">
                  <span>{next?.date ? formatMatchDate(next.d