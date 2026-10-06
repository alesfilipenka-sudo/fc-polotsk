// GROQ queries for FC Polotsk landing page.

export const SITE_SETTINGS_QUERY = `*[_id == "siteSettings"][0]{
  heroBadge,
  heroLine1,
  heroLine2,
  heroSubtitle,
  city,
  phone,
  email,
  address,
  footerDescription,
  establishedYear
}`;

export const SQUAD_QUERY = `*[_type == "player" && !(isArchived == true)] | order(num asc){
  _id,
  num,
  name,
  pos,
  age,
  country,
  "photoUrl": photo.asset->url,
  "slug": slug.current
}`;

/**
 * Все игроки — для generateStaticParams в /player/[slug].
 */
/**
 * Все игроки со slug — включая архивных.
 *
 * Архивные не показываются в составе, но их страницы нужны: на них ведут
 * авторы голов из архива матчей. Без этого ссылка из протокола прошлого
 * сезона упирается в 404.
 */
export const ALL_PLAYER_SLUGS_QUERY = `*[_type == "player" && defined(slug.current)]{
  "slug": slug.current
}`;

/**
 * Один игрок по slug. Возвращает полные данные для страницы /player/[slug].
 * bioLong разворачивает asset для imageBlock (то же что в новостях).
 */
export const PLAYER_BY_SLUG_QUERY = `*[_type == "player" && slug.current == $slug][0]{
  _id,
  num,
  name,
  pos,
  age,
  country,
  birthDate,
  height,
  weight,
  preferredFoot,
  isArchived,
  "slug": slug.current,
  "photoUrl": photo.asset->url,
  bio,
  bioLong[]{
    ...,
    _type == "imageBlock" => {
      ...,
      "url": asset->url
    }
  },
  "gallery": gallery[]{
    "url": asset->url,
    caption,
    alt
  },
  previousClubs[]{
    clubName,
    from,
    to,
    note
  },
  manualMatches,
  manualGoals,
  manualAssists,
  manualYellows,
  manualReds
}`;

/**
 * Все finished-матчи в плоском виде — для агрегации статистики игрока на сервере.
 *
 * Раньше здесь был PLAYER_STATS_QUERY с count() и вложенными фильтрами по
 * `events[player._ref == $playerId]`, но GROQ такой синтаксис интерпретирует
 * иначе чем можно ожидать: возвращает суммарные подсчёты по всем игрокам,
 * а не по конкретному. Поэтому переехали на fetch + client-side reduce
 * (см. lib/player-stats.ts).
 */
export const MATCHES_FOR_STATS_QUERY = `*[_type == "match" && status == "finished"] | order(coalesce(finishedAt, date) desc){
  _id,
  date,
  competition,
  "stage": stage,
  "tournament": tournament->{name, kind, crossYearSeason},
  "season": season->{year, isCurrent},
  finishedAt,
  hs,
  "as": as,
  "home": home->{name, short, isOwn, "logo": logo.asset->url},
  "away": away->{name, short, isOwn, "logo": logo.asset->url},
  "events": events[]{
    type,
    "playerRef": player._ref,
    "assistRef": assist._ref,
    ownGoal
  },
  "lineupHomeRefs": lineupHome[].player._ref,
  "lineupAwayRefs": lineupAway[].player._ref
}`;

export const NEWS_QUERY = `*[_type == "news"] | order(date desc)[0...6]{
  _id,
  title,
  "slug": slug.current,
  date,
  tag,
  excerpt,
  placeholderClass,
  "imageUrl": coverImage.asset->url
}`;

/**
 * Все новости — для индексной страницы /news.
 */
export const ALL_NEWS_QUERY = `*[_type == "news"] | order(date desc){
  _id,
  title,
  "slug": slug.current,
  date,
  tag,
  excerpt,
  placeholderClass,
  "imageUrl": coverImage.asset->url
}`;

/**
 * Полная статья по slug. Для /news/[slug].
 */
export const ARTICLE_QUERY = `*[_type == "news" && slug.current == $slug][0]{
  _id,
  title,
  subtitle,
  tag,
  "slug": slug.current,
  date,
  readTime,
  "coverImageUrl": coverImage.asset->url,
  body[]{
    ...,
    _type == "imageBlock" => {
      ...,
      "url": asset->url,
      "dimensions": asset->metadata.dimensions
    }
  }
}`;

