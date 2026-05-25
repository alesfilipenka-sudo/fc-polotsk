import { NewsCard, type NewsCardItem } from "./NewsCard";

interface RelatedNewsProps {
  items: NewsCardItem[];
}

export function RelatedNews({ items }: RelatedNewsProps) {
  if (!items || items.length === 0) return null;
  return (
    <section className="mb-16 mt-20">
      <div className="mb-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-[10px] uppercase tracking-eyebrow text-polotsk-500">
          Другие материалы
        </span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>
      <div className="grid gap-6 md:grid-cols-3 md:gap-8">
        {items.map((item) => (
          <NewsCard key={item._id} item={item} hideExcerpt />
        ))}
      </div>
    </section>
  );
}
