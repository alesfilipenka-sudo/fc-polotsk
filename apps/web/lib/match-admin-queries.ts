/**
 * GROQ-запросы для match-admin интерфейса.
 *
 * НЕ используются на публичных страницах — здесь нужны все статусы
 * (включая live и draft) и без CDN-кеша.
 */

/**
 * Список матчей для главной админки. Сортировка ниже на клиенте:
 * сначала live, потом scheduled по дате (ближайший сверху), потом
 * последние finished. Берём широкое окно — последний месяц + всё будущее.
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
 * Один матч с полными данными для EventPanel. Тащим события + игроков
 * Полоцка для селекта.
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
  }
}`;

/**
 * Список игроков Полоцка для player-select в формах. Кешируется на сервере.
 */
export const ADMIN_PLAYERS_QUERY = `*[_type == "player" && pos != "COACH"] | order(num asc){
  _id,
  name,
  num,
  pos
}`;
