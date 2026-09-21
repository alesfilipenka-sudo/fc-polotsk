/**
 * FC Polotsk — заливка турнирных таблиц.
 *
 * Таблиц несколько, по документу на этап: региональный (Витебский дивизион,
 * сыгран) и финальный (группа B, идёт). На сайте они переключаются табами
 * в матч-центре, порядок задаёт поле `order`.
 *
 * Блок статистики внизу главной читает ту таблицу, у которой `seasonStats`,
 * — сейчас это региональный этап как итог сезона.
 *
 * Запуск:
 *   pnpm --filter @fc-polotsk/studio seed:standings            # сухой прогон
 *   pnpm --filter @fc-polotsk/studio seed:standings -- --apply # запись
 *
 * Идемпотентный: документы перезаписываются по детерминированным _id.
 * Команды ищутся по названию или короткому коду — те, которых ещё нет,
 * создаёт импортёр матчей (`import:matches -- --create-teams`), поэтому
 * его запускают первым.
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

/** pos · команда (название или short) · И · В · Н · П · забито · пропущено · очки */
type Row = [number, string, number, number, number, number, number, number, number];

interface TableSpec {
  id: string;
  season: string;
  stage: string;
  order: number;
  isFinal: boolean;
  seasonStats: boolean;
  totalMatches: number;
  rows: Row[];
}

const TABLES: TableSpec[] = [
  {
    // Оставляем прежний _id: документ уже есть в базе, менять его незачем.
    id: "standingsTable",
    season: "2026",
    stage: "Витебский дивизион",
    order: 0,
    isFinal: true,
    seasonStats: true,
    totalMatches: 12,
    rows: [
      [1, "МИО", 12, 11, 0, 1, 36, 10, 33],
      [2, "ПОЛ", 12, 10, 1, 1, 53, 14, 31],
      [3, "ГАЗ", 12, 7, 1, 4, 26, 16, 22],
      [4, "ПСТ", 12, 5, 1, 6, 26, 26, 16],
      [5, "СЕН", 12, 3, 2, 7, 19, 33, 11],
      [6, "ГОР", 12, 2, 0, 10, 13, 38, 6],
      [7, "ОРШ", 12, 1, 1, 10, 4, 40, 4],
    ],
  },
  {
    id: "standings-final-2026-b",
    season: "2026",
    stage: "Финальный этап, группа B",
    order: 1,
    isFinal: false,
    seasonStats: false,
    // 6 команд, два круга.
    totalMatches: 10,
    rows: [
      [1, "Торпедо-БелАЗ-2", 3, 3, 0, 0, 9, 3, 9],
      [2, "МЛ Витебск-2", 3, 2, 1, 0, 5, 2, 7],
      [3, "БГУ", 3, 1, 1, 1, 5, 5, 4],
      [4, "ПОЛ", 3, 1, 0, 2, 6, 8, 3],
      [5, "Друть", 3, 0, 1, 2, 2, 4, 1],
      [6, "ГАЗ", 3, 0, 1, 2, 0, 5, 1],
    ],
  },
];

interface TeamDoc {
  _id: string;
  name: string;
  short?: string;
}

const norm = (s: string) =>
  s.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();

async function run() {
  console.log(
    `[seed-standings] dataset="${dataset}"  режим=${APPLY ? "ЗАПИСЬ" : "сухой прогон"}`,
  );

  const teams = await client.fetch<TeamDoc[]>(
    `*[_type == "team"]{ _id, name, short }`,
  );
  const index = new Map<string, TeamDoc>();
  for (const t of teams) {
    index.set(norm(t.name), t);
    if (t.short) index.set(norm(t.short), t);
  }

  const docs = TABLES.map((spec) => {
    console.log("");
    console.log(`  ▸ ${spec.stage} (${spec.season})${spec.seasonStats ? "  ← блок статистики" : ""}`);

    const gf = spec.rows.reduce((s, r) => s + r[6], 0);
    const ga = spec.rows.reduce((s, r) => s + r[7], 0);
    if (gf !== ga) {
      console.log(`    ⚠ забито ${gf} ≠ пропущено ${ga} — проверь таблицу`);
    } else {
      console.log(`    ✓ баланс мячей сходится: ${gf}`);
    }

    const rows = spec.rows.map(([pos, key, mp, w, d, l, f, a, pts]) => {
      const team = index.get(norm(key));
      if (!team) {
        throw new Error(
          `Не найдена команда "${key}". Сначала прогони import:matches -- --create-teams`,
        );
      }
      if (w + d + l !== mp) console.log(`    ⚠ ${team.name}: ${w}+${d}+${l} ≠ ${mp}`);
      if (w * 3 + d !== pts) console.log(`    ⚠ ${team.name}: ${w}×3+${d} ≠ ${pts}`);
      console.log(
        `    ${pos}. ${team.name.padEnd(22)} ${mp}  ${w}-${d}-${l}  ${f}:${a}  ${pts}`,
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

    return {
      _id: spec.id,
      _type: "standingsTable",
      season: spec.season,
      stage: spec.stage,
      order: spec.order,
      isFinal: spec.isFinal,
      seasonStats: spec.seasonStats,
      totalMatches: spec.totalMatches,
      updatedAt: new Date().toISOString(),
      rows,
    };
  });

  const statsTables = TABLES.filter((t) => t.seasonStats);
  if (statsTables.length !== 1) {
    console.log("");
    console.log(
      `  ⚠ Флаг «источник блока статистики» стоит у ${statsTables.length} таблиц — должен ровно у одной.`,
    );
  }

  if (!APPLY) {
    console.log("");
    console.log("  Сухой прогон — ничего не записано.");
    console.log("  Для записи: pnpm --filter @fc-polotsk/studio seed:standings -- --apply");
    return;
  }

  const tx = client.transaction();
  for (const doc of docs) tx.createOrReplace(doc);
  await tx.commit();

  console.log("");
  console.log(`✓ Записано таблиц: ${docs.length}`);
  for (const d of docs) console.log(`      ${d._id} — ${d.stage}`);
}

run().catch((err) => {
  console.error("✗ seed-standings упал:", err);
  process.exit(1);
});
