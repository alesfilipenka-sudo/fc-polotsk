import { defineType, defineField, defineArrayMember } from "sanity";
import { ChartUpwardIcon } from "@sanity/icons";

/**
 * Singleton: одна турнирная таблица за сезон. Редактор обновляет
 * один документ раз в неделю, а не 16 отдельных Standing-документов.
 *
 * Строка таблицы — источник истины для блока статистики на главной.
 * Считать очки суммированием матчей нельзя: в базе лежат ещё и кубковые
 * игры, а лиговые могут быть заведены не полностью.
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
      initialValue: "2026",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "stage",
      title: "Стадия",
      description:
        "Подпись под местом в блоке статистики: «Витебский дивизион», «Группа B» и т.п.",
      type: "string",
      initialValue: "Витебский дивизион",
    }),
    defineField({
      name: "isFinal",
      title: "Таблица итоговая",
      description:
        "Включи, когда этап сыгран до конца — на сайте подпись сменится на «итоговая таблица».",
      type: "boolean",
      initialValue: false,
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
              name: "w",
              title: "Победы",
              type: "number",
              validation: (r) => r.integer().min(0),
            }),
            defineField({
              name: "d",
              title: "Ничьи",
              type: "number",
              validation: (r) => r.integer().min(0),
            }),
            defineField({
              name: "l",
              title: "Поражения",
              type: "number",
              validation: (r) => r.integer().min(0),
            }),
            defineField({
              name: "gf",
              title: "Забито",
              type: "number",
              validation: (r) => r.integer().min(0),
            }),
            defineField({
              name: "ga",
              title: "Пропущено",
              type: "number",
              validation: (r) => r.integer().min(0),
            }),
            defineField({
              name: "pts",
              title: "Очки",
              type: "number",
              validation: (r) => r.required().integer().min(0),
            }),
          ],
          preview: {
            select: {
              pos: "pos",
              team: "team.name",
              mp: "mp",
              pts: "pts",
              gf: "gf",
              ga: "ga",
            },
            prepare({ pos, team, mp, pts, gf, ga }) {
              const goals = gf != null && ga != null ? ` · ${gf}:${ga}` : "";
              return {
                title: `${pos}. ${team || "?"}`,
                subtitle: `И: ${mp}${goals} · О: ${pts}`,
              };
            },
          },
        }),
      ],
      validation: (r) => r.max(20),
    }),
  ],
  preview: {
    select: { season: "season", stage: "stage" },
    prepare: ({ season, stage }) => ({
      title: "Турнирная таблица",
      subtitle: [stage, season].filter(Boolean).join(" · "),
    }),
  },
});
