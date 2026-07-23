"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

/**
 * Глобальный error boundary. Ловит ошибки на любой странице (в т.ч. в
 * root layout), отправляет в Sentry, показывает пользователю плашку.
 *
 * Файл ОБЯЗАН иметь "use client" и вернуть <html> — это единственная
 * точка Next.js где нужно рендерить весь документ, потому что мы за
 * пределами RootLayout при критической ошибке.
 */
interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ru">
      <body className="flex min-h-screen items-center justify-center bg-ink text-white">
        <div className="max-w-md px-6 text-center">
          <p className="mb-2 text-xs uppercase tracking-eyebrow text-polotsk-300">
            Ошибка
          </p>
          <h1 className="mb-4 font-display text-3xl md:text-5xl">
            Что-то пошло не так
          </h1>
          <p className="mb-6 text-sm text-white/70">
            Мы уже получили уведомление и разбираемся. Попробуй обновить
            страницу — если не поможет, приходи чуть позже.
          </p>
          {error.digest && (
            <p className="mb-6 font-mono text-[10px] text-white/40">
              Код: {error.digest}
            </p>
          )}
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-polotsk-700 transition hover:bg-polotsk-50"
            >
              Попробовать снова
            </button>
            <Link
              href="/"
              className="rounded-full border border-white/30 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10"
            >
              На главную
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
