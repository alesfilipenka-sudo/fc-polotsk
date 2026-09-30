/**
 * FC Polotsk — завести игрока из командной строки.
 *
 * Нужен там, где игрока проще создать вместе с импортом протокола, чем
 * руками: автор гола резолвится по полному имени, и опечатка в Studio
 * молча превратит своего игрока в строку «соперник». Скрипт задаёт имя
 * ровно в том виде, в каком оно потом встретится в CSV.
 *
 * Всё то же самое делается через Studio (Игроки → Создать) — это ускорение,
 * а не единственный путь.
 *
 * Запуск:
 *   pnpm --filter @fc-polotsk/studio add:player -- --name="Коноплев Артем" --num=23 --pos=MF
 *   ... --apply     # без флага только показывает, что будет создано
 *
 * Флаги:
 *   --name=  полное имя «Фамилия Имя» (обязательно)
 *   --num=   игровой номер
 *   --pos=   GK | DF | MF | FW | COACH
 *   --age=   возраст (в схеме обязателен; без него Studio пометит карточку)
 *   --slug=  переопределить slug, по умолчанию транслитерация имени
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

function flag(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
}

const RU_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
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

const POSITIONS = new Set(["GK", "DF", "MF", "FW", "COACH"]);

interface PlayerLite {
  _id: string;
  name: string;
  num?: number;
  isArchived?: boolean;
}

async function run() {
  const name = flag("name")?.trim();
  if (!name) throw new Error('Укажи --name="Фамилия Имя"');

  const pos = (flag("pos") ?? "MF").toUpperCase();
  if (!POSITIONS.has(pos)) {
    throw new Error(`--pos должен быть одним из: ${[...POSITIONS].join(", ")}`);
  }

  const numRaw = flag("num");
  const num = numRaw ? Number.parseInt(numRaw, 10) : undefined;
  const ageRaw = flag("age");
  const age = ageRaw ? Number.parseInt(ageRaw, 10) : undefined;
  const slug = flag("slug")?.trim() || slugify(name);

  const existing = await client.fetch<PlayerLite[]>(
    `*[_type == "player"]{ _id, name, num, isArchived }`,
  );

  console.log(
    `[add-player] dataset="${dataset}"  режим=${APPLY ? "ЗАПИСЬ" : "сухой прогон"}`,
  );
  console.log("");

  const sameName = existing.find(
    (p) => p.name.trim().toLowerCase() === name.toLowerCase(),
  );
  if (sameName) {
    console.log(`  Игрок «${name}» уже есть (${sameName._id}) — ничего не делаю.`);
    return;
  }

  // Номер занят — не ошибка (бывает у ушедшего игрока), но предупредить надо.
  if (num !== undefined) {
    const taken = existing.filter((p) => p.num === num && !p.isArchived);
    if (taken.length > 0) {
      console.log(
        `  ⚠ Номер ${num} уже у: ${taken.map((p) => p.name).join(", ")}`,
      );
    }
  }

  const doc: Record<string, unknown> = {
    _id: `player-${slug}`,
    _type: "player",
    name,
    slug: { _type: "slug", current: slug },
    pos,
    country: "BLR",
    isArchived: false,
  };
  if (num !== undefined) doc.num = num;
  if (age !== undefined) doc.age = age;

  console.log(`  Имя:      ${name}`);
  console.log(`  Slug:     ${slug}   → /player/${slug}`);
  console.log(`  Номер:    ${num ?? "—"}`);
  console.log(`  Позиция:  ${pos}`);
  console.log(`  Возраст:  ${age ?? "— (в схеме обязателен, заполни в Studio)"}`);

  if (!APPLY) {
    console.log("");
    console.log("  Сухой прогон — ничего не записано. Для записи добавь --apply");
    return;
  }

  await client.createIfNotExists(doc as never);
  console.log("");
  console.log(`✓ Создан ${doc._id}`);
}

run().catch((err) => {
  console.error("✗ add-player упал:", err.message ?? err);
  process.exit(1);
});
