/**
 * Фаза сезона: играем или межсезонье.
 *
 * Отличить межсезонье от обычной паузы между турами по одним матчам нельзя:
 * и там и там запланированных игр нет. Нужен внешний признак, и он уже есть
 * в CMS — поле «Последний матч» (`endsAt`) у документа сезона. Редактор
 * ставит дату последнего тура, и сайт сам переключается на итоги.
 *
 * Если поле забыли заполнить, работает подстраховка по давности последней
 * игры: пауза между турами столько не длится.
 */

export const OFFSEASON_FALLBACK_DAYS = 21;

export interface SeasonPhaseInput {
  /** Есть ли запланированный матч в будущем. */
  hasNextMatch: boolean;
  /** Дата последнего сыгранного матча, ISO. */
  lastMatchDate?: string | null;
  /** `endsAt` текущего сезона, ISO. */
  seasonEndsAt?: string | null;
  now?: Date;
}

export type SeasonPhase = "active" | "offseason";

export function getSeasonPhase({
  hasNextMatch,
  lastMatchDate,
  seasonEndsAt,
  now = new Date(),
}: SeasonPhaseInput): SeasonPhase {
  // Появился матч в календаре — межсезонье закончилось само, без правок.
  if (hasNextMatch) return "active";

  if (seasonEndsAt) {
    const ends = new Date(seasonEndsAt);
    if (!Number.isNaN(ends.getTime())) {
      return now.getTime() > ends.getTime() ? "offseason" : "active";
    }
  }

  if (lastMatchDate) {
    const last = new Date(lastMatchDate);
    if (!Number.isNaN(last.getTime())) {
      const days = (now.getTime() - last.getTime()) / (24 * 3600 * 1000);
      if (days > OFFSEASON_FALLBACK_DAYS) return "offseason";
    }
  }

  return "active";
}
