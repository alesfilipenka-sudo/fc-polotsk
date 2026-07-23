import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // 10% транзакций для performance monitoring. Можно поднять при малой нагрузке.
  tracesSampleRate: 0.1,
  // Не спамить консоль локально
  debug: false,
  // Игнорировать не-critical ошибки на dev
  enabled: process.env.NODE_ENV === "production",
});
