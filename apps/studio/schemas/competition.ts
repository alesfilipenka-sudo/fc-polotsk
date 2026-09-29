import { defineType, defineField } from "sanity";
import { StarIcon } from "@sanity/icons";

/**
 * Турнир — постоянная сущность: «Вторая лига», «Кубок Беларуси»,
 * «Кубок Витебской области». Розыгрыш конкретного года задаётся сезоном
 * у матча, а не отдельным документом турнира.
 *
 * Тип турнира (лига или кубок) раньше определялся по строковому префиксу
 * в коде сайта — из-за этого новый турнир нельзя было завести без деплоя.
 * Теперь это поле `kind`, и сайт узнаёт всё из данных.
 */
export const competition = defineType({
  name: "competition",
  title: "Турнир",
  type: "document",
  icon: StarIcon,
  fields: [
    defineField({
      name: "name",
      title: "Название",
      description: "Без года: «Вторая лига», «Кубок Беларуси».",
      type: "string",
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 60 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "kind",
      title: "Тип",
      description:
        "Лига идёт в зачёт сезона и в блок статистики. Кубок показывается отдельно.",
      type: "string",
      options: {
        list: [
          { title: "Лига", value: "league" },
          { title: "Кубок", value: "cup" },
        ],
        layout: "radio",
      },
      initialValue: "league",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "crossYearSeason",
      title: "Розыгрыш через зиму",
      description:
        "Для турниров вида 2026/27. Влияет только на подпись сезона — матч всё равно относится к году, в котором сыгран.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Порядок",
      description: "Чем меньше, тем выше в фильтрах. Лига обычно 0.",
      type: "number",
      initialValue: 0,
      validation: (r) => r.integer(),
    }),
    defineField({
      name: "logo",
      title: "Логотип",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  orderings: [
    { title: "Порядок", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", kind: "kind", media: "logo" },
    prepare: ({ title, kind, media }) => ({
      title,
      subtitle: kind === "cup" ? "кубок" : "лига",
      media,
    }),
  },
});
