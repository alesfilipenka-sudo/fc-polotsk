/**
 * Цветовые палитры для эпох истории клуба.
 *
 * НЕ в Sanity — это пресеты дизайна. Sanity хранит только идентификатор
 * tone, а здесь маппим в реальные цвета.
 */

export type ToneKey =
  | "sepia"
  | "bssr"
  | "soviet"
  | "modern"
  | "gaz"
  | "current";

export interface Tone {
  bg: string;
  card: string;
  ink: string;
  accent: string;
  chip: string;
  node: string;
  label: string;
}

export const TONE: Record<ToneKey, Tone> = {
  sepia: {
    bg: "#f4efe6",
    card: "#fffdf8",
    ink: "#3d3322",
    accent: "#9c7b45",
    chip: "#efe6d4",
    node: "#9c7b45",
    label: "#9c7b45",
  },
  bssr: {
    bg: "#f1f3f8",
    card: "#ffffff",
    ink: "#1c2433",
    accent: "#7a3030",
    chip: "#f0e2e2",
    node: "#7a3030",
    label: "#7a3030",
  },
  soviet: {
    bg: "#f4f1ec",
    card: "#ffffff",
    ink: "#2a2620",
    accent: "#b0472f",
    chip: "#f3e3dc",
    node: "#b0472f",
    label: "#b0472f",
  },
  modern: {
    bg: "#eef2fb",
    card: "#ffffff",
    ink: "#0a0e1a",
    accent: "#003399",
    chip: "#dde7fb",
    node: "#003399",
    label: "#003399",
  },
  gaz: {
    bg: "#eaf5ef",
    card: "#ffffff",
    ink: "#0e2018",
    accent: "#1f7a4d",
    chip: "#d3ecde",
    node: "#1f7a4d",
    label: "#1f7a4d",
  },
  current: {
    bg: "#003399",
    card: "linear-gradient(135deg,#001f5c 0%,#003399 100%)",
    ink: "#ffffff",
    accent: "#6ea8ff",
    chip: "rgba(255,255,255,0.12)",
    node: "#6ea8ff",
    label: "#6ea8ff",
  },
};

export function getTone(key?: string | null): Tone {
  if (!key) return TONE.modern;
  return TONE[key as ToneKey] ?? TONE.modern;
}
