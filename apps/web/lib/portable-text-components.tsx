import { type PortableTextComponents } from "@portabletext/react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { InlineImage } from "@/components/news/InlineImage";
import { YouTubeEmbed } from "@/components/news/YouTubeEmbed";

interface LinkValue {
  href?: string;
}

interface YouTubeBlockValue {
  url?: string;
  caption?: string;
}

/**
 * Общий набор компонентов для PortableText.
 * Используется в новостях (ArticleBody) и на страницах игроков (PlayerBio).
 *
 * Поддерживает:
 *   - параграфы, h2/h3, blockquote
 *   - strong, em, link (внешние с иконкой ↗)
 *   - imageBlock (фото с caption)
 *   - youtubeBlock (lite embed)
 */
export const portableTextComponents: PortableTextComponents = {
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
      const href = (value as LinkValue | undefined)?.href ?? "#";
      const external = /^https?:\/\//.test(href);
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-polotsk-500 underline underline-offset-2 decoration-polotsk-300/60 transition hover:text-polotsk-700 hover:decoration-polotsk-500"
          >
            {children}
            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          </a>
        );
      }
      return (
        <Link
          href={href}
          className="font-medium text-polotsk-500 underline underline-offset-2 decoration-polotsk-300/60 transition hover:text-polotsk-700 hover:decoration-polotsk-500"
        >
          {children}
        </Link>
      );
    },
  },
  types: {
    imageBlock: ({ value }) => <InlineImage value={value as never} />,
    youtubeBlock: ({ value }) => {
      const v = value as YouTubeBlockValue | undefined;
      return <YouTubeEmbed url={v?.url} caption={v?.caption} />;
    },
  },
};
