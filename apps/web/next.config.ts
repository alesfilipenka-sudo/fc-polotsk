import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  typescript: {
    // Temporary: skip TS check on build until React 19 + Sanity React 18
    // type collision is resolved (Phase 3 cleanup).
    ignoreBuildErrors: true,
  },
};

/**
 * Sentry wrapper: включает автоматическую обработку ошибок сборки,
 * оптимизацию бандла, загрузку source maps (если заданы SENTRY_ORG,
 * SENTRY_PROJECT, SENTRY_AUTH_TOKEN — иначе просто пропускает).
 */
export default withSentryConfig(nextConfig, {
  // Source maps upload — только если заданы env vars.
  // Для MVP без source maps: не задаём SENTRY_AUTH_TOKEN → загрузка отключена.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Тихий вывод в CI (Vercel).
  silent: !process.env.CI,

  // Загружать client bundle шире (для лучших stack traces).
  widenClientFileUpload: true,

  // Отключить Sentry's console logger в проде.
  disableLogger: true,

  // Продолжить билд даже если что-то с Sentry-настройкой пошло не так.
  automaticVercelMonitors: false,
});
