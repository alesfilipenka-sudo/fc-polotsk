import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/constants";

/**
 * Display font: Oswald.
 *
 * Bebas Neue (originally specified in the design handoff) does NOT ship a
 * cyrillic subset on Google Fonts. We swap to Oswald — same condensed-sans
 * character, full cyrillic coverage, variable weight 200–700.
 */
const display = Oswald({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

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
    <html lang="ru" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
