import { defineType, defineField } from "sanity";
import { CalendarIcon } from "@sanity/icons";

export const match = defineType({
  name: "match",
  title: "Match",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "date",
      title: "Дата и время",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "competition",
      title: "Турнир",
      type: "string",
      initialValue: "Высшая лига",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tour",
      title: "Тур",
      type: "number",
      validation: (r) => r.integer().min(1).max(50),
    }),
    defineField({
      name: "home",
      title: "Хозяева",
      type: "reference",
      to: [{ type: "team" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "away",
      title: "Гости",
      type: "reference",
      to: [{ type: "team" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "venue",
      title: "Стадион",
      type: "string",
    }),
    defineField({
      name: "status",
      title: "Статус",
      type: "string",
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
      validation: (r) => r.integer().min(0),
      hidden: ({ document }) => document?.status === "scheduled",
    }),
    defineField({
      name: "as",
      title: "Голы гостей",
      type: "number",
      validation: (r) => r.integer().min(0),
      hidden: ({ document }) => document?.status === "scheduled",
    }),
    defineField({
      name: "finishedAt",
      title: "Финальный свисток",
      description:
        "Заполняется при переводе матча в статус «Завершён». Используется для расчёта 48-часового окна показа результата на главной.",
      type: "datetime",
      hidden: ({ document }) => document?.status !== "finished",
    }),
    defineField({
      name: "scorers",
      title: "Авторы голов",
      description:
        "Хронологический список голов. Минута + автор. Отметь «автогол» если мяч забит в свои ворота.",
      type: "array",
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
          // Валидация уровня объекта: должен быть указан хотя бы один из
          // player / playerName. Иначе непонятно кто забил.
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
    },
    prepare({ date, home, away, hs, as, status, tour }) {
      const score =
        status === "finished" && hs != null && as != null
          ? `${hs}:${as}`
          : "—:—";
      const tourLabel = tour ? `Тур ${tour} · ` : "";
      const dateLabel = date
        ? new Date(date).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "short",
          })
        : "?";
      return {
        title: `${home || "?"} ${score} ${away || "?"}`,
        subtitle: `${tourLabel}${dateLabel}`,
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
