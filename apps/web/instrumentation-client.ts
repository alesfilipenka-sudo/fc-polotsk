import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Session replay — 10% всех сессий и 100% сессий с ошибкой.
  // Если жалко квоту (5k сессий/мес на free) — уменьшить.
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 1.0,
  debug: false,
  enabled: process.env.NODE_ENV === "production",
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
