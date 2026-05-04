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

export const NAV: readonly NavItem[] = [
  { href: "#top", label: "Главная" },
  { href: "#matches", label: "Матчи" },
  { href: "#news", label: "Новости" },
  { href: "#team", label: "Команда" },
  { href: "#social", label: "Соцсети" },
  { href: "#results", label: "Результаты" },
] as const;

export const POS_LABEL: Record<Position, string> = {
  GK: "Вратарь",
  DF: "Защитник",
  MF: "Полузащитник",
  FW: "Нападающий",
};

export const POS_FILTERS: { id: "ALL" | Position; label: string }[] = [
  { id: "ALL", label: "Все" },
  { id: "GK", label: "Вратари" },
  { id: "DF", label: "Защитники" },
  { id: "MF", label: "Полузащитники" },
  { id: "FW", label: "Нападающие" },
];
