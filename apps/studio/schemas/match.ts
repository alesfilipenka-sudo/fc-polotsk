import { defineType, defineField } from "sanity";
import { CalendarIcon } from "@sanity/icons";

/**
 * Конвенция полей live-матча:
 *   currentMinute, events[], lineupHome/Away[], formation, tokenColorHome/Away, stats
 * — все опциональные, скрыты при status="scheduled" и не имеют required-валидаций.
 *
 * Если оператор не зайдёт в админку, эти поля останутся пустыми и сайт
 * деградирует мягко (показывает только то, что есть; LiveBlock не сломается).
 */

const FORMATIONS = [
  { title: "4-3-3", value: "4-3-3" },
  { title: "4-4-2", value: "4-4-2" },
  { title: "4-2-3-1", value: "4-2-3-1" },
  { title: "3-5-2", value: "3-5-2" },
  { title: "3-4-3", value: "3-4-3" },
  { title: "5-3-2", value: "5-3-2" },
];

const HOME_TOKEN_COLORS = ["#234794", "#7e96d8", "#ffffff"];
const AWAY_TOKEN_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#000000",
  "#ffffff",
];

const POSITION_OPTIONS = [
  { title: "Вратарь", value: "GK" },
  { title: "Защитник", value: "DF" },
  { title: "Полузащитник", value: "MF" },
  { title: "Нападающий", value: "FW" },
];

