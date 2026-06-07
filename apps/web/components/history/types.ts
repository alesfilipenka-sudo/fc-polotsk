import type { ToneKey } from "@/lib/history-tones";

export interface HistoryFact {
  icon?: string;
  t?: string;
  d?: string;
}

export interface HistoryEra {
  _id: string;
  eraId?: string;
  year?: string;
  range?: string;
  tone?: ToneKey | string;
  kicker?: string;
  name?: string;
  lead?: string;
  body?: string;
  photo?: string;
  photoAlt?: string;
  facts?: HistoryFact[];
}
