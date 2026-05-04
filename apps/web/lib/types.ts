export type Position = "GK" | "DF" | "MF" | "FW";

export interface Player {
  num: number;
  name: string;
  pos: Position;
  age: number;
  country: string;
  photoUrl?: string;
}

export interface Team {
  name: string;
  short: string;
  logoUrl?: string;
}

export interface Match {
  id: string;
  date: Date;
  competition: string;
  home: Team;
  away: Team;
  hs?: number;
  as?: number;
  venue?: string;
  result?: "W" | "L" | "D";
  isPolotskHome: boolean;
}

export interface NewsItem {
  id: string;
  date: string;
  tag: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  imagePlaceholderClass?: string;
}

export interface Standing {
  pos: number;
  team: string;
  mp: number;
  pts: number;
  highlight?: boolean;
}

export type SocialId = "instagram" | "telegram" | "vk";

export interface SocialChannel {
  id: SocialId;
  label: string;
  handle: string;
  followers: string;
  url: string;
  accent: string;
}

export interface NavItem {
  href: string;
  label: string;
}
