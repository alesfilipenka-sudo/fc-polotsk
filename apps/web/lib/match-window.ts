/**
 * Окно матчевого дня для доступа в Match Admin.
 *
 * Логин разрешён, если:
 *   - есть матч со status="live" (играется прямо сейчас), ИЛИ
 *   - есть scheduled-матч, до начала которого осталось <= PRE_MATCH_HOURS,
 *     ИЛИ который закончился не позже чем POST_MATCH_HOURS назад.
 *
 * В non-production окружении (`NODE_ENV !== "production"`) проверка
 * отключена — удобно тестировать локально без живого матча в CMS.
 */

import { sanityClient } from "./sanity";

export const PRE_MATCH_HOURS = 2;
export const POST_MATCH_HOURS = 3;

interface MatchWindowResult {
  ok: boolean;
  /** ISO-дата ближайшего матча — для понятного сообщения пользователю. */
  nextMatchAt?: string;
}

const WINDOW_QUERY = `{
  "live": *[_type == "match" && status == "live"][0]._id,
  "nearest": *[_type == "match" && status == "scheduled" && date >= $minDate && date <= $maxDate] | order(date asc)[0]{ date },
  "upcoming": *[_type == "match" && status == "scheduled" && date > now()] | order(date asc)[0]{ date }
}`;

interface WindowQueryResult {
  live?: string | null;
  nearest?: { date?: string } | null;
  upcoming?: { date?: string } | null;
}

/**
 * Проверяет, попадаем ли мы сейчас в окно матчевого дня. Если нет —
 * возвращает дату следующего матча, чтобы UI мог подсказать «приходи позже».
 */
export async function checkMatchWindow(): Promise<MatchWindowResult> {
  if (process.env.NODE_ENV !== "production") {
    return { ok: true };
  }
  if (!sanityClient) {
    // Sanity не сконфигурён — нет данных, чтобы проверить. Не блочим вход.
    return { ok: true };
  }

  const now = new Date();
  const minDate = new Date(now.getTime() - POST_MATCH_HOURS * 3600 * 1000);
  const maxDate = new Date(now.getTime() + PRE_MATCH_HOURS * 3600 * 1000);

  try {
    const data = await sanityClient.fetch<WindowQueryResult>(
      WINDOW_QUERY,
      {
        minDate: minDate.toISOString(),
        maxDate: maxDate.toISOString(),
      },
      { cache: "no-store" },
    );

    if (data.live) return { ok: true };
    if (data.nearest?.date) return { ok: true };

    return { ok: false, nextMatchAt: data.upcoming?.date ?? undefined };
  } catch {
    // На ошибке Sanity — не блочим вход, чтобы оператор не остался без доступа
    // из-за временного даунтайма CDN.
    return { ok: true };
  }
}

/**
 * Форматирует подсказку для пользователя, когда логин будет доступен.
 */
export function formatNextMatchHint(nextMatchAt?: string): string {
  const window = `за ${PRE_MATCH_HOURS}ч до матча и в течение ${POST_MATCH_HOURS}ч после`;
  if (!nextMatchAt) {
    return `Войти можно ${window}. Ближайших матчей в расписании нет.`;
  }
  const when = new Date(nextMatchAt).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Minsk",
  });
  return `Войти можно ${window}. Ближайший матч: ${when}.`;
}
