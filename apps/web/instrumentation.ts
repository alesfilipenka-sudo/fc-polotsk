import * as Sentry from "@sentry/nextjs";

/**
 * Регистрация Sentry для server и edge runtime. Client init — в
 * instrumentation-client.ts (Next.js 15 автоматически подключает).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Хук Next.js 15 для отчётов request-ошибок в Sentry
export const onRequestError = Sentry.captureRequestError;
