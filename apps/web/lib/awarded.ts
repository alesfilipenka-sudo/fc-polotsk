/**
 * Присуждённые результаты (технические победы и поражения).
 *
 * Матч не игрался, но счёт идёт в таблицу. Цифры счёта не трогаем — по
 * регламенту ФИФА это 3:0 — а статус выносим отдельной меткой и поясняем
 * текстом там, где обычно лежит лента событий. Иначе матч выглядит как
 * обычная победа, у которой почему-то нет авторов голов.
 */

export type AwardedReason =
  | "opponent-no-show"
  | "own-no-show"
  | "opponent-withdrawn"
  | "other";

interface TeamLike {
  name?: string;
  isOwn?: boolean;
}

export interface AwardedMatchLike {
  awarded?: boolean;
  awardedReason?: string;
  hs?: number;
  as?: number;
  home?: TeamLike;
  away?: TeamLike;
}

export function isAwarded(m?: AwardedMatchLike | null): boolean {
  return !!m?.awarded;
}

/** Имя соперника в этом матче — тот, кто не ФК Полоцк. */
function opponentName(m: AwardedMatchLike): string {
  if (m.home?.isOwn) return m.away?.name ?? "соперник";
  if (m.away?.isOwn) return m.home?.name ?? "соперник";
  return "соперник";
}

function scoreLabel(m: AwardedMatchLike): string | null {
  if (m.hs == null || m.as == null) return null;
  return `${m.hs}:${m.as}`;
}

/**
 * Пояснение для карточки матча. null — если результат не присуждён.
 */
export function awardedText(m?: AwardedMatchLike | null): string | null {
  if (!isAwarded(m) || !m) return null;

  const score = scoreLabel(m);
  const withScore = (base: string) =>
    score ? `${base} Результат — ${score}.` : base;

  switch (m.awardedReason as AwardedReason) {
    case "own-no-show":
      return withScore("Матч не состоялся: команда не прибыла на игру.");
    case "opponent-withdrawn":
      return withScore(`Матч не состоялся: «${opponentName(m)}» снят с турнира.`);
    case "other":
      return withScore("Результат матча присуждён решением федерации.");
    case "opponent-no-show":
    default:
      return withScore(
        `Матч не состоялся: «${opponentName(m)}» не прибыл на игру.`,
      );
  }
}

/** Короткая подпись под бейджем, если нужна. */
export function awardedShortLabel(m?: AwardedMatchLike | null): string {
  return isAwarded(m) ? "Техническая победа" : "";
}
