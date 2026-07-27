/**
 * Хелперы для генерации JSON-LD разметки (schema.org).
 *
 * JSON-LD — невидимый для юзера блок в <head>, который читают:
 *   - Google (для rich snippets и knowledge graph)
 *   - Slack / Telegram / WhatsApp / Twitter (для превью ссылок)
 *   - Facebook / LinkedIn
 *
 * Используем только основные типы: SportsTeam, Person/Athlete, SportsEvent,
 * NewsArticle, WebSite. Больше не нужно — гуглу этого достаточно.
 */

import { SITE } from "./constants";
import type { PlayerDetail } from "@/components/player/types";
import { POS_LABEL } from "./constants";

const CLUB_ID = `${SITE.url}#club`;

/**
 * Главный SportsTeam-объект клуба. Используется на главной и как @id-referent
 * в других schema-объектах (например у игроков в поле memberOf).
 */
export function buildSportsTeamSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    "@id": CLUB_ID,
    name: SITE.name,
    alternateName: "ФК Полоцк",
    url: SITE.url,
    sport: "Football",
    foundingDate: "2019-01-01",
    location: {
      "@type": "Place",
      name: "Полоцк, Беларусь",
      address: {
        "@type": "PostalAddress",
        addressCountry: "BY",
        addressLocality: "Полоцк",
      },
    },
    logo: `${SITE.url}/logo.png`,
    image: `${SITE.url}/logo.png`,
  };
}

/**
 * WebSite-объект для главной (даёт Google possibility to show sitelinks
 * search box) — не критично, но nice-to-have.
 */
export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}#website`,
    name: SITE.name,
    url: SITE.url,
    inLanguage: "ru",
    publisher: { "@id": CLUB_ID },
  };
}

/**
 * Athlete-объект для страницы игрока. Person + доп поля (memberOf, jerseyNumber).
 */
export function buildAthleteSchema(player: PlayerDetail): object {
  const posLabel = POS_LABEL[player.pos] ?? player.pos;
  // Google лучше распознаёт одиночный @type. Использовать массив ["Person","Athlete"]
  // рискованно — тест обнаружения может пропустить схему. Person + доп поля
  // (jobTitle, memberOf) достаточно для клубного сайта.
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.name,
    url: `${SITE.url}/player/${player.slug}`,
    ...(player.photoUrl && { image: player.photoUrl }),
    nationality: {
      "@type": "Country",
      name: player.country,
    },
    ...(player.birthDate && { birthDate: player.birthDate }),
    ...(player.height && { height: `${player.height} cm` }),
    ...(player.weight && { weight: `${player.weight} kg` }),
    jobTitle: `${posLabel}, футболист`,
    ...(player.num != null && { identifier: String(player.num) }),
    worksFor: { "@id": CLUB_ID },
    memberOf: { "@id": CLUB_ID },
  };
}

/**
 * NewsArticle-объект для страницы новости.
 */
interface NewsArticleInput {
  title: string;
  slug: string;
  date: string;
  excerpt?: string;
  imageUrl?: string;
}

export function buildNewsArticleSchema(article: NewsArticleInput): object {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    url: `${SITE.url}/news/${article.slug}`,
    datePublished: article.date,
    dateModified: article.date,
    ...(article.excerpt && { description: article.excerpt }),
    ...(article.imageUrl && { image: [article.imageUrl] }),
    publisher: { "@id": CLUB_ID },
    inLanguage: "ru",
  };
}

/**
 * Обёртка для встраивания schema в JSX. Возвращает <script> тег
 * с типом application/ld+json.
 *
 * Использование:
 *   <StructuredData data={buildAthleteSchema(player)} />
 */
export function serializeSchema(data: object | object[]): string {
  return JSON.stringify(data);
}
