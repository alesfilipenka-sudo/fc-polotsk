/**
 * FC Polotsk — миграция на справочники сезонов и турниров.
 *
 * До неё турнир хранился строкой в каждом матче («Вторая лига - Витебский
 * дивизион»), а сезона не было вовсе — он угадывался из даты. Из-за этого
 * новый турнир нельзя было завести без правки кода.
 *
 * Скрипт разово:
 *   1. создаёт документы `season` по годам, которые встречаются у матчей;
 *   2. разбирает строки `competition` на турнир и стадию, создаёт `competition`;
 *   3. проставляет матчам ссылки `season`, `tournament` и строку `stage`;
 *   4. проставляет турнирным таблицам `seasonRef` и `tournament`.
 *
 * Старые поля не удаляются: сайт продолжает работать на них, пока чтение не
 * переведено на ссылки. Это делает миграцию безопасной и повторяемой.
 *
 * Запуск:
 *   pnpm --filter @fc-polotsk/studio migrate:seasons            # сухой прогон
 *   pnpm --filter @fc-polotsk/studio migrate:seasons -- --apply # запись
 *
 * Идемпотентный: документы создаются с детерминированными _id, повторный
 * прогон ничего не дублирует.
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

/** Розыгрыши, которые тянутся через зиму — у них подпись вида 2026/27. */
const CROSS_YEAR = new Set(["Кубок Беларуси"]);

const RU_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((c) => RU_LATIN[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * «Вторая лига - Витебский дивизион» → турнир + стадия.
 * «Кубок Беларуси 1/32»              → турнир + стадия.
 * «Вторая лига»                      → турнир без стадии.
 */
function splitCompetition(raw: string): { name: string; stage?: string } {
  const value = raw.trim().replace(/\s+/g, " ");

  const dash = value.split(/\s+[-—–]\s+/);
  if (dash.length > 1) {
    return { name: dash[0].trim(), stage: dash.slice(1).join(" — ").trim() };
  }

  const tail = value.match(/^(.*?)\s+(\d+\/\d+|финал|полуфинал|четвертьфинал)$/i);
  if (tail) return { name: tail[1].trim(), stage: tail[2].trim() };

  return { name: value };
}

/** Минский календарный год матча: дата в базе лежит в UTC. */
function matchYear(iso: string): number {
  const d = new Date(iso);
  return new Date(d.getTime() + 3 * 60 * 60 * 1000).getUTCFullYear();
}

interface MatchDoc {
  _id: string;
  date: string;
  competition?: string;
  season?: { _ref: string };
  tournament?: { _ref: string };
  stage?: string;
}

interface TableDoc {
  _id: string;
  stage?: string;
  season?: string;
  seasonRef?: { _ref: string };
}

async function run() {
  console.log(
    `[migrate-seasons] dataset="${dataset}"  режим=${APPLY ? "ЗАПИСЬ" : "сухой прогон"}`,
  );
  console.log("");

  const matches = await client.fetch<MatchDoc[]>(
    `*[_type == "match"] | order(date asc){ _id, date, competition, season, tournament, stage }`,
  );
  const tables = await client.fetch<TableDoc[]>(
    `*[_type == "standingsTable"]{ _id, stage, season, seasonRef }`,
  );
  console.log(`  Матчей: ${matches.length}, таблиц: ${tables.length}`);

  // --- сезоны --------------------------------------------------------

  const years = [...new Set(matches.map((m) => matchYear(m.date)))].sort();
  const currentYear = years[years.length - 1];

  console.log("");
  console.log(`  Сезоны: ${years.join(", ")}  (текущий — ${currentYear})`);

  // --- турниры -------------------------------------------------------

  const competitions = new Map<string, { name: string; kind: string }>();
  for (const m of matches) {
    if (!m.competition) continue;
    const { name } = splitCompetition(m.competition);
    const kind = /^кубок/i.test(name) ? "cup" : "league";
    competitions.set(name, { name, kind });
  }

  console.log("");
  console.log(`  Турниры (${competitions.size}):`);
  for (const c of competitions.values()) {
    const cross = CROSS_YEAR.has(c.name) ? " · розыгрыш через зиму" : "";
    console.log(`    · ${c.name.padEnd(26)} ${c.kind === "cup" ? "кубок" : "лига"}${cross}`);
  }

  const tx = client.transaction();

  for (const year of years) {
    tx.createIfNotExists({
      _id: `season-${year}`,
      _type: "season",
      year,
      isCurrent: year === currentYear,
    });
  }

  for (const c of competitions.values()) {
    const slug = slugify(c.name);
    tx.createIfNotExists({
      _id: `competition-${slug}`,
      _type: "competition",
      name: c.name,
      slug: { _type: "slug", current: slug },
      kind: c.kind,
      crossYearSeason: CROSS_YEAR.has(c.name),
      order: c.kind === "league" ? 0 : 10,
    });
  }

  // --- проставить ссылки матчам ---------------------------------------

  console.log("");
  let touched = 0;
  for (const m of matches) {
    if (!m.competition) {
      console.log(`  ⚠ ${m._id}: нет строки турнира — пропуск`);
      continue;
    }
    const { name, stage } = splitCompetition(m.competition);
    const year = matchYear(m.date);
    const patch: Record<string, unknown> = {
      season: { _type: "reference", _ref: `season-${year}` },
      tournament: { _type: "reference", _ref: `competition-${slugify(name)}` },
    };
    if (stage) patch.stage = stage;

    tx.patch(m._id, (p) => p.set(patch));
    touched++;
    console.log(
      `    ${m.date.slice(0, 10)}  ${year}  ${name}${stage ? ` · ${stage}` : ""}`,
    );
  }

  // --- проставить ссылки таблицам --------------------------------------

  console.log("");
  for (const t of tables) {
    // Все существующие таблицы — Вторая лига текущего сезона.
    tx.patch(t._id, (p) =>
      p.set({
        seasonRef: { _type: "reference", _ref: `season-${currentYear}` },
        tournament: { _type: "reference", _ref: "competition-vtoraya-liga" },
      }),
    );
    console.log(`  Таблица ${t._id} → сезон ${currentYear}, Вторая лига`);
  }

  console.log("");
  console.log(
    `  Готово к записи: сезонов ${years.length}, турниров ${competitions.size}, матчей ${touched}, таблиц ${tables.length}`,
  );

  if (!APPLY) {
    console.log("");
    console.log("  Сухой прогон — ничего не записано.");
    console.log("  Для записи: pnpm --filter @fc-polotsk/studio migrate:seasons -- --apply");
    return;
  }

  const result = await tx.commit();
  console.log("");
  console.log(`✓ Транзакция закоммичена: ${result.transactionId}`);
  console.log("  Старые строковые поля не тронуты — сайт продолжает работать на них.");
}

run().catch((err) => {
  console.error("✗ migrate-seasons упал:", err);
  process.exit(1);
});
