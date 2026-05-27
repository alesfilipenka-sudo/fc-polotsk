"use client";

import { useState, useTransition } from "react";
import { saveLineupAction, type SaveLineupEntry, type Side } from "./actions";
import type { PlayerOption } from "./EventPanel";

interface ExistingEntry {
  _key?: string;
  playerId?: string;
  playerName?: string;
  playerNumber?: number;
  position?: string;
  isStarter?: boolean;
  isCaptain?: boolean;
  positionSlot?: number;
}

interface LineupEditorProps {
  matchId: string;
  homeName?: string;
  awayName?: string;
  polotskIs: Side | null;
  players: PlayerOption[];
  initialHome: ExistingEntry[];
  initialAway: ExistingEntry[];
  initialFormation?: string;
  initialColorHome?: string;
  initialColorAway?: string;
}

const FORMATIONS = ["4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "3-4-3", "5-3-2"];

const HOME_COLORS = ["#234794", "#7e96d8", "#ffffff"];
const AWAY_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#000000",
  "#ffffff",
];

const STARTER_ROWS = 11;

interface Row {
  playerRef: string;
  playerName: string;
  playerNumber: string;
  position: string;
  isCaptain: boolean;
}

function emptyRow(): Row {
  return {
    playerRef: "",
    playerName: "",
    playerNumber: "",
    position: "",
    isCaptain: false,
  };
}

/** Распарсить существующие lineup-записи в массив из ровно 11 starter-рядов. */
function parseInitial(entries: ExistingEntry[]): Row[] {
  const rows: Row[] = Array.from({ length: STARTER_ROWS }, () => emptyRow());
  const starters = entries
    .filter((e) => e.isStarter !== false)
    .sort((a, b) => (a.positionSlot ?? 0) - (b.positionSlot ?? 0));
  starters.forEach((s, i) => {
    const slot = s.positionSlot != null ? s.positionSlot : i;
    if (slot < 0 || slot >= STARTER_ROWS) return;
    rows[slot] = {
      playerRef: s.playerId ?? "",
      playerName: s.playerName ?? "",
      playerNumber:
        s.playerNumber != null ? String(s.playerNumber) : "",
      position: s.position ?? "",
      isCaptain: !!s.isCaptain,
    };
  });
  return rows;
}

