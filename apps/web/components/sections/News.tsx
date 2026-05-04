import { ArrowUpRight, ArrowRight } from "lucide-react";
import { SectionHeader } from "../SectionHeader";
import { LogoLight } from "../Logo";

const PLACEHOLDER_NEWS = Array.from({ length: 6 }, (_, i) => ({
  id: `n-${i + 1}`,
  date: "— апр",
  tag: ["Матч", "Команда", "Анонс", "Интервью", "Тренировка", "Партнёры"][i],
  title: "Заголовок новости появится после публикации в CMS",
  excerpt:
    "Короткое описание новости. Все материалы будут редактироваться через Sanity Studio и появляться здесь автоматически.",
  ph: `ph-news-${i + 1}` as const,
}));

export function News() {
  return (
    <section id="news" className="bg-slate-50/60 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="Новости клуба"
          title={
            <>
              Последние <span className="text-polotsk-500">события</span>
            </>
          }
          action={
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-polotsk-500 hover:text-polotsk-700"
            >
              Все новости
              <ArrowRight className="h-4 w-4" />
            </a>
          }
        />

        <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {PLACEHOLDER_NEWS.map((item) => (
            <article key={item.id} className="group">
              <div
                className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${item.ph}`}
              >
                <div className="grain pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay" />
                <LogoLight
                  size={140}
                  opacity={0.08}
                  className="pointer-events-none absolute -bottom-6 -right-6"
                />
                <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-polotsk-700">
                  {item.tag}
                </span>
                <span className="absolute bottom-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-polotsk-700 transition group-hover:scale-110">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-eyebrow text-slate-400">
                  {item.date}
                </p>
                <h3 className="mt-2 font-display text-2xl leading-tight text-slate-900 transition group-hover:text-polotsk-500">
                  {item.title}
                </h3>
                <p className="clamp-2 mt-2 text-sm text-slate-500">{item.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
