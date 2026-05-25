/**
 * Match-display window helpers.
 *
 * После финального свистка карточка результата держится 48 часов в Hero рядом
 * со следующим матчем. После окна Hero показывает только следующий матч.
 *
 * В Results-секции "грядущий" матч прибит сверху списка всегда — пока есть
 * запланированный документ с датой в будущем.
 */

export const POST_MATCH_WINDOW_HOURS = 48;

export type MatchDisplayMode =
  | "scheduled"
  | "post_match"
  | "post_match_no_next"
  | "no_match";

export interface MinimalMatch {
  finishedAt?: string | null;
  date?: string | null;
}

/**
 * Решение о том, что показывать в Hero/MatchCenter в данный момент.
 *
 * Если матч завершён менее `POST_MATCH_WINDOW_HOURS` часов назад — пост-матч
 * блок виден параллельно со следующим матчем. Если следующего нет — только
 * пост-матч блок. Иначе — обычное «следующий матч».
 */
export function getMatchDisplayMode(
  nextMatch: MinimalMatch | null | undefined,
  lastMatch: MinimalMatch | null | undefined,
  now: Date = new Date(),
): MatchDisplayMode {
  const finishedAt = lastMatch?.finishedAt ?? lastMatch?.date ?? null;
  let inWindow = false;
  if (finishedAt) {
    const elapsedMs = now.getTime() - new Date(finishedAt).getTime();
    inWindow =
      elapsedMs >= 0 && elapsedMs < POST_MATCH_WINDOW_HOURS * 3600 * 1000;
  }

  if (inWindow && nextMatch) return "post_match";
  if (inWindow && !nextMatch) return "post_match_no_next";
  if (nextMatch) return "scheduled";
  return "no_match";
}

/**
 * W/L/D с точки зрения ФК Полоцк. Возвращает null если счёт не задан или
 * Полоцк не участвует в матче (не должно происходить, но защищаемся).
 */
export function getPolotskResult(match: {
  home?: { isOwn?: boolean } | null;
  away?: { isOwn?: boolean } | null;
  hs?: number | null;
  as?: number | null;
}): "W" | "L" | "D" | null {
  if (match.hs == null || match.as == null) return null;
  const polotskHome = match.home?.isOwn;
  const polotskAway = match.away?.isOwn;
  if (!polotskHome && !polotskAway) return null;
  const our = polotskHome ? match.hs : match.as;
  const their = polotskHome ? match.as : match.hs;
  if (our > their) return "W";
  if (our < their) return "L";
  return "D";
}
