import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LogoDecor } from "../Logo";
import { formatShortDate } from "@/lib/dateFormat";

export interface NewsCardItem {
  _id: string;
  title: string;
  slug?: string;
  date: string;
  tag: string;
  excerpt?: string;
  placeholderClass?: string;
  imageUrl?: string;
}

interface NewsCardProps {
  item: NewsCardItem;
  /** Скрыть excerpt — например в RelatedNews. */
  hideExcerpt?: boolean;
}

/**
 * Карточка новости. Кликабельная — ведёт на /news/[slug].
 * Если slug нет — рендерим как div (фолбэк, не должно случаться).
 */
export function NewsCard({ item, hideExcerpt }: NewsCardProps) {
  const hasImage = !!item.imageUrl;
  const tagClass = hasImage
    ? "bg-polotsk-500 text-white"
    : "bg-white/95 text-polotsk-700";

  const inner = (
    <article className="group h-full">
      <div
        className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${
          !hasImage ? item.placeholderClass ?? "ph-news-1" : ""
        }`}
        style={
          hasImage
            ? {
                backgroundImage: `url(${item.imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="grain pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay" />
        {!hasImage ? (
          <LogoDecor size={140} opacity={0.10} className="pointer-events-none absolute -bottom-6 -right-6" />
        ) : null}
        <span
          className={`absolute left-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider shadow-sm ${tagClass}`}
        >
          {item.tag}
        </span>
        <span className="absolute bottom-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-polotsk-700 transition group-hover:scale-110">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-4">
        <p className="text-[11px] uppercase tracking-eyebrow text-slate-400">
          {formatShortDate(item.date)}
        </p>
        <h3 className="mt-2 font-display text-2xl leading-tight text-slate-900 transition group-hover:text-polotsk-500">
          {item.title}
        </h3>
        {!hideExcerpt && item.excerpt && (
          <p className="clamp-2 mt-2 text-sm text-slate-500">{item.excerpt}</p>
        )}
      </div>
    </article>
  );

  if (!item.slug) return inner;

  return (
    <Link href={`/news/${item.slug}`} className="block h-full">
      {inner}
    </Link>
  );
}
