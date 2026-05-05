import { defineType, defineField } from "sanity";

export const team = defineType({
  name: "team",
  title: "Team",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: "short",
      title: "Short label",
      description: "3-letter fallback shown when there's no logo (e.g. БРЕ, МИН).",
      type: "string",
      validation: (r) => r.required().max(4),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "isOwn",
      title: "Это ФК Полоцк",
      description: "Отметь true только у ФК Полоцк. Используется для определения home/away.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "short", media: "logo" },
  },
  orderings: [
    { title: "Name", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
  ],
});
