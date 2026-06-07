/**
 * FC Polotsk — seed скрипт для эпох истории клуба.
 *
 * Создаёт 7 документов historyEra с готовыми текстами из дизайн-хэндоффа.
 * Фото загружаешь руками в Studio после запуска (поле photo у каждой эпохи
 * останется пустым, на сайте будет fallback-плейсхолдер).
 *
 * Запуск:
 *   pnpm --filter @fc-polotsk/studio seed:history
 *
 * Идемпотентный: использует фиксированные _id (history-origin, history-bssr...),
 * createOrReplace перезапишет данные без дубликатов. Если ты УЖЕ что-то правил
 * вручную (например загрузил photo), повторный запуск ЗАТРЁТ эти правки —
 * запускай только когда нужно сбросить тексты к эталону.
 *
 * Требует .env.local в apps/studio/ с SANITY_STUDIO_PROJECT_ID,
 * SANITY_STUDIO_DATASET, SANITY_STUDIO_WRITE_TOKEN.
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

interface EraSeed {
  _id: string;
  order: number;
  eraId: string;
  year: string;
  range: string;
  tone: string;
  kicker: string;
  name: string;
  lead: string;
  body: string;
  facts: Array<{ _key: string; icon: string; t: string; d: string }>;
}

function k(i: number) {
  return `fact-${Math.random().toString(36).slice(2, 8)}-${i}`;
}

const ERAS: EraSeed[] = [
  {
    _id: "history-origin",
    order: 1,
    eraId: "origin",
    year: "1905",
    range: "1905 — 1917",
    tone: "sepia",
    kicker: "Истоки",
    name: "Первый мяч на плацу",
    lead: "Футбол пришёл в Полоцк через кадетский корпус.",
    body: "Кожаный мяч в древний город привёз из Петербурга инспектор классов полковник Энгельгардт. Местом для первых игр стал громадный плац кадетского корпуса, а воротами — вбитые в землю колья. Полоцкому футболу — более 120 лет: по архивным данным он старше многих признанных центров белорусского футбола.",
    facts: [
      {
        _key: k(0),
        icon: "Flag",
        t: "~1905–06",
        d: "Первый футбольный мяч в городе",
      },
      {
        _key: k(1),
        icon: "Landmark",
        t: "Кадетский корпус",
        d: "Колыбель полоцкого футбола",
      },
      {
        _key: k(2),
        icon: "Award",
        t: "Старейший",
        d: "Один из первых центров футбола в Беларуси",
      },
    ],
  },
  {
    _id: "history-bssr",
    order: 2,
    eraId: "bssr",
    year: "1928",
    range: "1918 — 1930-е",
    tone: "bssr",
    kicker: "Эпоха БССР",
    name: "На пороге титула",
    lead: "Сборная Полоцка — среди сильнейших молодой республики.",
    body: "После товарищеских матчей 1918 года и первенства Витебской губернии полоцкий футбол быстро вышел на республиканский уровень. В 1927-м команда участвовала в первом чемпионате Беларуси, а год спустя дошла до финала Всебелорусской спартакиады — и была в шаге от золота, уступив в решающем матче Гомелю.",
    facts: [
      {
        _key: k(0),
        icon: "Trophy",
        t: "Финал-1928",
        d: "Всебелорусская спартакиада — серебро, шаг до титула",
      },
      {
        _key: k(1),
        icon: "Users",
        t: "1927",
        d: "Участник первого чемпионата Беларуси",
      },
      {
        _key: k(2),
        icon: "Shield",
        t: "1924",
        d: "Команда Полоцкого погранотряда",
      },
    ],
  },
  {
    _id: "history-soviet",
    order: 3,
    eraId: "soviet",
    year: "1975",
    range: "1950-е — 1980-е",
    tone: "soviet",
    kicker: "Заводская эра",
    name: "Команды большого Полоцка",
    lead: "«Стекловолокно», «Спартак», «Торпедо», «Пищевик».",
    body: "В советские десятилетия футбол в городе держался на заводских и ведомственных командах. Главный успех периода — «Стекловолокно» в 1975 году стало чемпионом Придвинского края, а воспитанники Полоцка пробивались в команды мастеров, включая витебскую «Двину» класса «А» второй лиги СССР.",
    facts: [
      {
        _key: k(0),
        icon: "Trophy",
        t: "1975",
        d: "«Стекловолокно» — чемпион Придвинского края",
      },
      {
        _key: k(1),
        icon: "Factory",
        t: "4+ клуба",
        d: "Стекловолокно · Спартак · Торпедо · Пищевик",
      },
      {
        _key: k(2),
        icon: "TrendingUp",
        t: "Школа",
        d: "Воспитанники — в командах мастеров СССР",
      },
    ],
  },
  {
    _id: "history-fcpolotsk",
    order: 4,
    eraId: "fcpolotsk",
    year: "2004",
    range: "2004 — 2013",
    tone: "modern",
    kicker: "Суверенная Беларусь",
    name: "ФК «Полоцк» в Первой лиге",
    lead: "Профессиональный клуб на карте белорусского футбола.",
    body: "Созданный в 2004 году ФК «Полоцк» с 2006-го закрепился в Первой лиге чемпионата Беларуси и провёл там целую эпоху — семь сезонов среди профессионалов. В 2013-м клуб прекратил существование из-за нехватки финансирования, но имя «Полоцк» уже прочно вошло в историю национального футбола.",
    facts: [
      {
        _key: k(0),
        icon: "Medal",
        t: "2006–2013",
        d: "7 сезонов в Первой лиге Беларуси",
      },
      {
        _key: k(1),
        icon: "Calendar",
        t: "2004",
        d: "Основание профессионального клуба",
      },
      {
        _key: k(2),
        icon: "MapPin",
        t: "Стадион «Спартак»",
        d: "Домашняя арена в Полоцке",
      },
    ],
  },
  {
    _id: "history-gaz",
    order: 5,
    eraId: "gaz",
    year: "2013",
    range: "2013 — 2019",
    tone: "gaz",
    kicker: "Возрождение",
    name: "«Полоцкгаз» — на областной вершине",
    lead: "Любительский клуб, который вернул городу большие победы.",
    body: "Эстафету подхватил «Полоцкгаз», основанный в 2013 году и выступавший в чемпионате Витебской области. Команда быстро стала одной из сильнейших в регионе: серебро области в 2017-м, золото в 2018-м и два областных Кубка. Именно этот коллектив стал прямым предшественником нынешнего клуба.",
    facts: [
      {
        _key: k(0),
        icon: "Trophy",
        t: "2018",
        d: "Чемпион Витебской области",
      },
      {
        _key: k(1),
        icon: "Award",
        t: "2017 · 2019",
        d: "Обладатель Кубка Витебской области",
      },
      {
        _key: k(2),
        icon: "Medal",
        t: "2017 · 2019",
        d: "Серебро чемпионата области",
      },
    ],
  },
  {
    _id: "history-p2019",
    order: 6,
    eraId: "p2019",
    year: "2019",
    range: "2019 — 2025",
    tone: "modern",
    kicker: "Новое имя",
    name: "«Полоцк-2019» выходит во Вторую лигу",
    lead: "Клуб берёт имя города и поднимается на профессиональный уровень.",
    body: "В 2019 году «Полоцкгаз» сменил название на «Полоцк-2019», а уже в 2020-м заявился во Вторую лигу чемпионата Беларуси — возвращение города в вертикаль футбольных лиг АБФФ после паузы. Под этим именем команда провела несколько сезонов, формируя костяк и болельщицкое ядро нынешнего клуба.",
    facts: [
      {
        _key: k(0),
        icon: "ArrowUpCircle",
        t: "2020",
        d: "Дебют во Второй лиге Беларуси",
      },
      {
        _key: k(1),
        icon: "Flag",
        t: "2019",
        d: "Новое имя — «Полоцк-2019»",
      },
      {
        _key: k(2),
        icon: "Users",
        t: "Костяк",
        d: "Фундамент сегодняшней команды",
      },
    ],
  },
  {
    _id: "history-now",
    order: 7,
    eraId: "now",
    year: "2025",
    range: "2025/26 — наши дни",
    tone: "current",
    kicker: "Наши дни",
    name: "ФК «Полоцк» — новая эра",
    lead: "Возвращение к историческому имени города.",
    body: "С нового сезона команда мягко вернулась к исконному названию — ФК «Полоцк», замкнув круг длиной более чем в столетие. Обновлённый состав, профессиональный медиапродакшн и понятная цель — выход в Первую лигу. Клуб тесно сотрудничает с городской детской спортивной школой, которая принадлежит городу и государству: ряд её воспитанников уже выходят на поле за первую команду.",
    facts: [
      {
        _key: k(0),
        icon: "Sparkles",
        t: "2025/26",
        d: "Возвращение имени ФК «Полоцк»",
      },
      {
        _key: k(1),
        icon: "GraduationCap",
        t: "Воспитанники",
        d: "Игроки городской школы — в первой команде",
      },
      {
        _key: k(2),
        icon: "Target",
        t: "Цель",
        d: "Выход в Первую лигу",
      },
    ],
  },
];

async function run() {
  console.log(`Загружаю ${ERAS.length} эпох в dataset "${dataset}"…`);
  const tx = client.transaction();
  for (const era of ERAS) {
    tx.createOrReplace({
      _id: era._id,
      _type: "historyEra",
      order: era.order,
      eraId: era.eraId,
      year: era.year,
      range: era.range,
      tone: era.tone,
      kicker: era.kicker,
      name: era.name,
      lead: era.lead,
      body: era.body,
      facts: era.facts,
    });
  }
  const result = await tx.commit();
  console.log(`✓ Транзакция: ${result.transactionId}`);
  console.log(`  Создано/обновлено эпох: ${ERAS.length}`);
  console.log("");
  console.log("Дальше: открой Sanity Studio → раздел «Эпоха истории клуба»,");
  console.log("выбери каждую эпоху и загрузи фото в поле «Историческое фото».");
  console.log("Источник фото — assets/history/ в дизайн-хэндоффе.");
}

run().catch((err) => {
  console.error("✗ seed-history упал:", err);
  process.exit(1);
});
