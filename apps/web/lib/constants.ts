import type { NavItem, Position } from "./types";

export const SITE = {
  name: "ФК Полоцк",
  shortName: "FC Polotsk",
  tagline: "Football Club · Est. 2019",
  league: "Вторая лига",
  season: "2026",
  city: "Полоцк, Беларусь",
  url: "https://fcpolotsk.by",
  /**
   * Ссылки на соцсети клуба. Использует Header (use-client) и Footer.
   * Если позже захочется управлять через CMS — переключим на siteSettings.
   */
  social: {
    instagram: "https://instagram.com/fcpolotsk",
    telegram: "https://t.me/fcpolotsk",
    vk: "https://vk.com/fcpolotsk",
    youtube: "https://youtube.com/@fcpolotsk",
  },
} as const;

/**
 * Турниры.
 *
 * Матч считается лиговым, если его `competition` начинается с LEAGUE_PREFIX.
 * Всё остальное — кубки: они не идут в зачёт таблицы и выносятся на сайте
 * отдельной строкой, а не смешиваются с очками за сезон.
 */
export const LEAGUE = {
  /** Префикс поля `competition` у лиговых матчей. */
  prefix: "Вторая лига",
  /** Как называется стадия в подписях на сайте. */
  stageLabel: "Витебский дивизион",
  /** Команд в региональном этапе. */
  teams: 7,
  /** Матчей у каждой команды за этап (2 круга по 6 соперников). */
  matches: 12,
} as const;

/** Максимум очков за региональный этап. */
export const LEAGUE_MAX_POINTS = LEAGUE.matches * 3;

/** Матч из лиги, а не из кубка. */
export function isLeagueCompetition(competition?: string): boolean {
  return !!competition && competition.startsWith(LEAGUE.prefix);
}

/**
 * Разбирает "Кубок Беларуси 1/32" на название и стадию.
 * Стадией считается последний токен вида 1/32, 1/2, «финал», «полуфинал».
 */
export function splitCupLabel(competition: string): {
  cup: string;
  round?: string;
} {
  const parts = competition.trim().split(/\s+/);
  const last = parts[parts.length - 1];
  if (parts.length > 1 && /^(\d+\/\d+|финал|полуфинал|четвертьфинал)$/i.test(last)) {
    return { cup: parts.slice(0, -1).join(" "), round: last };
  }
  return { cup: competition };
}

// Абсолютные пути + якоря — чтобы навигация работала и с главной, и со
// страницы /news/[slug] (где якорей на главной не существует).
export const NAV: readonly NavItem[] = [
  { href: "/", label: "Главная" },
  { href: "/#matches", label: "Матчи" },
  { href: "/news", label: "Новости" },
  { href: "/#team", label: "Команда" },
  { href: "/history", label: "История" },
  { href: "/#social", label: "Соцсети" },
  { href: "/#results", label: "Результаты" },
] as const;

export const POS_LABEL: Record<Position, string> = {
  GK: "Вратарь",
  DF: "Защитник",
  MF: "Полузащитник",
  FW: "Нападающий",
  COACH: "Тренер",
};

export const POS_FILTERS: { id: "ALL" | Position; label: string }[] = [
  { id: "ALL", label: "Все" },
  { id: "GK", label: "Вратари" },
  { id: "DF", label: "Защитники" },
  { id: "MF", label: "Полузащитники" },
  { id: "FW", label: "Нападающие" },
  { id: "COACH", label: "Тренеры" },
];
