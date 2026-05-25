import { Clock } from "lucide-react";
import { ShareBar } from "./ShareBar";

interface ArticleHeaderProps {
  title: string;
  subtitle?: string;
  tag?: string;
  date?: string;
  readTime?: number;
}

function formatLongDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Minsk",
  });
}

export function ArticleHeader({
  title,
  subtitle,
  tag,
  date,
  readTime,
}: ArticleHeaderProps) {
  return (
    <header>
      {/* Meta */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {tag && (
          <span className="inline-flex items-center rounded-full bg-polotsk-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            {tag}
          </span>
        )}
        {date && (
          <span className="text-sm text-slate-400">{formatLongDate(date)}</span>
        )}
        {readTime != null && (
          <>
            <span className="text-slate-200">·</span>
            <span className="inline-flex items-center gap-1 text-sm text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              {readTime} мин
            </span>
          </>
        )}
      </div>

      {/* Title */}
      <h1
        className="mb-5 font-display tracking-tight text-slate-900"
        style={{
          fontSize: "clamp(2rem, 5vw, 3.25rem)",
          lineHeight: "0.95",
        }}
      >
        {title}
      </h1>

      {/* Lead */}
      {subtitle && (
        <p className="mb-7 border-l-2 border-polotsk-300 pl-4 text-lg leading-relaxed text-slate-500">
          {subtitle}
        </p>
      )}

      {/* Author + share */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-7">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-polotsk-500 text-sm font-bold text-white">
            ФК
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800">
              Пресс-служба ФК Полоцк
            </div>
            <div className="text-[11px] text-slate-400">fcpolotsk.by</div>
          </div>
        </div>
        <ShareBar />
      </div>
    </header>
  );
}
