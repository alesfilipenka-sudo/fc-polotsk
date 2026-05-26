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

export const SQUAD_QUERY = `*[_type == "player"] | order(num asc){
  _id,
  num,
  name,
  pos,
  age,
  country,
  "photoUrl": photo.asset->url
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
 * Не лимитируем, страница сама рисует пагинацию (или просто scroll).
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
 * body[] разворачивает asset для imageBlock (фото внутри текста).
 */
export const ARTICLE_QUERY = `*[_type == "news" && slug.current == $slug][0]{
  _id,
  title,
  subtitle,
  tag,
  "slug": slug.current,
  date,
  readTime,
  body[]{
    ...,
    _type == "imageBlock" => {
      ...,
      "url": asset->url,
      "dimensions": asset->metadata.dimensions
    }
  }
}`;

/**
 * Slugs всех новостей — для generateStaticParams.
 */
export const ALL_NEWS_SLUGS_QUERY = `*[_type == "news" && defined(slug.current)]{
  "slug": slug.current
}`;

/**
 * 3 связанные статьи (исключая текущую). Берём свежие.
 */
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

/**
 * 4 свежих новости для sticky-sidebar статьи.
 */
export const SIDEBAR_NEWS_QUERY = `*[_type == "news" && slug.current != $slug] | order(date desc)[0...4]{
  title,
  "slug": slug.current,
  date
}`;

export const RECENT_MATCHES_QUERY = `*[_type == "match" && status == "finished"] | order(date desc)[0...4]{
  _id,
  date,
  competition,
  hs,
  "as": as,
  "home": home->{name, short, "logo": logo.asset->url, isOwn},
  "away": away->{name, short, "logo": logo.asset->url, isOwn}
}`;

export const RESULTS_QUERY = `*[_type == "match" && status == "finished"] | order(date desc){
  _id,
  date,
  competition,
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
    "name": coalesce(player->name, playerName)
  }
}`;

/**
 * Последний завершённый матч — для 48-часового пост-матч окна в Hero.
 * Берём один документ; на клиенте проверяем (now - finishedAt) < 48h.
 */
export const LAST_FINISHED_MATCH_QUERY = `*[_type == "match" && status == "finished"] | order(coalesce(finishedAt, date) desc)[0]{
  _id,
  date,
  competition,
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
    "name": coalesce(player->name, playerName)
  }
}`;

/**
 * Следующий запланированный матч — берём по дате, без зависимости от
 * ручного выбора в siteSettings.nextMatch. Это позволяет показывать его в
 * Results-секции как «грядущий» сразу, как только админ создал документ.
 */
export const NEXT_MATCH_QUERY = `*[_type == "match" && status == "scheduled" && date > now()] | order(date asc)[0]{
  _id,
  date,
  competition,
  tour,
  venue,
  "home": home->{name, short, "logo": logo.asset->url, isOwn},
  "away": away->{name, short, "logo": logo.asset->url, isOwn}
}`;

/**
 * Live-матч сейчас идущий (status == "live"). Один документ или null.
 *
 * Возвращает всё, что нужно для LiveBlock на главной: счёт, минута,
 * хронологический events[] с именами игроков (или free-text для соперников),
 * формация / цвета фишек / lineups для будущих фаз (Iter 2).
 *
 * Для имени игрока используем coalesce(player->name, playerName) — на случай
 * когда забил/получил карточку соперник, которого нет в нашей базе.
 */
export const LIVE_MATCH_QUERY = `*[_type == "match" && status == "live"] | order(date desc)[0]{
  _id,
  date,
  competition,
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

export const STANDINGS_QUERY = `*[_id == "standingsTable"][0]{
  season,
  updatedAt,
  rows[]{
    pos,
    mp,
    pts,
    "team": team->{name, short, "logo": logo.asset->url, isOwn}
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