export function LineupEditor({
  matchId,
  homeName,
  awayName,
  polotskIs,
  players,
  initialHome,
  initialAway,
  initialFormation,
  initialColorHome,
  initialColorAway,
}: LineupEditorProps) {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<Side>(polotskIs ?? "home");
  const [formation, setFormation] = useState<string>(
    initialFormation ?? "4-3-3",
  );
  const [colorHome, setColorHome] = useState<string>(
    initialColorHome ?? "#234794",
  );
  const [colorAway, setColorAway] = useState<string>(
    initialColorAway ?? "#eab308",
  );
  const [homeRows, setHomeRows] = useState<Row[]>(parseInitial(initialHome));
  const [awayRows, setAwayRows] = useState<Row[]>(parseInitial(initialAway));
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = side === "home" ? homeRows : awayRows;
  const setRows = side === "home" ? setHomeRows : setAwayRows;
  const sideIsPolotsk = side === polotskIs;
  const color = side === "home" ? colorHome : colorAway;
  const setColor = side === "home" ? setColorHome : setColorAway;
  const swatches = side === "home" ? HOME_COLORS : AWAY_COLORS;
  const sideName = side === "home" ? homeName : awayName;

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  function toggleCaptain(i: number) {
    setRows((rs) =>
      rs.map((r, j) => ({
        ...r,
        isCaptain: j === i ? !r.isCaptain : false, // только один капитан
      })),
    );
  }

  function save() {
    setError(null);
    setSaved(null);
    const entries: SaveLineupEntry[] = rows
      .map((r, i): SaveLineupEntry | null => {
        const hasRef = !!r.playerRef;
        const hasName = !!r.playerName.trim();
        if (!hasRef && !hasName) return null;
        const num = parseInt(r.playerNumber, 10);
        return {
          isStarter: true,
          isCaptain: r.isCaptain,
          positionSlot: i,
          ...(hasRef
            ? { playerRef: r.playerRef }
            : {
                playerName: r.playerName.trim(),
                playerNumber: Number.isFinite(num) ? num : undefined,
                position: r.position || undefined,
              }),
        };
      })
      .filter((e): e is SaveLineupEntry => e !== null);

    if (entries.length === 0) {
      setError("Заполни хотя бы одну строку");
      return;
    }

    startTransition(async () => {
      try {
        await saveLineupAction({
          matchId,
          side,
          formation,
          tokenColor: color,
          entries,
        });
        setSaved(`Состав «${sideName ?? side}» сохранён.`);
        setTimeout(() => setSaved(null), 3000);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Не удалось сохранить",
        );
      }
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left"
      >
        <div>
          <p className="text-[10px] uppercase tracking-eyebrow text-slate-400">
            Составы
          </p>
          <p className="font-display text-base text-slate-900">
            {open ? "Свернуть" : "Редактировать составы"}
          </p>
        </div>
        <span className="text-2xl text-slate-400">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-4">
          {/* Side toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSide("home")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                side === "home"
                  ? "bg-polotsk-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {homeName ?? "Хозяева"}
            </button>
            <button
              type="button"
              onClick={() => setSide("away")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                side === "away"
                  ? "bg-polotsk-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {awayName ?? "Гости"}
            </button>
          </div>

          {/* Formation */}
          <div>
            <p className="mb-1.5 text-[10px] uppercase tracking-eyebrow text-slate-400">
              Формация
            </p>
            <div className="flex flex-wrap gap-2">
              {FORMATIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormation(f)}
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition ${
                    formation === f
                      ? "bg-polotsk-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <p className="mb-1.5 text-[10px] uppercase tracking-eyebrow text-slate-400">
              Цвет фишек
            </p>
            <div className="flex flex-wrap gap-2">
              {swatches.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={c}
                  className={`h-7 w-7 rounded-full border-2 transition ${
                    color === c ? "border-polotsk-700 ring-2 ring-polotsk-300" : "border-slate-300"
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* Rows */}
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-eyebrow text-slate-400">
              Стартовый состав · {sideName ?? side}
            </p>
            <ul className="space-y-2">
              {rows.map((r, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-6 shrink-0 text-center text-xs font-bold text-slate-400 tabular-nums">
                    {i + 1}
                  </span>
                  {sideIsPolotsk ? (
                    <select
                      value={r.playerRef}
                      onChange={(e) =>
                        updateRow(i, { playerRef: e.target.value })
                      }
                      className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-polotsk-500"
                    >
                      <option value="">— пусто —</option>
                      {players.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.num != null ? `#${p.num} ` : ""}
                          {p.name}
                          {p.pos ? ` · ${p.pos}` : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <input
                        type="number"
                        placeholder="#"
                        value={r.playerNumber}
                        onChange={(e) =>
                          updateRow(i, { playerNumber: e.target.value })
                        }
                        className="w-12 shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-polotsk-500"
                      />
                      <input
                        type="text"
                        placeholder="Имя"
                        value={r.playerName}
                        onChange={(e) =>
                          updateRow(i, { playerName: e.target.value })
                        }
                        className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-polotsk-500"
                      />
                      <select
                        value={r.position}
                        onChange={(e) =>
                          updateRow(i, { position: e.target.value })
                        }
                        className="w-16 shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-polotsk-500"
                      >
                        <option value="">—</option>
                        <option value="GK">GK</option>
                        <option value="DF">DF</option>
                        <option value="MF">MF</option>
                        <option value="FW">FW</option>
                      </select>
                    </>
                  )}
                  <label
                    title="Капитан"
                    className="flex items-center gap-1 text-xs text-slate-600 shrink-0"
                  >
                    <input
                      type="checkbox"
                      checked={r.isCaptain}
                      onChange={() => toggleCaptain(i)}
                      className="h-4 w-4"
                    />
                    ©
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          {saved && (
            <div className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-xs text-green-700">
              {saved}
            </div>
          )}

          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="w-full rounded-lg bg-polotsk-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-polotsk-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending
              ? "Сохраняю…"
              : `Сохранить состав «${sideName ?? side}»`}
          </button>
        </div>
      )}
    </div>
  );
}
