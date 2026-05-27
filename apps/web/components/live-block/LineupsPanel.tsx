"use client";

import { useEffect, useState } from "react";
import { PitchView } from "../shared/PitchView";
import { LineupList } from "../shared/LineupList";
import type { LineupEntry, LiveTeamRef } from "./types";

interface LineupsPanelProps {
  home?: LiveTeamRef;
  away?: LiveTeamRef;
  homeSquad?: LineupEntry[];
  awaySquad?: LineupEntry[];
  formation?: string;
  homeColor?: string;
  awayColor?: string;
}

type View = "list" | "pitch";

const VIEW_STORAGE_KEY = "fcp:lineups:view";

export function LineupsPanel({
  home,
  away,
  homeSquad,
  awaySquad,
  formation,
  homeColor = "#234794",
  awayColor = "#eab308",
}: LineupsPanelProps) {
  const [view, setView] = useState<View>("list");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_STORAGE_KEY);
      if (saved === "list" || saved === "pitch") setView(saved);
    } catch {
      // localStorage может быть отключён — это окей
    }
  }, []);

  function setAndStore(v: View) {
    setView(v);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, v);
    } catch {
      // ignore
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end gap-1.5">
        <button
          type="button"
          onClick={() => setAndStore("list")}
          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
            view === "list"
              ? "bg-white text-polotsk-700"
              : "bg-white/10 text-white/70 hover:bg-white/15"
          }`}
        >
          ≡ Список
        </button>
        <button
          type="button"
          onClick={() => setAndStore("pitch")}
          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
            view === "pitch"
              ? "bg-white text-polotsk-700"
              : "bg-white/10 text-white/70 hover:bg-white/15"
          }`}
        >
          ⬡ Поле
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        {view === "list" ? (
          <>
            <LineupList
              squad={homeSquad}
              color={homeColor}
              label={home?.name ?? "Хозяева"}
            />
            <LineupList
              squad={awaySquad}
              color={awayColor}
              label={away?.name ?? "Гости"}
            />
          </>
        ) : (
          <>
            <PitchView
              squad={homeSquad}
              color={homeColor}
              formation={formation}
              label={home?.name ?? "Хозяева"}
            />
            <PitchView
              squad={awaySquad}
              color={awayColor}
              formation={formation}
              label={away?.name ?? "Гости"}
            />
          </>
        )}
      </div>
    </div>
  );
}
