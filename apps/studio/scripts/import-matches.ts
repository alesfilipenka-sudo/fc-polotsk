/**
 * FC Polotsk — импорт матчей и голов из CSV в Sanity.
 *
 * Зачем: bel.football не хранит результаты регионального этапа Второй лиги.
 * Эти матчи собираются вручную, но вбивать их в Studio по одному дорого.
 * Скрипт читает два CSV и заливает всё разом.
 *
 * Запуск:
 *   pnpm --filter @fc-polotsk/studio import:matches            # сухой прогон, ничего не пишет
 *   pnpm --filter @fc-polotsk/studio import:matches -- --apply # запись в Sanity
 *
 * Флаги:
 *   --apply              выполнить запись (без него — только отчёт)
 *   --matches=<path>     путь к matches.csv (по умолчанию data/matches.csv)
 *   --events=<path>      путь к events.csv  (по умолчанию data/events.csv)
 *   --only=<key>         импортировать только один матч по его key
 *   --create-teams       создавать отсутствующие команды (иначе такие матчи пропускаются)
 *
 * Идемпотентность: _id матча детерминирован — `match-import-<key>`.
 * Точки в _id использовать нельзя: Sanity резервирует их под системные
 * пространства (drafts., versions.) — документ с точечным префиксом
 * создаётся без ошибки, но в обычные выборки не попадает.
 * Повторный прогон обновляет тот же документ, дубли невозможны.
 * Дозаполнил строку в CSV → перезапустил → обновилось только изменённое.
 *
 * Требует apps/studio/.env.local:
 *   SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET, SANITY_STUDIO_WRITE_TOKEN
 *
 * Схему менять не нужно: пишем в существующие поля match
 * (date, competition, tour, home, away, venue, status, hs, as, finishedAt,
 *  events[], scorers[]). scorers[] выводится из events[] по той же логике,
 * что и finalizeMatchAction в админке — чтобы блок результатов на главной
 * и страница матча видели одно и то же.
 */

import { config as loadEnv } from "dotenv";
import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";
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

/* ------------------------------------------------------------------ */
/* CLI                                                                 */
/* ------------------------------------------------------------------ */

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
};
const has = (name: string) => args.includes(`--${name}`);

const APPLY = has("apply");
const CREATE_TEAMS = has("create-teams");
const ONLY = flag("only");
const MATCHES_CSV = resolve(
  __dirname,
  "..",
  flag("matches") ?? "data/matches.csv",
);
const EVENTS_CSV = resolve(__dirname, "..", flag("events") ?? "data/events.csv");

/** Беларусь — UTC+3 круглый год, перехода на летнее время нет. */
const TZ_OFFSET = "+03:00";

/* ------------------------------------------------------------------ */
/* CSV parser (без зависимостей, с поддержкой кавычек и переносов)      */
/* ------------------------------------------------------------------ */

function parseCsv(text: string): Record<string, string>[] {
  const stripped = text.replace(/^﻿/, ""); // BOM из Excel
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < stripped.length; i++) {
    const ch = stripped[i];

    if (inQuotes) {
      if (ch === '"') {
        if (stripped[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === "," || ch === ";") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  // Убираем пустые строки и строки-комментарии (#)
  const clean = rows.filter(
    (r) => r.some((c) => c.trim() !== "") && !r[0].trim().startsWith("#"),
  );
  if (clean.length === 0) return [];

  const header = clean[0].map((h) => h.trim());
  return clean.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => {
      obj[h] = (r[idx] ?? "").trim();
    });
    return obj;
  });
}

/* ------------------------------------------------------------------ */
/* Хелперы                                                             */
/* ------------------------------------------------------------------ */

