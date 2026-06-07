import {
  Trophy,
  Award,
  Medal,
  Flag,
  Shield,
  Users,
  Factory,
  TrendingUp,
  Calendar,
  MapPin,
  ArrowUpCircle,
  Sparkles,
  GraduationCap,
  Target,
  Landmark,
  Dot,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { HistoryEra, HistoryFact } from "./types";
import { getTone } from "@/lib/history-tones";

const ICONS: Record<string, LucideIcon> = {
  Trophy,
  Award,
  Medal,
  Flag,
  Shield,
  Users,
  Factory,
  TrendingUp,
  Calendar,
  MapPin,
  ArrowUpCircle,
  Sparkles,
  GraduationCap,
  Target,
  Landmark,
};

function FactRow({ fact, accent }: { fact: HistoryFact; accent: string }) {
  const Icon = (fact.icon && ICONS[fact.icon]) || Dot;
  return (
    <li className="flex items-start gap-3">
      <Icon
        className="mt-0.5 h-5 w-5 shrink-0"
        style={{ color: accent }}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight" style={{ color: accent }}>
          {fact.t ?? ""}
        </p>
        {fact.d && (
          <p className="mt-0.5 text-[13px] leading-snug text-current/80">
            {fact.d}
          </p>
        )}
      </div>
    </li>
  );
}

interface EraCardProps {
  era: HistoryEra;
}

/**
 * Текстовая карточка эпохи: kicker → название → lead → текст → факты.
 * Цвета берутся из tone-палитры.
 */
export function EraCard({ era }: EraCardProps) {
  const tone = getTone(era.tone);
  const isGradient = tone.card.includes("gradient");

  return (
    <article
      className="rounded-3xl p-6 shadow-sm md:p-8"
      style={{
        background: tone.card,
        color: tone.ink,
        boxShadow: isGradient
          ? "0 20px 40px -20px rgba(0,31,92,0.4)"
          : "0 12px 30px -16px rgba(15,23,42,0.18)",
      }}
    >
      {era.kicker && (
        <p
          className="mb-2 text-[10px] font-bold uppercase tracking-eyebrow"
          style={{ color: tone.label }}
        >
          {era.kicker}
          {era.range ? <span className="opacity-50"> · {era.range}</span> : null}
        </p>
      )}
      <h3 className="font-display text-3xl leading-tight md:text-4xl">
        {era.name ?? "?"}
      </h3>
      {era.lead && (
        <p
          className="mt-3 border-l-2 pl-3 text-base italic md:text-lg"
          style={{ borderColor: tone.accent, color: tone.ink, opacity: 0.85 }}
        >
          {era.lead}
        </p>
      )}
      {era.body && (
        <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed opacity-90">
          {era.body}
        </p>
      )}
      {era.facts && era.facts.length > 0 && (
        <ul
          className="mt-5 space-y-3 border-t pt-5"
          style={{
            borderColor: isGradient
              ? "rgba(255,255,255,0.18)"
              : "rgba(15,23,42,0.1)",
          }}
        >
          {era.facts.map((f, i) => (
            <FactRow key={`${f.t ?? "?"}-${i}`} fact={f} accent={tone.accent} />
          ))}
        </ul>
      )}
    </article>
  );
}
