/**
 * FC Polotsk — backfill `finishedAt` for legacy finished matches.
 *
 * После того как мы добавили поле `finishedAt` в схему `match`, у старых
 * документов со статусом "finished" этого поля нет. Сайт использует
 * `coalesce(finishedAt, date)` в GROQ — то есть всё работает, но карточка
 * пост-матч окна в Hero будет считать 48 часов от ВРЕМЕНИ НАЧАЛА матча,
 * а не от финального свистка. Для будущих матчей админ заполняет
 * `finishedAt` руками. Для исторических — гоним этот скрипт один раз.
 *
 * Что делает: находит все *[_type == "match" && status == "finished" && !defined(finishedAt)]
 * и проставляет finishedAt = date + 2 часа (типичная длительность матча).
 *
 * Запуск:
 *   pnpm --filter @fc-polotsk/studio backfill:finishedAt
 *
 * Требует .env.local в apps/studio/ с переменными:
 *   SANITY_STUDIO_PROJECT_ID
 *   SANITY_STUDIO_DATASET            (default: production)
 *   SANITY_STUDIO_WRITE_TOKEN        (Editor token, sanity.io/manage → API)
 *
 * Идемпотентный — после проставления поля повторный запуск ничего не делает.
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

// Длительность типичного матча — два часа от начала. Этого хватает чтобы
// 48-часовое окно считалось примерно от реального финального свистка.
const MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

async function run() {
  type Row = { _id: string; date: string };
  const rows = await client.fetch<Row[]>(
    `*[_type == "match" && status == "finished" && !defined(finishedAt)]{
      _id,
      date
    }`,
  );

  if (rows.length === 0) {
    console.log("✓ Все finished-матчи уже имеют finishedAt. Ничего не делаю.");
    return;
  }

  console.log(`Найдено ${rows.length} матч(ей) без finishedAt:`);
  for (const r of rows) console.log(`  · ${r._id} (date=${r.date})`);

  const tx = client.transaction();
  for (const r of rows) {
    const finishedAt = new Date(
      new Date(r.date).getTime() + MATCH_DURATION_MS,
    ).toISOString();
    tx.patch(r._id, (p) => p.set({ finishedAt }));
  }
  const result = await tx.commit();
  console.log(`✓ Закоммитили транзакцию: ${result.transactionId}`);
  console.log(`  Обновлено документов: ${rows.length}`);
}

run().catch((err) => {
  console.error("✗ Backfill упал:", err);
  process.exit(1);
});