const RU_LATIN_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
  я: "ya",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((c) => RU_LATIN_MAP[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Нормализация имени для сопоставления: регистр, ё/е, лишние пробелы, дефисы. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[«»"'`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Короткий бейдж для новой команды: до 4 символов. */
function makeShort(name: string): string {
  const words = name.replace(/[^А-Яа-яЁёA-Za-z0-9\s-]/g, " ").split(/[\s-]+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase().slice(0, 4);
  }
  return (words[0] ?? name).slice(0, 3).toUpperCase();
}

const TRUE_VALUES = new Set(["1", "true", "да", "yes", "y", "x", "+", "истина"]);
const isTrue = (v: string | undefined) => !!v && TRUE_VALUES.has(norm(v));

function parseIntOrUndefined(v: string | undefined): number | undefined {
  if (v === undefined || v.trim() === "") return undefined;
  const n = Number.parseInt(v.replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : undefined;
}

/* ------------------------------------------------------------------ */
/* Типы строк CSV                                                      */
/* ------------------------------------------------------------------ */

interface MatchRow {
  key: string;
  date: string;
  time: string;
  competition: string;
  tour: string;
  home: string;
  away: string;
  venue: string;
  status: string;
  hs: string;
  as: string;
}

interface EventRow {
  matchKey: string;
  type: string;
  minute: string;
  team: string;
  player: string;
  assist: string;
  ownGoal: string;
}

interface TeamDoc {
  _id: string;
  name: string;
  short?: string;
  isOwn?: boolean;
}

interface PlayerDoc {
  _id: string;
  name: string;
  isArchived?: boolean;
}

interface ExistingMatch {
  _id: string;
  date: string;
  h?: string;
  a?: string;
}

/**
 * Календарный день матча по минскому времени.
 * В Sanity дата лежит в UTC: 2026-08-01T10:00:00Z — это 13:00 1 августа
 * в Минске. Сравнивать нужно именно локальный день, иначе вечерние матчи
 * уезжают на сутки назад.
 */
function minskDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Date(d.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/* Основной прогон                                                      */
/* ------------------------------------------------------------------ */

async function run() {
  console.log(`[import-matches] dataset="${dataset}"  режим=${APPLY ? "ЗАПИСЬ" : "сухой прогон"}`);
  console.log(`  matches: ${MATCHES_CSV}`);
  console.log(`  events:  ${EVENTS_CSV}`);
  console.log("");

  if (!existsSync(MATCHES_CSV)) {
    throw new Error(`Не найден файл матчей: ${MATCHES_CSV}`);
  }

  const matchRows = parseCsv(readFileSync(MATCHES_CSV, "utf8")) as unknown as MatchRow[];
  const eventRows = existsSync(EVENTS_CSV)
    ? (parseCsv(readFileSync(EVENTS_CSV, "utf8")) as unknown as EventRow[])
    : [];

  console.log(`  Строк матчей: ${matchRows.length}, строк событий: ${eventRows.length}`);

  // --- Справочники из Sanity ---------------------------------------

  const teams = await client.fetch<TeamDoc[]>(
    `*[_type == "team"]{ _id, name, short, isOwn }`,
  );
  // Архивных игроков берём тоже: они играли в прошедших матчах, и события
  // исторических туров должны привязываться к их профилям.
  const players = await client.fetch<PlayerDoc[]>(
    `*[_type == "player"]{ _id, name, isArchived }`,
  );
  const existingMatches = await client.fetch<ExistingMatch[]>(
    `*[_type == "match"]{ _id, date, "h": home._ref, "a": away._ref }`,
  );

  const teamByName = new Map<string, TeamDoc>();
  for (const t of teams) {
    teamByName.set(norm(t.name), t);
    if (t.short) teamByName.set(norm(t.short), t);
  }

  const playerByName = new Map<string, PlayerDoc>();
  const ambiguousPlayers = new Set<string>();
  for (const p of players) {
    const k = norm(p.name);
    if (playerByName.has(k)) ambiguousPlayers.add(k);
    playerByName.set(k, p);
  }

  console.log(`  В базе: команд ${teams.length}, игроков ${players.length}`);
  console.log("");

  // --- События по ключу матча --------------------------------------

  const eventsByMatch = new Map<string, EventRow[]>();
  for (const e of eventRows) {
    if (!e.matchKey) continue;
    const list = eventsByMatch.get(e.matchKey) ?? [];
    list.push(e);
    eventsByMatch.set(e.matchKey, list);
  }

  // --- Подготовка транзакции ---------------------------------------

  const tx = client.transaction();
  const warnings: string[] = [];
  const unmatchedPlayers = new Set<string>();
  const archivedPlayers = new Set<string>();
  const newTeams: TeamDoc[] = [];
  let planned = 0;
  let skipped = 0;

  const seenKeys = new Set<string>();

  for (const row of matchRows) {
    const key = row.key?.trim();
    if (!key) {
      warnings.push(`Пропуск строки без key: ${JSON.stringify(row)}`);
      skipped++;
      continue;
    }
    if (ONLY && key !== ONLY) continue;
    if (seenKeys.has(key)) {
      warnings.push(`Дубль key="${key}" в matches.csv — вторая строка пропущена`);
      skipped++;
      continue;
    }
    seenKeys.add(key);

    // Команды
    const resolveTeam = (name: string): TeamDoc | null => {
      const found = teamByName.get(norm(name));
      if (found) return found;
      if (!CREATE_TEAMS) return null;
      const id = `team-${slugify(name)}`;
      const created: TeamDoc = { _id: id, name, short: makeShort(name) };
      teamByName.set(norm(name), created);
      newTeams.push(created);
      tx.createIfNotExists({
        _id: id,
        _type: "team",
        name,
        short: created.short,
        isOwn: false,
      });
      return created;
    };

    const home = resolveTeam(row.home);
    const away = resolveTeam(row.away);

    if (!home || !away) {
      const missing = [!home && row.home, !away && row.away].filter(Boolean).join(", ");
      warnings.push(
        `✗ "${key}": нет команды в базе — ${missing}. Заведи её в Studio или запусти с --create-teams`,
      );
      skipped++;
      continue;
    }

    // Дата: "2026-04-12" + "17:00" → 2026-04-12T17:00:00+03:00
    const rawTime = row.time?.trim() || "00:00";
    const [hh = "00", mm = "00"] = rawTime.split(":");
    const hhmm = `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}`;
    const dateObj = new Date(`${row.date.trim()}T${hhmm}:00${TZ_OFFSET}`);
    if (Number.isNaN(dateObj.getTime())) {
      warnings.push(`✗ "${key}": не разобрал дату "${row.date} ${row.time}"`);
      skipped++;
      continue;
    }

    const status = (row.status?.trim() || "finished") as "scheduled" | "live" | "finished";
    const hs = parseIntOrUndefined(row.hs);
    const as = parseIntOrUndefined(row.as);
    const tour = parseIntOrUndefined(row.tour);

    // События
    const rawEvents = eventsByMatch.get(key) ?? [];
    const events: Record<string, unknown>[] = [];

    rawEvents.forEach((e, idx) => {
      const type = norm(e.type || "goal");
      const mappedType =
        type === "goal" || type === "гол"
          ? "goal"
          : type === "yellow" || type === "жк" || type === "желтая" || type === "жёлтая"
            ? "yellow"
            : type === "red" || type === "кк" || type === "красная"
              ? "red"
              : type === "sub" || type === "замена"
                ? "sub"
                : null;

      if (!mappedType) {
        warnings.push(`  "${key}": неизвестный тип события "${e.type}" — строка пропущена`);
        return;
      }

      const minute = parseIntOrUndefined(e.minute);
      if (minute === undefined) {
        warnings.push(`  "${key}": событие без минуты — строка пропущена`);
        return;
      }

      const side = norm(e.team);
      const forTeam =
        side === "home" || side === "хозяева" || side === "дома"
          ? "home"
          : side === "away" || side === "гости" || side === "выезд"
            ? "away"
            : null;
      if (!forTeam) {
        warnings.push(`  "${key}": непонятная сторона "${e.team}" (ожидается home/away)`);
        return;
      }

      const ev: Record<string, unknown> = {
        _key: `imp-${idx + 1}`,
        _type: "event",
        type: mappedType,
        minute,
        forTeam,
      };

      if (e.player) {
        const p = playerByName.get(norm(e.player));
        if (p && !ambiguousPlayers.has(norm(e.player))) {
          ev.player = { _type: "reference", _ref: p._id };
          if (p.isArchived) archivedPlayers.add(p.name.trim());
        } else {
          ev.playerName = e.player;
          if (!p) unmatchedPlayers.add(e.player);
        }
      }

      if (e.assist) {
        const a = playerByName.get(norm(e.assist));
        if (a && !ambiguousPlayers.has(norm(e.assist))) {
          ev.assist = { _type: "reference", _ref: a._id };
        } else {
          ev.assistName = e.assist;
          if (!a) unmatchedPlayers.add(e.assist);
        }
      }

      if (isTrue(e.ownGoal)) ev.ownGoal = true;

      events.push(ev);
    });

    // scorers[] выводим из голов — та же логика, что в finalizeMatchAction
    const scorers = events
      .filter((e) => e.type === "goal")
      .map((e, idx) => {
        const goal: Record<string, unknown> = {
          _key: `imp-goal-${idx + 1}`,
          _type: "goal",
          minute: e.minute,
          forTeam: e.forTeam,
        };
        if (e.player) goal.player = e.player;
        if (e.playerName) goal.playerName = e.playerName;
        if (e.ownGoal) goal.ownGoal = true;
        return goal;
      });

    // Сверка счёта с числом голов
    if (status === "finished" && hs !== undefined && as !== undefined && scorers.length > 0) {
      const goalsHome = scorers.filter((g) => g.forTeam === "home").length;
      const goalsAway = scorers.filter((g) => g.forTeam === "away").length;
      if (goalsHome !== hs || goalsAway !== as) {
        warnings.push(
          `⚠ "${key}": счёт ${hs}:${as}, а голов в events.csv ${goalsHome}:${goalsAway}. Записываю счёт из matches.csv`,
        );
      }
    }

    // Уже есть такой матч в базе? Ищем по календарному дню и паре команд —
    // так CSV становится ещё и инструментом правки существующих документов
    // (дозаполнить авторов голов, поправить номер тура), а не только импорта.
    const existing = existingMatches.find(
      (m) =>
        m.h === home._id &&
        m.a === away._id &&
        minskDay(m.date) === row.date.trim(),
    );

    const id = existing?._id ?? `match-import-${slugify(key)}`;
    const isUpdate = !!existing;

    const doc: Record<string, unknown> = {
      competition: row.competition?.trim() || "Вторая лига",
      home: { _type: "reference", _ref: home._id },
      away: { _type: "reference", _ref: away._id },
      status,
    };

    // У существующего документа дату не трогаем, если в CSV не указано время:
    // в базе оно точнее, чем подставленная полночь.
    if (!isUpdate || rawTime !== "00:00") {
      doc.date = dateObj.toISOString();
    }

    if (tour !== undefined) doc.tour = tour;
    if (row.venue?.trim()) doc.venue = row.venue.trim();
    if (hs !== undefined) doc.hs = hs;
    if (as !== undefined) doc.as = as;
    if (status === "finished" && !isUpdate) {
      // Финальный свисток ≈ начало + 2 часа. Нужен для 48-часового окна на главной.
      doc.finishedAt = new Date(dateObj.getTime() + 2 * 60 * 60 * 1000).toISOString();
    }

    // events/scorers перезаписываем только если для матча есть строки в
    // events.csv. Иначе правка тура у существующего матча стёрла бы голы.
    if (rawEvents.length > 0) {
      doc.events = events;
      doc.scorers = scorers;
    }

    // Снятие значения: "-" в ячейке → поле удаляется (например лишний tour
    // у кубкового матча).
    const unset: string[] = [];
    if (row.tour?.trim() === "-") unset.push("tour");
    if (row.venue?.trim() === "-") unset.push("venue");

    if (isUpdate) {
      tx.patch(id, (p) => {
        const patched = p.set(doc);
        return unset.length ? patched.unset(unset) : patched;
      });
    } else {
      tx.createIfNotExists({ _id: id, _type: "match", ...doc });
      tx.patch(id, (p) => p.set(doc));
    }

    planned++;
    const score = status === "finished" ? `${hs ?? "?"}:${as ?? "?"}` : "—";
    const mark = isUpdate ? "обновляю" : "создаю  ";
    console.log(
      `  ${String(planned).padStart(3)}. ${mark} ${row.date}  ${home.name} ${score} ${away.name}` +
        `${tour !== undefined ? `  (${tour} тур)` : ""}` +
        `${rawEvents.length ? `  голов: ${scorers.length}` : ""}`,
    );
  }

  // --- Отчёт --------------------------------------------------------

  console.log("");
  if (newTeams.length) {
    console.log(`  Будут созданы команды (${newTeams.length}):`);
    for (const t of newTeams) console.log(`    · ${t.name} [${t.short}] → ${t._id}`);
    console.log("");
  }

  if (unmatchedPlayers.size) {
    console.log(`  ⚠ Игроки не найдены в базе — записаны текстом (${unmatchedPlayers.size}):`);
    for (const n of unmatchedPlayers) console.log(`    · ${n}`);
    console.log("    Статистика на /player/[slug] по ним не соберётся.");
    console.log("    Проверь написание имени или заведи игрока в Studio и перезапусти.");
    console.log("");
  }

  if (archivedPlayers.size) {
    console.log(`  · Привязаны архивные игроки (${archivedPlayers.size}):`);
    for (const n of archivedPlayers) console.log(`      ${n}`);
    console.log("    Гол засчитан профилю, но страницы /player/[slug] у архивных нет.");
    console.log("");
  }

  if (warnings.length) {
    console.log(`  Предупреждения (${warnings.length}):`);
    for (const w of warnings) console.log(`    ${w}`);
    console.log("");
  }

  console.log(`  Готово к записи: ${planned}, пропущено: ${skipped}`);

  if (!APPLY) {
    console.log("");
    console.log("  Сухой прогон — ничего не записано.");
    console.log("  Для записи: pnpm --filter @fc-polotsk/studio import:matches -- --apply");
    return;
  }

  if (planned === 0) {
    console.log("  Нечего записывать.");
    return;
  }

  const result = await tx.commit();
  console.log("");
  console.log(`✓ Транзакция закоммичена: ${result.transactionId}`);
  console.log(`  Матчей записано: ${planned}`);
}

run().catch((err) => {
  console.error("✗ import-matches упал:", err);
  process.exit(1);
});
