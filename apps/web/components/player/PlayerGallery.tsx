"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PlayerGalleryItem } from "./types";

interface PlayerGalleryProps {
  items?: PlayerGalleryItem[];
}

/**
 * Дополнительная галерея фотографий игрока.
 * Сетка 2-3 колонки → клик открывает fullscreen lightbox.
 * Навигация: клавиши ←/→, Esc для закрытия, клик по фону закрывает.
 */
export function PlayerGallery({ items }: PlayerGalleryProps) {
  const photos = (items ?? []).filter(
    (p): p is PlayerGalleryItem & { url: string } => !!p.url,
  );
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const close = useCallback(() => setOpenIdx(null), []);
  const next = useCallback(() => {
    setOpenIdx((idx) =>
      idx === null ? null : (idx + 1) % photos.length,
    );
  }, [photos.length]);
  const prev = useCallback(() => {
    setOpenIdx((idx) =>
      idx === null ? null : (idx - 1 + photos.length) % photos.length,
    );
  }, [photos.length]);

  useEffect(() => {
    if (openIdx === null) return;
    // Блокируем скролл body пока lightbox открыт
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIdx, close, next, prev]);

  if (photos.length === 0) return null;

  const active = openIdx !== null ? photos[openIdx] : null;

  return (
    <section aria-label="Фотогалерея" className="space-y-4">
      <h2 className="font-display text-2xl text-slate-900 md:text-3xl">
        Фотогалерея
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {photos.map((p, i) => (
          <figure
            key={p.url ?? i}
            className="group overflow-hidden rounded-xl bg-slate-100"
          >
            <button
              type="button"
              onClick={() => setOpenIdx(i)}
              className="block h-full w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-polotsk-500 focus-visible:ring-offset-2"
              aria-label={p.alt ?? p.caption ?? `Фото ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.alt ?? p.caption ?? ""}
                loading="lazy"
                decoding="async"
                className="block aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </button>
            {p.caption && (
              <figcaption className="p-2 text-[11px] italic text-slate-500">
                {p.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {active && openIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр фото"
          onClick={close}
        >
          {/* Top bar: counter + close */}
          <div
            className="flex items-center justify-between px-5 py-4 text-white/70"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[11px] uppercase tracking-eyebrow">
              {openIdx + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Закрыть"
              className="rounded-full p-2 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Image area */}
          <div
            className="relative flex flex-1 items-center justify-center px-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            {photos.length > 1 && (
              <button
                type="button"
                onClick={prev}
                aria-label="Предыдущее фото"
                className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:block"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <figure className="max-h-full max-w-6xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.url}
                alt={active.alt ?? active.caption ?? ""}
                className="mx-auto max-h-[80vh] w-auto max-w-full rounded-xl object-contain"
              />
              {active.caption && (
                <figcaption className="mt-3 text-center text-sm italic text-white/70">
                  {active.caption}
                </figcaption>
              )}
            </figure>

            {photos.length > 1 && (
              <button
                type="button"
                onClick={next}
                aria-label="Следующее фото"
                className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:block"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Mobile prev/next */}
          {photos.length > 1 && (
            <div
              className="flex justify-center gap-3 px-5 pb-6 md:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={prev}
                aria-label="Предыдущее фото"
                className="rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Следующее фото"
                className="rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
