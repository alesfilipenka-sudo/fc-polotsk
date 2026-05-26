/**
 * Типы LiveBlock. Все поля опциональны — данные приходят из Sanity, где
 * админ мог что-то не заполнить, а сайт должен графически деградировать.
 */

export interface LiveTeamRef {
  name?: string;
  short?: string;
  logo?: string;
  isOwn?: boolean;
}

export type LiveEventType = "goal" | "yellow" | "red" | "sub";

export interface LiveEvent {
  type?: LiveEventType;
  minute?: number;
  forTeam?: "home" | "away";
  ownGoal?: boolean;
  name?: string;          // основной игрок
  assistName?: string;    // только для goal
  playerOffName?: string; // только для sub
}

export interface LineupEntry {
  playerId?: string;
  name?: string;
  number?: number;
  position?: string;
  isStarter?: boolean;
  isCaptain?: boolean;
  positionSlot?: number;
}

export interface MatchStats {
  shotsHome?: number;
  shotsAway?: number;
  shotsOnGoalHome?: number;
  shotsOnGoalAway?: number;
  possessionHome?: number;
  possessionAway?: number;
  cornersHome?: number;
  cornersAway?: number;
  offsidesHome?: number;
  offsidesAway?: number;
}

export interface LiveMatch {
  _id: string;
  date?: string;
  competition?: string;
  tour?: number;
  venue?: string;
  currentMinute?: number;
  hs?: number;
  as?: number;
  formation?: string;
  tokenColorHome?: string;
  tokenColorAway?: string;
  home?: LiveTeamRef;
  away?: LiveTeamRef;
  events?: LiveEvent[];
  lineupHome?: LineupEntry[];
  lineupAway?: LineupEntry[];
  stats?: MatchStats;
}
