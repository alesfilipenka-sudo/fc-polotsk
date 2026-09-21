/**
 * FC Polotsk — заливка итоговой таблицы регионального этапа Второй лиги 2026.
 *
 * Зачем отдельный скрипт: блок статистики на главной теперь читает строку
 * ФК Полоцк из турнирной таблицы, а не суммирует матчи (в базе лежат ещё и
 * кубковые игры, из-за чего получалось «28 очков из 13 матчей» вместо 31 из 12).
 *
 * Запуск:
 *   pnpm --filter @fc-polotsk/studio seed:standings            # сухой прогон
 *   pnpm --filter @fc-polotsk/studio seed:standings -- --apply # запись
 *
 * Идемпотентный: перезаписывает singleton `standingsTable` целиком.
 *
 * Требует .env.local: SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET,
 * SANITY_STUDIO_WRITE_TOKEN.
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

const APPLY = process.argv.includes("--apply");

const SEASON = "2026";
const STAGE = "Витебский дивизион";
const IS_FINAL = true;

/**
 * Итоговая таблица регионального этапа. Команды указаны короткими кодами —
 * скрипт находит документы `team` по полю `short`.
 *
 * pos · short · И · В · Н · П · забито · пропущено · очки
 */
const ROWS: Array<[number, string, number, number, number, number, number, number, number]> = [
  [1, "МИО", 12, 11, 0, 1, 36, 10, 33],
  [2, "ПОЛ", 12, 10, 1, 1, 53, 14, 31],
  [3, "ГАЗ", 12, 7, 1, 4, 26, 16, 22],
  [4, "ПСТ", 12, 5, 1, 6, 26, 26, 16],
  [5, "СЕН", 12, 3, 2, 7, 19, 33, 11],
  [6, "ГОР", 12, 2, 0, 10, 13, 38, 6],
  [7, "ОРШ", 12, 1, 1, 10, 4, 40, 4],
];

interface TeamDoc {
  _id: string;
  name: string;
  short?: string;
}

async function run() {
  console.log(
    `[seed-standings] dataset="${dataset}"  режим=${APPLY ? "ЗАПИСЬ" : "сухой прогон"}`,
  );

  const teams = await client.fetch<TeamDoc[]>(
    `*[_type == "team"]{ _id, name, short }`,
  );
  const byShort = new Map(
    teams.filter((t) => t.short).map((t) => [t.short!.toUpperCase(), t]),
  );

  // Сходимость: забитые по лиге должны равняться пропущенным.
  const gf = ROWS.reduce((s, r) => s + r[6], 0);
  const ga = ROWS.reduce((s, r) => s + r[7], 0);
  if (gf !== ga) {
    console.log(`  ⚠ Забито ${gf} ≠ пропущено ${ga} — проверь таблицу`);
  } else {
    console.log(`  ✓ Баланс мячей сходится: ${gf}`);
  }

  const rows = ROWS.map(([pos, short, mp, w, d, l, f, a, pts]) => {
    const team = byShort.get(short.toUpperCase());
    if (!team) throw new Error(`Не найдена команда с short="${short}"`);
    if (w + d + l !== mp) {
      console.log(`  ⚠ ${team.name}: ${w}+${d}+${l} ≠ ${mp} матчей`);
    }
    if (w * 3 + d !== pts) {
      console.log(`  ⚠ ${team.name}: ${w}×3+${d} ≠ ${pts} очков`);
    }
    console.log(
      `  ${pos}. ${team.name.padEnd(22)} ${mp}  ${w}-${d}-${l}  ${f}:${a}  ${pts}`,
    );
    return {
      _key: `row-${pos}`,
      _type: "row",
      pos,
      team: { _type: "reference", _ref: team._id },
      mp,
      w,
      d,
      l,
      gf: f,
      ga: a,
      pts,
    };
  });

  const doc = {
    _id: "standingsTable",
    _type: "standingsTable",
    season: SEASON,
    stage: STAGE,
    isFinal: IS_FINAL,
    updatedAt: new Date().toISOString(),
    rows,
  };

  if (!APPLY) {
    console.log("");
    console.log("  Сухой прогон — ничего не записано.");
    console.log("  Для записи: pnpm --filter @fc-polotsk/studio seed:standings -- --apply");
    return;
  }

  await client.createOrReplace(doc);
  console.log("");
  console.log(`✓ Таблица записана: ${STAGE} ${SEASON}, строк ${rows.length}`);
}

run().catch((err) => {
  console.error("✗ seed-standings упал:", err);
  process.exit(1);
});
