/**
 * GROQ-запросы для match-admin интерфейса.
 *
 * НЕ используются на публичных страницах — здесь нужны все статусы
 * (включая live и draft) и без CDN-кеша.
 */

export const ADMIN_MATCH_LIST_QUERY = `*[_type == "match"] | order(date desc){
  _id,
  date,
  competition,
  tour,
  status,
  hs,
  "as": as,
  currentMinute,
  "home": home->{name, short, "logo": logo.asset->url, isOwn},
  "away": away->{name, short, "logo": logo.asset->url, isOwn}
}`;

/**
 * Один матч с полными данными для EventPanel + LineupEditor + StatsEditor.
 */
export const ADMIN_MATCH_DETAIL_QUERY = `*[_type == "match" && _id == $matchId][0]{
  _id,
  date,
  competition,
  tour,
  venue,
  status,
  hs,
  "as": as,
  currentMinute,
  formation,
  tokenColorHome,
  tokenColorAway,
  stats,
  "home": home->{name, short, "logo": logo.asset->url, isOwn},
  "away": away->{name, short, "logo": logo.asset->url, isOwn},
  "events": events[]{
    _key,
    type,
    minute,
    forTeam,
    ownGoal,
    "playerRef": player._ref,
    "playerName": coalesce(player->name, playerName),
    "assistRef": assist._ref,
    "assistName": coalesce(assist->name, assistName)
  },
  "lineupHome": lineupHome[]{
    _key,
    isStarter,
    isCaptain,
    positionSlot,
    "playerId": player->_id,
    "playerName": coalesce(player->name, playerName),
    "playerNumber": coalesce(player->num, playerNumber),
    "position": coalesce(player->pos, position)
  },
  "lineupAway": lineupAway[]{
    _key,
    isStarter,
    isCaptain,
    positionSlot,
    "playerId": player->_id,
    "playerName": coalesce(player->name, playerName),
    "playerNumber": coalesce(player->num, playerNumber),
    "position": coalesce(player->pos, position)
  }
}`;

export const ADMIN_PLAYERS_QUERY = `*[_type == "player" && pos != "COACH"] | order(num asc){
  _id,
  name,
  num,
  pos
}`;
