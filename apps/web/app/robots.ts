import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

/**
 * robots.txt — разрешаем индексировать всё, кроме админки матчей.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/match-admin/", "/api/"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
