import { PortableText } from "@portabletext/react";
import { portableTextComponents } from "@/lib/portable-text-components";

interface ArticleBodyProps {
  body?: unknown;
}

/**
 * Тело статьи — Portable Text из Sanity. Styled через .prose-article в globals.css.
 * Компоненты рендера вынесены в @/lib/portable-text-components (переиспользуются
 * на страницах игроков через PlayerBio).
 */
export function ArticleBody({ body }: ArticleBodyProps) {
  if (!body) return null;
  return (
    <div className="prose-article">
      <PortableText value={body as never} components={portableTextComponents} />
    </div>
  );
}
