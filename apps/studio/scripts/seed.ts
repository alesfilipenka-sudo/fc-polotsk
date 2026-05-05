/**
 * FC Polotsk — Sanity seed script.
 *
 * Запуск:
 *   pnpm --filter @fc-polotsk/studio seed
 *
 * Требует .env.local в apps/studio/ с переменными:
 *   SANITY_STUDIO_PROJECT_ID
 *   SANITY_STUDIO_DATASET            (default: production)
 *   SANITY_STUDIO_WRITE_TOKEN        (Editor token, sanity.io/manage → API)
 *
 * Скрипт идемпотентный: запускай повторно — данные перезапишутся, дубликатов
 * не будет. Документы используют детерминированные _id (например, team-polotsk),
 * чтобы createOrReplace не плодил клонов.
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

// ─── Teams ────────────────────────────────────────────────────────────────

const TEAMS = [
  { _id: "team-polotsk", name: "ФК Полоцк", short: "ПОЛ", isOwn: true },
  { _id: "team-brest", name: "Динамо-Брест", short: "БРЕ" },
  { _id: "team-minsk", name: "Динамо-Минск", short: "МИН" },
  { _id: "team-bate", name: "БАТЭ", short: "БАТ" },
  { _id: "team-shakhter", name: "Шахтёр", short: "ШАХ" },
  { _id: "team-isloch", name: "Ислочь", short: "ИСЛ" },
];

// ─── Players ──────────────────────────────────────────────────────────────

type Pos = "GK" | "DF" | "MF" | "FW";
const PLAYERS: Array<{ num: number; name: string; pos: Pos; age: number }> = [
  { num: 1, name: "Игрок один", pos: "GK", age: 28 },
  { num: 12, name: "Игрок двенадцать", pos: "GK", age: 22 },
  { num: 2, name: "Игрок два", pos: "DF", age: 24 },
  { num: 4, name: "Игрок четыре", pos: "DF", age: 30 },
  { num: 5, name: "Игрок пять", pos: "DF", age: 26 },
  { num: 15, name: "Игрок пятнадцать", pos: "DF", age: 23 },
  { num: 6, name: "Игрок шесть", pos: "MF", age: 25 },
  { num: 8, name: "Игрок восемь", pos: "MF", age: 22 },
  { num: 10, name: "Игрок десять", pos: "MF", age: 27 },
  { num: 14, name: "Игрок четырнадцать", pos: "MF", age: 24 },
  { num: 9, name: "Игрок девять", pos: "FW", age: 25 },
  { num: 11, name: "Игрок одиннадцать", pos: "FW", age: 23 },
  { num: 17, name: "Игрок семнадцать", pos: "FW", age: 21 },
];

// ─── News ─────────────────────────────────────────────────────────────────

const NEWS = [
  { tag: "Матч", title: "Анонс матча против Бреста", ph: "ph-news-1" },
  { tag: "Команда", title: "Открытая тренировка для болельщиков", ph: "ph-news-2" },
  { tag: "Анонс", title: "Стартовала подготовка к новому туру", ph: "ph-news-3" },
  { tag: "Интервью", title: "Капитан о целях сезона 2025/26", ph: "ph-news-4" },
  { tag: "Тренировка", title: "Сборы команды в Беларуси", ph: "ph-news-5" },
  { tag: "Партнёры", title: "Новый партнёр клуба", ph: "ph-news-6" },
];

// ─── Match ────────────────────────────────────────────────────────────────

const NEXT_MATCH_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  d.setHours(19, 0, 0, 0);
  return d.toISOString();
})();

// ─── Social channels ──────────────────────────────────────────────────────

const SOCIALS = [
  {
    _id: "social-instagram",
    id: "instagram",
    label: "Instagram",
    handle: "@fcpolotsk",
    url: "https://instagram.com/fcpolotsk",
    followers: "—",
    accent: "from-pink-500 via-fuchsia-500 to-orange-400",
    order: 1,
  },
  {
    _id: "social-telegram",
    id: "telegram",
    label: "Telegram",
    handle: "@fcpolotsk",
    url: "https://t.me/fcpolotsk",
    followers: "—",
    accent: "from-sky-400 to-blue-600",
    order: 2,
  },
  {
    _id: "social-vk",
    id: "vk",
    label: "ВКонтакте",
    handle: "fcpolotsk",
    url: "https://vk.com/fcpolotsk",
    followers: "—",
    accent: "from-blue-500 to-indigo-700",
    order: 3,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9а-яё\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Run ──────────────────────────────────────────────────────────────────

async function seed() {
  console.log(
    `\n🌱  Seeding to projectId=${projectId} dataset=${dataset}\n`,
  );
  const tx = client.transaction();

  // Teams
  for (const t of TEAMS) {
    tx.createOrReplace({ _type: "team", ...t });
  }

  // Players
  PLAYERS.forEach((p, i) => {
    tx.createOrReplace({
      _id: `player-${p.num}`,
      _type: "player",
      ...p,
      country: "BLR",
    });
  });

  // News
  NEWS.forEach((n, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i * 3);
    tx.createOrReplace({
      _id: `news-${i + 1}`,
      _type: "news",
      title: n.title,
      slug: { _type: "slug", current: slugify(n.title) || `news-${i + 1}` },
      date: date.toISOString(),
      tag: n.tag,
      excerpt:
        "Короткое описание новости. Это placeholder из seed-скрипта — клуб заменит реальным текстом в Sanity Studio.",
      placeholderClass: n.ph,
    });
  });

  // Match (next)
  tx.createOrReplace({
    _id: "match-next",
    _type: "match",
    date: NEXT_MATCH_DATE,
    competition: "Высшая лига",
    tour: 9,
    home: { _type: "reference", _ref: "team-polotsk" },
    away: { _type: "reference", _ref: "team-brest" },
    venue: 'Стадион "Полоцк"',
    status: "scheduled",
  });

  // Recent matches
  for (let i = 1; i <= 4; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    tx.createOrReplace({
      _id: `match-recent-${i}`,
      _type: "match",
      date: d.toISOString(),
      competition: "Высшая лига",
      tour: 9 - i,
      home: {
        _type: "reference",
        _ref: i % 2 === 0 ? "team-polotsk" : "team-minsk",
      },
      away: {
        _type: "reference",
        _ref: i % 2 === 0 ? "team-isloch" : "team-polotsk",
      },
      status: "finished",
      hs: Math.floor(Math.random() * 3),
      as: Math.floor(Math.random() * 3),
    });
  }

  // Standings (singleton)
  tx.createOrReplace({
    _id: "standingsTable",
    _type: "standingsTable",
    season: "2025/26",
    updatedAt: new Date().toISOString(),
    rows: [
      { _key: "r1", pos: 1, team: { _type: "reference", _ref: "team-bate" }, mp: 8, pts: 20 },
      { _key: "r2", pos: 2, team: { _type: "reference", _ref: "team-minsk" }, mp: 8, pts: 18 },
      { _key: "r3", pos: 3, team: { _type: "reference", _ref: "team-polotsk" }, mp: 8, pts: 14 },
      { _key: "r4", pos: 4, team: { _type: "reference", _ref: "team-brest" }, mp: 8, pts: 13 },
      { _key: "r5", pos: 5, team: { _type: "reference", _ref: "team-shakhter" }, mp: 8, pts: 11 },
    ],
  });

  // Socials
  for (const s of SOCIALS) {
    tx.createOrReplace({ _type: "socialChannel", ...s });
  }

  // Site settings (singleton)
  tx.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    heroBadge: "Сезон 2025/26 · Высшая лига",
    heroLine1: "НОВАЯ",
    heroLine2: "ЭРА",
    heroSubtitle:
      "ФК Полоцк — клуб с историей и амбициями. Следи за командой, ближайшими матчами и новостями клуба.",
    city: "Полоцк, Беларусь",
    nextMatch: { _type: "reference", _ref: "match-next" },
    phone: "+375 (00) 000-00-00",
    email: "info@fcpolotsk.by",
    address: "Полоцк, Беларусь",
    footerDescription:
      "Профессиональный футбольный клуб из Полоцка. Высшая лига Беларуси.",
    establishedYear: 2019,
  });

  const result = await tx.commit();
  console.log(`✅  Done. ${result.results.length} documents written.`);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
