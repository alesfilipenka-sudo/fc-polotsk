import type {
  PlayerContribution,
  PlayerStats,
} from "@/components/player/types";

/**
 * Плоский матч из MATCHES_FOR_STATS_QUERY. Уже с raw _ref, без деrefа.
 * Держим типы узкими — только те поля что реально нужны для агрегации.
 */
export interface FlatMatch {
  _id: string;
  date: string;
  competition?: string;
  finishedAt?: string;
  hs?: number;
  as?: number;
  home: {
    name: string;
    short: string;
    isOwn?: boolean;
    logo?: string;
  };
  away: {
    name: string;
    short: string;
    isOwn?: boolean;
    logo?: string;
  };
  events?: Array<{
    type?: "goal" | "yellow" | "red" | "sub";
    playerRef?: string;
    assistRef?: string;
    ownGoal?: boolean;
  }>;
  lineupHomeRefs?: (string | null | undefined)[];
  lineupAwayRefs?: (string | null | undefined)[];
}

/**
 * Считает статистику игрока по массиву finished-матчей.
 *
 * Считается на сервере, не в GROQ — так проще типизировать и не спотыкаться
 * на нюансах count()+фильтров в GROQ (см. коммит "переезд на client-side").
 *
 * Голы: events[type=goal, playerRef=playerId, !ownGoal].
 * Ассисты: events[type=goal, assistRef=playerId].
 * Жёлтые/красные: events[type=yellow|red, playerRef=playerId].
 * Матчи: matches где playerId в lineupHomeRefs или lineupAwayRefs.
 * Contributions: топ-5 недавних матчей где игрок отметился (голы+ассисты > 0).
 */
export function computePlayerStats(
  matches: FlatMatch[],
  playerId: string,
): PlayerStats {
  let goals = 0;
  let assists = 0;
  let yellows = 0;
  let reds = 0;
  let matchesPlayed = 0;
  const contributions: PlayerContribution[] = [];

  for (const m of matches) {
    const inLineup =
      (m.lineupHomeRefs ?? []).includes(playerId) ||
      (m.lineupAwayRefs ?? []).includes(playerId);

    // Матч считается сыгранным если игрок в lineup ИЛИ он засветился в events
    // (на случай если lineup не заполнили, а голы отметили).
    let touchedMatch = inLineup;

    let mGoals = 0;
    let mAssists = 0;

    for (const e of m.events ?? []) {
      if (!e.type) continue;

      if (e.playerRef === playerId) {
        touchedMatch = true;
        if (e.type === "goal" && !e.ownGoal) {
          goals++;
          mGoals++;
        } else if (e.type === "yellow") {
          yellows++;
        } else if (e.type === "red") {
          reds++;
        }
      }

      if (e.type === "goal" && e.assistRef === playerId) {
        touchedMatch = true;
        assists++;
        mAssists++;
      }
    }

    if (touchedMatch) matchesPlayed++;

    if (mGoals + mAssists > 0) {
      contributions.push({
        _id: m._id,
        date: m.date,
        competition: m.competition,
        hs: m.hs,
        as: m.as,
        home: m.home,
        away: m.away,
        goals: mGoals,
        assists: mAssists,
      });
    }
  }

  // Матчи уже отсортированы desc по finishedAt/date в GROQ, но обрежем на 5.
  return {
    goals,
    assists,
    yellows,
    reds,
    matchesPlayed,
    contributions: contributions.slice(0, 5),
  };
}
