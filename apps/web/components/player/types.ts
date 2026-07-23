import type { Position } from "@/lib/types";

export interface PlayerPreviousClub {
  clubName?: string;
  from?: number;
  to?: number;
  note?: string;
}

export interface PlayerGalleryItem {
  url?: string;
  caption?: string;
  alt?: string;
}

export interface PlayerDetail {
  _id: string;
  slug: string;
  name: string;
  num?: number;
  pos: Position;
  age: number;
  country: string;
  birthDate?: string;
  height?: number;
  weight?: number;
  preferredFoot?: "left" | "right" | "both";
  isArchived?: boolean;
  photoUrl?: string;
  bio?: string;
  bioLong?: unknown;
  gallery?: PlayerGalleryItem[];
  previousClubs?: PlayerPreviousClub[];
}

/**
 * Актуальный возраст. Если задан birthDate — считаем сколько полных лет
 * прошло с этой даты. Иначе фолбэк на статичное поле age.
 */
export function computeAge(player: {
  birthDate?: string;
  age: number;
}): number {
  if (!player.birthDate) return player.age;
  try {
    const bd = new Date(player.birthDate);
    if (Number.isNaN(bd.getTime())) return player.age;
    const now = new Date();
    let years = now.getFullYear() - bd.getFullYear();
    const m = now.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < bd.getDate())) {
      years--;
    }
    return years;
  } catch {
    return player.age;
  }
}
