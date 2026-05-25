import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Link from "next/link";
import { InlineImage } from "./InlineImage";

interface ArticleBodyProps {
  body?: unknown;
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      const external = /^https?:\/\//.test(href);
      if (external) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      }
      return <Link href={href}>{children}</Link>;
    },
  },
  types: {
    imageBlock: ({ value }) => <InlineImage value={value as never} />,
  },
};

/**
 * Тело статьи — Portable Text из Sanity. Styled через .prose-article в globals.css.
 */
export function ArticleBody({ body }: ArticleBodyProps) {
  if (!body) return null;
  return (
    <div className="prose-article">
      <PortableText value={body as never} components={components} />
    </div>
  );
}
