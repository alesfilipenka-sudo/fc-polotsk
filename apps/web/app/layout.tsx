import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/constants";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
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
    <html lang="ru" className={`${bebas.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
