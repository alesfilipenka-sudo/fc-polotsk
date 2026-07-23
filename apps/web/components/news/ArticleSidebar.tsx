import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatShortDate } from "@/lib/dateFormat";
import { ShareBar } from "./ShareBar";

export interface SidebarNewsItem {
  title: string;
  slug?: string;
  date: string;
}

interface ArticleSidebarProps {
  items: SidebarNewsItem[];
  socials?: {
    telegram?: string;
    vk?: string;
    instagram?: string;
  };
}

/**
 * Sidebar на странице статьи /news/[slug]. Синхронный компонент —
 * данные приходят из page.tsx (там всё грузится параллельно с article).
 */
export function ArticleSidebar({ items, socials }: ArticleSidebarProps) {
  const tg = socials?.telegram ?? "https://t.me/";
  const vk = socials?.vk ?? "https://vk.com/";
  const ig = socials?.instagram ?? "https://instagram.com/";

  return (
    <div className="space-y-6 lg:sticky lg:top-28">
      {/* Share */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-3 text-[10px] uppercase tracking-eyebrow text-slate-400">
          Поделиться статьёй
        </p>
        <ShareBar />
      </div>

      {/* Latest news */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-[10px] uppercase tracking-eyebrow text-slate-400">
            Другие новости
          </span>
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-xs font-bold text-polotsk-500 hover:underline"
          >
            Все
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-slate-400">Пока больше нечего читать.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => (
              <li key={n.slug ?? n.title}>
                {n.slug ? (
                  <Link
                    href={`/news/${n.slug}`}
                    className="group flex items-start gap-3 py-3.5"
                  >
                    <span className="mt-1.5 h-4 w-1 shrink-0 rounded-full bg-polotsk-500" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold leading-snug text-slate-800 transition group-hover:text-polotsk-500 clamp-2">
                        {n.title}
                      </span>
                      <span className="mt-1 block text-[11px] uppercase tracking-eyebrow text-slate-400">
                        {formatShortDate(n.date)}
                      </span>
                    </span>
                  </Link>
                ) : (
                  <span className="flex items-start gap-3 py-3.5 text-sm text-slate-500">
                    {n.title}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Club card */}
      <div className="overflow-hidden rounded-2xl bg-polotsk-500 p-5 text-white">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="ФК Полоцк"
            width={44}
            height={44}
            className="object-contain"
          />
          <div>
            <p className="font-display text-lg leading-none">ФК Полоцк</p>
            <p className="text-[10px] uppercase tracking-eyebrow text-white/70">
              Football Club · Est. 2019
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-white/80">
          Подписывайся на клуб, чтобы не пропускать новости и матчи.
        </p>
        <div className="mt-4 flex gap-2">
          <a
            href={tg}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 hover:bg-white/10"
          >
            TG
          </a>
          <a
            href={vk}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 hover:bg-white/10"
          >
            VK
          </a>
          <a
            href={ig}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 hover:bg-white/10"
          >
            IG
          </a>
        </div>
      </div>
    </div>
  );
}
