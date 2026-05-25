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
    "name": player->name
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
    "name": player->name
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
