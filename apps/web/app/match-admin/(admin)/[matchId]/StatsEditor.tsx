"use client";

import { useState, useTransition } from "react";
import { saveStatsAction, type SaveStatsInput } from "./actions";

interface ExistingStats {
  shotsHome?: number;
  shotsAway?: number;
  shotsOnGoalHome?: number;
  shotsOnGoalAway?: number;
  possessionHome?: number;
  possessionAway?: number;
  cornersHome?: number;
  cornersAway?: number;
  offsidesHome?: number;
  offsidesAway?: number;
}

interface StatsEditorProps {
  matchId: string;
  homeName?: string;
  awayName?: string;
  initial?: ExistingStats;
}

interface RowDef {
  label: string;
  homeKey: keyof SaveStatsInput;
  awayKey: keyof SaveStatsInput;
  hint?: string;
}

const ROWS: RowDef[] = [
  { label: "Удары", homeKey: "shotsHome", awayKey: "shotsAway" },
  { label: "Удары в створ", homeKey: "shotsOnGoalHome", awayKey: "shotsOnGoalAway" },
  {
    label: "Владение, %",
    homeKey: "possessionHome",
    awayKey: "possessionAway",
    hint: "Сумма должна быть около 100",
  },
  { label: "Угловые", homeKey: "cornersHome", awayKey: "cornersAway" },
  { label: "Офсайды", homeKey: "offsidesHome", awayKey: "offsidesAway" },
];

type FormState = Record<keyof Omit<SaveStatsInput, "matchId">, string>;

function toFormState(s: ExistingStats | undefined): FormState {
  const empty: FormState = {
    shotsHome: "",
    shotsAway: "",
    shotsOnGoalHome: "",
    shotsOnGoalAway: "",
    possessionHome: "",
    possessionAway: "",
    cornersHome: "",
    cornersAway: "",
    offsidesHome: "",
    offsidesAway: "",
  };
  if (!s) return empty;
  for (const k of Object.keys(empty) as Array<keyof FormState>) {
    const v = s[k];
    empty[k] = v != null ? String(v) : "";
  }
  return empty;
}

function toNumberOrUndefined(v: string): number | undefined {
  const trimmed = v.trim();
  if (trimmed === "") return undefined;
  const n = parseInt(trimmed, 10);
  return Number.isFinite(n) ? n : undefined;
}

export function StatsEditor({
  matchId,
  homeName,
  awayName,
  initial,
}: StatsEditorProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(toFormState(initial));
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(k: keyof FormState, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function save() {
    setError(null);
    setSaved(false);
    const payload: SaveStatsInput = { matchId };
    (Object.keys(form) as Array<keyof FormState>).forEach((k) => {
      payload[k] = toNumberOrUndefined(form[k]);
    });
    startTransition(async () => {
      try {
        await saveStatsAction(payload);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось сохранить");
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
            Статистика
          </p>
          <p className="font-display text-base text-slate-900">
            {open ? "Свернуть" : "Редактировать статистику"}
          </p>
        </div>
        <span className="text-2xl text-slate-400">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-3">
          <div className="grid grid-cols-[1fr_2fr_1fr] gap-2 text-[10px] uppercase tracking-eyebrow text-slate-400">
            <span className="text-center truncate">{homeName ?? "Хозяева"}</span>
            <span />
            <span className="text-center truncate">{awayName ?? "Гости"}</span>
          </div>

          {ROWS.map((r) => (
            <div
              key={r.label}
              className="grid grid-cols-[1fr_2fr_1fr] items-center gap-2"
            >
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={form[r.homeKey as keyof FormState]}
                onChange={(e) =>
                  update(r.homeKey as keyof FormState, e.target.value)
                }
                placeholder="0"
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-center outline-none focus:border-polotsk-500"
              />
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-700">
                  {r.label}
                </p>
                {r.hint && (
                  <p className="text-[10px] text-slate-400">{r.hint}</p>
                )}
              </div>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={form[r.awayKey as keyof FormState]}
                onChange={(e) =>
                  update(r.awayKey as keyof FormState, e.target.value)
                }
                placeholder="0"
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-center outline-none focus:border-polotsk-500"
              />
            </div>
          ))}

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          {saved && (
            <div className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-xs text-green-700">
              Статистика сохранена.
            </div>
          )}

          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="w-full rounded-lg bg-polotsk-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-polotsk-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Сохраняю…" : "Сохранить статистику"}
          </button>

          <p className="text-[10px] text-slate-400">
            Жёлтые карточки в публичной статистике считаются автоматически из ленты событий — отдельно не вводи.
          </p>
        </div>
      )}
    </div>
  );
}
