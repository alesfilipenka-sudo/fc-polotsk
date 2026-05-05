import { defineType, defineField, defineArrayMember } from "sanity";
import { ChartUpwardIcon } from "@sanity/icons";

/**
 * Singleton: одна турнирная таблица за сезон. Редактор обновляет
 * один документ раз в неделю, а не 16 отдельных Standing-документов.
 */
export const standingsTable = defineType({
  name: "standingsTable",
  title: "Standings Table",
  type: "document",
  icon: ChartUpwardIcon,
  fields: [
    defineField({
      name: "season",
      title: "Сезон",
      type: "string",
      initialValue: "2025/26",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "updatedAt",
      title: "Обновлено",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "rows",
      title: "Строки",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "row",
          fields: [
            defineField({
              name: "pos",
              title: "Позиция",
              type: "number",
              validation: (r) => r.required().integer().min(1).max(20),
            }),
            defineField({
              name: "team",
              title: "Команда",
              type: "reference",
              to: [{ type: "team" }],
              validation: (r) => r.required(),
            }),
            defineField({
              name: "mp",
              title: "Игр",
              type: "number",
              validation: (r) => r.required().integer().min(0),
            }),
            defineField({
              name: "pts",
              title: "Очки",
              type: "number",
              validation: (r) => r.required().integer().min(0),
            }),
          ],
          preview: {
            select: { pos: "pos", team: "team.name", mp: "mp", pts: "pts" },
            prepare({ pos, team, mp, pts }) {
              return {
                title: `${pos}. ${team || "?"}`,
                subtitle: `И: ${mp} · О: ${pts}`,
              };
            },
          },
        }),
      ],
      validation: (r) => r.max(20),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Турнирная таблица" }),
  },
});
