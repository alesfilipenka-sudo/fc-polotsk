import type { PlayerGalleryItem } from "./types";

interface PlayerGalleryProps {
  items?: PlayerGalleryItem[];
}

/**
 * Дополнительная галерея фотографий игрока. Простая сетка 2-3 колонки,
 * без lightbox — можно добавить позже.
 */
export function PlayerGallery({ items }: PlayerGalleryProps) {
  const photos = (items ?? []).filter((p) => p.url);
  if (photos.length === 0) return null;

  return (
    <div>
      <p className="mb-4 text-[10px] uppercase tracking-eyebrow text-polotsk-500">
        Фотогалерея
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {photos.map((p, i) => (
          <figure
            key={p.url ?? i}
            className="overflow-hidden rounded-xl bg-slate-100"
          >
            <img
              src={p.url}
              alt={p.alt ?? p.caption ?? ""}
              loading="lazy"
              decoding="async"
              className="block aspect-square w-full object-cover transition hover:scale-105"
            />
            {p.caption && (
              <figcaption className="p-2 text-[11px] italic text-slate-500">
                {p.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}