export const ALL_NEWS_SLUGS_QUERY = `*[_type == "news" && defined(slug.current)]{
  "slug": slug.current
}`;

export const RELATED_NEWS_QUERY = `*[_type == "news" && slug.current != $slug] | order(date desc)[0...3]{
  _id,
  title,
  "slug": slug.current,
  date,
  tag,
  excerpt,
  placeholderClass,
  "imageUrl": coverImage.asset->url
}`;

export const SIDEBAR_NEWS_QUERY = `*[_type == "news" && slug.current != $slug] | order(date desc)[0...4]{
  title,
  "slug": slug.current,
  date
}`;

export const RECENT_MATCHES_QUERY = `*[_type == "match" && status == "finished"] | order(date desc)[0...4]{
  _id,
  date,
  competition,
  "stage": stage,
  "tournament": tournament->{name, kind, crossYearSeason},
  "season": season->{year, isCurrent},
  awarded,
  awardedReason,
  hs,
  "as": as,
  "home": home->{name, short, "logo": logo.asset->url, isOwn},
  "away": away->{name, short, "logo": logo.asset->url, isOwn},
  "scorers": scorers[]{
    minute,
    forTeam,
    ownGoal,
    "name": coalesce(player->name, playerName),
    "slug": player->slug.current
  },
  "cards": events[type == "yellow" || type == "red"]{
    type,
    minute,
    forTeam,
    "name": coalesce(player->name, playerName),
    "slug": player->slug.current
  }
}`;

export const RESULTS_QUERY = `*[_type == "match" && status == "finished"] | order(date desc){
  _id,
  date,
  competition,
  "stage": stage,
  "tournament": tournament->{name, kind, crossYearSeason},
  "season": season->{year, isCurrent},
  awarded,
  awardedReason,
  tour,
  finishedAt,
  hs,
  "as": as,
  "home": home->{name, short, "logo": logo.asset->url, isOwn},
  "away": away->{name, short, "logo": logo.asset->url, isOwn},
  "scorers": scorers[]{
    minute,
    forTeam,
    ownGoal,
    "name": coalesce(player->name, playerName),
    "slug": player->slug.current
  },
  "cards": events[type == "yellow" || type == "red"]{
    type,
    minute,
    forTeam,
    "name": coalesce(player->name, playerName),
    "slug": player->slug.current
  }
}`;

export const LAST_FINISHED_MATCH_QUERY = `*[_type == "match" && status == "finished"] | order(coalesce(finishedAt, date) desc)[0]{
  _id,
  date,
  competition,
  "stage": stage,
  "tournament": tournament->{name, kind, crossYearSeason},
  "season": season->{year, isCurrent},
  awarded,
  awardedReason,
  tour,
  finishedAt,
  hs,
  "as": as,
  "home": home->{name, short, "logo": logo.asset->url, isOwn},
  "away": away->{name, short, "logo": logo.asset->url, isOwn},
  "scorers": scorers[]{
    minute,
    forTeam,
    ownGoal,
    "name": coalesce(player->name, playerName),
    "slug": player->slug.current
  },
  "cards": events[type == "yellow" || type == "red"]{
    type,
    minute,
    forTeam,
    "name": coalesce(player->name, playerName),
    "slug": player->slug.current
  }
}`;

export const NEXT_MATCH_QUERY = `*[_type == "match" && status == "scheduled" && date > now()] | order(date asc)[0]{
  _id,
  date,
  competition,
  "stage": stage,
  "tournament": tournament->{name, kind, crossYearSeason},
  "season": season->{year, isCurrent},
  tour,
  venue,
  "home": home->{name, short, "logo": logo.asset->url, isOwn},
  "away": away->{name, short, "logo": logo.asset->url, isOwn}
}`;

/**
 * Live-матч сейчас идущий (status == "live"). Один документ или null.
 */
