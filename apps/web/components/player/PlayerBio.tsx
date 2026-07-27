import { PortableText } from "@portabletext/react";
import { portableTextComponents } from "@/lib/portable-text-components";

interface PlayerBioProps {
  bioLong?: unknown;
  bio?: string;
}

/**
 * Био игрока. Приоритет:
 *   1. bioLong — если задано (PortableText, богатый рендер)
 *   2. bio — старое plain-text поле как fallback (рендерится параграфами)
 *   3. null — секция скрывается
 */
export function PlayerBio({ bioLong, bio }: PlayerBioProps) {
  const hasBioLong = Array.isArray(bioLong) && bioLong.length > 0;
  const hasBio = typeof bio === "string" && bio.trim() !== "";

  if (!hasBioLong && !hasBio) return null;

  return (
    <section aria-label="Биография" className="space-y-4">
      <h2 className="font-display text-2xl text-slate-900 md:text-3xl">
        Биография
      </h2>
      <div className="prose-article">
        {hasBioLong ? (
          <PortableText
            value={bioLong as never}
            components={portableTextComponents}
          />
        ) : (
          <p className="whitespace-pre-line">{bio}</p>
        )}
      </div>
    </section>
  );
}
