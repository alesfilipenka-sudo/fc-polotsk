import type { Metadata } from "next";
import "./globals.css";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE.name} — Официальный сайт футбольного клуба`,
  description: `${SITE.name} — профессиональный футбольный клуб из Полоцка. ${SITE.league} Беларуси. Расписание матчей, состав команды, новости клуба.`,
  metadataBase: new URL(SITE.url),
  openGraph: {
    title: `${SITE.name} — Официальный сайт`,
    description: `${SITE.name}. ${SITE.league} Беларуси, сезон ${SITE.season}.`,
    url: SITE.url,
    siteName: SITE.name,
    locale: "ru_BY",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
