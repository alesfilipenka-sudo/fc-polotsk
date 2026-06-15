import { sanityFetch } from "./sanity";
import { SOCIALS_QUERY } from "./queries";
import { SITE } from "./constants";

export interface SocialUrls {
  instagram: string;
  telegram: string;
  vk: string;
  youtube: string;
}

interface RawSocialChannel {
  id?: string;
  url?: string;
}

/**
 * Возвращает URL'ы соцсетей клуба для использования в Header и Footer.
 * Источник истины — документы socialChannel в Sanity (те же что рендерит
 * большая секция «Соцсети» на главной).
 *
 * Если для какой-то платформы в Sanity нет документа или url не задан —
 * используется fallback из SITE.social в constants.ts.
 *
 * Кешируется на 5 минут (revalidate=300).
 */
export async function getSocialUrls(): Promise<SocialUrls> {
  const channels =
    (await sanityFetch<RawSocialChannel[]>(SOCIALS_QUERY, {}, 300)) ?? [];

  const urls: SocialUrls = {
    instagram: SITE.social.instagram,
    telegram: SITE.social.telegram,
    vk: SITE.social.vk,
    youtube: SITE.social.youtube,
  };

  for (const c of channels) {
    const key = (c.id ?? "").toLowerCase();
    if (!c.url) continue;
    if (key === "instagram") urls.instagram = c.url;
    else if (key === "telegram") urls.telegram = c.url;
    else if (key === "vk") urls.vk = c.url;
    else if (key === "youtube") urls.youtube = c.url;
  }

  return urls;
}