export const LIVE_MATCH_QUERY = `*[_type == "match" && status == "live"] | order(date desc)[0]{
  _id,
  date,
  competition,
  "stage": stage,
  "tournament": tournament->{name, kind, crossYearSeason},
  "season": season->{year, isCurrent},
  tour,
  venue,
  currentMinute,
  hs,
  "as": as,
  formation,
  tokenColorHome,
  tokenColorAway,
  "home": home->{name, short, "logo": logo.asset->url, isOwn},
  "away": away->{name, short, "logo": logo.asset->url, isOwn},
  "events": events[]{
    type,
    minute,
    forTeam,
    ownGoal,
    "name": coalesce(player->name, playerName),
    "assistName": coalesce(assist->name, assistName),
    "playerOffName": coalesce(playerOff->name, playerOffName)
  },
  "lineupHome": lineupHome[]{
    isStarter,
    isCaptain,
    positionSlot,
    "playerId": player->_id,
    "name": coalesce(player->name, playerName),
    "number": coalesce(player->num, playerNumber),
    "position": coalesce(player->pos, position)
  },
  "lineupAway": lineupAway[]{
    isStarter,
    isCaptain,
    positionSlot,
    "playerId": player->_id,
    "name": coalesce(player->name, playerName),
    "number": coalesce(player->num, playerNumber),
    "position": coalesce(player->pos, position)
  },
  stats
}`;

/**
 * Все турнирные таблицы — по одной на этап, в порядке табов.
 * Матч-центр показывает их переключателем.
 */
export const STANDINGS_QUERY = `*[_type == "standingsTable"] | order(order asc, _createdAt asc){
  _id,
  season,
  stage,
  isFinal,
  totalMatches,
  updatedAt,
  rows[]{
    pos,
    mp,
    w,
    d,
    l,
    gf,
    ga,
    pts,
    "team": team->{name, short, "logo": logo.asset->url, isOwn}
  }
}`;

/**
 * Строка ФК Полоцк из турнирной таблицы + метаданные таблицы.
 *
 * Используется блоком статистики на главной. Считать очки суммой матчей
 * нельзя: в базе лежат и кубковые игры, и лиговые могут быть заведены
 * не полностью — так на сайте и появились «28 очков из 13 матчей»
 * вместо реальных 31 из 12.
 */
export const OWN_STANDING_QUERY = `*[_type == "standingsTable" && seasonStats == true] | order(order asc)[0]{
  season,
  stage,
  isFinal,
  totalMatches,
  updatedAt,
  "rows": rows[]{
    pos,
    mp,
    w,
    d,
    l,
    gf,
    ga,
    pts,
    "isOwn": team->isOwn
  }
}`;

/**
 * Сезоны: текущий и ближайший будущий.
 *
 * `endsAt` текущего — признак межсезонья (см. lib/season-state.ts).
 * `startsAt` будущего — цель обратного отсчёта на карточке итогов.
 */
export const SEASONS_QUERY = `{
  "current": *[_type == "season" && isCurrent == true][0]{ year, startsAt, endsAt },
  "upcoming": *[_type == "season" && isCurrent != true && defined(startsAt) && startsAt > now()] | order(startsAt asc)[0]{ year, startsAt }
}`;

/**
 * Последняя по порядку турнирная таблица — то есть этап, которым сезон
 * закончился. Используется карточкой межсезонья.
 */
export const LAST_STAGE_STANDING_QUERY = `*[_type == "standingsTable"] | order(order desc, _createdAt desc)[0]{
  stage,
  totalMatches,
  "rows": rows[]{
    pos, mp, w, d, l, gf, ga, pts,
    "isOwn": team->isOwn
  }
}`;

/** Авторы голов за текущий сезон — для «лучшего бомбардира». */
export const SEASON_SCORERS_QUERY = `*[_type == "match" && status == "finished" && season->isCurrent == true]{
  "goals": scorers[]{
    ownGoal,
    "name": player->name,
    "slug": player->slug.current
  }
}`;

export const SOCIALS_QUERY = `*[_type == "socialChannel"] | order(order asc){
  _id,
  id,
  label,
  handle,
  url,
  followers,
  accent
}`;

/**
 * История клуба — все эпохи в хронологическом порядке.
 */
export const HISTORY_QUERY = `*[_type == "historyEra"] | order(order asc){
  _id,
  eraId,
  year,
  range,
  tone,
  kicker,
  name,
  lead,
  body,
  "photo": photo.asset->url,
  "photoAlt": photo.caption,
  facts[]{ icon, t, d }
}`;
