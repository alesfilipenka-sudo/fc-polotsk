/**
 * GROQ queries for FC Polotsk landing page.
 *
 * Each query is colocated with the section that uses it. Shapes are designed
 * to match the existing TS types in lib/types.ts so the section components
 * need minimal refactoring.
 */

// ─── Site settings (singleton) ─────────────────────────────────────────────
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
  establishedYear,
  "nextMatch": nextMatch->{
    _id,
    date,
    competition,
    tour,
    venue,
    status,
    hs,
    "as": as,
    "home": home->{name, short, "logo": logo.asset->url, isOwn},
    "away": away->{name, short, "logo": logo.asset->url, isOwn}
  }
}`;

// ─── Players (whole squad) ─────────────────────────────────────────────────
export const SQUAD_QUERY = `*[_type == "player"] | order(num asc){
  _id,
  num,
  name,
  pos,
  age,
  country,
  "photoUrl": photo.asset->url
}`;

// ─── News (latest 6) ───────────────────────────────────────────────────────
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

// ─── Recent results (last 4 finished matches) ──────────────────────────────
export const RECENT_MATCHES_QUERY = `*[_type == "match" && status == "finished"] | order(date desc)[0...4]{
  _id,
  date,
  competition,
  hs,
  "as": as,
  "home": home->{name, short, isOwn},
  "away": away->{name, short, isOwn}
}`;

// ─── All results (for Results section) ─────────────────────────────────────
export const RESULTS_QUERY = `*[_type == "match" && status == "finished"] | order(date desc){
  _id,
  date,
  competition,
  hs,
  "as": as,
  "home": home->{name, short, isOwn},
  "away": away->{name, short, isOwn}
}`;

// ─── Standings (singleton with rows) ───────────────────────────────────────
export const STANDINGS_QUERY = `*[_id == "standingsTable"][0]{
  season,
  updatedAt,
  rows[]{
    pos,
    mp,
    pts,
    "team": team->{name, short, isOwn}
  }
}`;

// ─── Social channels ───────────────────────────────────────────────────────
export const SOCIALS_QUERY = `*[_type == "socialChannel"] | order(order asc){
  _id,
  id,
  label,
  handle,
  url,
  followers,
  accent
}`;
