/**
 * FC Polotsk — миграция: сгенерить slug у всех существующих игроков.
 *
 * После того как поле `slug` было добавлено в player-схему (Sprint 2 Push 1),
 * старые документы остались без slug. Этот скрипт находит их, транслитерует
 * имя в латиницу и записывает slug в Sanity.
 *
 * Уникальность:
 *   - Если у двух игроков одинаковое имя → второй получит -2, третий -3 и т.д.
 *   - Если slug уже занят другим документом (например админ ввёл руками) →
 *     тоже суффикс.
 *
 * Запуск:
 *   pnpm --filter @fc-polotsk/studio backfill:player-slugs
 *
 * Требует .env.local: SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET,
 * SANITY_STUDIO_WRITE_TOKEN.
 *
 * Идемпотентный: игроки с уже заполненным slug пропускаются.
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

/**
 * Тот же транслит что и в apps/studio/schemas/player.ts.
 * Дублируем чтобы скрипт был автономным.
 */
const RU_LATIN_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
  я: "ya",
};

function slugifyName(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((c) => RU_LATIN_MAP[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

interface Row {
  _id: string;
  name?: string;
  num?: number;
  slug?: { current?: string };
}

async function run() {
  console.log(
    `[backfill-player-slugs] dataset="${dataset}" — ищу игроков без slug…`,
  );

  // 1. Все игроки в базе — нужно знать существующие slug'и для проверки уникальности
  const all = await client.fetch<Row[]>(
    `*[_type == "player"]{ _id, name, num, "slug": slug }`,
  );
  console.log(`  Всего игроков в БД: ${all.length}`);

  // Собираем существующие slug'и в Set
  const takenSlugs = new Set<string>();
  for (const p of all) {
    const s = p.slug?.current;
    if (s) takenSlugs.add(s);
  }

  // 2. Кто без slug?
  const needsBackfill = all.filter((p) => !p.slug?.current);
  console.log(`  Игроков без slug: ${needsBackfill.length}`);

  if (needsBackfill.length === 0) {
    console.log("✓ Ничего делать не нужно — у всех уже есть slug.");
    return;
  }

  // 3. Генерим slug для каждого + разрешаем коллизии
  const tx = client.transaction();
  const assigned: Array<{ id: string; name: string; slug: string }> = [];

  for (const p of needsBackfill) {
    if (!p.name) {
      console.log(`  ⚠ Пропуск ${p._id}: у игрока нет name`);
      continue;
    }

    const base = slugifyName(p.name);
    if (!base) {
      console.log(`  ⚠ Пропуск ${p._id} (${p.name}): пустой slug после транслита`);
      continue;
    }

    // Уникальность: если base занят — пробуем base-2, base-3 …
    let candidate = base;
    let n = 2;
    while (takenSlugs.has(candidate)) {
      candidate = `${base}-${n}`;
      n++;
    }
    takenSlugs.add(candidate);

    tx.patch(p._id, (patch) =>
      patch.set({
        slug: { _type: "slug", current: candidate },
      }),
    );
    assigned.push({ id: p._id, name: p.name, slug: candidate });
  }

  console.log("");
  console.log("  Присваиваю slug'и:");
  for (const a of assigned) {
    console.log(`    · ${a.name.padEnd(40)} → /player/${a.slug}`);
  }

  const result = await tx.commit();
  console.log("");
  console.log(`✓ Транзакция закоммичена: ${result.transactionId}`);
  console.log(`  Обновлено документов: ${assigned.length}`);
}

run().catch((err) => {
  console.error("✗ backfill-player-slugs упал:", err);
  process.exit(1);
});
