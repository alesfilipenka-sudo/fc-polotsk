interface InlineImageValue {
  url?: string;
  caption?: string;
  alt?: string;
  dimensions?: { width?: number; height?: number };
}

/**
 * Изображение внутри Portable Text (тип imageBlock).
 * Использует обычный <img>, а не next/image, потому что Next/image для
 * RSC требует точные размеры — а тут пропорции у разных фото разные.
 */
export function InlineImage({ value }: { value?: InlineImageValue }) {
  if (!value?.url) return null;
  return (
    <figure className="my-8 -mx-2 md:mx-0">
      <div className="relative overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={value.url}
          alt={value.alt ?? value.caption ?? ""}
          className="block h-auto w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      {value.caption && (
        <figcaption className="mt-2 text-xs italic text-slate-400">
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
}
