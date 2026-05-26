"use client";

import { useState, useTransition } from "react";
import {
  createEventAction,
  undoEventAction,
  type EventType,
  type Side,
  type CreateEventInput,
} from "./actions";

export interface PlayerOption {
  _id: string;
  name: string;
  num?: number;
  pos?: string;
}

export interface EventItem {
  _key?: string;
  type?: string;
  minute?: number;
  forTeam?: "home" | "away";
  ownGoal?: boolean;
  playerName?: string;
  assistName?: string;
}

interface EventPanelProps {
  matchId: string;
  homeName?: string;
  awayName?: string;
  polotskIs: "home" | "away" | null; // на какой стороне Полоцк
  players: PlayerOption[];
  events: EventItem[];
}

const TAB_LABELS: Record<EventType, string> = {
  goal: "⚽ Гол",
  yellow: "🟨 Жёлтая",
  red: "🟥 Красная",
};

function eventIcon(t?: string) {
  return t === "goal" ? "⚽" : t === "yellow" ? "🟨" : t === "red" ? "🟥" : t === "sub" ? "↕" : "·";
}

export function EventPanel({
  matchId,
  homeName,
  awayName,
  polotskIs,
  players,
  events,
}: EventPanelProps) {
  const [tab, setTab] = useState<EventType>("goal");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Per-tab form state
  const [forTeam, setForTeam] = useState<Side>(polotskIs ?? "home");
  const [minute, setMinute] = useState<string>("");
  const [playerRef, setPlayerRef] = useState<string>("");
  const [opponentName, setOpponentName] = useState<string>("");
  const [assistRef, setAssistRef] = useState<string>("");
  const [ownGoal, setOwnGoal] = useState(false);

  // Является ли выбранная сторона Полоцком — определяет, показывать selectбоксы или free-text
  const sideIsPolotsk = forTeam === polotskIs;

  function reset() {
    setMinute("");
    setPlayerRef("");
    setOpponentName("");
    setAssistRef("");
    setOwnGoal(false);
  }

  function submit() {
    setError(null);
    const m = parseInt(minute, 10);
    if (!Number.isFinite(m) || m < 1 || m > 130) {
      setError("Введи корректную минуту (1–130)");
      return;
    }
    if (sideIsPolotsk && !playerRef) {
      setError("Выбери игрока Полоцка");
      return;
    }
    if (!sideIsPolotsk && !opponentName.trim()) {
      setError("Введи имя автора");
      return;
    }

    const payload: CreateEventInput = {
      matchId,
      type: tab,
      minute: m,
      forTeam,
      ...(sideIsPolotsk
        ? { playerRef }
        : { playerName: opponentName.trim() }),
    };
    if (tab === "goal") {
      payload.ownGoal = ownGoal;
      // Ассист только когда забивал игрок Полоцка и есть выбранный ассистент
      if (sideIsPolotsk && assistRef && assistRef !== playerRef) {
        payload.assistRef = assistRef;
      }
    }

    startTransition(async () => {
      try {
        await createEventAction(payload);
        reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось сохранить");
      }
    });
  }

  function undo() {
    setError(null);
    startTransition(async () => {
      try {
        await undoEventAction(matchId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось откатить");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(TAB_LABELS) as EventType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
              tab === t
                ? "bg-polotsk-500 text-white shadow"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        {/* Side toggle */}
        <div>
          <p className="mb-1.5 text-[10px] uppercase tracking-eyebrow text-slate-400">
            За команду
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForTeam("home")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                forTeam === "home"
                  ? "bg-polotsk-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {homeName ?? "Хозяева"}
            </button>
            <button
              type="button"
              onClick={() => setForTeam("away")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                forTeam === "away"
                  ? "bg-polotsk-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {awayName ?? "Гости"}
            </button>
          </div>
        </div>

        {/* Minute */}
        <label className="block">
          <span className="mb-1.5 block text-[10px] uppercase tracking-eyebrow text-slate-400">
            Минута
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={130}
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            placeholder="67"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-polotsk-500"
          />
        </label>

        {/* Player */}
        {sideIsPolotsk ? (
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-eyebrow text-slate-400">
              Игрок Полоцка
            </span>
            <select
              value={playerRef}
              onChange={(e) => setPlayerRef(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-polotsk-500"
            >
              <option value="">— выбери —</option>
              {players.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.num != null ? `#${p.num} ` : ""}
                  {p.name}
                  {p.pos ? ` · ${p.pos}` : ""}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-eyebrow text-slate-400">
              Имя автора (соперник)
            </span>
            <input
              type="text"
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
              placeholder="Иванов"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-polotsk-500"
            />
          </label>
        )}

        {/* Goal-only fields */}
        {tab === "goal" && (
          <>
            {sideIsPolotsk && (
              <label className="block">
                <span className="mb-1.5 block text-[10px] uppercase tracking-eyebrow text-slate-400">
                  Ассистент (необязательно)
                </span>
                <select
                  value={assistRef}
                  onChange={(e) => setAssistRef(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-polotsk-500"
                >
                  <option value="">— нет —</option>
                  {players
                    .filter((p) => p._id !== playerRef)
                    .map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.num != null ? `#${p.num} ` : ""}
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
            )}
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={ownGoal}
                onChange={(e) => setOwnGoal(e.target.checked)}
                className="h-4 w-4"
              />
              Автогол
            </label>
          </>
        )}

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="w-full rounded-lg bg-polotsk-500 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-polotsk-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Сохраняю…" : `Добавить ${TAB_LABELS[tab].toLowerCase()}`}
        </button>
      </div>

      {/* Event log */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-eyebrow text-slate-400">
            Лента событий
          </p>
          {events.length > 0 && (
            <button
              type="button"
              onClick={undo}
              disabled={pending}
              className="text-[11px] font-semibold uppercase tracking-wider text-red-500 hover:underline disabled:opacity-50"
            >
              Откатить последнее
            </button>
          )}
        </div>
        {events.length === 0 ? (
          <p className="text-sm text-slate-400">Пусто. Добавь первое событие выше.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {events
              .slice()
              .reverse()
              .map((e, i) => {
                const sideLabel = e.forTeam === "home" ? homeName ?? "ХОЗ" : awayName ?? "ГОС";
                return (
                  <li
                    key={e._key ?? i}
                    className="flex items-center gap-2 border-b border-slate-100 pb-2 last:border-0"
                  >
                    <span className="tabular-nums text-slate-500 w-9 shrink-0">
                      {e.minute ?? "—"}'
                    </span>
                    <span aria-hidden>{eventIcon(e.type)}</span>
                    <span className="font-medium text-slate-800 truncate">
                      {e.playerName ?? "?"}
                    </span>
                    {e.type === "goal" && e.ownGoal && (
                      <span className="text-xs text-slate-400">(а/г)</span>
                    )}
                    {e.assistName && (
                      <span className="text-xs text-slate-500 truncate">
                        🎯 {e.assistName}
                      </span>
                    )}
                    <span className="ml-auto text-[10px] uppercase tracking-eyebrow text-slate-400 shrink-0">
                      {sideLabel}
                    </span>
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    </div>
  );
}