export const match = defineType({
  name: "match",
  title: "Match",
  type: "document",
  icon: CalendarIcon,
  groups: [
    { name: "general", title: "Основное", default: true },
    { name: "result", title: "Результат" },
    { name: "live", title: "Live матч-центр" },
  ],
  fields: [
    defineField({
      name: "date",
      title: "Дата и время",
      type: "datetime",
      group: "general",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "competition",
      title: "Турнир",
      type: "string",
      group: "general",
      initialValue: "Высшая лига",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tour",
      title: "Тур",
      type: "number",
      group: "general",
      validation: (r) => r.integer().min(1).max(50),
    }),
    defineField({
      name: "home",
      title: "Хозяева",
      type: "reference",
      to: [{ type: "team" }],
      group: "general",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "away",
      title: "Гости",
      type: "reference",
      to: [{ type: "team" }],
      group: "general",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "venue",
      title: "Стадион",
      type: "string",
      group: "general",
    }),
    defineField({
      name: "status",
      title: "Статус",
      type: "string",
      group: "general",
      options: {
        list: [
          { title: "Запланирован", value: "scheduled" },
          { title: "Идёт", value: "live" },
          { title: "Завершён", value: "finished" },
        ],
        layout: "radio",
      },
      initialValue: "scheduled",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "hs",
      title: "Голы хозяев",
      type: "number",
      group: "result",
      validation: (r) => r.integer().min(0),
      hidden: ({ document }) => document?.status === "scheduled",
    }),
    defineField({
      name: "as",
      title: "Голы гостей",
      type: "number",
      group: "result",
      validation: (r) => r.integer().min(0),
      hidden: ({ document }) => document?.status === "scheduled",
    }),
    defineField({
      name: "finishedAt",
      title: "Финальный свисток",
      description:
        "Заполняется при переводе матча в статус «Завершён». Используется для расчёта 48-часового окна показа результата на главной.",
      type: "datetime",
      group: "result",
      hidden: ({ document }) => document?.status !== "finished",
    }),
    defineField({
      name: "scorers",
      title: "Авторы голов",
      description:
        "Хронологический список голов. Минута + автор. Отметь «автогол» если мяч забит в свои ворота. Если матч идёт live — синхронизируется автоматически из events[] при завершении.",
      type: "array",
      group: "result",
      hidden: ({ document }) => document?.status === "scheduled",
      of: [
        {
          type: "object",
          name: "goal",
          title: "Гол",
          fields: [
            defineField({
              name: "minute",
              title: "Минута",
              type: "number",
              validation: (r) => r.required().integer().min(1).max(130),
            }),
            defineField({
              name: "player",
              title: "Игрок (из состава ФК Полоцк)",
              type: "reference",
              to: [{ type: "player" }],
              description:
                "Заполняй для голов ФК Полоцк. Для голов соперника оставь пустым и используй поле «Имя автора (соперник)» ниже.",
            }),
            defineField({
              name: "playerName",
              title: "Имя автора (соперник)",
              type: "string",
              description:
                "Заполняй когда забил игрок соперника, которого нет в базе. Если выбран игрок выше — это поле игнорируется.",
            }),
            defineField({
              name: "forTeam",
              title: "За команду",
              type: "string",
              options: {
                list: [
                  { title: "Хозяева", value: "home" },
                  { title: "Гости", value: "away" },
                ],
                layout: "radio",
              },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "ownGoal",
              title: "Автогол",
              type: "boolean",
              initialValue: false,
            }),
          ],
          validation: (r) =>
            r.custom((g: Record<string, unknown> | undefined) => {
              if (!g) return true;
              const hasRef = !!g.player;
              const hasName =
                typeof g.playerName === "string" && g.playerName.trim() !== "";
              if (hasRef || hasName) return true;
              return "Укажи либо игрока из состава, либо имя автора (соперник)";
            }),
          preview: {
            select: {
              minute: "minute",
              playerName: "player.name",
              playerNameRaw: "playerName",
              own: "ownGoal",
              forTeam: "forTeam",
            },
            prepare({ minute, playerName, playerNameRaw, own, forTeam }) {
              const name = playerName ?? playerNameRaw ?? "?";
              const og = own ? " (автогол)" : "";
              const side = forTeam === "home" ? "🏠" : "✈️";
              return {
                title: `${minute}' — ${name}${og}`,
                subtitle: side,
              };
            },
          },
        },
      ],
    }),

    /* ============================================================
       LIVE-FIELDS — заполняются админкой во время матча.
       Все опциональны: если оператор не зайдёт, поля останутся пустыми
       и публичный сайт не сломается (LiveBlock проверит наличие).
       ============================================================ */
    defineField({
      name: "currentMinute",
      title: "Текущая минута",
      description: "Только во время live. Используется в индикаторе LIVE · N′.",
      type: "number",
      group: "live",
      validation: (r) => r.integer().min(0).max(130),
      hidden: ({ document }) => document?.status !== "live",
    }),
    defineField({
      name: "formation",
      title: "Формация ФК Полоцк",
      type: "string",
      group: "live",
      options: { list: FORMATIONS, layout: "radio" },
      initialValue: "4-3-3",
      hidden: ({ document }) => document?.status === "scheduled",
    }),
    defineField({
      name: "tokenColorHome",
      title: "Цвет фишек хозяев",
      description: "Используется в SVG-поле составов.",
      type: "string",
      group: "live",
      options: { list: HOME_TOKEN_COLORS.map((v) => ({ title: v, value: v })) },
      initialValue: "#234794",
      hidden: ({ document }) => document?.status === "scheduled",
    }),
    defineField({
      name: "tokenColorAway",
      title: "Цвет фишек гостей",
      type: "string",
      group: "live",
      options: { list: AWAY_TOKEN_COLORS.map((v) => ({ title: v, value: v })) },
      initialValue: "#eab308",
      hidden: ({ document }) => document?.status === "scheduled",
    }),
    defineField({
      name: "events",
      title: "Live-события",
      description:
        "Хронологический лог матча: голы, карточки, замены. Заполняется админкой. При finalize синхронизируется в scorers[].",
      type: "array",
      group: "live",
      hidden: ({ document }) => document?.status === "scheduled",
      of: [
        {
          type: "object",
          name: "event",
          title: "Событие",
          fields: [
            defineField({
              name: "type",
              title: "Тип",
              type: "string",
              options: {
                list: [
                  { title: "⚽ Гол", value: "goal" },
                  { title: "🟨 Жёлтая карточка", value: "yellow" },
                  { title: "🟥 Красная карточка", value: "red" },
                  { title: "↕ Замена", value: "sub" },
                ],
                layout: "radio",
              },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "minute",
              title: "Минута",
              type: "number",
              validation: (r) => r.required().integer().min(1).max(130),
            }),
            defineField({
              name: "forTeam",
              title: "За команду",
              type: "string",
              options: {
                list: [
                  { title: "Хозяева", value: "home" },
                  { title: "Гости", value: "away" },
                ],
                layout: "radio",
              },
              validation: (r) => r.required(),
            }),
            // Основной игрок (gol/yellow/red — кто забил/получил;
            // sub — выходящий на поле)
            defineField({
              name: "player",
              title: "Игрок (из состава Полоцка)",
              type: "reference",
              to: [{ type: "player" }],
            }),
            defineField({
              name: "playerName",
              title: "Имя (если соперник)",
              type: "string",
            }),
            // Ассистент / выходящий
            defineField({
              name: "assist",
              title: "Ассистент (только для гола)",
              type: "reference",
              to: [{ type: "player" }],
              hidden: ({ parent }) => parent?.type !== "goal",
            }),
            defineField({
              name: "assistName",
              title: "Имя ассистента (соперник)",
              type: "string",
              hidden: ({ parent }) => parent?.type !== "goal",
            }),
            // Замена: playerOn (выходит на поле), playerOff (уходит).
            // Поле `player` для type='sub' = playerOn (для совместимости с другими типами).
            defineField({
              name: "playerOff",
              title: "Уходит с поля (только для замены)",
              type: "reference",
              to: [{ type: "player" }],
              hidden: ({ parent }) => parent?.type !== "sub",
            }),
            defineField({
              name: "playerOffName",
              title: "Имя уходящего (соперник)",
              type: "string",
              hidden: ({ parent }) => parent?.type !== "sub",
            }),
            defineField({
              name: "ownGoal",
              title: "Автогол",
              type: "boolean",
              initialValue: false,
              hidden: ({ parent }) => parent?.type !== "goal",
            }),
          ],
          preview: {
            select: {
              type: "type",
              minute: "minute",
              playerName: "player.name",
              playerNameRaw: "playerName",
              forTeam: "forTeam",
            },
            prepare({ type, minute, playerName, playerNameRaw, forTeam }) {
              const icon =
                type === "goal" ? "⚽" :
                type === "yellow" ? "🟨" :
                type === "red" ? "🟥" :
                type === "sub" ? "↕" : "·";
              const side = forTeam === "home" ? "🏠" : "✈️";
              const name = playerName ?? playerNameRaw ?? "?";
              return {
                title: `${minute}' ${icon} ${name}`,
                subtitle: side,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "lineupHome",
      title: "Состав хозяев",
      description:
        "11 стартовых + запас. Можно оставить пустым — таба «Составы» в LiveBlock тогда не показывается.",
      type: "array",
      group: "live",
      hidden: ({ document }) => document?.status === "scheduled",
      of: [{ type: "lineupEntry" }],
    }),
    defineField({
      name: "lineupAway",
      title: "Состав гостей",
      description: "Здесь чаще всего ссылок на players нет — заполняй именами через free-text поля.",
      type: "array",
      group: "live",
      hidden: ({ document }) => document?.status === "scheduled",
      of: [{ type: "lineupEntry" }],
    }),
    defineField({
      name: "stats",
      title: "Статистика матча",
      description: "Опционально. Если не задана — таба «Статистика» в LiveBlock не показывается.",
      type: "object",
      group: "live",
      hidden: ({ document }) => document?.status === "scheduled",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "shotsHome", title: "Удары хозяев", type: "number" }),
        defineField({ name: "shotsAway", title: "Удары гостей", type: "number" }),
        defineField({ name: "shotsOnGoalHome", title: "В створ хозяев", type: "number" }),
        defineField({ name: "shotsOnGoalAway", title: "В створ гостей", type: "number" }),
        defineField({
          name: "possessionHome",
          title: "Владение хозяев (%)",
          type: "number",
          validation: (r) => r.integer().min(0).max(100),
        }),
        defineField({
          name: "possessionAway",
          title: "Владение гостей (%)",
          type: "number",
          validation: (r) => r.integer().min(0).max(100),
        }),
        defineField({ name: "cornersHome", title: "Угловые хозяев", type: "number" }),
        defineField({ name: "cornersAway", title: "Угловые гостей", type: "number" }),
        defineField({ name: "offsidesHome", title: "Офсайды хозяев", type: "number" }),
        defineField({ name: "offsidesAway", title: "Офсайды гостей", type: "number" }),
      ],
    }),
  ],
  preview: {
    select: {
      date: "date",
      home: "home.name",
      away: "away.name",
      hs: "hs",
      as: "as",
      status: "status",
      tour: "tour",
      currentMinute: "currentMinute",
    },
    prepare({ date, home, away, hs, as, status, tour, currentMinute }) {
      let score = "—:—";
      if (status === "finished" && hs != null && as != null) score = `${hs}:${as}`;
      if (status === "live") {
        score = `${hs ?? 0}:${as ?? 0}`;
      }
      const liveTag = status === "live"
        ? ` · 🔴 LIVE${currentMinute != null ? ` ${currentMinute}'` : ""}`
        : "";
      const tourLabel = tour ? `Тур ${tour} · ` : "";
      const dateLabel = date
        ? new Date(date).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "short",
          })
        : "?";
      return {
        title: `${home || "?"} ${score} ${away || "?"}`,
        subtitle: `${tourLabel}${dateLabel}${liveTag}`,
      };
    },
  },
  orderings: [
    {
      title: "Дата (новые сверху)",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
    {
      title: "Дата (старые сверху)",
      name: "dateAsc",
      by: [{ field: "date", direction: "asc" }],
    },
  ],
});

/**
 * Запись состава: либо ссылка на игрока Полоцка, либо free-text для соперника.
 * Используется в обоих lineupHome / lineupAway.
 */
export const lineupEntry = defineType({
  name: "lineupEntry",
  title: "Игрок в составе",
  type: "object",
  fields: [
    defineField({
      name: "player",
      title: "Игрок (из базы Полоцка)",
      description: "Заполняй только для своих игроков. Для соперников используй поля ниже.",
      type: "reference",
      to: [{ type: "player" }],
    }),
    defineField({
      name: "playerName",
      title: "Имя (соперник)",
      type: "string",
    }),
    defineField({
      name: "playerNumber",
      title: "Номер (соперник)",
      description: "Для своих игроков номер берётся из карточки игрока.",
      type: "number",
      validation: (r) => r.integer().min(1).max(99),
    }),
    defineField({
      name: "position",
      title: "Позиция (соперник)",
      description: "Для своих игроков подтягивается автоматом.",
      type: "string",
      options: { list: POSITION_OPTIONS },
    }),
    defineField({
      name: "isStarter",
      title: "В стартовом составе",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "isCaptain",
      title: "Капитан",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "positionSlot",
      title: "Позиция на поле (0–10)",
      description:
        "Индекс координат в выбранной формации. 0 — вратарь, 1-4 — защита, 5-7 — полузащита, 8-10 — нападение (для 4-3-3).",
      type: "number",
      validation: (r) => r.integer().min(0).max(10),
    }),
  ],
  validation: (r) =>
    r.custom((entry: Record<string, unknown> | undefined) => {
      if (!entry) return true;
      const hasRef = !!entry.player;
      const hasName =
        typeof entry.playerName === "string" &&
        entry.playerName.trim() !== "";
      if (hasRef || hasName) return true;
      return "Укажи либо игрока из состава, либо имя (соперник)";
    }),
  preview: {
    select: {
      playerName: "player.name",
      playerNumberRef: "player.num",
      playerNameRaw: "playerName",
      playerNumberRaw: "playerNumber",
      starter: "isStarter",
      captain: "isCaptain",
    },
    prepare({
      playerName,
      playerNumberRef,
      playerNameRaw,
      playerNumberRaw,
      starter,
      captain,
    }) {
      const name = playerName ?? playerNameRaw ?? "?";
      const num = playerNumberRef ?? playerNumberRaw;
      const prefix = num != null ? `#${num} ` : "";
      const cap = captain ? " ©" : "";
      const bench = starter ? "" : " · запас";
      return { title: `${prefix}${name}${cap}`, subtitle: bench };
    },
  },
});
