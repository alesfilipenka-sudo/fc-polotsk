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
              title: "Игрок",
              type: "reference",
              to: [{ type: "player" }],
              validation: (r) => r.required(),
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
          preview: {
            select: {
              minute: "minute",
              playerName: "player.name",
              own: "ownGoal",
              forTeam: "forTeam",
            },
            prepare({ minute, playerName, own, forTeam }) {
              const og = own ? " (автогол)" : "";
              const side = forTeam === "home" ? "🏠" : "✈️";
              return {
                title: `${minute}' — ${playerName ?? "?"}${og}`,
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
