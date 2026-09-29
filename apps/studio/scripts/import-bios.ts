/**
 * FC Polotsk — заливка биографий игроков из markdown-файлов в Sanity.
 *
 * Пишем в поле `bioLong` (PortableText) — именно его показывает страница
 * /player/[slug]; старое текстовое `bio` остаётся fallback'ом и не трогается.
 *
 * Как устроено:
 *   apps/studio/data/bios/<slug>.md — один файл на игрока,
 *   имя файла = slug игрока в Sanity (например ostrouh-yuriy.md).
 *   Абзацы разделяются пустой строкой, каждый становится блоком.
 *   Строки, начинающиеся с `>` в самом начале файла, считаются заметкой
 *   для редактора (источники и т.п.) и в Sanity не попадают.
 *
 * Запуск:
 *   pnpm --filter @fc-polotsk/studio import:bios            # сухой прогон
 *   pnpm --filter @fc-polotsk/studio import:bios -- --apply # запись
 *
 * Флаги:
 *   --apply           выполнить запись
 *   --only=<slug>     залить биографию одного игрока
 *
 * Идемпотентный: bioLong перезаписывается целиком из файла, дублей нет.
 * Правки, сделанные в Studio руками, при перезапуске затрутся — источник
 * истины для залитых биографий это файлы.
 *
 * Требует .env.local: SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET,
 * SANITY_STUDIO_WRITE_TOKEN.
 */

import { config as loadEnv } from "dotenv";
import { createClient } from "@sanity/client";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, basename } from "node:path";

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

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const onlyArg = args.find((a) => a.startsWith("--only="));
const ONLY = onlyArg ? onlyArg.slice("--only=".length) : undefined;

const BIOS_DIR = resolve(__dirname, "../data/bios");

/** Абзацы markdown → блоки PortableText. */
function toPortableText(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p, i) => ({
      _type: "block",
      _key: `bio-${i + 1}`,
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: `bio-${i + 1}-0`,
          text: p.replace(/\s*\n\s*/g, " "),
          marks: [],
        },
      ],
    }));
}

/** Убирает шапку с заметками редактора (строки `>` в начале файла). */
function stripEditorNote(raw: string): string {
  const lines = raw.replace(/^﻿/, "").split("\n");
  let i = 0;
  while (i < lines.length && (lines[i].startsWith(">") || lines[i].trim() === "")) i++;
  return lines.slice(i).join("\n").trim();
}

interface PlayerDoc {
  _id: string;
  name: string;
  slug?: string;
}

async function run() {
  console.log(
    `[import-bios] dataset="${dataset}"  режим=${APPLY ? "ЗАПИСЬ" : "сухой прогон"}`,
  );
  console.log(`  файлы: ${BIOS_DIR}`);

  if (!existsSync(BIOS_DIR)) {
    throw new Error(`Нет папки с биографиями: ${BIOS_DIR}`);
  }

  const files = readdirSync(BIOS_DIR)
    .filter((f) => f.endsWith(".md"))
    .filter((f) => !ONLY || basename(f, ".md") === ONLY);

  if (files.length === 0) {
    console.log("  Нечего заливать — не найдено ни одного .md");
    return;
  }

  const players = await client.fetch<PlayerDoc[]>(
    `*[_type == "player" && defined(slug.current)]{ _id, name, "slug": slug.current }`,
  );
  const bySlug = new Map(players.map((p) => [p.slug!, p]));

  console.log(`  Файлов: ${files.length}, игроков в базе: ${players.length}`);
  console.log("");

  const tx = client.transaction();
  let planned = 0;
  const missing: string[] = [];

  for (const file of files) {
    const slug = basename(file, ".md");
    const player = bySlug.get(slug);
    if (!player) {
      missing.push(slug);
      continue;
    }

    const raw = readFileSync(resolve(BIOS_DIR, file), "utf8");
    const body = stripEditorNote(raw);
    if (!body) {
      console.log(`  ⚠ ${slug}: файл пустой — пропуск`);
      continue;
    }

    const blocks = toPortableText(body);
    tx.patch(player._id, (p) => p.set({ bioLong: blocks }));
    planned++;

    const words = body.split(/\s+/).length;
    console.log(
      `  ${String(planned).padStart(3)}. ${player.name.trim().padEnd(28)} ${blocks.length} абз. · ${words} сл.`,
    );
  }

  if (missing.length) {
    console.log("");
    console.log(`  ⚠ Нет игрока с таким slug (${missing.length}):`);
    for (const s of missing) console.log(`      ${s}.md`);
    console.log("    Проверь имя файла — оно должно совпадать со slug в Sanity.");
  }

  console.log("");
  console.log(`  Готово к записи: ${planned}`);

  if (!APPLY) {
    console.log("");
    console.log("  Сухой прогон — ничего не записано.");
    console.log("  Для записи: pnpm --filter @fc-polotsk/studio import:bios -- --apply");
    return;
  }

  if (planned === 0) {
    console.log("  Нечего записывать.");
    return;
  }

  const result = await tx.commit();
  console.log("");
  console.log(`✓ Транзакция закоммичена: ${result.transactionId}`);
}

run().catch((err) => {
  console.error("✗ import-bios упал:", err);
  process.exit(1);
});
