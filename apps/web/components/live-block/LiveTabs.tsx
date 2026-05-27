"use client";

import { useState, type ReactNode } from "react";

export type LiveTabId = "feed" | "lineups" | "stats";

export interface LiveTabSpec {
  id: LiveTabId;
  label: string;
}

interface LiveTabsProps {
  tabs: LiveTabSpec[];
  defaultTab?: LiveTabId;
  feedContent: ReactNode;
  lineupsContent?: ReactNode;
  statsContent?: ReactNode;
}

/**
 * Сегментированный контрол. Контент пробрасывается слотами, чтобы можно
 * было рендерить server-компоненты (EventFeed) и client-компоненты
 * (LineupsPanel) одновременно.
 *
 * Если в `tabs` только одна — переключатель не рисуем, сразу контент.
 */
export function LiveTabs({
  tabs,
  defaultTab,
  feedContent,
  lineupsContent,
  statsContent,
}: LiveTabsProps) {
  const initial = defaultTab ?? tabs[0]?.id ?? "feed";
  const [active, setActive] = useState<LiveTabId>(initial);

  const content =
    active === "lineups"
      ? lineupsContent ?? feedContent
      : active === "stats"
      ? statsContent ?? feedContent
      : feedContent;

  if (tabs.length <= 1) {
    return <>{content}</>;
  }

  return (
    <div>
      <div className="mb-4 inline-flex rounded-full bg-black/20 p-1">
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
                isActive
                  ? "bg-white text-polotsk-700"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div>{content}</div>
    </div>
  );
}
