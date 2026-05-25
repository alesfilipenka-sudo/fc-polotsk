"use client";

import { useState } from "react";
import { Send, Link as LinkIcon, Check } from "lucide-react";
import { VKIcon } from "../icons/VKIcon";

/**
 * Кнопки шеринга статьи. Используют window.location, поэтому компонент
 * клиентский. Telegram и VK открывают share-страницу, "Скопировать" кладёт
 * текущий URL в буфер обмена и на 2 секунды показывает галку.
 */
export function ShareBar() {
  const [copied, setCopied] = useState(false);

  function copy() {
    if (typeof window === "undefined") return;
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareUrl(target: "tg" | "vk") {
    if (typeof window === "undefined") return "#";
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.title);
    if (target === "tg") return `https://t.me/share/url?url=${url}&text=${text}`;
    return `https://vk.com/share.php?url=${url}`;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] uppercase tracking-eyebrow text-slate-400 mr-1">
        Поделиться:
      </span>
      <a
        href={shareUrl("tg")}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn"
        aria-label="Telegram"
        title="Telegram"
      >
        <Send className="h-4 w-4" />
      </a>
      <a
        href={shareUrl("vk")}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn"
        aria-label="ВКонтакте"
        title="ВКонтакте"
      >
        <VKIcon className="h-4 w-4" />
      </a>
      <button
        type="button"
        onClick={copy}
        className="share-btn"
        aria-label="Скопировать ссылку"
        title="Скопировать ссылку"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <LinkIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
