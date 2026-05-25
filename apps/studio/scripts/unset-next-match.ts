/**
 * FC Polotsk — однократная чистка siteSettings.nextMatch.
 *
 * Поле `nextMatch` (reference на match) удалено из схемы siteSettings:
 * сайт теперь определяет следующий матч автоматически через NEXT_MATCH_QUERY
 * (ближайший scheduled по дате). Само поле в живом документе siteSettings
 * остаётся orphaned — Studio его не покажет, но в Content Lake оно лежит.
 * Этот скрипт делает unset, чтобы документ стал чистым.
 *
 * Запуск:
 *   pnpm --filter @fc-polotsk/studio unset:next-match
 *
 * Требует .env.local с SANITY_STUDIO_PROJECT_ID / SANITY_STUDIO_DATASET /
 * SANITY_STUDIO_WRITE_TOKEN.
 *
 * Идемпотентный — повторный запуск ничего не сломает.
 */

import { config as loadEnv } from "dotenv";
import { createClient } from "@sanity/client";
import { resolve } from "node:path";

loadEnv({ path: resolve(__dirname, "../.env.local") });
loadEnv({ path: resolve(__dirname, "../.env") });

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || "production";
const token = process.env.SANITY_STUDIO_WRITE_TOKEN;

if (!projectId) throw new Error("SANITY_STUDIO_PROJECT_ID is not set");
if (!token) throw new Error("SANITY_STUDIO_WRITE_TOKEN is not set");

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-10-01",
  useCdn: false,
});

async function run() {
  const doc = await client.fetch<{ _id: string; nextMatch?: unknown } | null>(
    `*[_id == "siteSettings"][0]{ _id, nextMatch }`,
  );

  if (!doc) {
    console.log("✗ Документ siteSettings не найден. Ничего не делаю.");
    return;
  }

  if (!doc.nextMatch) {
    console.log("✓ Поле nextMatch уже очищено. Ничего не делаю.");
    return;
  }

  await client.patch("siteSettings").unset(["nextMatch"]).commit();
  console.log("✓ Поле nextMatch удалено из документа siteSettings.");
}

run().catch((err) => {
  console.error("✗ unset-next-match упал:", err);
  process.exit(1);
});
