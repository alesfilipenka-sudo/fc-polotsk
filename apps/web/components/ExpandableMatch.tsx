"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { awardedText, type AwardedMatchLike } from "@/lib/awarded";

export interface MatchEventEntry {
  minute?: number;
  forTeam?: "home" | "away";
  ownGoal?: boolean;
  type?: "yellow" | "red";
  name?: string;
  slug?: string;
}

export interface ExpandableMatchData extends AwardedMatchLike {
  scorers?: MatchEventEntry[];
  cards?: MatchEventEntry[];
}

/**
 * Строка матча, которая раскрывает состав событий.
 *
 * Авторы голов заносятся в CMS, но до сих пор были видны только в карточке
 * последнего матча, и то 48 часов. Здесь они доступны в любом матче архива,
 * а имена ведут на страницы игроков — включая тех, кто уже в архиве состава.
 *
 * Разметку строки передаёт вызывающий компонент: у списка результатов и у
 * «последних матчей» она разная, а поведение одно.
 */
export function ExpandableMatch({
  match,
  tone = "light",
  dense = false,
  children,
}: {
  match: ExpandableMatchData;
  tone?: "light" | "dark";
  /** Узкая колонка («Последние матчи») — без горизонтальных отступов. */
  dense?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const goals = match.scorers ?? [];
  const cards = match.cards ?? [];
  const note = awardedText(match);
  const hasDetails = goals.length > 0 || cards.length > 0 || !!note;

  const pad = dense ? "py-3" : "px-5 py-4 md:px-6";

  if (!hasDetails) {
    return <div className={pad}>{children}</div>;
  }

  const palette =
    tone === "dark"
      ? {
          hover: "hover:bg-white/[0.03]",
          ring: "focus-visible:ring-white/30",
          chevron: "text-white/40",
          panel: "border-white/10 bg-white/[0.03]",
          label: "text-white/40",
          name: "text-white/90",
          minute: "text-white/50",
          link: "hover:text-white underline-offset-2 hover:underline",
        }
      : {
          hover: "hover:bg-slate-50",
          ring: "focus-visible:ring-polotsk-300",
          chevron: "text-slate-400",
          panel: "border-slate-200 bg-slate-50",
          label: "text-slate-400",
          name: "text-slate-700",
          minute: "text-slate-400",
          link: "hover:text-polotsk-600 underline-offset-2 hover:underline",
        };

  const renderSide = (side: "home" | "away") => {
    const sideGoals = goals.filter((g) => g.forTeam === side);
    const sideCards = cards.filter((c) => c.forTeam === side);
    if (sideGoals.length === 0 && sideCards.length === 0) return null;

    return (
      <ul className="flex flex-col gap-1 min-w-0">
        {sideGoals.map((g, i) => (
          <li key={`g-${side}-${i}`} className="truncate text-xs">
            <span aria-hidden>⚽</span>{" "}
            <PlayerName entry={g} className={`${palette.name} ${palette.link}`} />
            {g.minute != null && (
              <span className={palette.minute}> {g.minute}&apos;</span>
            )}
            {g.ownGoal && <span className={palette.minute}> (а/г)</span>}
          </li>
        ))}
        {sideCards.map((c, i) => (
          <li key={`c-${side}-${i}`} className="truncate text-xs">
            <span aria-hidden>{c.type === "red" ? "🟥" : "🟨"}</span>{" "}
            <PlayerName entry={c} className={`${palette.name} ${palette.link}`} />
            {c.minute != null && (
              <span className={palette.minute}> {c.minute}&apos;</span>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      {/*
        role="button" вместо <button>: строку матча рисует вызывающий
        компонент, и там сетка из <p> и <div> — внутри <button> такая
        разметка невалидна и React ругается на вложенность.
      */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className={`flex w-full cursor-pointer items-center gap-3 text-left transition focus:outline-none focus-visible:ring-2 ${pad} ${palette.hover} ${palette.ring}`}
      >
        <div className="min-w-0 flex-1">{children}</div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${palette.chevron} ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </div>

      {open && (
        <div
          className={`border-t ${
            dense ? "rounded-lg px-3 py-3" : "px-5 py-4 md:px-6"
          } ${palette.panel}`}
        >
          {note ? (
            <p className={`text-xs leading-relaxed ${palette.minute}`}>{note}</p>
          ) : (
            <div
              className={`grid gap-3 ${
                dense ? "grid-cols-1" : "grid-cols-1 gap-4 sm:grid-cols-2"
              }`}
            >
              <div className="min-w-0">
                <p
                  className={`mb-1.5 text-[10px] uppercase tracking-eyebrow ${palette.label}`}
                >
                  {match.home?.name ?? "Хозяева"}
                </p>
                {renderSide("home") ?? (
                  <p className={`text-xs ${palette.minute}`}>—</p>
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={`mb-1.5 text-[10px] uppercase tracking-eyebrow ${palette.label}`}
                >
                  {match.away?.name ?? "Гости"}
                </p>
                {renderSide("away") ?? (
                  <p className={`text-xs ${palette.minute}`}>—</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlayerName({
  entry,
  className,
}: {
  entry: MatchEventEntry;
  className: string;
}) {
  const name = entry.name?.trim() || "?";
  if (!entry.slug) return <span className={className}>{name}</span>;
  return (
    <Link href={`/player/${entry.slug}`} className={className}>
      {name}
    </Link>
  );
}
