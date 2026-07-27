import { ImageResponse } from "next/og";
import { sanityFetch } from "@/lib/sanity";
import { PLAYER_BY_SLUG_QUERY } from "@/lib/queries";
import type { PlayerDetail } from "@/components/player/types";
import { POS_LABEL, SITE } from "@/lib/constants";

/**
 * Динамическая OG-обложка для страницы игрока.
 *
 * Открой этот URL в браузере чтобы проверить как выглядит:
 *   /player/[slug]/opengraph-image
 *
 * Изображение автоматически подхватится Twitter, Slack, Telegram, WhatsApp
 * когда кто-то шарит ссылку — при условии что Next выставит og:image URL
 * (что он и делает по конвенции для файла с именем opengraph-image).
 */

// Edge runtime не подходит — sanityFetch использует Node-специфичные
// возможности (next/cache revalidate). Используем дефолтный Node runtime.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Params {
  params: Promise<{ slug: string }>;
}

export default async function OpengraphImage({ params }: Params) {
  const { slug } = await params;
  const player = await sanityFetch<PlayerDetail | null>(
    PLAYER_BY_SLUG_QUERY,
    { slug },
  );

  if (!player) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#0a1628",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
          }}
        >
          {SITE.name}
        </div>
      ),
      size,
    );
  }

  const posLabel = POS_LABEL[player.pos] ?? player.pos;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #0a1628 0%, #163a6b 55%, #1e5aa8 100%)",
          color: "white",
          display: "flex",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Left column — text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          {/* Top: kicker */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                fontSize: 20,
                textTransform: "uppercase",
                letterSpacing: 4,
                color: "#7fb0e6",
                fontWeight: 700,
              }}
            >
              {SITE.name} · Состав {SITE.season}
            </div>
          </div>

          {/* Center: name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "flex",
                gap: 12,
              }}
            >
              <div
                style={{
                  padding: "8px 20px",
                  background: "#1e5aa8",
                  borderRadius: 999,
                  fontSize: 20,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                {posLabel}
              </div>
              {player.num != null && (
                <div
                  style={{
                    padding: "8px 20px",
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 999,
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  № {player.num}
                </div>
              )}
            </div>
            <div
              style={{
                fontSize: 96,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: -2,
              }}
            >
              {player.name}
            </div>
          </div>

          {/* Bottom: url */}
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.6)",
              fontWeight: 500,
            }}
          >
            fcpolotsk.by
          </div>
        </div>

        {/* Right column — photo (if available) */}
        {player.photoUrl && (
          <div
            style={{
              width: 420,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={player.photoUrl}
              alt=""
              width={420}
              height={510}
              style={{
                width: 420,
                height: 510,
                objectFit: "cover",
                objectPosition: "center top",
                borderRadius: 24,
              }}
            />
          </div>
        )}
      </div>
    ),
    size,
  );
}
