/**
 * Подписи турнира и сезона.
 *
 * Турнир и сезон живут в Sanity справочниками, а не строкой в матче: иначе
 * новый турнир нельзя завести без правки кода. Здесь собираются подписи для
 * показа, с запасным вариантом на старое строковое поле — пока в базе есть
 * матчи, у которых ссылки ещё не проставлены.
 */

export interface TournamentRef {
  name?: string;
  kind?: "league" | "cup";
  crossYearSeason?: boolean;
}

export interface SeasonRef {
  year?: number;
  isCurrent?: boolean;
}

export interface CompetitionAware {
  /** Старое строковое поле. Используется, только если ссылок нет. */
  competition?: string;
  stage?: string;
  tournament?: TournamentRef | null;
  season?: SeasonRef | null;
}

/** Лиговый матч идёт в зачёт сезона; кубковый показывается отдельно. */
export function isLeagueMatch(m?: CompetitionAware | null): boolean {
  if (!m) return false;
  if (m.tournament?.kind) return m.tournament.kind === "league";
  // Запасной путь для матчей без ссылки на турнир.
  return !!m.competition && !/^кубок/i.test(m.competition.trim());
}

/**
 * «Вторая лига · Финальный этап», «Кубок Беларуси · 1/32».
 * Год не включается — он виден по дате матча.
 */
export function competitionLabel(m?: CompetitionAware | null): string {
  if (!m) return "";
  const name = m.tournament?.name;
  if (!name) return m.competition ?? "";
  return m.stage ? `${name} · ${m.stage}` : name;
}

/**
 * Подпись сезона: «2026», а для розыгрышей через зиму — «2026/27».
 * Нужна там, где сезон называется явно: фильтры, заголовки, архив.
 */
export function seasonLabel(m?: CompetitionAware | null): string {
  const year = m?.season?.year;
  if (!year) return "";
  if (!m?.tournament?.crossYearSeason) return String(year);
  return `${year}/${String((year + 1) % 100).padStart(2, "0")}`;
}

/** Полная подпись для заголовков: «Кубок Беларуси 2026/27 · 1/32». */
export function fullCompetitionLabel(m?: CompetitionAware | null): string {
  if (!m) return "";
  const name = m.tournament?.name;
  if (!name) return m.competition ?? "";
  const season = seasonLabel(m);
  const head = season ? `${name} ${season}` : name;
  return m.stage ? `${head} · ${m.stage}` : head;
}
