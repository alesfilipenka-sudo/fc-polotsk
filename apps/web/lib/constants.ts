import type { NavItem, Position } from "./types";

export const SITE = {
  name: "ФК Полоцк",
  shortName: "FC Polotsk",
  tagline: "Football Club · Est. 2019",
  league: "Высшая лига",
  season: "2025/26",
  city: "Полоцк, Беларусь",
  url: "https://fcpolotsk.by",
} as const;

// Абсолютные пути + якоря — чтобы навигация работала и с главной, и со
// страницы /news/[slug] (где якорей на главной не существует).
// «Новости» теперь ведёт на отдельную страницу /news, а не на якорь
// #news главной (т.к. там лента короткая на 6 карточек).
export const NAV: readonly NavItem[] = [
  { href: "/", label: "Главная" },
  { href: "/#matches", label: "Матчи" },
  { href: "/news", label: "Новости" },
  { href: "/#team", label: "Команда" },
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
