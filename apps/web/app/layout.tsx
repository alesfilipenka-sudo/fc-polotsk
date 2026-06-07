import type { Metadata } from "next";
import "./globals.css";
import { SITE } from "@/lib/constants";

const DESCRIPTION = `${SITE.name} — официальная страница футбольного клуба из одноимённого города. Расписание матчей, состав команды, новости.`;

export const metadata: Metadata = {
  title: `${SITE.name} — официальный сайт`,
  description: DESCRIPTION,
  metadataBase: new URL(SITE.url),
  openGraph: {
    title: `${SITE.name} — официальный сайт`,
    description: DESCRIPTION,
    url: SITE.url,
    siteName: SITE.name,
    locale: "ru_BY",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: `${SITE.name} — логотип клуба`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — официальный сайт`,
    description: DESCRIPTION,
    images: ["/logo.png"],
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
