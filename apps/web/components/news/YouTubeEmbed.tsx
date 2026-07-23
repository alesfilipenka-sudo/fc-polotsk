"use client";

import { useState } from "react";

interface YouTubeEmbedProps {
  url?: string;
  caption?: string;
}

/**
 * Извлекает ID видео из любого формата YouTube URL:
 *   - https://youtu.be/XXX
 *   - https://youtube.com/watch?v=XXX
 *   - https://youtube.com/embed/XXX
 *   - https://youtube.com/shorts/XXX
 *   - https://www.youtube-nocookie.com/embed/XXX
 */
function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be" || u.hostname === "www.youtu.be") {
      const id = u.pathname.slice(1);
      return id ? id.split("/")[0] : null;
    }
    if (
      u.hostname.endsWith("youtube.com") ||
      u.hostname.endsWith("youtube-nocookie.com")
    ) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const embedMatch = u.pathname.match(/^\/embed\/([^/?]+)/);
      if (embedMatch) return embedMatch[1];
      const shortsMatch = u.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shortsMatch) return shortsMatch[1];
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Lite-pattern YouTube embed. Сначала только превью+play, iframe грузится
 * по клику. Экономит ~500кб YouTube JS на первой загрузке страницы —
 * критично когда в статье несколько видео.
 *
 * Используется через nocookie домен (youtube-nocookie.com) — privacy-friendly.
 */
export function YouTubeEmbed({ url, caption }: YouTubeEmbedProps) {
  const id = extractYouTubeId(url);
  const [activated, setActivated] = useState(false);

  if (!id) return null;

  const thumbnail = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  const fallbackThumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <figure className="my-8 -mx-2 md:mx-0">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900">
        {activated ? (
          <iframe
            src={embedUrl}
            title={caption ?? "YouTube видео"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActivated(true)}
            className="group absolute inset-0 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-polotsk-300"
            aria-label={
              caption ? `Воспроизвести: ${caption}` : "Воспроизвести видео"
            }
          >
            <img
              src={thumbnail}
              onError={(e: { currentTarget: HTMLImageElement }) => {
                const img = e.currentTarget;
                if (img.src !== fallbackThumbnail) img.src = fallbackThumbnail;
              }}
              alt={caption ?? ""}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span
              className="absolute inset-0 bg-black/20 transition group-hover:bg-black/30"
              aria-hidden
            />
            <span
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg transition group-hover:scale-110 md:h-16 md:w-16"
              aria-hidden
            >
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-white md:h-8 md:w-8">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              YouTube
            </span>
          </button>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-xs italic text-slate-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
